import { chromium } from 'playwright';

const url = 'https://angelmaltos03-alt.github.io/Protocolo-Nexus/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.stack || error.message));
try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle', timeout: 90000 });
  await page.locator('#loginGate').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#entryFullName').fill('Juan Pérez');
  await page.locator('#loginSubmitButton').click();
  await page.locator('#loginGate').waitFor({ state: 'hidden', timeout: 15000 });
  const result = await page.evaluate(() => ({
    locked: document.documentElement.classList.contains('login-locked'),
    name: document.querySelector('#topName')?.textContent?.trim(),
    hidden: document.querySelector('#loginGate')?.hidden
  }));
  if (result.locked || !result.hidden || result.name !== 'Juan Pérez') {
    throw new Error('Login did not unlock correctly: ' + JSON.stringify(result));
  }
  console.log('LOGIN_SMOKE_PASS', JSON.stringify({ url, ...result, pageErrors: errors }));
  if (errors.length) throw new Error('Browser console page errors: ' + errors.join(' | '));
} finally {
  await browser.close();
}
