/**
 * Dernière étape du build (`npm run build`).
 *
 *  1. Pré-rend la page React en HTML dans dist/index.html : le contenu est
 *     lisible sans JavaScript (robots d'indexation, aperçus de liens, IA) et
 *     s'affiche avant même le chargement du script.
 *  2. Précharge la police principale.
 *  3. Vérifie que le formulaire visible et le formulaire déclaré à Netlify
 *     portent exactement les mêmes champs.
 *  4. Écrit robots.txt et sitemap.xml avec l'adresse réelle du site.
 */

import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');
const indexPath = path.join(dist, 'index.html');
const PLACEHOLDER = '<!--app-html-->';

const fail = (message) => {
  console.error(`\n[prerender] ${message}\n`);
  process.exit(1);
};

let html = await readFile(indexPath, 'utf8');
if (!html.includes(PLACEHOLDER)) fail(`Repère ${PLACEHOLDER} introuvable dans dist/index.html.`);

// 1. Rendu statique ---------------------------------------------------------
const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);
const appHtml = render();
if (!appHtml.includes('<h1')) fail('Le rendu statique ne contient pas de titre principal.');
html = html.replace(PLACEHOLDER, appHtml);

// 2. Préchargement de la police ---------------------------------------------
const assets = await readdir(path.join(dist, 'assets'));
const font = assets.find((file) => /^geist-latin-wght-normal-.+\.woff2$/.test(file));
if (font) {
  html = html.replace(
    '</title>',
    `</title>\n    <link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />`,
  );
} else {
  console.warn('[prerender] Police principale introuvable : pas de préchargement.');
}

// 3. Cohérence des deux formulaires « devis » --------------------------------
const forms = [...html.matchAll(/<form\b[^>]*\bname="devis"[^>]*>[\s\S]*?<\/form>/g)].map(
  (match) => match[0],
);
const declared = forms.find((form) => /data-netlify="true"/.test(form));
const rendered = forms.find((form) => !/data-netlify="true"/.test(form));
if (!declared) fail('Formulaire Netlify (data-netlify="true") introuvable dans index.html.');
if (!rendered) fail('Formulaire de devis introuvable dans la page pré-rendue.');

const fieldNames = (form) =>
  new Set(
    [...form.matchAll(/<(?:input|select|textarea)\b[^>]*\bname="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((name) => name !== 'form-name'),
  );
const declaredFields = fieldNames(declared);
const renderedFields = fieldNames(rendered);
const missing = [...renderedFields].filter((name) => !declaredFields.has(name));
const unused = [...declaredFields].filter((name) => !renderedFields.has(name));
if (missing.length || unused.length) {
  fail(
    [
      'Les champs du formulaire « devis » ne correspondent pas à ceux déclarés pour Netlify.',
      missing.length ? `  Absents de index.html : ${missing.join(', ')}` : '',
      unused.length ? `  Déclarés mais absents du formulaire : ${unused.join(', ')}` : '',
      '  Netlify ignore tout champ non déclaré dans index.html.',
    ]
      .filter(Boolean)
      .join('\n'),
  );
}

await writeFile(indexPath, html);

// 4. robots.txt et sitemap.xml ----------------------------------------------
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (!canonical) fail('Balise canonique introuvable.');
const siteUrl = canonical.replace(/\/+$/, '');
const today = new Date().toISOString().slice(0, 10);

await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
);

await rm(ssrDir, { recursive: true, force: true });

const size = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`[prerender] dist/index.html pré-rendu (${size} Ko), ${renderedFields.size} champs de formulaire vérifiés.`);
console.log(`[prerender] Adresse du site : ${siteUrl}`);
