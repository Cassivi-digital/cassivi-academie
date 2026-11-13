"""Montage musique de la version finale (voix « Nicolas », 58 s) : même morceau 120 BPM que le modèle IA.
Le drop tombe sur « MEDIA BUYER » ; le passage 41,54→57,54 s (8 mesures) est rejoué une fois pour couvrir la durée,
puis l'outro (63,54 s →) termine naturellement le morceau juste avant la fin de la vidéo.
Raccords sur la grille des temps : chaque segment est prolongé de la durée du fondu, la grille ne se décale pas.
Respiration avant le CTA : sourdine (passe-bas + baisse de niveau) entre « Places limitées ! » et le CTA."""
import numpy as np, subprocess, wave, json
SR=48000; DIP=0.5; LP=380; XF=.04
C=json.load(open('build/cues_final.json')); subs=json.load(open('build/subs_final.json'))
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/music_raw.wav','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).reshape(-1,2).copy()
g=lambda s:int(round(s*SR)); xf=g(XF); st=25.54-C['b1']
segs=[(st,57.54),(41.54,57.54),(63.54,None)]
parts=[x[g(a):(g(b)+xf if b else len(x))] for a,b in segs]
r=np.linspace(0,1,xf)[:,None]; y=parts[0]
for p in parts[1:]: y=np.concatenate([y[:-xf],y[-xf:]*(1-r)+p[:xf]*r,p[xf:]])
y=y[:g(C['end'])]
if len(y)<g(C['end']): y=np.concatenate([y,np.zeros((g(C['end'])-len(y),2),np.float32)])
# respiration courte : sourdine entre la fin de « Places limitées ! » et le CTA (sur le temps fort)
u_end=[b for a,b,t in subs if t.startswith('Places limitées')][0]
e1=C['g0']-.04; e0=e1-.035; d0=u_end-.04; d1=min(d0+.14,e0-.01)
t=np.arange(len(y))/SR; a=np.zeros_like(t)
m=(t>=d0)&(t<d1); a[m]=.5-.5*np.cos(np.pi*(t[m]-d0)/(d1-d0))
m=(t>=d1)&(t<e0); a[m]=1
m=(t>=e0)&(t<e1); a[m]=1-(t[m]-e0)/(e1-e0)
lp=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-af',f'lowpass=f={LP}:p=2,lowpass=f={LP}:p=2','-f','f32le','-'],input=y.astype(np.float32).tobytes(),capture_output=True).stdout,np.float32).reshape(-1,2)[:len(y)]
y=(y*(1-a)[:,None]+lp*a[:,None])*(1-(1-DIP)*a)[:,None]
with wave.open('audio/music_final_edit.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
beat=C['b1']+.045; j1=57.54-st; j2=j1+16
print(f"musique {len(y)/SR:.3f}s | raccords {j1:.2f}s et {j2:.2f}s | fin naturelle ≈ {j2+68.2-63.54:.2f}s | sourdine {d0:.3f}→{e1:.3f} | CTA g0={C['g0']} (temps {beat+round((C['g0']-.05-beat)/.5)*.5:.3f})")
