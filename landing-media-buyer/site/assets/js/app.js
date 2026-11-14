/* CASSIVI DIGITAL MG · Landing « Formation Media Buyer pilotée par l’IA »
   Questionnaire multi-étapes, validation, sauvegarde locale, envoi vers Make (+ copie Netlify Forms),
   écran de réussite personnalisé, instructions de paiement, agenda, compte à rebours, vidéo. */
(function () {
  'use strict';

  var DEFAULTS = {
    webhookUrl: '', whatsapp: '261375975512', whatsappAffiche: '+261 37 59 755 12', email: 'cassividigitalmg@gmail.com',
    debut: '2026-11-28T08:00:00+03:00', clotureInscriptions: '2026-11-28T08:00:00+03:00',
    prix: 350000, acompte: 50000, solde: 300000, mobileMoney: [], metaPixelId: '', ga4Id: '', netlifyForms: true
  };
  var CFG = Object.assign({}, DEFAULTS, window.CASSIVI_CONFIG || {});
  var LIEU = 'Antsakaviro, à droite du centre de thèse de la faculté de médecine, Antananarivo';
  var KEYS = { draft: 'cassivi-mb-brouillon-v1', sub: 'cassivi-mb-candidature-v1', utm: 'cassivi-mb-utm-v1' };

  /* ------------------------------------------------------------ utilitaires */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NBSP = '\u00a0', NNBSP = '\u202f';
  function fr(s) {
    return String(s)
      .replace(/ ([?!;])/g, NNBSP + '$1').replace(/ :/g, NBSP + ':')
      .replace(/« /g, '«' + NBSP).replace(/ »/g, NBSP + '»')
      .replace(/\d{1,3}(?: \d{3})+(?= Ar\b)/g, function (m) { return m.replace(/ /g, NNBSP); })
      .replace(/(\d) (Ar|min)\b/g, '$1' + NBSP + '$2');
  }
  function ar(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NNBSP) + NBSP + 'Ar'; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function h(s) { return esc(fr(s)); }
  function icon(id, cls) { return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; }
  var store = {
    get: function (k) { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* idem */ } }
  };
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function waLink(text) { return 'https://wa.me/' + CFG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function scrollToEl(el, offset) {
    var top = el.getBoundingClientRect().top + window.pageYOffset - (offset || 88);
    window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion ? 'auto' : 'smooth' });
  }
  function settle(p) {
    return p.then(function (v) { return { ok: true, value: v }; }, function (e) { return { ok: false, error: e }; });
  }
  function fetchTimeout(url, opts, ms) {
    if (typeof AbortController === 'undefined') return fetch(url, opts);
    var ctrl = new AbortController(); var t = setTimeout(function () { ctrl.abort(); }, ms);
    opts.signal = ctrl.signal;
    return fetch(url, opts).then(function (r) { clearTimeout(t); return r; }, function (e) { clearTimeout(t); throw e; });
  }
  function copyText(text, btn) {
    function done() {
      if (!btn) return;
      var label = btn.querySelector('.copy-btn__label');
      btn.classList.add('is-done'); if (label) label.textContent = 'Copié';
      setTimeout(function () { btn.classList.remove('is-done'); if (label) label.textContent = 'Copier'; }, 2200);
      announce('Copié dans le presse-papiers');
    }
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, fallback); } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* rien */ }
      document.body.removeChild(ta);
    }
  }
  function copyBtn(text, label) {
    return '<button type="button" class="copy-btn" data-copy="' + esc(text) + '">' + icon('copy') +
      '<span class="copy-btn__label">Copier</span><span class="sr-only"> ' + esc(label) + '</span></button>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (b) { e.preventDefault(); copyText(b.getAttribute('data-copy'), b); }
  });
  var liveEl;
  function announce(msg) { if (!liveEl) liveEl = $('#form-live'); if (!liveEl) return; liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = fr(msg); }, 60); }

  /* ------------------------------------------------------------ mesure d’audience (facultative) */
  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }
  function initAnalytics() {
    if (CFG.ga4Id) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', CFG.ga4Id);
      loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.ga4Id));
    }
    if (CFG.metaPixelId) {
      var n = window.fbq = function () { if (n.callMethod) n.callMethod.apply(n, arguments); else n.queue.push(arguments); };
      if (!window._fbq) window._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      window.fbq('init', CFG.metaPixelId); window.fbq('track', 'PageView');
      loadScript('https://connect.facebook.net/en_US/fbevents.js');
    }
    if (CFG.ga4Id || CFG.metaPixelId) { var m = $('#mention-mesure'); if (m) m.hidden = false; }
  }
  function track(name, params) {
    try {
      if (window.gtag) window.gtag('event', name, params || {});
      if (window.fbq) {
        if (name === 'generate_lead') window.fbq('track', 'Lead', { content_name: 'Formation Media Buyer' });
        else window.fbq('trackCustom', name, params || {});
      }
    } catch (e) { /* mesure non bloquante */ }
  }

  /* ------------------------------------------------------------ provenance (UTM) */
  var UTM = (function () {
    var p = new URLSearchParams(window.location.search), u = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
      var v = p.get(k); if (v) u[k] = v.slice(0, 80);
    });
    if (p.get('fbclid')) u.fbclid = 1;
    if (p.get('gclid')) u.gclid = 1;
    var ref = '';
    try { if (document.referrer && new URL(document.referrer).host !== window.location.host) ref = new URL(document.referrer).hostname; } catch (e) { /* rien */ }
    if (ref) u.referrer = ref;
    if (Object.keys(u).length) { store.set(KEYS.utm, u); return u; }
    return store.get(KEYS.utm) || {};
  })();
  function utmString() {
    var parts = [UTM.utm_source, UTM.utm_medium, UTM.utm_campaign, UTM.utm_content].filter(Boolean);
    if (parts.length) return parts.join(' / ');
    if (UTM.fbclid) return 'facebook (lien publicitaire)';
    if (UTM.gclid) return 'google (lien publicitaire)';
    if (UTM.referrer) return 'site référent : ' + UTM.referrer;
    return 'direct';
  }

  /* ------------------------------------------------------------ compte à rebours */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function initCountdown() {
    var els = $$('[data-countdown]'); if (!els.length) return;
    var target = Date.parse(CFG.debut);
    function tick() {
      var d = target - Date.now();
      els.forEach(function (el) {
        if (isNaN(target)) { el.parentNode.hidden = true; return; }
        if (d <= 0) { el.parentNode.hidden = true; return; }
        var days = Math.floor(d / 864e5), hours = Math.floor((d % 864e5) / 36e5), mins = Math.floor((d % 36e5) / 6e4);
        el.innerHTML = (days > 0 ? '<b>' + days + '</b>' + NBSP + 'j ' : '') + '<b>' + pad(hours) + '</b>' + NBSP + 'h ' + '<b>' + pad(mins) + '</b>' + NBSP + 'min';
      });
    }
    tick(); setInterval(tick, 20000);
  }

  /* ------------------------------------------------------------ vidéo */
  function initVideo() {
    var dlg = $('#video-dialog'), video = $('#video-player');
    if (!dlg || !video) return;
    $$('[data-open-video]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (typeof dlg.showModal !== 'function') return;     // ancien navigateur : le lien ouvre la vidéo
        e.preventDefault(); dlg.showModal();
        var p = video.play(); if (p && p.catch) p.catch(function () { /* lecture manuelle */ });
        track('video_play');
      });
    });
    $('#video-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { video.pause(); });
  }

  /* ------------------------------------------------------------ barre d’action mobile */
  function initStickyCta() {
    var bar = $('#sticky-cta');
    if (!bar || !('IntersectionObserver' in window)) return;
    var zones = [$('.hero'), $('#candidature'), $('.final'), $('#paiement')].filter(Boolean), seen = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[zones.indexOf(en.target)] = en.isIntersecting && !en.target.hidden; });
      bar.classList.toggle('is-visible', !seen.some(Boolean));
    }, { threshold: 0 });
    zones.forEach(function (z, i) { seen[i] = i === 0; io.observe(z); });
  }

  /* ------------------------------------------------------------ téléphone et e-mail */
  var OPERATEURS = { '32': 'Orange Money', '37': 'Orange Money', '33': 'Airtel Money', '34': 'MVola', '38': 'MVola' };
  function normPhone(raw) {
    var s = String(raw || '').trim();
    if (!s) return null;
    var intl = /^\s*(\+|00)/.test(s);
    var d = s.replace(/\D/g, '');
    if (/^00/.test(s.replace(/[^\d+]/g, ''))) d = d.replace(/^00/, '');
    if (d.indexOf('261') === 0 && (intl || d.length === 12)) d = d.slice(3);
    else if (intl) {
      if (d.length >= 8 && d.length <= 15) return { wa: d, display: '+' + d, local: '+' + d, mg: false, op: '' };
      return null;
    } else if (d.charAt(0) === '0') d = d.slice(1);
    if (/^3[2-9]\d{7}$/.test(d)) {
      return {
        wa: '261' + d, mg: true, op: OPERATEURS[d.slice(0, 2)] || '',
        display: '+261 ' + d.slice(0, 2) + ' ' + d.slice(2, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7),
        local: '0' + d.slice(0, 2) + ' ' + d.slice(2, 4) + ' ' + d.slice(4, 7) + ' ' + d.slice(7)
      };
    }
    return null;
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var DOMAINES = ['gmail.com', 'yahoo.fr', 'yahoo.com', 'hotmail.com', 'hotmail.fr', 'outlook.com', 'outlook.fr', 'live.fr', 'live.com', 'icloud.com', 'orange.mg', 'moov.mg'];
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 0; j <= n; j++) { d[0][j] = j; }
    for (i = 1; i <= m; i++) {
      for (j = 1; j <= n; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      }
    }
    return d[m][n];
  }
  function emailSuggestion(v) {
    var at = v.lastIndexOf('@'); if (at < 1) return '';
    var dom = v.slice(at + 1).toLowerCase(); if (!dom || DOMAINES.indexOf(dom) > -1) return '';
    var best = '', bestD = 3;
    DOMAINES.forEach(function (c) { var dist = lev(dom, c); if (dist < bestD) { bestD = dist; best = c; } });
    if (!best) {
      var stem = dom.split('.')[0];
      if (['gmail', 'gmial', 'gmal', 'gamil', 'gnail', 'gmaill'].indexOf(stem) > -1) best = 'gmail.com';
    }
    return best ? v.slice(0, at + 1) + best : '';
  }
  function cap(s) {
    s = String(s || '').trim().replace(/\s+/g, ' ');
    if (s && s === s.toLowerCase()) s = s.replace(/(^|[\s\-'’])(\S)/g, function (m, a, b) { return a + b.toUpperCase(); });
    return s;
  }

  /* ------------------------------------------------------------ formulaire */
  var form = $('#form-candidature');
  if (!form) { boot(); return; }
  form.noValidate = true;
  var card = $('#form-card');
  var steps = $$('.step', form);
  var TOTAL = 5;
  var TITRES = ['Vos coordonnées', 'Votre profil', 'Votre niveau', 'Vos objectifs', 'Logistique et réservation', 'Vérification'];
  var btnPrev = $('#btn-prev'), btnNext = $('#btn-next'), btnSubmit = $('#btn-submit');
  var state = { step: 0, startedAt: null, id: null, sending: false, capture: '', captureName: '', dirty: false, touched: {} };

  function els(name) { return $$('[name="' + name + '"]', form); }
  function val(name) {
    var list = els(name); if (!list.length) return '';
    var el = list[0];
    if (el.type === 'radio') { var c = list.filter(function (e) { return e.checked; })[0]; return c ? c.value : ''; }
    if (el.type === 'checkbox') {
      if (list.length > 1) return list.filter(function (e) { return e.checked; }).map(function (e) { return e.value; });
      return el.checked ? el.value : '';
    }
    return String(el.value || '').trim();
  }
  function label(name) {
    var list = els(name); if (!list.length) return '';
    var el = list[0];
    if (el.tagName === 'SELECT') { var o = el.options[el.selectedIndex]; return o && o.value ? (o.getAttribute('data-label') || o.text) : ''; }
    if (el.type === 'radio') { var c = list.filter(function (e) { return e.checked; })[0]; return c ? c.getAttribute('data-label') || '' : ''; }
    return '';
  }
  function labelsMulti(name) {
    return els(name).filter(function (e) { return e.checked; }).map(function (e) { return e.getAttribute('data-label') || e.value; });
  }
  function setVal(name, v) {
    els(name).forEach(function (el) {
      if (el.type === 'radio') el.checked = el.value === v;
      else if (el.type === 'checkbox') el.checked = Array.isArray(v) ? v.indexOf(el.value) > -1 : el.value === v;
      else el.value = v == null ? '' : v;
    });
  }
  function box(name) { var el = els(name)[0]; return el ? el.closest('.field, .group') : null; }
  function isShown(el) { return !el.closest('[hidden]'); }

  var REQUIS_ENTREPRISE = ['ecommerce', 'entrepreneur', 'freelance'];
  var RULES = {
    prenom: { required: true, min: 2, msg: 'Indiquez votre prénom.' },
    nom: { required: true, min: 2, msg: 'Indiquez votre nom.' },
    email: { required: true, test: function (v) { return EMAIL_RE.test(v); }, msg: 'Indiquez une adresse e-mail valide, par exemple nom@gmail.com.' },
    whatsapp: { required: true, test: function (v) { return !!normPhone(v); }, msg: 'Indiquez un numéro WhatsApp valide, par exemple 034 12 345 67 (ou +33 6 12 34 56 78 hors de Madagascar).' },
    ville: { required: true, min: 2, msg: 'Indiquez votre ville et votre quartier.' },
    profil: { required: true, msg: 'Choisissez le profil qui vous correspond le mieux.' },
    entreprise: { requiredIf: function () { return REQUIS_ENTREPRISE.indexOf(val('profil')) > -1; }, min: 2, msg: 'Indiquez le nom de votre entreprise ou de votre activité.' },
    niveau_meta: { required: true, msg: 'Choisissez la réponse la plus proche de votre situation.' },
    niveau_google: { required: true, msg: 'Choisissez la réponse la plus proche de votre situation.' },
    tracking: { required: true, msg: 'Choisissez la réponse la plus proche de votre situation.' },
    ia: { required: true, msg: 'Choisissez la réponse la plus proche de votre situation.' },
    budget: { required: true, msg: 'Choisissez une fourchette de budget, même approximative.' },
    objectif: { required: true, msg: 'Choisissez votre objectif principal.' },
    attentes: { required: true, max: 3, msg: 'Choisissez au moins une priorité (3 au maximum).' },
    presence: { required: true, msg: 'Confirmez votre présence aux deux journées. Un empêchement ? Écrivez-nous sur WhatsApp avant de candidater.' },
    laptop: { required: true, msg: 'Indiquez si vous apporterez un ordinateur portable.' },
    visa: { required: true, msg: 'Indiquez si vous avez une carte Visa.' },
    source: { required: true, msg: 'Indiquez comment vous avez connu la formation.' },
    facture_raison: { requiredIf: function () { return val('facture') === 'oui'; }, min: 2, msg: 'Indiquez la raison sociale à faire figurer sur la facture.' },
    acompte: { required: true, msg: 'Indiquez où vous en êtes avec l’acompte.' },
    acompte_operateur: { requiredIf: function () { return val('acompte') === 'paye'; }, msg: 'Choisissez le service utilisé pour le transfert.' },
    acompte_ref: { requiredIf: function () { return val('acompte') === 'paye'; }, min: 4, msg: 'Indiquez la référence de la transaction : elle figure dans le SMS de confirmation.' },
    consent: { required: true, msg: 'Votre accord est nécessaire pour que nous puissions traiter votre candidature.' }
  };

  function setError(name, msg) {
    var b = box(name); if (!b) return;
    var err = b.querySelector('#err-' + name) || b.querySelector('.error');
    if (err) err.textContent = msg ? fr(msg) : '';
    b.classList.toggle('is-invalid', !!msg);
    els(name).forEach(function (el) {
      if (el.type === 'radio' || (el.type === 'checkbox' && els(name).length > 1)) return;
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    });
  }
  function check(name, silent) {
    var r = RULES[name], list = els(name);
    if (!r || !list.length) return true;
    if (!isShown(list[0])) { if (!silent) setError(name, ''); return true; }
    var v = val(name), req = r.required || (r.requiredIf && r.requiredIf());
    var empty = Array.isArray(v) ? v.length === 0 : !v;
    var ok;
    if (empty) ok = !req;
    else if (r.min && v.length < r.min) ok = false;
    else if (r.max && Array.isArray(v) && v.length > r.max) ok = false;
    else if (r.test && !r.test(v)) ok = false;
    else ok = true;
    if (!silent) setError(name, ok ? '' : r.msg);
    if (!silent && list[0].classList.contains('input')) list[0].classList.toggle('is-valid', ok && !empty && list[0].type !== 'select-one');
    return ok;
  }
  function namesIn(stepEl) {
    var seen = {};
    return $$('[name]', stepEl).map(function (e) { return e.name; }).filter(function (n) {
      if (!RULES[n] || seen[n]) return false; seen[n] = 1; return true;
    });
  }
  function validStep(i, silent) {
    var bad = namesIn(steps[i]).filter(function (n) { return !check(n, silent); });
    if (!silent && bad.length) {
      var first = els(bad[0]).filter(function (e) { return !e.disabled; })[0];
      if (first) {
        var b = box(bad[0]) || first; scrollToEl(b, 110);
        setTimeout(function () { first.focus({ preventScroll: true }); }, reducedMotion ? 0 : 250);
      }
      announce(bad.length === 1 ? 'Un champ est à compléter ou à corriger.' : bad.length + ' champs sont à compléter ou à corriger.');
    }
    return bad.length === 0;
  }

  /* -- logique conditionnelle et messages personnalisés */
  var ENTREPRISE_LABELS = {
    ecommerce: 'Nom de votre boutique ou de votre activité', entrepreneur: 'Nom de votre entreprise',
    freelance: 'Nom de votre structure ou de votre activité', cm: 'Entreprise ou marques que vous gérez',
    salarie: 'Entreprise ou organisation', etudiant: 'Établissement ou domaine d’études'
  };
  var NOTES_META = {
    jamais: 'Aucun souci : on part des bases, pas à pas, ordinateur en main.',
    boost: 'Vous passerez du bouton « Booster » au Gestionnaire de publicités, avec une vraie méthode.',
    gestionnaire: 'Vous irez plus loin sur le tracking, l’analyse et le pilotage avec l’IA.',
    clients: 'L’IA (Claude, ses connecteurs et ses skills) vous fera gagner du temps sur l’analyse et le reporting de vos clients.'
  };
  var NOTES_OBJECTIF = {
    vendre: 'Pendant les deux jours, vous travaillez sur des campagnes adaptées à votre offre, et le mois de suivi vous aide à les faire tourner.',
    freelance: 'Le mois de suivi est pensé pour vous aider à décrocher votre première mission.',
    clients: 'Vous repartez avec une méthode claire pour piloter les campagnes et présenter des résultats à vos clients.',
    poste: 'Vous repartez avec une méthode et des outils directement applicables dans votre poste.'
  };
  function setNote(id, text) { var n = $(id); if (!n) return; n.hidden = !text; n.textContent = text ? fr(text) : ''; }
  function applyConditions() {
    var profil = val('profil');
    $('#bloc-entreprise').hidden = !profil;
    var req = REQUIS_ENTREPRISE.indexOf(profil) > -1;
    $('#label-entreprise').textContent = fr(ENTREPRISE_LABELS[profil] || 'Entreprise ou activité');
    $('#req-entreprise').hidden = !req; $('#sr-req-entreprise').hidden = !req;
    var ent = $('#f-entreprise'); ent.required = req; if (!req) setError('entreprise', '');
    $('#label-site').textContent = fr(profil === 'etudiant' ? 'Lien de votre profil ou de votre projet' : 'Lien de votre page, boutique ou site');

    $('#info-laptop').hidden = val('laptop') !== 'non';
    $('#bloc-facture').hidden = val('facture') !== 'oui';
    $('#f-facture-raison').required = val('facture') === 'oui';
    var paye = val('acompte') === 'paye';
    $('#bloc-acompte-paye').hidden = !paye;
    $('#f-operateur').required = paye; $('#f-acompte-ref').required = paye;

    setNote('#note-meta', NOTES_META[val('niveau_meta')]);
    setNote('#note-objectif', NOTES_OBJECTIF[val('objectif')]);

    var att = els('attentes'), n = att.filter(function (e) { return e.checked; }).length;
    att.forEach(function (e) { e.disabled = !e.checked && n >= 3; });
    $('#attentes-count').textContent = n + ' sur 3';
    $('#note-attentes').hidden = n < 3;

    var bes = $('#f-besoins'); $('#besoins-count').textContent = bes.value.length + ' / 600';

    var ph = normPhone(val('whatsapp')), op = $('#f-operateur');
    if (paye && ph && ph.op && !op.value) op.value = ph.op;
  }

  /* -- sauvegarde locale du brouillon */
  function serialize() {
    var data = {};
    $$('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.type === 'hidden' || el.type === 'file' || el.name === 'adresse_complete' || el.name === 'form-name') return;
      if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; }
      else if (el.type === 'checkbox') {
        if (els(el.name).length > 1) { data[el.name] = data[el.name] || []; if (el.checked) data[el.name].push(el.value); }
        else data[el.name] = el.checked ? el.value : '';
      } else data[el.name] = el.value;
    });
    return data;
  }
  var saveTimer;
  function saveDraft() {
    if (!state.dirty) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      store.set(KEYS.draft, { v: 1, savedAt: Date.now(), step: state.step, startedAt: state.startedAt, id: state.id, data: serialize() });
    }, 250);
  }
  function restoreDraft() {
    var d = store.get(KEYS.draft);
    if (!d || !d.data || (Date.now() - (d.savedAt || 0)) > 30 * 864e5) return false;
    Object.keys(d.data).forEach(function (k) { setVal(k, d.data[k]); });
    state.startedAt = d.startedAt || null; state.id = d.id || null; state.dirty = true;
    applyConditions();
    var target = 0;
    while (target < TOTAL && validStep(target, true)) target++;
    showStep(Math.min(target, typeof d.step === 'number' ? d.step : 0, TOTAL), false);
    $('#notice-brouillon').hidden = false;
    return true;
  }
  $('#effacer-brouillon').addEventListener('click', function () {
    store.del(KEYS.draft); form.reset(); state.dirty = false; state.startedAt = null; state.id = null; clearCapture();
    $$('[aria-invalid]', form).forEach(function (e) { e.removeAttribute('aria-invalid'); });
    $$('.is-invalid', form).forEach(function (e) { e.classList.remove('is-invalid'); });
    $$('.error', form).forEach(function (e) { e.textContent = ''; });
    $$('.is-valid', form).forEach(function (e) { e.classList.remove('is-valid'); });
    applyConditions(); $('#notice-brouillon').hidden = true; showStep(0, true);
  });

  /* -- navigation entre les étapes */
  function showStep(i, focus) {
    state.step = i;
    steps.forEach(function (s, k) {
      var on = k === i;
      s.classList.toggle('is-active', on);
      if (on && focus) { s.classList.remove('is-entering'); void s.offsetWidth; s.classList.add('is-entering'); }
    });
    $$('.stepper__item').forEach(function (li, k) {
      li.classList.toggle('is-done', k < i); li.classList.toggle('is-current', k === i);
      if (k === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    $('#progress-bar').style.width = Math.round(((i + 1) / (TOTAL + 1)) * 100) + '%';
    $('#step-status').textContent = fr(i < TOTAL ? 'Étape ' + (i + 1) + ' sur ' + TOTAL + ' · ' + TITRES[i] : 'Dernière étape · Vérification');
    btnPrev.hidden = i === 0;
    btnNext.hidden = i >= TOTAL;
    btnSubmit.hidden = i !== TOTAL;
    btnNext.firstChild.textContent = i === TOTAL - 1 ? 'Vérifier mes réponses ' : 'Continuer ';
    if (i === TOTAL) renderReview();
    if (focus) {
      var anchor = [$('.stepper', card), $('.progress', card)].filter(function (x) { return x && x.offsetParent; })[0] || card;
      scrollToEl(anchor, 96);
      var title = steps[i].querySelector('.step__title');
      if (title) setTimeout(function () { title.focus({ preventScroll: true }); }, reducedMotion ? 0 : 220);
    }
    saveDraft();
  }
  btnNext.addEventListener('click', function () {
    if (!validStep(state.step, false)) return;
    if (state.step === 0) track('form_step', { step: 2 });
    showStep(state.step + 1, true);
  });
  btnPrev.addEventListener('click', function () { if (state.step > 0) showStep(state.step - 1, true); });
  form.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON' || e.target.type === 'submit') return;
    if (state.step < TOTAL) { e.preventDefault(); btnNext.click(); }
  });

  /* -- interactions sur les champs */
  var sugTimer;
  function suggestEmail() {
    var el = $('#f-email'), v = el.value.trim(), s = $('#email-suggestion');
    var sug = EMAIL_RE.test(v) ? emailSuggestion(v) : '';
    if (!sug) { s.hidden = true; return; }
    if (!s.hidden && s.getAttribute('data-sug') === sug) return;
    s.setAttribute('data-sug', sug);
    s.innerHTML = h('Vouliez-vous dire ') + '<b>' + esc(sug) + '</b> ? <button type="button" class="link-btn" id="email-fix">Corriger</button>';
    s.hidden = false;
    $('#email-fix').addEventListener('click', function () { el.value = sug; s.hidden = true; check('email', false); el.focus(); saveDraft(); });
  }
  function markStarted() {
    if (!state.startedAt) { state.startedAt = Date.now(); track('form_start'); }
    state.dirty = true;
  }
  form.addEventListener('focusin', function (e) { if (e.target.name) markStarted(); });
  form.addEventListener('input', function (e) {
    var n = e.target.name; if (!n) return;
    markStarted();
    if (n === 'besoins' || n === 'whatsapp') applyConditions();
    var b = box(n); if (b && b.classList.contains('is-invalid')) check(n, false);
    if (n === 'email') { clearTimeout(sugTimer); sugTimer = setTimeout(suggestEmail, 450); }
    saveDraft();
  });
  form.addEventListener('change', function (e) {
    var n = e.target.name; if (!n) return;
    markStarted(); applyConditions();
    var t = e.target.type;
    if (t === 'radio' || t === 'checkbox' || e.target.tagName === 'SELECT') check(n, false);
    saveDraft();
  });
  form.addEventListener('focusout', function (e) {
    var el = e.target, n = el.name;
    if (!n || !el.classList.contains('input') || el.tagName === 'SELECT') return;
    if (n === 'prenom' || n === 'nom') el.value = cap(el.value);
    if (n === 'whatsapp') { var ph = normPhone(el.value); if (ph) el.value = ph.mg ? ph.local : ph.display; }
    if (el.value.trim() || state.touched[n]) check(n, false);
    state.touched[n] = true;
    if (n === 'email') suggestEmail();
    saveDraft();
  });

  /* -- capture du transfert (compressée avant l’envoi) */
  function compressImage(file, maxSide, quality) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) { reject(new Error('type')); return; }
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * scale)); c.height = Math.max(1, Math.round(img.naturalHeight * scale));
        var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('lecture')); };
      img.src = url;
    });
  }
  function clearCapture() {
    state.capture = ''; state.captureName = '';
    var inp = $('#f-capture'); if (inp) inp.value = '';
    var pv = $('#upload-preview'); if (pv) pv.hidden = true;
    var t = $('#upload-btn-text'); if (t) t.textContent = 'Ajouter une image';
    var err = $('#err-capture'); if (err) err.textContent = '';
  }
  var capInput = $('#f-capture');
  if (capInput) {
    capInput.addEventListener('change', function () {
      var f = capInput.files && capInput.files[0]; var err = $('#err-capture'); err.textContent = '';
      if (!f) return;
      compressImage(f, 1400, 0.72).then(function (dataUrl) {
        if (dataUrl.length > 1600000) return compressImage(f, 1000, 0.6);
        return dataUrl;
      }).then(function (dataUrl) {
        state.capture = dataUrl.split(',')[1]; state.captureName = f.name;
        $('#upload-img').src = dataUrl; $('#upload-name').textContent = f.name;
        $('#upload-preview').hidden = false; $('#upload-btn-text').textContent = 'Changer d’image';
      }).catch(function () {
        clearCapture();
        err.textContent = fr('Image illisible. Vous pourrez envoyer la capture sur WhatsApp après votre candidature.');
      });
    });
    $('#upload-remove').addEventListener('click', function () { clearCapture(); capInput.focus(); });
  }

  /* -- vérification */
  function factureLabel() {
    if (val('facture') !== 'oui') return 'Non';
    return 'Oui · ' + val('facture_raison') + (val('facture_nif') ? ' · NIF/STAT ' + val('facture_nif') : '');
  }
  function acompteLabel() {
    if (val('acompte') === 'paye') return 'Déjà réglé · ' + val('acompte_operateur') + ' · réf. ' + val('acompte_ref') + (state.capture ? ' · capture jointe' : '');
    return 'À régler après la candidature';
  }
  function renderReview() {
    var ph = normPhone(val('whatsapp'));
    var entLabel = (ENTREPRISE_LABELS[val('profil')] || 'Entreprise ou activité');
    var blocks = [
      { s: 0, t: 'Coordonnées', rows: [['Nom', val('prenom') + ' ' + val('nom')], ['E-mail', val('email')], ['WhatsApp', ph ? ph.display : val('whatsapp')], ['Ville et quartier', val('ville')]] },
      { s: 1, t: 'Profil', rows: [['Profil', label('profil')], [entLabel, val('entreprise')], ['Lien', val('site')]] },
      { s: 2, t: 'Niveau', rows: [['Meta Ads', label('niveau_meta')], ['Google Ads', label('niveau_google')], ['Tracking', label('tracking')], ['IA', label('ia')], ['Budget pub mensuel', label('budget')]] },
      { s: 3, t: 'Objectifs', rows: [['Objectif principal', label('objectif')], ['Priorités', labelsMulti('attentes').join(', ')], ['Question ou attente', val('besoins')]] },
      { s: 4, t: 'Logistique et réservation', rows: [['Présence', val('presence') ? 'Confirmée pour les deux journées' : ''], ['Ordinateur portable', label('laptop')], ['Carte Visa', label('visa')], ['Source', label('source')], ['Facture', factureLabel()], ['Acompte', acompteLabel()]] }
    ];
    $('#review').innerHTML = blocks.map(function (b) {
      var rows = b.rows.filter(function (r) { return r[1]; }).map(function (r) { return '<div><dt>' + h(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
      return '<div class="review__block"><div class="review__head"><h4>' + h(b.t) + '</h4>' +
        '<button type="button" class="link-btn" data-goto="' + b.s + '">' + icon('edit') + 'Modifier<span class="sr-only"> : ' + h(b.t) + '</span></button></div><dl>' + rows + '</dl></div>';
    }).join('');
    $('#send-error').hidden = true;
  }
  $('#review').addEventListener('click', function (e) {
    var b = e.target.closest('[data-goto]'); if (b) showStep(parseInt(b.getAttribute('data-goto'), 10), true);
  });

  /* -- score et priorité (pour trier les candidatures dans le tableau) */
  function scoring() {
    var s = 0;
    if (val('acompte') === 'paye') s += 35;
    if (val('laptop') === 'oui') s += 10;
    s += val('visa') === 'oui' ? 10 : 5;
    s += ({ aucun: 0, moins200: 5, de200a1m: 10, plus1m: 15, clients: 15 })[val('budget')] || 0;
    s += ['vendre', 'freelance', 'clients'].indexOf(val('objectif')) > -1 ? 10 : 5;
    if (val('entreprise')) s += 5;
    if (val('site')) s += 5;
    if (val('besoins')) s += 5;
    if (['bouche', 'ancien'].indexOf(val('source')) > -1) s += 5;
    s = Math.min(100, s);
    var p = (val('acompte') === 'paye' || s >= 60) ? 'Prioritaire' : (s >= 35 ? 'Intéressé(e)' : 'À qualifier');
    return { score: s, priorite: p };
  }

  /* -- envoi */
  var ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function newId() {
    var out = '', bytes = new Uint8Array(6);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (var i = 0; i < 6; i++) bytes[i] = Math.floor(Math.random() * 256);
    for (var j = 0; j < 6; j++) out += ALPHABET.charAt(bytes[j] % ALPHABET.length);
    return 'MB-' + out;
  }
  function buildPayload() {
    var ph = normPhone(val('whatsapp')), sc = scoring(), paye = val('acompte') === 'paye';
    var p = {
      action: 'inscription', id: state.id,
      prenom: cap(val('prenom')), nom: cap(val('nom')), email: val('email').toLowerCase(),
      whatsapp: ph ? ph.display : val('whatsapp'), wa: ph ? ph.wa : val('whatsapp').replace(/\D/g, ''), ville: val('ville'),
      profil: val('profil'), profil_label: label('profil'), entreprise: val('entreprise'), site: val('site'),
      niveau_meta: val('niveau_meta'), niveau_meta_label: label('niveau_meta'),
      niveau_google: val('niveau_google'), niveau_google_label: label('niveau_google'),
      tracking: val('tracking'), tracking_label: label('tracking'),
      ia: val('ia'), ia_label: label('ia'),
      budget: val('budget'), budget_label: label('budget'),
      objectif: val('objectif'), objectif_label: label('objectif'),
      attentes: val('attentes').join(','), attentes_label: labelsMulti('attentes').join(' · '), besoins: val('besoins'),
      presence: val('presence') ? 'oui' : 'non',
      laptop: val('laptop'), laptop_label: label('laptop'),
      visa: val('visa'), visa_label: label('visa'),
      source: val('source'), source_label: label('source'),
      facture: val('facture') || 'non', facture_raison: val('facture_raison'), facture_nif: val('facture_nif'), facture_label: factureLabel(),
      acompte: val('acompte'), acompte_operateur: paye ? val('acompte_operateur') : '', acompte_ref: paye ? val('acompte_ref') : '',
      consent: val('consent') ? 'oui' : 'non',
      utm: utmString(), page_url: window.location.origin + window.location.pathname,
      t_fill: Math.max(0, Math.round((Date.now() - (state.startedAt || Date.now())) / 1000)),
      score: sc.score, priorite: sc.priorite
    };
    var hp = form.querySelector('[name="adresse_complete"]').value;
    if (hp) p.adresse_complete = hp;
    if (paye && state.capture) p.capture_b64 = state.capture;
    return p;
  }
  function toParams(p, skip) {
    var b = new URLSearchParams();
    Object.keys(p).forEach(function (k) { if (!skip || skip.indexOf(k) === -1) b.append(k, p[k] == null ? '' : String(p[k])); });
    return b;
  }
  function postMake(p) {
    if (!CFG.webhookUrl) return Promise.reject(new Error('webhook non configuré'));
    return fetchTimeout(CFG.webhookUrl, { method: 'POST', body: toParams(p) }, 25000);
  }
  function postNetlify(p) {
    if (!CFG.netlifyForms) return Promise.reject(new Error('désactivé'));
    var b = toParams(p, ['capture_b64']); b.append('form-name', 'inscription-media-buyer');
    return fetchTimeout('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: b.toString() }, 20000);
  }
  function setSending(on) {
    state.sending = on;
    btnSubmit.disabled = on; btnSubmit.classList.toggle('is-sending', on);
    btnSubmit.querySelector('.btn__label').textContent = on ? 'Envoi en cours…' : 'Envoyer ma candidature';
    btnPrev.disabled = on;
  }
  function waFallbackText(p) {
    return 'Bonjour, je souhaite m’inscrire à la formation Media Buyer des 28 et 30 novembre. ' +
      'Nom : ' + p.prenom + ' ' + p.nom + ' · E-mail : ' + p.email + ' · WhatsApp : ' + p.whatsapp + ' · Ville : ' + p.ville +
      ' · Profil : ' + p.profil_label + ' · Objectif : ' + p.objectif_label + ' · Acompte : ' + (p.acompte === 'paye' ? 'déjà réglé (' + p.acompte_operateur + ', réf. ' + p.acompte_ref + ')' : 'à régler') +
      ' · Réf. ' + p.id;
  }
  function showSendError(p) {
    var box = $('#send-error');
    box.innerHTML = icon('alert') + '<div><p><b>' + h('L’envoi n’a pas abouti.') + '</b> ' +
      h('Vérifiez votre connexion internet, puis réessayez. Vos réponses restent enregistrées sur cet appareil.') + '</p>' +
      '<div class="notice__actions"><button type="button" class="btn btn--primary btn--sm" id="retry">Réessayer</button>' +
      '<a class="btn btn--wa btn--sm" href="' + esc(waLink(waFallbackText(p))) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' Envoyer par WhatsApp</a></div></div>';
    box.hidden = false;
    $('#retry').addEventListener('click', function () { box.hidden = true; submit(); });
    box.focus && box.setAttribute('tabindex', '-1'); box.focus();
  }
  async function submit() {
    if (state.sending) return;
    for (var i = 0; i < TOTAL; i++) {
      if (!validStep(i, true)) { showStep(i, true); setTimeout(function () { validStep(state.step, false); }, 50); return; }
    }
    if (!state.id) state.id = newId();
    saveDraft();
    setSending(true);
    var p = buildPayload();
    els('id')[0].value = p.id;
    var mkP = settle(postMake(p)), nfP = settle(postNetlify(p));
    var mk = await mkP, nf = await nfP;
    var makeOk = mk.ok && mk.value.ok;
    // TypeError côté Make = réseau coupé OU réponse illisible (CORS) alors que la candidature est bien arrivée.
    // La requête Netlify (même site) sert de témoin : si elle a obtenu une réponse, le réseau fonctionnait.
    var makeOpaque = !mk.ok && mk.error && mk.error.name === 'TypeError';
    var netlifyOk = nf.ok && nf.value.ok;
    var reseauOk = CFG.netlifyForms ? nf.ok : navigator.onLine !== false;
    setSending(false);
    if (makeOk || netlifyOk || (makeOpaque && reseauOk)) {
      var ph = normPhone(val('whatsapp'));
      var sub = {
        id: p.id, prenom: p.prenom, nom: p.nom, email: p.email, acompte: p.acompte, laptop: p.laptop,
        op: ph ? ph.op : '', capture: !!p.capture_b64, at: Date.now()
      };
      clearTimeout(saveTimer); state.dirty = false;
      store.set(KEYS.sub, sub); store.del(KEYS.draft);
      track('generate_lead', { currency: 'MGA', value: CFG.acompte });
      renderSuccess(sub);
    } else {
      showSendError(p);
    }
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); if (state.step === TOTAL) submit(); else btnNext.click(); });

  /* ------------------------------------------------------------ paiement, réussite, agenda */
  function paymentPanel(o) {
    var hn = o.niveau || 'h4';
    var mm = (CFG.mobileMoney || []).filter(function (m) { return m && m.numero; });
    var proof = 'Bonjour, voici la preuve de mon acompte pour la formation Media Buyer (réf. ' + o.id + (o.prenom ? ', ' + o.prenom + ' ' + (o.nom || '') : '') + ').';
    var html = '<div class="pay">';
    html += '<' + hn + ' class="pay__title">' + h('Réservez votre place : acompte de ' + ar(CFG.acompte)) + '</' + hn + '>';
    html += '<p class="pay__lead">' + h('Les places sont confirmées à réception de l’acompte. Le solde de ' + ar(CFG.solde) + ' se règle sur place, le premier jour.') + '</p>';
    html += '<p class="pay__ref">' + h('Motif à indiquer :') + ' <code>' + esc(o.id) + '</code>' + copyBtn(o.id, 'la référence') + '</p>';
    if (mm.length) {
      html += '<ul class="mm">' + mm.map(function (m) {
        var sug = o.op && m.service === o.op;
        return '<li' + (sug ? ' class="is-suggested"' : '') + '><div><span class="mm__service">' + esc(m.service) + '</span>' +
          (sug ? '<span class="mm__badge">' + h('Conseillé pour votre numéro') + '</span>' : '') +
          '<span class="mm__num">' + esc(m.numero) + '</span>' + (m.titulaire ? '<span class="mm__holder">' + h('Au nom de ' + m.titulaire) + '</span>' : '') +
          '</div>' + copyBtn(String(m.numero).replace(/\s/g, ''), 'le numéro ' + m.service) + '</li>';
      }).join('') + '</ul>';
      html += '<ol class="pay__steps"><li>' + h('Envoyez ' + ar(CFG.acompte) + ' à l’un de ces numéros, depuis votre menu ou votre application Mobile Money.') + '</li>' +
        '<li>' + h('Indiquez votre référence ' + o.id + ' en motif, si votre service le permet.') + '</li>' +
        '<li>' + h('Envoyez la capture du transfert sur WhatsApp : nous confirmons votre place par e-mail.') + '</li></ol>';
      html += '<div class="btn-row"><a class="btn btn--wa" href="' + esc(waLink(proof)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + h('J’ai payé : envoyer ma preuve') + '</a></div>';
    } else {
      var ask = 'Bonjour, je souhaite régler l’acompte de ' + ar(CFG.acompte).replace(/\s/g, ' ') + ' pour la formation Media Buyer (réf. ' + o.id + '). Pouvez-vous m’indiquer le numéro Mobile Money ?';
      html += '<p class="pay__lead">' + h('Le numéro Mobile Money de réservation vous est communiqué sur WhatsApp, avec votre référence. Écrivez-nous : nous vous répondons rapidement.') + '</p>';
      html += '<div class="btn-row"><a class="btn btn--wa" href="' + esc(waLink(ask)) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + h('Recevoir le numéro Mobile Money') + '</a>' +
        '<a class="btn btn--secondary" href="' + esc(waLink(proof)) + '" target="_blank" rel="noopener">' + h('J’ai déjà payé : envoyer ma preuve') + '</a></div>';
    }
    html += '</div>';
    return html;
  }
  function gcal(day, n, id) {
    var t = 'Formation Media Buyer pilotée par l’IA · Jour ' + n;
    var details = 'CASSIVI DIGITAL MG · de 8h à 17h. Apportez votre ordinateur portable et son chargeur.' + (id ? ' Réf. ' + id : '');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(t) +
      '&dates=' + day + 'T050000Z/' + day + 'T140000Z&details=' + encodeURIComponent(details) + '&location=' + encodeURIComponent(LIEU);
  }
  function icsText(id) {
    function esc_(s) { return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
    function fold(line) {
      var out = '', bytes = 0;
      for (var i = 0; i < line.length; i++) {
        var ch = line.charAt(i), b = unescape(encodeURIComponent(ch)).length;
        if (bytes + b > 73) { out += '\r\n '; bytes = 1; }
        out += ch; bytes += b;
      }
      return out;
    }
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CASSIVI DIGITAL MG//Formation Media Buyer//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    [['20261128', 1], ['20261130', 2]].forEach(function (d) {
      lines.push('BEGIN:VEVENT', 'UID:media-buyer-' + d[0] + '-' + (id || 'session') + '@cassivi-digital-mg', 'DTSTAMP:' + stamp,
        'DTSTART:' + d[0] + 'T050000Z', 'DTEND:' + d[0] + 'T140000Z',
        'SUMMARY:' + esc_('Formation Media Buyer pilotée par l’IA · Jour ' + d[1]),
        'LOCATION:' + esc_(LIEU),
        'DESCRIPTION:' + esc_('CASSIVI DIGITAL MG · de 8h à 17h. Apportez votre ordinateur portable et son chargeur.' + (id ? ' Réf. ' + id + '.' : '')),
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc_('Formation Media Buyer demain à 8h'), 'TRIGGER:-PT14H', 'END:VALARM', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  function downloadIcs(id) {
    var blob = new Blob([icsText(id)], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'formation-media-buyer-28-30-novembre.ics';
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); document.body.removeChild(a); }, 500);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-ics]') : null;
    if (b) { e.preventDefault(); downloadIcs(b.getAttribute('data-ics')); }
  });
  function calendarBlock(id) {
    return '<div class="success__block"><h4>' + h('Bloquez les deux journées dans votre agenda') + '</h4>' +
      '<div class="btn-row"><a class="btn btn--secondary btn--sm" href="' + esc(gcal('20261128', 1, id)) + '" target="_blank" rel="noopener">' + icon('calendar-plus') + ' ' + h('Google Agenda · jour 1') + '</a>' +
      '<a class="btn btn--secondary btn--sm" href="' + esc(gcal('20261130', 2, id)) + '" target="_blank" rel="noopener">' + icon('calendar-plus') + ' ' + h('Google Agenda · jour 2') + '</a>' +
      '<button type="button" class="btn btn--secondary btn--sm" data-ics="' + esc(id) + '">' + icon('download') + ' ' + h('Apple, Outlook (.ics)') + '</button></div></div>';
  }
  function renderSuccess(sub) {
    var html = '<div class="success__icon">' + icon('check-circle') + '</div>' +
      '<h3 class="success__title" id="success-titre" tabindex="-1">' + h('Merci ' + sub.prenom + ', votre candidature est bien reçue.') + '</h3>' +
      '<p>' + h('Un e-mail de confirmation vient de partir à ') + '<b>' + esc(sub.email) + '</b>. ' + h('Vous ne le voyez pas d’ici quelques minutes ? Regardez dans les onglets Promotions ou Spam.') + '</p>' +
      '<div class="ticket"><div><span class="ticket__label">' + h('Votre référence') + '</span><span class="ticket__ref">' + esc(sub.id) + '</span>' +
      '<span class="ticket__hint">' + h('Gardez-la : elle sert de motif à votre paiement.') + '</span></div>' + copyBtn(sub.id, 'la référence') + '</div>';
    if (sub.acompte === 'paye') {
      html += '<div class="notice notice--success">' + icon('check-circle') + '<p><b>' + h('Acompte déclaré, merci.') + '</b> ' +
        h('Nous le vérifions et vous confirmons votre place par e-mail.') + '</p></div>';
      if (!sub.capture) {
        html += '<div class="btn-row"><a class="btn btn--wa" href="' + esc(waLink('Bonjour, voici la preuve de mon acompte pour la formation Media Buyer (réf. ' + sub.id + ', ' + sub.prenom + ' ' + sub.nom + ').')) +
          '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + h('Envoyer la capture sur WhatsApp') + '</a></div>';
      }
    } else {
      html += paymentPanel(sub);
    }
    if (sub.laptop === 'non') {
      html += '<div class="notice notice--warning">' + icon('laptop') + '<p>' + h('Vous avez indiqué ne pas avoir d’ordinateur portable : il est indispensable pendant les deux jours. Nous en parlons ensemble sur WhatsApp pour trouver une solution.') + '</p></div>';
    }
    html += calendarBlock(sub.id);
    html += '<div class="success__block"><p>' + h('Une question ? ') + '<a href="' + esc(waLink()) + '" target="_blank" rel="noopener">WhatsApp ' + esc(CFG.whatsappAffiche) + '</a>' + h(' ou ') +
      '<a href="mailto:' + esc(CFG.email) + '">' + esc(CFG.email) + '</a></p></div>';
    var el = $('#success'); el.innerHTML = html; el.hidden = false;
    form.hidden = true;
    $$('.form-head, .stepper, .progress, .step-status, #notice-brouillon, #notice-deja', card).forEach(function (n) { n.hidden = true; });
    scrollToEl(card, 96);
    setTimeout(function () { $('#success-titre').focus({ preventScroll: true }); }, reducedMotion ? 0 : 250);
  }

  /* ------------------------------------------------------------ retour depuis un e-mail (?ref=…#paiement) */
  function initReturn() {
    var params = new URLSearchParams(window.location.search);
    var ref = String(params.get('ref') || '').toUpperCase().trim();
    var sub = store.get(KEYS.sub);
    if (/^MB-[A-Z0-9]{6}$/.test(ref)) {
      var known = sub && sub.id === ref ? sub : null;
      var sec = $('#paiement');
      $('#paiement-contenu').innerHTML = (known ? '<p class="lead">' + h('Bonjour ' + known.prenom + ', voici comment finaliser votre réservation.') + '</p>' : '') +
        paymentPanel({ id: ref, prenom: known ? known.prenom : '', nom: known ? known.nom : '', op: known ? known.op : '', niveau: 'h3' });
      sec.hidden = false;
      if (window.location.hash === '#paiement') {
        setTimeout(function () { sec.scrollIntoView(); $('#paiement-titre').focus({ preventScroll: true }); }, 30);
      }
      return;
    }
    if (sub && sub.id && (Date.now() - (sub.at || 0)) < 60 * 864e5) {
      var n = $('#notice-deja');
      n.innerHTML = icon('info') + '<div><p>' + h('Vous avez déjà envoyé une candidature depuis cet appareil (réf. ' + sub.id + ').') + '</p>' +
        '<div class="notice__actions"><a class="btn btn--primary btn--sm" href="?ref=' + encodeURIComponent(sub.id) + '#paiement">' + h('Voir les instructions de paiement') + '</a>' +
        '<button type="button" class="btn btn--secondary btn--sm" id="nouvelle-candidature">' + h('Faire une nouvelle candidature') + '</button></div></div>';
      n.hidden = false;
      $('#nouvelle-candidature').addEventListener('click', function () { store.del(KEYS.sub); n.hidden = true; $('#f-prenom').focus(); });
    }
  }

  /* ------------------------------------------------------------ fermeture des inscriptions */
  function initClosed() {
    var close = Date.parse(CFG.clotureInscriptions);
    if (isNaN(close) || Date.now() < close) return false;
    form.hidden = true;
    $$('.form-head, .stepper, .progress, .step-status, #notice-brouillon, #notice-deja', card).forEach(function (n) { n.hidden = true; });
    var c = $('#closed');
    c.innerHTML = '<p class="eyebrow">' + h('Inscriptions closes') + '</p><h3>' + h('Les inscriptions pour cette session sont terminées.') + '</h3>' +
      '<p>' + h('Laissez-nous un message sur WhatsApp : nous vous informerons en priorité de la prochaine session.') + '</p>' +
      '<div class="btn-row"><a class="btn btn--wa" href="' + esc(waLink('Bonjour, je souhaite être informé(e) de la prochaine session de la formation Media Buyer.')) + '" target="_blank" rel="noopener">' + icon('whatsapp') + ' ' + h('Être informé(e) de la prochaine session') + '</a></div>';
    c.hidden = false;
    $$('[data-cta]').forEach(function (a) { a.setAttribute('href', '#candidature'); });
    return true;
  }

  /* ------------------------------------------------------------ démarrage */
  function preselectSource() {
    var src = String(UTM.utm_source || '').toLowerCase(), sel = $('#f-source');
    if (!sel || sel.value || !src) return;
    var map = { facebook: 'facebook', fb: 'facebook', meta: 'facebook', instagram: 'instagram', ig: 'instagram', linkedin: 'linkedin', tiktok: 'tiktok', whatsapp: 'whatsapp', google: 'google' };
    Object.keys(map).forEach(function (k) { if (!sel.value && src.indexOf(k) > -1) sel.value = map[k]; });
  }
  function boot() {
    initAnalytics(); initCountdown(); initVideo(); initStickyCta();
  }
  boot();
  if (!initClosed()) {
    applyConditions();
    if (!restoreDraft()) showStep(0, false);
    preselectSource();
    initReturn();
  } else {
    initReturn();
  }
  $$('[data-cta]').forEach(function (a) { a.addEventListener('click', function () { track('cta_click', { position: a.getAttribute('data-cta') }); }); });
})();
