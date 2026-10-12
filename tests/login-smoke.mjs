import { chromium } from 'playwright';

const url = 'https://angelmaltos03-alt.github.io/Protocolo-Nexus/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
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
  const login = await page.evaluate(() => ({
    locked: document.documentElement.classList.contains('login-locked'),
    name: document.querySelector('#topName')?.textContent?.trim(),
    hidden: document.querySelector('#loginGate')?.hidden
  }));
  if (login.locked || !login.hidden || login.name !== 'Juan Pérez') {
    throw new Error('Login did not unlock correctly: ' + JSON.stringify(login));
  }

  await page.locator('[data-view="misiones"]').click();
  await page.locator('[data-open-session="0"]').click();
  await page.locator('[data-node="4"]').click();
  await page.locator('#numericAnswer').waitFor({ state: 'visible', timeout: 10000 });
  const instructions = await page.locator('#missionReference').innerText();
  if (!instructions.includes('QUÉ HACER EN EL MÓDULO') || !instructions.includes('regresa a esta misión')) {
    throw new Error('Module instructions or return-to-answer instructions are missing: ' + instructions);
  }
  await page.locator('#missionReferenceBtn').click();
  await page.locator('#view-inicio.active').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#activityDockReturn').click();
  await page.locator('#numericAnswer').fill('36420');
  await page.locator('#submitAnswer').click();
  await page.locator('#nextChallenge').waitFor({ state: 'visible', timeout: 10000 });
  const result = await page.evaluate(() => ({
    locked: document.documentElement.classList.contains('login-locked'),
    name: document.querySelector('#topName')?.textContent?.trim(),
    answerPanel: !!document.querySelector('.answer-entry-panel'),
    answerValue: document.querySelector('#numericAnswer')?.value,
    nextVisible: getComputedStyle(document.querySelector('#nextChallenge')).display !== 'none',
    feedback: document.querySelector('#challengeFeedback')?.textContent?.trim()
  }));
  if (!result.answerPanel || result.answerValue !== '36420' || !result.nextVisible) {
    throw new Error('Challenge answer flow failed: ' + JSON.stringify(result));
  }
  if (errors.length) throw new Error('Browser page errors: ' + errors.join(' | '));
  console.log('NEXUS_LOGIN_AND_CHALLENGE_PASS', JSON.stringify({ url, ...result, pageErrors: errors }));
} finally {
  await browser.close();
}
