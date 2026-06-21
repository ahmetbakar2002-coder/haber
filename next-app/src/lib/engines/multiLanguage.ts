import { getGeminiClient } from '@/lib/ai/geminiClient';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function translateArticle(articleId: string, title: string, content: string, summaryShort?: string) {
  // Mock implementations for EN and AR
  const languages = ['EN', 'AR'];
  
  try {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    for (const lang of languages) {
      const prompt = `
      Translate the following news article to ${lang === 'EN' ? 'English' : 'Arabic'}:
      Title: ${title}
      Content: ${content}
      Summary: ${summaryShort || ''}
      
      Respond purely in JSON:
      {
        "title": "...",
        "content": "...",
        "summaryShort": "..."
      }
      `;
      
      const result = await model.generateContent(prompt);
      const match = result.response.text().match(/\{[\s\S]*\}/);
      if (match) {
        const trans = JSON.parse(match[0]);
        await prisma.articleTranslation.create({
          data: {
            articleId,
            language: lang,
            title: trans.title,
            content: trans.content,
            summaryShort: trans.summaryShort
          }
        });
      }
    }
  } catch (error) {
    console.error('MultiLanguage Engine Error:', error);
  }
}
