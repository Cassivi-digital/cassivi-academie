# Visuels Facebook · MEDIA BUYER IA (CASSIVI DIGITAL MG)

Deux visuels fixes pour le fil d'actualité Facebook et Instagram : **1080 × 1350 px, format 4:5, PNG sRGB**.

| Fichier | Contenu |
|---|---|
| `export/CASSIVI_MediaBuyerIA_Facebook_4x5_V1_Formateur.png` | Photo réelle du formateur devant l'écran, texte sur fond blanc, prix dans un bandeau bleu nuit |
| `export/CASSIVI_MediaBuyerIA_Facebook_4x5_V2_Salle.png` | Fond blanc, titre en haut, photo réelle de la salle pleine, prix dans une carte blanche |

- **Logo** : le logo officiel (`video-pub/assets/logo_cassivi_corrige.png`, orthographe CASSIVI corrigée), seulement détouré en rond comme sur la landing. Il n'est ni redessiné ni déformé.
- **Photos** : photos réelles des sessions (`video-pub/assets`). Le filigrane de l'appareil photo est retiré et les couleurs sont corrigées de façon naturelle. La photo portrait personnelle n'est jamais utilisée.
- **Écran projeté (V1)** : le contenu d'origine, illisible, est remplacé par un tableau de bord Meta Ads (`src/ecran_dashboard.html`). Il est rendu comme une projection sur le mur, et les personnes ne sont pas retouchées.

Pour tout régénérer, lancez `./src/exporter.sh` (il faut Chromium/Playwright, Python, OpenCV et Pillow).
