import { Worker, Job } from 'bullmq';
import { rewriteNewsQueue, deadLetterQueue } from '@/queues';
import { moderateArticle } from '@/lib/engines/moderation';
import { attemptSmartMerge } from '@/lib/engines/smartMerge';
import { enrichImage } from '@/lib/engines/imageEnrichment';

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

export const rawNewsWorker = new Worker('raw-news', async (job: Job) => {
  console.log(`[Raw Worker] Processing: ${job.data.title}`);
  try {
    const rawPayload = job.data;
    
    // 1. Moderation
    const modResult = moderateArticle(rawPayload.title, rawPayload.summary, rawPayload.url);
    if (!modResult.passed) {
      console.warn(`[Raw Worker] Moderation failed: ${modResult.reason}`);
      return;
    }

    // 2. Smart Merge
    const mergeParentId = await attemptSmartMerge(rawPayload.title, rawPayload.summary);
    if (mergeParentId) {
      // Pass merge signal to next queue instead of immediate DB access to keep DB access centralized if possible
      // Actually we just return early after recording source
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.mergedArticleSource.create({
        data: { articleId: mergeParentId, sourceId: rawPayload.sourceId, url: rawPayload.url }
      });
      console.log(`[Raw Worker] Merged ${rawPayload.title} into parent ${mergeParentId}`);
      return;
    }

    // 3. Image Enrichment
    const imageUrl = await enrichImage(rawPayload.sourceName || 'Unknown', rawPayload.title, rawPayload.image);
    rawPayload.imageUrl = imageUrl;

    // Push to Rewrite Queue
    await rewriteNewsQueue.add('rewrite-job', rawPayload);

  } catch (error: any) {
    throw error;
  }
}, { connection, concurrency: 1, limiter: { max: 1, duration: 15000 } });

rawNewsWorker.on('failed', async (job, err) => {
  console.error(`[Raw Worker] Job ${job?.id} failed: ${err.message}`);
  if (job && job.attemptsMade >= 3) {
    await deadLetterQueue.add('dead-letter-job', { queue: 'raw-news', jobData: job.data, error: err.message });
  }
});
