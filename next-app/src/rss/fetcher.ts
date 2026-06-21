import Parser from 'rss-parser';
import crypto from 'crypto';
import { SOURCES } from '@/config/sources';
import { PrismaClient } from '@prisma/client';
import { rawNewsQueue } from '@/queues';

const prisma = new PrismaClient();
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail']
  }
});

export async function fetchAllRssSources() {
  const rssSources = SOURCES.filter(s => s.type === 'RSS');
  console.log(`Starting RSS fetch for ${rssSources.length} sources...`);

  for (const sourceConfig of rssSources) {
    try {
      // Find or create source in DB to get its UUID
      const dbSource = await prisma.source.upsert({
        where: { name: sourceConfig.name },
        update: { url: sourceConfig.url, trustScore: sourceConfig.priorityScore },
        create: { 
          name: sourceConfig.name, 
          url: sourceConfig.url, 
          type: 'RSS', 
          trustScore: sourceConfig.priorityScore 
        }
      });

      const feed = await parser.parseURL(sourceConfig.url);
      
      for (const item of feed.items) {
        // Basic validation
        if (!item.title || !item.link) continue;

        // Create a unique hash for duplicate detection before hitting DB
        const hash = crypto.createHash('sha256').update(item.link).digest('hex');

        // Check if article already exists locally
        const exists = await prisma.article.findUnique({ where: { hash } });
        if (exists) continue;

        // Try extracting image from standard RSS fields or custom media:content
        let imageUrl = undefined;
        if (item['media:content'] && item['media:content']['$'] && item['media:content']['$'].url) {
          imageUrl = item['media:content']['$'].url;
        }

        // Send to BullMQ for processing
        await rawNewsQueue.add('process-raw-news', {
          sourceId: dbSource.id,
          sourceName: dbSource.name,
          title: item.title,
          summary: item.contentSnippet || item.content || '',
          url: item.link,
          hash: hash,
          image: imageUrl
        });
      }
      
      // Update lastCheckedAt
      await prisma.source.update({
        where: { id: dbSource.id },
        data: { lastCheckedAt: new Date() }
      });
      
    } catch (error) {
      console.error(`Failed to fetch RSS for ${sourceConfig.name}:`, error);
    }
  }
}
