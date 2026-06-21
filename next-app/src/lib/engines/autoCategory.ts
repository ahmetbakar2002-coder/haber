import { executeGeminiPrompt } from '@/lib/ai/geminiClient';
import { z } from 'zod';

const CategorySchema = z.object({
  mainCategory: z.string(),
  subCategory: z.string(),
  sportType: z.string(),
  gameType: z.string().optional().nullable(),
  tags: z.array(z.string())
});


export async function generateAutoCategory(title: string, content: string) {
  try {
    

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

    const responseText = await executeGeminiPrompt(prompt);
    
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
