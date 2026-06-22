const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // 1. Revert to gemini-1.5-flash because 2.5 has a 20 request/day limit
    content = content.replace(/gemini-2\.5-flash/g, 'gemini-1.5-flash');
    
    // 2. Fix Rate Limiting Project-Wide (Limit BullMQ to 1 job per 15 seconds to stay under 5 req/min free tier)
    content = content.replace(/concurrency:\s*\d+/g, 'concurrency: 1');
    content = content.replace(/limiter:\s*\{\s*max:\s*\d+,\s*duration:\s*\d+\s*\}/g, 'limiter: { max: 1, duration: 15000 }');

    if (original !== content) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${filePath}`);
    }
  }
});
