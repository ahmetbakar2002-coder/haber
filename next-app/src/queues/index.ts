import { Queue, DefaultJobOptions } from 'bullmq';

const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379'
};

const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  },
  removeOnComplete: true,
  removeOnFail: false
};

export const rawNewsQueue = new Queue('raw-news', { connection, defaultJobOptions });
export const rewriteNewsQueue = new Queue('rewrite-news', { connection, defaultJobOptions });
export const seoNewsQueue = new Queue('seo-news', { connection, defaultJobOptions });
export const publishNewsQueue = new Queue('publish-news', { connection, defaultJobOptions });
export const deadLetterQueue = new Queue('dead-letter', { connection, defaultJobOptions });
