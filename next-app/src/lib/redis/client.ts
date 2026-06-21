import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Reusable connection for BullMQ
export const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Cache client
export const cacheClient = new Redis(redisUrl);
