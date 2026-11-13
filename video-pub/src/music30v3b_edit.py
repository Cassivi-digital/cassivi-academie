"""Montage musique v3b : identique à la v3 (drop sur « MEDIA BUYER », raccord vers l'outro sur la mesure),
plus la respiration avant le CTA : la musique passe en sourdine (filtre passe-bas + baisse de niveau),
seule la pulsation grave reste, puis elle revient pleine et brillante sur le temps du CTA."""
import numpy as np, subprocess, wave, json
SR=48000; DIP=0.5; LP=380
C=json.load(open('build/cues30v3b.json')); subs=json.load(open('build/subs30v3b.json'))
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/music_raw.wav','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).reshape(-1,2).copy()
g=lambda s:int(round(s*SR)); xf=g(.04); st=25.54-C['b1']
A=x[g(st):g(57.54)]; B=x[g(63.54):]
r=np.linspace(0,1,xf)[:,None]; y=np.concatenate([A[:-xf],A[-xf:]*(1-r)+B[:xf]*r,B[xf:]])[:g(C['end'])]
# respiration : creux de -12 dB entre la fin de « Places très limitées ! » et le CTA
u_end=[b for a,b,t in subs if t.startswith('Places très limitées')][0]
d0,d1=u_end,u_end+.3; e1=C['g0']-.04; e0=e1-.035
t=np.arange(len(y))/SR
a=np.zeros_like(t)  # 0 = musique pleine, 1 = sourdine
m=(t>=d0)&(t<d1); a[m]=.5-.5*np.cos(np.pi*(t[m]-d0)/(d1-d0))
m=(t>=d1)&(t<e0); a[m]=1
m=(t>=e0)&(t<e1); a[m]=1-(t[m]-e0)/(e1-e0)
lp=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-af',f'lowpass=f={LP}:p=2,lowpass=f={LP}:p=2','-f','f32le','-'],input=y.astype(np.float32).tobytes(),capture_output=True).stdout,np.float32).reshape(-1,2)[:len(y)]
y=(y*(1-a)[:,None]+lp*a[:,None])*(1-(1-DIP)*a)[:,None]
with wave.open('audio/music30v3b_edit.wav','wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
beat=C['b1']+.045
print(f"musique {len(y)/SR:.2f}s | creux {d0:.3f}→{e1:.3f} | CTA g0={C['g0']} | temps musical le plus proche {beat+round((C['g0']-.05-beat)/.5)*.5:.3f} | raccord outro {57.54-st:.3f}")
