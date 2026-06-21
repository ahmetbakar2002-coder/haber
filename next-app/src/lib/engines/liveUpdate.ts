import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function processLiveUpdate(articleId: string, updateContent: string): Promise<boolean> {
  const text = updateContent.toLowerCase();
  
  let updateType = "Genel Güncelleme";
  if (text.includes("maç başladı")) updateType = "Maç Başladı";
  else if (text.includes("ilk yarı sonucu") || text.includes("devre arası")) updateType = "İlk Yarı Sonucu";
  else if (text.includes("gol")) updateType = "Gol";
  else if (text.includes("kırmızı kart")) updateType = "Kırmızı Kart";
  else if (text.includes("maç sonucu") || text.includes("maç bitti")) updateType = "Maç Sonucu";

  await prisma.articleUpdate.create({
    data: {
      articleId,
      updateType,
      content: updateContent
    }
  });

  return true;
}
