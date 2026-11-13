"""Sound design de la version finale (voix « Nicolas »). usage: python3 src/sfx_final.py cues.json out.wav duree
Reprend le sound design du modèle IA (hook, drop, cockpit, compétences, publics, offre, infos, CTA)
et ajoute : mission en 3 cartes, pages de l'application Claude, tableau de bord KPI,
scène de validation par le media buyer (coches, clic « Valider », tampon) et manifeste « L'IA accélère. L'expert décide. »."""
import json, sys, wave, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from sfx import SR, whoosh, impact, riser, blip, tick, shimmer, subdrop

def build(C, total):
    N = int(total * SR) + SR * 3; mix = np.zeros((N, 2))
    def put(sig, at):
        i = int(at * SR)
        if i < 0: sig = sig[-i:]; i = 0
        j = min(N, i + len(sig)); mix[i:j] += sig[:j - i]
    def wh(hit, dur=.6, **k): put(whoosh(dur, **k), hit - dur * .62)
    # hook (identique au modèle IA)
    wh(.12, .45, f0=4000, f1=600, gain=.3, pan0=0, pan1=0); put(impact(.55, 60, 1.4, .5, .25), .1)
    wh(C['a1'] + .1, .8, f0=180, f1=3000, gain=.32, pan0=0, pan1=0); put(impact(.35, 64, 1.2, .5, .2), C['a1'] + .4)
    for k in range(11): put(tick(.04), C['a1'] + .15 + k * .11)
    put(blip(1800, .1, .2), C['a1'] + .6); put(blip(2600, .14, .25), C['a1'] + 1.33)
    put(impact(.7, 50, 1.8, .55, .3), C['a2'] - .05); put(shimmer(.2, 1318, 1.6), C['a2']); put(blip(2900, .14, .22), C['a2'] + .02)
    # drop MEDIA BUYER + « piloté par l'IA »
    put(riser(C['b1'] - C['a2'] - .2, .26), C['a2'] + .25)
    put(impact(1.0, 40, 3.0, .6, .4), C['b1'] + .04); put(subdrop(.5, 2.0), C['b1'] + .04); put(shimmer(.2, 1046, 2.4), C['b1'] + .08)
    put(blip(2400, .12, .22), C['b1'] + .42); put(shimmer(.14, 1568, 1.4), C['b1'] + .45)
    # « Sa mission » : 3 cartes (gauche, droite, gauche), la 3e en or
    wh(C['x0'] - .1, .5, f0=300, f1=5000, gain=.3, pan0=0, pan1=0); put(impact(.45, 60, 1.2, .5, .2), C['x0'])
    for i, k in enumerate(['xb', 'xc']):
        put(blip(1500 + i * 260, .14, .22), C[k] - .1); put(impact(.32, 64, .9, .55, .15), C[k] - .1)
        wh(C[k] - .04, .35, f0=600, f1=5000, gain=.14, pan0=-.6 if i == 0 else .6, pan1=0)
    wh(C['x1'] - .04, .35, f0=600, f1=5000, gain=.14, pan0=-.6, pan1=0)
    put(impact(.7, 48, 1.8, .5, .3), C['x1'] - .06); put(blip(2100, .12, .2), C['x1'] - .08); put(shimmer(.18, 1174, 1.6), C['x1'])
    # cockpit Claude : ouverture, connecteurs, onglet Skills, onglet Conversation, saisie, appels d'outils
    wh(C['c0'] - .05, .6, f0=200, f1=5000, gain=.34, pan0=0, pan1=0); put(blip(1900, .12, .22), C['c0']); put(impact(.4, 58, 1.2, .45, .25), C['c0'] + .35)
    wh(C['c0'] + .45, .55, f0=400, f1=6000, gain=.2, pan0=-.4, pan1=.4)
    put(tick(.09), C['c1'] + .2); put(blip(1300, .08, .12), C['c1'] + .2)
    for i in range(8): put(tick(.05), C['c1'] + .26 + i * .07); put(blip(1700 + i * 90, .05, .08), C['c1'] + .28 + i * .07)
    put(shimmer(.12, 1318, 1.2), C['c1'] + .86)
    put(tick(.08), C['c2'] - .12); wh(C['c2'] - .02, .35, f0=900, f1=6000, gain=.13, pan0=.4, pan1=-.4)
    for i in range(5): put(blip(2000 + i * 180, .09, .16), C['c2'] + .08 + i * .1)
    put(tick(.08), C['c3'] - .15); wh(C['c3'] - .04, .35, f0=900, f1=6000, gain=.13, pan0=.4, pan1=-.4)
    rng = np.random.default_rng(7)
    for k in range(24): put(tick(.035 + .02 * rng.random()), C['c3'] + .05 + k * .03 + .008 * rng.random())
    put(tick(.1), C['c3'] + .82); wh(C['c3'] + .9, .4, f0=800, f1=5000, gain=.16, pan0=.3, pan1=-.2)
    for k in ['c4', 'c5', 'c7', 'c6']: put(blip(1500, .07, .1), C[k] - .1); put(blip(2350, .11, .2), C[k] + .2); put(blip(3130, .09, .18), C[k] + .25)
    wh(C['ct'] - .1, .4, f0=500, f1=4000, gain=.12, pan0=0, pan1=0)
    put(impact(.45, 60, 1.2, .5, .22), C['c8'] - .05); put(shimmer(.18, 1046, 1.8), C['c8'])
    for i in range(4): put(blip(1800 + i * 220, .1, .16), C['c8'] + .15 + i * .1)
    put(impact(.35, 64, 1.0, .5, .2), C['c9'] - .05); put(blip(2900, .14, .22), C['c9'] - .05); put(shimmer(.16, 1568, 1.4), C['c9'])
    # « Mais l'IA ne décide pas seule » : coupure nette, carte de validation
    put(impact(.75, 46, 2.0, .45, .3), C['h0'] - .1); put(subdrop(.35, 1.2), C['h0'] - .1); wh(C['h0'] - .2, .5, f0=5000, f1=300, gain=.22, pan0=0, pan1=0)
    wh(C['h0'] + .2, .6, f0=200, f1=3000, gain=.16, pan0=0, pan1=0)
    for i, k in enumerate(['h1', 'h1b', 'h1c']):
        put(impact(.32, 64, .9, .5, .15), C[k] - .08); put(blip(1600 + i * 200, .1, .18), C[k] - .06); wh(C[k] - .1, .3, f0=900, f1=5000, gain=.1, pan0=-.4, pan1=.2)
    for i, tt in enumerate([C['h2v'] - .2, C['h2v'] + .1, C['h2v'] + .4]): put(tick(.1), tt); put(blip(2200 + i * 260, .12, .18), tt + .02)
    put(tick(.12), C['h2w'] + .02); put(blip(2600, .14, .22), C['h2w'] + .04)
    put(impact(.9, 44, 2.2, .55, .35), C['h2w'] + .17); put(shimmer(.22, 1318, 2.0), C['h2w'] + .2)
    # « L'IA accélère » : rafales ; « L'expert décide » : coup grave et décélération
    put(riser(.55, .22, 400, 4000), C['p0'] - .55)
    for k in range(5): wh(C['p0'] - .05 + k * .27, .32, f0=2500, f1=7000, gain=.15, pan0=-.8 + .4 * k, pan1=.8 - .3 * k)
    put(impact(.85, 50, 1.6, .6, .3), C['p0'] - .02)
    wh(C['p1'] - .08, .5, f0=6000, f1=400, gain=.14, pan0=0, pan1=0)
    put(impact(1.0, 38, 2.6, .5, .4), C['p1'] - .03); put(subdrop(.5, 1.8), C['p1'] - .03); put(shimmer(.24, 880, 2.2), C['p1'] + .05)
    # compétence très recherchée · décrocher des clients · devenir freelance
    wh(C['d0'] - .1, .6, f0=200, f1=5000, gain=.36, pan0=0, pan1=0); put(impact(.6, 52, 1.6, .45, .3), C['d0'])
    for i in range(6): put(blip(1500 + i * 170, .1, .18), C['d0'] + .35 + i * .1)
    put(impact(.7, 48, 1.8, .5, .3), C['d1'] - .05); put(impact(.85, 44, 2.2, .55, .35), C['d2'] - .05); put(shimmer(.22, 1318, 1.8), C['d2'])
    # l'offre : formation pilotée par l'IA, grand logo CASSIVI DIGITAL MG, formateurs expérimentés
    wh(C['r0'] - .1, .6, f0=200, f1=5000, gain=.36, pan0=0, pan1=0); put(impact(.6, 52, 1.6, .4, .3), C['r0'])
    put(shimmer(.18, 1174, 1.6), C['rp'])
    for tt in [C['r1'] - .12, C['r2'] - .12]: wh(tt + .05, .45, f0=800, f1=6000, gain=.2)
    put(impact(.8, 46, 2.0, .55, .35), C['r1'] - .06); put(shimmer(.26, 1046, 2.4), C['r1'] + .05); put(blip(2800, .12, .2), C['r1'] + .3)
    put(blip(2000, .13, .22), C['r1'] + .12); put(blip(2500, .13, .22), C['r2'] + .05)
    # idéale pour
    wh(C['e0'] - .08, .55, f0=300, f1=6000, gain=.32, pan0=0, pan1=0); put(impact(.5, 58, 1.3, .5, .2), C['e0'])
    for i, k in enumerate(['e1', 'e2', 'e3', 'e4', 'e5', 'e6']): put(impact(.4, 62, 1.0, .5, .18), C[k] - .08); put(blip(1600 + i * 150, .1, .18), C[k] - .06)
    put(shimmer(.2, 1568, 1.6), C['e0'] + .45)
    # 2 jours en salle · Antsakaviro · 1 mois de suivi
    wh(C['k0'] - .3, .6, f0=150, f1=4500, gain=.4, pan0=0, pan1=0); put(subdrop(.4, 1.4), C['k0'] - .2)
    for i, k in enumerate(['k0', 'ka', 'k1']): put(impact([.8, .7, 1.0][i], [50, 54, 42][i], 1.8, .55, .3), C[k] - .05)
    put(shimmer(.22, 1318, 1.6), C['k1'] + .1); put(blip(1800, .1, .2), C['k1'] + .45)
    # urgence + respiration courte + CTA
    put(impact(.95, 42, 2.4, .55, .35), C['u0']); put(riser(C['g0'] - C['u0'] + .05, .34), C['u0'] + .15)
    wh(C['g0'] - .3, .45, f0=2500, f1=400, gain=.12, pan0=0, pan1=0)
    put(impact(1.0, 40, 3.0, .6, .4), C['g0'] - .05); put(shimmer(.3, 1046, 3.0), C['g0']); put(subdrop(.45, 2.0), C['g0'] - .05)
    put(blip(2600, .15, .25), C['g0'] + .05)
    for k in range(18): put(tick(.035), C['g0'] + .8 + k * .062)
    put(blip(3000, .16, .25), C['g0'] + 2.05); put(impact(.4, 66, 1.2, .5, .2), C['g0'] + 2.05)
    for i in range(12): put(tick(.05), C['g1'] - .1 + i * .07)
    put(impact(.6, 52, 1.6, .5, .25), C['g1'] + .75)
    return mix[:int(total * SR)]

if __name__ == '__main__':
    C = json.load(open(sys.argv[1])); total = float(sys.argv[3])
    m = np.tanh(build(C, total) * .9) * .9
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(m, -1, 1) * 32767).astype('<i2').tobytes())
    print('sfx_final ok', total)
