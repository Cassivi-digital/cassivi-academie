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

## Version courte v2 avec l'offre (`export/version_30s_v2/`, 38 s)

Hook méta → MEDIA BUYER → logos Meta Ads / Google Ads → stack tracking (GA4, Tag Manager, Search Console, Pixel Meta, API Conversions) → acquisition client incluse (suivi 1 mois) → pour qui (e-commerçant, entrepreneur, futur freelance) → 2 jours en salle à Antsakaviro, sam. 21 & lun. 23 nov., 8h–17h → 350 000 Ar, acompte 50 000 Ar, prérequis (ordinateur portable, carte Visa activable sur place) → urgence + CTA WhatsApp/QR. Formats 9:16, 4:5, 1:1, 16:9. Logos : tracés Simple Icons (CC0), marques de leurs propriétaires.

Rejouer : `python3 src/voice30v2_edit.py && python3 src/sfx30v2.py build/cues30v2.json audio/sfx30v2.wav <durée> && src/render30v2_all.sh` avec, entre les deux, `src/mix30.sh build/cues30v2.json audio/voice30v2_edit.wav audio/music30v2_edit.wav audio/sfx30v2.wav audio/mix30v2_final.wav`.

## Version v3 sans date (`export/version_v3_sans_date/`, 39,8 s)

C'est la v3, avec seulement deux modifications.
1. **Date retirée** : à l'écran, dans la voix (phrase coupée au montage) et dans les sous-titres. Les horaires 8h–17h sont conservés.
2. **Silence optimisé avant le CTA** : une respiration courte après « Places très limitées ! ». Le badge s'efface, la musique passe un instant en sourdine (filtre passe-bas, −6 dB) et le CTA arrive sur le temps fort de la mesure. Le blanc pur ne dure qu'environ 0,1 s.

Formats : 9:16, 4:5, 1:1, 16:9, plus une version WhatsApp légère. Le rendu est en qualité maximale : captures PNG sans perte, puis intermédiaire RGB sans perte, puis un seul encodage H.264 (CRF 12, BT.709) avec un son AAC 320 kb/s.

Rejouer :
```
python3 src/voice30v3b_edit.py
python3 src/music30v3b_edit.py
python3 src/sfx30v3b.py build/cues30v3b.json audio/sfx30v3b.wav <durée>
src/mix30.sh build/cues30v3b.json audio/voice30v3b_edit.wav audio/music30v3b_edit.wav audio/sfx30v3b.wav audio/mix30v3b_final.wav
src/render_v3b_all.sh
python3 src/qc_v3b.py
python3 src/package_zip.py export/version_v3_sans_date CASSIVI_MediaBuyer_v3_sans-date CASSIVI_MediaBuyer_v3_sans-date "CASSIVI DIGITAL MG — Formation Media Buyer — v3 sans date"
```
Le ZIP (non versionné) contient les fichiers renommés par plateforme et un LISEZ-MOI.

## Modèle « Formation Media Buyer pilotée par l'IA » (`export/version_IA/`, 44 s)

Nouveau modèle construit sur le moteur de la v3. Il contient :
- le hook méta avec le tampon « avec l'IA » ;
- MEDIA BUYER « piloté par l'IA » ;
- le **cockpit Claude réaliste** : fenêtre 3D, connecteurs Meta Ads, Google Ads, GA4, Tag Manager, Search Console, Sheets, Shopify et HubSpot, skills, demande et appels d'outils synchronisés avec la voix, mention « Simulation » ;
- les compétences très recherchées et « Deviens freelance » ;
- « Idéale pour » : e-commerçants, entrepreneurs, PME, agences, community managers, étudiants et futurs freelances ;
- l'offre « dispensée par CASSIVI DIGITAL MG » avec des formateurs expérimentés (photos réelles) ;
- les infos pratiques, puis le CTA WhatsApp avec un blanc minimal.

La voix off française est « Etienne » (Cartesia, via Speko) ; ElevenLabs était saturé. La prononciation a été vérifiée par transcription. Les logos viennent de Simple Icons 16.37 (`src/brand_icons_ia.js`).

Rejouer :
```
python3 src/voice_ia_edit.py
python3 src/music_ia_edit.py
python3 src/sfx_ia.py build/cues_ia.json audio/sfx_ia.wav <durée>
src/mix30.sh build/cues_ia.json audio/voice_ia_edit.wav audio/music_ia_edit.wav audio/sfx_ia.wav audio/mix_ia_final.wav
src/render_ia_all.sh
python3 src/qc_ia.py
python3 src/package_zip.py export/version_IA CASSIVI_MediaBuyer_IA CASSIVI_MediaBuyer_IA "CASSIVI DIGITAL MG — Formation Media Buyer pilotée par l'IA"
```

## VERSION FINALE — voix « Nicolas » (`export/version_finale/`, 58 s)

La version finale garde les scènes du modèle IA qui fonctionnaient, les recale sur la voix off ElevenLabs « Nicolas » (texte exact fourni par le client) et les renforce :
- **Sa mission** en 3 grandes cartes : la bonne pub, les bons clients, faire grandir les ventes.
- **Cockpit Claude** en pages plein écran, plus lisibles : connecteurs, skills, conversation avec les appels d'outils, tableau de bord KPI, puis « Analyse prête en 3 min ». La mention « SIMULATION » reste affichée.
- **Nouvelle scène « l'IA ne décide pas seule »** : Claude propose un plan (stratégie, budget, créatives). Le curseur « Media buyer » coche chaque point puis clique sur Valider, et le tampon « VALIDÉ PAR LE MEDIA BUYER » apparaît.
- **Nouveau manifeste** : « L'IA ACCÉLÈRE. » (traînées de vitesse, logo Claude), puis « L'EXPERT DÉCIDE. » en or.
- **Grand logo CASSIVI DIGITAL MG** sur « par CASSIVI DIGITAL MG ». L'offre passe maintenant avant les publics, dans l'ordre de la voix.
- **Typographie agrandie** dans les 4 formats. Les infos pratiques passent sur 2 lignes en vertical. Les textes suivent la voix : « Une compétence très recherchée », « Décrocher des clients », « Devenir freelance », « Places limitées ».
- **Musique** : même morceau 120 BPM. Le passage 41,54→57,54 s (8 mesures) est rejoué une fois, sans décaler la grille des temps, et l'outro finit naturellement à 58,06 s. Avant le CTA, une sourdine courte de 0,3 s tombe sur le temps fort.

La voix (−22,5 LUFS à l'origine) est ramenée à −15,8 LUFS, le niveau validé au mixage du modèle IA, avec +7 dB et un limiteur de crêtes. Elle passe ensuite par la même chaîne que les autres versions. Master : −14 LUFS / −1,5 dBTP.

Rejouer :
```
python3 src/voice_final_edit.py        # montage voix, repères, sous-titres, voix de mixage
python3 src/music_final_edit.py
python3 src/sfx_final.py build/cues_final.json audio/sfx_final.wav 58.165
src/mix30.sh build/cues_final.json audio/voice_final_mix.wav audio/music_final_edit.wav audio/sfx_final.wav audio/mix_final_v.wav
src/render_final_all.sh
python3 src/srt_final.py
python3 src/qc_final.py
python3 src/package_zip.py export/version_finale CASSIVI_MediaBuyer_Final CASSIVI_MediaBuyer_VERSION-FINALE "CASSIVI DIGITAL MG — Formation Media Buyer pilotée par l'IA — VERSION FINALE"
```
Aperçus : `PAGE=pub_final.html src/sheet30.sh nom 1080 1920 build/cues_final.json 0.5 12.5 …`

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
