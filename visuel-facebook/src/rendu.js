/* Rendu des pages HTML en PNG (Chromium / Playwright).
   usage : node src/rendu.js <page.html> <sortie.png> <largeur> <hauteur> */
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const [src, out, w, h] = process.argv.slice(2);
  const width = parseInt(w, 10), height = parseInt(h, 10);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const debug = await page.evaluate(() => (window.__mesures ? window.__mesures() : null));
  if (debug) console.log(JSON.stringify(debug));
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height }, omitBackground: false });
  await browser.close();
  console.log('ok', out, width + 'x' + height);
})();
