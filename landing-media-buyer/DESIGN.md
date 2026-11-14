# DESIGN.md · CASSIVI DIGITAL MG · Landing « Media Buyer pilotée par l’IA »

Direction : **institutionnel premium, clair et rassurant**, comme la page d’inscription d’une école de formation internationale.
Fonds clairs et aérés, bandeaux bleu nuit pour les moments forts. L’action principale, « Réserver ma place », est en **jaune vif** : on la voit d’un coup d’œil, sur fond clair comme sur fond bleu nuit, et on la retrouve dans chaque section. L’or reste réservé aux détails.

Les choix partent de l’identité déjà en place (logo, vidéos pub, e-mails automatiques), pas de sites de référence :
les outils UXKIN n’étaient pas connectés.
Pas de mode sombre : la page impose `color-scheme: light`.

Les valeurs vivent dans `site/assets/css/style.css` (`:root`). Les pages utilisent les noms des variables, jamais les valeurs brutes.

## Couleur

| Token | Valeur | Rôle |
|---|---|---|
| `--navy-900` | `#0A1B3F` | Bandeaux forts (hero, CTA final, pied de page), titres sur fond clair |
| `--navy-800` | `#12275A` | Cartes posées sur le bleu nuit |
| `--ink` | `#0D1733` | Texte principal (17 : 1 sur blanc) |
| `--muted` | `#5C6B86` | Texte secondaire, aides de saisie (5,4 : 1 sur blanc, 4,8 : 1 sur `--bg`) |
| `--muted-on-dark` | `#AEB9D0` | Texte secondaire sur bleu nuit (8,6 : 1) |
| `--line` | `#E3E8F2` | Bordures de cartes, séparateurs |
| `--line-strong` | `#C5CFE0` | Bordures des champs |
| `--bg` | `#F4F6FB` | Fond des sections claires |
| `--surface` | `#FFFFFF` | Cartes, formulaire |
| `--cta` | `#FFC83D` | **Action principale** : « Réserver ma place », « Continuer », envoi (texte `--cta-ink`, 10,9 : 1) |
| `--cta-hover` | `#FFB81F` | Survol de l’action principale |
| `--cta-ink` | `#0A1B3F` | Texte des boutons jaunes |
| `--primary` | `#1E5BFF` | **Interaction** : liens, focus, choix sélectionné, progression (5,3 : 1 sur blanc) |
| `--primary-hover` | `#1748CC` | Survol et appui |
| `--primary-soft` | `#EEF3FF` | Fond des choix sélectionnés |
| `--gold` | `#B8914A` | Accent décoratif : filets, puces, numéros (jamais pour du petit texte sur blanc) |
| `--gold-ink` | `#8A6A2F` | Sur-titres dorés sur fond clair (5 : 1) |
| `--gold-light` | `#E2C88E` | Sur-titres et chiffres clés sur bleu nuit (10,4 : 1) |
| `--success` | `#0E7C3F` | Validation, bouton WhatsApp (texte blanc 5,3 : 1) |
| `--danger` | `#C81E1E` | Astérisque des champs obligatoires, erreurs (5,7 : 1 sur blanc) |
| `--warning-bg` | `#FFF7E6` | Encadrés d’avertissement (texte `--ink`) |

Règles : jaune vif pour l’action principale, bleu pour l’interaction (liens, sélection, focus). Le vert ne sert qu’à WhatsApp et aux validations, le rouge qu’aux champs obligatoires et aux erreurs.
Aucun dégradé violet ni texte en dégradé. Le seul halo est un léger éclat bleu dans le hero.

## Typographie

- **Montserrat** (variable, 600 à 800), auto-hébergée : titres, chiffres clés, logo texte.
- **Inter** (variable, 400 à 700), auto-hébergée : texte, formulaire, boutons.

| Rôle | Taille / interligne | Graisse |
|---|---|---|
| Display (H1) | `clamp(2.25rem, 1.55rem + 2.9vw, 3.75rem)` / 1.06 | Montserrat 800, -0.02em |
| H2 | `clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)` / 1.15 | Montserrat 700, -0.01em |
| H3 | `1.25rem` / 1.3 | Montserrat 700 |
| Lead | `1.1875rem` / 1.6 | Inter 400 |
| Corps | `1rem` (16 px) / 1.6 | Inter 400 |
| Libellés de champ | `0.9375rem` / 1.4 | Inter 600 |
| Petit | `0.875rem` / 1.5 | Inter 400–500 |
| Sur-titre | `0.75rem` / 1.2, majuscules, +0.14em | Inter 700 |

Lignes de texte limitées à 65 caractères (`--measure: 65ch`).
Typographie française : espace insécable avant « : » et espace fine avant « ? ! ; », guillemets « », apostrophe ’.

## Espacement

Échelle de base 4 px : `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 · `--s-8` 64 · `--s-9` 96.
Sections : `padding-block: clamp(64px, 9vw, 112px)`.
Largeur de contenu : `--container: 1180px`, avec des marges latérales de 20 px (mobile) à 32 px.

## Forme et profondeur

Rayons : `--r-sm` 8 px (puces, petites étiquettes) · `--r-md` 12 px (champs, boutons) · `--r-lg` 18 px (cartes) · `--r-xl` 26 px (carte formulaire, vidéo) · `--r-pill` 999 px.
Ombres (deux seulement) :
- `--shadow-sm` : cartes et champs (`0 1px 2px rgb(10 27 63 / .06)`) ;
- `--shadow-lg` : carte formulaire et vidéo (`0 30px 60px -24px rgb(10 27 63 / .28)`).

## Composants

- **Boutons**
  - Principal : jaune vif `--cta`, texte bleu nuit gras, 52 px de haut (62 px en version XL), rayon 12, ombre dorée et liseré bas pour le relief.
  - Secondaire : bordure `--line-strong`, texte `--ink`.
  - Discret : lien souligné.
  - WhatsApp : vert `--success` avec l’icône.
  - États : survol plus foncé ; focus avec un anneau de 3 px `--primary` à 35 % et un décalage de 2 px ; désactivé à 45 % d’opacité avec `cursor: not-allowed`.
- **Liens** : `--primary`, soulignés (épaisseur 1 px, décalage 3 px).
- **Champs**
  - Gabarit : 52 px, fond blanc, bordure `--line-strong`.
  - Libellé au-dessus, aide en `--muted` sous le libellé.
  - Champ obligatoire : astérisque rouge `--danger` et texte masqué « (obligatoire) » pour les lecteurs d’écran.
  - Focus : bordure bleue et anneau.
  - Erreur : bordure rouge, message rouge avec icône, `aria-invalid`.
- **Cartes de choix** (radio et case à cocher) : carte entière cliquable, puce ronde ou carrée, titre et précision. Une fois sélectionnée : bordure 2 px bleue et fond `--primary-soft`.
- **Stepper** : 5 étapes numérotées et une étape de vérification. Barre de progression sur mobile, libellés complets à partir de 900 px.
- **Cartes** : blanches, bordure `--line`, rayon 18, `--shadow-sm`. Pas de grilles de trois cartes identiques : les contenus varient en taille et en forme.
- **Navigation** : barre fine et collante (logo, liens de section, date de session, WhatsApp, « Réserver ma place »).
- **Appels à l’action** : un bouton « Réserver ma place » dans chaque section (hero, programme, IA, pour qui, tarif, FAQ, bandeau final), dans la barre du haut et dans la barre mobile.
- **Carte tarif** : fond bleu nuit, prix en Montserrat 800, liste de ce qui est inclus, bouton jaune et lien WhatsApp.
- **Carte contact (FAQ)** : bouton WhatsApp wa.me/261375975512 avec message pré-rempli, téléphone, e-mail et bouton de réservation.
- **Pied de page** : bleu nuit, coordonnées, mention sur les marques, données personnelles.

## Images et icônes

- **Photos** : uniquement des photos réelles des sessions CASSIVI. Jamais de banque d’images, jamais la photo portrait personnelle. Rayon 18, recadrage propre (filigranes d’appareil retirés), format WebP.
- **Vidéo** : la pub 4:5. Lecture à la demande (`preload="none"`), image d’affiche, sous-titres VTT.
- **Icônes** : SVG en ligne, trait de 1,75 px, coins arrondis, 20 à 24 px, de `currentColor`. Aucune émoji.
- **Logo** : badge rond `logo-badge`, suivi du nom en Montserrat 800.

## Mouvement

Les transitions durent 150 à 250 ms (couleur, bordure, ombre). Le changement d’étape fait glisser le contenu de 8 px avec un fondu.
Avec `prefers-reduced-motion`, il n’y a plus aucune animation.
