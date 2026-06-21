import { getGeminiClient } from '@/lib/ai/geminiClient';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const EntitySchema = z.array(z.object({
  name: z.string(),
  type: z.string(),
  attributes: z.record(z.any()).optional().nullable()
}));

const prisma = new PrismaClient();

export async function extractEntities(title: string, content: string) {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `
    Metinden varlıkları (Entity) ve aralarındaki ilişkileri çıkar:
    Başlık: ${title}
    İçerik: ${content}
    
    Yalnızca aşağıdaki JSON dizisini döndür:
    [
      { "name": "Victor Osimhen", "type": "PLAYER", "attributes": {"country": "Nijerya"} },
      { "name": "Galatasaray", "type": "TEAM", "attributes": {"league": "Süper Lig"} }
    ]
    Eğer bulamazsan boş dizi [] dön.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return EntitySchema.parse(parsed);
    }
    return [];
  } catch (error) {
    console.error('Knowledge Graph Extraction Error:', error);
    return [];
  }
}
