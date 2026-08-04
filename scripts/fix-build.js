import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const appHtmlPath = path.resolve(rootDir, 'dist/app/index.html');
const assetsDir = path.resolve(rootDir, 'dist/assets');

if (fs.existsSync(appHtmlPath) && fs.existsSync(assetsDir)) {
  let html = fs.readFileSync(appHtmlPath, 'utf-8');
  const files = fs.readdirSync(assetsDir);
  const appJsFile = files.find(f => f.startsWith('app-') && f.endsWith('.js'));
  
  const hasScriptTag = appJsFile && html.includes(appJsFile);

  if (appJsFile && !hasScriptTag) {
    console.log('[FIX-BUILD] Injecting missing script tag for:', appJsFile, 'into dist/app/index.html');
    const scriptTag = `<script type="module" crossorigin src="../assets/${appJsFile}"></script>\n</body>`;
    html = html.replace('</body>', scriptTag);
    fs.writeFileSync(appHtmlPath, html, 'utf-8');
    console.log('[FIX-BUILD] SUCCESS! Injected script tag in dist/app/index.html');
  } else {
    // Check if script tag actually exists, if not force inject
    if (appJsFile && !html.includes(`src="../assets/${appJsFile}"`)) {
      console.log('[FIX-BUILD] Force injecting script tag for:', appJsFile);
      const scriptTag = `<script type="module" crossorigin src="../assets/${appJsFile}"></script>\n</body>`;
      html = html.replace('</body>', scriptTag);
      fs.writeFileSync(appHtmlPath, html, 'utf-8');
      console.log('[FIX-BUILD] SUCCESS! Injected script tag in dist/app/index.html');
    } else {
      console.log('[FIX-BUILD] Script tag verified present.');
    }
  }
} else {
  console.log('[FIX-BUILD] dist/app/index.html not found.');
}
