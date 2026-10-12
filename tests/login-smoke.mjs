import { chromium } from 'playwright';

const base = 'https://angelmaltos03-alt.github.io/Protocolo-Nexus/';
const url = base + '?verify=' + Date.now();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
const browserConsoleErrors = [];
page.on('pageerror', error => errors.push(error.stack || error.message));
page.on('console', msg => { if (msg.type() === 'error') browserConsoleErrors.push(msg.text()); });
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

  // Diagnostic snapshot: report the published DOM/CSS and browser errors instead of only timing out.
  await page.waitForTimeout(350);
  const guidedDiagnostic = await page.evaluate(() => {
    const root = document.querySelector('#guidedStart');
    const style = root ? getComputedStyle(root) : null;
    return {
      url: location.href,
      loginGateHidden: document.querySelector('#loginGate')?.hidden,
      loginLocked: document.documentElement.classList.contains('login-locked') || document.body.classList.contains('login-locked'),
      exists: !!root,
      className: root?.className,
      hiddenAttribute: root?.hasAttribute('hidden'),
      inlineDisplay: root?.style.display,
      inlineVisibility: root?.style.visibility,
      display: style?.display,
      visibility: style?.visibility,
      opacity: style?.opacity,
      zIndex: style?.zIndex,
      ariaHidden: root?.getAttribute('aria-hidden'),
      stage: root?.getAttribute('data-guided-stage'),
      title: document.querySelector('#guidedTitle')?.textContent,
      loginError: document.querySelector('#loginError')?.textContent,
      loginErrorHidden: document.querySelector('#loginError')?.hidden
    };
  });
  if (!guidedDiagnostic.className?.split(/\\s+/).includes('is-open') ||
      guidedDiagnostic.display !== 'flex' ||
      guidedDiagnostic.visibility !== 'visible' ||
      guidedDiagnostic.loginLocked ||
      !guidedDiagnostic.loginGateHidden) {
    throw new Error('Onboarding failed after login. DOM/CSS snapshot: ' + JSON.stringify(guidedDiagnostic) +
      ' | page errors: ' + JSON.stringify(errors) +
      ' | console errors: ' + JSON.stringify(browserConsoleErrors));
  }
  await page.locator('#guidedStart.is-open').waitFor({ state: 'visible', timeout: 5000 });
  const welcome = await page.locator('#guidedTitle').innerText();
  if (!welcome.includes('Bienvenido, agente')) throw new Error('Welcome modal missing: ' + welcome);
  if (!(await page.locator('#guidedStart').evaluate(el => getComputedStyle(el).display === 'flex' && getComputedStyle(el).visibility === 'visible'))) {
    throw new Error('Welcome modal exists but is not visible');
  }

  // Verify that the dashboard has an explicit welcome and mission CTA.
  const dashboardWelcome = page.getByText('BIENVENIDO A NEXUS CONTROL TOWER', { exact: true });
  await page.locator('#guidedContinue').click();
  await page.locator('#view-misiones').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#guidedContinue').click();
  await page.locator('.answer-entry-panel').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#guidedContinue').click().catch(() => {});

  // Test every field-manual tab by clicking it and asserting that the content panel changes.
  await page.locator('[data-view="manual"]').click();
  await page.locator('#manualContent').waitFor({ state: 'visible', timeout: 10000 });
  const manualCases = [
    ['compras', 'Función de compras y abastecimiento'],
    ['proceso', 'Proceso de compras y principios'],
    ['kpi', 'Indicadores logísticos: OTD y OTIF'],
    ['inventario', 'Inventario y punto de reorden'],
    ['proveedores', 'Evaluación de proveedores'],
    ['organizacion', 'Organización del departamento de compras']
  ];
  for (const [key, expectedTitle] of manualCases) {
    await page.locator('[data-manual="' + key + '"]').click();
    await page.waitForFunction(({ key, expectedTitle }) => {
      const panel = document.querySelector('#manualContent');
      return panel?.dataset.loadedSection === key && panel.querySelector('h2')?.textContent === expectedTitle;
    }, { key, expectedTitle });
    const panelText = await page.locator('#manualContent').innerText();
    if (!panelText.includes(expectedTitle)) throw new Error('Manual tab failed: ' + key + ' => ' + panelText);
  }

  // Return to the mission and resume the normal answer-entry smoke test.
  await page.locator('[data-view="misiones"]').click();
  await page.locator('.answer-entry-panel').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('.answer-entry-panel').waitFor({ state: 'visible', timeout: 10000 }).catch(async error => { console.error('ANSWER_PANEL_DEBUG', JSON.stringify(await page.evaluate(() => ({title:document.querySelector('#challengeTitle')?.textContent,areaDisplay:getComputedStyle(document.querySelector('#challengeArea')).display,inputsHtml:document.querySelector('#challengeInputs')?.innerHTML,reference:document.querySelector('#missionReference')?.innerText,bodyEnd:document.body.innerText.slice(-1800)}))), 'PAGE_ERRORS', JSON.stringify(errors)); throw error; });
  await page.locator('.answer-option').first().waitFor({ state: 'visible', timeout: 10000 });
  const moduleInstructions = await page.locator('#missionReference').innerText();
  const answerHeading = await page.locator('.answer-entry-panel').innerText();
  const optionCount = await page.locator('.answer-option').count();
  if (!moduleInstructions.includes('INSTRUCCIONES DETALLADAS') || !moduleInstructions.includes('PASO 2 · ENTREGA TU RESPUESTA') || !moduleInstructions.includes('¿Te equivocaste?')) {
    throw new Error('Module directions/return instructions missing: ' + moduleInstructions);
  }
  if (!answerHeading.includes('Selecciona tu respuesta') || optionCount !== 4) {
    throw new Error('Visible choice field missing: ' + JSON.stringify({answerHeading, optionCount}));
  }
  const solveCurrentMultipleChoice = async () => {
    const count = await page.locator('.answer-option').count();
    for (let choice = 0; choice < count; choice++) {
      await page.locator('.answer-option').nth(choice).click();
      await page.locator('#submitAnswer').click();
      await page.locator('#challengeFeedback').waitFor({ state: 'visible', timeout: 10000 });
      const outcome = await page.evaluate(() => ({
        correct: document.querySelector('#challengeFeedback')?.classList.contains('success'),
        incorrect: document.querySelector('#challengeFeedback')?.classList.contains('error'),
        message: document.querySelector('#challengeFeedback')?.textContent?.trim()
      }));
      if (outcome.correct) {
        await page.locator('#nextChallenge').waitFor({ state: 'visible', timeout: 10000 });
        return;
      }
      if (!outcome.incorrect) throw new Error('Answer was not evaluated: ' + JSON.stringify(outcome));
    }
    throw new Error('None of the displayed options validated as correct for ' + await page.locator('#challengeTitle').innerText());
  };
  for (let challenge = 0; challenge < 4; challenge++) {
    await page.locator('.answer-entry-panel').waitFor({ state: 'visible', timeout: 10000 });
    await solveCurrentMultipleChoice();
    if (challenge < 3) await page.locator('#nextChallenge').click();
  }
  await page.locator('#nextChallenge').click();
  await page.locator('#numericAnswer').waitFor({ state: 'visible', timeout: 10000 });
  const calcPanel = await page.locator('.answer-entry-panel').innerText();
  if (!calcPanel.includes('Tu respuesta') || !(await page.locator('#numericAnswer').isVisible())) {
    throw new Error('Visible numeric response field missing: ' + calcPanel);
  }
  await page.locator('#numericAnswer').fill('36420');
  await page.locator('#submitAnswer').click();
  await page.locator('#nextChallenge').waitFor({ state: 'visible', timeout: 10000 });
  const result = await page.evaluate(() => ({
    loginName: document.querySelector('#topName')?.textContent?.trim(),
    answerPanel: !!document.querySelector('.answer-entry-panel'),
    numericInput: !!document.querySelector('#numericAnswer'),
    numericValue: document.querySelector('#numericAnswer')?.value,
    optionCount: document.querySelectorAll('.answer-option').length,
    moduleStep: document.querySelector('#missionReference')?.innerText?.includes('PASO 1 · INSTRUCCIONES DETALLADAS'),
    answerStep: document.querySelector('.answer-entry-panel')?.innerText?.includes('PASO 2 · ENTREGA TU RESPUESTA'),
    nextVisible: getComputedStyle(document.querySelector('#nextChallenge')).display !== 'none',
    feedback: document.querySelector('#challengeFeedback')?.textContent?.trim()
  }));
  if (!result.answerPanel || !result.numericInput || result.numericValue !== '36420' || !result.moduleStep || !result.answerStep || !result.nextVisible) {
    throw new Error('Challenge workflow incomplete: ' + JSON.stringify(result));
  }
  await page.locator('[data-view="proveedores"]').click();
  const expectedDecisions = ['Plan de mejora', 'Aprobado', 'Plan de mejora', 'Aprobado', 'Plan de mejora'];
  for (let i = 0; i < expectedDecisions.length; i++) {
    await page.locator('.supplier-choice').nth(i).selectOption(expectedDecisions[i]);
  }
  const scorecardLive = await page.evaluate(() => ({
    correctCount: document.querySelector('#supplierCorrectCount')?.textContent,
    points: document.querySelector('#supplierScorecardPoints')?.textContent,
    rowFeedback: [...document.querySelectorAll('[id^="supplierChoiceFeedback-"]')].map(el => el.textContent),
    locked: document.querySelector('#supplierAppliedStage')?.classList.contains('hidden')
  }));
  if (scorecardLive.correctCount !== '5/5 correctas' || scorecardLive.points !== '50 de 50 puntos' || !scorecardLive.locked) {
    throw new Error('Scorecard live feedback or pre-validation lock failed: ' + JSON.stringify(scorecardLive));
  }
  await page.locator('#validateSupplierDecisions').click();
  await page.locator('#supplierAppliedStage').waitFor({ state: 'visible', timeout: 10000 });
  const scorecardUnlocked = await page.evaluate(() => ({
    locked: document.querySelector('#supplierAppliedStage')?.classList.contains('hidden'),
    status: document.querySelector('#supplierAppliedStatus')?.textContent
  }));
  if (scorecardUnlocked.locked || !scorecardUnlocked.status?.includes('DESBLOQUEADA')) {
    throw new Error('Correct scorecard did not unlock applied stage: ' + JSON.stringify(scorecardUnlocked));
  }
  const quoteStart = await page.evaluate(() => ({
    north: document.querySelector('#quoteNorthTotal')?.textContent,
    center: document.querySelector('#quoteCenterTotal')?.textContent
  }));
  if (!quoteStart.north?.includes('96,550') || !quoteStart.center?.includes('95,360')) {
    throw new Error('Supplier totals did not calculate live: ' + JSON.stringify(quoteStart));
  }
  await page.locator('#chosenQuote').selectOption('Centro');
  await page.locator('#supplierSavingsAnswer').fill('1190');
  await page.locator('#validateSupplierApplied').click();
  await page.locator('#supplierCostResult').waitFor({ state: 'visible', timeout: 10000 });
  const applied = await page.evaluate(() => ({
    feedback: document.querySelector('#supplierAppliedFeedback')?.textContent,
    missionNumber: document.querySelector('#supplierMissionAnswer')?.textContent,
    appliedStatus: document.querySelector('#supplierAppliedStatus')?.textContent
  }));
  if (!applied.feedback?.includes('correcto') || !applied.missionNumber?.includes('1190') || applied.appliedStatus !== 'VALIDADO') {
    throw new Error('Applied supplier challenge did not validate: ' + JSON.stringify(applied));
  }
  await page.locator('#quoteCenterPrice').fill('193');
  const changedQuote = await page.evaluate(() => ({
    center: document.querySelector('#quoteCenterTotal')?.textContent,
    resultHidden: document.querySelector('#supplierCostResult')?.classList.contains('hidden')
  }));
  if (!changedQuote.center?.includes('95,840') || !changedQuote.resultHidden) {
    throw new Error('Cost totals did not update or result did not relock after changing quote: ' + JSON.stringify(changedQuote));
  }
  await page.locator('#quoteCenterPrice').fill('192');
  if (errors.length) throw new Error('Browser JavaScript errors: ' + JSON.stringify({pageErrors: errors, consoleErrors: browserConsoleErrors}));
  console.log('NEXUS_LOGIN_ANSWER_SUPPLIER_STAGES_PASS', JSON.stringify({url, ...result, scorecardLive, scorecardUnlocked, quoteStart, applied, changedQuote, pageErrors: errors, browserConsoleErrors}));
} finally {
  await browser.close();
}
