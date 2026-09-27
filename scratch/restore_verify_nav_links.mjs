import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlFiles = [
  'index.html',
  'passport.html',
  'live.html',
  'academy.html',
  'about.html',
  'contact.html',
  'projects.html',
  'insights.html',
  'record.html',
  'ai-olympiad.html'
];

htmlFiles.forEach(file => {
  const filePath = path.resolve(rootDir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf-8');
  if (html.includes('href="verify.html"')) return;

  const target = `<a href="live.html#register" class="nav-cta-btn">`;
  const replacement = `<a href="verify.html" class="nav-link" style="font-family: 'Space Mono', monospace; font-size: 0.76rem; letter-spacing: 0.1em; color: var(--color-gold); margin-right: 12px;">VERIFY</a>\n        <a href="live.html#register" class="nav-cta-btn">`;

  if (html.includes(target)) {
    html = html.replace(target, replacement);
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[RESTORE] Restored VERIFY nav link in ${file}`);
  }
});
