#!/usr/bin/env bash
# Régénère tout : écran projeté, photos, puis les deux visuels Facebook 4:5 (1080 × 1350, PNG sRGB).
set -euo pipefail
cd "$(dirname "$0")/.."
node src/rendu.js src/ecran_dashboard.html build/ecran_dashboard.png 1200 730
python3 src/prep_photos.py
node src/rendu.js src/visuel_v1_formateur.html build/rendu_v1.png 1080 1350
node src/rendu.js src/visuel_v2_salle.html build/rendu_v2.png 1080 1350
python3 - <<'PY'
from PIL import Image, ImageCms
icc = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
for src, dst in [('build/rendu_v1.png', 'export/CASSIVI_MediaBuyerIA_Facebook_4x5_V1_Formateur.png'),
                 ('build/rendu_v2.png', 'export/CASSIVI_MediaBuyerIA_Facebook_4x5_V2_Salle.png')]:
    im = Image.open(src).convert('RGB')
    assert im.size == (1080, 1350), im.size
    im.save(dst, 'PNG', optimize=True, icc_profile=icc)
    print(dst, im.size)
PY
