import axios from 'axios';
import crypto from 'crypto';
import { SOURCES } from '@/config/sources';
import { PrismaClient } from '@prisma/client';
import { rawNewsQueue } from '@/queues';

const prisma = new PrismaClient();

export async function fetchAllApiSources() {
  const apiSources = SOURCES.filter(s => s.type === 'API');
  console.log(`Starting API fetch for ${apiSources.length} sources...`);

  for (const sourceConfig of apiSources) {
    try {
      const dbSource = await prisma.source.upsert({
        where: { name: sourceConfig.name },
        update: { url: sourceConfig.url, trustScore: sourceConfig.priorityScore },
        create: { 
          name: sourceConfig.name, 
          url: sourceConfig.url, 
          type: 'API', 
          trustScore: sourceConfig.priorityScore 
        }
      });

      // Different API sources might have different response formats.
      // Here we assume a standard JSON array of articles for demonstration purposes,
      // but in a real production system, you would have adapters for each API.
      
      const response = await axios.get(sourceConfig.url, { timeout: 10000 });
      let articles = [];

      // Example parsing (Adapter logic would go here depending on source)
      if (sourceConfig.name === 'UEFA Official' && response.data?.items) {
        articles = response.data.items;
      } else if (sourceConfig.name === 'NBA Official' && response.data?.articles) {
        articles = response.data.articles;
      } else if (Array.isArray(response.data)) {
        articles = response.data;
      }

      for (const item of articles) {
        const title = item.title || item.headline;
        const link = item.url || item.link;
        const summary = item.description || item.summary || item.snippet || '';
        
        if (!title || !link) continue;

        const hash = crypto.createHash('sha256').update(link).digest('hex');

        const exists = await prisma.article.findUnique({ where: { hash } });
        if (exists) continue;

        const imageUrl = item.image || item.thumbnail || item.pictureUrl;

        await rawNewsQueue.add('process-raw-api-news', {
          sourceId: dbSource.id,
          sourceName: dbSource.name,
          title: title,
          summary: summary,
          url: link,
          hash: hash,
          image: imageUrl
        });
      }
      
      await prisma.source.update({
        where: { id: dbSource.id },
        data: { lastCheckedAt: new Date() }
      });
      
    } catch (error) {
      console.error(`Failed to fetch API for ${sourceConfig.name}:`, error);
    }
  }
}
