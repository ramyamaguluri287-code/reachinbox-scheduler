import { Queue } from 'bullmq';
import { redisOptions } from '../config/redis.js';

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
