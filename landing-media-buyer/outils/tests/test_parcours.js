/* Tests de bout en bout de la landing (Chromium / Playwright).
   Prérequis : serveur local lancé (python3 outils/tests/serveur_local.py 8765).
   usage : node outils/tests/test_parcours.js [dossier_captures]
   Le webhook Make est intercepté : aucune donnée n’est envoyée à Make pendant les tests. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8765/';
const SHOTS = process.argv[2] || path.join(__dirname, 'captures');
fs.mkdirSync(SHOTS, { recursive: true });
const NETLIFY_LOG = path.join(__dirname, 'netlify_posts.jsonl');
let failures = 0, passes = 0;
function ok(cond, msg) { if (cond) { passes++; console.log('  ✓ ' + msg); } else { failures++; console.log('  ✗ ' + msg); } }

async function newPage(browser, opts) {
  const ctx = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1, locale: 'fr-FR', timezoneId: 'Indian/Antananarivo' }, opts || {}));
  const page = await ctx.newPage();
  page._logs = [];
  page.on('console', m => { if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(m.text())) page._logs.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => page._logs.push('pageerror: ' + e.message));
  return { ctx, page };
}
async function mockMake(page, mode) {
  const calls = [];
  await page.route('https://hook.eu1.make.com/**', async route => {
    const body = route.request().postData() || '';
    calls.push(Object.fromEntries(new URLSearchParams(body)));
    if (mode === 'fail') return route.abort('internetdisconnected');
    if (mode === 'opaque') return route.fulfill({ status: 200, contentType: 'text/plain', body: 'Accepted' });
    const p = Object.fromEntries(new URLSearchParams(body));
    return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: JSON.stringify({ ok: true, id: p.id }) });
  });
  return calls;
}
async function active(page) {
  return page.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.name || a.className || a.tagName) + '|' + (a.value || a.textContent || '').trim().slice(0, 40) : ''; });
}
async function tabTo(page, test, max = 40) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate(test);
    if (hit) return true;
  }
  return false;
}
const isName = n => new Function('return document.activeElement && document.activeElement.name === ' + JSON.stringify(n));
const isId = id => new Function('return document.activeElement && document.activeElement.id === ' + JSON.stringify(id));

(async () => {
  const browser = await chromium.launch();
  try { fs.unlinkSync(NETLIFY_LOG); } catch (e) { /* rien */ }

  /* ---------------------------------------------------------------- A. parcours complet au clavier (ordinateur) */
  console.log('A. Parcours complet au clavier, ordinateur 1280 px');
  {
    const { ctx, page } = await newPage(browser);
    const calls = await mockMake(page, 'ok');
    await page.goto(BASE + '?utm_source=facebook&utm_medium=cpc&utm_campaign=media-buyer-nov', { waitUntil: 'networkidle' });
    await page.keyboard.press('Tab');
    ok(/Aller directement au formulaire/.test(await active(page)), 'Le premier Tab atteint le lien d’évitement');
    await page.keyboard.press('Enter');
    ok(await tabTo(page, isName('prenom'), 15), 'Depuis le lien d’évitement, Tab mène au champ Prénom');
    const tStart = Date.now();

    // validation à vide
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    const errs = await page.$$eval('.step.is-active .error', els => els.filter(e => e.textContent.trim()).length);
    ok(errs === 5, 'Étape 1 vide : 5 messages d’erreur affichés (' + errs + ')');
    ok((await page.getAttribute('#f-prenom', 'aria-invalid')) === 'true', 'Prénom marqué aria-invalid');
    ok(await page.evaluate(isName('prenom')), 'Le focus revient sur le premier champ en erreur');
    await page.screenshot({ path: path.join(SHOTS, 'A1_erreurs_etape1.png') });

    await page.keyboard.type('hanta');
    await page.keyboard.press('Tab'); await page.keyboard.type('rakoto');
    await page.keyboard.press('Tab'); await page.keyboard.type('hanta@gmial.com');
    await page.waitForTimeout(700);
    await page.keyboard.press('Tab');
    ok(await page.isVisible('#email-suggestion'), 'Suggestion de correction de l’e-mail affichée');
    ok(/gmail\.com/.test(await page.textContent('#email-suggestion')), 'La suggestion propose gmail.com');
    ok(await page.evaluate(isId('email-fix')), 'Tab atteint le bouton « Corriger »');
    await page.keyboard.press('Enter');
    ok((await page.inputValue('#f-email')) === 'hanta@gmail.com', 'E-mail corrigé en un clic');
    ok((await page.inputValue('#f-prenom')) === 'Hanta' && (await page.inputValue('#f-nom')) === 'Rakoto', 'Prénom et nom remis en majuscules');
    await page.keyboard.press('Tab'); await page.keyboard.type('0341234567');
    await page.keyboard.press('Tab');
    ok((await page.inputValue('#f-whatsapp')) === '034 12 345 67', 'Numéro WhatsApp mis en forme : 034 12 345 67');
    await page.keyboard.type('Antananarivo, Ankorondrano');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(450);
    ok((await page.textContent('.stepper__item.is-current .stepper__label')) === 'Profil', 'Étape 2 affichée');
    ok(await page.evaluate(() => document.activeElement && document.activeElement.id === 't-step2'), 'Le focus est placé sur le titre de l’étape 2');

    // étape 2
    ok(await tabTo(page, isName('profil'), 5), 'Tab atteint le groupe « Vous êtes… »');
    await page.keyboard.press('Space');
    await page.waitForTimeout(100);
    ok(await page.isVisible('#f-entreprise'), 'Le champ entreprise apparaît après le choix du profil');
    ok((await page.textContent('#label-entreprise')).includes('boutique'), 'Libellé adapté au profil e-commerçant');
    ok(await tabTo(page, isName('entreprise'), 5), 'Tab atteint le champ entreprise');
    await page.keyboard.press('Enter'); await page.waitForTimeout(350);
    ok(/Indiquez le nom/.test(await page.textContent('#err-entreprise')), 'Entreprise obligatoire pour un e-commerçant');
    await page.keyboard.type('Boutique Hanta Créations');
    await page.keyboard.press('Tab'); await page.keyboard.type('facebook.com/hantacreations');
    await page.keyboard.press('Enter'); await page.waitForTimeout(450);
    ok((await page.textContent('.stepper__item.is-current .stepper__label')) === 'Niveau', 'Étape 3 affichée');

    // étape 3 : flèches dans les groupes de boutons radio
    ok(await tabTo(page, isName('niveau_meta'), 5), 'Tab atteint « Publicité Meta »');
    await page.keyboard.press('ArrowDown');
    ok((await page.$eval('input[name=niveau_meta]:checked', e => e.value)) === 'boost', 'Flèche bas : « J’ai déjà boosté » sélectionné');
    ok(await page.isVisible('#note-meta'), 'Message personnalisé selon le niveau Meta');
    await page.keyboard.press('Tab'); await page.keyboard.press('Space');
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown'); await page.keyboard.press('ArrowDown');
    const lv = await page.evaluate(() => ['niveau_google', 'tracking', 'ia', 'budget'].map(n => (document.querySelector('input[name=' + n + ']:checked') || {}).value));
    ok(JSON.stringify(lv) === JSON.stringify(['aucune', 'entendu', 'parfois', 'de200a1m']), 'Niveaux choisis au clavier : ' + lv.join(', '));
    await page.screenshot({ path: path.join(SHOTS, 'A2_etape3_niveau.png') });
    await page.keyboard.press('Enter'); await page.waitForTimeout(450);

    // étape 4 : objectif + 3 priorités maximum
    ok(await tabTo(page, isName('objectif'), 5), 'Tab atteint « Votre objectif principal »');
    await page.keyboard.press('Space');
    ok(await page.isVisible('#note-objectif'), 'Message personnalisé selon l’objectif');
    await page.keyboard.press('Tab'); await page.keyboard.press('Space');
    await page.keyboard.press('Tab'); await page.keyboard.press('Space');
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); await page.keyboard.press('Space');
    const dis = await page.$$eval('input[name=attentes]', els => els.filter(e => e.disabled).length);
    ok(dis === 5, '3 priorités choisies : les 5 autres sont désactivées (' + dis + ')');
    ok(await page.isVisible('#note-attentes'), 'Message « 3 priorités maximum » affiché');
    ok(await tabTo(page, isName('besoins'), 6), 'Tab atteint la zone « Une question… » (les cases désactivées sont sautées)');
    await page.keyboard.type('Je voudrais savoir si on travaille sur notre propre page.');
    ok(await tabTo(page, isId('btn-next'), 4), 'Tab atteint « Continuer »');
    await page.keyboard.press('Enter'); await page.waitForTimeout(450);

    // étape 5
    ok((await page.textContent('.stepper__item.is-current .stepper__label')) === 'Logistique', 'Étape 5 affichée');
    ok(await tabTo(page, isName('presence'), 5), 'Tab atteint la case de présence');
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab'); await page.keyboard.press('Space');                 // ordinateur : oui
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');             // visa : à activer sur place
    await page.keyboard.press('Tab');
    ok(await page.evaluate(isName('source')), 'Tab atteint « Comment avez-vous connu… »');
    ok((await page.inputValue('#f-source')) === 'facebook', 'Source pré-remplie depuis utm_source=facebook');
    await page.keyboard.press('Tab'); // facture
    await page.keyboard.press('Tab'); await page.keyboard.press('ArrowDown');             // acompte : déjà réglé
    await page.waitForTimeout(150);
    ok(await page.isVisible('#bloc-acompte-paye'), 'Champs de l’acompte réglé affichés');
    ok((await page.inputValue('#f-operateur')) === 'MVola', 'Service pré-rempli « MVola » d’après le numéro 034');
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab');
    await page.keyboard.type('MP241114.1022.A12345');
    const img = path.join(__dirname, '..', '..', 'site', 'assets', 'img', 'classe-640.webp');
    await page.setInputFiles('#f-capture', img);
    await page.waitForSelector('#upload-preview:not([hidden])', { timeout: 5000 });
    ok(true, 'Capture du transfert ajoutée et compressée (aperçu affiché)');
    ok(await tabTo(page, isName('consent'), 6), 'Tab atteint la case de consentement');
    await page.keyboard.press('Space');
    ok(await tabTo(page, isId('btn-next'), 4), 'Tab atteint « Vérifier mes réponses »');
    ok(/Vérifier mes réponses/.test(await page.textContent('#btn-next')), 'Libellé « Vérifier mes réponses » sur la dernière étape');
    await page.keyboard.press('Enter'); await page.waitForTimeout(450);

    // vérification
    const review = await page.textContent('#review');
    ok(/hanta@gmail\.com/.test(review) && /\+261 34 12 345 67/.test(review) && /Boutique Hanta/.test(review), 'Récapitulatif complet (e-mail, WhatsApp, entreprise)');
    ok(/MVola/.test(review) && /capture jointe/.test(review), 'Récapitulatif : acompte réglé avec capture');
    await page.screenshot({ path: path.join(SHOTS, 'A3_verification.png'), fullPage: false });
    ok(await tabTo(page, isId('btn-submit'), 12), 'Tab atteint « Envoyer ma candidature »');
    const wait = 16500 - (Date.now() - tStart); if (wait > 0) await page.waitForTimeout(wait);   // un humain met plus de 15 s
    await page.keyboard.press('Enter');
    await page.waitForSelector('#success:not([hidden])', { timeout: 10000 });
    await page.waitForTimeout(400);
    ok(await page.evaluate(isId('success-titre')), 'Après l’envoi, le focus est sur le titre de confirmation');
    const ref = (await page.textContent('.ticket__ref')).trim();
    ok(/^MB-[A-Z2-9]{6}$/.test(ref), 'Référence affichée : ' + ref);
    await page.screenshot({ path: path.join(SHOTS, 'A4_confirmation.png') });

    // contenu envoyé à Make
    ok(calls.length === 1, 'Une seule requête envoyée à Make (' + calls.length + ')');
    const p = calls[0] || {};
    const expect = {
      action: 'inscription', id: ref, prenom: 'Hanta', nom: 'Rakoto', email: 'hanta@gmail.com', whatsapp: '+261 34 12 345 67', wa: '261341234567',
      ville: 'Antananarivo, Ankorondrano', profil: 'ecommerce', profil_label: 'E-commerçant(e)', entreprise: 'Boutique Hanta Créations',
      niveau_meta: 'boost', niveau_meta_label: 'J’ai déjà boosté des publications', niveau_google_label: 'Je ne connais pas encore',
      tracking_label: 'J’en ai entendu parler', ia_label: 'De temps en temps', budget_label: 'De 200 000 à 1 000 000 Ar',
      objectif: 'vendre', objectif_label: 'Vendre plus avec mon activité', attentes_label: 'Meta Ads rentables · Visibilité sur Google Ads · Lire les KPI et décider',
      presence: 'oui', laptop: 'oui', laptop_label: 'Oui', visa: 'activation', visa_label: 'À activer sur place', source_label: 'Facebook',
      facture_label: 'Non', acompte: 'paye', acompte_operateur: 'MVola', acompte_ref: 'MP241114.1022.A12345', consent: 'oui',
      utm: 'facebook / cpc / media-buyer-nov', page_url: BASE, priorite: 'Prioritaire'
    };
    const bad = Object.keys(expect).filter(k => p[k] !== expect[k]);
    ok(bad.length === 0, 'Champs attendus par le scénario Make : tous conformes' + (bad.length ? ' — écarts : ' + bad.map(k => k + '=' + JSON.stringify(p[k])).join(', ') : ''));
    ok(Number(p.t_fill) >= 15, 't_fill numérique ≥ 15 s (filtre anti-robot de Make) : ' + p.t_fill);
    ok(!('adresse_complete' in p), 'Champ piège absent quand il est vide');
    ok(p.capture_b64 && p.capture_b64.length > 1000 && !/^data:/.test(p.capture_b64), 'Capture envoyée en base64 brut (' + Math.round((p.capture_b64 || '').length / 1024) + ' Ko)');
    ok(Number(p.score) >= 60, 'Score calculé : ' + p.score);
    const netl = fs.existsSync(NETLIFY_LOG) ? fs.readFileSync(NETLIFY_LOG, 'utf8').trim().split('\n').map(JSON.parse) : [];
    ok(netl.length === 1 && netl[0].body['form-name'] === 'inscription-media-buyer' && netl[0].body.id === ref, 'Copie de secours envoyée à Netlify Forms');
    ok(netl.length === 1 && !('capture_b64' in netl[0].body), 'La copie Netlify n’embarque pas l’image');
    ok(await page.evaluate(() => !localStorage.getItem('cassivi-mb-brouillon-v1') && !!localStorage.getItem('cassivi-mb-candidature-v1')), 'Brouillon effacé, candidature mémorisée sur l’appareil');
    ok(page._logs.length === 0, 'Aucune erreur console ni blocage CSP' + (page._logs.length ? ' : ' + page._logs.join(' | ') : ''));

    // fichier agenda
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-ics]')]);
    const icsPath = path.join(SHOTS, 'agenda.ics'); await dl.saveAs(icsPath);
    const ics = fs.readFileSync(icsPath, 'utf8');
    ok(/DTSTART:20261128T050000Z/.test(ics) && /DTSTART:20261130T050000Z/.test(ics) && (ics.match(/BEGIN:VEVENT/g) || []).length === 2, 'Fichier .ics : deux journées, 8h heure de Madagascar');
    ok(ics.split('\r\n').every(l => Buffer.byteLength(l, 'utf8') <= 75), 'Fichier .ics : lignes repliées à 75 octets');

    // retour sur la page après candidature
    await page.goto(BASE, { waitUntil: 'networkidle' });
    ok(await page.isVisible('#notice-deja'), 'Au retour, rappel « Vous avez déjà envoyé une candidature »');
    await ctx.close();
  }

  /* ---------------------------------------------------------------- B. mobile : vidéo, barre d’action, images, brouillon */
  console.log('B. Mobile 390 px : vidéo, barre d’action, images, brouillon');
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await mockMake(page, 'ok');
    await page.goto(BASE, { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= 390, 'Pas de défilement horizontal (largeur ' + sw + ')');
    const ctaBox = await page.locator('.hero__ctas .btn--primary').boundingBox();
    ok(ctaBox && ctaBox.y + ctaBox.height <= 844, 'Bouton « Déposer ma candidature » visible sans défiler (bas à ' + Math.round(ctaBox.y + ctaBox.height) + ' px)');
    ok(!(await page.evaluate(() => document.getElementById('sticky-cta').classList.contains('is-visible'))), 'Barre d’action masquée en haut de page');
    await page.evaluate(() => window.scrollTo(0, document.querySelector('#programme').offsetTop + 200));
    await page.waitForTimeout(500);
    ok(await page.evaluate(() => document.getElementById('sticky-cta').classList.contains('is-visible')), 'Barre d’action visible dans le programme');
    await page.evaluate(() => window.scrollTo(0, document.querySelector('#candidature').offsetTop + 100));
    await page.waitForTimeout(500);
    ok(!(await page.evaluate(() => document.getElementById('sticky-cta').classList.contains('is-visible'))), 'Barre d’action masquée pendant le formulaire');
    // images différées
    for (const sel of ['#programme', '#pour-qui']) { await page.evaluate(s => document.querySelector(s).scrollIntoView(), sel); await page.waitForTimeout(600); }
    const imgs = await page.$$eval('main img:not(#upload-img)', els => els.map(e => ({ src: e.currentSrc.split('/').pop(), ok: e.complete && e.naturalWidth > 0 })));
    ok(imgs.every(i => i.ok), 'Toutes les images se chargent : ' + imgs.map(i => i.src + (i.ok ? '' : ' (KO)')).join(', '));
    // vidéo
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('[data-open-video]');
    await page.waitForTimeout(600);
    ok(await page.evaluate(() => document.getElementById('video-dialog').open), 'La vidéo s’ouvre dans une fenêtre');
    const vstate = await page.evaluate(() => { const v = document.getElementById('video-player'); return { src: v.currentSrc.split('/').pop(), err: v.error && v.error.code }; });
    ok(vstate.src === 'media-buyer-4x5.mp4' && !vstate.err, 'Vidéo chargée sans erreur (' + vstate.src + ')');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    ok(!(await page.evaluate(() => document.getElementById('video-dialog').open)), 'Échap ferme la vidéo');
    // brouillon
    await page.fill('#f-prenom', 'Lova'); await page.fill('#f-nom', 'Randria'); await page.fill('#f-email', 'lova@example.com');
    await page.fill('#f-whatsapp', '+261 32 11 222 33'); await page.fill('#f-ville', 'Antananarivo');
    await page.click('#btn-next'); await page.waitForTimeout(500);
    await page.click('text=Community manager'); await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SHOTS, 'B1_mobile_etape2.png') });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    ok(await page.isVisible('#notice-brouillon'), 'Après rechargement : réponses retrouvées (message affiché)');
    ok((await page.inputValue('#f-prenom')) === 'Lova' && await page.isChecked('input[name=profil][value=cm]'), 'Champs restaurés (prénom, profil)');
    ok((await page.textContent('.stepper__item.is-current .stepper__label')) === 'Profil' || (await page.textContent('#step-status')).includes('Étape 2'), 'Reprise directement à l’étape 2');
    ok(!(await page.evaluate(() => document.getElementById('f-entreprise').required)), 'Entreprise facultative pour un community manager');
    ok(page._logs.length === 0, 'Aucune erreur console ni blocage CSP' + (page._logs.length ? ' : ' + page._logs.join(' | ') : ''));
    await ctx.close();
  }

  /* ---------------------------------------------------------------- C. lien des e-mails : instructions de paiement */
  console.log('C. Lien « instructions de paiement » des e-mails');
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 390, height: 844 } });
    await page.goto(BASE + '?ref=MB-7K3Q9P#paiement', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    ok(await page.isVisible('#paiement'), 'Panneau de paiement affiché');
    ok(/MB-7K3Q9P/.test(await page.textContent('#paiement')), 'Référence reprise dans le panneau');
    ok(/Recevoir le numéro Mobile Money/.test(await page.textContent('#paiement')), 'Sans numéros configurés : demande du numéro sur WhatsApp');
    const wa = await page.getAttribute('#paiement a.btn--wa', 'href');
    ok(/wa\.me\/261375975512\?text=.*MB-7K3Q9P/.test(decodeURIComponent(wa)), 'Message WhatsApp pré-rempli avec la référence');
    await page.screenshot({ path: path.join(SHOTS, 'C1_paiement_sans_numeros.png') });
    await ctx.close();

    const b = await newPage(browser, { viewport: { width: 390, height: 844 } });
    await b.page.route('**/config.js*', async route => {
      const r = await route.fetch(); let t = await r.text();
      t = t.replace("mobileMoney: [", "mobileMoney: [{ service: 'MVola', numero: '034 00 000 01', titulaire: 'CASSIVI DIGITAL MG' }, { service: 'Orange Money', numero: '032 00 000 02', titulaire: 'CASSIVI DIGITAL MG' },");
      route.fulfill({ response: r, body: t });
    });
    await b.page.addInitScript(() => localStorage.setItem('cassivi-mb-candidature-v1', JSON.stringify({ id: 'MB-7K3Q9P', prenom: 'Hanta', nom: 'Rakoto', email: 'h@x.mg', acompte: 'plus_tard', op: 'Orange Money', at: Date.now() })));
    await b.page.goto(BASE + '?ref=MB-7K3Q9P#paiement', { waitUntil: 'networkidle' });
    await b.page.waitForTimeout(300);
    const items = await b.page.$$eval('#paiement .mm li', els => els.map(e => e.textContent));
    ok(items.length === 2 && /034 00 000 01/.test(items[0]), 'Numéros Mobile Money de config.js affichés');
    ok(/Conseillé/.test(items[1]), 'Orange Money conseillé pour un numéro 032');
    ok(/Bonjour Hanta/.test(await b.page.textContent('#paiement')), 'Accueil personnalisé (candidature mémorisée)');
    await b.page.screenshot({ path: path.join(SHOTS, 'C2_paiement_avec_numeros.png') });
    await b.ctx.close();
  }

  /* ---------------------------------------------------------------- D. échec d’envoi puis nouvel essai */
  console.log('D. Échec réseau, puis nouvel essai');
  {
    const { ctx, page } = await newPage(browser, { viewport: { width: 1280, height: 860 } });
    let mode = 'fail';
    const calls = [];
    await page.route('https://hook.eu1.make.com/**', route => { calls.push(1); return mode === 'fail' ? route.abort('internetdisconnected') : route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: '{"ok":true}' }); });
    await page.route(BASE, route => route.request().method() === 'POST' && mode === 'fail' ? route.abort('internetdisconnected') : route.continue());
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      const set = (n, v) => document.querySelectorAll('[name="' + n + '"]').forEach(e => { if (e.type === 'radio' || e.type === 'checkbox') e.checked = Array.isArray(v) ? v.includes(e.value) : e.value === v; else e.value = v; });
      set('prenom', 'Test'); set('nom', 'Echec'); set('email', 'test@example.com'); set('whatsapp', '0331122233'); set('ville', 'Tana');
      set('profil', 'salarie'); set('niveau_meta', 'jamais'); set('niveau_google', 'aucune'); set('tracking', 'non'); set('ia', 'jamais'); set('budget', 'aucun');
      set('objectif', 'poste'); set('attentes', ['kpi']); set('presence', 'oui'); set('laptop', 'non'); set('visa', 'oui'); set('source', 'bouche'); set('acompte', 'plus_tard'); set('consent', 'oui');
      document.getElementById('form-candidature').dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.evaluate(() => { window.__start = Date.now(); });
    for (let i = 0; i < 5; i++) { await page.click('#btn-next'); await page.waitForTimeout(350); }
    ok(await page.isVisible('#btn-submit'), 'Formulaire rempli, étape de vérification atteinte');
    await page.click('#btn-submit');
    await page.waitForSelector('#send-error:not([hidden])', { timeout: 10000 });
    ok(true, 'Message d’erreur affiché si Make et Netlify sont injoignables');
    ok(await page.isVisible('#send-error a.btn--wa'), 'Solution de secours : candidature par WhatsApp pré-remplie');
    await page.screenshot({ path: path.join(SHOTS, 'D1_erreur_envoi.png') });
    mode = 'ok';
    await page.click('#retry');
    await page.waitForSelector('#success:not([hidden])', { timeout: 10000 });
    ok(true, 'Le nouvel essai aboutit');
    ok(/Recevoir le numéro Mobile Money/.test(await page.textContent('#success')), 'Acompte à régler : instructions de paiement sur l’écran de confirmation');
    ok(/indispensable/.test(await page.textContent('#success')), 'Rappel personnalisé : pas d’ordinateur portable');
    ok(page._logs.filter(l => !/ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(l)).length === 0, 'Aucune erreur inattendue');
    await ctx.close();
  }

  /* ---------------------------------------------------------------- E. inscriptions closes */
  console.log('E. Inscriptions closes après la date limite');
  {
    const { ctx, page } = await newPage(browser);
    await page.route('**/config.js*', async route => {
      const r = await route.fetch(); const t = (await r.text()).replace("clotureInscriptions: '2026-11-28T08:00:00+03:00'", "clotureInscriptions: '2026-11-01T08:00:00+03:00'");
      route.fulfill({ response: r, body: t });
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    ok(await page.isHidden('#form-candidature') && await page.isVisible('#closed'), 'Formulaire remplacé par le message « Inscriptions closes »');
    await ctx.close();
  }

  await browser.close();
  console.log('\n' + passes + ' vérifications réussies, ' + failures + ' en échec.');
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
