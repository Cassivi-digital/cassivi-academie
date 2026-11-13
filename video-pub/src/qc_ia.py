"""Contrôle qualité du modèle « Formation Media Buyer pilotée par l’IA ».
- QR code décodé sur l'image finale de chaque format
- comparaison avec la v3 (RGB, PSNR) sur la partie qui ne devait pas changer
- métadonnées couleur, nombre d'images, niveau sonore"""
import subprocess, json, numpy as np, cv2, sys
D='export/version_IA'; P=D+'/CASSIVI_MediaBuyer_IA_'; V3='export/version_30s_v3/CASSIVI_MediaBuyer_v3_'
FMT={'9x16':(1080,1920),'4x5':(1080,1350),'1x1':(1080,1080),'16x9':(1920,1080)}
if len(sys.argv)>1: FMT={k:v for k,v in FMT.items() if k in sys.argv[1:]}
def frame(path,t,w,h,matrix):
    raw=subprocess.run(['ffmpeg','-v','error','-ss',f'{t:.4f}','-i',path,'-frames:v','1','-vf',f'scale=in_color_matrix={matrix}:in_range=tv,format=rgb24','-f','rawvideo','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.uint8).reshape(h,w,3)
def psnr(a,b):
    m=np.mean((a.astype(float)-b.astype(float))**2); return 99.0 if m==0 else 10*np.log10(255**2/m)
SAME=[0.5,3.0,6.0,10.0,13.0,17.0,21.0,24.5,25.7]   # 0 → 25,79 s : identique à la v3 (avant la 2e photo de la scène en salle)
CHG=[26.0,27.0,33.0]                                 # après : diffère volontairement (scène en salle raccourcie, respiration, CTA décalé)
ok=True
for n,(w,h) in FMT.items():
    f=P+n+'.mp4'
    pr=json.loads(subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',f],capture_output=True,text=True).stdout)
    v=[s for s in pr['streams'] if s['codec_type']=='video'][0]; a=[s for s in pr['streams'] if s['codec_type']=='audio'][0]
    img=cv2.cvtColor(frame(f,float(pr['format']['duration'])-.25,w,h,'bt709'),cv2.COLOR_RGB2BGR)
    qr=cv2.QRCodeDetector().detectAndDecode(img)[0]
    lufs=subprocess.run(['ffmpeg','-v','info','-i',f,'-map','0:a','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
    I=[l for l in lufs.splitlines() if l.strip().startswith('I:')][-1].split()[1]; TP=[l for l in lufs.splitlines() if l.strip().startswith('Peak:')][-1].split()[1]
    qok=qr.startswith('https://wa.me/261375975512'); ok&=qok
    print(f"{n:5s} {v['width']}x{v['height']} {v['profile']} L{v['level']} {v['pix_fmt']} {v.get('color_space')}/{v.get('color_primaries')}/{v.get('color_transfer')}/{v.get('color_range')} "
          f"{int(v['bit_rate'])/1e6:.1f} Mb/s | audio {a['codec_name']} {int(a['bit_rate'])//1000} kb/s {a['sample_rate']} Hz {I} LUFS TP {TP} | {float(pr['format']['duration']):.2f} s {int(pr['format']['size'])/1e6:.1f} Mo")
    print(f"      QR {'OK' if qok else 'ÉCHEC'}")
print('QC', 'OK' if ok else 'À VÉRIFIER')
