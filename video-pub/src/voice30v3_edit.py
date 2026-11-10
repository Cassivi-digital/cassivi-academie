import subprocess, numpy as np, json, wave
SR=48000; TEMPO=1.12; LEAD=0.05; HOLD=2.4; PUNCH=2.9
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/voice30v3_raw.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).copy()
# (début, fin, texte, cue, silence avant, cues internes {nom: fraction du segment})
S=[(0,1.35,'Cette pub que tu regardes…','a0',0,{}),(1.7,3.23,'quelqu’un est payé pour la piloter.','a1',.14,{}),
 (3.59,5.5,'Ce métier, c’est Media Buyer.','b0',.22,{'b1':.5}),
 (5.78,7.3,'Il pilote la pub des entreprises :','x0',.16,{}),(7.61,9.97,'il cible les bons clients, gère le budget,','x1',.1,{'x2':.63}),
 (10.16,11.19,'analyse les résultats…','x3',.08,{}),(11.55,12.68,'et fait grandir les ventes.','x4',.08,{}),
 (13.19,14.03,'Meta Ads,','m0',.22,{}),(14.25,15.14,'Google Ads,','m1',.1,{}),(15.42,16.08,'et le tracking :','t0',.1,{}),
 (16.43,17.76,'Google Analytics,','t1',.08,{}),(18.03,18.75,'Tag Manager,','t2',.06,{}),(19.03,19.84,'Search Console,','t3',.06,{}),
 (20.24,20.8,'Pixel,','t4',.06,{}),(21.21,21.76,'API',  't5',.06,{}),(22.08,22.77,'de conversion.',None,.04,{}),
 (23.43,24.56,'Plus l’acquisition client,','q0',.22,{}),(24.96,25.93,'pour ta première mission.','q1',.08,{}),
 (26.56,27.26,'E-commerçant,','w0',.22,{}),(27.61,29.41,'entrepreneur ou futur freelance :','w1',.08,{'w2':.39}),(29.7,30.36,'c’est pour toi.','w3',.08,{}),
 (30.88,32.82,'La formation pour devenir Media Buyer :','r0',.24,{}),(33.03,35.07,'deux jours en salle à Antsakaviro,','rr',.08,{}),
 (35.33,37.1,'les 21 et 23 novembre.','r1',.08,{}),
 (37.44,38.5,'Places très limitées !','u0',PUNCH,{}),(38.87,40.38,'Réserve ta place sur WhatsApp :','g0',.18,{}),
 (40.73,41.89,'037 59 755 12','g1',.1,{}),(42.14,42.97,'',None,.08,{}),(43.26,44.76,'',None,.08,{}),(45.13,45.55,'',None,.08,{})]
fade=int(.01*SR);pad=int(.03*SR);out=[np.zeros(int(LEAD*SR),np.float32)];pos=LEAD;cues={};subs=[]
for i,(a,b,txt,cue,gap,inner) in enumerate(S):
    if i:
        if cue=='u0': cues['k0']=pos+.15
        out.append(np.zeros(int(gap*SR),np.float32));pos+=gap
    seg=x[max(0,int(a*SR)-pad):min(len(x),int(b*SR)+pad)].copy();seg[:fade]*=np.linspace(0,1,fade);seg[-fade:]*=np.linspace(1,0,fade)
    if cue:cues[cue]=pos
    for k,f in inner.items(): cues[k]=pos+(b-a)*f
    if txt:subs.append([pos,pos+len(seg)/SR,txt])
    else:subs[-1][1]=pos+len(seg)/SR
    out.append(seg);pos+=len(seg)/SR
subs=[s for s in subs]
# fusion du segment « API » avec « de conversion »
for i,s in enumerate(subs):
    if s[2]=='API': subs[i+1][0]=s[0]; subs[i+1][2]='API de conversion.'; subs.pop(i); break
y=np.concatenate(out)
with wave.open('build/voice30v3_tight.wav','wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i','build/voice30v3_tight.wav','-af',f'atempo={TEMPO}','-ar',str(SR),'audio/voice30v3_edit.wav'],check=True)
C={k:round(v/TEMPO,3) for k,v in cues.items()};C['q2']=round(C['q1']+.75,3);vd=len(y)/SR/TEMPO;C['voice_end']=round(vd,3);C['end']=round(vd+HOLD,3)
json.dump(C,open('build/cues30v3.json','w'),indent=1);json.dump([[round(a/TEMPO,3),round(b/TEMPO,3),t] for a,b,t in subs],open('build/subs30v3.json','w'),ensure_ascii=False,indent=1)
print(' '.join(f'{k}={v}' for k,v in sorted(C.items(),key=lambda kv:kv[1])))
