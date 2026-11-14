"""Serveur de test local : sert site/ avec les en-têtes de _headers (CSP comprise)
et simule Netlify Forms (POST / -> 200). usage : python3 outils/tests/serveur_local.py 8765"""
import http.server, os, sys, json, fnmatch, urllib.parse

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'site')
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'netlify_posts.jsonl')

def parse_headers():
    rules, cur = [], None
    for line in open(os.path.join(ROOT, '_headers'), encoding='utf-8'):
        if not line.strip():
            continue
        if not line.startswith((' ', '\t')):
            cur = (line.strip(), []); rules.append(cur)
        else:
            k, v = line.strip().split(':', 1); cur[1].append((k.strip(), v.strip()))
    return rules
RULES = parse_headers()

class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map, **{
        '.woff2': 'font/woff2', '.webp': 'image/webp', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.js': 'text/javascript', '.ics': 'text/calendar'})
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)
    def end_headers(self):
        path = urllib.parse.urlparse(self.path).path
        for pattern, hs in RULES:
            if fnmatch.fnmatch(path, pattern.replace('/*', '/*')) or (pattern == '/*'):
                for k, v in hs:
                    self.send_header(k, v)
        super().end_headers()
    def do_POST(self):
        n = int(self.headers.get('Content-Length', 0)); body = self.rfile.read(n).decode('utf-8', 'replace')
        with open(LOG, 'a', encoding='utf-8') as f:
            f.write(json.dumps({'path': self.path, 'body': dict(urllib.parse.parse_qsl(body))}, ensure_ascii=False) + '\n')
        self.send_response(200); self.send_header('Content-Type', 'text/html; charset=utf-8'); self.end_headers()
        self.wfile.write(b'<!doctype html><title>ok</title>ok')
    def log_message(self, *a):
        pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    http.server.ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
