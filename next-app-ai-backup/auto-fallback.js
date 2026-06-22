const fs = require('fs');
const path = require('path');

const clientCode = `import { GoogleGenerativeAI } from '@google/generative-ai';

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
    'gemini-3.5-flash',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  
  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const model = getGeminiClient().getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.warn(\`[Gemini Fallback] Model \${modelName} failed: \${error.message.substring(0, 100)}\`);
      lastError = error;
    }
  }
  throw lastError;
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

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.ts') && filePath !== path.join('src', 'lib', 'ai', 'geminiClient.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('getGenerativeModel')) {
      
      content = content.replace(/import\s*\{\s*getGeminiClient\s*\}\s*from\s*'@\/lib\/ai\/geminiClient';/g, "import { executeGeminiPrompt } from '@/lib/ai/geminiClient';");
      
      content = content.replace(/const\s+model\s*=\s*getGeminiClient\(\)\.getGenerativeModel\(\{[\s\S]*?\}\);/g, '');
      
      content = content.replace(/const\s+result\s*=\s*await\s+model\.generateContent\(prompt\);[\s\n]*const\s+responseText\s*=\s*result\.response\.text\(\);/g, 'const responseText = await executeGeminiPrompt(prompt);');
      
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
    }
  }
});
