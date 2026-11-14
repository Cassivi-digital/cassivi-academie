"""Prépare les images, le logo, les icônes et la vidéo de la landing (site/assets).

usage : python3 outils/prepare_assets.py   (depuis landing-media-buyer/)
Sources : ../video-pub (photos réelles des sessions, logo, vidéo 4:5 finale).
La photo portrait personnelle (photo_portrait.jpg / portrait.jpg) n'est jamais utilisée.
"""
import os, re, subprocess
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                      # landing-media-buyer
VP = os.path.join(os.path.dirname(ROOT), 'video-pub')
IMG = os.path.join(ROOT, 'site', 'assets', 'img')
VID = os.path.join(ROOT, 'site', 'assets', 'video')
SITE = os.path.join(ROOT, 'site')
os.makedirs(IMG, exist_ok=True); os.makedirs(VID, exist_ok=True)

def webp(im, name, widths, q=80):
    for w in widths:
        h = round(im.height * w / im.width)
        out = os.path.join(IMG, f'{name}-{w}.webp')
        im.resize((w, h), Image.LANCZOS).save(out, 'WEBP', quality=q, method=6)
        print(f'{out}  {w}x{h}  {os.path.getsize(out)//1024} Ko')

src = lambda p: Image.open(os.path.join(VP, p)).convert('RGB')

# --- photos réelles des sessions (filigranes d'appareil retirés par recadrage)
webp(src('build/img/classe.jpg'), 'classe', [1152, 640])
webp(src('build/img/formateur.jpg').crop((0, 0, 1152, 760)), 'formateur', [1152, 640])
webp(src('build/img/pratique.jpg').crop((0, 60, 864, 1152)), 'pratique', [864, 480])
webp(src('build/img/participantes.jpg'), 'participantes', [1200, 640])

# --- logo (badge rond, fond transparent)
badge = Image.open(os.path.join(VP, 'build/img/logo_badge.png')).convert('RGBA')
badge.resize((96, 96), Image.LANCZOS).save(os.path.join(IMG, 'logo-badge-96.webp'), 'WEBP', quality=90, method=6)
badge.resize((192, 192), Image.LANCZOS).save(os.path.join(HERE, 'logo-badge-192.png'), optimize=True)   # pour l'image de partage
NAVY = (10, 27, 63, 255)
def on_navy(size, pad=0.08):
    bg = Image.new('RGBA', (size, size), NAVY)
    inner = round(size * (1 - 2 * pad))
    bg.alpha_composite(badge.resize((inner, inner), Image.LANCZOS), (round(size * pad),) * 2)
    return bg
on_navy(180).convert('RGB').save(os.path.join(SITE, 'apple-touch-icon.png'), optimize=True)
badge.resize((32, 32), Image.LANCZOS).save(os.path.join(SITE, 'favicon-32.png'), optimize=True)
badge.save(os.path.join(SITE, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])

# --- vidéo 4:5 allégée (lecture à la demande), affiche et sous-titres
master = os.path.join(VP, 'export/version_finale/CASSIVI_MediaBuyer_Final_4x5.mp4')
out = os.path.join(VID, 'media-buyer-4x5.mp4')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', master, '-vf', 'scale=720:900:flags=lanczos',
                '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'slow', '-crf', '27',
                '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', out], check=True)
print(out, os.path.getsize(out) // 1024, 'Ko')
poster_png = os.path.join(VID, '_poster.png')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '41.5', '-i', master, '-frames:v', '1', poster_png], check=True)
p = Image.open(poster_png).convert('RGB')
p.resize((720, 900), Image.LANCZOS).save(os.path.join(VID, 'poster-4x5.webp'), 'WEBP', quality=82, method=6)
p.resize((360, 450), Image.LANCZOS).save(os.path.join(VID, 'poster-4x5-360.webp'), 'WEBP', quality=80, method=6)
os.remove(poster_png)

srt = open(os.path.join(VP, 'export/version_finale/CASSIVI_MediaBuyer_Final_sous-titres.srt'), encoding='utf-8').read()
vtt = 'WEBVTT\n\n' + re.sub(r'(\d\d:\d\d:\d\d),(\d\d\d)', r'\1.\2', srt.strip()) + '\n'
open(os.path.join(VID, 'sous-titres-fr.vtt'), 'w', encoding='utf-8').write(vtt)
print('ok')
