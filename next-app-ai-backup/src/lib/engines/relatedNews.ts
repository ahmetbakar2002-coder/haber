import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function findRelatedNews(articleId: string, tags: string[]): Promise<string[]> {
  if (tags.length === 0) return [];
  
  // Find other articles sharing the same tags (ignoring current article)
  const related = await prisma.article.findMany({
    where: {
      id: { not: articleId },
      tags: {
        some: {
          tag: {
            name: { in: tags }
          }
        }
      }
    },
    take: 5,
    select: { id: true }
  });
  
  return related.map((r: any) => r.id);
}
