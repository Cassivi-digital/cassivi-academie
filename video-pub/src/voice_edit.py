"""Montage de la voix : segments alignés -> silences resserrés -> tempo -> cues d'animation."""
import subprocess, numpy as np, json, wave
SR=48000; TEMPO=1.10
raw=subprocess.run(['ffmpeg','-v','error','-i','audio/voice_raw.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x=np.frombuffer(raw,np.float32).copy()
# (début, fin, texte, cue_au_début, silence_avant)
S=[(0.00,1.90,'Et si une compétence digitale…','h1',0.35),
 (2.29,3.51,'devenait ton vrai métier ?','h2',0.30),
 (4.33,7.65,'Chaque jour, les entreprises investissent dans la publicité en ligne','p2a',0.55),
 (7.93,9.21,'pour trouver de nouveaux clients.',None,0.14),
 (9.81,11.18,'Mais investir ne suffit pas.','p2b',0.32),
 (11.63,12.69,'Sans pilotage…','p2c',0.38),
 (13.08,14.13,'le budget s’envole,',None,0.22),
 (14.47,15.76,'et les résultats ne suivent pas.',None,0.20),
 (16.55,18.43,'C’est là qu’intervient le Média Buyer.','p3a',0.42),
 (18.92,22.12,'Il crée et pilote les campagnes Meta et Google Ads,','p3b',0.26),
 (22.57,23.66,'installe le tracking,','p3c',0.20),
 (23.99,24.96,'analyse les données…','p3d',0.18),
 (25.40,28.25,'et transforme chaque budget en résultats mesurables.','p3e',0.24),
 (28.90,31.66,'Et cette compétence peut devenir ton activité freelance.','p4a',0.45),
 (32.35,34.11,'Un client à 300 euros par mois.','p4b',0.30),
 (34.64,36.20,'Deux clients à 500 euros.','p4c',0.24),
 (36.66,38.27,'Trois clients à 700 euros…','p4d',0.24),
 (38.67,40.46,'soit 2 100 euros par mois.','p4e',0.42),
 (41.00,44.58,'Ce sont des exemples, pas des promesses : tout dépend de ton niveau,','p5a',0.50),
 (44.83,45.84,'de ton expérience,',None,0.18),
 (46.12,48.13,'et de ta capacité à trouver des clients.',None,0.18),
 (48.80,50.39,'Mais tu peux travailler à distance,','p5c',0.36),
 (50.68,52.03,'avec des entreprises d’ici…',None,0.20),
 (52.37,52.95,'ou d’ailleurs.',None,0.22),
 (53.70,55.56,'Chez Cassivi Digital MG,','p6a',0.50),
 (55.92,58.76,'ne te contente pas de découvrir le marketing digital.','p6b',0.24),
 (59.29,62.59,'Apprends à maîtriser une compétence recherchée par les entreprises.','p6c',0.30),
 (63.18,64.42,'Une formation pratique,','p6d',0.36),
 (64.71,65.45,'progressive,',None,0.16),
 (65.78,66.93,'sur de vraies campagnes.',None,0.18),
 (67.47,69.53,'Formation Média Buyer Freelance.','p7a',0.48),
 (69.93,71.00,'Inscriptions ouvertes,','p7b',0.26),
 (71.27,72.23,'à Antsakaviro.',None,0.16),
 (72.75,74.38,'Les places sont très limitées.','p7c',0.28),
 (74.92,77.22,'Réserve ta place maintenant, sur WhatsApp :','p8a',0.55),
 (77.55,79.54,'037 59 755 12',"p8b",0.24),
 (79.81,81.08,'',None,0.18),
 (81.40,81.87,'',None,0.14)]
LEAD=0.40  # silence avant la première phrase (place pour l'impact d'ouverture)
fade=int(.012*SR); pad=int(.04*SR)
out=[np.zeros(int(LEAD*SR),np.float32)]; pos=LEAD; cues={}; subs=[]
for i,(a,b,txt,cue,gap) in enumerate(S):
    if i>0: out.append(np.zeros(int(gap*SR),np.float32)); pos+=gap
    i0=max(0,int(a*SR)-pad); i1=min(len(x),int(b*SR)+pad)
    seg=x[i0:i1].copy(); seg[:fade]*=np.linspace(0,1,fade); seg[-fade:]*=np.linspace(1,0,fade)
    if cue: cues[cue]=pos
    if txt: subs.append([pos,pos+len(seg)/SR,txt])
    else: subs[-1][1]=pos+len(seg)/SR
    out.append(seg); pos+=len(seg)/SR
y=np.concatenate(out)
with wave.open('build/voice_tight.wav','wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i','build/voice_tight.wav','-af',f'atempo={TEMPO}','-ar',str(SR),'audio/voice_edit.wav'],check=True)
vdur=len(y)/SR/TEMPO
C={k:round(v/TEMPO,3) for k,v in cues.items()}
subs=[[round(a/TEMPO,3),round(b/TEMPO,3),t] for a,b,t in subs]
# transitions de scène calées juste avant chaque phrase-clé
C['s2']=round(C['p2a']-0.15,3); C['s3']=round(C['p3a']-0.12,3); C['s4']=round(C['p4a']-0.12,3)
C['s4b']=round(C['p5a']-0.10,3); C['s5']=round(C['p6a']-0.15,3); C['s6']=round(C['p7a']-0.12,3); C['s7']=round(C['p8a']-0.15,3)
# 'tout dépend…' arrive ~2,1 s après le début de p5a (mesuré sur le débit du segment)
C['p5b']=round(C['p5a']+2.05/TEMPO,3)
C['voice_end']=round(vdur,3); C['end']=round(vdur+4.6,3)
json.dump(C,open('build/cues.json','w'),indent=1); json.dump(subs,open('build/subs.json','w'),ensure_ascii=False,indent=1)
for k,v in sorted(C.items(),key=lambda kv:kv[1]): print(f'{k:10s} {v:7.2f}')
