import { Queue, Worker, Job } from 'bullmq';
import { fetchAllRssSources } from '@/rss/fetcher';

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

export const cronQueue = new Queue('cron-jobs', { connection });

export const cronWorker = new Worker('cron-jobs', async (job: Job) => {
  if (job.name === 'fetch-rss') {
    console.log('[Cron Worker] Triggering automated RSS Fetcher...');
    await fetchAllRssSources();
    console.log('[Cron Worker] RSS Fetcher finished.');
  }
}, { connection });

export async function setupCronJobs() {
  console.log('[Cron] Setting up automated jobs...');
  // Her 5 dakikada bir çalışması için pattern
  await cronQueue.add('fetch-rss', {}, {
    repeat: {
      pattern: '*/5 * * * *',
    }
  });
  console.log('[Cron] RSS Fetcher scheduled (every 5 minutes).');
}
