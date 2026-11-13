"""Sous-titres SRT de la version finale, à partir des repères de la voix (build/subs_final.json)."""
import json
S=json.load(open('build/subs_final.json'))
ts=lambda s:f"{int(s//3600):02d}:{int(s%3600//60):02d}:{int(s%60):02d},{int(round((s%1)*1000))%1000:03d}"
out='export/version_finale/CASSIVI_MediaBuyer_Final_sous-titres.srt'
with open(out,'w',encoding='utf-8') as f:
    for i,(a,b,t) in enumerate(S,1): f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n")
print(out,len(S),'sous-titres')
