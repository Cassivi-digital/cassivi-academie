import subprocess, numpy as np, json, wave
SR=48000; TEMPO=1.14; LEAD=0.05; HOLD=2.4
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/voice30v2_raw.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).copy()
S=[(0,1.45,'Cette pub que tu regardes…','a0',0),(1.82,3.44,'quelqu’un est payé pour la piloter.','a1',.16),
 (3.78,4.5,'Ce métier,','b0',.24),(4.73,5.71,'c’est Media Buyer.','b1',.08),
 (6.17,7.17,'Meta Ads.','m0',.22),(7.45,8.35,'Google Ads.','m1',.12),
 (8.79,9.85,'Et tout le tracking :','t0',.2),(10.29,11.4,'Google Analytics,','t1',.12),(11.75,12.59,'Tag Manager,','t2',.08),
 (12.92,13.9,'Search Console,','t3',.08),(14.2,14.97,'le Pixel,','t4',.08),(15.24,16.59,'et l’API de conversion.','t5',.08),
 (17.27,18.74,'Plus l’acquisition client,','q0',.24),(19.1,20.74,'pour décrocher ta première mission','q1',.1),(20.94,21.8,'et démarrer vite.','q2',.08),
 (22.42,23.25,'E-commerçant,','w0',.22),(23.61,24.45,'entrepreneur,','w1',.1),(24.78,26.68,'ou futur freelance : c’est pour toi.','w2',.1),
 (27.25,29.36,'Deux jours en salle à Antsakaviro,','r0',.24),(29.71,32.28,'samedi 21 et lundi 23 novembre.','r1',.12),
 (32.81,34.39,'350 000 ariary,','p0',.24),(34.8,36.85,'avec 50 000 d’acompte pour réserver.','p1',.1),
 (37.35,38.45,'Places très limitées !','u0',1.25),(39.0,40.24,'Réserve sur WhatsApp :','g0',.2),
 (40.57,42.49,'037 59 755 12','g1',.1),(42.81,44.83,'',None,.1)]
fade=int(.01*SR);pad=int(.03*SR);out=[np.zeros(int(LEAD*SR),np.float32)];pos=LEAD;cues={};subs=[]
for i,(a,b,txt,cue,gap) in enumerate(S):
    if i: out.append(np.zeros(int(gap*SR),np.float32));pos+=gap
    seg=x[max(0,int(a*SR)-pad):min(len(x),int(b*SR)+pad)].copy();seg[:fade]*=np.linspace(0,1,fade);seg[-fade:]*=np.linspace(1,0,fade)
    if cue:cues[cue]=pos
    if txt:subs.append([pos,pos+len(seg)/SR,txt])
    else:subs[-1][1]=pos+len(seg)/SR
    out.append(seg);pos+=len(seg)/SR
y=np.concatenate(out)
with wave.open('build/voice30v2_tight.wav','wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i','build/voice30v2_tight.wav','-af',f'atempo={TEMPO}','-ar',str(SR),'audio/voice30v2_edit.wav'],check=True)
C={k:round(v/TEMPO,3) for k,v in cues.items()};vd=len(y)/SR/TEMPO;C['voice_end']=round(vd,3);C['end']=round(vd+HOLD,3)
json.dump(C,open('build/cues30v2.json','w'),indent=1);json.dump([[round(a/TEMPO,3),round(b/TEMPO,3),t] for a,b,t in subs],open('build/subs30v2.json','w'),ensure_ascii=False,indent=1)
print(' '.join(f'{k}={v}' for k,v in sorted(C.items(),key=lambda kv:kv[1])))
