import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        passport: 'passport.html',
        live: 'live.html',
        academy: 'academy.html',
        about: 'about.html',
        contact: 'contact.html',
      }
    }
  }
})
