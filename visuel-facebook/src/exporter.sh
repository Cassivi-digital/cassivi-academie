#!/usr/bin/env bash
# Rend les deux visuels Facebook 4:5 (1080 × 1350, PNG sRGB) à partir des images figées de images/
# (photos réelles et logo, conservés à l'identique). Ne régénère pas les photos.
# Pour refaire les photos à partir des originaux : python3 src/prep_photos.py (sortie dans build/, à recopier dans images/).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build export
node src/rendu.js src/visuel_v1_formateur.html build/rendu_v1.png 1080 1350 >/dev/null
node src/rendu.js src/visuel_v2_salle.html build/rendu_v2.png 1080 1350 >/dev/null
python3 src/formats_meta.py >/dev/null
node src/rendu.js src/visuel_v2_salle_1x1.html build/rendu_1x1.png 1080 1080 >/dev/null
node src/rendu.js src/visuel_v2_salle_9x16.html build/rendu_9x16.png 1080 1920 >/dev/null
node src/rendu.js src/visuel_v2_salle_191x1.html build/rendu_191x1.png 1200 628 >/dev/null
mkdir -p export/meta_ads
python3 - <<'PY'
from PIL import Image, ImageCms
icc = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
for src, dst in [('build/rendu_v1.png', 'export/CASSIVI_MediaBuyerIA_Facebook_4x5_V1_Formateur_optimise.png'),
                 ('build/rendu_v2.png', 'export/CASSIVI_MediaBuyerIA_Facebook_4x5_V2_Salle_optimise.png'),
                 ('build/rendu_1x1.png', 'export/meta_ads/CASSIVI_MediaBuyerIA_Meta_1x1_Fil_1080x1080.png'),
                 ('build/rendu_9x16.png', 'export/meta_ads/CASSIVI_MediaBuyerIA_Meta_9x16_Stories-Reels_1080x1920.png'),
                 ('build/rendu_191x1.png', 'export/meta_ads/CASSIVI_MediaBuyerIA_Meta_1.91x1_Colonne-droite-Recherche_1200x628.png')]:
    im = Image.open(src).convert('RGB')
    attendu = {'1x1': (1080, 1080), '9x16': (1080, 1920), '191x1': (1200, 628)}.get(src.split('rendu_')[1][:-4], (1080, 1350))
    assert im.size == attendu, (src, im.size)
    im.save(dst, 'PNG', optimize=True, icc_profile=icc)
    print(dst, im.size)
PY
