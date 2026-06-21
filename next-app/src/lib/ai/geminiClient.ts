import { GoogleGenerativeAI } from '@google/generative-ai';

let currentIndex = 0;

export function getGeminiClient() {
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keys.length === 0) {
    return new GoogleGenerativeAI('');
  }
  
  const key = keys[currentIndex % keys.length];
  currentIndex++;
  
  return new GoogleGenerativeAI(key);
}
