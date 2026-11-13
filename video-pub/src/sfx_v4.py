"""Sound design v4 (premium, sobre). usage: python3 sfx_v4.py cues.json out.wav duree"""
import json, sys, wave, numpy as np
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from sfx import SR, whoosh, impact, riser, blip, tick, shimmer, subdrop

def build(C, total):
    N = int(total * SR) + SR * 3; mix = np.zeros((N, 2))
    def put(sig, at):
        i = int(at * SR)
        if i < 0: sig = sig[-i:]; i = 0
        j = min(N, i + len(sig)); mix[i:j] += sig[:j - i]
    def wh(hit, dur=.5, **k): put(whoosh(dur, **k), hit - dur * .62)
    S = dict(s2=C['b0'] - .12, sx=C['x0'] - .1, s3=C['m0'] - .08, s4=C['t0'] - .08, s5=C['q0'] - .1,
             s6=C['w0'] - .08, s7=C['r0'] - .1, s8=C['k0'] - .12, s9=C['u0'] - .12)
    br = C['g0'] - 1.0
    # transitions signature (ligne) : souffle léger
    for k, T in S.items():
        wh(T, .5, f0=500, f1=6000, gain=.2, pan0=-.5, pan1=.5)
    # hook : arrêt du scroll, recul de caméra, clic
    put(impact(.4, 62, 1.2, .5, .2), .08)
    wh(C['a1'] + .1, .8, f0=180, f1=3000, gain=.22, pan0=0, pan1=0)
    for k in range(10): put(tick(.03), C['a1'] + .15 + k * .11)
    put(blip(1800, .08, .2), C['a1'] + .6); put(blip(2600, .12, .25), C['a1'] + 1.33)
    # drop « MEDIA BUYER »
    put(riser(C['b1'] - C['a1'] - .7, .2), C['a1'] + .55)
    put(impact(.85, 42, 2.6, .5, .4), C['b1'] - .12); put(subdrop(.38, 1.8), C['b1'] - .12); put(shimmer(.14, 1046, 2.2), C['b1'] + .3)
    # le métier
    for i, k in enumerate(['x1', 'x2', 'x3']): put(blip(1500 + i * 260, .1, .22), C[k] - .1)
    put(impact(.5, 50, 1.6, .45, .3), C['x4'] - .1); put(shimmer(.13, 1174, 1.6), C['x4'])
    # plateformes
    for k in ['m0', 'm1']: put(impact(.36, 60, 1.1, .5, .2), C[k] - .08); put(blip(2100, .08, .2), C[k] + .05)
    # tracking
    put(impact(.32, 62, 1.0, .5, .2), C['t0'])
    for i, k in enumerate(['t1', 't2', 't3', 't4', 't5']):
        put(blip(1400 + i * 220, .1, .22), C[k] - .08)
        for j in range(2): put(tick(.03), C[k] + .1 + j * .07)
    # acquisition
    for i, tt in enumerate([C['q0'] + .45, C['q1'], C['q1'] + .7]): put(blip(1600 + i * 300, .11, .22), tt)
    put(impact(.48, 50, 1.6, .45, .3), C['q2']); put(shimmer(.15, 1318, 1.6), C['q2'] + .03)
    # pour qui
    for i, k in enumerate(['w0', 'w1', 'w2']): put(blip(1500 + i * 200, .09, .2), C[k] - .1)
    put(impact(.58, 48, 1.8, .5, .3), C['w3'] - .05)
    # la formation (photos réelles)
    put(impact(.5, 54, 1.6, .4, .3), C['r0'] + .2)
    for tt in [C['rr'] - .1, C['rr'] + 1.1]: wh(tt + .1, .6, f0=900, f1=5000, gain=.12)
    for i in range(3): put(blip(1900 + i * 180, .08, .2), C['rr'] - .1 + i * .18)
    # 2 JOURS · 1 MÉTIER · 1 MOIS DE SUIVI
    for i in range(3): put(impact([.65, .72, .82][i], [52, 48, 44][i], 1.6, .5, .3), C['k0'] - .05 + i * .36)
    put(shimmer(.18, 1318, 1.6), C['k0'] + .67); put(blip(1800, .08, .2), C['k0'] + 1.0)
    # urgence
    put(impact(.72, 46, 2.0, .5, .3), C['u0'] - .05)
    # respiration : souffle et montée très douce, aucune percussion
    put(whoosh(1.3, 200, 2400, .1, 0, 0), br + .2)
    put(riser(C['g0'] - br - .25, .13), br + .25)
    # CTA
    put(impact(.8, 40, 3.0, .55, .45), C['g0'] - .05); put(shimmer(.26, 880, 3.2), C['g0'] + .05); put(subdrop(.32, 2.0), C['g0'] - .05)
    put(blip(2600, .13, .25), C['g0'] + .5); put(impact(.32, 66, 1.1, .5, .2), C['g0'] + .52)
    for i in range(13): put(tick(.035), C['g1'] - .1 + i * .06)
    put(blip(2200, .08, .2), C['g1'] + .6); put(blip(3000, .12, .25), C['g1'] + 1.4)
    return mix[:int(total * SR)]

if __name__ == '__main__':
    C = json.load(open(sys.argv[1])); total = float(sys.argv[3])
    m = np.tanh(build(C, total) * .9) * .9
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(m, -1, 1) * 32767).astype('<i2').tobytes())
    print('sfx_v4 ok', total)
