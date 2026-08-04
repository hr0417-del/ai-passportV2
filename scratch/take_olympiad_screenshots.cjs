const playwright = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();

  // Desktop 1920px
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:8080/ai-olympiad.html');
  await page.waitForTimeout(1000);
  
  const desktopHero = path.join(process.cwd(), 'scratch/olympiad_desktop_hero.png');
  await page.screenshot({ path: desktopHero, fullPage: false });
  console.log('Saved desktop hero screenshot:', desktopHero);

  const desktopReg = path.join(process.cwd(), 'scratch/olympiad_desktop_reg.png');
  await page.evaluate(() => {
    document.getElementById('registration').scrollIntoView();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: desktopReg, fullPage: false });
  console.log('Saved desktop reg screenshot:', desktopReg);

  // Mobile 390px
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:8080/ai-olympiad.html');
  await page.waitForTimeout(1000);

  const mobileHero = path.join(process.cwd(), 'scratch/olympiad_mobile_hero.png');
  await page.screenshot({ path: mobileHero, fullPage: false });
  console.log('Saved mobile hero screenshot:', mobileHero);

  const mobileReg = path.join(process.cwd(), 'scratch/olympiad_mobile_reg.png');
  await page.evaluate(() => {
    document.getElementById('registration').scrollIntoView();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: mobileReg, fullPage: false });
  console.log('Saved mobile reg screenshot:', mobileReg);

  await browser.close();
}

capture().catch(err => console.error(err));
