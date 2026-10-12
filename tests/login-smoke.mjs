import { chromium } from 'playwright';

const base = 'https://angelmaltos03-alt.github.io/Protocolo-Nexus/';
const url = base + '?verify=' + Date.now();
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
  if (login.locked || !login.hidden || login.name !== 'Juan Pérez') throw new Error('Login failed: ' + JSON.stringify(login));

  await page.locator('[data-view="misiones"]').click();
  await page.locator('#missionCards [data-open-session="0"]').click();
  await page.locator('.answer-entry-panel').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('.answer-option').first().waitFor({ state: 'visible', timeout: 10000 });
  const moduleInstructions = await page.locator('#missionReference').innerText();
  const answerHeading = await page.locator('.answer-entry-panel').innerText();
  const optionCount = await page.locator('.answer-option').count();
  if (!moduleInstructions.includes('QUÉ HACER EN EL MÓDULO') || !moduleInstructions.includes('regresa a esta misión')) {
    throw new Error('Module directions/return instructions missing: ' + moduleInstructions);
  }
  if (!answerHeading.includes('Selecciona tu decisión') || optionCount !== 4) {
    throw new Error('Visible choice field missing: ' + JSON.stringify({answerHeading, optionCount}));
  }
  await page.locator('.answer-option').first().click();
  await page.locator('#submitAnswer').click();
  await page.locator('#nextChallenge').waitFor({ state: 'visible', timeout: 10000 });
  const result = await page.evaluate(() => ({
    loginName: document.querySelector('#topName')?.textContent?.trim(),
    answerPanel: !!document.querySelector('.answer-entry-panel'),
    optionCount: document.querySelectorAll('.answer-option').length,
    moduleStep: document.querySelector('#missionReference')?.innerText?.includes('PASO 1 · QUÉ HACER EN EL MÓDULO'),
    answerStep: document.querySelector('.answer-entry-panel')?.innerText?.includes('PASO 2 · ENTREGA TU RESPUESTA'),
    nextVisible: getComputedStyle(document.querySelector('#nextChallenge')).display !== 'none',
    feedback: document.querySelector('#challengeFeedback')?.textContent?.trim()
  }));
  if (!result.answerPanel || !result.moduleStep || !result.answerStep || !result.nextVisible) {
    throw new Error('Challenge workflow incomplete: ' + JSON.stringify(result));
  }
  if (errors.length) throw new Error('Browser JavaScript errors: ' + errors.join(' | '));
  console.log('NEXUS_LOGIN_AND_ANSWER_FIELD_PASS', JSON.stringify({url, ...result, pageErrors: errors}));
} finally {
  await browser.close();
}
