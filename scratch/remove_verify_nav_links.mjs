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
  'login.html',
  'record.html',
  'ai-olympiad.html',
  'app/index.html'
];

htmlFiles.forEach(file => {
  const filePath = path.resolve(rootDir, file);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // 1. Remove navbar VERIFY button e.g. <a href="verify.html" class="nav-link"...>VERIFY</a>
  const navRegex = /<a\s+href=["']verify\.html["'][^>]*>\s*VERIFY\s*<\/a>\s*/gi;
  if (navRegex.test(html)) {
    html = html.replace(navRegex, '');
    modified = true;
  }

  // 2. Remove footer column "Verification" or replace verify.html links in footer
  html = html.replace(/<a\s+href=["']verify\.html[^"']*["'][^>]*>(.*?)<\/a>/gi, (match, p1) => {
    modified = true;
    return `<a href="passport.html">${p1}</a>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log(`[CLEAN] Updated ${file} - removed verify.html links.`);
  } else {
    console.log(`[SKIP] No verify.html links in ${file}.`);
  }
});
