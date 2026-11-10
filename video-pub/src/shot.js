// node shot.js page.html out.png w h
const {chromium}=require('playwright');
(async()=>{const [pg,out,w,h]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:+w,height:+h}});
await p.goto('file://'+__dirname+'/'+pg);await p.waitForFunction(()=>window.READY===true);await p.screenshot({path:out});await b.close()})();
