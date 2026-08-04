import fs from 'fs';
import path from 'path';

const htmlStyle = fs.readFileSync('app/index.html', 'utf-8');
const mainStyle = fs.readFileSync('style.css', 'utf-8');
const fullStyle = htmlStyle + mainStyle;

const appDir = 'src/app';
const files = fs.readdirSync(appDir).filter(f => f.endsWith('.js'));

const missingClasses = new Set();
const foundClasses = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(appDir, file), 'utf-8');
  const matches = content.matchAll(/class=["']([^"']+)["']/g);
  for (const m of matches) {
    const classList = m[1].split(/\s+/);
    classList.forEach(c => {
      c = c.trim();
      if (!c || c.includes('${') || c.includes('view-panel')) return;
      if (!fullStyle.includes('.' + c)) {
        missingClasses.add(c);
      } else {
        foundClasses.add(c);
      }
    });
  }
});

console.log('Total styled classes found:', foundClasses.size);
console.log('Total MISSING UNSTYLED classes found:', missingClasses.size);
console.log('Missing classes list:', Array.from(missingClasses));
