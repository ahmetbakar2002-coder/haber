import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGeminiClient() {
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keys.length === 0) {
    return new GoogleGenerativeAI('');
  }
  
  const key = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenerativeAI(key);
}

export async function executeGeminiPrompt(prompt: string) {
  const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-3.5-flash'
  ];
  
  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const model = getGeminiClient().getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.warn(`[Gemini Fallback] Model ${modelName} failed: ${error.message.substring(0, 100)}`);
      lastError = error;
    }
  }
  throw lastError;
}
