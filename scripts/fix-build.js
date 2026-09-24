import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const assetsDir = path.resolve(rootDir, 'dist/assets');

if (fs.existsSync(distDir) && fs.existsSync(assetsDir)) {
  const assetFiles = fs.readdirSync(assetsDir);
  const appJsFile = assetFiles.find(f => f.startsWith('app-') && f.endsWith('.js'));

  // Fix dist/app/index.html
  const appHtmlPath = path.resolve(distDir, 'app/index.html');
  if (fs.existsSync(appHtmlPath) && appJsFile) {
    let appHtml = fs.readFileSync(appHtmlPath, 'utf-8');
    if (!appHtml.includes(appJsFile)) {
      console.log('[FIX-BUILD] Injecting script tag for', appJsFile, 'into dist/app/index.html');
      const scriptTag = `<script type="module" crossorigin src="../assets/${appJsFile}"></script>\n</body>`;
      appHtml = appHtml.replace('</body>', scriptTag);
      fs.writeFileSync(appHtmlPath, appHtml, 'utf-8');
      console.log('[FIX-BUILD] SUCCESS! dist/app/index.html updated with script tag.');
    } else {
      console.log('[FIX-BUILD] dist/app/index.html script tag verified.');
    }
  }
}
