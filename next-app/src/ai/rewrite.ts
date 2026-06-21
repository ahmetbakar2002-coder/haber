import { getGeminiClient } from '@/lib/ai/geminiClient';
import { z } from 'zod';

const RewriteSchema = z.object({
  rewrittenTitle: z.string(),
  rewrittenContent: z.string()
});


export async function rewriteArticle(title: string, content: string) {
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Aşağıdaki spor haberini Türk spor medyası standartlarında profesyonelce, tarafsız ve özgün bir dille yeniden yaz. Haberi birebir çevirme veya kopyalama. Gazeteci dili kullan.
    
    Orijinal Başlık: ${title}
    Orijinal İçerik: ${content}
    
    Yalnızca yeniden yazılmış içeriği JSON formatında dön:
    {
      "rewrittenTitle": "Yeni Başlık",
      "rewrittenContent": "Yeni içerik..."
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON in case Gemini wraps it in markdown blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return RewriteSchema.parse(parsed);
    }
    
    throw new Error('Gemini did not return valid JSON');
  } catch (error) {
    console.error('Gemini Rewrite Error:', error);
    throw error;
  }
}
