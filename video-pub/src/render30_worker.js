// node render_worker.js <fps> <f0> <f1> <out.mp4> [cues.json]
const {chromium}=require('playwright');const W=+process.env.W,HH=+process.env.H;const {spawn}=require('child_process');const fs=require('fs');
(async()=>{
  const [fps,f0,f1,out,cues]=process.argv.slice(2);const FPS=+fps;
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:HH}});
  p.on('pageerror',e=>console.error('PAGEERR',e.message));
  if(cues)await p.addInitScript(c=>{window.CUES=c},JSON.parse(fs.readFileSync(cues,'utf8')));
  await p.goto(`file://${__dirname}/${process.env.PAGE||'pub30.html'}?w=${W}&h=${HH}${process.env.VARIANT?'&v='+process.env.VARIANT:''}`);await p.waitForFunction(()=>window.READY===true);
  const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-c:v','mjpeg','-framerate',String(FPS),'-i','-',
    '-c:v','libx264','-preset','slow','-crf','14','-pix_fmt','yuv420p','-profile:v','high','-r',String(FPS),out],{stdio:['pipe','inherit','inherit']});
  for(let f=+f0;f<+f1;f++){
    await p.evaluate(t=>render(t),f/FPS);
    const buf=await p.screenshot({type:'jpeg',quality:96});
    if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
    if(f%150===0)console.log(`[${out}] frame ${f}`);
  }
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();
})();
