"""Préparation des images du visuel Facebook « MEDIA BUYER IA ».

- Badge rond du logo CASSIVI DIGITAL MG (le vrai logo, orthographe corrigée,
  simplement détouré en cercle comme sur la landing : aucune déformation).
- Photos réelles des sessions : filigrane d'appareil retiré, étalonnage naturel.
- Photo du formateur : l'écran projeté affiche un tableau de bord Meta Ads
  (rendu « projecteur » : lumière ajoutée sur le mur, sans toucher aux personnes).

usage : python3 src/prep_photos.py
"""
import os
import numpy as np
import cv2
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SRC = os.path.join(ROOT, 'video-pub', 'assets')
B = os.path.join(ROOT, 'visuel-facebook', 'build')
os.makedirs(B, exist_ok=True)
rng = np.random.default_rng(7)


def badge():
    logo = Image.open(os.path.join(SRC, 'logo_cassivi_corrige.png')).convert('RGB')
    cx, cy, r = 512, 511, 470
    crop = logo.crop((cx - r, cy - r, cx + r, cy + r))
    ss = 4
    m = Image.new('L', (2 * r * ss, 2 * r * ss), 0)
    ImageDraw.Draw(m).ellipse((0, 0, 2 * r * ss - 1, 2 * r * ss - 1), fill=255)
    crop.putalpha(m.resize((2 * r, 2 * r), Image.LANCZOS))
    crop.save(os.path.join(B, 'logo_badge.png'))


def grade(img, wb=0.45, gamma=0.9, curve=0.22, vib=0.10, denoise=3, sharpen=0.35):
    """Étalonnage naturel : débruitage léger, balance des blancs partielle,
    exposition, contraste doux en S, vibrance modérée, netteté légère."""
    if denoise:
        img = cv2.fastNlMeansDenoisingColored(img, None, denoise, denoise, 7, 21)
    f = img.astype(np.float32) / 255.0
    means = f.reshape(-1, 3).mean(0)
    f = np.clip(f * (means.mean() / means) ** wb, 0, 1)
    f = f ** gamma
    s = f * f * (3 - 2 * f)
    f = f * (1 - curve) + s * curve
    hsv = cv2.cvtColor((f * 255).astype(np.uint8), cv2.COLOR_BGR2HSV).astype(np.float32)
    sat = hsv[..., 1] / 255.0
    hsv[..., 1] = np.clip(sat + vib * sat * (1 - sat), 0, 1) * 255
    out = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    if sharpen:
        blur = cv2.GaussianBlur(out, (0, 0), 1.1)
        out = cv2.addWeighted(out, 1 + sharpen, blur, -sharpen, 0)
    return out


def inpaint_watermark(img, box, thr=165):
    x0, y0, x1, y1 = box
    roi = cv2.cvtColor(img[y0:y1, x0:x1], cv2.COLOR_BGR2GRAY)
    wm = (roi > thr).astype(np.uint8) * 255
    wm = cv2.dilate(wm, np.ones((5, 5), np.uint8), iterations=1)
    mask = np.zeros(img.shape[:2], np.uint8)
    mask[y0:y1, x0:x1] = wm
    return cv2.inpaint(img, mask, 7, cv2.INPAINT_TELEA)


def projection(img, dash_path, quad, k=0.64):
    """Remplace le contenu projeté par le tableau de bord, façon vidéoprojecteur :
    la lumière s'ajoute au mur, les personnes et l'appareil restent intacts."""
    H, W = img.shape[:2]
    x0, y0 = int(quad[:, 0].min()) - 8, int(quad[:, 1].min()) - 8
    x1, y1 = int(quad[:, 0].max()) + 8, int(quad[:, 1].max()) + 8
    f = img.astype(np.float32)
    lum = 0.114 * f[..., 0] + 0.587 * f[..., 1] + 0.299 * f[..., 2]
    warm = f[..., 2] - f[..., 0]  # R - B : élevé sur la peau, faible sur le mur et l'ancien texte vert
    wall = np.clip((lum - 148) / 12, 0, 1) * np.clip((54 - warm) / 8, 0, 1)
    # les petites taches isolées (reste de l'ancien contenu) font partie du mur ;
    # seuls les vrais obstacles (main, bras, vidéoprojecteur, trépied) sont épargnés
    sub = wall[y0:y1, x0:x1]
    occl = (sub < 0.5).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(occl, connectivity=8)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] < 80:
            sub[lab == i] = 1.0
    wall = cv2.erode(wall, np.ones((3, 3), np.uint8))
    region = np.zeros((H, W), np.uint8)
    region[y0:y1, x0:x1] = 1

    # 1) effacer l'ancien contenu (traits clairs fins) sur le mur
    L = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)[..., 0]
    tophat = cv2.morphologyEx(L, cv2.MORPH_TOPHAT, cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11)))
    lines = ((tophat > 3) & (region == 1) & (wall > 0.5)).astype(np.uint8) * 255
    lines = cv2.dilate(lines, np.ones((3, 3), np.uint8))
    clean = cv2.inpaint(img, lines, 5, cv2.INPAINT_TELEA)
    # lissage doux du mur dans la zone (garde le dégradé d'éclairage)
    smooth = cv2.bilateralFilter(clean, 9, 18, 7)
    wr = (wall * region)[..., None]
    clean = (clean * (1 - wr) + smooth * wr).astype(np.uint8)

    # 2) déformer le tableau de bord sur le quadrilatère (suréchantillonnage x4)
    dash = cv2.imread(dash_path)
    hd, wd = dash.shape[:2]
    S = 4
    src_q = np.float32([[0, 0], [wd, 0], [wd, hd], [0, hd]])
    M = cv2.getPerspectiveTransform(src_q, (quad * S).astype(np.float32))
    big = cv2.warpPerspective(dash, M, (W * S, H * S), flags=cv2.INTER_AREA, borderValue=(0, 0, 0))
    qm = np.zeros((H * S, W * S), np.uint8)
    cv2.fillConvexPoly(qm, (quad * S).astype(np.int32), 255)
    warp = cv2.resize(big, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    qmask = cv2.resize(qm, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.0
    warp = cv2.GaussianBlur(warp, (0, 0), 0.55)
    qmask = cv2.GaussianBlur(qmask, (0, 0), 0.9)
    # point chaud du projecteur : plus lumineux au centre, plus doux dans les coins
    cxq, cyq = quad[:, 0].mean(), quad[:, 1].mean()
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    rq = np.sqrt(((xx - cxq) / (np.ptp(quad[:, 0]) / 2)) ** 2 + ((yy - cyq) / (np.ptp(quad[:, 1]) / 2)) ** 2)
    warp = warp * np.clip(1.0 - 0.13 * rq ** 2, 0.8, 1.0)[..., None]

    # 3) lumière projetée (mode « superposition écran ») + grain du capteur
    fc = clean.astype(np.float32)
    lit = 255 - (255 - fc) * (1 - k * warp)
    grain = rng.normal(0, 2.2, fc.shape).astype(np.float32)
    lit = lit + grain
    a = (cv2.GaussianBlur(wall, (0, 0), 0.6) * qmask)[..., None]
    out = fc * (1 - a) + lit * a
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    badge()

    # Formateur devant l'écran (V1)
    img = cv2.imread(os.path.join(SRC, 'photo_formateur.jpg'))
    img = inpaint_watermark(img, (20, 770, 270, 850))
    quad = np.float32([[538, 255], [747, 259], [745, 385], [540, 383]])
    img = projection(img, os.path.join(B, 'ecran_dashboard.png'), quad)
    out = grade(img, wb=0.45, gamma=0.88, curve=0.24, vib=0.10, denoise=3, sharpen=0.35)
    cv2.imwrite(os.path.join(B, 'photo_formateur.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 96])
    zoom = out[220:420, 480:860]
    cv2.imwrite(os.path.join(B, 'controle_ecran.png'), cv2.resize(zoom, None, fx=3, fy=3, interpolation=cv2.INTER_LANCZOS4))

    # Participants en pratique (V2)
    img = cv2.imread(os.path.join(SRC, 'photo_pratique.jpg'))
    out = grade(img, wb=0.5, gamma=0.86, curve=0.24, vib=0.10, denoise=3, sharpen=0.35)
    cv2.imwrite(os.path.join(B, 'photo_pratique.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 96])

    # Salle complète (option V2)
    img = cv2.imread(os.path.join(SRC, 'photo_classe.jpg'))
    out = grade(img, wb=0.55, gamma=0.84, curve=0.24, vib=0.08, denoise=3, sharpen=0.35)
    cv2.imwrite(os.path.join(B, 'photo_classe.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 96])
    print('images prêtes dans', B)


if __name__ == '__main__':
    main()
