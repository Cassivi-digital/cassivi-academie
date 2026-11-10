"""Sound design procédural, synchronisé sur les repères (cues) de l'animation.
usage: python3 sfx.py cues.json out.wav duration
"""
import json, sys, numpy as np
from numpy.fft import rfft, irfft

SR = 48000
rng = np.random.default_rng(7)

def env_ar(n, a, r, curve=3.0):
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    rel = np.exp(-curve * np.clip(t - a, 0, None) / max(r, 1e-4))
    return att * rel

def bandpass_sweep(x, f0, f1, q=1.2):
    """Filtre passe-bande à fréquence centrale glissante (traitement par blocs FFT)."""
    out = np.zeros_like(x); blk = 1024; hop = 512; win = np.hanning(blk)
    n = len(x); freqs = np.fft.rfftfreq(blk, 1 / SR)
    for i in range(0, n - blk, hop):
        p = i / max(1, n - blk)
        fc = f0 * (f1 / f0) ** p
        bw = fc / q
        g = np.exp(-0.5 * ((freqs - fc) / bw) ** 2)
        out[i:i + blk] += irfft(rfft(x[i:i + blk] * win) * g, blk)
    return out

def lowpass(x, fc):
    X = rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)
    return irfft(X, len(x))

def highpass(x, fc):
    X = rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4)
    return irfft(X, len(x))

def reverb(x, dur=1.6, mix=0.25, damp=3000):
    n = int(dur * SR)
    ir = rng.standard_normal(n) * np.exp(-6.0 * np.arange(n) / n)
    ir = lowpass(ir, damp); ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n
    y = irfft(rfft(x, L) * rfft(ir, L), L)
    out = np.zeros(L); out[:len(x)] += x * (1 - mix); out += y * mix
    return out

def stereo(m, pan=0.0, width=0.0):
    l = m * np.sqrt(0.5 * (1 - pan)); r = m * np.sqrt(0.5 * (1 + pan))
    if width:
        d = int(width * SR / 1000); r = np.concatenate([np.zeros(d), r])[:len(m)]
    return np.stack([l, r], 1)

# ---------- instruments ----------
def whoosh(dur=0.7, f0=300, f1=4500, gain=0.5, pan0=-0.7, pan1=0.7):
    n = int(dur * SR); x = rng.standard_normal(n)
    y = bandpass_sweep(x, f0, f1, q=1.6)
    t = np.arange(n) / n
    e = np.sin(np.pi * t) ** 1.6 * (0.4 + 0.6 * t)
    y = y * e; y /= np.abs(y).max() + 1e-9
    pans = pan0 + (pan1 - pan0) * t
    st = np.stack([y * np.sqrt(0.5 * (1 - pans)), y * np.sqrt(0.5 * (1 + pans))], 1)
    return st * gain

def impact(gain=0.8, sub=52, dur=2.2, bright=0.35, rev=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    f = sub * (1 + 1.6 * np.exp(-t * 18))
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 3.2)
    click = highpass(rng.standard_normal(n), 900) * np.exp(-t * 55) * bright
    thump = lowpass(rng.standard_normal(n), 180) * np.exp(-t * 14) * 1.8
    m = body + click + thump
    m = np.tanh(m * 1.4)
    m = reverb(m, 1.8, rev, 2500)
    m /= np.abs(m).max() + 1e-9
    return stereo(m * gain, 0, 7)

def riser(dur=2.0, gain=0.35, f0=200, f1=2600):
    n = int(dur * SR); t = np.arange(n) / n
    x = rng.standard_normal(n)
    y = bandpass_sweep(x, 400, 7000, q=1.0)
    f = f0 * (f1 / f0) ** (t ** 1.4)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    saw = lowpass(saw, 3000) * 0.35
    m = (y / (np.abs(y).max() + 1e-9) + saw) * (t ** 2.2)
    m /= np.abs(m).max() + 1e-9
    return stereo(m * gain, 0, 11)

def blip(f=2200, gain=0.18, dur=0.22):
    n = int(dur * SR); t = np.arange(n) / SR
    m = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.01 * t)) * env_ar(n, 0.004, 0.06, 1)
    m = reverb(m, 0.6, 0.3, 6000)
    return stereo(m * gain, rng.uniform(-.4, .4), 4)

def tick(gain=0.07):
    n = int(0.03 * SR)
    m = highpass(rng.standard_normal(n), 3500) * np.exp(-np.arange(n) / SR * 400)
    return stereo(m * gain, rng.uniform(-.3, .3))

def shimmer(gain=0.22, base=880, dur=2.6):
    n = int(dur * SR); t = np.arange(n) / SR
    m = np.zeros(n)
    for k, (r, a) in enumerate([(1, 1), (1.5, .6), (2, .5), (3, .25), (4.01, .18)]):
        m += a * np.sin(2 * np.pi * base * r * t + k) * np.exp(-t * (2.2 + k * .6))
    m *= np.clip(t / 0.01, 0, 1)
    m = reverb(m, 2.2, 0.45, 7000)
    m /= np.abs(m).max() + 1e-9
    return stereo(m * gain, 0, 13)

def subdrop(gain=0.5, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 90 * np.exp(-t * 2.2) + 30
    m = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.8) * np.clip(t / .02, 0, 1)
    return stereo(m * gain)

def glitch(gain=0.16, dur=0.35):
    n = int(dur * SR); m = np.zeros(n)
    for _ in range(9):
        s = rng.integers(0, n - 800); l = rng.integers(200, 900)
        m[s:s + l] += np.sign(np.sin(2 * np.pi * rng.uniform(300, 1800) * np.arange(l) / SR)) * rng.uniform(.3, 1)
    m = lowpass(m, 6000) * np.linspace(1, .3, n)
    return stereo(m * gain, 0, 3)

# ---------- placement ----------
def build(C, total):
    N = int(total * SR) + SR * 3
    mix = np.zeros((N, 2))
    def put(sig, at):
        i = int(at * SR)
        if i < 0: sig = sig[-i:]; i = 0
        j = min(N, i + len(sig)); mix[i:j] += sig[:j - i]
    def whoosh_to(t_hit, dur=0.7, **k):  # le sommet du whoosh tombe sur t_hit
        put(whoosh(dur, **k), t_hit - dur * 0.62)

    # HOOK
    put(subdrop(.45, 1.8), 0.28); put(impact(.65, 48, rev=.35), 0.30); put(shimmer(.14, 1318), 0.32)
    whoosh_to(C['h1'] + .32, .55, f0=500, f1=6000, gain=.28)
    put(impact(.42, 60, 1.4, .5, .2), C['h1'] + .33)
    whoosh_to(C['h1'] + .76, .5, f0=700, f1=7000, gain=.22, pan0=.6, pan1=-.4)
    put(impact(.5, 55, 1.6, .45, .25), C['h2'] + .46)
    for i in range(6): put(blip(1800 + i * 160, .06, .18), .6 + i * .09)
    # -> SCÈNE 2 (zoom-through)
    put(riser(1.1, .18), C['s2'] - 1.25); whoosh_to(C['s2'] - .05, .9, f0=200, f1=6500, gain=.45)
    put(blip(2600, .1), C['p2a'] + .3)
    for k in range(int((C['p2b'] - C['p2a']) * 9)): put(tick(.045), C['p2a'] + .65 + k / 9)
    put(impact(.85, 46, 2.4, .4, .32), C['p2b']); put(impact(.55, 58, 1.5, .5, .2), C['p2b'] + .36)
    put(glitch(.18), C['p2c'] + .12); put(subdrop(.35, 1.4), C['p2c'] + .15); put(blip(520, .14, .3), C['p2c'] + .45)
    for k in range(int((C['s3'] - C['p2c'] - .6) * 7)): put(tick(.04), C['p2c'] + .3 + k / 7)
    # -> SCÈNE 3 (anneau)
    put(riser(1.2, .22), C['s3'] - 1.35); whoosh_to(C['s3'] + .1, .9, f0=150, f1=5000, gain=.42, pan0=0, pan1=0)
    put(shimmer(.12, 1046), C['s3'] + .05)
    put(impact(.45, 62, 1.3, .55, .2), C['p3a'] + .2)
    for g, st in enumerate(['p3b', 'p3c', 'p3d', 'p3e']):
        cnt = 4 if g == 0 else 2
        for i in range(cnt): put(blip(1500 + g * 250 + i * 120, .11, .2), C[st] + (i * .14 if g == 0 else (i % 2) * .14) + .05)
    put(shimmer(.15, 1568), C['p3e'] + .35)
    # -> SCÈNE 4 (iris)
    whoosh_to(C['s4'] - .02, .6, f0=1200, f1=180, gain=.38, pan0=0, pan1=0); put(impact(.55, 50, 1.8, .3, .3), C['s4'] + .02)
    for st in ['p4b', 'p4c', 'p4d']:
        put(blip(2000, .12, .2), C[st]);
        for k in range(8): put(tick(.05), C[st] + .15 + k * .11)
        put(blip(2900, .09, .2), C[st] + 1.05)
    put(riser(.9, .16), C['p4e'] - .95); put(impact(.95, 44, 2.6, .5, .35), C['p4e']); put(shimmer(.22, 1174), C['p4e'] + .05)
    for k in range(12): put(tick(.05), C['p4e'] + .05 + k * .08)
    # -> SCÈNE 4b
    whoosh_to(C['s4b'] + .05, .75, f0=300, f1=5200, gain=.36, pan0=0, pan1=0)
    for i in range(5): put(blip(1300 + i * 140, .08, .2), C['p5b'] + .1 + i * .42)
    whoosh_to(C['p5c'] + .5, .9, f0=180, f1=3600, gain=.3)
    for i in range(3): put(blip(2200 + i * 200, .09, .2), C['p5c'] + .9 + i * .28)
    # -> SCÈNE 5 (morphing vers le logo)
    whoosh_to(C['s5'] + .1, .9, f0=5000, f1=250, gain=.4, pan0=0, pan1=0); put(impact(.6, 52, 2.0, .3, .35), C['s5'] + .12)
    put(shimmer(.26, 880), C['s5'] + .15)
    whoosh_to(C['p6b'] + .35, .6, f0=400, f1=3500, gain=.2)
    put(impact(.42, 64, 1.3, .5, .2), C['p6c'] + .1)
    whoosh_to(C['p6d'] + .3, .7, f0=300, f1=6000, gain=.32)
    for i in range(6): put(blip(1700 + i * 130, .08, .18), C['p6d'] + .55 + i * .17)
    # -> SCÈNE 6 (balayage marine)
    whoosh_to(C['s6'] - .05, .9, f0=150, f1=4500, gain=.48, pan0=0, pan1=0); put(subdrop(.4, 1.5), C['s6'])
    put(impact(.5, 55, 1.6, .4, .3), C['p7a'] + .15)
    put(impact(.9, 46, 2.2, .5, .3), C['p7b']); put(impact(.95, 42, 2.6, .55, .35), C['p7b'] + .36)
    put(blip(2400, .12, .25), C['p7b'] + 1.0)
    put(impact(.6, 58, 1.6, .5, .25), C['p7c']); put(riser(C['s7'] - C['p7c'] + .1, .3), C['p7c'])
    # -> CTA
    put(impact(1.0, 40, 3.0, .6, .4), C['s7'] - .02); put(shimmer(.3, 1046, 3.2), C['s7']); put(subdrop(.45, 2.0), C['s7'])
    put(blip(2600, .14, .25), C['p8a'] + .6); put(impact(.38, 66, 1.2, .5, .2), C['p8a'] + .62)
    whoosh_to(C['p8b'] + .1, .6, f0=400, f1=4000, gain=.22); put(blip(1900, .12, .25), C['p8b'] + .2)
    return mix[:int(total * SR)]

if __name__ == '__main__':
    C = json.load(open(sys.argv[1])); total = float(sys.argv[3])
    m = build(C, total)
    m = np.tanh(m * 0.9) * 0.9
    import wave
    pcm = (np.clip(m, -1, 1) * 32767).astype('<i2')
    with wave.open(sys.argv[2], 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print('sfx ok', m.shape[0] / SR, 's peak', np.abs(m).max())
