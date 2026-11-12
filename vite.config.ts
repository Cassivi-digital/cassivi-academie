import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Adresse publique du site, utilisée pour l'URL canonique, Open Graph,
 * les données structurées, le sitemap et robots.txt.
 *
 * Ordre de priorité :
 *  1. SITE_URL  — à définir soi-même (domaine personnalisé, autre hébergeur)
 *  2. URL       — fournie automatiquement par Netlify pendant le build
 *  3. valeur par défaut ci-dessous
 */
const siteUrl = (
  process.env.SITE_URL ||
  process.env.URL ||
  'https://sitraka-ramamonjisoa.netlify.app'
).replace(/\/+$/, '');

function injectSiteUrl(): Plugin {
  return {
    name: 'inject-site-url',
    transformIndexHtml(html) {
      return html.replaceAll('__SITE_URL__', siteUrl);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectSiteUrl()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
});
