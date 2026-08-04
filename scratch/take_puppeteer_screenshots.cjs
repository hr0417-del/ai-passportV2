const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Desktop 1920px
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:8080/ai-olympiad.html', { waitUntil: 'networkidle0' });
  
  const desktopHero = path.join(process.cwd(), 'scratch/olympiad_desktop_hero.png');
  await page.screenshot({ path: desktopHero, fullPage: false });
  console.log('Captured desktop hero:', desktopHero);

  // Mobile 390px
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8080/ai-olympiad.html', { waitUntil: 'networkidle0' });
  
  const mobileHero = path.join(process.cwd(), 'scratch/olympiad_mobile_hero.png');
  await page.screenshot({ path: mobileHero, fullPage: false });
  console.log('Captured mobile hero:', mobileHero);

  await browser.close();
}

capture().catch(err => console.error(err));
