# Portfolio PPC — Sitraka Ramamonjisoa

Site d'une page présentant l'expertise de Sitraka Ramamonjisoa, PPC Specialist certifié Google Ads :
étude de cas chiffrée, funnel de conversion interactif, architecture de tracking, méthode et formulaire
de demande de devis.

Dépôt : `cassivi-academie`.

## Stack

| Rôle | Outil |
| --- | --- |
| Interface | React 19, TypeScript |
| Build | Vite 8, avec pré-rendu statique de la page |
| Styles | Tailwind CSS 4 |
| Icônes | Lucide React |
| Graphique budget / chiffre d'affaires | Recharts, chargé à la demande |
| Formulaire | Netlify Forms |
| Tests | Vitest |

Framer Motion n'est pas utilisé : les animations sont en CSS et en `IntersectionObserver`, ce qui évite
d'alourdir la page. La police Geist est hébergée avec le site, sans appel à un service tiers.

## Commandes

```bash
npm install        # installer les dépendances (Node 20.19 ou plus récent)
npm run dev        # développement : http://localhost:5173
npm test           # vérifier les calculs de l'étude de cas
npm run build      # typage + tests + build + pré-rendu dans dist/
npm run preview    # servir dist/ en local
```

`npm run build` s'arrête si un calcul financier est faux, si le typage échoue, ou si les champs du
formulaire ne correspondent plus à ceux déclarés pour Netlify.

En local, le formulaire affiche volontairement une erreur : Netlify Forms n'existe que sur le site
déployé, et aucune confirmation n'est affichée sans réponse réelle de Netlify.

## Déploiement sur Netlify

Deux façons de mettre le site en ligne : depuis GitHub (étapes 1 à 6) ou en déposant le dossier
construit (voir « Déploiement manuel » plus bas). Les étapes 2 à 4, qui concernent le formulaire,
valent dans les deux cas.

### 1. Créer le site

1. Sur [app.netlify.com](https://app.netlify.com) : **Add new project > Import an existing project**.
2. Choisir **GitHub**, puis ce dépôt et la branche à déployer.
3. Ne rien modifier : `netlify.toml` fournit déjà la commande (`npm run build`), le dossier publié
   (`dist`) et la version de Node.
4. Lancer le déploiement.

### 2. Activer le formulaire (obligatoire)

Sans cette étape, les demandes de devis sont refusées et le site affiche un message d'erreur.

1. Dans le projet Netlify : **Forms > Enable form detection**.
2. Relancer un déploiement : **Deploys > Trigger deploy > Deploy project**.
3. Vérifier que le formulaire **devis** apparaît dans l'onglet **Forms**.

### 3. Recevoir les demandes par e-mail

1. **Forms > Submission notifications > Add notification > Email notification**.
2. Saisir l'adresse de réception et choisir le formulaire **devis**.
3. Si l'adresse n'est pas celle d'un membre de l'équipe Netlify, un e-mail de confirmation lui est
   envoyé : il faut cliquer sur **Confirm** pour que les notifications partent.

Chaque e-mail porte le sujet « Nouvelle demande de devis » et « Répondre » écrit directement au
prospect.

### 4. Tester en conditions réelles

1. Ouvrir le site en ligne et envoyer une demande de test.
2. Contrôler qu'elle figure dans **Forms > devis** et que l'e-mail est arrivé (vérifier les
   indésirables la première fois).

### 5. Adresse du site

L'adresse canonique, les balises Open Graph, `sitemap.xml` et `robots.txt` contiennent l'adresse du
site. Elle est choisie ainsi au moment du build :

1. la variable `SITE_URL`, si elle est définie ;
2. sinon l'adresse principale fournie par Netlify, quand c'est Netlify qui construit le site ;
3. sinon la valeur par défaut de `vite.config.ts` : `https://portfolio-sitraka-growth.netlify.app`.

Avec un déploiement depuis GitHub, un changement de nom ou l'ajout d'un domaine
(**Domain management**) ne demande donc qu'un nouveau déploiement.

### 6. Après la mise en ligne

- **LinkedIn** : passer l'adresse dans le [Post Inspector](https://www.linkedin.com/post-inspector/)
  pour générer l'aperçu du lien.
- **Google** : déclarer le site dans la Search Console et y soumettre `/sitemap.xml`.

### Déploiement manuel (glisser-déposer)

Sans GitHub : Netlify publie le dossier construit tel quel, il ne lance aucun build.

1. Construire le site avec le nom qu'il portera sur Netlify :

   ```bash
   SITE_URL=https://portfolio-sitraka-growth.netlify.app npm run build
   ```

2. Se connecter à Netlify, ouvrir [app.netlify.com/drop](https://app.netlify.com/drop) et y déposer
   le dossier `dist` (ou un zip de son contenu, `index.html` à la racine).
3. Renommer le projet dans ses réglages généraux pour qu'il porte exactement le nom utilisé à
   l'étape 1. Si ce nom est déjà pris, en choisir un autre et reconstruire avec la bonne adresse.
4. Activer le formulaire (étape 2 ci-dessus), puis **déposer une seconde fois le même dossier** dans
   la zone de dépôt de l'onglet **Deploys** : Netlify n'enregistre le formulaire que lors d'un
   déploiement postérieur à l'activation.
5. Configurer les notifications et tester (étapes 3 et 4 ci-dessus).

Pour une mise à jour : reconstruire, puis déposer de nouveau le dossier dans l'onglet **Deploys**.

Les en-têtes de cache et de sécurité sont dans `public/_headers`, copié dans `dist` : ils
s'appliquent aussi en déploiement manuel, où `netlify.toml` n'est pas lu.

Si le site demande une connexion aux visiteurs, vérifier la visibilité du projet dans Netlify :
selon la formule, un projet déposé peut être privé par défaut.

## Modifier le contenu

| Pour changer… | Fichier |
| --- | --- |
| Les chiffres de l'étude de cas | `src/data/caseStudy.ts` (seul `inputs` se saisit, le reste est calculé) |
| Ce qui est « réalisé » ou « recommandé » dans le tracking | `src/data/tracking.ts`, champ `status` |
| Les piliers, la méthode, les usages de l'IA | `src/data/expertise.ts` |
| E-mail, WhatsApp, LinkedIn, menu | `src/data/site.ts` |
| Les listes du formulaire | `src/data/quoteForm.ts` |
| Titre, description, aperçu de partage, données structurées | `index.html` |
| Couleurs et typographie | `src/index.css`, bloc `@theme` |

Si un chiffre de `inputs` change, mettre à jour les valeurs attendues dans
`src/data/caseStudy.test.ts` : le test échoue tant que les deux ne concordent pas.

Pour ajouter un champ au formulaire, il faut le déclarer à trois endroits : `src/data/quoteForm.ts`,
`src/components/sections/QuoteForm.tsx` et le formulaire masqué de `index.html`. Netlify ignore tout
champ absent de `index.html`, et le build le signale.

## Structure

```
index.html                 balises SEO, données structurées, déclaration du formulaire Netlify
netlify.toml               réglages de build pour un déploiement depuis GitHub
scripts/prerender.mjs      pré-rendu HTML, sitemap, robots, contrôle du formulaire
public/                    favicon, image de partage, page 404, en-têtes HTTP (_headers)
src/
  data/                    tout le contenu et les chiffres
  lib/                     formatage des nombres, validation et envoi du formulaire
  hooks/                   compteurs animés, entrées à l'écran
  components/ui/           boutons, conteneurs, nombres animés
  components/charts/       courbe du tableau de bord, graphique Recharts
  components/sections/     une section de la page par fichier
```

## À savoir

- Le site ne dépose aucun cookie et n'embarque aucun outil de mesure d'audience. Si Google Tag
  Manager ou GA4 sont ajoutés plus tard, il faudra un bandeau de consentement et une mise à jour de
  la politique de confidentialité, située dans le pied de page (`Footer.tsx`).
- La politique de confidentialité est un texte de départ : à relire et adapter avant publication.
- L'image de partage (`public/og-image.jpg`) reprend le titre et le ROAS : à régénérer si l'un des
  deux change.
