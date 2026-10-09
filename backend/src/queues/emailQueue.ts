import { Queue } from 'bullmq';
import { redisOptions } from '../config/redis.js';
import { prisma } from '../db/prisma.js';

export interface EmailJobData {
  emailId: string;
  userId: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  scheduledAt: string;
  hourlyLimit?: number;
  delayBetweenEmailsMs?: number;
}

export const EMAIL_QUEUE_NAME = 'email-sending-queue';

export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: false, // Keep in queue history for Bull-Board inspection
    removeOnFail: false,
  },
});

/**
 * Schedules an email sending job into BullMQ with a calculated delay.
 * Guaranteed idempotency via custom BullMQ jobId (matching DB emailId).
 */
export async function scheduleEmailInQueue(data: EmailJobData, delayMs: number) {
  const calculatedDelay = Math.max(0, delayMs);

  const job = await emailQueue.add('send-email', data, {
    delay: calculatedDelay,
    jobId: data.emailId, // Idempotency key: prevents duplicate jobs
  });

  return job;
}

/**
 * On server startup, verifies all DB emails marked as SCHEDULED or RESCHEDULED
 * exist in BullMQ. If a job was lost due to Redis restart, it re-enqueues it
 * with the exact remaining delay so future emails are never missed or duplicated.
 */
export async function reconcilePendingJobs() {
  try {
    const pendingEmails = await prisma.emailJob.findMany({
      where: {
        status: { in: ['SCHEDULED', 'RESCHEDULED'] },
      },
    });

    console.log(`[Reconciler] 🔍 Found ${pendingEmails.length} pending email(s) in DB to verify...`);

    let reconciledCount = 0;
    for (const email of pendingEmails) {
      const existingJob = await emailQueue.getJob(email.id);
      if (!existingJob) {
        const delayMs = Math.max(0, email.scheduledAt.getTime() - Date.now());
        await scheduleEmailInQueue(
          {
            emailId: email.id,
            userId: email.userId,
            senderEmail: email.senderEmail,
            recipientEmail: email.recipientEmail,
            subject: email.subject,
            body: email.body,
            scheduledAt: email.scheduledAt.toISOString(),
          },
          delayMs
        );
        reconciledCount++;
      }
    }

    if (reconciledCount > 0) {
      console.log(`[Reconciler] 🔄 Successfully restored ${reconciledCount} missing jobs into BullMQ.`);
    } else {
      console.log(`[Reconciler] ✅ All ${pendingEmails.length} pending jobs are already scheduled in BullMQ.`);
    }
  } catch (error: any) {
    console.warn(`[Reconciler] ⚠️ Error during pending jobs reconciliation:`, error.message);
  }
}
