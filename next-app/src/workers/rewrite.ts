import { Worker, Job } from 'bullmq';
import { publishNewsQueue, deadLetterQueue } from '@/queues';
import { processNLPEngine } from '@/lib/engines/nlpEngine';

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

export const rewriteNewsWorker = new Worker('rewrite-news', async (job: Job) => {
  console.log(`[Super AI Worker] Processing: ${job.data.title}`);
  try {
    const rawPayload = job.data;
    
    // 1 AI call does EVERYTHING
    const superResult = await processNLPEngine(rawPayload.title, rawPayload.summary, rawPayload.sourceName);
    
    // Push directly to Publish Queue, passing the massive payload
    await publishNewsQueue.add('publish-job', {
      ...rawPayload,
      rewrittenTitle: superResult.rewrittenTitle,
      rewrittenContent: superResult.rewrittenContent,
      summaries: superResult.summaries,
      seo: superResult.seo,
      isMilliHaber: superResult.isMilliHaber,
      pushNotification: superResult.pushNotification,
      entities: superResult.entities,
      timelineEvent: superResult.timelineEvent
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
