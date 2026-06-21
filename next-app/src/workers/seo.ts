import { Worker, Job } from 'bullmq';
import { publishNewsQueue, deadLetterQueue } from '@/queues';
import { generateSeoData } from '@/ai/seo';
import { generateAutoSummaries } from '@/lib/engines/autoSummary';

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

export const seoNewsWorker = new Worker('seo-news', async (job: Job) => {
  console.log(`[SEO Worker] Processing: ${job.data.rewrittenTitle}`);
  try {
    const payload = job.data;
    
    // Gemini SEO & Summaries
    const summaries = await generateAutoSummaries(payload.rewrittenTitle, payload.rewrittenContent);
    const seo = await generateSeoData(payload.rewrittenTitle, payload.rewrittenContent);
    
    // Push to Publish Queue
    await publishNewsQueue.add('publish-job', {
      ...payload,
      summaries,
      seo
    });

  } catch (error: any) {
    throw error;
  }
}, { connection, concurrency: 5, limiter: { max: 50, duration: 60000 } });

seoNewsWorker.on('failed', async (job, err) => {
  console.error(`[SEO Worker] Job ${job?.id} failed: ${err.message}`);
  if (job && job.attemptsMade >= 3) {
    await deadLetterQueue.add('dead-letter-job', { queue: 'seo-news', jobData: job.data, error: err.message });
  }
});
