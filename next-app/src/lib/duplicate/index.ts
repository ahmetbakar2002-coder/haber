import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function isDuplicate(title: string, summary: string): Promise<boolean> {
  // In a real Node.js app without local python embeddings, 
  // you might rely on PostgreSQL pg_trgm similarity or exact hash.
  
  const contentHash = crypto.createHash('sha256').update(title + summary).digest('hex');
  
  // 1. Exact hash check
  const existingByHash = await prisma.article.findUnique({
    where: { hash: contentHash }
  });
  
  if (existingByHash) return true;

  // 2. Similarity check using raw query (assuming pg_trgm is enabled in DB)
  // Requires: CREATE EXTENSION IF NOT EXISTS pg_trgm;
  const similarArticles = await prisma.$queryRaw`
    SELECT id, title, similarity(title, ${title}) as score
    FROM "Article"
    WHERE similarity(title, ${title}) > 0.85
    LIMIT 1;
  `;
  
  if (Array.isArray(similarArticles) && similarArticles.length > 0) {
    return true;
  }

  return false;
}
