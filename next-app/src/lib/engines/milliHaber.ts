import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function detectMilliHaber(title: string, content: string): Promise<boolean> {
  const text = `${title} ${content}`.toLowerCase();
  
  // Dictionary for Turkish Teams/Players
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
