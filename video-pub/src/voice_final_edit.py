"""Montage de la voix off finale (ElevenLabs « Nicolas », fournie par le client) : voix intacte (pas de changement
de tempo), silences naturels plafonnés, respiration courte avant le CTA calée sur le temps musical,
repères d'animation et sous-titres sur le texte exact."""
import subprocess, numpy as np, json, wave
SR=48000; LEAD=0.05; HOLD=2.3; CAP=.25
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/voice_final_nicolas.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).copy()
# (début, fin, cue, silence avant (None = naturel plafonné), cues internes {nom: instant absolu dans la prise})
S=[(0.05,1.34,'a0',0,{}),(1.72,3.27,'a1',None,{}),(3.72,4.36,'a2',None,{}),
 (4.81,6.45,'b0',.27,{'b1':5.70}),(6.79,7.38,'x0',None,{}),(7.61,9.81,'xa',None,{'xb':7.95,'xc':9.00}),(10.14,11.15,'x1',None,{}),
 (11.58,13.74,'c0',.27,{'c1':12.33,'c2':13.02}),(14.00,16.52,'c3',None,{'c4':15.20,'c5':15.92}),(16.79,19.33,'ct',None,{'c7':18.02,'c6':18.62}),
 (19.60,21.64,'c8',None,{'c9':20.94}),
 (22.01,23.49,'h0',.28,{}),(23.81,26.16,'h1',None,{'h1b':24.60,'h1c':25.20}),(26.43,28.62,'h2',None,{'h2v':27.30,'h2w':28.01}),
 (29.02,30.15,'p0',.27,{}),(30.35,31.39,'p1',None,{}),
 (31.75,33.24,'d0',.27,{}),(33.56,34.65,'d1',None,{}),(34.79,35.67,'d2',None,{}),
 (36.04,39.83,'r0',.28,{'rp':37.43,'r1':38.45}),(39.99,41.65,'r2',None,{}),
 (41.95,46.76,'e0',.26,{'e1':42.15,'e2':43.00,'e3':43.89,'e4':44.53,'e5':45.16,'e6':46.20}),
 (47.04,48.71,'k0',.26,{'ka':47.87}),(48.85,49.78,'k1',None,{}),
 (50.15,50.82,'u0',.26,{}),(51.05,52.38,'g0','BREATH',{}),(52.58,55.80,'g1',None,{})]
SUB=[(0,0,'Cette pub que tu regardes…'),(1,2,'quelqu’un est payé pour la piloter. Avec l’IA.'),(3,3,'Ce métier, c’est Media Buyer.'),
 (4,5,'Sa mission : mettre la bonne pub devant les bons clients…'),(6,6,'et faire grandir les ventes.'),
 (7,7,'Avec Claude, ses connecteurs et ses skills,'),(8,8,'il analyse ses campagnes Meta Ads et Google Ads,'),
 (9,9,'contrôle son tracking, du Pixel à Analytics,'),(10,10,'et suit ses KPIs en quelques minutes.'),
 (11,11,'Mais l’IA ne décide pas seule.'),(12,12,'La stratégie, le budget, les créatives :'),(13,13,'le media buyer les vérifie et les valide.'),
 (14,15,'L’IA accélère. L’expert décide.'),(16,16,'Une compétence très recherchée…'),(17,18,'pour décrocher des clients, ou devenir freelance.'),
 (19,19,'La formation Media Buyer pilotée par l’IA, par CASSIVI DIGITAL MG,'),(20,20,'avec des formateurs expérimentés.'),
 (21,21,'Pour e-commerçants, entrepreneurs, PME, agences, community managers et étudiants.'),
 (22,23,'Deux jours en salle à Antsakaviro… et un mois de suivi.'),(24,24,'Places limitées !'),(25,25,'Réserve ta place sur WhatsApp :'),
 (26,26,'037 59 755 12')]
fade=int(.008*SR);pad=int(.03*SR)
def build(breath):
    out=[np.zeros(int(LEAD*SR),np.float32)];pos=LEAD;cues={};segt=[]
    for i,(a,b,cue,gap,inner) in enumerate(S):
        if i:
            g=breath if gap=='BREATH' else (min(CAP,a-S[i-1][1]) if gap is None else gap)
            out.append(np.zeros(int(g*SR),np.float32));pos+=g
        seg=x[max(0,int(a*SR)-pad):min(len(x),int(b*SR)+pad)].copy();seg[:fade]*=np.linspace(0,1,fade);seg[-fade:]*=np.linspace(1,0,fade)
        if cue:cues[cue]=pos
        for k,ta in inner.items(): cues[k]=pos+(ta-a)+pad/SR
        segt.append((pos,pos+len(seg)/SR));out.append(seg);pos+=len(seg)/SR
    return np.concatenate(out),cues,segt
# respiration avant le CTA : impact (g0−0,05 s) sur un temps de la musique, au plus près de 0,45 s après « Places limitées ! »
_,c0,st0=build(.5); uend=st0[24][1]; beat0=c0['b1']+.045
best=None
for k in range(300):
    tb=beat0+.5*k; gap=(tb+.05)-uend
    if .28<=gap<=.85:
        sc=abs(gap-.45)
        if best is None or sc<best[0]: best=(sc,gap,k)
y,cues,segt=build(best[1])
with wave.open('audio/voice_final_edit.wav','wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(y,-1,1)*32767).astype('<i2').tobytes())
C={k:round(v,3) for k,v in cues.items()};vd=len(y)/SR;C['voice_end']=round(vd,3);C['end']=round(vd+HOLD,3)
json.dump(C,open('build/cues_final.json','w'),indent=1)
subs=[[round(segt[a][0],3),round(segt[b][1],3),t] for a,b,t in SUB]
json.dump(subs,open('build/subs_final.json','w'),ensure_ascii=False,indent=1)
print(f"respiration CTA {best[1]:.2f} s (temps n°{best[2]}{' = temps fort' if best[2]%4==0 else ''}) | voix {vd:.2f} s | vidéo {C['end']} s")
print(' '.join(f'{k}={v}' for k,v in sorted(C.items(),key=lambda kv:kv[1])))
# niveau de mixage : la voix ElevenLabs sort à −22,5 LUFS ; +7 dB et un limiteur de crêtes (−1 dBFS)
# la ramènent à −15,8 LUFS, le niveau validé au mixage du modèle IA (même chaîne de traitement ensuite)
subprocess.run(['ffmpeg','-y','-v','error','-i','audio/voice_final_edit.wav','-af','volume=7dB,alimiter=limit=0.891:attack=1.5:release=45:level=disabled','-c:a','pcm_f32le','audio/voice_final_mix.wav'],check=True)
print('voix de mixage : audio/voice_final_mix.wav')
