import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function attemptSmartMerge(title: string, summary: string): Promise<string | null> {
  // Mock logic: Instead of returning true/false for duplicates,
  // we check if an article is highly similar to an existing one (e.g. transfer news).
  // If it is, we return the parentArticleId so the pipeline can merge them.
  
  // Real implementation using pg_trgm similarity on both title and content.
  // Entity similarity can be checked logically if passed, or we assume title/content overlap is strong enough.
  const similarArticles = await prisma.$queryRaw<any[]>`
    SELECT id
    FROM "Article"
    WHERE (similarity(title, ${title}) > 0.80 OR similarity("rawContent", ${summary}) > 0.75)
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
