"""Aligne une nouvelle prise de voix (même texte) sur la voix de référence horodatée, par DTW sur MFCC.
usage: python3 src/align_dtw.py ref.wav nouvelle.mp3 -> affiche les repères transposés"""
import sys, json, numpy as np, librosa
ref, new = sys.argv[1], sys.argv[2]
SR, HOP = 16000, 160
def feat(p):
    y, _ = librosa.load(p, sr=SR, mono=True)
    m = librosa.feature.mfcc(y=y, sr=SR, n_mfcc=21, n_fft=512, hop_length=HOP, n_mels=40)[1:]
    m = (m - m.mean(1, keepdims=True)) / (m.std(1, keepdims=True) + 1e-6)
    d = librosa.feature.delta(m)
    return np.vstack([m, .5 * d]), len(y) / SR
X, dx = feat(ref); Y, dy = feat(new)
D, wp = librosa.sequence.dtw(X=X, Y=Y, metric='cosine', global_constraints=True, band_rad=.12)
wp = wp[::-1]
rf, nf = wp[:, 0], wp[:, 1]
def mapt(t):
    f = int(round(t * SR / HOP)); idx = np.where(rf == f)[0]
    if len(idx) == 0: idx = [np.argmin(abs(rf - f))]
    return float(np.median(nf[idx])) * HOP / SR
# instants des mots-repères dans la voix de référence (transcription horodatée)
R = {'a0': .20, 'a1': 1.60, 'a2': 3.70, 'b0': 4.90, 'b1': 5.90, 'x0': 7.00, 'x1': 8.80, 'c0': 10.50, 'c1': 11.40, 'c2': 12.10, 'c3': 13.10,
     'c4': 14.50, 'c5': 15.50, 'c6': 16.60, 'c7': 17.50, 'd0': 18.90, 'd1': 20.70, 'd2': 22.10, 'e0': 23.50, 'e1': 24.40, 'e2': 25.30,
     'e3': 26.30, 'e4': 27.10, 'e5': 27.80, 'e6': 29.00, 'r0': 30.00, 'rp': 31.60, 'r1': 32.90, 'r2': 35.50, 'k0': 37.70, 'ka': 38.80,
     'k1': 40.30, 'u0': 42.00, 'g0': 43.80, 'g1': 45.20, 'fin': 49.60}
out = {k: round(mapt(v), 3) for k, v in R.items()}
print(f'référence {dx:.2f}s → nouvelle {dy:.2f}s ; coût moyen {D[-1,-1]/len(wp):.3f}')
print(json.dumps(out))
