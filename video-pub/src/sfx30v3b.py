"""Sound design de la version v3b (v3 sans date, respiration avant le CTA). usage: python3 sfx30v3b.py cues.json out.wav duree"""
import json, sys, wave, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from sfx import SR, whoosh, impact, riser, blip, tick, shimmer, subdrop, glitch

def build(C, total):
    N = int(total * SR) + SR * 3; mix = np.zeros((N, 2))
    def put(sig, at):
        i = int(at * SR)
        if i < 0: sig = sig[-i:]; i = 0
        j = min(N, i + len(sig)); mix[i:j] += sig[:j - i]
    def wh(hit, dur=.6, **k): put(whoosh(dur, **k), hit - dur * .62)
    s = lambda k, d: C[k] - d
    # hook
    wh(.12, .45, f0=4000, f1=600, gain=.3, pan0=0, pan1=0); put(impact(.55, 60, 1.4, .5, .25), .1)
    wh(C['a1'] + .1, .8, f0=180, f1=3000, gain=.32, pan0=0, pan1=0); put(impact(.35, 64, 1.2, .5, .2), C['a1'] + .4)
    for k in range(11): put(tick(.04), C['a1'] + .15 + k * .11)
    put(blip(1800, .1, .2), C['a1'] + .6); put(blip(2600, .14, .25), C['a1'] + 1.33)
    # drop MEDIA BUYER
    put(riser(C['b1'] - C['a1'] - .55, .28), C['a1'] + .6)
    put(impact(1.0, 40, 3.0, .6, .4), C['b1'] + .04); put(subdrop(.5, 2.0), C['b1'] + .04); put(shimmer(.2, 1046, 2.4), C['b1'] + .08)
    # le métier : 4 gestes
    wh(C['x0'] - .1, .5, f0=300, f1=5000, gain=.3, pan0=0, pan1=0); put(impact(.45, 60, 1.2, .5, .2), C['x0'])
    for i, k in enumerate(['x1', 'x2', 'x3']): put(blip(1500 + i * 260, .14, .22), C[k] - .08); put(impact(.3, 66, .9, .55, .15), C[k] - .08)
    put(impact(.7, 48, 1.8, .5, .3), C['x4'] - .08); put(shimmer(.18, 1174, 1.6), C['x4'])
    # plateformes
    for k in ['m0', 'm1']:
        wh(C[k] - .06, .45, f0=600, f1=7000, gain=.3); put(impact(.7, 54, 1.5, .55, .25), C[k] - .06); put(shimmer(.14, 1318, 1.4), C[k])
    # tracking
    wh(s('t0', .08), .5, f0=300, f1=5000, gain=.3, pan0=0, pan1=0); put(impact(.5, 58, 1.3, .5, .2), C['t0'])
    for i, k in enumerate(['t1', 't2', 't3', 't4', 't5']):
        put(blip(1400 + i * 220, .13, .22), C[k] - .06)
        for j in range(3): put(tick(.035), C[k] + .1 + j * .07)
    # acquisition
    wh(s('q0', .1), .55, f0=250, f1=5500, gain=.3, pan0=0, pan1=0); put(impact(.45, 60, 1.2, .5, .2), C['q0'])
    for i, tt in enumerate([C['q0'] + .45, C['q1'], C['q1'] + .75]): put(blip(1600 + i * 300, .14, .22), tt)
    put(impact(.75, 48, 2.0, .5, .3), C['q2']); put(shimmer(.2, 1174, 1.8), C['q2'] + .03)
    # pour qui
    for k in ['w0', 'w1', 'w2']:
        wh(C[k] - .05, .5, f0=300, f1=6500, gain=.32); put(impact(.5, 58, 1.3, .5, .2), C[k] - .05)
    put(impact(.85, 46, 2.2, .55, .3), C.get('w3', C['w2'] + 1.0))
    # en salle
    wh(s('r0', .1), .6, f0=200, f1=5000, gain=.36, pan0=0, pan1=0); put(impact(.6, 52, 1.6, .4, .3), C['r0'])
    for tt in [C['r0'] + 1.25, C['rr'] + 1.05]: wh(tt, .4, f0=800, f1=6000, gain=.2)
    put(blip(2500, .13, .22), C['rr'] + .55)
    # 2 JOURS · 1 MÉTIER · 1 MOIS DE SUIVI
    wh(C['k0'] - .3, .6, f0=150, f1=4500, gain=.4, pan0=0, pan1=0); put(subdrop(.4, 1.4), C['k0'] - .2)
    for i in range(3): put(impact([.8, .85, 1.0][i], [50, 46, 42][i], 1.8, .55, .3), C['k0'] - .05 + i * .36)
    put(shimmer(.22, 1318, 1.6), C['k0'] + .67); put(blip(1800, .1, .2), C['k0'] + 1.0)
    # urgence + CTA
    put(impact(.95, 42, 2.4, .55, .35), C['u0']); put(riser(C['g0'] - C['u0'] + .05, .34), C['u0'] + .15)
    # respiration courte avant le CTA : le badge s'efface dans un souffle léger, la montée continue jusqu'au CTA
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
    print('sfx30v3b ok', total)
