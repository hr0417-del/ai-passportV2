import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

function fixSubfolderHtmlPlugin() {
  return {
    name: 'fix-subfolder-html',
    closeBundle() {
      const appHtmlPath = path.resolve(__dirname, 'dist/app/index.html')
      const assetsDir = path.resolve(__dirname, 'dist/assets')
      if (fs.existsSync(appHtmlPath) && fs.existsSync(assetsDir)) {
        let html = fs.readFileSync(appHtmlPath, 'utf-8')
        const files = fs.readdirSync(assetsDir)
        const appJsFile = files.find(f => f.startsWith('app-') && f.endsWith('.js'))
        if (appJsFile && !html.includes(appJsFile)) {
          console.log('[fixSubfolderHtmlPlugin] Injecting script tag for', appJsFile, 'into dist/app/index.html')
          const scriptTag = `<script type="module" crossorigin src="../assets/${appJsFile}"></script>\n</body>`
          html = html.replace('</body>', scriptTag)
          fs.writeFileSync(appHtmlPath, html, 'utf-8')
        }
      }
    }
  }
}

export default defineConfig({
  base: './',
  plugins: [fixSubfolderHtmlPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        passport: 'passport.html',
        live: 'live.html',
        academy: 'academy.html',
        about: 'about.html',
        contact: 'contact.html',
        verify: 'verify.html',
        login: 'login.html',
        app: 'app/index.html',
        olympiad: 'ai-olympiad.html'
      }
    }
  }
})
