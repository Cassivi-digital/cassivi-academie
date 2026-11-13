"""Sound design du modèle « Formation Media Buyer pilotée par l'IA ». usage: python3 src/sfx_ia.py cues.json out.wav duree"""
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
    # hook (identique à la v3)
    wh(.12, .45, f0=4000, f1=600, gain=.3, pan0=0, pan1=0); put(impact(.55, 60, 1.4, .5, .25), .1)
    wh(C['a1'] + .1, .8, f0=180, f1=3000, gain=.32, pan0=0, pan1=0); put(impact(.35, 64, 1.2, .5, .2), C['a1'] + .4)
    for k in range(11): put(tick(.04), C['a1'] + .15 + k * .11)
    put(blip(1800, .1, .2), C['a1'] + .6); put(blip(2600, .14, .25), C['a1'] + 1.33)
    # « avec l'IA » : tampon
    put(impact(.7, 50, 1.8, .55, .3), C['a2'] - .05); put(shimmer(.2, 1318, 1.6), C['a2']); put(blip(2900, .14, .22), C['a2'] + .02)
    # drop MEDIA BUYER + « piloté par l'IA »
    put(riser(C['b1'] - C['a2'] - .2, .26), C['a2'] + .25)
    put(impact(1.0, 40, 3.0, .6, .4), C['b1'] + .04); put(subdrop(.5, 2.0), C['b1'] + .04); put(shimmer(.2, 1046, 2.4), C['b1'] + .08)
    put(blip(2400, .12, .22), C['b1'] + .42); put(shimmer(.14, 1568, 1.4), C['b1'] + .45)
    # le métier
    wh(C['x0'] - .1, .5, f0=300, f1=5000, gain=.3, pan0=0, pan1=0); put(impact(.45, 60, 1.2, .5, .2), C['x0'])
    for i, tt in enumerate([C['x0'] + .05, C['x0'] + .5, C['x0'] + .95]): put(blip(1500 + i * 260, .14, .22), tt - .08); put(impact(.3, 66, .9, .55, .15), tt - .08)
    put(impact(.7, 48, 1.8, .5, .3), C['x1'] + .04); put(shimmer(.18, 1174, 1.6), C['x1'] + .12)
    # cockpit Claude : ouverture de l'application, connecteurs, skills, saisie, appels d'outils
    wh(C['c0'] - .05, .6, f0=200, f1=5000, gain=.34, pan0=0, pan1=0); put(blip(1900, .12, .22), C['c0']); put(impact(.4, 58, 1.2, .45, .25), C['c0'] + .35)
    wh(C['c0'] + .45, .55, f0=400, f1=6000, gain=.2, pan0=-.4, pan1=.4)
    put(tick(.09), C['c1'] + .22); put(blip(1300, .08, .12), C['c1'] + .22)
    for i in range(8): put(tick(.05), C['c1'] + .3 + i * .075); put(blip(1700 + i * 90, .05, .08), C['c1'] + .32 + i * .075)
    put(shimmer(.12, 1318, 1.2), C['c1'] + .9)
    for i in range(5): put(blip(2000 + i * 180, .09, .16), C['c2'] + .06 + i * .085)
    rng = np.random.default_rng(7)
    for k in range(26): put(tick(.035 + .02 * rng.random()), C['c3'] + .12 + k * .033 + .01 * rng.random())
    put(tick(.1), C['c3'] + 1.02); wh(C['c3'] + 1.1, .4, f0=800, f1=5000, gain=.16, pan0=.3, pan1=-.2)
    for k in ['c4', 'c5', 'c6', 'c7']: put(blip(1500, .07, .1), C[k] - .1); put(blip(2350, .11, .2), C[k] + .22); put(blip(3130, .09, .18), C[k] + .27)
    put(shimmer(.2, 1046, 2.0), C['c7'] + .45); put(impact(.4, 62, 1.2, .5, .2), C['c7'] + .42)
    # compétences très recherchées · deviens freelance
    wh(C['d0'] - .1, .6, f0=200, f1=5000, gain=.36, pan0=0, pan1=0); put(impact(.6, 52, 1.6, .45, .3), C['d0'])
    for i in range(6): put(blip(1500 + i * 170, .1, .18), C['d0'] + .35 + i * .1)
    put(impact(.7, 48, 1.8, .5, .3), C['d1'] - .05); put(impact(.85, 44, 2.2, .55, .35), C['d2'] - .05); put(shimmer(.22, 1318, 1.8), C['d2'])
    # idéale pour
    wh(C['e0'] - .08, .55, f0=300, f1=6000, gain=.32, pan0=0, pan1=0); put(impact(.5, 58, 1.3, .5, .2), C['e0'])
    for i, k in enumerate(['e1', 'e2', 'e3', 'e4', 'e5', 'e6']): put(impact(.4, 62, 1.0, .5, .18), C[k] - .08); put(blip(1600 + i * 150, .1, .18), C[k] - .06)
    put(shimmer(.2, 1568, 1.6), C['e6'] + .35)
    # l'offre : formation pilotée par l'IA, CASSIVI DIGITAL MG, formateurs expérimentés
    wh(C['r0'] - .1, .6, f0=200, f1=5000, gain=.36, pan0=0, pan1=0); put(impact(.6, 52, 1.6, .4, .3), C['r0'])
    put(shimmer(.18, 1174, 1.6), C['rp'])
    for tt in [C['r1'] - .12, C['r2'] - .12]: wh(tt + .05, .45, f0=800, f1=6000, gain=.2)
    put(blip(2000, .13, .22), C['r1'] + .05); put(blip(2500, .13, .22), C['r2'] + .05)
    # 2 jours en salle · Antsakaviro · 1 mois de suivi
    wh(C['k0'] - .3, .6, f0=150, f1=4500, gain=.4, pan0=0, pan1=0); put(subdrop(.4, 1.4), C['k0'] - .2)
    for i, k in enumerate(['k0', 'ka', 'k1']): put(impact([.8, .7, 1.0][i], [50, 54, 42][i], 1.8, .55, .3), C[k] - .05)
    put(shimmer(.22, 1318, 1.6), C['k1'] + .1); put(blip(1800, .1, .2), C['k1'] + .45)
    # urgence + respiration courte + CTA (comme la v3 sans date)
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
    print('sfx_ia ok', total)
