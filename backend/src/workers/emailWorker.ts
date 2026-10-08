import { Worker, Job } from 'bullmq';
import { redisOptions } from '../config/redis.js';
import { EMAIL_QUEUE_NAME, EmailJobData, scheduleEmailInQueue } from '../queues/emailQueue.js';
import { sendEmail } from '../services/emailService.js';
import { checkAndIncrementRateLimit } from '../services/rateLimiter.js';
import { sendSlackRateLimitAlert } from '../services/slackService.js';
import { indexEmailInElastic } from '../services/elasticService.js';
import { prisma } from '../db/prisma.js';
import { ENV } from '../config/env.js';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function setupEmailWorker() {
  const concurrency = ENV.SCHEDULER.WORKER_CONCURRENCY;

  const worker = new Worker<EmailJobData>(
    EMAIL_QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      const { emailId, userId, senderEmail, recipientEmail, subject, body, hourlyLimit, delayBetweenEmailsMs } = job.data;
      console.log(`[Worker] 🚀 Processing job ${job.id} for email ${emailId} -> ${recipientEmail}`);

      // 1. Idempotency Check in Database
      const existingEmail = await prisma.emailJob.findUnique({
        where: { id: emailId },
      });

      if (!existingEmail) {
        console.warn(`[Worker] ⚠️ Email ${emailId} not found in DB. Skipping.`);
        return;
      }

      if (existingEmail.status === 'SENT') {
        console.log(`[Worker] ⚡ Email ${emailId} was already sent. Skipping duplicate.`);
        return;
      }

      // 2. Hourly Rate Limit Check (per-sender Redis-backed counter)
      const rateLimitResult = await checkAndIncrementRateLimit(senderEmail, hourlyLimit);

      if (!rateLimitResult.allowed) {
        console.warn(
          `[Worker] ⏸️ Hourly limit of ${rateLimitResult.limit} reached for sender ${senderEmail} (count=${rateLimitResult.currentCount}). Rescheduling job!`
        );

        // Update DB status to RESCHEDULED
        const nextRunTime = new Date(Date.now() + rateLimitResult.rescheduleDelayMs);
        await prisma.emailJob.update({
          where: { id: emailId },
          data: {
            status: 'RESCHEDULED',
            scheduledAt: nextRunTime,
            errorMessage: `Hourly rate limit of ${rateLimitResult.limit} reached. Rescheduled to ${nextRunTime.toISOString()}`,
          },
        });

        // Trigger Slack Notification on first hit in this hour window
        if (rateLimitResult.isFirstThresholdHit) {
          await sendSlackRateLimitAlert(userId, senderEmail, rateLimitResult.limit);
        }

        // Re-queue the job with delay into the next hour window (DO NOT FAIL OR DROP)
        // Note: remove current job and add new with fresh schedule or delayed retry
        await scheduleEmailInQueue(
          {
            ...job.data,
            scheduledAt: nextRunTime.toISOString(),
          },
          rateLimitResult.rescheduleDelayMs
        );

        return { status: 'rescheduled', nextRunTime };
      }

      // 3. Mark DB as PROCESSING
      await prisma.emailJob.update({
        where: { id: emailId },
        data: { status: 'PROCESSING' },
      });

      try {
        // 4. Delay between sends to mimic provider throttling / anti-spam delay
        const delayMs = delayBetweenEmailsMs !== undefined ? delayBetweenEmailsMs : ENV.SCHEDULER.DELAY_BETWEEN_EMAILS_MS;
        if (delayMs > 0) {
          await sleep(delayMs);
        }

        // 5. Send Email via Ethereal Fake SMTP
        const sendResult = await sendEmail({
          from: senderEmail,
          to: recipientEmail,
          subject,
          body,
        });

        // 6. Update DB to SENT with Ethereal preview link
        const updated = await prisma.emailJob.update({
          where: { id: emailId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            etherealPreviewUrl: sendResult.previewUrl || null,
            errorMessage: null,
          },
        });

        // 7. Update Elasticsearch document
        await indexEmailInElastic({
          id: updated.id,
          userId: updated.userId,
          senderEmail: updated.senderEmail,
          recipientEmail: updated.recipientEmail,
          subject: updated.subject,
          body: updated.body,
          status: 'SENT',
          scheduledAt: updated.scheduledAt,
          sentAt: updated.sentAt,
          createdAt: updated.createdAt,
        });

        console.log(`[Worker] ✅ Email ${emailId} successfully delivered! Ethereal URL: ${sendResult.previewUrl}`);
        return { status: 'sent', previewUrl: sendResult.previewUrl };
      } catch (sendError: any) {
        console.error(`[Worker] ❌ Failed to send email ${emailId}:`, sendError.message);

        await prisma.emailJob.update({
          where: { id: emailId },
          data: {
            status: 'FAILED',
            errorMessage: sendError.message,
            retryCount: { increment: 1 },
          },
        });

        throw sendError; // Triggers BullMQ retry backoff
      }
    },
    {
      connection: redisOptions,
      concurrency, // Configurable worker concurrency
    }
  );

  worker.on('ready', () => {
    console.log(`👷 BullMQ worker started with concurrency = ${concurrency}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 Job ${job?.id} failed with error:`, err.message);
  });

  return worker;
}
