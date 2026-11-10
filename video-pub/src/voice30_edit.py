import subprocess, numpy as np, json, wave
SR=48000; TEMPO=1.12; LEAD=0.06; HOLD=2.3
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/voice30_raw.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).copy()
S=[(0.00,1.34,'Cette pub que tu regardes…','a0',0),(1.89,3.63,'quelqu’un est payé pour la piloter.','a1',.18),
 (4.05,4.82,'Ce métier,','b0',.26),(5.07,6.04,'c’est Media Buyer.','b1',.10),
 (6.68,7.49,'Meta Ads.','c0',.22),(7.91,8.68,'Google Ads.','c1',.12),(8.98,9.63,'Tracking.','c2',.12),(9.98,10.98,'Analyse des données.','c3',.12),
 (11.34,12.79,'Les entreprises en ont besoin.','c4',.16),(13.37,13.89,'Exemple :','d0',.26),(14.28,16.12,'trois clients à 700 €…',None,.14),
 (16.52,18.28,'c’est 2 100 € par mois,','d1',.16),(18.51,19.28,'en freelance.','d2',.08),
 (19.75,21.45,'Chez Cassivi Digital MG,','e0',.26),(21.79,24.13,'tu apprends en salle, sur de vraies campagnes,','e1',.14),
 (24.39,25.39,'avec un formateur.','e3',.10),(25.83,27.71,'Formation Media Buyer Freelance,','f0',.26),(28.04,28.97,'à Antsakaviro.','f1',.10),
 (29.32,30.44,'Places très limitées !','f2',.14),(30.94,32.48,'Réserve ta place sur WhatsApp :','g0',.26),
 (32.84,33.82,'037 59 755 12','g1',.12),(34.06,34.93,'',None,.10),(35.21,36.51,'',None,.10),(36.80,37.33,'',None,.08)]
fade=int(.01*SR);pad=int(.03*SR);out=[np.zeros(int(LEAD*SR),np.float32)];pos=LEAD;cues={};subs=[]
for i,(a,b,txt,cue,gap) in enumerate(S):
    if i: out.append(np.zeros(int(gap*SR),np.float32));pos+=gap
    seg=x[max(0,int(a*SR)-pad):min(len(x),int(b*SR)+pad)].copy();seg[:fade]*=np.linspace(0,1,fade);seg[-fade:]*=np.linspace(1,0,fade)
    if cue:cues[cue]=pos
    if cue=='e1':cues['e2']=pos+(22.88-21.79+.03)
    if txt:subs.append([pos,pos+len(seg)/SR,txt])
    else:subs[-1][1]=pos+len(seg)/SR
    out.append(seg);pos+=len(seg)/SR
y=np.concatenate(out)
with wave.open('build/voice30_tight.wav','wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i','build/voice30_tight.wav','-af',f'atempo={TEMPO}','-ar',str(SR),'audio/voice30_edit.wav'],check=True)
C={k:round(v/TEMPO,3) for k,v in cues.items()};vd=len(y)/SR/TEMPO;C['voice_end']=round(vd,3);C['end']=round(vd+HOLD,3)
json.dump(C,open('build/cues30.json','w'),indent=1);json.dump([[round(a/TEMPO,3),round(b/TEMPO,3),t] for a,b,t in subs],open('build/subs30.json','w'),ensure_ascii=False,indent=1)
print(' '.join(f'{k}={v}' for k,v in sorted(C.items(),key=lambda kv:kv[1])))
