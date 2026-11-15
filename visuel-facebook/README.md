# Visuels Facebook · MEDIA BUYER IA (CASSIVI DIGITAL MG)

Visuels fixes pour le fil d'actualité Facebook et Instagram : **1080 × 1350 px, format 4:5, PNG sRGB**.

## Versions optimisées (à publier)

| Fichier | Contenu |
|---|---|
| `export/CASSIVI_MediaBuyerIA_Facebook_4x5_V1_Formateur_optimise.png` | Photo du formateur devant l'écran, titre, dates mises en avant, bouton « Réservez votre place », WhatsApp, bandeau « Réservation obligatoire » |
| `export/CASSIVI_MediaBuyerIA_Facebook_4x5_V2_Salle_optimise.png` | Fond blanc, titre, photo de la salle pleine, carte dates + bouton + WhatsApp, même bandeau |

Changements par rapport à la première version :
- le tarif devient une ligne discrète ;
- les dates sont mises en avant (samedi 28 et lundi 30 novembre 2026, comme sur la landing) ;
- ajout de « Pour devenir freelance · entrepreneurs · e-commerçants avec boutique » et de « Acquisition du premier client incluse » ;
- ajout du bouton « Réservez votre place » et du WhatsApp 037 59 755 12 avec le logo WhatsApp vert ;
- ajout de la mention « RÉSERVATION OBLIGATOIRE – PLACES TRÈS LIMITÉES » ;
- ombres allégées.

Les photos et le logo n'ont pas changé : ce sont les mêmes fichiers, aux mêmes pixels, dans `images/`.

Première version (pour mémoire) : `export/…_V1_Formateur.png` et `export/…_V2_Salle.png`.

## Déclinaisons Meta Ads (V2 Salle)

Ce sont les mêmes textes, le même logo et la même photo que le 4:5. Seul l'agencement change pour chaque emplacement.

| Fichier | Emplacement Meta |
|---|---|
| `export/CASSIVI_MediaBuyerIA_Facebook_4x5_V2_Salle_optimise.png` | Fils Facebook et Instagram (4:5, recommandé) |
| `export/meta_ads/CASSIVI_MediaBuyerIA_Meta_1x1_Fil_1080x1080.png` | Fils en carré (1:1) |
| `export/meta_ads/CASSIVI_MediaBuyerIA_Meta_9x16_Stories-Reels_1080x1920.png` | Stories et Reels (9:16). Les textes restent dans la zone sûre, hors des 270 px du haut et du bas couvert par l'interface |
| `export/meta_ads/CASSIVI_MediaBuyerIA_Meta_1.91x1_Colonne-droite-Recherche_1200x628.png` | Colonne de droite et Recherche (1.91:1) |

Ces trois pages sont générées par `src/formats_meta.py` à partir du 4:5 (`src/visuel_v2_salle.html`).

## Sources

- **Logo** : le logo officiel (`video-pub/assets/logo_cassivi_corrige.png`, orthographe CASSIVI corrigée), seulement détouré en rond comme sur la landing. Il n'est ni redessiné ni déformé.
- **Photos** : photos réelles des sessions (`video-pub/assets`). Le filigrane de l'appareil photo est retiré et les couleurs sont corrigées de façon naturelle. La photo portrait personnelle n'est jamais utilisée.
- **Écran projeté (V1)** : le contenu d'origine, illisible, est remplacé par un tableau de bord Meta Ads (`src/ecran_dashboard.html`). Il est rendu comme une projection sur le mur, et les personnes ne sont pas retouchées.
- **Images figées** : `images/` contient la photo du formateur, la photo de la salle et le badge du logo, exactement comme dans les visuels livrés.

## Régénérer

Pour rendre les deux PNG à partir de `images/`, lancez `./src/exporter.sh` (il faut Chromium/Playwright et Pillow). Ce script ne touche pas aux photos.

`python3 src/prep_photos.py` refait les photos à partir des originaux. Il écrit dans `build/`, et il faut ensuite recopier les fichiers dans `images/`.
