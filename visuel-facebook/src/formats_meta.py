"""Déclinaisons Meta Ads du visuel V2 (Salle) : 1:1, 9:16 et 1.91:1.

Les blocs (logo, textes, photo, dates, bouton, WhatsApp, mention) sont copiés tels quels
depuis src/visuel_v2_salle.html (le 4:5 validé) : seul l'agencement change selon le format.
usage : python3 src/formats_meta.py
"""
import os
import re

SRC = os.path.join(os.path.dirname(__file__), 'visuel_v2_salle.html')
s = open(SRC, encoding='utf-8').read()


def one(pattern):
    m = re.findall(pattern, s, flags=re.S)
    assert len(m) == 1, (pattern, len(m))
    return m[0]


B = {
    'brand': one(r'<div class="brand">.*?</div>'),
    'live': one(r'<div class="live">.*?</div>'),
    'eyebrow': one(r'<div class="eyebrow">.*?</div>'),
    'h1': one(r'<h1>.*?</h1>'),
    'sub': one(r'<p class="sub">.*?</p>'),
    'chips': one(r'<div class="chips">.*?</div>'),
    'points': one(r'<ul class="points">.*?</ul>'),
    'when': one(r'<div class="when">.*?</div>\s*</div>\s*</div>'),
    'action': one(r'<div class="action">.*?</svg><span>WhatsApp&nbsp;:</span><b>037 59 755 12</b></div>\s*</div>'),
    'img': one(r'<img src="\.\./images/photo_classe\.jpg" alt="">'),
    'band': one(r'<div class="band">.*?</div>'),
}

PAGE = '''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>MEDIA BUYER IA · V2 Salle · {titre}</title>
<link rel="stylesheet" href="commun.css">
<style>
  html, body, .canvas {{ width: {w}px; height: {h}px; }}
  .photo {{ position: absolute; overflow: hidden; }}
  .photo img {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
  .eyebrow {{ display: flex; align-items: center; font-weight: 800; color: var(--blue); white-space: nowrap; }}
  .eyebrow::before {{ content: ''; border-radius: 2px; background: var(--cyan); }}
  .chips {{ display: flex; }}
  .chips span {{ display: inline-flex; align-items: center; border-radius: 999px; background: #fff; border: 2px solid var(--line);
    font-weight: 700; color: var(--navy); white-space: nowrap; }}
  .panel {{ position: absolute; display: flex; align-items: center; justify-content: space-between; }}
{css}
</style>
</head>
<body>
<div class="canvas">
{body}
</div>
</body>
</html>
'''

# ---------- 9:16 · Stories et Reels (1080 × 1920) ----------
# Textes et bouton dans la zone sûre (sous les 270 px du haut, au-dessus des ~670 px du bas couverts en Reels).
css_916 = '''
  .canvas { background: radial-gradient(1000px 760px at 100% 14%, #EEF4FF 0%, #FFFFFF 62%); }
  .head { position: absolute; left: 48px; right: 48px; top: 270px; display: flex; align-items: center; justify-content: space-between; }
  .head .brand img { width: 96px; height: 96px; }
  .head .brand span { font-size: 30px; }
  .intro { position: absolute; left: 48px; right: 48px; top: 410px; }
  .eyebrow { gap: 16px; font-size: 25px; letter-spacing: .12em; }
  .eyebrow::before { width: 44px; height: 4px; }
  h1 { font-size: 110px; margin-top: 16px; }
  .sub { font-size: 34px; line-height: 1.28; margin-top: 16px; max-width: 960px; }
  .chips { gap: 12px; margin-top: 22px; }
  .chips span { height: 50px; padding: 0 21px; font-size: 25px; }
  .panel { left: 40px; right: 40px; top: 872px; padding: 24px 28px; border-radius: 26px; background: #fff;
    border: 2px solid #E3EAF7; box-shadow: 0 12px 28px -20px rgb(11 27 63 / .3); }
  .band { top: 1062px; bottom: auto; left: 40px; right: 40px; height: 68px; border-radius: 18px; }
  .photo { left: 40px; right: 40px; top: 1162px; bottom: 40px; border-radius: 34px; box-shadow: 0 16px 34px -26px rgb(11 27 63 / .45); }
  .photo img { object-position: 50% 35%; }
'''
body_916 = f'''  <div class="head">{B['brand']}{B['live']}</div>
  <div class="intro">{B['eyebrow']}{B['h1']}{B['sub']}{B['chips']}{B['points']}</div>
  <div class="panel">{B['when']}{B['action']}</div>
  {B['band']}
  <div class="photo">{B['img']}</div>'''

# ---------- 1:1 · Fil carré (1080 × 1080) ----------
css_11 = '''
  .canvas { background: radial-gradient(800px 560px at 100% 0%, #EEF4FF 0%, #FFFFFF 62%); }
  .head { position: absolute; left: 40px; right: 40px; top: 34px; display: flex; align-items: center; justify-content: space-between; }
  .head .brand img { width: 84px; height: 84px; }
  .head .brand span { font-size: 28px; }
  .live { height: 50px; font-size: 19px; padding: 0 22px 0 19px; }
  .intro { position: absolute; left: 40px; right: 40px; top: 142px; }
  .eyebrow { gap: 14px; font-size: 22px; letter-spacing: .12em; }
  .eyebrow::before { width: 40px; height: 4px; }
  h1 { font-size: 98px; margin-top: 10px; }
  .sub { font-size: 31px; line-height: 1.24; margin-top: 10px; max-width: 760px; }
  .chips { gap: 10px; margin-top: 16px; }
  .chips span { height: 44px; padding: 0 18px; font-size: 23px; }
  .points { margin-top: 14px; gap: 6px; }
  .points li { font-size: 23px; }
  .points svg { width: 27px; height: 27px; }
  .photo { left: 36px; right: 36px; top: 548px; bottom: 76px; border-radius: 30px; box-shadow: 0 14px 30px -24px rgb(11 27 63 / .45); }
  .photo img { object-position: 50% 30%; }
  .panel { left: 56px; right: 56px; bottom: 92px; padding: 16px 22px; border-radius: 22px; background: #fff;
    box-shadow: 0 12px 26px -16px rgb(11 27 63 / .38); }
  .when > svg { width: 38px; height: 38px; }
  .when .dates { font-size: 30px; }
  .when .tarif { font-size: 21px; margin-top: 6px; }
  .action { gap: 10px; }
  .cta { height: 64px; font-size: 21px; padding: 0 22px 0 26px; }
  .cta svg { width: 22px; height: 22px; }
  .wa { font-size: 22px; }
  .wa svg { width: 30px; height: 30px; }
  .band { height: 58px; font-size: 20px; }
'''
body_11 = f'''  <div class="head">{B['brand']}{B['live']}</div>
  <div class="intro">{B['eyebrow']}{B['h1']}{B['sub']}{B['chips']}{B['points']}</div>
  <div class="photo">{B['img']}</div>
  <div class="panel">{B['when']}{B['action']}</div>
  {B['band']}'''

# ---------- 1.91:1 · Colonne de droite et Recherche (1200 × 628) ----------
css_191 = '''
  .canvas { background: radial-gradient(760px 520px at 0% 0%, #EEF4FF 0%, #FFFFFF 62%); }
  .left { position: absolute; left: 34px; top: 24px; width: 586px; }
  .left .brand img { width: 58px; height: 58px; }
  .left .brand span { font-size: 21px; }
  .left .brand { gap: 12px; }
  .eyebrow { gap: 10px; font-size: 15px; letter-spacing: .12em; margin-top: 18px; }
  .eyebrow::before { width: 26px; height: 3px; }
  h1 { font-size: 64px; margin-top: 8px; }
  .sub { font-size: 21px; line-height: 1.26; margin-top: 8px; max-width: 586px; }
  .chips { gap: 7px; margin-top: 12px; }
  .chips span { height: 32px; padding: 0 12px; font-size: 15px; border-width: 1.5px; }
  .points { margin-top: 10px; gap: 4px; }
  .points li { font-size: 15px; gap: 8px; }
  .points svg { width: 18px; height: 18px; }
  .panel { left: 34px; width: 586px; top: 414px; padding-top: 14px; border-top: 1.5px solid #E6ECF7; }
  .when { gap: 10px; }
  .when > svg { width: 26px; height: 26px; }
  .when .dates { font-size: 23px; }
  .when .tarif { font-size: 14px; margin-top: 5px; }
  .action { gap: 8px; }
  .cta { height: 46px; font-size: 14px; padding: 0 14px 0 17px; border-radius: 11px; gap: 8px; }
  .cta svg { width: 15px; height: 15px; }
  .wa { font-size: 15px; gap: 6px; }
  .wa svg { width: 21px; height: 21px; }
  .photo { left: 644px; right: 30px; top: 24px; bottom: 80px; border-radius: 22px; box-shadow: 0 12px 26px -20px rgb(11 27 63 / .45); }
  .photo img { object-position: 52% 50%; }
  .photo .live { position: absolute; right: 14px; top: 14px; height: 34px; font-size: 13px; padding: 0 14px 0 12px; gap: 8px; }
  .photo .live i { width: 9px; height: 9px; box-shadow: 0 0 0 3px rgb(60 200 255 / .25); }
  .band { height: 56px; font-size: 16px; }
'''
body_191 = f'''  <div class="left">{B['brand']}{B['eyebrow']}{B['h1']}{B['sub']}{B['chips']}{B['points']}</div>
  <div class="panel">{B['when']}{B['action']}</div>
  <div class="photo">{B['img']}{B['live']}</div>
  {B['band']}'''

OUT = [
    ('visuel_v2_salle_9x16.html', '9:16 · 1080 × 1920', 1080, 1920, css_916, body_916),
    ('visuel_v2_salle_1x1.html', '1:1 · 1080 × 1080', 1080, 1080, css_11, body_11),
    ('visuel_v2_salle_191x1.html', '1.91:1 · 1200 × 628', 1200, 628, css_191, body_191),
]
for name, titre, w, h, css, body in OUT:
    page = PAGE.format(titre=titre, w=w, h=h, css=css, body=body)
    page = page.replace('</body>', '''<script>
  window.__mesures = function () {
    const r = {};
    document.querySelectorAll('.head, .left, .live, .eyebrow, h1, .sub, .chips, .points, .photo, .panel, .when, .action, .band').forEach((el, i) => {
      const b = el.getBoundingClientRect(); r[(el.className || el.tagName) + '#' + i] = [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom), (el.tagName !== 'DIV' || el.className !== 'photo') && el.scrollWidth > el.clientWidth + 1 ? 'DEBORDE' : ''];
    });
    return r;
  };
</script>
</body>''')
    open(os.path.join(os.path.dirname(__file__), name), 'w', encoding='utf-8').write(page)
    print('écrit', name, w, 'x', h)
