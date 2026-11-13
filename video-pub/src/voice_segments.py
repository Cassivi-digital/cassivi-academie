"""Détecte les segments parlés d'une voix off (silences > min_sil). usage: python3 src/voice_segments.py voix.mp3 [min_sil=0.16] [seuil_dB=-40]"""
import subprocess, numpy as np, sys
SR=48000; f=sys.argv[1]; MS=float(sys.argv[2]) if len(sys.argv)>2 else .16; TH=float(sys.argv[3]) if len(sys.argv)>3 else -40
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32)
hop=int(.01*SR); e=np.array([np.sqrt(np.mean(x[i:i+hop]**2)+1e-12) for i in range(0,len(x)-hop,hop)]); db=20*np.log10(e)
sp=db>TH; segs=[]; i=0; n=len(sp)
while i<n:
    if sp[i]:
        j=i
        while j<n and (sp[j] or (j+1<n and not sp[j] and np.any(sp[j:j+int(MS*100)]) )): j+=1
        segs.append((i/100,j/100)); i=j
    else: i+=1
print(f'durée {len(x)/SR:.2f}s, {len(segs)} segments')
for k,(a,b) in enumerate(segs): print(f'{k:2d} {a:6.2f} {b:6.2f}  ({b-a:.2f}s)')
