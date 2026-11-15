# Visuels Facebook · MEDIA BUYER IA (CASSIVI DIGITAL MG)

Visuels fixes pour le fil d'actualité Facebook et Instagram : **1080 × 1350 px, format 4:5, PNG sRGB**.

## Versions optimisées (à publier)

| Fichier | Contenu |
|---|---|
| `export/CASSIVI_MediaBuyerIA_Facebook_4x5_V1_Formateur_optimise.png` | Photo du formateur devant l'écran, titre, dates mises en avant, bouton « Réservez votre place », WhatsApp, bandeau « Réservation obligatoire » |
| `export/CASSIVI_MediaBuyerIA_Facebook_4x5_V2_Salle_optimise.png` | Fond blanc, titre, photo de la salle pleine, carte dates + bouton + WhatsApp, même bandeau |

Changements par rapport à la première version :
- le tarif devient une ligne discrète ;
- les dates sont mises en avant (samedi 28 et dimanche 29 novembre 2026) ;
- ajout du bouton, du WhatsApp 037 59 755 12 et de la mention « RÉSERVATION OBLIGATOIRE – PLACES TRÈS LIMITÉES » ;
- ombres allégées.

Les photos et le logo n'ont pas changé : ce sont les mêmes fichiers, aux mêmes pixels, dans `images/`.

Première version (pour mémoire) : `export/…_V1_Formateur.png` et `export/…_V2_Salle.png`.

## Sources

- **Logo** : le logo officiel (`video-pub/assets/logo_cassivi_corrige.png`, orthographe CASSIVI corrigée), seulement détouré en rond comme sur la landing. Il n'est ni redessiné ni déformé.
- **Photos** : photos réelles des sessions (`video-pub/assets`). Le filigrane de l'appareil photo est retiré et les couleurs sont corrigées de façon naturelle. La photo portrait personnelle n'est jamais utilisée.
- **Écran projeté (V1)** : le contenu d'origine, illisible, est remplacé par un tableau de bord Meta Ads (`src/ecran_dashboard.html`). Il est rendu comme une projection sur le mur, et les personnes ne sont pas retouchées.
- **Images figées** : `images/` contient la photo du formateur, la photo de la salle et le badge du logo, exactement comme dans les visuels livrés.

## Régénérer

Pour rendre les deux PNG à partir de `images/`, lancez `./src/exporter.sh` (il faut Chromium/Playwright et Pillow). Ce script ne touche pas aux photos.

`python3 src/prep_photos.py` refait les photos à partir des originaux. Il écrit dans `build/`, et il faut ensuite recopier les fichiers dans `images/`.

## À vérifier

Les visuels affichent **samedi 28 et dimanche 29 novembre 2026**, comme demandé. Or la landing, les e-mails automatiques, les rappels et les liens d'agenda annoncent toujours **lundi 30 novembre**. Il faut aligner ces dates avant de publier.
