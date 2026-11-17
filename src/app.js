(function(){
const S = {
  cfg:{rig:'tope',carro:true,backstay:false,cunningham:true,pujamen:true,contra:true,escotero:true,enrollador:true,tangon:false,rizos:2},
  awa:30, side:'estribor', tws:15, problem:'orzada', parsed:null, done:{}
};
S.boat={name:'',loa:11,beam:3.7}; S.stw=null;
S.tt={g:{top:{w:1,l:0},mid:{w:0,l:0},bot:{w:0,l:0}},m:{top:1,mid:0,bot:0}};
try{const c=JSON.parse(localStorage.getItem('trim-cfg')||'null'); if(c) Object.assign(S.cfg,c);}catch(e){}
try{const b=JSON.parse(localStorage.getItem('trim-boat')||'null'); if(b) Object.assign(S.boat,b);}catch(e){}
const saveCfg=()=>{try{localStorage.setItem('trim-cfg',JSON.stringify(S.cfg))}catch(e){}};
const saveBoat=()=>{try{localStorage.setItem('trim-boat',JSON.stringify(S.boat))}catch(e){}};

/* ---------- Idioma ---------- */
S.lang='es';
try{const l=localStorage.getItem('trim-lang'); if(['es','en','fr'].includes(l)) S.lang=l; else {const n=(navigator.language||'').slice(0,2); if(n==='en'||n==='fr') S.lang=n;}}catch(e){}
function t(s,v){
  let r;
  if(S.lang==='es') r=s.charAt(0)==='§'?s.slice(1):s;
  else { const e=I18N[s]; r=e?e[S.lang==='en'?0:1]:(s.charAt(0)==='§'?s.slice(1):s); }
  if(v) r=r.replace(/\{(\w+)\}/g,(m,k)=>v[k]!==undefined?v[k]:m);
  return r;
}
const ord=k=>S.lang==='en'?['1st','2nd','3rd'][k-1]||k+'th':S.lang==='fr'?(k===1?'1er':k+'e'):(k===1||k===3?k+'er':k+'º');
const sideName=s=>s==='estribor'?t('estribor'):t('babor');

/* ---------- Tema (Día / Noche / Auto) ---------- */
S.theme='auto'; try{const th=localStorage.getItem('trim-theme'); if(['auto','light','dark'].includes(th)) S.theme=th;}catch(e){}
function applyTheme(){
  const r=document.documentElement; if(S.theme==='auto') r.removeAttribute('data-mode'); else r.setAttribute('data-mode',S.theme);
  document.querySelectorAll('#themes button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===S.theme?'true':'false'));
}
document.querySelectorAll('#themes button').forEach(b=>b.addEventListener('click',()=>{S.theme=b.dataset.v;try{localStorage.setItem('trim-theme',S.theme)}catch(e){}applyTheme();}));
applyTheme();

/* ---------- Polar model (ORC VPP, 73 cruceros sin spi) ---------- */
const PM={"n":73,"exp":0.43,"tws":[4,6,8,10,12,14,16,20,24],"twa":[52,60,75,90,110,120,135,150],"k":[[1.2966,1.7743,2.1389,2.3478,2.4906,2.5776,2.6115,2.6412,2.6223],[1.4191,1.9127,2.2547,2.4487,2.5785,2.6545,2.6914,2.7354,2.7334],[1.5093,2.0276,2.3732,2.5661,2.6819,2.7504,2.8012,2.8803,2.9098],[1.5283,2.039,2.3989,2.614,2.7387,2.8381,2.9189,3.0174,3.087],[1.3957,1.9163,2.3032,2.5665,2.7294,2.8621,2.9741,3.2071,3.3838],[1.3046,1.7983,2.218,2.5048,2.6881,2.8311,2.964,3.2268,3.5159],[1.1168,1.5926,2.0046,2.3388,2.5678,2.7281,2.8624,3.1313,3.4583],[0.9261,1.3464,1.7376,2.0548,2.3205,2.5003,2.6391,2.8532,3.068]],"beatAngle":[45.1,45.1,43.0,41.7,40.6,39.9,39.6,39.7,40.9],"beatVmgK":[0.8138,1.1386,1.3959,1.5771,1.6988,1.783,1.8218,1.8393,1.7982],"runAngle":[144.2,144.2,146.7,147.1,147.5,149.3,173.6,177.3,177.7],"runVmgK":[0.8028,1.1659,1.5044,1.7794,2.0082,2.1723,2.3418,2.6493,2.8671],"loaRange":[8.3,15.4]};
const D2R=Math.PI/180;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function lin(xs,ys,x){if(x<=xs[0])return ys[0];const n=xs.length;if(x>=xs[n-1])return ys[n-1];for(let i=0;i<n-1;i++){if(x<=xs[i+1]){const f=(x-xs[i])/(xs[i+1]-xs[i]);return ys[i]+(ys[i+1]-ys[i])*f;}}return ys[n-1];}
function ptsAt(j){
  const ba=PM.beatAngle[j],pts=[[ba,PM.beatVmgK[j]/Math.cos(ba*D2R)]];
  PM.twa.forEach((a,i)=>{if(a>ba+1)pts.push([a,PM.k[i][j]]);});
  const ra=PM.runAngle[j]; if(ra>151) pts.push([ra,PM.runVmgK[j]/Math.cos((180-ra)*D2R)]);
  if(ra<179) pts.push([180,PM.runVmgK[j]]);
  return pts;
}
function kAt(twa,j){const p=ptsAt(j);if(twa<p[0][0]-0.01)return null;return lin(p.map(x=>x[0]),p.map(x=>x[1]),twa);}
function gridPos(tws){const G=PM.tws,tt=clamp(tws,G[0],G[G.length-1]);let j=0;while(j<G.length-2&&tt>G[j+1])j++;return [j,(tt-G[j])/(G[j+1]-G[j])];}
const beatAng=tws=>lin(PM.tws,PM.beatAngle,tws), runAng=tws=>lin(PM.tws,PM.runAngle,tws);
const LF=()=>Math.pow(S.boat.loa,PM.exp);
function boatSpeed(twa,tws){
  if(tws<=0) return 0;
  const [j,f]=gridPos(tws),ba=beatAng(tws); if(twa<ba-0.01) return null;
  const k1=kAt(Math.max(twa,PM.beatAngle[j]),j),k2=kAt(Math.max(twa,PM.beatAngle[j+1]),j+1);
  return (k1+(k2-k1)*f)*LF();
}
function trueFromApparent(awa,tws){
  if(tws<=0||awa<5) return null;
  const ba=beatAng(tws),vb=boatSpeed(ba,tws);
  const app=twa=>{const V=twa<ba?vb:boatSpeed(twa,tws);const x=tws*Math.cos(twa*D2R)+V,y=tws*Math.sin(twa*D2R);return {awa:Math.atan2(y,x)/D2R,aws:Math.hypot(x,y),V};};
  let lo=awa,hi=180; for(let i=0;i<40;i++){const m=(lo+hi)/2; if(app(m).awa<awa) lo=m; else hi=m;}
  const twa=(lo+hi)/2,r=app(twa); return {twa,aws:r.aws,V:twa<ba?null:r.V,ba};
}
function TA(){if(S.tws<=0)return S.awa;const r=trueFromApparent(S.awa,S.tws);return r?r.twa:S.awa;}
function apparentFromTrue(twa,tws){if(tws<=0)return twa;const V=boatSpeed(Math.max(twa,beatAng(tws)),tws)||0;return Math.atan2(tws*Math.sin(twa*D2R),tws*Math.cos(twa*D2R)+V)/D2R;}

const MAYOR_T=[['carro','Carro de mayor'],['backstay','Tensor en el estay de popa'],['cunningham','Cunningham'],['pujamen','Pujamen ajustable'],['contra','Contra']];
const GEN_T=[['enrollador','Enrollador'],['escotero','Escotero ajustable'],['tangon','Tangón']];
const ZN={proa:'Proa al viento',cenida:'Ceñida',desc:'Descuartelar',traves:'Través',largo:'Largo',popa:'Empopada'};
function zone(a){
  let k;
  const ng=Math.round(apparentFromTrue(beatAng(S.tws),S.tws));
  if(a<ng-2) k='proa'; else if(a<50) k='cenida'; else if(a<75) k='desc'; else if(a<105) k='traves'; else if(a<155) k='largo'; else k='popa';
  const D={
    proa:t('Más cerrado que la ceñida óptima (unos {a}° de aparente con este viento). Las velas flamean y el barco se para: cae.',{a:ng}),
    cenida:t('Lo más cerca del viento que se navega. Velas cazadas y planas; timón fino con los catavientos.'),
    desc:t('Entre la ceñida y el través. Larga un poco las velas: el barco acelera.'),
    traves:t('Viento por el costado. Velas a medio largar y con bolsa. Suele ser el rumbo más rápido.'),
    largo:t('Viento por la aleta. Velas muy largadas; se escora poco y se nota menos viento del que hay.'),
    popa:t('Viento por popa. Mayor abierta hasta casi los obenques; vigila la trasluchada.')};
  return {k,n:t(ZN[k]),d:D[k]};
}
const mode=a=>a<50?'up':(a<130?'reach':'run');
function band(x){ if(x<8) return {k:'light'}; if(x<14) return {k:'med'}; if(x<20) return {k:'fresh'}; return {k:'strong'}; }
const REEF={up:[16,22,28],reach:[18,24,30],run:[20,26,32]};

/* ---------- Config UI ---------- */
function buildToggles(el,list){
  el.innerHTML='';
  list.forEach(([k,n])=>{const b=document.createElement('button');b.type='button';b.className='tg';b.id='tg-'+k;b.textContent=t(n);b.setAttribute('aria-pressed',S.cfg[k]?'true':'false');
    b.onclick=()=>{S.cfg[k]=!S.cfg[k];b.setAttribute('aria-pressed',S.cfg[k]?'true':'false');saveCfg();render();};el.appendChild(b);});
}
function bindSeg(id,get,set){
  const el=$(id); const sync=()=>el.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v)===String(get())?'true':'false'));
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{set(b.dataset.v);sync();render();}); sync(); return sync;
}
buildToggles($('tg-mayor'),MAYOR_T); buildToggles($('tg-genova'),GEN_T);
const syncRig=bindSeg('rig',()=>S.cfg.rig,v=>{S.cfg.rig=v;saveCfg();});
const syncRizos=bindSeg('rizos',()=>S.cfg.rizos,v=>{S.cfg.rizos=+v;saveCfg();});

/* ---------- Dial ---------- */
const NS='http://www.w3.org/2000/svg', CX=150, CY=150, R=118;
const mk=(tg,a,p)=>{const e=document.createElementNS(NS,tg);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e;};
const pt=(th,r)=>[CX+r*Math.sin(th*Math.PI/180), CY-r*Math.cos(th*Math.PI/180)];
function arc(r,a0,a1){const[x0,y0]=pt(a0,r),[x1,y1]=pt(a1,r);return `M${x0},${y0} A${r},${r} 0 ${Math.abs(a1-a0)>180?1:0} 1 ${x1},${y1}`;}
(function(){
  const g=$('d-static');
  mk('circle',{cx:CX,cy:CY,r:134,class:'d-face'},g);
  mk('path',{d:arc(132,4,176),class:'d-stbd'},g);
  mk('path',{d:arc(132,184,356),class:'d-port'},g);
  mk('circle',{cx:CX,cy:CY,r:96,class:'d-ring','stroke-dasharray':'2 4'},g);
  for(let d=0;d<360;d+=10){const maj=d%30===0;const[a,b]=pt(d,130),[c,e]=pt(d,maj?120:125);mk('line',{x1:a,y1:b,x2:c,y2:e,class:'d-tick'+(maj?' maj':'')},g);
    if(maj){const[lx,ly]=pt(d,108);const tx=mk('text',{x:lx,y:ly,class:'d-lbl'},g);tx.textContent=d<=180?d:360-d;}}
  mk('path',{d:'M150,74 C172,98 178,140 175,190 L171,216 L129,216 L125,190 C122,140 128,98 150,74 Z',class:'d-hull'},g);
  mk('rect',{x:136,y:186,width:28,height:24,rx:3,class:'d-cock'},g);
})();
function sailPath(x0,y0,x1,y1,L,bulge){
  const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1; let nx=-dy/len,ny=dx/len; if(nx*L<0){nx=-nx;ny=-ny;}
  const mx=(x0+x1)/2+nx*bulge,my=(y0+y1)/2+ny*bulge; return `M${x0},${y0} Q${mx},${my} ${x1},${y1} Z`;
}
function drawDial(){
  const a=S.awa,L=S.side==='estribor'?-1:1,z=zone(S.awa).k;
  const sg=$('d-sails'); sg.innerHTML='';
  const ng=apparentFromTrue(beatAng(S.tws),S.tws);
  mk('path',{d:`M${CX},${CY} L${pt(-ng,126).join(',')} A126,126 0 0 1 ${pt(ng,126).join(',')} Z`,class:'d-nogo'},sg);
  const mx=150,my=128;
  const luff=z==='proa';
  const b=luff?2:clamp((a-24)*0.55,4,80), br=b*Math.PI/180;
  const bx=mx+L*72*Math.sin(br),by=my+72*Math.cos(br);
  mk('path',{d:sailPath(mx,my,bx,by,L,luff?3:11),class:'d-main'+(luff?' d-luff':'')},sg);
  mk('line',{x1:mx,y1:my,x2:bx,y2:by,class:'d-boom'},sg);
  const tx=150,ty=84; let gL=L,g=clamp((a-22)*0.45+8,6,60),gl=62,gb=12,gcls='d-gen';
  if(z==='popa'){ if(S.cfg.tangon){gL=-L;g=78;} else {g=60;gb=3;gcls+=' d-luff';} }
  if(luff){g=2;gb=3;gcls+=' d-luff';}
  const gr=g*Math.PI/180,gx=tx+gL*gl*Math.sin(gr),gy=ty+gl*Math.cos(gr);
  mk('path',{d:sailPath(tx,ty,gx,gy,gL,gb),class:gcls},sg);
  mk('circle',{cx:mx,cy:my,r:3.5,class:'d-mast'},sg);
  const wg=$('d-windg'); wg.innerHTML='';
  const th=S.side==='estribor'?a:-a; const[wx,wy]=pt(th,R),[ax,ay]=pt(th,R-38),[hx,hy]=pt(th,R-46);
  mk('line',{x1:wx,y1:wy,x2:ax,y2:ay,class:'d-arrow'},wg);
  const ang=Math.atan2(hy-wy,hx-wx),s=8;
  mk('path',{d:`M${hx},${hy} L${hx-s*Math.cos(ang-0.5)},${hy-s*Math.sin(ang-0.5)} L${hx-s*Math.cos(ang+0.5)},${hy-s*Math.sin(ang+0.5)} Z`,class:'d-arrowhead'},wg);
  mk('circle',{cx:wx,cy:wy,r:13,class:'d-wind'},wg); mk('circle',{cx:wx,cy:wy,r:4.5,class:'d-wind-in'},wg);
}
const dial=$('dial'); let drag=false;
function setFromPointer(ev){
  const r=dial.getBoundingClientRect(); const x=(ev.clientX-r.left)/r.width*300-CX, y=(ev.clientY-r.top)/r.height*300-CY;
  if(Math.hypot(x,y)<20) return;
  const th=Math.atan2(x,-y)*180/Math.PI; S.side=th>=0?'estribor':'babor'; S.awa=Math.round(Math.abs(th)); render();
}
dial.addEventListener('pointerdown',e=>{drag=true;dial.setPointerCapture(e.pointerId);setFromPointer(e);});
dial.addEventListener('pointermove',e=>{if(drag)setFromPointer(e);});
dial.addEventListener('pointerup',()=>drag=false); dial.addEventListener('pointercancel',()=>drag=false);
$('awa').addEventListener('input',e=>{S.awa=+e.target.value;render();});
$('tws').addEventListener('input',e=>{S.tws=+e.target.value;render();});

/* ---------- Trim recommendations ---------- */
function trim(){
  const c=S.cfg,z=zone(S.awa).k,bd=band(S.tws).k,hard=bd==='fresh'||bd==='strong',open=['traves','largo','popa'].includes(z),up=z==='cenida';
  const M=[],G=[];
  if(z==='proa'){M.push({c:t('Rumbo'),p:'',v:t('Estás en la zona muerta. Cae hasta que el génova deje de flamear antes de trimar nada.')});return {M,G};}
  const esc={cenida:bd==='light'?'Cazada sin pasarte: deja que la parte alta abra un poco.':hard?'Cazada. En rachas, baja el carro o larga un palmo para no escorar de más.':'Cazada: botavara cerca del eje y el catavientos de baluma alto volando casi siempre.',
    desc:'Un poco largada respecto a la ceñida.',traves:'A medio largar: larga hasta que flamee el grátil y caza un poco.',largo:'Muy largada: larga hasta que flamee el grátil y caza un poco.',popa:'Largada casi hasta los obenques, sin que la vela apoye en ellos.'}[z];
  M.push({c:t('Escota'),p:t('§Baluma'),v:t(esc)});
  if(c.carro){M.push({c:t('Carro'),p:t('§Baluma'),v:t(up?(bd==='light'?'A barlovento: centra la botavara con la escota algo suelta.':hard?'A sotavento: bájalo en cada racha antes de tocar la escota.':'Botavara en el eje.'):'A sotavento del todo.')});}
  else if(up&&hard){M.push({c:t('Carro'),p:t('§Baluma'),v:'',alt:t('Sin carro: para descargar, larga escota y controla la baluma con la contra.')});}
  if(c.contra){M.push({c:t('Contra'),p:t('§Baluma'),v:t(up?(bd==='light'?'Suelta.':hard?(c.carro?'Tensa.':'Tensa: sin carro es la que sujeta la baluma cuando largas escota.'):'Sin holgura, sin tirar.'):z==='popa'?'Tensa moderada: evita que la botavara suba y que el barco balancee.':'Ajustada para que la parte alta no se abra de más. En rachas fuertes, lárgala para soltar presión.')});}
  else M.push({c:t('Contra'),p:t('§Baluma'),v:'',alt:t('Sin contra, la botavara sube al largar escota y la vela se abre arriba. A rumbos abiertos tendrás más escora y balanceo.')});
  if(c.pujamen) M.push({c:t('Pujamen'),p:t('§Pujamen'),v:t(hard?'Cazado a tope: aplana el tercio bajo.':open?'Suelto: más bolsa, más potencia.':bd==='light'?'Algo suelto: bolsa abajo.':'Medio: sin arrugas en el pujamen.')});
  M.push({c:c.cunningham?t('Cunningham'):t('Driza'),p:t('§Grátil'),v:t(hard?'Tenso: lleva la bolsa hacia delante y abre la baluma alta.':'Suelto: unas arrugas leves en el grátil no importan.')});
  if(c.backstay) M.push({c:t('Estay de popa'),p:t('§Bolsa'),v:t(open?(hard?'Tensor algo cazado: sujeta el aparejo.':'Tensor suelto: más bolsa.'):hard?(c.rig==='fraccionado'?'Tensor cazado: curva el mástil, aplana la mayor y abre la baluma alta. De paso tensa el estay de proa y el génova se aplana.':'Tensor cazado: en aparejo a tope casi no toca la mayor; lo que hace es tensar el estay de proa para que no se combe y el génova vaya más plano.'):bd==='light'?'Tensor suelto.':'Tensor un poco cazado: lo justo para que el estay de proa no se combe.')});
  if(z==='popa'){G.push({c:t('Escota'),p:t('§Baluma'),v:t(c.tangon?'Pásalo a orejas con el tangón: a barlovento, opuesto a la mayor.':'Tapado por la mayor. Sin tangón, las orejas son inestables: enróllalo o abre a un largo.')});}
  else G.push({c:t('Escota'),p:t('§Baluma'),v:t(up?'Cazada hasta que la baluma quede a unos centímetros de la cruceta y los catavientos vuelen horizontales.':'Larga hasta que el catavientos de barlovento se levante y caza un poco.')});
  if(c.escotero){G.push({c:t('Escotero'),p:t('§Baluma'),how:'escotero',v:t(open||z==='desc'?'Adelante y, si tienes barber o carril exterior, hacia fuera.':bd==='light'?'Adelante: más bolsa abajo.':hard?'Atrás: abre la baluma alta y descarga arriba.':'Neutro: al orzar, los catavientos alto y bajo flamean a la vez.')});}
  else G.push({c:t('Escotero'),p:t('§Baluma'),v:'',alt:t('Fijo: si la parte alta flamea antes que la baja, no lo puedes corregir; compensa con la escota.')});
  G.push({c:t('Driza'),p:t('§Grátil'),v:t(hard?'Tensa: sin arrugas, la bolsa adelante.':'Algo suelta: arrugas leves en el grátil.')});
  if(c.enrollador&&hard) G.push({c:t('Enrollador'),p:t('§Superficie'),v:t('Reduce por fases. Al enrollar, adelanta el escotero porque el puño sube y avanza.')});
  return {M,G};
}
function reefAdvice(){
  const m=mode(S.awa),Rr=REEF[m],x=S.tws,n=S.cfg.rizos;
  const need=x>=Rr[2]?3:x>=Rr[1]?2:x>=Rr[0]?1:0;
  if(n===0) return need?{h:t('Sin rizos'),d:t('Con {x} kn te tocaría reducir. Tu barco no tiene rizos: reduce génova o arría la mayor.',{x})}:{h:t('Sin rizos'),d:t('De momento no hace falta reducir.')};
  if(!need) return {h:t('Vela entera'),d:t('{o} rizo hacia {k} kn en este rumbo (orientativo). Antes, aplana con los ajustes.',{o:ord(1),k:Rr[0]})};
  const k=Math.min(need,n);
  let d=t('A {x} kn en {z} lo orientativo es llevar {o} rizo.',{x,z:zone(S.awa).n.toLowerCase(),o:ord(k)});
  if(need>n) d+=' '+t('Ya no te quedan rizos: reduce génova.');
  if(m==='run') d+=' '+t('En popa, riza antes de abrir rumbo: para rizar hay que orzar.');
  return {h:t('{o} rizo',{o:ord(k)}),d};
}

/* ---------- Problems & checklists ---------- */
const PROBLEMS=[
  ['orzada','Se me va de orzada'],['sobre','Escoro mucho / sufro'],['potencia','No anda, le falta potencia'],['blando','Cae solo (barco blando)'],
  ['ola','Golpea la ola y se para'],['tt_barlo','Flamea catavientos de barlovento'],['tt_sota','Flamea catavientos de sotavento'],['baluma','Flamea o vibra la baluma']];
const pName=k=>t(PROBLEMS.find(x=>x[0]===k)[1]);
const OVER=['orzada','sobre'];
const has=k=>c=>!!c[k];
function reefSeq(m,p){
  const c=S.cfg,Rr=REEF[m],mainFirst=p==='orzada'||c.rig==='fraccionado'||!c.enrollador;
  const runNote=m==='run'?' '+t('Para rizar tienes que orzar hasta casi ceñida y el viento aparente sube de golpe: hazlo antes de que suba más.'):'';
  const r1={t:t('Toma el {o} rizo de la mayor',{o:ord(1)}),d:t(p==='orzada'?'Se va de orzada porque la mayor empuja la popa hacia sotavento. Reducirla primero devuelve el equilibrio al timón.':c.rig==='fraccionado'?'En aparejo fraccionado la mayor es la vela principal: se riza primero.':'Reduce mayor para bajar escora y timón.')+runNote,need:cc=>cc.rizos>=1,req:'rizos',reef:1};
  const g1={t:t('Enrolla parte del génova'),d:(!mainFirst?t('En aparejo a tope el génova es el motor grande: reducirlo primero baja la escora sin dejar el barco ardiente.')+' ':'')+t('Más o menos un tercio (aprox.). Adelanta el escotero al enrollar.'),need:has('enrollador'),req:'enrollador',reef:1};
  const seq=mainFirst?[[r1,Rr[0]],[g1,Rr[0]+3]]:[[g1,Rr[0]],[r1,Rr[0]+3]];
  seq.push([{t:t('Toma el {o} rizo',{o:ord(2)}),d:t('Si con el primero sigues escorando de más o con mucho timón.'),need:cc=>cc.rizos>=2,req:'2º rizo',reef:1},Rr[1]]);
  seq.push([{t:t('Enrolla más el génova'),d:t('Hasta la mitad o menos (aprox.); un génova muy enrollado pierde forma, por eso va al final.'),need:has('enrollador'),req:'enrollador',reef:1},Rr[1]+3]);
  seq.push([{t:t('Toma el {o} rizo',{o:ord(3)}),d:t('Último escalón de mayor.'),need:cc=>cc.rizos>=3,req:'3er rizo',reef:1},Rr[2]]);
  seq.push([{t:t('Si aún sufres: cambia el plan'),d:t('Abre rumbo, ponte al pairo o vuelve a puerto. Chalecos y líneas de vida puestos.'),need:()=>true,kind:'Seguridad',reef:1},Rr[2]+4]);
  return seq.map(([s,wf])=>Object.assign({wf,kind:'Reducir'},s));
}
function steps(p){
  const m=mode(S.awa),c=S.cfg,fr=c.rig==='fraccionado';
  const T=(ti,d,need,req,kind)=>({t:t(ti),d:t(d),need:need||(()=>true),req,kind:kind||'Ajuste',how:HOW_BY_STEP[ti]});
  if(OVER.includes(p)){
    let a=[];
    if(m==='up') a=[
      T('Ve fino en las rachas','Orza un pelo cuando entra la racha, hasta que flamee el grátil del génova, y vuelve a caer al pasar. Si llevas mucho timón metido todo el rato, el barco te pide reducir.',null,null,'Timón'),
      T('Caza el tensor del estay de popa',fr?'Curva el mástil, aplana la mayor y abre la baluma alta. El estay de proa se tensa como consecuencia y el génova se aplana.':'En aparejo a tope casi no toca la mayor: sirve para que el estay de proa no se combe y el génova vaya más plano.',has('backstay'),'tensor en el estay de popa'),
      T(c.cunningham?'Tensa el cunningham':'Tensa la driza de mayor','Grátil tenso: la bolsa va hacia delante y la baluma alta se abre y suelta presión.'),
      T('Caza el pujamen a tope','Aplana el tercio bajo de la mayor.',has('pujamen'),'pujamen ajustable'),
      c.carro?T('Baja el carro a sotavento','En cada racha, antes de tocar la escota: la botavara se abre sin que se abra la baluma.'):T('Larga escota en las rachas con la contra tensa','Sin carro, la escota es tu válvula. La contra evita que la botavara suba y la vela se embolse.',cc=>cc.contra,'contra'),
      T('Retrasa el escotero del génova','Abre la baluma alta del génova y descarga arriba.',has('escotero'),'escotero ajustable'),
      T('Deja flamear el grátil de la mayor en rachas','Que la parte delantera de la mayor se acueste por el génova es aceptable: sueltas potencia sin perder rumbo.')];
    else if(m==='reach') a=[
      T('Larga la contra en las rachas','Abre la baluma alta y suelta la presión que tumba el barco. Es lo más rápido para evitar una orzada a rumbos abiertos.',has('contra'),'contra'),
      T('Larga escota de mayor en la racha','Aunque flamee. Vuelve a cazar al pasar.'),
      T('Carro a sotavento del todo','Abre la botavara al máximo.',has('carro'),'carro de mayor'),
      T('Cae en las rachas','A rumbos abiertos, aleja la proa del viento cuando entra la racha y vuelve al rumbo al pasar. Anticípate: con el timón a tope ya es tarde.',null,null,'Timón'),
      T('Aplana la mayor',c.backstay?'Grátil y pujamen tensos, y el tensor del estay de popa cazado.':'Grátil y pujamen tensos.'),
      T('Escotero del génova algo atrás','Abre la parte alta del génova.',has('escotero'),'escotero ajustable')];
    else a=[
      T('Pon una retenida en la botavara','Evita una trasluchada involuntaria. Con viento fuerte en popa es lo primero.',null,null,'Seguridad'),
      T('Contra tensa (moderada)','Que la botavara no suba: si la parte alta se abre, el barco balancea.',has('contra'),'contra'),
      T('No largues la mayor contra los obenques','Déjala un poco antes; apoyada se roza y empuja hacia la orzada.'),
      T('Timonea con la ola','Corrige pronto y poco y deja que la popa siga a la ola. Si vas por la aleta, no te pongas justo en popa: riesgo de trasluchar.',null,null,'Timón'),
      T(c.tangon?'Génova a orejas con tangón':'Enrolla el génova','En popa el génova tapado no aporta y da tirones.')];
    return a.concat(reefSeq(m,p));
  }
  if(p==='potencia') return [
    T('Suelta el tensor del estay de popa','Más bolsa en las velas.',has('backstay'),'tensor en el estay de popa'),
    T(c.cunningham?'Suelta el cunningham':'Afloja un poco la driza','Arrugas leves en el grátil están bien con poco viento.'),
    T('Suelta algo el pujamen','Bolsa en la parte baja = potencia.',has('pujamen'),'pujamen ajustable'),
    m==='up'?T('Carro a barlovento, escota algo suelta','Botavara en el eje y la baluma alta un poco abierta: el flujo no se despega.',has('carro'),'carro de mayor'):T('Larga hasta que flamee y caza un poco','A rumbos abiertos se suele ir demasiado cazado.'),
    T('Adelanta el escotero del génova','Más bolsa abajo en el génova.',has('escotero'),'escotero ajustable'),
    T('Abre 5° el rumbo','No vayas tan fino: primero velocidad, luego altura.',null,null,'Timón'),
    T('Quita rizos y desenrolla','Si llevas vela reducida de antes, ya no hace falta.')];
  if(p==='blando') return [
    T('Más mayor',c.carro?'Caza escota y sube el carro a barlovento: la mayor empuja la proa hacia el viento.':'Caza escota: la mayor empuja la proa hacia el viento.'),
    T('Menos génova si va entero y la mayor rizada','Equilibra: un génova grande con la mayor reducida hace que el barco caiga.',has('enrollador'),'enrollador'),
    T('Escora ligera con poco viento','Tripulación a sotavento: con algo de escora el barco coge un poco de timón y lo nota mejor.',null,null,'Peso')];
  if(p==='ola') return [
    T('Abre 5° el rumbo','Con ola no se puede ir tan fino: busca velocidad.',null,null,'Timón'),
    T('Más bolsa',c.backstay?'Pujamen algo suelto y tensor del estay de popa largado: la vela empuja más en la ola.':'Pujamen algo suelto: la vela empuja más en la ola.'),
    T('Adelanta el escotero','Génova con más bolsa abajo.',has('escotero'),'escotero ajustable'),
    T('Abre la baluma (twist)','Escota de mayor un poco suelta: aguanta mejor los cambios de velocidad.'),
    T('Orza en la subida, cae en la bajada','Sube un poco al encarar la ola y cae para coger velocidad al bajarla.',null,null,'Timón')];
  if(p==='tt_barlo') return [
    T('Cae un poco o caza la escota','Flamea el de barlovento: vas demasiado orzado o la vela está demasiado largada.',null,null,'Timón'),
    T('Si el alto rompe antes que el bajo: escotero adelante','El punto de escota está demasiado atrás y la parte alta abre de más.',has('escotero'),'escotero ajustable'),
    T('Si el bajo rompe antes que el alto: escotero atrás','El punto de escota está demasiado adelante.',has('escotero'),'escotero ajustable')];
  if(p==='tt_sota') return [
    T('Orza un poco o larga la escota','Flamea el de sotavento: vas demasiado caído o la vela está demasiado cazada y el flujo se despega.',null,null,'Timón'),
    T('Objetivo: los dos horizontales','Ese es el trimado bueno. En ceñida, el de barlovento puede levantarse a ratos.')];
  if(p==='baluma') return [
    T('Tensa el cabo de baluma','Lo justo para que pare de vibrar. Si te pasas, la baluma hace gancho hacia barlovento y frena.'),
    T('Revisa la escota',c.contra?'Una baluma que flamea en la mayor puede ser escota demasiado suelta o contra floja.':'Una baluma que flamea en la mayor puede ser escota demasiado suelta.'),
    T('Si no para','Vela vieja o estirada: es desgaste, no trimado.',null,null,'Revisión')];
  return [];
}
function statusOf(s,i,list,p){
  if(!OVER.includes(p)||!s.reef) return {c:'',t:''};
  if(S.tws>=s.wf) return {c:'now',t:t('Ya toca')};
  return {c:'later',t:'~'+s.wf+' kn'};
}
const WHY={orzada:'El barco se va de orzada: tiene demasiada potencia arriba y atrás. Primero aplana y descarga, luego reduce.',sobre:'Exceso de potencia. El orden va de lo que no cuesta velocidad a lo que sí: aplanar, descargar y, al final, reducir.',potencia:'Falta potencia: dale bolsa a las velas y abre un poco el rumbo.',blando:'El barco cae solo: el centro vélico está demasiado a proa.',ola:'Con ola el barco necesita potencia para atravesarla, no velas planas.',tt_barlo:'Catavientos de barlovento flameando.',tt_sota:'Catavientos de sotavento flameando.',baluma:'Baluma que vibra o flamea.'};

function renderChecklist(){
  const p=S.problem, ol=$('checklist'); ol.innerHTML='';
  if(!p){$('cl-title').textContent=t('Checklist');$('cl-why').textContent=t('Describe lo que te pasa o elige una opción.');$('cl-prog').textContent='';$('omitted').textContent='';return;}
  const all=steps(p), list=all.filter(s=>s.need(S.cfg)), om=all.filter(s=>!s.need(S.cfg));
  $('cl-title').textContent=pName(p);
  $('cl-why').textContent=t(WHY[p])+(OVER.includes(p)?' '+t('Umbrales para {z} a {x} kn (orientativos).',{z:zone(S.awa).n.toLowerCase(),x:S.tws}):'');
  const firstReef=OVER.includes(p)?list.findIndex(x=>x.reef):-1;
  list.forEach((s,i)=>{
    if(i===firstReef&&i>0){const sep=document.createElement('li');sep.className='cl-sep';sep.textContent=t('Si no basta, reduce vela');ol.appendChild(sep);}
    const id=p+'-'+i, st=statusOf(s,i,list,p), li=document.createElement('li');
    if(s.reef) li.classList.add('reef'); if(S.done[id]) li.classList.add('done');
    li.innerHTML=`<input type="checkbox" id="ck-${id}" ${S.done[id]?'checked':''} aria-label="${t('Hecho')}"><div><div class="st-t"><label for="ck-${id}"><span class="kind">${t(s.kind)}</span>${s.t}</label></div><div class="st-d">${s.d}</div>${s.how?howBtn(s.how):''}</div>${st.t?`<span class="stat ${st.c}">${st.t}</span>`:'<span></span>'}`;
    li.querySelector('input').onchange=e=>{S.done[id]=e.target.checked;li.classList.toggle('done',e.target.checked);prog(list,p);};
    ol.appendChild(li);
  });
  prog(list,p);
  const reqs=[...new Set(om.map(s=>s.req).filter(Boolean))].map(x=>t(x));
  $('omitted').textContent=om.length?t(om.length>1?'{n} pasos omitidos porque tu barco no tiene: {r}.':'{n} paso omitido porque tu barco no tiene: {r}.',{n:om.length,r:reqs.join(', ')}):'';
  $('proc').hidden=!OVER.includes(p)||S.cfg.rizos===0;
}
function prog(list,p){const n=list.filter((s,i)=>S.done[p+'-'+i]).length;$('cl-prog').textContent=t('{n}/{m} hechos',{n,m:list.length});}

/* ---------- Parser (ES / EN / FR) ---------- */
function norm(s){return s.toLowerCase().replace(/œ/g,'oe').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,"'");}
function parse(txt){
  const x=norm(txt), out={};
  const kn=x.match(/(\d{1,2}(?:[.,]\d)?)\s*(nudos?|kn|kts?|knots?|nds?|noeuds?)\b/); if(kn) out.tws=Math.round(parseFloat(kn[1].replace(',','.')));
  const deg=x.match(/(\d{2,3})\s*(°|º|grados|degrees|degres|deg)/);
  if(deg) out.awa=clamp(+deg[1],0,180);
  else if(/cen(i|y)d|cinend|bolina|contra el viento|close.?hauled|beating|upwind|on the wind|au pres|pres serre|remont/.test(x)) out.twa='beat';
  else if(/descuartel|close reach|bon plein/.test(x)) out.twa=62;
  else if(/traves|beam reach|abeam|travers/.test(x)) out.twa=90;
  else if(/\b(un |al )?largo\b|aleta|broad reach|largue/.test(x)) out.twa=130;
  else if(/popa|empopad|dead run|downwind|\brun(ning)?\b|vent arriere|portant/.test(x)) out.twa=170;
  if(/\bbabor\b|\bport tack\b|\bbabord\b/.test(x)) out.side='babor'; else if(/\bestribor\b|\bstarboard\b|\btribord\b/.test(x)) out.side='estribor';
  if(/orzad|ardient|se me (va|sube) (a|hacia) barlovento|se me cruza|round(s|ing)? up|broach|weather helm|lof|\bardent/.test(x)) out.problem='orzada';
  else if(/cae solo|blando|se me va (a|hacia) sotavento|lee helm|falls? off|\bmou\b|abat seul|abat tout seul/.test(x)) out.problem='blando';
  else if(/catavientos.*barlovento|barlovento.*flame|windward tell|windward.*(flutter|lift)|penons? au vent|au vent.*(fasey|leve)/.test(x)) out.problem='tt_barlo';
  else if(/catavientos.*sotavento|sotavento.*flame|leeward tell|leeward.*(flutter|stall)|penons? sous le vent|sous le vent.*(fasey|decroch)/.test(x)) out.problem='tt_sota';
  else if(/baluma.*(flame|vibr|tiembl)|(vibr|tiembl).*baluma|leech.*(flutter|vibrat|flap)|chute.*(fasey|vibr|bat)/.test(x)) out.problem='baluma';
  else if(/golpe|pantoque|\bola\b|cabece|pound|slam|waves|chop|tape|vagues?|clapot/.test(x)) out.problem='ola';
  else if(/no anda|lento|parad|sin potencia|falta.*potencia|no avanza|poco viento|no corre|\bslow|no power|underpowered|not moving|doesn'?t (go|move)|light wind|lacks? power|\blent|n'?avance pas|manque de puissance|petit temps|sous.?toile/.test(x)) out.problem='potencia';
  else if(/sufr|escor|tumb|pasad|sobrepot|demasiad|mucho viento|agua en la banda|asust|balance|overpowered|heel|struggl|suffer|scared|rail|rolling|too much|gite|surtoil|souffr|peur|roulis|trop de/.test(x)) out.problem='sobre';
  return out;
}
function applyParse(txt){
  const r=parse(txt), u=$('understood');
  if(!r.problem&&r.tws==null&&r.awa==null&&r.twa==null){u.className='understood err';u.innerHTML=t('No he reconocido nada. Prueba con el viento en nudos, el rumbo (ceñida, través, largo, popa) y qué notas, o elige una opción abajo.');return;}
  if(r.tws!=null){S.tws=clamp(r.tws,0,40);}
  if(r.awa!=null){S.awa=r.awa;} else if(r.twa!=null){S.awa=r.twa==='beat'?Math.round(apparentFromTrue(beatAng(S.tws)+2,S.tws)):r.twa;}
  if(r.side){S.side=r.side;}
  if(r.problem&&r.problem!==S.problem){S.problem=r.problem;S.done={};}
  S.parsed={tws:r.tws!=null,rumbo:r.awa!=null||r.twa!=null,problem:r.problem||null,src:'text'};
  render();
}
function renderUnderstood(){
  const u=$('understood'), P=S.parsed; if(!P){u.innerHTML='';return;}
  const z=zone(S.awa).n;
  if(P.src==='chip'){u.className='understood';u.innerHTML=`<b>${t('Problema:')}</b> ${pName(S.problem).toLowerCase()} · <b>${t('Rumbo:')}</b> ${z.toLowerCase()} (${t('{a}° aparente',{a:S.awa})}) · <b>${t('Viento:')}</b> ${S.tws} kn`;return;}
  const parts=[];
  parts.push(`<b>${t('Viento:')}</b> ${P.tws?S.tws+' kn':t('el del control ({x} kn)',{x:S.tws})}`);
  parts.push(`<b>${t('Rumbo:')}</b> ${P.rumbo?z+' ('+t('{a}° aparente',{a:S.awa})+')':t('el del dial ({z}, {a}° aparente)',{z:z.toLowerCase(),a:S.awa})}`);
  parts.push(`<b>${t('Problema:')}</b> ${P.problem?pName(P.problem).toLowerCase():t('no reconocido; elige uno abajo')}`);
  u.className='understood'+(P.problem?'':' err'); u.innerHTML=t('Entendido:')+' '+parts.join(', ');
}
$('ask').addEventListener('submit',e=>{e.preventDefault();applyParse($('q').value);});
document.querySelectorAll('.ex').forEach(b=>b.onclick=()=>{$('q').value=b.textContent.trim();applyParse(b.textContent);});
function buildChips(){const el=$('chips');el.innerHTML='';PROBLEMS.forEach(([k,n])=>{const b=document.createElement('button');b.type='button';b.className='chip';b.dataset.k=k;b.textContent=t(n);b.onclick=()=>{if(S.problem!==k){S.problem=k;S.done={};}S.parsed={src:'chip'};render();};el.appendChild(b);});}
buildChips();

/* ---------- Ficha ---------- */
const fmt=(v,d=1)=>v==null||isNaN(v)?'–':(S.lang==='en'?v.toFixed(d):v.toFixed(d).replace('.',','));
const FT=0.3048;
S.unit='m'; try{const u=localStorage.getItem('trim-unit'); if(u==='ft'||u==='m') S.unit=u;}catch(e){}
const toU=m=>S.unit==='ft'?m/FT:m, fromU=v=>S.unit==='ft'?v*FT:v;
const fmtLen=m=>S.unit==='ft'?fmt(m/FT,1)+' ft':fmt(m,2).replace(/[.,]?0+$/,'')+' m';
const num=v=>parseFloat(String(v).replace(',','.'));
function fillFicha(){
  $('b-name').value=S.boat.name||''; $('b-loa').value=+toU(S.boat.loa).toFixed(S.unit==='ft'?1:2); $('b-beam').value=+toU(S.boat.beam).toFixed(S.unit==='ft'?1:2);
  document.querySelectorAll('.u-lbl').forEach(e=>e.textContent=S.unit==='ft'?t('pies'):'m');
}
bindSeg('unit',()=>S.unit,v=>{S.unit=v;try{localStorage.setItem('trim-unit',v)}catch(e){}fillFicha();});
fillFicha();
$('b-name').addEventListener('input',e=>{S.boat.name=e.target.value;saveBoat();render();});
$('b-loa').addEventListener('input',e=>{const m=fromU(num(e.target.value));if(m>=4&&m<=30){S.boat.loa=+m.toFixed(3);saveBoat();render();}});
$('b-beam').addEventListener('input',e=>{const m=fromU(num(e.target.value));if(m>=1&&m<=10){S.boat.beam=+m.toFixed(3);saveBoat();render();}});

/* ---------- Mis barcos (guardados) ---------- */
S.boats=[]; S.activeId=null; S.store='local'; S.loaded=false; S.confirmDel=null; S.saveMsg=null;
try{S.activeId=localStorage.getItem('trim-active')||null;}catch(e){}
let boatsCol=null, boatsUnsub=null, firstLoad=true;
const rec=()=>({name:(S.boat.name||'').trim(),loa:S.boat.loa,beam:S.boat.beam,cfg:Object.assign({},S.cfg)});
const same=(a,b)=>JSON.stringify([a.name||'',+a.loa,+a.beam,a.cfg])===JSON.stringify([b.name||'',+b.loa,+b.beam,b.cfg]);
const activeBoat=()=>S.boats.find(b=>b.id===S.activeId)||null;
function setActive(id){S.activeId=id;try{id?localStorage.setItem('trim-active',id):localStorage.removeItem('trim-active')}catch(e){}}
function loadBoat(b){
  S.boat={name:b.name||'',loa:+b.loa,beam:+b.beam}; Object.assign(S.cfg,{rig:'tope',carro:true,backstay:false,cunningham:true,pujamen:true,contra:true,escotero:true,enrollador:true,tangon:false,rizos:2},b.cfg||{});
  saveBoat(); saveCfg(); fillFicha(); buildToggles($('tg-mayor'),MAYOR_T); buildToggles($('tg-genova'),GEN_T); syncRig(); syncRizos(); S.done={};
}
function localBoats(){try{return JSON.parse(localStorage.getItem('trim-boats')||'[]')}catch(e){return []}}
function writeLocal(){try{localStorage.setItem('trim-boats',JSON.stringify(S.boats));return true}catch(e){return false}}
function boatsArrived(list){
  S.boats=list.sort((a,b)=>(a.name||'').localeCompare(b.name||'')); S.loaded=true;
  if(firstLoad){firstLoad=false;const a=activeBoat(); if(a&&!same(a,rec())) loadBoat(a); else if(!a) setActive(null);}
  else if(S.activeId&&!activeBoat()) setActive(null);
  render();
}
async function saveCurrent(asNew){
  const r=rec(); if(!r.name){S.saveMsg='Ponle nombre al barco para guardarlo';renderBoats();$('b-name').focus();return;}
  r.updated=Date.now(); S.saveMsg=null;
  try{
    if(S.store==='db'){
      if(!asNew&&S.activeId){await boatsCol.doc(S.activeId).set(r);}
      else{const ref=boatsCol.doc(); await ref.set(r); setActive(ref.id);}
    } else {
      if(!asNew&&S.activeId){S.boats=S.boats.map(b=>b.id===S.activeId?Object.assign({id:b.id},r):b);}
      else{const id='b'+Date.now().toString(36); S.boats.push(Object.assign({id},r)); setActive(id);}
      if(!writeLocal()) throw {code:'local'}; boatsArrived(S.boats.slice());
    }
    render();
  }catch(e){
    if(S.store==='db'&&!(e&&e.code==='quota_exceeded')){
      // Sin permiso de escritura en la cuenta (p. ej. enlace público): guardar en este navegador.
      S.store='local'; if(boatsUnsub){try{boatsUnsub()}catch(x){}} S.boats=localBoats(); if(!S.boats.find(b=>b.id===S.activeId)) setActive(null);
      return saveCurrent(asNew);
    }
    S.saveMsg=e&&e.code==='quota_exceeded'?'No hay espacio para más barcos: borra alguno.':'No se ha podido guardar. Inténtalo de nuevo.';renderBoats();}
}
async function deleteBoat(id){
  try{
    if(S.store==='db') await boatsCol.doc(id).delete();
    else{S.boats=S.boats.filter(b=>b.id!==id);writeLocal();boatsArrived(S.boats.slice());}
    if(S.activeId===id) setActive(null); S.confirmDel=null; render();
  }catch(e){S.confirmDel=null;render();}
}
$('save-boat').onclick=()=>saveCurrent(false);
$('save-new').onclick=()=>saveCurrent(true);
$('new-boat').onclick=()=>{setActive(null);loadBoat({name:'',loa:11,beam:3.7,cfg:{}});render();$('b-name').focus();};
$('boat-sel').addEventListener('change',e=>{const id=e.target.value; if(id==='__cur') return; const b=S.boats.find(x=>x.id===id); if(b){setActive(id);loadBoat(b);render();}});
function renderBoats(){
  const a=activeBoat(), dirty=a?!same(a,rec()):true;
  const st=$('save-state');
  if(S.saveMsg){st.className='dirty';st.textContent=t(S.saveMsg);}
  else if(!S.loaded){st.className='';st.textContent=t('Cargando…');}
  else if(a&&!dirty){st.className='';st.textContent=t('Guardado');}
  else if(a){st.className='dirty';st.textContent=t('Cambios sin guardar');}
  else {st.className='dirty';st.textContent=t('Sin guardar');}
  $('save-boat').textContent=a?t('Guardar cambios'):t('Guardar barco'); $('save-new').hidden=!a;
  $('store-note').textContent=S.store==='db'?t('Se guardan en tu cuenta: los verás al abrir esta página en cualquier dispositivo.'):t('Se guardan solo en este navegador. Si borras los datos del navegador, se pierden.');
  const ul=$('boat-list'); ul.innerHTML='';
  if(S.loaded&&!S.boats.length){ul.innerHTML='<li class="empty">'+t('Aún no tienes barcos guardados. Rellena la ficha y pulsa <b>Guardar barco</b>.')+'</li>';}
  if(!S.loaded){ul.innerHTML='<li class="empty" id="boats-loading">'+t('Cargando tus barcos…')+'</li>';}
  S.boats.forEach(b=>{
    const li=document.createElement('li'); li.className='boat'+(b.id===S.activeId?' active':'');
    const c=b.cfg||{}, rz=c.rizos??2;
    li.innerHTML=`<div class="boat-top"><span class="boat-name"></span>${b.id===S.activeId?'<span class="pill">'+t('Activo')+'</span>':''}</div>
      <div class="boat-meta">${t('Eslora')} ${fmtLen(+b.loa)} · ${t('Manga')} ${fmtLen(+b.beam)} · ${c.rig==='tope'?t('A tope'):t('Fraccionado')} · ${t(rz===1?'{n} rizo':'{n} rizos',{n:rz})}${c.enrollador?' · '+t('enrollador'):''}</div>
      <div class="boat-actions"></div>`;
    li.querySelector('.boat-name').textContent=b.name||t('Sin nombre');
    const act=li.querySelector('.boat-actions');
    const mkb=(tx,cls,fn)=>{const x=document.createElement('button');x.type='button';x.className='mini'+(cls?' '+cls:'');x.textContent=tx;x.onclick=fn;act.appendChild(x);return x;};
    if(b.id!==S.activeId) mkb(t('Usar este'),'',()=>{setActive(b.id);loadBoat(b);render();});
    mkb(t('Ir a Trimado'),'',()=>{if(b.id!==S.activeId){setActive(b.id);loadBoat(b);}location.hash='trimado';render();});
    if(S.confirmDel===b.id){mkb(t('Sí, borrar'),'danger',()=>deleteBoat(b.id));mkb(t('Cancelar'),'',()=>{S.confirmDel=null;renderBoats();});}
    else mkb(t('Borrar'),'danger',()=>{S.confirmDel=b.id;renderBoats();});
    ul.appendChild(li);
  });
  const sel=$('boat-sel'); sel.innerHTML='';
  if(!a){const o=document.createElement('option');o.value='__cur';o.textContent=(S.boat.name||t('Sin guardar'))+' · '+fmtLen(S.boat.loa);sel.appendChild(o);}
  S.boats.forEach(b=>{const o=document.createElement('option');o.value=b.id;o.textContent=(b.name||t('Sin nombre'))+(b.id===S.activeId&&dirty?' '+t('(editado)'):'');sel.appendChild(o);});
  sel.value=a?a.id:'__cur';
}
(async function initStore(){
  await Promise.resolve();
  let db=null,uid=null;
  try{ if(window.claude&&window.claude.use){ db=await window.claude.use('db'); const user=await window.claude.use('user'); uid=user?await user.id():null; } }catch(e){db=null;}
  if(db&&uid){
    S.store='db'; boatsCol=db.doc('data/users/'+uid+'/garage').collection('boats');
    const tm=setTimeout(()=>{if(!S.loaded){const el=document.getElementById('boats-loading'); if(el) el.textContent=t('No consigo cargar tus barcos todavía. Puedes seguir usando la ficha; se cargarán cuando haya conexión.');}},10000);
    boatsUnsub=boatsCol.onSnapshot(snap=>{ if(!snap.metadata.fromCache) clearTimeout(tm); if(S.store!=="db") return; boatsArrived(snap.docs.map(d=>Object.assign({id:d.id},d.data()))); },
      ()=>{clearTimeout(tm); if(S.store!=='db') return; S.store='local'; boatsArrived(localBoats());});
  } else { S.store='local'; boatsArrived(localBoats()); }
})();

/* ---------- Secciones ---------- */
const VIEWS=['trimado','problema','barcos'];
function route(){
  const h=(location.hash||'').replace('#',''), v=VIEWS.includes(h)?h:'trimado';
  VIEWS.forEach(x=>{$('v-'+x).hidden=x!==v;});
  document.querySelectorAll('.tablist a').forEach(a=>{if(a.dataset.view===v)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
window.addEventListener('hashchange',()=>{route();window.scrollTo(0,0);});

/* ---------- Situación (sección ¿Qué te pasa?) ---------- */
const RUMBOS=[['beat','cenida'],[62,'desc'],[90,'traves'],[130,'largo'],[170,'popa']];
function buildRumbos(){const el=$('rumbos');el.innerHTML='';RUMBOS.forEach(([v,k])=>{const b=document.createElement('button');b.type='button';b.className='tg';b.dataset.k=k;b.textContent=t(ZN[k]);b.onclick=()=>{S.awa=v==='beat'?Math.round(apparentFromTrue(beatAng(S.tws)+2,S.tws)):v;S.parsed=null;render();};el.appendChild(b);});}
buildRumbos();
$('tws2').addEventListener('input',e=>{S.tws=+e.target.value;S.parsed=null;render();});
function renderCtx(){
  $('tws2').value=S.tws; $('o-tws2').textContent=S.tws+' kn';
  const z=zone(S.awa); document.querySelectorAll('#rumbos .tg').forEach(b=>b.setAttribute('aria-pressed',b.dataset.k===z.k?'true':'false'));
  $('ctx-now').textContent=t('{z} con {a}° de aparente, amura de {s}.',{z:z.n,a:S.awa,s:sideName(S.side)});
  $('ctx-boat').textContent=(S.boat.name||t('Barco sin guardar'))+' · '+fmtLen(S.boat.loa);
}
$('b-stw').addEventListener('input',e=>{const v=num(e.target.value);S.stw=v>0?v:null;render();});
$('perf-go').addEventListener('click',()=>{const k=$('perf-go').dataset.k;if(S.problem!==k){S.problem=k;S.done={};}S.parsed={src:'chip'};render();location.hash='problema';});

/* ---------- Polar ---------- */
function drawPolar(tw){
  const svg=$('polar'); svg.innerHTML=''; const cx=34,cy=168,Rp=150;
  const P=(a,r)=>[cx+r*Math.sin(a*D2R),cy-r*Math.cos(a*D2R)];
  let vmax=0; for(let a=40;a<=180;a+=2){const v=boatSpeed(a,20);if(v)vmax=Math.max(vmax,v);}
  const top=Math.ceil(vmax/2)*2||10, sc=Rp/top;
  for(let s=2;s<=top;s+=2){const[x0,y0]=P(0,s*sc),[x1,y1]=P(180,s*sc);mk('path',{d:`M${x0},${y0} A${s*sc},${s*sc} 0 0 1 ${x1},${y1}`,class:'p-ring'},svg);
    const tx=mk('text',{x:cx-4,y:cy-s*sc+4,class:'p-lbl','text-anchor':'end'},svg);tx.textContent=s;}
  for(let a=0;a<=180;a+=30){const[x,y]=P(a,Rp);mk('line',{x1:cx,y1:cy,x2:x,y2:y,class:'p-ax'},svg);const[lx,ly]=P(a,Rp+12);const tx=mk('text',{x:lx,y:ly+4,class:'p-lbl','text-anchor':a===0||a===180?'middle':'start'},svg);tx.textContent=a+'°';}
  const curve=(tws)=>{const ba=beatAng(tws);let d='';for(let a=Math.ceil(ba);a<=180;a+=2){const v=boatSpeed(a,tws);if(v==null)continue;const[x,y]=P(a,v*sc);d+=(d?'L':'M')+x.toFixed(1)+','+y.toFixed(1);}return d;};
  [[6,.3],[10,.5],[14,.75],[20,1]].forEach(([w,o])=>{mk('path',{d:curve(w),class:'p-curve','stroke-opacity':o},svg);});
  const cur=clamp(S.tws,4,24); mk('path',{d:curve(cur),class:'p-cur'},svg);
  const ba=beatAng(cur),ra=runAng(cur);[ba,ra].forEach(a=>{const[x,y]=P(a,Rp);mk('line',{x1:cx,y1:cy,x2:x,y2:y,class:'p-opt'},svg);});
  if(tw&&tw.V){const[x,y]=P(tw.twa,tw.V*sc);mk('circle',{cx:x,cy:y,r:6,class:'p-dot'},svg);}
}
function renderPolar(){
  const tws=S.tws,awa=S.awa,L=S.boat.loa,[lo,hi]=PM.loaRange;
  const w=$('b-warn'); const msgs=[];
  if(L<lo||L>hi) msgs.push(t('Eslora fuera del rango de datos ({a} a {b}): la polar es una extrapolación.',{a:fmtLen(lo),b:fmtLen(hi)}));
  const bl=S.boat.beam/L; if(bl<0.24||bl>0.42) msgs.push(t('Manga poco habitual para esa eslora: revisa los datos.'));
  w.hidden=!msgs.length; w.textContent=msgs.join(' ');
  $('polar-ctx').textContent=(S.boat.name?S.boat.name+', ':'')+fmtLen(L);
  const ba=beatAng(tws),ra=runAng(tws);
  $('k-beat').textContent=Math.round(ba)+'°'; $('k-beat-s').textContent=t('real, ≈{a}° aparente',{a:Math.round(apparentFromTrue(ba,tws))})+` · ${fmt(boatSpeed(ba,tws))} kn · VMG ${fmt(lin(PM.tws,PM.beatVmgK,tws)*LF())}`;
  $('k-run').textContent=Math.round(ra)+'°'; $('k-run-s').textContent=t('real, ≈{a}° aparente',{a:Math.round(apparentFromTrue(ra,tws))})+` · VMG ${fmt(lin(PM.tws,PM.runVmgK,tws)*LF())} kn`;
  const tw=zone(S.awa).k==='proa'?null:trueFromApparent(awa,tws);
  const perfTxt=$('perf-txt'),meter=$('perf-m'),go=$('perf-go'); go.hidden=true; meter.hidden=true;
  const note=tws<4?t('Por debajo de 4 kn el modelo no tiene datos: se usa la curva de 4 kn.'):tws>24?t('Por encima de 24 kn el modelo no tiene datos: se usa la curva de 24 kn.'):'';
  if(tws<=0){$('k-target').textContent='–';$('k-target-s').textContent=t('sin viento');}
  else if(!tw){$('k-target').textContent='–';$('k-target-s').textContent=t('zona muerta');}
  else if(!tw.V){$('k-target').textContent='–';$('k-target-s').textContent=t('TWA {a}°: más cerrado que la ceñida óptima, cae',{a:Math.round(tw.twa)});}
  else {$('k-target').textContent=fmt(tw.V)+' kn';$('k-target-s').textContent=t('TWA {a}° · aparente {w} kn',{a:Math.round(tw.twa),w:fmt(tw.aws,0)});}
  if(S.stw&&tw&&tw.V){
    const pct=S.stw/tw.V*100; meter.hidden=false; meter.className='meter '+(pct>=95?'':pct>=85?'mid':'low'); $('perf-bar').style.width=clamp(pct/1.2,2,100)+'%';
    let tx=t('Vas al {p} % de la polar estimada ({v} kn).',{p:Math.round(pct),v:fmt(tw.V)})+' ';
    if(pct>105) tx+=t('Por encima: corriente a favor, ola o el modelo infravalora tu barco.');
    else if(pct>=95) tx+=t('En polar: no toques nada.');
    else { const hard=band(tws).k==='fresh'||band(tws).k==='strong';
      tx+=hard?t('Con este viento, ir lento suele ser exceso de escora, no falta de potencia.'):t('Le falta potencia o el trimado no está fino.');
      go.hidden=false; go.dataset.k=hard?'sobre':'potencia'; go.textContent=t('Ver checklist «{p}»',{p:pName(hard?'sobre':'potencia').toLowerCase()}); }
    perfTxt.textContent=tx;
  } else perfTxt.textContent='';
  $('polar-note').textContent=(note?note+' ':'')+t('Velocidades de barco limpio y bien trimado, sin spinnaker. Úsalo para compararte contigo mismo, no como nota absoluta.')+' '+t('Mete la velocidad en el agua (corredera), no la del GPS: la corriente engaña.');
  drawPolar(tw);
}

/* ---------- Lanitas ---------- */
const TT_ROWS=[['top','Alta'],['mid','Media'],['bot','Baja']];
const WAVE='M2,7 C6,1 10,13 14,7 S22,1 26,7 S34,12 37,6', STRAIGHT='M2,7 L37,7';
function ttBtn(bad,okTxt,badTxt,label,onclick){
  const b=document.createElement('button');b.type='button';b.className='tt';b.dataset.s=bad?'bad':'ok';b.setAttribute('aria-pressed',bad?'true':'false');b.setAttribute('aria-label',label+': '+(bad?badTxt:okTxt));
  b.innerHTML=`<svg viewBox="0 0 40 14" aria-hidden="true"><path d="${bad?WAVE:STRAIGHT}"/></svg><span>${bad?badTxt:okTxt}</span>`;b.onclick=onclick;return b;
}
function renderTT(){
  const g=$('tt-g'),m=$('tt-m'); g.innerHTML=`<span></span><span class="tt-h">${t('Barlovento')}</span><span class="tt-h">${t('Sotavento')}</span>`; m.innerHTML=`<span></span><span class="tt-h">${t('Lanita de baluma')}</span>`;
  TT_ROWS.forEach(([k,n])=>{
    const r=document.createElement('span');r.className='tt-r';r.textContent=t(n);g.appendChild(r);
    ['w','l'].forEach(side=>g.appendChild(ttBtn(S.tt.g[k][side],t('Vuela'),t('Flamea'),t('Génova')+' · '+t(n).toLowerCase()+' · '+t(side==='w'?'Barlovento':'Sotavento').toLowerCase(),()=>{S.tt.g[k][side]=S.tt.g[k][side]?0:1;renderTT();})));
    const r2=document.createElement('span');r2.className='tt-r';r2.textContent=t(n);m.appendChild(r2);
    m.appendChild(ttBtn(S.tt.m[k],t('Vuela'),t('Se esconde'),t('Mayor')+' · '+t('Lanita de baluma').toLowerCase()+' · '+t(n).toLowerCase(),()=>{S.tt.m[k]=S.tt.m[k]?0:1;renderTT();}));
  });
  $('tt-out').innerHTML=diagnoseTT();
}
$('tt-reset').onclick=()=>{TT_ROWS.forEach(([k])=>{S.tt.g[k]={w:0,l:0};S.tt.m[k]=0;});renderTT();};
function diagnoseTT(){
  const c=S.cfg,z=zone(S.awa).k,up=z==='cenida'||z==='desc';
  if(z==='proa') return `<p class="subh">${t('Diagnóstico')}</p><p class="hint">${t('Estás en zona muerta: las lanitas no te dicen nada hasta que caigas y las velas dejen de flamear.')}</p>`;
  const G=S.tt.g,M=S.tt.m,gs=[],ms=[];
  if(z==='popa'){gs.push(t('En popa el génova va tapado y sus lanitas no son fiables. Guíate por la mayor y el ángulo.'));}
  else{
    const err=k=>(G[k].l?1:0)-(G[k].w?1:0), turb=TT_ROWS.filter(([k])=>G[k].w&&G[k].l).length;
    const e={top:err('top'),mid:err('mid'),bot:err('bot')}, mean=(e.top+e.mid+e.bot)/3, tw=e.top-e.bot;
    const any=TT_ROWS.some(([k])=>G[k].w||G[k].l);
    if(!any) gs.push(t('<span class="good">Génova: las seis vuelan. Trimado bueno.</span>'));
    else if(turb>=2) gs.push(t('Barlovento y sotavento flamean a la vez: viento muy flojo o sucio (tapado por la mayor u otro barco). Cae un poco para ganar velocidad y dale bolsa.'));
    else{
      if(tw<=-1) gs.push(t(c.escotero?'<b>Adelanta el escotero.</b> La parte alta abre de más (rompe arriba antes que abajo). Muévelo hasta que, al orzar, las tres de barlovento rompan a la vez.':'<b>La parte alta abre de más.</b> Sin escotero ajustable, caza un pelo de escota y acepta que la baja vaya algo cazada.'));
      if(tw>=1) gs.push(t(c.escotero?'<b>Retrasa el escotero.</b> La parte alta va cerrada respecto a la baja. Muévelo hasta que las tres rompan a la vez.':'<b>La parte alta va cerrada.</b> Sin escotero ajustable, larga un pelo de escota.'));
      if(mean<-0.2) gs.push(t(up?'<b>Cae un poco o caza la escota del génova.</b> Flamea barlovento: vas demasiado orzado o la vela demasiado largada.':'<b>Caza la escota del génova.</b> A rumbos abiertos, primero vela y luego timón.'));
      if(mean>0.2) gs.push(t(up?'<b>Orza un poco o larga la escota.</b> Flamea sotavento: el flujo se despega, vas caído o sobrecazado.':'<b>Larga la escota del génova</b> hasta que la de barlovento se levante y caza un poco.'));
      if(!gs.length) gs.push(t('Las lanitas se compensan entre alturas: retoca el escotero hasta que las tres rompan a la vez al orzar.'));
    }
  }
  const h={top:!!M.top,mid:!!M.mid,bot:!!M.bot}, nh=h.top+h.mid+h.bot;
  if(z==='popa') ms.push(t('En popa las lanitas de baluma casi siempre se esconden: no son fiables.'));
  else if(nh===0) ms.push(t(up?'<span class="good">Mayor: la baluma descarga.</span> En ceñida, si la alta vuela siempre, puedes cazar un pelo más: lo ideal es que se esconda a ratos.':'<span class="good">Mayor: la baluma descarga bien.</span>'));
  else if(nh===3) ms.push(t(up&&c.carro?'<b>Mayor sobrecazada.</b> Larga escota hasta que vuelvan a salir y sube el carro a barlovento para mantener la botavara en el eje.':'<b>Mayor sobrecazada.</b> Larga escota hasta que vuelvan a salir.'));
  else if(h.top&&!h.bot){
    if(up){
      let s=t(h.mid?'<b>Baluma alta y media cerradas.</b>':'<b>Baluma alta cerrada.</b>')+' '+t(c.carro?'Larga un poco de escota y sube el carro a barlovento.':'Larga un poco de escota.');
      if(c.backstay&&c.rig==='fraccionado') s+=' '+t('Con viento, cazar el tensor del estay de popa también la abre.');
      ms.push(s);
    } else ms.push(t('<b>Baluma alta cerrada.</b>')+' '+t(c.contra?'Afloja la contra para que la parte alta abra.':'Larga un poco de escota.'));
  }
  else if(h.bot&&!h.top) ms.push(t('<b>Parte baja ahogada.</b>')+' '+t(c.pujamen?'Caza el pujamen para aplanar abajo.':'Larga un pelo de escota.'));
  else ms.push(t('<b>Revisa la escota de mayor:</b> larga un pelo y mira si salen.'));
  const Lh=a=>a.map(x=>`<li>${x}</li>`).join('');
  return `<p class="subh">${t('Qué hacer')}</p><div><p class="tt-h" style="margin:0 0 4px">${t('Génova')}</p><ol>${Lh(gs)}</ol></div><div><p class="tt-h" style="margin:0 0 4px">${t('Mayor')}</p><ol>${Lh(ms)}</ol></div>`;
}

/* ---------- Textos estáticos ---------- */
const STATIC=[];
(function collect(){
  const skip=new Set(['SCRIPT','STYLE','SVG','svg']);
  const dyn=new Set(['r-ang','r-zone','r-amura','r-zdesc','o-awa','o-tws','o-tws2','polar-ctx','trim-ctx','ctx-boat','ctx-now','save-state','store-note','boat-list','boat-sel','checklist','understood','chips','tt-g','tt-m','tt-out','reefbox','t-mayor','t-genova','k-target','k-target-s','k-beat','k-beat-s','k-run','k-run-s','perf-txt','polar-note','cl-title','cl-why','cl-prog','omitted','b-warn','tg-mayor','tg-genova','rumbos','save-boat','perf-go','langs','how']);
  function walk(el){
    if(el.tagName==='svg'){const v=el.getAttribute('aria-label'); if(v) STATIC.push({el,attr:'aria-label',key:v}); return;}
    if(skip.has(el.tagName)||dyn.has(el.id)) return;
    if(el.hasAttribute&&el.hasAttribute('data-i')){STATIC.push({el,key:el.innerHTML.replace(/\s+/g,' ').trim(),html:true});return;}
    ['placeholder','aria-label'].forEach(a=>{const v=el.getAttribute&&el.getAttribute(a); if(v) STATIC.push({el,attr:a,key:v});});
    el.childNodes.forEach(n=>{
      if(n.nodeType===3){const k=n.nodeValue.replace(/\s+/g,' ').trim(); if(k&&/[A-Za-zÁÉÍÓÚáéíóúñ¿]/.test(k)) STATIC.push({node:n,key:k,pre:n.nodeValue.match(/^\s*/)[0],post:n.nodeValue.match(/\s*$/)[0]});}
      else if(n.nodeType===1) walk(n);
    });
  }
  walk(document.querySelector('.wrap'));
})();
const EXAMPLES=['Con viento de 15 nudos me voy de orzada y estoy sufriendo'];
function applyStatic(){
  STATIC.forEach(s=>{
    if(s.node) s.node.nodeValue=s.pre+t(s.key)+s.post;
    else if(s.attr) s.el.setAttribute(s.attr,t(s.key));
    else if(s.html) s.el.innerHTML=t(s.key);
  });
  const q=$('q'); if(!q.value.trim()||S.qDefault===q.value){q.value=t(EXAMPLES[0]);S.qDefault=q.value;}
  [['boat-sel','Barco activo'],['chips','O elige el problema'],['langs','Idioma']].forEach(([id,k])=>$(id).setAttribute('aria-label',t(k)));
  document.documentElement.lang=S.lang;
  document.querySelectorAll('#langs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===S.lang?'true':'false'));
}
S.qDefault=$('q').value;
document.querySelectorAll('#langs button').forEach(b=>b.onclick=()=>{
  S.lang=b.dataset.v; try{localStorage.setItem('trim-lang',S.lang)}catch(e){}
  applyStatic(); buildToggles($('tg-mayor'),MAYOR_T); buildToggles($('tg-genova'),GEN_T); buildChips(); buildRumbos(); fillFicha(); render();
  if(howState){const k=howState.k;closeHow();openHow(k);}
});


/* ---------- Cómo se hace ---------- */
const HOW_BY_STEP={'Retrasa el escotero del génova':'escotero','Adelanta el escotero del génova':'escotero','Escotero del génova algo atrás':'escotero','Adelanta el escotero':'escotero',
  'Si el alto rompe antes que el bajo: escotero adelante':'escotero','Si el bajo rompe antes que el alto: escotero atrás':'escotero'};
function howBtn(k){return `<button type="button" class="howbtn" data-how="${k}"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M6.6 5.6 10.6 8l-4 2.4z" fill="currentColor" stroke="none"/></svg>${t('Cómo se hace')}</button>`;}
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const HOW={
  escotero:{
    title:'Mover el escotero del génova',
    states:['Adelante','Atrás'],
    cap:p=>p<.5?'Adelante: la escota tira más hacia abajo. Baluma cerrada y más bolsa abajo. Para poco viento o con mar.':'Atrás: la escota tira más hacia atrás. Pujamen plano y la parte alta abierta, que descarga arriba. Para viento fuerte.',
    steps:['Orza despacio mirando las lanitas de barlovento del génova.','Si la alta rompe antes que la baja, el escotero va adelante. Si la baja rompe antes, va atrás.',
      'Larga un poco de escota para quitar carga, mueve el carro uno o dos agujeros (o con su cabo de control) y vuelve a cazar.','Repite hasta que las tres lanitas rompan a la vez.'],
    note:'No muevas el carro con la escota cargada: el pasador se atasca y te puedes pillar los dedos.',
    draw(svg,p){
      svg.innerHTML='';
      const g=(tag,at,txt)=>{const e=mk(tag,at,svg);if(txt!=null)e.textContent=txt;return e;};
      // casco y cubierta (vista lateral, proa a la derecha)
      g('path',{d:'M16 204 Q180 212 344 196 L332 220 Q180 230 30 222 Z',class:'hw-hull'});
      g('line',{x1:92,y1:206,x2:92,y2:18,class:'hw-mast'});
      g('line',{x1:94,y1:22,x2:338,y2:197,class:'hw-stay'});
      // vela (génova sin solape para que se lea claro)
      const T=[322,186], H=[112,36], C=[132-6*p,176+3*p];
      const lm=[(H[0]+C[0])/2,(H[1]+C[1])/2], lk=-5+11*p;     // baluma: recta/cerrada -> abierta
      const lc=[lm[0]-lk,lm[1]];
      const fm=[(T[0]+C[0])/2,(T[1]+C[1])/2], fd=14-10*p;      // pujamen: con bolsa -> plano
      g('path',{d:`M${T} L${H} Q${lc} ${C} Q${fm[0]},${fm[1]+fd} ${T} Z`,class:'hw-sail'});
      g('path',{d:`M${H} Q${lc} ${C}`,class:'hw-leech'});
      g('path',{d:`M${C} Q${fm[0]},${fm[1]+fd} ${T}`,class:'hw-foot'});
      // carril, carro y escota
      const tx0=108,tx1=168,ty=203, cx=168-(168-108)*p;
      g('line',{x1:tx0,y1:ty,x2:tx1,y2:ty,class:'hw-track'});
      for(let x=tx0;x<=tx1;x+=10) g('circle',{cx:x,cy:ty,r:1.4,class:'hw-hole'});
      g('line',{x1:C[0],y1:C[1],x2:cx,y2:ty-4,class:'hw-sheet'});
      g('rect',{x:cx-8,y:ty-6,width:16,height:8,rx:2,class:'hw-car'});
      g('circle',{cx:C[0],cy:C[1],r:3.2,class:'hw-clew'});
      // etiquetas
      g('text',{x:(tx0+tx1)/2,y:ty+16,class:'hw-lbl','text-anchor':'middle'},t('Escotero'));
      g('text',{x:C[0]+8,y:C[1]-8,class:'hw-lbl'},t('Puño'));
      g('text',{x:lc[0]+lk*.5+8,y:lm[1]-30,class:'hw-lbl'},t('Baluma'));
      g('text',{x:fm[0]+24,y:fm[1]+fd-12,class:'hw-lbl','text-anchor':'middle'},t('Pujamen'));
      // recuadro: secciones vistas desde arriba
      const bx=214,by=10,bw=136,bh=104;
      g('rect',{x:bx,y:by,width:bw,height:bh,rx:4,class:'hw-box'});
      g('text',{x:bx+8,y:by+15,class:'hw-lbl'},t('Desde arriba'));
      g('text',{x:bx+8,y:by+28,class:'hw-lbl small'},t('Giro alto-bajo (exagerado)'));
      const L=[bx+12,by+48], len=82, tw=3+16*p;
      g('line',{x1:L[0]-4,y1:L[1],x2:bx+bw-6,y2:L[1],class:'hw-axis'});
      [[0,'hw-sec low',t('baja')],[tw/2,'hw-sec mid',''],[tw,'hw-sec top',t('alta')]].forEach(([ang,cls,lab],k)=>{
        const a0=(6+ang)*D2R, ex=L[0]+len*Math.cos(a0), ey=L[1]+len*Math.sin(a0);
        const mxp=(L[0]+ex)/2-9*Math.sin(a0), myp=(L[1]+ey)/2+9*Math.cos(a0);
        g('path',{d:`M${L} Q${mxp},${myp} ${ex},${ey}`,class:cls});
        if(lab) g('text',{x:ex+4,y:ey+(k===0?-2:9),class:'hw-lbl small'},lab);
      });
    }
  }
};
let howState=null;
function openHow(k){
  const H=HOW[k]; if(!H) return;
  const box=$('how'); box.hidden=false; document.body.classList.add('how-open');
  $('how-title').textContent=t(H.title);
  $('how-steps').innerHTML=H.steps.map(s=>`<li>${t(s)}</li>`).join('');
  $('how-note').textContent=t(H.note);
  $('how-a').textContent=t(H.states[0]); $('how-b').textContent=t(H.states[1]);
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  howState={k,p:0,target:null,play:!reduce,t0:performance.now(),raf:0,opener:document.activeElement};
  howFrame(); $('how-close').focus();
}
function howSet(p){const s=howState;if(!s)return;s.p=p;const H=HOW[s.k];H.draw($('how-svg'),s.p);$('how-cap').textContent=t(H.cap(s.p));
  $('how-a').setAttribute('aria-pressed',s.p<.5?'true':'false');$('how-b').setAttribute('aria-pressed',s.p>=.5?'true':'false');
  $('how-play').setAttribute('aria-pressed',s.play?'true':'false');$('how-play').setAttribute('aria-label',t(s.play?'Pausa':'Reproducir'));}
function howFrame(now){
  const s=howState; if(!s) return;
  if(s.play){const per=5200,x=((now||performance.now())-s.t0)%per/per; // 0..1: ida, pausa, vuelta, pausa
    const ph=x<.3?ease(x/.3):x<.5?1:x<.8?1-ease((x-.5)/.3):0; howSet(ph);}
  else if(s.target!=null){const d=s.target-s.p; if(Math.abs(d)<.01){howSet(s.target);s.target=null;} else howSet(s.p+d*.14);}
  else howSet(s.p);
  if(s.play||s.target!=null) s.raf=requestAnimationFrame(howFrame);
}
function closeHow(){const s=howState; if(s){cancelAnimationFrame(s.raf);} $('how').hidden=true; document.body.classList.remove('how-open'); const o=s&&s.opener; howState=null; if(o&&o.focus) o.focus();}
$('how-close').onclick=closeHow;
$('how').addEventListener('click',e=>{if(e.target===$('how'))closeHow();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&howState)closeHow();});
$('how-a').onclick=()=>{const s=howState;cancelAnimationFrame(s.raf);s.play=false;s.target=0;howFrame();};
$('how-b').onclick=()=>{const s=howState;cancelAnimationFrame(s.raf);s.play=false;s.target=1;howFrame();};
$('how-play').onclick=()=>{const s=howState;cancelAnimationFrame(s.raf);s.play=!s.play;s.target=null;s.t0=performance.now()-(s.p>=.5?5200*.3:0);howFrame();};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.howbtn'); if(b){e.preventDefault();openHow(b.dataset.how);}});

/* ---------- Render ---------- */
function li(r){return `<li><span class="ctl">${r.c}${r.p?`<span class="part">${r.p}</span>`:''}</span><span class="val">${r.v}${r.alt?`<span class="alt">${r.alt}</span>`:''}${r.how?howBtn(r.how):''}</span></li>`;}
function render(){
  const z=zone(S.awa);
  $('awa').value=S.awa; $('o-awa').textContent=S.awa+'°'; $('tws').value=S.tws; $('o-tws').textContent=S.tws+' kn';
  $('r-ang').textContent=S.awa+'°'; $('r-zone').textContent=z.n; $('r-zdesc').textContent=t('Ángulo real ≈ {a}°.',{a:Math.round(TA())})+' '+z.d;
  const am=$('r-amura'); am.className='amura '+S.side; am.textContent=t(S.side==='estribor'?'Amura de estribor':'Amura de babor');
  drawDial();
  const tr=trim(); $('t-mayor').innerHTML=tr.M.map(li).join(''); $('t-genova').innerHTML=tr.G.map(li).join('');
  $('trim-ctx').textContent='';
  const ra=reefAdvice(); $('reefbox').innerHTML=`<strong>${ra.h}</strong><span>${ra.d}</span>`;
  document.querySelectorAll('#chips .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.k===S.problem?'true':'false'));
  renderUnderstood();
  renderChecklist();
  renderPolar();
  renderTT();
  renderCtx();
  renderBoats();
}
route();
if(S.lang!=='es'){applyStatic(); buildToggles($('tg-mayor'),MAYOR_T); buildToggles($('tg-genova'),GEN_T); buildChips(); buildRumbos(); fillFicha();}
else applyStatic();
applyParse($('q').value);
})();
