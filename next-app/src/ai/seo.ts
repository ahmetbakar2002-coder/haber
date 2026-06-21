import { getGeminiClient } from '@/lib/ai/geminiClient';
import { z } from 'zod';

const SeoSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  focusKeyword: z.string(),
  tags: z.array(z.string())
});


export async function generateSeoData(title: string, content: string) {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
    Aşağıdaki haber için SEO verileri oluştur:
    
    Başlık: ${title}
    İçerik: ${content}
    
    Yalnızca aşağıdaki JSON formatında çıktı ver:
    {
      "metaTitle": "Maks 60 karakter SEO başlığı",
      "metaDescription": "Maks 150 karakter meta açıklaması",
      "focusKeyword": "Ana odak anahtar kelime",
      "tags": ["etiket1", "etiket2", "etiket3"]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return SeoSchema.parse(parsed);
    }
    
    throw new Error('Gemini SEO did not return valid JSON');
  } catch (error) {
    console.error('Gemini SEO Generation Error:', error);
    throw error;
  }
}
