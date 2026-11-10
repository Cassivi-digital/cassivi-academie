import re, subprocess, numpy as np, json, sys
audio=sys.argv[1]
script=open('src/voice_script.txt').read().strip()
# phrases: split after punctuation
toks=[p.strip() for p in re.split(r'(?<=[,.…:?!])\s+',script.replace('\n',' ')) if p.strip()]
log=subprocess.run(['ffmpeg','-i',audio,'-af','silencedetect=noise=-38dB:d=0.25','-f','null','-'],capture_output=True,text=True).stderr
st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',log)]; en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',log)]
dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',audio],capture_output=True,text=True).stdout)
# speech segments
segs=[];cur=0.0
for s,e in zip(st,en):
    if s-cur>0.05: segs.append((cur,s))
    cur=e
if dur-cur>0.05: segs.append((cur,dur))
w=lambda s:len(re.sub(r'[^\w]','',s))+0.0
cw=np.array([w(t) for t in toks]); cum=np.concatenate([[0],np.cumsum(cw)])
sd=np.array([b-a for a,b in segs])
rate=cw.sum()/sd.sum()
nS,nT=len(segs),len(toks)
INF=1e18;D=np.full((nS+1,nT+1),INF);B=np.zeros((nS+1,nT+1),int);D[0,0]=0
for i in range(1,nS+1):
  for j in range(i,nT+1):
    for k in range(i-1,j):
      if D[i-1,k]>=INF:continue
      est=(cum[j]-cum[k])/rate+0.12*(j-k-1)
      strong=sum(1 for q in range(k,j-1) if re.search(r'[.?…]$',toks[q]))
      c=D[i-1,k]+np.log(max(sd[i-1],.2)/max(est,.2))**2+0.35*strong
      if c<D[i,j]:D[i,j]=c;B[i,j]=k
j=nT;assign=[]
for i in range(nS,0,-1):
  k=B[i,j];assign.append((i-1,k,j));j=k
assign.reverse()
out=[]
for i,k,j in assign:
  a,b=segs[i];text=' '.join(toks[k:j]);out.append({'t0':round(a,3),'t1':round(b,3),'text':text})
  print(f"{a:6.2f}-{b:6.2f} ({b-a:4.2f}s / est {(cum[j]-cum[k])/rate:4.2f}) | {text}")
json.dump(out,open('build/align.json','w'),ensure_ascii=False,indent=1)
