import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function attemptSmartMerge(title: string, summary: string): Promise<string | null> {
  // Mock logic: Instead of returning true/false for duplicates,
  // we check if an article is highly similar to an existing one (e.g. transfer news).
  // If it is, we return the parentArticleId so the pipeline can merge them.
  
  // Real implementation using standard SQL ILIKE instead of pg_trgm similarity
  // This avoids needing to install the pg_trgm extension in the database.
  const similarArticles = await prisma.$queryRaw<any[]>`
    SELECT id
    FROM "Article"
    WHERE (title ILIKE ${'%' + title + '%'} OR "rawContent" ILIKE ${'%' + summary + '%'})
    AND "isMergedParent" = false
    LIMIT 1;
  `;
  
  if (Array.isArray(similarArticles) && similarArticles.length > 0) {
    // We found an existing article that matches. This will be the parent.
    // If it's not already a parent, we make it one.
    await prisma.article.update({
      where: { id: similarArticles[0].id },
      data: { isMergedParent: true }
    });
    return similarArticles[0].id;
  }
  
  return null;
}
