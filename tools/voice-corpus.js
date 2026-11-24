// Extrae todas las frases que la app puede leer en voz alta (uso: node tools/voice-corpus.js). Requiere playwright.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').join(__dirname,'..','index.html')+'?corpus');await p.waitForTimeout(300);
const out=await p.evaluate(()=>{
 const C=window.__corpus,S=C.S,base=JSON.parse(JSON.stringify(S.cfg)),R={};
 const flags=['carro','backstay','cunningham','pujamen','contra','escotero','enrollador','tangon'];
 const cfgs=[base];
 flags.forEach(f=>{const c=JSON.parse(JSON.stringify(base));c[f]=!c[f];cfgs.push(c);});
 [0,1,3].forEach(r=>{const c=JSON.parse(JSON.stringify(base));c.rizos=r;cfgs.push(c);});
 const c2=JSON.parse(JSON.stringify(base));c2.rig='frac';cfgs.push(c2);
 const mini={rig:'tope',carro:false,backstay:false,cunningham:false,pujamen:false,contra:false,escotero:false,enrollador:false,tangon:false,rizos:0};cfgs.push(mini);
 const full={rig:'frac',carro:true,backstay:true,cunningham:true,pujamen:true,contra:true,escotero:true,enrollador:true,tangon:true,rizos:3};cfgs.push(full);
 const save={awa:S.awa,tws:S.tws,cfg:S.cfg,loa:S.boat.loa,lang:S.lang,side:S.side};
 for(const lang of ['es','en','fr']){S.lang=lang;const set=new Set();
  const add=parts=>parts.forEach(x=>C.sayUnits(C.sayClean(x.text)).forEach(u=>set.add(u)));
  for(const cfg of cfgs){S.cfg=cfg;
   for(const loa of [6,8,10,12,15,20]){S.boat.loa=loa;
    for(let a=0;a<=180;a+=1) for(let w=0;w<=40;w+=1){S.awa=a;S.tws=w; add(C.trimParts());
      if(a%5===0&&w%2===0) C.PROBLEMS.forEach(pr=>add(C.clParts(pr[0],true)));}
   }}
  R[lang]=[...set];}
 Object.assign(S,{awa:save.awa,tws:save.tws,cfg:save.cfg,lang:save.lang});S.boat.loa=save.loa;
 return R;});
const OUT=require('path').join(__dirname,'..','build');fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(require('path').join(OUT,'voice-corpus.json'),JSON.stringify(out));
for(const l in out){const u=out[l];const tpl={};u.forEach(s=>{const k=s.replace(/\d+(?:[.,]\d+)?/g,'#');(tpl[k]=tpl[k]||[]).push(s);});
 const big=Object.entries(tpl).filter(([k,v])=>v.length>40);
 console.log(l,'units',u.length,'templates',Object.keys(tpl).length,'big',big.map(([k,v])=>v.length+' '+k).slice(0,8));}
console.log('errors',errs);await b.close();})();
