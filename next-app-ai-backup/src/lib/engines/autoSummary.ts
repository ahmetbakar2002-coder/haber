import { executeGeminiPrompt } from '@/lib/ai/geminiClient';


export async function generateAutoSummaries(title: string, content: string) {
  try {
    

    const prompt = `
    Aşağıdaki haber için 3 farklı uzunlukta özet üret:
    1. Tek cümlelik özet (summaryShort)
    2. Yaklaşık 30 kelimelik özet (summaryMedium)
    3. Yaklaşık 100 kelimelik özet (summaryLong)
    
    Başlık: ${title}
    İçerik: ${content}
    
    Yalnızca aşağıdaki JSON formatında çıktı ver:
    {
      "summaryShort": "...",
      "summaryMedium": "...",
      "summaryLong": "..."
    }
    `;

    const responseText = await executeGeminiPrompt(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Auto Summary Error:', error);
    return null;
  }
}
