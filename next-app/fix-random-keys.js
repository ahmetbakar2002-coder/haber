const fs = require('fs');
const path = require('path');

const clientCode = `import { GoogleGenerativeAI } from '@google/generative-ai';

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
`;

fs.writeFileSync('./src/lib/ai/geminiClient.ts', clientCode);

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(path.join(dir, f));
    }
  });
}

// Switch to gemini-2.0-flash which has 1500 req/day instead of 2.5 which has 20 req/day
walkDir('./src', (filePath) => {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('gemini-2.5-flash')) {
      content = content.replace(/gemini-2\.5-flash/g, 'gemini-2.0-flash');
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
    }
  }
});
