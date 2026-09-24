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
  const verifyJsFile = assetFiles.find(f => f.startsWith('verify-') && f.endsWith('.js'));
  const mainJsFile = assetFiles.find(f => f.startsWith('main-') && f.endsWith('.js'));
  const appJsFile = assetFiles.find(f => f.startsWith('app-') && f.endsWith('.js'));

  // 1. Fix dist/verify.html
  const verifyHtmlPath = path.resolve(distDir, 'verify.html');
  if (fs.existsSync(verifyHtmlPath)) {
    let verifyHtml = fs.readFileSync(verifyHtmlPath, 'utf-8');
    let tagsToInject = '';

    if (mainJsFile && !verifyHtml.includes(mainJsFile)) {
      tagsToInject += `<script type="module" crossorigin src="./assets/${mainJsFile}"></script>\n`;
    }
    if (verifyJsFile && !verifyHtml.includes(verifyJsFile)) {
      tagsToInject += `<script type="module" crossorigin src="./assets/${verifyJsFile}"></script>\n`;
    }

    if (tagsToInject) {
      console.log('[FIX-BUILD] Injecting script tags into dist/verify.html');
      verifyHtml = verifyHtml.replace('</body>', `${tagsToInject}</body>`);
      fs.writeFileSync(verifyHtmlPath, verifyHtml, 'utf-8');
      console.log('[FIX-BUILD] SUCCESS! dist/verify.html updated with script tags.');
    } else {
      console.log('[FIX-BUILD] dist/verify.html script tags verified.');
    }
  }

  // 2. Fix dist/app/index.html
  const appHtmlPath = path.resolve(distDir, 'app/index.html');
  if (fs.existsSync(appHtmlPath) && appJsFile) {
    let appHtml = fs.readFileSync(appHtmlPath, 'utf-8');
    if (!appHtml.includes(appJsFile)) {
      console.log('[FIX-BUILD] Injecting script tag for', appJsFile, 'into dist/app/index.html');
      const scriptTag = `<script type="module" crossorigin src="../assets/${appJsFile}"></script>\n</body>`;
      appHtml = appHtml.replace('</body>', scriptTag);
      fs.writeFileSync(appHtmlPath, appHtml, 'utf-8');
      console.log('[FIX-BUILD] SUCCESS! dist/app/index.html updated with script tag.');
    }
  }
}
