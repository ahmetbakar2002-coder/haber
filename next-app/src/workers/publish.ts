import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { deadLetterQueue } from '@/queues';
import { calculateSourcePriority } from '@/lib/engines/sourcePriority';
import { calculateSocialVirality } from '@/lib/engines/socialVirality';
import { calculateTransferConfidence } from '@/lib/engines/transferConfidence';
import { isBreakingNews } from '@/lib/engines/breakingNews';
import { detectMilliHaber } from '@/lib/engines/milliHaber';
import { generatePushNotification } from '@/lib/engines/pushNotification';
import { extractEntities } from '@/lib/engines/knowledgeGraph';
import { generateTimelineEvent } from '@/lib/engines/autoTimeline';

const connection = { url: process.env.REDIS_URL || 'redis://localhost:6379' };
const prisma = new PrismaClient();

export const publishNewsWorker = new Worker('publish-news', async (job: Job) => {
  console.log(`[Publish Worker] Processing: ${job.data.rewrittenTitle}`);
  try {
    const payload = job.data;
    
    // Calculate final scores
    const priorityScore = calculateSourcePriority(payload.sourceName || 'Unknown', payload.url);
    const viralityScore = calculateSocialVirality(payload.rewrittenTitle, payload.rewrittenContent, priorityScore);
    const transferConfidence = calculateTransferConfidence(payload.rewrittenTitle, payload.rewrittenContent, payload.sourceName || 'Unknown');

    // Flags
    const isBreaking = isBreakingNews(payload.rewrittenTitle, payload.rewrittenContent);
    const isMilli = await detectMilliHaber(payload.rewrittenTitle, payload.rewrittenContent);

    // Prepare push (async but fast)
    const push = await generatePushNotification(payload.rewrittenTitle, payload.rewrittenContent, isBreaking, isMilli);

    // Pre-extract AI relations before transaction
    const entities = await extractEntities(payload.rewrittenTitle, payload.rewrittenContent);
    const timelineEvent = await generateTimelineEvent(payload.rewrittenTitle);

    // Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Article & SEO
      const article = await tx.article.create({
        data: {
          sourceId: payload.sourceId,
          title: payload.rewrittenTitle,
          slug: payload.seo.metaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          content: payload.rewrittenContent,
          rawContent: payload.summary,
          hash: payload.hash,
          status: 'PUBLISHED', 
          priorityScore,
          viralityScore,
          transferConfidence,
          isBreaking,
          isMilliHaber: isMilli,
          imageUrl: payload.imageUrl,
          summaryShort: payload.summaries?.summaryShort,
          summaryMedium: payload.summaries?.summaryMedium,
          summaryLong: payload.summaries?.summaryLong,
          notificationTitle: push?.notificationTitle,
          notificationBody: push?.notificationBody,
          seoData: {
            create: {
              metaTitle: payload.seo.metaTitle,
              metaDescription: payload.seo.metaDescription,
              canonicalUrl: `https://cakuspor.com/haber/${payload.seo.metaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              focusKeyword: payload.seo.focusKeyword,
            }
          }
        }
      });

      // 2. Tags (from SEO payload)
      if (payload.seo.tags && payload.seo.tags.length > 0) {
        for (const tagName of payload.seo.tags) {
          const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          let dbTag = await tx.tag.findUnique({ where: { name: tagName } });
          if (!dbTag) {
            dbTag = await tx.tag.create({ data: { name: tagName, slug } });
          } else {
            dbTag = await tx.tag.update({ where: { id: dbTag.id }, data: { usageCount: { increment: 1 } } });
          }
          await tx.articleTag.create({ data: { articleId: article.id, tagId: dbTag.id } });
        }
      }

      // 3. Entities
      if (entities && entities.length > 0) {
        for (const ent of entities) {
          let dbEntity = await tx.knowledgeEntity.findUnique({ where: { name: ent.name } });
          if (!dbEntity) {
            dbEntity = await tx.knowledgeEntity.create({
              data: { name: ent.name, type: ent.type, attributes: ent.attributes || {} }
            });
          } else {
            dbEntity = await tx.knowledgeEntity.update({
              where: { id: dbEntity.id },
              data: { attributes: ent.attributes || {} }
            });
          }
          const existingLink = await tx.articleEntity.findUnique({
            where: { articleId_entityId: { articleId: article.id, entityId: dbEntity.id } }
          });
          if (!existingLink) {
            await tx.articleEntity.create({ data: { articleId: article.id, entityId: dbEntity.id } });
          }
        }
      }

      // 4. Timeline
      if (timelineEvent) {
        await tx.timelineEvent.create({
          data: {
            articleId: article.id,
            topic: timelineEvent.topic,
            description: timelineEvent.description,
            eventDate: new Date()
          }
        });
      }

      return article;
    });

    console.log(`[Publish Worker] Successfully published article ID: ${result.id}`);

  } catch (error: any) {
    throw error;
  }
}, { connection, concurrency: 5, limiter: { max: 100, duration: 60000 } });

publishNewsWorker.on('failed', async (job, err) => {
  console.error(`[Publish Worker] Job ${job?.id} failed: ${err.message}`);
  if (job && job.attemptsMade >= 3) {
    await deadLetterQueue.add('dead-letter-job', { queue: 'publish-news', jobData: job.data, error: err.message });
  }
});
