const fs = require('fs');
const path = require('path');

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
  if (filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('gemini-2.0-flash')) {
      content = content.replace(/gemini-2\.0-flash/g, 'gemini-3.5-flash');
      fs.writeFileSync(filePath, content);
      console.log('Updated ' + filePath);
    }
  }
});
