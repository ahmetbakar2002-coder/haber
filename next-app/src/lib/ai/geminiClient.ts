import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGeminiClient() {
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
  
  if (keys.length === 0) {
    return new GoogleGenerativeAI('');
  }
  
  // Pick a purely random key to ensure perfect distribution across all background workers
  const key = keys[Math.floor(Math.random() * keys.length)];
  
  return new GoogleGenerativeAI(key);
}
