import { redisClient } from '../config/redis.js';
import { ENV } from '../config/env.js';

export interface RateLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  rescheduleDelayMs: number; // Delay to the start of the next hour window
  isFirstThresholdHit: boolean; // True if this check just triggered the rate limit
}

/**
 * Checks and increments the hourly email rate limit for a specific sender.
 * Keyed by: rl:sender:{senderEmail}:{hourTimestamp}
 */
export async function checkAndIncrementRateLimit(
  senderEmail: string,
  customLimit?: number
): Promise<RateLimitCheckResult> {
  const limit = customLimit || ENV.SCHEDULER.MAX_EMAILS_PER_HOUR;
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;

  // Calculate current 1-hour window bucket
  const currentHourStart = Math.floor(now / ONE_HOUR_MS) * ONE_HOUR_MS;
  const nextHourStart = currentHourStart + ONE_HOUR_MS;
  const rescheduleDelayMs = Math.max(1000, nextHourStart - now + 500); // 500ms buffer into next hour

  const sanitizedSender = senderEmail.toLowerCase().trim();
  const counterKey = `rl:sender:${sanitizedSender}:${currentHourStart}`;
  const notifiedKey = `rl:notified:${sanitizedSender}:${currentHourStart}`;

  // Atomically increment the counter
  const currentCount = await redisClient.incr(counterKey);

  // Set TTL of 2 hours on first increment
  if (currentCount === 1) {
    await redisClient.expire(counterKey, 7200);
  }

  if (currentCount > limit) {
    // Check if Slack has already been alerted for this sender in this hour
    const alreadyNotified = await redisClient.get(notifiedKey);
    let isFirstThresholdHit = false;

    if (!alreadyNotified) {
      await redisClient.set(notifiedKey, 'true', 'EX', 7200);
      isFirstThresholdHit = true;
    }

    return {
      allowed: false,
      currentCount,
      limit,
      rescheduleDelayMs,
      isFirstThresholdHit,
    };
  }

  return {
    allowed: true,
    currentCount,
    limit,
    rescheduleDelayMs: 0,
    isFirstThresholdHit: false,
  };
}

/**
 * Decrement counter in case a job was rejected before sending (rollback)
 */
export async function rollbackRateLimit(senderEmail: string): Promise<void> {
  const now = Date.now();
  const ONE_HOUR_MS = 60 * 60 * 1000;
  const currentHourStart = Math.floor(now / ONE_HOUR_MS) * ONE_HOUR_MS;
  const sanitizedSender = senderEmail.toLowerCase().trim();
  const counterKey = `rl:sender:${sanitizedSender}:${currentHourStart}`;
  
  await redisClient.decr(counterKey);
}
