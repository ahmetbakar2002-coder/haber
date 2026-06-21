import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateTimelineEvent(articleId: string, title: string) {
  const text = title.toLowerCase();
  
  // Mock logic: If the news is about a transfer, we extract a topic name and save a timeline event
  if (text.includes('transfer') || text.includes('görüşme') || text.includes('imza')) {
    const match = title.match(/([A-ZÇŞĞÜÖİ][a-zçşğüöı]+ [A-ZÇŞĞÜÖİ][a-zçşğüöı]+)/);
    const player = match ? match[0] : 'Bilinmeyen Oyuncu';
// Mock logic: If the news is about a transfer, we extract a topic name
export async function generateTimelineEvent(title: string) {
  if (title.toLowerCase().includes('transfer')) {
    return {
      topic: 'Transfer Haberleri',
      description: title
    };
  }
  return null;
}
