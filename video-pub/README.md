# Publicité « Formation Media Buyer Freelance » — CASSIVI DIGITAL MG

Vidéo publicitaire en motion design, entièrement générée par code (rendu image par image, aucun template).

## Livrables (`export/`)

| Fichier | Format | Usage |
|---|---|---|
| `CASSIVI_MediaBuyer_9x16.mp4` | 1080×1920, 30 i/s, H.264 High, AAC 256 kb/s, −14 LUFS, 75,6 s, 53 Mo | Reels Facebook/Instagram, TikTok, Shorts |
| `CASSIVI_MediaBuyer_9x16_WhatsApp.mp4` | 720×1280, 9 Mo | Envoi WhatsApp (messages, groupes) |
| `CASSIVI_MediaBuyer_16x9.mp4` | 1920×1080, 30 i/s, H.264, AAC, 12,6 Mo | Fil Facebook, YouTube, écrans |
| `CASSIVI_MediaBuyer_couverture.jpg` | 1080×1920 | Image de couverture du Reel |
| `CASSIVI_MediaBuyer_sous-titres.srt` | SRT | Sous-titres (lecture sans le son) |
| `logo_cassivi_corrige.png` | 1024×1024 | Logo avec l'orthographe corrigée (CASSIVI, 2 S) |

## Version courte 30 s (`export/version_30s/`)

Une seule animation responsive (`src/pub30.html?w=…&h=…`), mise en page native pour chaque format :

| Fichier | Format | Plateformes |
|---|---|---|
| `CASSIVI_MediaBuyer_30s_9x16.mp4` | 1080×1920 | Reels, TikTok, Shorts, Stories, Statut WhatsApp |
| `CASSIVI_MediaBuyer_30s_4x5.mp4` | 1080×1350 | Fil Instagram / Facebook, LinkedIn mobile |
| `CASSIVI_MediaBuyer_30s_1x1.mp4` | 1080×1080 | Fil LinkedIn / Facebook |
| `CASSIVI_MediaBuyer_30s_16x9.mp4` | 1920×1080 | LinkedIn ordinateur, YouTube, Facebook in-stream |

Concept : hook « méta » (la pub elle-même, révélée dans le gestionnaire de publicités qui la pilote), drop musical sur « MEDIA BUYER », rafale de compétences sur photos réelles, calcul freelance (exemple illustratif), vraies sessions en salle, urgence, CTA WhatsApp + QR. Textes de publication prêts dans `TEXTES_PUBLICATION.md`.

Rejouer : `python3 src/voice30_edit.py && python3 src/sfx30.py build/cues30.json audio/sfx30.wav <durée> && src/render30_all.sh`.

## Structure narrative (AIDA)

| Temps | Scène | Rôle |
|---|---|---|
| 0–4 s | Hook : « Et si une compétence digitale… devenait ton vrai métier ? » | Attention |
| 4–14 s | Le problème : budget dépensé sans pilotage, coût par client qui s'envole | Intérêt |
| 14–25 s | Le métier : Media Buyer, réseau de compétences (Meta, Google Ads, Pixel, GA4…) | Intérêt |
| 25–36 s | Le freelancing : 300 € → 1 000 € → 2 100 €/mois (exemples illustratifs) | Désir |
| 36–47 s | Transparence + travail à distance | Réduction des objections |
| 47–59 s | La formation CASSIVI DIGITAL MG (photos réelles des sessions) | Désir |
| 59–65 s | Urgence : inscriptions ouvertes, Antsakaviro, places très limitées | Action |
| 65–75,6 s | CTA : WhatsApp 037 59 755 12 + QR code vérifié | Action |

## Pipeline technique

1. `src/pub.html` : moteur d'animation déterministe (`render(t)`), typographie cinétique, data-viz, transitions (zoom-through, wipe en anneau, iris, morphing photo→logo, balayage).
2. `src/voice_edit.py` : montage de la voix off (silences resserrés, tempo +10 % sans changement de hauteur) et calcul automatique des repères d'animation (`build/cues.json`).
3. `src/sfx.py` : sound design procédural synchronisé sur les repères (whooshes, impacts, risers, UI).
4. `src/mix.sh` : traitement de la voix (EQ, de-esser, compression), ducking sidechain de la musique, master −14 LUFS / −1,5 dBTP.
5. `src/render.sh` : rendu parallèle Chromium → ffmpeg (H.264).

Rejouer : `python3 src/voice_edit.py && python3 src/sfx.py build/cues.json audio/sfx.wav <durée> && src/mix.sh && src/render.sh <durée> build/video_9x16_silent.mp4 build/cues.json 4`.

## Points d'attention

- Le logo fourni et l'écran TV de la photo d'équipe affichaient « CASSSIVI » (3 S). Seul le texte a été corrigé en « CASSIVI » (même typographie, même graisse, même ombre). Les originaux sont conservés (`assets/logo_original.jpg`, `assets/photo_equipe.jpg`). À corriger aussi à la source sur vos autres supports.
- Les montants freelance sont présentés comme exemples illustratifs de tarification, avec la mention « Revenus non garantis » à l'écran.
- Les tableaux de bord sont des simulations (étiquette « SIMULATION ») ; aucune statistique, aucun témoignage inventés. Les captures LinkedIn de tiers fournies n'ont pas été utilisées (ce n'étaient pas des résultats CASSIVI).
- QR code : `https://wa.me/261375975512?text=Réservation formation Media Buyer`, décodé et vérifié sur l'image finale.
