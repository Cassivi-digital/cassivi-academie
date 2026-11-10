// usage: node preview.js out_prefix t1 t2 ...
const {chromium}=require('playwright');
(async()=>{
  const [prefix,...ts]=process.argv.slice(2);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
  p.on('console',m=>console.log('PAGE:',m.text()));p.on('pageerror',e=>console.log('PAGEERR:',e.message));
  await p.goto('file://'+__dirname+'/pub.html');await p.waitForFunction(()=>window.READY===true);
  for(const t of ts){await p.evaluate(t=>render(+t),t);await p.screenshot({path:`${prefix}_${(+t).toFixed(2).padStart(6,'0')}.png`});}
  await b.close();
})();
