// Rendu qualité maximale : captures PNG sans perte -> intermédiaire RGB sans perte (x264rgb qp 0).
// node render_hq_worker.js <fps> <f0> <f1> <out.mkv> <cues.json>   (env PAGE, W, H)
const {chromium}=require('playwright');const {spawn}=require('child_process');const fs=require('fs');
const W=+process.env.W,HH=+process.env.H;
(async()=>{
  const [fps,f0,f1,out,cues]=process.argv.slice(2);const FPS=+fps;
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:HH},deviceScaleFactor:1});
  p.on('pageerror',e=>console.error('PAGEERR',e.message));
  if(cues)await p.addInitScript(c=>{window.CUES=c},JSON.parse(fs.readFileSync(cues,'utf8')));
  await p.goto(`file://${__dirname}/${process.env.PAGE}?w=${W}&h=${HH}`);await p.waitForFunction(()=>window.READY===true);
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-c:v','png','-framerate',String(FPS),'-i','-',
    '-c:v','libx264rgb','-preset','veryfast','-qp','0','-pix_fmt','rgb24','-r',String(FPS),out],{stdio:['pipe','inherit','inherit']});
  for(let f=+f0;f<+f1;f++){
    await p.evaluate(t=>render(t),f/FPS);
    const buf=await p.screenshot({type:'png'});
    if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
    if(f%150===0)console.log(`[${out}] image ${f}`);
  }
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
})();
