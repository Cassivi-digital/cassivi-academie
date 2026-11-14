"""Construit site/index.html et site/merci.html à partir de outils/src/ :
typographie française (espaces insécables), numéros de version des fichiers CSS/JS (cache), adresse du site.

usage : python3 outils/build_site.py [https://adresse-du-site.netlify.app]
"""
import hashlib, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = os.path.join(ROOT, 'site')
SITE_URL = (sys.argv[1] if len(sys.argv) > 1 else 'https://formation-media-buyer-cassivi.netlify.app').rstrip('/')

NBSP, NNBSP = ' ', ' '

def typo(t):
    t = re.sub(r'(?:(?<=\S)|^) ([?!;])', NNBSP + r'\1', t)
    t = re.sub(r'(?:(?<=\S)|^) :(?=\s|$)', NBSP + ':', t)
    t = t.replace('« ', '«' + NBSP).replace(' »', NBSP + '»')
    t = re.sub(r'\d{1,3}(?: \d{3})+(?= Ar\b)', lambda m: m.group(0).replace(' ', NNBSP), t)
    t = re.sub(r'(\d) (Ar|min)\b', r'\1' + NBSP + r'\2', t)
    return t

TOKEN = re.compile(r'(<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->|<[^>]+>)', re.S | re.I)
def typo_html(html):
    parts = TOKEN.split(html)
    return ''.join(p if i % 2 else typo(p) for i, p in enumerate(parts))

def ver(rel):
    return hashlib.md5(open(os.path.join(SITE, rel), 'rb').read()).hexdigest()[:8]

repl = {'{{SITE_URL}}': SITE_URL, '{{CSS_V}}': ver('assets/css/style.css'),
        '{{JS_V}}': ver('assets/js/app.js'), '{{CFG_V}}': ver('config.js')}
for name in ('index.html', 'merci.html'):
    src = open(os.path.join(HERE, 'src', name), encoding='utf-8').read()
    for k, v in repl.items():
        src = src.replace(k, v)
    out = typo_html(src)
    left = re.findall(r'\{\{[A-Z_]+\}\}', out)
    assert not left, left
    open(os.path.join(SITE, name), 'w', encoding='utf-8').write(out)
    print(name, len(out.encode('utf-8')) // 1024, 'Ko')
print('site :', SITE_URL, repl)
