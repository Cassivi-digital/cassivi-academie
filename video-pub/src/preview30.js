// node preview30.js W H prefix [cues.json|-] t1 t2 ...
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [w,h,prefix,cues,...ts]=process.argv.slice(2);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h}});
  p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
  if(cues&&cues!=='-')await p.addInitScript(c=>{window.CUES=c},JSON.parse(fs.readFileSync(cues,'utf8')));
  await p.goto(`file://${__dirname}/${process.env.PAGE||'pub30.html'}?w=${w}&h=${h}${process.env.VARIANT?'&v='+process.env.VARIANT:''}`);await p.waitForFunction(()=>window.READY===true);
  for(const t of ts){await p.evaluate(t=>render(+t),t);await p.screenshot({path:`${prefix}_${(+t).toFixed(2).padStart(6,'0')}.png`})}
  await b.close()})();
