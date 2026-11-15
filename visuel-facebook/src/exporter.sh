#!/usr/bin/env bash
# Rend les deux visuels Facebook 4:5 (1080 × 1350, PNG sRGB) à partir des images figées de images/
# (photos réelles et logo, conservés à l'identique). Ne régénère pas les photos.
# Pour refaire les photos à partir des originaux : python3 src/prep_photos.py (sortie dans build/, à recopier dans images/).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p build export
node src/rendu.js src/visuel_v1_formateur.html build/rendu_v1.png 1080 1350 >/dev/null
node src/rendu.js src/visuel_v2_salle.html build/rendu_v2.png 1080 1350 >/dev/null
python3 - <<'PY'
from PIL import Image, ImageCms
icc = ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB')).tobytes()
for src, dst in [('build/rendu_v1.png', 'export/CASSIVI_MediaBuyerIA_Facebook_4x5_V1_Formateur_optimise.png'),
                 ('build/rendu_v2.png', 'export/CASSIVI_MediaBuyerIA_Facebook_4x5_V2_Salle_optimise.png')]:
    im = Image.open(src).convert('RGB')
    assert im.size == (1080, 1350), im.size
    im.save(dst, 'PNG', optimize=True, icc_profile=icc)
    print(dst, im.size)
PY
