"""Montage de la voix off du modèle IA (Cartesia « Etienne », via Speko) : silences resserrés, tempo,
respiration avant le CTA calée sur le temps musical, repères d'animation et sous-titres."""
import subprocess, numpy as np, json, wave
SR=48000; TEMPO=1.08; LEAD=0.05; HOLD=2.4
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/voice_ia_raw.wav','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).copy()
# (début, fin, cue, silence avant, cues internes {nom: instant absolu dans l'enregistrement})
S=[(0.00,1.54,'a0',0,{}),(1.68,3.09,'a1',.12,{}),(3.66,4.26,'a2',.24,{}),
 (4.86,6.69,'b0',.22,{'b1':5.90}),(7.03,8.27,'x0',.14,{}),(8.77,9.80,'x1',.1,{}),
 (10.53,13.00,'c0',.2,{'c1':11.40,'c2':12.10}),(13.17,14.26,'c3',.08,{}),(14.40,15.30,None,.06,{'c4':14.50}),
 (15.51,16.39,'c5',.06,{}),(16.59,17.34,'c6',.06,{}),(17.56,18.17,'c7',.06,{}),
 (18.73,20.37,'d0',.22,{}),(20.80,21.86,'d1',.1,{}),(22.12,23.28,'d2',.08,{}),
 (23.52,25.08,'e0',.2,{'e1':24.40}),(25.32,26.11,'e2',.06,{}),(26.34,26.85,'e3',.06,{}),(27.09,27.74,'e4',.06,{}),(27.88,29.37,'e5',.06,{'e6':29.00}),
 (29.93,32.60,'r0',.24,{'rp':31.60}),(32.88,37.15,'r1',.1,{'r2':35.50}),
 (37.63,39.69,'k0',.2,{'ka':38.80}),(40.32,41.23,'k1',.12,{}),
 (41.90,42.97,'u0',.3,{}),(43.71,46.13,'g0','BREATH',{'g1':45.20}),(46.36,47.21,None,.08,{}),(47.55,48.79,None,.08,{}),(49.02,49.58,None,.06,{})]
SUB=[(0,0,'Cette pub que tu regardes…'),(1,2,'quelqu’un est payé pour la piloter — avec l’IA.'),(3,3,'Ce métier, c’est Media Buyer.'),
 (4,5,'Il cible les bons clients… et fait grandir les ventes.'),(6,6,'Avec Claude, ses connecteurs et ses skills,'),
 (7,11,'il mesure et pilote tout : Meta Ads, Google Ads, Analytics, le Pixel.'),(12,12,'Des compétences très recherchées…'),
 (13,14,'pour décrocher des clients, et devenir freelance.'),(15,17,'Idéale pour les e-commerçants, entrepreneurs, PME,'),
 (18,19,'agences, community managers et étudiants.'),(20,20,'La formation Media Buyer pilotée par l’IA,'),
 (21,21,'dispensée par CASSIVI DIGITAL MG, avec des formateurs expérimentés.'),(22,23,'Deux jours en salle à Antsakaviro… et un mois de suivi.'),
 (24,24,'Places très limitées !'),(25,'g1','Réserve ta place sur WhatsApp :'),('g1',28,'037 59 755 12')]
fade=int(.01*SR);pad=int(.03*SR)
def build(breath):
    out=[np.zeros(int(LEAD*SR),np.float32)];pos=LEAD;cues={};segt=[]
    for i,(a,b,cue,gap,inner) in enumerate(S):
        g=breath if gap=='BREATH' else gap
        if i: out.append(np.zeros(int(g*SR),np.float32));pos+=g
        seg=x[max(0,int(a*SR)-pad):min(len(x),int(b*SR)+pad)].copy();seg[:fade]*=np.linspace(0,1,fade);seg[-fade:]*=np.linspace(1,0,fade)
        if cue:cues[cue]=pos
        for k,ta in inner.items(): cues[k]=pos+(ta-a)+pad/SR
        segt.append((pos,pos+len(seg)/SR));out.append(seg);pos+=len(seg)/SR
    return np.concatenate(out),cues,segt
# respiration : l'impact du CTA (g0−0,05 s) tombe sur un temps de la musique (de préférence le temps fort),
# avec 0,45 à 0,85 s de silence après « Places très limitées ! »
_,c0,st0=build(0.5); uend=st0[24][1]/TEMPO; beat0=c0['b1']/TEMPO+.045
best=None
for k in range(200):
    tb=beat0+.5*k; gap=(tb+.05)-uend
    if .45<=gap<=.85:
        sc=abs(gap-.6)-(.25 if k%4==0 else 0)
        if best is None or sc<best[0]: best=(sc,gap,k)
BREATH=best[1]*TEMPO
y,cues,segt=build(BREATH)
with wave.open('build/voice_ia_tight.wav','wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-y','-v','error','-i','build/voice_ia_tight.wav','-af',f'atempo={TEMPO}','-ar',str(SR),'audio/voice_ia_edit.wav'],check=True)
C={k:round(v/TEMPO,3) for k,v in cues.items()};vd=len(y)/SR/TEMPO;C['voice_end']=round(vd,3);C['end']=round(vd+HOLD,3)
json.dump(C,open('build/cues_ia.json','w'),indent=1)
T=lambda v:v/TEMPO
subs=[]
for a,b,txt in SUB:
    s0=T(cues['g1']) if a=='g1' else T(segt[a][0]); s1=T(cues['g1'])-.03 if b=='g1' else T(segt[b][1])
    subs.append([round(s0,3),round(s1,3),txt])
json.dump(subs,open('build/subs_ia.json','w'),ensure_ascii=False,indent=1)
print(f"respiration {best[1]:.2f} s (temps n°{best[2]}{' = temps fort' if best[2]%4==0 else ''}) | durée {C['end']} s")
print(' '.join(f'{k}={v}' for k,v in sorted(C.items(),key=lambda kv:kv[1])))
