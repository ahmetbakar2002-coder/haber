import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function detectMilliHaber(title: string, content: string): Promise<boolean> {
  const text = `${title} ${content}`.toLowerCase();
  
  // We fetch Turkish entities from DB
  const entities = await prisma.turkishEntity.findMany();
  
  if (entities.length === 0) {
    // Fallback dictionary if DB is empty
    const fallbacks = [
      'galatasaray', 'fenerbahçe', 'beşiktaş', 'trabzonspor', 'başakşehir',
      'anadolu efes', 'vakıfbank', 'eczacıbaşı',
      'eternal fire', 'fut esports', 'bbl', 's2g', 'fire flux',
      'milli takım', 'ay-yıldızlılar', 'türkiye'
    ];
    for (const f of fallbacks) {
      if (text.includes(f)) return true;
    }
    return false;
  }

  for (const entity of entities) {
    if (text.includes(entity.name.toLowerCase())) {
      return true;
    }
  }

  return false;
}
