import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const CategorySchema = z.object({
  mainCategory: z.string(),
  subCategory: z.string(),
  sportType: z.string(),
  gameType: z.string().optional().nullable(),
  tags: z.array(z.string())
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateAutoCategory(title: string, content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
    Aşağıdaki haberi analiz ederek kategorizasyon verilerini üret:
    
    Başlık: ${title}
    İçerik: ${content}
    
    Yalnızca aşağıdaki JSON formatında çıktı ver:
    {
      "mainCategory": "Ana Kategori (örn: spor-haberleri, espor-haberleri, dunya-spor)",
      "subCategory": "Alt Kategori (örn: futbol, basketbol, cs2, valorant)",
      "sportType": "Spor Dalı (Futbol, Basketbol, vs.)",
      "gameType": "Oyun Türü (Espor ise CS2, LoL, boş bırakılabilir)",
      "tags": ["etiket1", "etiket2", "etiket3"]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return CategorySchema.parse(parsed);
    }
    
    return null;
  } catch (error) {
    console.error('Auto Category Error:', error);
    return null;
  }
}
