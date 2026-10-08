import Redis, { RedisOptions } from 'ioredis';
import { ENV } from './env.js';

export const redisOptions: RedisOptions = {
  host: ENV.REDIS.HOST,
  port: ENV.REDIS.PORT,
  password: ENV.REDIS.PASSWORD,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
};

// Standalone redis instance for rate limiting and direct operations
export const redisClient = new Redis(redisOptions);

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});
