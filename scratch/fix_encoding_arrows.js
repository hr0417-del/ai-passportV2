import fs from 'fs';
import path from 'path';

const appDir = 'src/app';
const files = fs.readdirSync(appDir).filter(f => f.endsWith('.js'));

files.forEach(file => {
  const filePath = path.join(appDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content
    .replaceAll('â†’', '→')
    .replaceAll('â†—', '↗')
    .replaceAll('â†', '←')
    .replaceAll('â„¢', '™');
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Repaired encoding in ${file}`);
});
