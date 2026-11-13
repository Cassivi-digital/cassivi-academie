"""Contrôle qualité de la version finale : QR code décodé sur la dernière image de chaque format,
métadonnées couleur BT.709, nombre d'images, débit, niveau sonore (−14 LUFS / −1,5 dBTP)."""
import subprocess, json, numpy as np, cv2, sys
D='export/version_finale'; P=D+'/CASSIVI_MediaBuyer_Final_'
FMT={'9x16':(1080,1920),'4x5':(1080,1350),'1x1':(1080,1080),'16x9':(1920,1080)}
if len(sys.argv)>1: FMT={k:v for k,v in FMT.items() if k in sys.argv[1:]}
def frame(path,t,w,h):
    raw=subprocess.run(['ffmpeg','-v','error','-ss',f'{t:.4f}','-i',path,'-frames:v','1','-vf','scale=in_color_matrix=bt709:in_range=tv,format=rgb24','-f','rawvideo','-'],capture_output=True).stdout
    return np.frombuffer(raw,np.uint8).reshape(h,w,3)
ok=True
for n,(w,h) in FMT.items():
    f=P+n+'.mp4'
    pr=json.loads(subprocess.run(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',f],capture_output=True,text=True).stdout)
    v=[s for s in pr['streams'] if s['codec_type']=='video'][0]; a=[s for s in pr['streams'] if s['codec_type']=='audio'][0]
    img=cv2.cvtColor(frame(f,float(pr['format']['duration'])-.25,w,h),cv2.COLOR_RGB2BGR)
    qr=cv2.QRCodeDetector().detectAndDecode(img)[0]
    lufs=subprocess.run(['ffmpeg','-v','info','-i',f,'-map','0:a','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
    I=[l for l in lufs.splitlines() if l.strip().startswith('I:')][-1].split()[1]; TP=[l for l in lufs.splitlines() if l.strip().startswith('Peak:')][-1].split()[1]
    qok=qr.startswith('https://wa.me/261375975512'); cok=(v.get('color_space'),v.get('color_primaries'),v.get('color_transfer'))==('bt709','bt709','bt709')
    ok&=qok and cok
    print(f"{n:5s} {v['width']}x{v['height']} {v['profile']} L{v['level']} {v['pix_fmt']} {v.get('color_space')}/{v.get('color_primaries')}/{v.get('color_transfer')}/{v.get('color_range')} "
          f"{v['nb_read_frames']} images {int(v['bit_rate'])/1e6:.1f} Mb/s | audio {a['codec_name']} {int(a['bit_rate'])//1000} kb/s {a['sample_rate']} Hz {I} LUFS crête {TP} | {float(pr['format']['duration']):.2f} s {int(pr['format']['size'])/1e6:.1f} Mo")
    print(f"      QR {'OK' if qok else 'ÉCHEC'} ({qr[:60]})  couleurs {'OK' if cok else 'ÉCHEC'}")
print('QC', 'OK' if ok else 'À VÉRIFIER')
