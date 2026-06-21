import { executeGeminiPrompt } from '@/lib/ai/geminiClient';


export async function generatePushNotification(title: string, content: string, isBreaking: boolean, isMilli: boolean) {
  if (!isBreaking && !isMilli && !title.toLowerCase().includes('transfer')) {
    return null; // Don't spam push notifications
  }

  try {
    
    const prompt = `
    Bu önemli spor haberi için mobil uygulamada gönderilecek çarpıcı bir bildirim başlığı ve metni oluştur.
    Başlık: ${title}
    İçerik: ${content}
    
    Format:
    {
      "notificationTitle": "Dikkat çekici kısa başlık",
      "notificationBody": "Açıklayıcı kısa metin"
    }
    `;

    const responseText = await executeGeminiPrompt(prompt);
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Push Notification Gen Error:', error);
    return null;
  }
}
