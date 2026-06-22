const fs = require('fs');
const path = require('path');

const clientCode = `import { GoogleGenerativeAI } from '@google/generative-ai';

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
`;

fs.mkdirSync('./src/lib/ai', { recursive: true });
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
    if (content.includes('new GoogleGenerativeAI')) {
      let original = content;
      
      // Remove GoogleGenerativeAI import
      content = content.replace(/import\s+\{\s*GoogleGenerativeAI\s*\}\s+from\s+'@google\/generative-ai';\n?/g, '');
      
      // Add getGeminiClient import
      content = "import { getGeminiClient } from '@/lib/ai/geminiClient';\n" + content;
      
      // Remove global genAI instantiation
      content = content.replace(/const\s+genAI\s*=\s*new\s+GoogleGenerativeAI\([^)]+\);\n?/g, '');
      
      // Replace genAI usage
      content = content.replace(/genAI\.getGenerativeModel/g, 'getGeminiClient().getGenerativeModel');
      
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
    }
  }
});
