"""Sound design de la version 30 s. usage: python3 sfx30.py cues.json out.wav duree"""
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
    s2, s3, s4, s5, s6, s7 = C['b0']-.12, C['c0']-.08, C['d0']-.1, C['e0']-.1, C['f0']-.12, C['g0']-.12
    # HOOK : arrêt du scroll + recul de caméra
    wh(.12, .45, f0=4000, f1=600, gain=.3, pan0=0, pan1=0); put(impact(.55, 60, 1.4, .5, .25), .1)
    wh(C['a1'] + .1, .8, f0=180, f1=3000, gain=.32, pan0=0, pan1=0); put(impact(.35, 64, 1.2, .5, .2), C['a1'] + .4)
    for k in range(11): put(tick(.04), C['a1'] + .15 + k * .11)
    put(blip(1800, .1, .2), C['a1'] + .6); put(blip(2600, .14, .25), C['a1'] + 1.33)
    # DROP « MEDIA BUYER »
    put(riser(C['b1'] - C['a1'] - .55, .28), C['a1'] + .6)
    put(impact(1.0, 40, 3.0, .6, .4), C['b1'] + .04); put(subdrop(.5, 2.0), C['b1'] + .04); put(shimmer(.2, 1046, 2.4), C['b1'] + .08)
    # rafale de compétences
    for k in ['c0', 'c1', 'c2', 'c3']:
        wh(C[k] - .02, .4, f0=500, f1=7000, gain=.24); put(impact(.6, 56, 1.3, .55, .2), C[k] - .02)
    put(impact(.7, 50, 1.8, .4, .3), C['c4']); put(blip(2200, .12, .25), C['c4'] + .45)
    # calcul freelance
    for i in range(3): put(blip(1500 + i * 300, .14, .22), C['d0'] + .5 + i * .22)
    put(riser(.8, .18), C['d1'] - .85); put(impact(.9, 44, 2.4, .5, .35), C['d1']); put(shimmer(.22, 1174), C['d1'] + .05)
    for k in range(11): put(tick(.05), C['d1'] + .08 + k * .085)
    # sessions réelles
    put(impact(.7, 52, 2.0, .3, .35), C['e0']); put(shimmer(.26, 880, 2.0), C['e0'] + .05)
    for k in ['e1', 'e2', 'e3']:
        wh(C[k] - .05, .55, f0=300, f1=6500, gain=.34); put(impact(.45, 60, 1.2, .5, .2), C[k] - .02)
    # urgence
    wh(s6 + .1, .7, f0=150, f1=4500, gain=.42, pan0=0, pan1=0); put(subdrop(.4, 1.4), s6 + .1)
    put(impact(.6, 52, 1.6, .4, .3), C['f0'] + .1); put(impact(.75, 48, 1.8, .5, .3), C['f1'])
    put(impact(.8, 46, 2.0, .55, .3), C['f2']); put(riser(s7 - C['f2'] + .05, .26), C['f2'] + .2)
    # CTA
    put(impact(1.0, 40, 3.0, .6, .4), s7); put(shimmer(.3, 1046, 3.0), s7 + .02); put(subdrop(.45, 2.0), s7)
    put(blip(2600, .15, .25), C['g0'] + .6); put(impact(.4, 66, 1.2, .5, .2), C['g0'] + .62); put(blip(1900, .12, .25), C['g1'])
    return mix[:int(total * SR)]

if __name__ == '__main__':
    C = json.load(open(sys.argv[1])); total = float(sys.argv[3])
    m = np.tanh(build(C, total) * .9) * .9
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(m, -1, 1) * 32767).astype('<i2').tobytes())
    print('sfx30 ok', total)
