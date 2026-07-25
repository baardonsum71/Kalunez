import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/acquire-screenshots');
const BASE = 'https://www.kalunez.com';

const shots = [
  { name: '01-home', path: '/', width: 1440, height: 900 },
  { name: '02-discover', path: '/discover', width: 1440, height: 900 },
  { name: '03-pricing', path: '/pricing', width: 1440, height: 900 },
  { name: '04-for-artists', path: '/for-artists', width: 1440, height: 900 },
  { name: '05-live', path: '/live', width: 1440, height: 900 },
  { name: '06-go-live', path: '/go-live', width: 1440, height: 900 },
  { name: '07-pricing-mobile', path: '/pricing', width: 390, height: 844, mobile: true },
  { name: '08-pro-subscription', path: '/pro', width: 1440, height: 900 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: 2,
    isMobile: Boolean(shot.mobile),
    userAgent: shot.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : undefined,
  });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}${shot.path}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: join(OUT, `${shot.name}.png`),
      fullPage: false,
      timeout: 60000,
    });
    console.log(`Saved ${shot.name}.png`);
  } catch (err) {
    console.error(`Failed ${shot.name}:`, err.message);
  }
  await context.close();
}

await browser.close();
console.log(`Done. Screenshots in ${OUT}`);
