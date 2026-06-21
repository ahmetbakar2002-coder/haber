import { Worker, Job } from 'bullmq';
import { seoNewsQueue, deadLetterQueue } from '@/queues';
import { rewriteArticle } from '@/ai/rewrite';

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

export const rewriteNewsWorker = new Worker('rewrite-news', async (job: Job) => {
  console.log(`[Rewrite Worker] Processing: ${job.data.title}`);
  try {
    const rawPayload = job.data;
    
    // Gemini Rewrite
    const rewritten = await rewriteArticle(rawPayload.title, rawPayload.summary);
    
    // Push to SEO Queue
    await seoNewsQueue.add('seo-job', {
      ...rawPayload,
      rewrittenTitle: rewritten.rewrittenTitle,
      rewrittenContent: rewritten.rewrittenContent
    });

  } catch (error: any) {
    throw error;
  }
}, { connection, concurrency: 1, limiter: { max: 1, duration: 15000 } });

rewriteNewsWorker.on('failed', async (job, err) => {
  console.error(`[Rewrite Worker] Job ${job?.id} failed: ${err.message}`);
  if (job && job.attemptsMade >= 3) {
    await deadLetterQueue.add('dead-letter-job', { queue: 'rewrite-news', jobData: job.data, error: err.message });
  }
});
