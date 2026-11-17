/* ================= Cómo se hace: escenas ilustradas y temas =================
   Estilo pactado: ilustración plana a color (B) en viñetas paso a paso (D).
   Cada tema: 3-4 viñetas {t: texto, s: estado de escena}, fx opcional (dos columnas), note opcional.
   Textos: cadena (se traduce con t()) u objeto {es,en,fr}. */
const L=x=>x==null?'':(typeof x==='string'?t(x):(x[S.lang]||x.es));
function howBtn(k){return `<button type="button" class="howbtn" data-how="${k}"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M6.6 5.6 10.6 8l-4 2.4z" fill="currentColor" stroke="none"/></svg>${t('Cómo se hace')}</button>`;}

/* ---------- utilidades de dibujo ---------- */
function M_(svg){return (tag,at,txt)=>{const e=mk(tag,at,svg);if(txt!=null)e.textContent=txt;return e;};}
function ilSea(m){
  m('rect',{x:0,y:0,width:360,height:240,class:'il-sky'});
  m('path',{d:'M0 214 Q45 206 90 214 T180 214 T270 214 T360 214 V240 H0 Z',class:'il-sea'});
  m('path',{d:'M0 226 Q45 220 90 226 T180 226 T270 226 T360 226 V240 H0 Z',class:'il-sea2'});
}
function ilHullSide(m){
  m('path',{d:'M14 198 Q180 206 346 190 L334 216 Q180 226 30 218 Z',class:'il-hull'});
  m('path',{d:'M24 210 Q180 218 338 204 L336 208 Q180 222 26 214 Z',class:'il-stripe'});
  m('path',{d:'M20 198 Q180 206 344 190 L344 193 Q180 209 20 201 Z',class:'il-deck'});
}
function ilPill(m,txt,tg,pos){
  const label=L(txt), w=label.length*8.4+22; pos=[Math.max(w/2+4,Math.min(356-w/2,pos[0])),Math.max(18,Math.min(222,pos[1]))];
  if(tg) m('line',{x1:tg[0],y1:tg[1],x2:pos[0],y2:pos[1],class:'il-lead'});
  m('rect',{x:pos[0]-w/2,y:pos[1]-14,width:w,height:28,rx:14,class:'il-pill'});
  m('text',{x:pos[0],y:pos[1]+6,'text-anchor':'middle',class:'il-pt'},label);
}
function ilHalo(m,c,r){m('circle',{cx:c[0],cy:c[1],r:r||18,class:'il-halo'});}
function ilArrow(m,x,y,ang,len){ // flecha gruesa naranja; ang en grados (0 = derecha, 90 = abajo)
  const a=ang*D2R, ux=Math.cos(a), uy=Math.sin(a), nx=-uy, ny=ux, w=4, hw=9, hl=14, L2=len-hl;
  const P=(s,n)=>[x+ux*s+nx*n, y+uy*s+ny*n].map(v=>v.toFixed(1)).join(',');
  m('path',{d:`M${P(0,-w)} L${P(L2,-w)} L${P(L2,-hw)} L${P(len,0)} L${P(L2,hw)} L${P(L2,w)} L${P(0,w)} Z`,class:'il-big'});
}
function ilCurveArrow(m,cx,cy,r,a0,a1){ // arco con punta, ángulos en grados (0 = arriba, sentido horario)
  const P=a=>[cx+r*Math.sin(a*D2R),cy-r*Math.cos(a*D2R)], s=P(a0), e=P(a1), sw=Math.abs(a1-a0)>180?1:0, cw=a1>a0?1:0;
  m('path',{d:`M${s} A${r},${r} 0 ${sw} ${cw} ${e}`,class:'il-arc'});
  const d=a1>a0?1:-1, tg=[Math.cos(a1*D2R)*d,Math.sin(a1*D2R)*d], n=[-tg[1],tg[0]];
  m('path',{d:`M${e[0]+tg[0]*11},${e[1]+tg[1]*11} L${e[0]+n[0]*7},${e[1]+n[1]*7} L${e[0]-n[0]*7},${e[1]-n[1]*7} Z`,class:'il-big'});
}
function ilCheck(m,x,y){m('path',{d:`M${x} ${y} l14 14 l28 -30`,class:'il-check'});}
function ilFlutter(m,a,b,amp,cls){ // línea ondulada de a a b
  const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,nx=-uy,ny=ux,n=Math.max(3,Math.round(len/9));let d=`M${a}`;
  for(let i=1;i<=n;i++){const f=i/n,o=(i%2?1:-1)*amp;d+=` L${(a[0]+dx*f+nx*o).toFixed(1)},${(a[1]+dy*f+ny*o).toFixed(1)}`;}
  m('path',{d,class:cls||'il-flutter'});
}

/* ---------- escena: génova de lado (proa a la derecha) ---------- */
function drawGenoa(svg,s){
  svg.innerHTML=''; const m=M_(svg); const p=s.p||0, furl=s.furl||0;
  const T=[322,186],H=[112,36]; let C=[132-6*p,176+3*p];
  if(furl){const q=[T[0]+(H[0]-T[0])*.32,T[1]+(H[1]-T[1])*.32]; C=[C[0]+(q[0]-C[0])*furl*.62,C[1]+(q[1]-C[1])*furl*.62];}
  const lm=[(H[0]+C[0])/2,(H[1]+C[1])/2], lk=-5+11*p, lc=[lm[0]-lk,lm[1]];
  const fm=[(T[0]+C[0])/2,(T[1]+C[1])/2], fd=(14-10*p)*(1-furl*.5);
  const tx0=106,tx1=170,ty=197, car=s.car!=null?s.car:p, cx=170-64*car;
  ilSea(m); ilHullSide(m);
  m('line',{x1:92,y1:200,x2:92,y2:14,class:'il-mast'});
  m('line',{x1:94,y1:18,x2:340,y2:191,class:'il-stay'});
  m('path',{d:`M${T} L${H} Q${lc} ${C} Q${fm[0]},${fm[1]+fd} ${T} Z`,class:'il-sail'});
  [.3,.55,.78].forEach(f=>{const a=[C[0]+(H[0]-C[0])*f,C[1]+(H[1]-C[1])*f],b=[T[0]+(H[0]-T[0])*f,T[1]+(H[1]-T[1])*f];
    m('path',{d:`M${a} Q${(a[0]+b[0])/2},${(a[1]+b[1])/2+6} ${b}`,class:'il-seam'});});
  if(furl) m('line',{x1:T[0],y1:T[1],x2:H[0],y2:H[1],class:'il-roll',style:`stroke-width:${3+furl*7}`});
  m('circle',{cx:T[0],cy:T[1]+2,r:6,class:'il-drum'});
  if(s.wr==='loose'){[.2,.32,.44,.56,.68,.8].forEach(f=>{const x=T[0]+(H[0]-T[0])*f,y=T[1]+(H[1]-T[1])*f;m('path',{d:`M${x-4},${y+3} l-14,6`,class:'il-wrinkle'});});}
  if(s.wr==='tight'){const a=[T[0]+(H[0]-T[0])*.12-12,T[1]+(H[1]-T[1])*.12+4],b=[T[0]+(H[0]-T[0])*.88-12,T[1]+(H[1]-T[1])*.88+4];m('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'il-wrinkle'});}
  const tts=s.tt||(furl?null:['ok','ok','ok']), ttp=[];
  if(tts)[.28,.5,.72].forEach((f,i)=>{const x=T[0]+(H[0]-T[0])*f-10,y=T[1]+(H[1]-T[1])*f+3,bad=tts[i]==='bad';ttp.push([x,y]);
    m('circle',{cx:x,cy:y,r:2,class:'il-pin'});
    m('path',{d:bad?`M${x},${y} c-4,-8 -9,5 -13,-4 s-6,-7 -10,1`:`M${x},${y} l-24,0`,class:bad?'il-tt-bad':'il-tt-ok'});});
  m('line',{x1:tx0,y1:ty,x2:tx1,y2:ty,class:'il-track'});
  const cy=ty-5;
  m('path',{d:s.slack?`M${C} Q${(C[0]+cx)/2+10},${cy+16} ${cx},${cy}`:`M${C} L${cx},${cy}`,class:'il-rope'});
  if(s.from!=null){const fx=170-64*s.from; m('rect',{x:fx-10,y:cy-6,width:20,height:11,rx:3,class:'il-car',opacity:.25});}
  m('rect',{x:cx-10,y:cy-6,width:20,height:11,rx:3,class:'il-car'});
  m('circle',{cx:C[0],cy:C[1],r:4.5,class:'il-car'});
  if(s.arrow){const ax=(tx0+tx1)/2; ilArrow(m,ax-s.arrow*28,ty+29,s.arrow>0?0:180,58);}
  if(s.headArrow) ilArrow(m,H[0]+40,H[1]+52,-37,46);
  if(s.furlArrow) ilArrow(m,T[0]-8,T[1]+28,180,44);
  const tgt={tt:ttp[2]?[ttp[2][0]-10,ttp[2][1]]:H,sheet:[(C[0]+cx)/2+(s.slack?6:0),(C[1]+cy)/2+(s.slack?8:0)],car:[cx,cy],luff:[T[0]+(H[0]-T[0])*.5-8,T[1]+(H[1]-T[1])*.5+4],head:[H[0]+6,H[1]+6],drum:[T[0],T[1]+2],clew:C};
  if(s.halo) ilHalo(m,tgt[s.halo],s.halo==='tt'?20:18);
  if(s.pill) ilPill(m,s.pill[0],tgt[s.pill[1]],s.pill[2]||(s.pill[1]==='tt'||s.pill[1]==='luff'||s.pill[1]==='head'?[262,44]:[60,120]));
  if(s.check) ilCheck(m,262,48);
}

/* ---------- escena: mayor de lado (proa a la derecha) ---------- */
function drawMain(svg,s){
  svg.innerHTML=''; const m=M_(svg);
  const X=214, G=[X,150], top=14, bend=s.bend||0, reef=s.reef||0;
  const boomY=s.boom!=null?s.boom:150, B=[78,boomY+2], drop=reef===1?30:reef===2?30:0;
  const outh=s.out!=null?s.out:.5, C=[84+18*(1-outh),boomY-2-(reef===1?30:0)];
  const Hd=[X+bend*.15,22+drop], lk=s.lk!=null?s.lk:0;
  const mastP=`M${X},198 Q${X+bend*2},105 ${X},${top}`;
  ilSea(m);
  // estays
  const fs=s.frac?[X+bend*.5,44]:[X,16];
  if(s.forestay!==false){const sag=s.fsag||0; m('path',{d:`M${fs} Q${(fs[0]+340)/2+sag*.4},${(fs[1]+191)/2+sag} 340,191`,class:'il-stay'});}
  if(s.backstay){const sl=s.bsag||0; m('path',{d:`M${X},${top} Q${(X+24)/2-sl*.4},${(top+196)/2+sl} 24,196`,class:'il-stay',style:s.bstay?'stroke-width:2;opacity:1':''});
    m('rect',{x:30,y:178,width:9,height:14,rx:2,class:'il-car'});}
  ilHullSide(m);
  m('path',{d:mastP,class:'il-mast',fill:'none'});
  // vela
  const seamY=f=>G[1]-(G[1]-Hd[1])*f;
  const lm=[(Hd[0]+C[0])/2,(Hd[1]+C[1])/2], lc=[lm[0]+lk,lm[1]];
  const luffCtl=[X+bend*1.1,(G[1]-drop+Hd[1])/2];
  const tack=[X,G[1]-(reef===1?0:0)];
  m('path',{d:`M${tack} Q${luffCtl} ${Hd} Q${lc} ${C} L${tack[0]},${C[1]} Z`,class:'il-sail'});
  const fd=s.fd!=null?s.fd:8;
  [.25,.5,.75].forEach(f=>{const y=seamY(f), xl=X+bend*(1-Math.abs(.5-f)*1.2)*.9, xr=C[0]+(Hd[0]-C[0])*f+lk*(1-Math.abs(.5-f)*2)*.9;
    m('path',{d:`M${xl},${y} Q${(xl+xr)/2},${y+fd*(1-f*.4)} ${xr},${y-((Hd[1]-C[1])*0)}`,class:'il-seam'});});
  if(reef===0&&s.reefmarks){for(let i=0;i<4;i++){const x=X-20-i*28,y=boomY-34;m('circle',{cx:x,cy:y,r:1.6,class:'il-pin'});}}
  if(reef===1){ // vela bajada con la garra enganchada y el paño suelto colgando
    m('path',{d:`M${X},${boomY-2} Q${(X+C[0])/2},${boomY+18} ${C[0]},${C[1]}`,class:'il-seam',style:'stroke-dasharray:4 3'});
    m('circle',{cx:X-6,cy:boomY-4,r:4,class:'il-clewring'}); m('circle',{cx:C[0],cy:C[1],r:4,class:'il-clewring'});}
  if(reef===2){m('rect',{x:B[0]+10,y:boomY-6,width:X-B[0]-22,height:10,rx:5,class:'il-bundle'});
    for(let i=0;i<4;i++) m('circle',{cx:X-22-i*28,cy:boomY-1,r:1.6,class:'il-pin'});}
  if(s.wr==='loose'){for(let i=0;i<5;i++){const y=G[1]-8-i*12;m('path',{d:`M${X-3},${y} l-16,-5`,class:'il-wrinkle'});}}
  if(s.flutter) ilFlutter(m,Hd,[lm[0]+lk,lm[1]+20],3,'il-flutter');
  if(s.hook) m('path',{d:`M${Hd} Q${lc[0]-8},${lc[1]} ${C}`,class:'il-hook'});
  if(s.ltt){[.3,.55,.8].forEach((f,i)=>{const y=Hd[1]+(C[1]-Hd[1])*f,x=Hd[0]+(C[0]-Hd[0])*f+lk*(1-Math.abs(.5-f)*2)*.9,st=s.ltt[i];
    m('circle',{cx:x,cy:y,r:2,class:'il-pin'});
    m('path',{d:st==='hid'?`M${x},${y} q8,-2 10,6`:`M${x},${y} l-22,1`,class:st==='hid'?'il-tt-bad':'il-tt-ok'});});}
  // botavara, contra, cunningham, amantillo
  m('line',{x1:G[0],y1:G[1],x2:B[0],y2:B[1],class:'il-boom'});
  const V=[150,G[1]+(B[1]-G[1])*(X-150)/(X-B[0])];
  if(s.vang!==false) m('line',{x1:X-2,y1:192,x2:V[0],y2:V[1]+2,class:s.vangTight?'il-vang tight':'il-vang'});
  const cun=[X,G[1]-14];
  if(s.cun) {m('circle',{cx:cun[0]-3,cy:cun[1],r:3.5,class:'il-clewring'}); m('line',{x1:cun[0]-3,y1:cun[1],x2:X-6,y2:194,class:'il-line'});}
  if(s.topping) m('line',{x1:X,y1:top,x2:B[0]+2,y2:B[1],class:'il-topping'});
  m('circle',{cx:C[0],cy:C[1],r:4.2,class:'il-car'});
  // anotaciones
  const tgt={vang:[(X+V[0])/2,(192+V[1])/2],boomend:B,clew:C,cun:[cun[0]-3,cun[1]],adj:[34,186],topping:[(X+B[0])/2,(top+B[1])/2],
    reeftack:[X-6,boomY-4],reefclew:C,leech:lc,ltt:[Hd[0]+(C[0]-Hd[0])*.3,Hd[1]+(C[1]-Hd[1])*.3],mast:[X+bend*1.1,105],halyard:[X,40],forestay:[(fs[0]+340)/2,(fs[1]+191)/2]};
  if(s.arrows) s.arrows.forEach(a=>ilArrow(m,a[0],a[1],a[2],a[3]||44));
  if(s.halo) ilHalo(m,tgt[s.halo],s.haloR);
  if(s.pill) ilPill(m,s.pill[0],tgt[s.pill[1]],s.pill[2]||[290,60]);
  if(s.check) ilCheck(m,276,40);
}

/* ---------- escena: vista cenital (proa arriba) ---------- */
function drawTop(svg,s){
  svg.innerHTML=''; const m=M_(svg);
  m('rect',{x:0,y:0,width:360,height:240,class:'il-water'});
  for(let i=0;i<14;i++){const x=(i*67)%360+10,y=(i*41)%220+10;m('path',{d:`M${x},${y} q6,-4 12,0 t12,0`,class:'il-ripple'});}
  if(s.gust){const [gx,gy]=s.gust;for(let i=0;i<9;i++){const x=gx+((i*13)%40)-20,y=gy+((i*17)%34)-17;m('path',{d:`M${x},${y} q5,-4 10,0 t10,0`,class:'il-gust'});}}
  const ox=s.ox||180, side=s.side||-1; // side: lado de sotavento (-1 babor/izquierda, 1 estribor/derecha)
  const g=m('g',{transform:`rotate(${s.rot||0} ${ox} 120)`});
  const gm=(tag,at,txt)=>{const e=mk(tag,at,g);if(txt!=null)e.textContent=txt;return e;};
  const bow=[ox,24], mast=[ox,88];
  gm('path',{d:`M${ox},22 C${ox+34},60 ${ox+38},120 ${ox+30},212 L${ox-30},212 C${ox-38},120 ${ox-34},60 ${ox},22 Z`,class:'il-hulltop'});
  gm('path',{d:`M${ox-18},150 L${ox+18},150 L${ox+20},206 L${ox-20},206 Z`,class:'il-cockpit'});
  if(s.spreader) gm('line',{x1:ox-40,y1:88,x2:ox+40,y2:88,class:'il-spreader'});
  // mayor
  const bA=(s.boom!=null?s.boom:12)*D2R, bs=s.boomSide||side, bl=104, BE=[ox+bs*bl*Math.sin(bA),88+bl*Math.cos(bA)];
  const bulge=(a,b,k,sd)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);let nx=-dy/l,ny=dx/l;if(nx*sd<0){nx=-nx;ny=-ny;}return [(a[0]+b[0])/2+nx*k,(a[1]+b[1])/2+ny*k];};
  const camb=s.camber!=null?s.camber:10, mc=bulge(mast,BE,camb*2,bs); s._MC=bulge(mast,BE,camb,bs);
  if(s.mainFlap) ilFlutter(gm,mast,BE,3,'il-flutter-top'); else gm('path',{d:`M${mast} Q${mc} ${BE}`,class:'il-sailtop'});
  gm('line',{x1:mast[0],y1:mast[1],x2:BE[0],y2:BE[1],class:'il-boomtop'});
  // carro y escota de mayor
  if(s.trav!==false){gm('line',{x1:ox-26,y1:190,x2:ox+26,y2:190,class:'il-track'});
    const cx=ox+(s.car||0)*24; gm('rect',{x:cx-6,y:185,width:12,height:10,rx:2,class:'il-car'});
    const bp=[mast[0]+(BE[0]-mast[0])*.82,mast[1]+(BE[1]-mast[1])*.82]; gm('line',{x1:cx,y1:190,x2:bp[0],y2:bp[1],class:'il-rope thin'});}
  // génova
  if(s.genoa!==false){const gs=s.genoaSide||side, gA=(s.gen!=null?s.gen:14)*D2R, gl=92, GC=[ox+gs*gl*Math.sin(gA),26+gl*Math.cos(gA)];
    if(s.genFlap) ilFlutter(gm,bow,GC,3,'il-flutter-top');
    else gm('path',{d:`M${bow} Q${bulge(bow,GC,22,gs)} ${GC}`,class:'il-sailtop gen'});
    if(s.pole) gm('line',{x1:mast[0],y1:mast[1],x2:GC[0],y2:GC[1],class:'il-pole'});
    if(s.gtt){const P=[bow[0]+(GC[0]-bow[0])*.22+gs*5,bow[1]+(GC[1]-bow[1])*.22];
      const w=s.gtt[0],l=s.gtt[1];
      const wx=P[0]-gs*7, lx=P[0]+gs*7;
      gm('path',{d:w==='bad'?`M${wx},${P[1]} c-${gs*6},2 ${-gs*2},8 ${-gs*8},10`:`M${wx},${P[1]} l0,18`,class:w==='bad'?'il-tt-bad':'il-tt-ok'});
      gm('path',{d:l==='bad'?`M${lx},${P[1]} c${gs*6},2 ${gs*2},8 ${gs*8},10`:`M${lx},${P[1]} l0,18`,class:l==='bad'?'il-tt-bad':'il-tt-ok'});}
    s._GC=GC;}
  if(s.preventer){gm('path',{d:`M${BE} L${ox+bs*14},34`,class:'il-rope thin'});gm('circle',{cx:ox+bs*14,cy:34,r:4,class:'il-car'});if(s.preventer>1)gm('path',{d:`M${ox+bs*14},34 L${ox+bs*22},176`,class:'il-rope thin dash'});}
  if(s.gybe){const a=[BE[0],BE[1]],b=[ox-bs*(BE[0]-ox),BE[1]];gm('path',{d:`M${a} Q${ox},${BE[1]+60} ${b}`,class:'il-danger'});}
  if(s.rudder!=null){const r=s.rudder*D2R;gm('line',{x1:ox,y1:206,x2:ox+Math.sin(r)*22,y2:206+Math.cos(r)*22,class:'il-rudder'});}
  m('circle',{cx:mast[0],cy:mast[1],r:4,class:'il-car'});
  // viento: flecha que llega desde barlovento
  if(s.wind!=null){const w=s.wind*D2R, R0=150, cx0=180, cy0=118, sx=cx0+R0*Math.sin(w)*.9, sy=cy0-R0*Math.cos(w)*.75;
    const ang=Math.atan2(cy0-sy,cx0-sx)/D2R; ilArrow(m,sx,sy,ang,48); m('text',{x:sx+(Math.sin(w)>0?-6:6),y:sy-12,'text-anchor':Math.sin(w)>0?'end':'start',class:'il-wlbl'},t('Viento'));}
  if(s.turn){const d=s.turn, c=[ox+d*70,30], a0=Math.atan2(-d*70,6)/D2R; ilCurveArrow(m,c[0],c[1],70,a0,a0+d*38);}
  const tgt={car:[ox+(s.car||0)*24,190],boomend:BE,boommid:s._MC,block:[ox+(s.boomSide||side)*14,34],genoa:s._GC||bow,bow,mast,gtt:[bow[0]+((s._GC||bow)[0]-bow[0])*.22,bow[1]+((s._GC||bow)[1]-bow[1])*.22],rudder:[ox,214],spreader:[ox+side*40,88]};
  if(s.halo) ilHalo(m,tgt[s.halo],s.haloR);
  if(s.pill) ilPill(m,s.pill[0],tgt[s.pill[1]],s.pill[2]||[290,60]);
  if(s.arrows) s.arrows.forEach(a=>ilArrow(m,a[0],a[1],a[2],a[3]||44));
  if(s.check) ilCheck(m,26,44);
}

/* ---------- escena: ola de lado ---------- */
function drawWave(svg,s){
  svg.innerHTML=''; const m=M_(svg);
  m('rect',{x:0,y:0,width:360,height:240,class:'il-sky'});
  const wave=x=>150-46*Math.exp(-Math.pow((x-(s.crest||190))/70,2));
  let d='M0,240 L0,'+wave(0);for(let x=0;x<=360;x+=6)d+=` L${x},${wave(x).toFixed(1)}`;d+=' L360,240 Z';
  m('path',{d,class:'il-sea'});
  const bx=s.bx||150, by=wave(bx), dy=(wave(bx+4)-wave(bx-4))/8, ang=Math.atan(dy)/D2R*(s.flip?-1:1);
  const g=m('g',{transform:`translate(${bx} ${by}) rotate(${ang}) scale(${s.flip?-1:1} 1)`});
  const gm=(tag,at)=>mk(tag,at,g);
  gm('path',{d:'M-62,-6 Q0,0 62,-12 L54,8 Q0,16 -54,10 Z',class:'il-hull'});
  gm('line',{x1:-6,y1:-8,x2:-6,y2:-120,class:'il-mast'});
  gm('path',{d:'M-4,-118 L52,-12 L-4,-10 Z',class:'il-sail'});
  gm('path',{d:'M-8,-112 L-56,-14 L-8,-12 Z',class:'il-sail'});
  if(s.arc) ilCurveArrow(m,bx,by-150,48,s.arc[0],s.arc[1]);
  if(s.pill) ilPill(m,s.pill[0],null,s.pill[1]);
  if(s.arrows) s.arrows.forEach(a=>ilArrow(m,a[0],a[1],a[2],a[3]||44));
}

/* ---------- escena: escora vista desde popa ---------- */
function drawHeel(svg,s){
  svg.innerHTML=''; const m=M_(svg);
  m('rect',{x:0,y:0,width:360,height:240,class:'il-sky'});
  const h=s.heel||0;
  const g=m('g',{transform:`rotate(${h} 180 190)`}); const gm=(tag,at)=>mk(tag,at,g);
  gm('line',{x1:180,y1:182,x2:180,y2:22,class:'il-mast'});
  gm('path',{d:'M182,30 Q196,100 184,176 L182,176 Z',class:'il-sail'});
  gm('path',{d:'M128,176 L232,176 Q226,214 180,222 Q134,214 128,176 Z',class:'il-hull'});
  gm('line',{x1:180,y1:222,x2:180,y2:246,class:'il-keel'});
  (s.crew||[]).forEach(x=>{gm('circle',{cx:180+x,cy:164,r:7,class:'il-crew'});gm('rect',{x:180+x-6,y:170,width:12,height:8,rx:3,class:'il-crew'});});
  m('path',{d:'M0 200 Q45 194 90 200 T180 200 T270 200 T360 200 V240 H0 Z',class:'il-sea'});
  if(s.wind) {ilArrow(m,14,70,0,54); m('text',{x:16,y:56,class:'il-wlbl'},t('Viento'));}
  if(s.pill) ilPill(m,s.pill[0],null,s.pill[1]);
  if(s.check) ilCheck(m,276,40);
}
function drawScene(svg,s){({main:drawMain,top:drawTop,wave:drawWave,heel:drawHeel}[s.sc]||drawGenoa)(svg,s);}

/* ---------- temas ---------- */
const HOW={
  escotero:{
    title:'Mover el escotero del génova',
    steps:[
      {t:'Orza despacio y mira qué lanita de barlovento rompe primero.',s:{p:.6,tt:['ok','ok','bad'],pill:['Lanitas','tt'],halo:'tt'}},
      {t:'Larga un poco de escota para quitar carga del carro.',s:{p:.6,slack:true,pill:['Escota','sheet'],halo:'sheet'}},
      {t:'Mueve el carro: adelante si rompe antes la alta, atrás si rompe antes la baja.',s:{p:.2,from:.6,arrow:1,pill:['Escotero','car'],halo:'car'}},
      {t:'Caza y comprueba: las tres lanitas rompen a la vez.',s:{p:.2,tt:['ok','ok','ok'],check:true}}],
    fx:[['Adelante','Tira hacia abajo. Baluma cerrada y más bolsa abajo. Para poco viento o con mar.'],
        ['Atrás','Tira hacia atrás. Pujamen plano y la parte alta abierta, que descarga. Para viento fuerte.']],
    note:'No muevas el carro con la escota cargada: el pasador se atasca y te puedes pillar los dedos.'
  },
  carro:{
    title:{es:'Carro de mayor',en:'Mainsheet traveller',fr:'Chariot de GV'},
    steps:[
      {t:{es:'El carro mueve la botavara de lado a lado sin cambiar la tensión de la escota.',en:'The traveller moves the boom side to side without changing mainsheet tension.',fr:"Le chariot déplace la bôme latéralement sans changer la tension de l'écoute."},
       s:{sc:'top',wind:40,boom:8,car:0,pill:[{es:'Carro',en:'Traveller',fr:'Chariot'},'car',[292,206]],halo:'car'}},
      {t:{es:'En una racha, suelta el carro a sotavento: la botavara se abre y la vela descarga sin que se abra la baluma.',en:'In a gust, drop the car to leeward: the boom opens and the sail depowers without the leech opening.',fr:"Dans une rafale, laisse descendre le chariot sous le vent : la bôme s'ouvre et la voile se dévente sans que la chute s'ouvre."},
       s:{sc:'top',wind:40,boom:22,car:-1,gust:[300,60],arrows:[[206,216,180,40]],halo:'car'}},
      {t:{es:'Al pasar la racha, vuelve a subirlo. El timón debe quedar casi recto.',en:'When the gust passes, pull it back up. The helm should stay nearly centred.',fr:'Quand la rafale passe, remonte-le. La barre doit rester presque droite.'},
       s:{sc:'top',wind:40,boom:8,car:0,rudder:0,arrows:[[154,216,0,40]]}},
      {t:{es:'Con poco viento: carro a barlovento y escota algo suelta. Botavara en el eje y la parte alta abierta.',en:'In light air: car to windward and sheet slightly eased. Boom on the centreline and the top open.',fr:"Dans le petit temps : chariot au vent et écoute un peu choquée. Bôme dans l'axe et le haut ouvert."},
       s:{sc:'top',wind:40,boom:2,car:.9,halo:'car',pill:[{es:'Barlovento',en:'Windward',fr:'Au vent'},'car',[292,206]]}}],
    fx:[[{es:'A barlovento',en:'To windward',fr:'Au vent'},{es:'Sube la botavara sin cerrar la baluma. Poco viento.',en:'Brings the boom up without closing the leech. Light air.',fr:'Remonte la bôme sans fermer la chute. Petit temps.'}],
        [{es:'A sotavento',en:'To leeward',fr:'Sous le vent'},{es:'Descarga en las rachas manteniendo la forma. Viento fresco.',en:'Depowers in gusts while keeping the shape. Fresh breeze.',fr:'Dévente dans les rafales en gardant la forme. Vent frais.'}]],
    note:{es:'Avisa antes de soltar el carro: corre de golpe y puede pillar manos en la bañera.',en:'Call it before releasing the traveller: it slams across and can catch hands in the cockpit.',fr:'Préviens avant de larguer le chariot : il part d\'un coup et peut pincer des mains dans le cockpit.'}
  },
  contra:{
    title:{es:'Contra',en:'Boom vang',fr:'Hale-bas'},
    steps:[
      {t:{es:'Contra suelta: la botavara sube y la parte alta de la mayor se abre.',en:'Vang off: the boom lifts and the top of the main twists open.',fr:"Hale-bas choqué : la bôme monte et le haut de la GV s'ouvre."},
       s:{sc:'main',boom:136,lk:24,pill:[{es:'Contra suelta',en:'Vang off',fr:'Hale-bas choqué'},'vang',[300,110]]}},
      {t:{es:'Caza el cabo de la contra: tira de la botavara hacia abajo.',en:'Pull the vang line: it pulls the boom down.',fr:'Reprends le hale-bas : il tire la bôme vers le bas.'},
       s:{sc:'main',boom:144,lk:12,vangTight:true,halo:'vang',arrows:[[128,112,90,34]]}},
      {t:{es:'Contra tensa: la baluma se cierra y la vela trabaja entera. Es clave a rumbos abiertos.',en:'Vang on: the leech closes and the whole sail works. Key off the wind.',fr:'Hale-bas repris : la chute se ferme et toute la voile travaille. Essentiel aux allures portantes.'},
       s:{sc:'main',boom:152,lk:0,vangTight:true,check:true}},
      {t:{es:'A rumbos abiertos, en una racha fuerte, larga la contra: la parte alta se abre y el barco no se va de orzada.',en:"Off the wind, in a strong gust, ease the vang: the top opens and the boat doesn't round up.",fr:"Aux allures portantes, dans une forte rafale, choque le hale-bas : le haut s'ouvre et le bateau ne part pas au lof."},
       s:{sc:'main',boom:138,lk:22,arrows:[[128,190,-90,34]],halo:'vang',pill:[{es:'Racha',en:'Gust',fr:'Rafale'},null,[300,60]]}}],
    fx:[[{es:'Tensa',en:'On',fr:'Repris'},{es:'Baluma cerrada, más potencia y menos balanceo.',en:'Closed leech, more power, less rolling.',fr:'Chute fermée, plus de puissance, moins de roulis.'}],
        [{es:'Suelta',en:'Off',fr:'Choqué'},{es:'Parte alta abierta, descarga presión.',en:'Open top, spills pressure.',fr:'Haut ouvert, libère la pression.'}]],
    note:{es:'Con contra rígida o de varillas, lo que se ajusta es el cabo del polipasto.',en:"With a rigid or rod-type vang, what you adjust is the tackle's line.",fr:'Avec un hale-bas rigide, on règle la manœuvre du palan.'}
  },
  pujamen:{
    title:{es:'Pujamen',en:'Outhaul',fr:'Bordure'},
    steps:[
      {t:{es:'Pujamen suelto: bolsa en la parte baja de la mayor. Más potencia.',en:'Outhaul eased: depth in the lower main. More power.',fr:'Bordure choquée : du creux en bas de la GV. Plus de puissance.'},
       s:{sc:'top',wind:40,boom:14,camber:16,halo:'boommid',pill:[{es:'Bolsa',en:'Depth',fr:'Creux'},'boommid',[80,200]]}},
      {t:{es:'Caza el cabo de pujamen: el puño se va hacia el final de la botavara.',en:'Pull the outhaul: the clew moves toward the end of the boom.',fr:"Reprends l'étarqueur : le point d'écoute part vers le bout de la bôme."},
       s:{sc:'main',out:.5,fd:11,arrows:[[150,128,180,44]],halo:'clew'}},
      {t:{es:'Pujamen cazado: el tercio bajo queda plano. Menos escora con viento.',en:'Outhaul on: the lower third goes flat. Less heel in a breeze.',fr:'Bordure étarquée : le tiers bas devient plat. Moins de gîte dans la brise.'},
       s:{sc:'top',wind:40,boom:14,camber:3,check:true}},
      {t:{es:'Regla: suelto a rumbos abiertos y con ola; a tope en ceñida con viento.',en:'Rule of thumb: eased off the wind and in waves; hard on upwind in a breeze.',fr:'Repère : choquée aux allures portantes et dans la vague ; à fond au près dans la brise.'},
       s:{sc:'main',out:.6,fd:8,pill:[{es:'Pujamen',en:'Outhaul',fr:'Bordure'},'clew',[300,80]]}}],
    fx:[[{es:'Suelto',en:'Eased',fr:'Choquée'},{es:'Más bolsa abajo. Poco viento, ola, rumbos abiertos.',en:'More depth low down. Light air, waves, off the wind.',fr:'Plus de creux en bas. Petit temps, vagues, allures portantes.'}],
        [{es:'Cazado',en:'On',fr:'Étarquée'},{es:'Plano abajo. Ceñida con viento fresco.',en:'Flat low down. Upwind in a fresh breeze.',fr:'Plat en bas. Au près dans la brise.'}]]
  },
  cunningham:{
    title:{es:'Cunningham y grátil',en:'Cunningham and luff',fr:'Cunningham et guindant'},
    steps:[
      {t:{es:'Grátil suelto: arrugas horizontales junto al palo y la bolsa se va hacia atrás.',en:'Loose luff: horizontal wrinkles along the mast and the depth moves aft.',fr:'Guindant mou : plis horizontaux le long du mât et le creux recule.'},
       s:{sc:'main',wr:'loose',cun:true,fd:12,lk:-4,halo:'mast',haloR:22,pill:[{es:'Arrugas',en:'Wrinkles',fr:'Plis'},'mast',[300,80]]}},
      {t:{es:'Tira del cunningham hacia abajo (o tensa la driza si no tienes cunningham).',en:"Pull the cunningham down (or tension the halyard if you don't have one).",fr:"Tire le cunningham vers le bas (ou reprends la drisse si tu n'en as pas)."},
       s:{sc:'main',wr:'loose',cun:true,fd:12,arrows:[[230,96,90,40]],halo:'cun',pill:['Cunningham','cun',[300,80]]}},
      {t:{es:'Grátil tenso: la bolsa vuelve adelante y la parte alta de la baluma se abre. Descarga con viento.',en:'Tight luff: the depth moves forward and the upper leech opens. Depowers in a breeze.',fr:"Guindant tendu : le creux revient vers l'avant et le haut de la chute s'ouvre. Dévente dans la brise."},
       s:{sc:'main',cun:true,fd:8,lk:10,check:true}},
      {t:{es:'Con poco viento suéltalo: unas arrugas leves no importan.',en:"In light air ease it: a few light wrinkles don't matter.",fr:'Dans le petit temps, choque-le : quelques légers plis ne gênent pas.'},
       s:{sc:'main',cun:true,wr:'loose',fd:14,pill:[{es:'Poco viento',en:'Light air',fr:'Petit temps'},null,[300,60]]}}]
  },
  backstay:{
    title:{es:'Tensor del estay de popa',en:'Backstay adjuster',fr:'Réglage de pataras'},
    steps:[
      {t:{es:'Tensor suelto: palo recto y mayor con bolsa.',en:'Adjuster off: straight mast and a full main.',fr:'Pataras choqué : mât droit et GV creuse.'},
       s:{sc:'main',backstay:true,bsag:10,fsag:12,fd:14}},
      {t:{es:'Caza el tensor: polipasto, volante o hidráulico, según el barco.',en:'Tension the adjuster: tackle, wheel or hydraulic, depending on the boat.',fr:'Reprends le réglage : palan, volant ou hydraulique, selon le bateau.'},
       s:{sc:'main',backstay:true,bstay:true,fsag:4,fd:12,halo:'adj',arrows:[[35,140,90,32]],pill:[{es:'Tensor',en:'Adjuster',fr:'Réglage'},'adj',[96,40]]}},
      {t:{es:'En aparejo fraccionado el palo se curva: la mayor se aplana y se abre arriba.',en:'On a fractional rig the mast bends: the main flattens and opens at the top.',fr:"Sur un gréement fractionné le mât cintre : la GV s'aplatit et s'ouvre en haut."},
       s:{sc:'main',backstay:true,bstay:true,frac:true,bend:10,fd:4,lk:10,halo:'mast',haloR:24,pill:[{es:'Palo curvado',en:'Mast bend',fr:'Mât cintré'},'mast',[304,70]]}},
      {t:{es:'En los dos aparejos tensa el estay de proa: el génova va más plano y ciñe mejor.',en:'On both rigs it tightens the forestay: the genoa sets flatter and points higher.',fr:"Sur les deux gréements il tend l'étai : le génois est plus plat et remonte mieux."},
       s:{sc:'main',backstay:true,bstay:true,fsag:0,halo:'forestay',pill:[{es:'Estay de proa',en:'Forestay',fr:'Étai'},'forestay',[310,40]]}}],
    note:{es:'Sin tensor, el estay de popa es jarcia fija: no se toca navegando.',en:"Without an adjuster the backstay is standing rigging: don't touch it under way.",fr:"Sans réglage, le pataras est du gréement dormant : on n'y touche pas en navigation."}
  },
  escota_mayor:{
    title:{es:'Escota de mayor',en:'Mainsheet',fr:'Écoute de GV'},
    steps:[
      {t:{es:'Larga escota hasta que el grátil de la mayor empiece a flamear.',en:"Ease the sheet until the main's luff starts to flutter.",fr:"Choque l'écoute jusqu'à ce que le guindant de GV commence à faseyer."},
       s:{sc:'top',wind:40,boom:24,mainFlap:true,halo:'mast',pill:[{es:'Flamea',en:'Fluttering',fr:'Faseye'},'mast',[292,40]]}},
      {t:{es:'Caza lo justo para que deje de flamear. Esa es la posición buena.',en:"Trim just enough for it to stop. That's the right spot.",fr:"Reborde juste assez pour que ça s'arrête. C'est le bon réglage."},
       s:{sc:'top',wind:40,boom:13,check:true}},
      {t:{es:'En ceñida, mira la lanita alta de la baluma: debe volar casi siempre.',en:'Close-hauled, watch the top leech telltale: it should stream most of the time.',fr:'Au près, regarde le penon de chute du haut : il doit voler presque tout le temps.'},
       s:{sc:'main',ltt:['ok','ok','ok'],halo:'ltt',pill:['Lanita de baluma','ltt',[120,40]]}},
      {t:{es:'Si se esconde detrás de la vela, vas sobrecazado: larga un poco.',en:"If it hides behind the sail, you're over-trimmed: ease a little.",fr:"S'il se cache derrière la voile, tu es trop bordé : choque un peu."},
       s:{sc:'main',ltt:['hid','ok','ok'],lk:-6,halo:'ltt',pill:['Se esconde','ltt',[110,40]]}}],
    fx:[[{es:'Más cazada',en:'Trimmed in',fr:'Plus bordée'},{es:'Más altura y potencia, y más escora.',en:'More height and power, and more heel.',fr:'Plus de cap et de puissance, et plus de gîte.'}],
        [{es:'Más largada',en:'Eased',fr:'Plus choquée'},{es:'Menos escora. Si te pasas, flamea y pierdes velocidad.',en:'Less heel. Overdo it and it luffs and you slow down.',fr:'Moins de gîte. Trop, et elle faseye et tu ralentis.'}]]
  },
  escota_genova:{
    title:{es:'Escota del génova y lanitas',en:'Genoa sheet and telltales',fr:'Écoute de génois et penons'},
    steps:[
      {t:{es:'Flamea la de barlovento: vas demasiado orzado o la vela está largada. Cae un poco o caza.',en:'The windward one flutters: too high or the sail is eased. Bear away a little or trim in.',fr:'Celui au vent faseye : trop lofé ou voile trop choquée. Abats un peu ou borde.'},
       s:{sc:'top',wind:40,gen:17,gtt:['bad','ok'],halo:'gtt',haloR:22,pill:['Barlovento','gtt',[300,40]]}},
      {t:{es:'Flamea la de sotavento: vas caído o sobrecazado. Orza un poco o larga.',en:'The leeward one flutters: too low or over-trimmed. Head up a little or ease.',fr:'Celui sous le vent faseye : trop abattu ou trop bordé. Lofe un peu ou choque.'},
       s:{sc:'top',wind:40,gen:6,gtt:['ok','bad'],halo:'gtt',haloR:22,pill:['Sotavento','gtt',[300,40]]}},
      {t:{es:'Las dos horizontales: trimado bueno.',en:'Both streaming: good trim.',fr:"Les deux à l'horizontale : bon réglage."},
       s:{sc:'top',wind:40,gen:11,gtt:['ok','ok'],check:true}},
      {t:{es:'En ceñida, caza hasta que la baluma quede a unos centímetros de la cruceta.',en:'Close-hauled, trim until the leech is a few centimetres off the spreader.',fr:"Au près, borde jusqu'à ce que la chute soit à quelques centimètres de la barre de flèche."},
       s:{sc:'top',wind:40,gen:10,spreader:true,halo:'spreader',pill:[{es:'Cruceta',en:'Spreader',fr:'Barre de flèche'},'spreader',[80,200]]}}]
  },
  driza_genova:{
    title:{es:'Driza del génova',en:'Genoa halyard',fr:'Drisse de génois'},
    steps:[
      {t:{es:'Driza floja: arrugas horizontales en el grátil y la bolsa se va atrás.',en:'Halyard loose: horizontal wrinkles at the luff and the depth moves aft.',fr:'Drisse molle : plis horizontaux au guindant et le creux recule.'},
       s:{wr:'loose',halo:'luff',haloR:24,pill:[{es:'Arrugas',en:'Wrinkles',fr:'Plis'},'luff',[262,44]]}},
      {t:{es:'Tensa la driza, mejor con el génova sin carga o con el winche.',en:'Tension the halyard, ideally with the genoa unloaded or on the winch.',fr:'Reprends la drisse, idéalement génois déchargé ou au winch.'},
       s:{wr:'loose',headArrow:true,halo:'head',pill:['Driza','head',[262,44]]}},
      {t:{es:'Sin arrugas: la bolsa vuelve adelante. Para viento fresco.',en:'No wrinkles: the depth moves forward. For a fresh breeze.',fr:'Sans plis : le creux revient en avant. Pour le vent frais.'},s:{check:true}},
      {t:{es:'Si aparece un pliegue vertical junto al grátil, te has pasado: afloja un poco.',en:"If a vertical crease appears along the luff, it's too tight: ease a little.",fr:"Si un pli vertical apparaît le long du guindant, c'est trop tendu : choque un peu."},
       s:{wr:'tight',halo:'luff',haloR:24,pill:[{es:'Pliegue',en:'Crease',fr:'Pli'},'luff',[262,44]]}}]
  },
  enrollador:{
    title:{es:'Enrollar el génova',en:'Furling the genoa',fr:'Enrouler le génois'},
    steps:[
      {t:{es:'Larga un poco de escota del génova para quitarle presión.',en:'Ease the genoa sheet a little to take the pressure off.',fr:"Choque un peu l'écoute de génois pour enlever la pression."},s:{slack:true,halo:'sheet',pill:['Escota','sheet']}},
      {t:{es:'Cobra el cabo del enrollador manteniendo algo de tensión en la escota.',en:'Haul the furling line while keeping some tension on the sheet.',fr:"Tire la bosse d'enrouleur en gardant un peu de tension sur l'écoute."},
       s:{furl:.5,furlArrow:true,halo:'drum',pill:[{es:'Enrollador',en:'Furler',fr:'Enrouleur'},'drum',[272,70]]}},
      {t:{es:'Con el génova reducido, adelanta el escotero: el puño ha subido y avanzado.',en:'With the genoa reduced, move the car forward: the clew has risen and moved forward.',fr:"Génois réduit, avance le chariot : le point d'écoute est monté et a avancé."},
       s:{furl:.5,car:0,from:.5,arrow:1,halo:'car',pill:['Escotero','car']}},
      {t:{es:'Caza y comprueba las lanitas. Para desenrollar, al revés: suelta el cabo y tira de la escota.',en:'Trim and check the telltales. To unfurl, the reverse: release the line and pull the sheet.',fr:"Borde et vérifie les penons. Pour dérouler, l'inverse : libère la bosse et tire l'écoute."},
       s:{furl:.5,car:0,tt:['ok','ok','ok'],check:true}}],
    note:{es:'No enrolles con la escota cazada a tope: fuerzas el enrollador.',en:"Don't furl with the sheet hard on: you'll strain the furler.",fr:"N'enroule pas avec l'écoute bordée à fond : tu forces l'enrouleur."}
  },
  rizo:{
    title:{es:'Tomar un rizo',en:'Taking a reef',fr:'Prendre un ris'},
    steps:[
      {t:{es:'Ponte en ceñida o al pairo. Larga contra y escota, y tensa el amantillo.',en:'Head up close-hauled or heave to. Ease vang and sheet, and take up the topping lift.',fr:'Mets-toi au près ou à la cape. Choque hale-bas et écoute, et reprends la balancine.'},
       s:{sc:'main',topping:true,reefmarks:true,boom:144,lk:18,halo:'topping',pill:[{es:'Amantillo',en:'Topping lift',fr:'Balancine'},'topping',[300,70]]}},
      {t:{es:'Baja la driza hasta la marca y engancha el ollao de amura en la garra.',en:'Lower the halyard to the mark and hook the tack cringle on the reefing hook.',fr:"Affale jusqu'à la marque et crochète l'œillet d'amure sur le croc."},
       s:{sc:'main',reef:1,topping:true,halo:'reeftack',pill:[{es:'Ollao de amura',en:'Tack cringle',fr:"Œillet d'amure"},'reeftack',[300,110]]}},
      {t:{es:'Tensa la driza y caza el cabo de rizo hasta que el ollao de baluma baje a la botavara.',en:'Re-tension the halyard and haul the reef line until the leech cringle is down on the boom.',fr:"Reprends la drisse et la bosse de ris jusqu'à ce que l'œillet de chute descende sur la bôme."},
       s:{sc:'main',reef:1,topping:true,halo:'reefclew',arrows:[[112,82,90,30]],pill:[{es:'Cabo de rizo',en:'Reef line',fr:'Bosse de ris'},'reefclew',[120,40]]}},
      {t:{es:'Larga el amantillo, caza escota y contra y vuelve al rumbo.',en:'Ease the topping lift, trim sheet and vang, and bear away onto your course.',fr:'Choque la balancine, reprends écoute et hale-bas et reprends ton cap.'},
       s:{sc:'main',reef:2,vangTight:true,check:true}}],
    note:{es:'Con mar: chaleco y arnés enganchado antes de salir de la bañera.',en:'In a seaway: lifejacket on and harness clipped in before leaving the cockpit.',fr:'Avec de la mer : gilet et harnais attachés avant de sortir du cockpit.'}
  },
  timon_rachas:{
    title:{es:'Timón en las rachas',en:'Steering through gusts',fr:'La barre dans les rafales'},
    steps:[
      {t:{es:'Mira el agua a barlovento: las rachas llegan como manchas oscuras.',en:'Watch the water to windward: gusts arrive as dark patches.',fr:"Regarde l'eau au vent : les rafales arrivent en taches sombres."},
       s:{sc:'top',wind:40,gust:[300,60],pill:[{es:'Racha',en:'Gust',fr:'Rafale'},null,[300,110]]}},
      {t:{es:'En ceñida: al entrar, orza un pelo hasta que flamee el grátil del génova.',en:'Upwind: as it hits, head up a touch until the genoa luff starts to flutter.',fr:"Au près : quand elle arrive, lofe un poil jusqu'à ce que le guindant du génois faseye."},
       s:{sc:'top',wind:40,gust:[248,72],turn:1,pill:[{es:'Orza',en:'Head up',fr:'Lofe'},null,[96,40]]}},
      {t:{es:'A rumbos abiertos: al entrar, cae para no irte de orzada.',en:"Off the wind: as it hits, bear away so you don't round up.",fr:'Aux allures portantes : quand elle arrive, abats pour ne pas partir au lof.'},
       s:{sc:'top',wind:100,boom:48,gen:42,gust:[300,110],turn:-1,pill:[{es:'Cae',en:'Bear away',fr:'Abats'},null,[270,40]]}},
      {t:{es:'Al pasar, vuelve al rumbo. Si llevas mucho timón todo el rato, toca reducir.',en:"Once it passes, return to course. If you're carrying lots of helm all the time, it's time to reduce sail.",fr:'Quand elle passe, reprends ton cap. Si tu as beaucoup de barre en permanence, il faut réduire.'},
       s:{sc:'top',wind:40,rudder:0,check:true}}]
  },
  rumbo:{
    title:{es:'Abrir un poco el rumbo',en:'Bearing away a little',fr:'Abattre un peu'},
    steps:[
      {t:{es:'Muy orzado, el barco pierde velocidad, sobre todo con poco viento o con ola.',en:'Pointing too high, the boat loses speed, especially in light air or waves.',fr:'Trop lofé, le bateau perd de la vitesse, surtout dans le petit temps ou la vague.'},
       s:{sc:'top',wind:30,boom:3,gen:5,pill:[{es:'Muy orzado',en:'Too high',fr:'Trop lofé'},null,[96,40]]}},
      {t:{es:'Cae unos 5°.',en:'Bear away about 5°.',fr:"Abats d'environ 5°."},s:{sc:'top',wind:40,turn:-1,pill:['5°',null,[110,40]]}},
      {t:{es:'Larga un pelo las dos escotas para acompañar el nuevo ángulo.',en:'Ease both sheets a touch to match the new angle.',fr:'Choque un poil les deux écoutes pour suivre le nouvel angle.'},
       s:{sc:'top',wind:45,boom:15,gen:15,halo:'boomend'}},
      {t:{es:'Cuando el barco acelere, vuelve a ganar altura poco a poco.',en:'Once the boat speeds up, gain height again little by little.',fr:'Quand le bateau accélère, regagne du cap petit à petit.'},
       s:{sc:'top',wind:40,check:true}}]
  },
  retenida:{
    title:{es:'Retenida de botavara',en:'Boom preventer',fr:'Retenue de bôme'},
    steps:[
      {t:{es:'En popa, un cambio de viento o una ola pueden pasar la botavara de golpe.',en:'Downwind, a wind shift or a wave can slam the boom across.',fr:"Au portant, une bascule ou une vague peut faire passer la bôme d'un coup."},
       s:{sc:'top',wind:168,boom:76,gen:30,genFlap:true,trav:false,gybe:true,pill:[{es:'Trasluchada',en:'Gybe',fr:'Empannage'},null,[290,40]]}},
      {t:{es:'Ata un cabo al final de la botavara y llévalo a proa por fuera de todo.',en:'Tie a line to the end of the boom and lead it forward, outside everything.',fr:'Frappe un bout en bout de bôme et mène-le vers l\'avant, par l\'extérieur de tout.'},
       s:{sc:'top',wind:168,boom:76,genoa:false,trav:false,preventer:1,halo:'boomend',pill:[{es:'Final de botavara',en:'Boom end',fr:'Bout de bôme'},'boomend',[290,200]]}},
      {t:{es:'Pásalo por una pasteca en proa y tráelo a la bañera para poder soltarlo.',en:'Run it through a block at the bow and back to the cockpit so you can release it.',fr:'Passe-le dans une poulie à l\'avant et ramène-le au cockpit pour pouvoir le larguer.'},
       s:{sc:'top',wind:168,boom:76,genoa:false,trav:false,preventer:2,halo:'block',pill:[{es:'Pasteca',en:'Block',fr:'Poulie'},'block',[290,40]]}},
      {t:{es:'Ténsala con la contra puesta. Para trasluchar, suelta primero la retenida.',en:'Tension it with the vang on. To gybe, release the preventer first.',fr:"Tends-la avec le hale-bas repris. Pour empanner, largue d'abord la retenue."},
       s:{sc:'top',wind:168,boom:76,genoa:false,trav:false,preventer:2,check:true}}],
    note:{es:'Nunca la ates a la mitad de la botavara: en una trasluchada la puede partir.',en:'Never tie it to the middle of the boom: a gybe can snap it.',fr:'Ne la frappe jamais au milieu de la bôme : un empannage peut la casser.'}
  },
  orejas:{
    title:{es:'Génova a orejas con tangón',en:'Goose-winging with a pole',fr:'Génois en ciseaux avec tangon'},
    steps:[
      {t:{es:'En popa la mayor tapa al génova y este no trabaja.',en:'Dead downwind the main blankets the genoa and it stops working.',fr:'Au vent arrière, la GV dévente le génois et il ne travaille plus.'},
       s:{sc:'top',wind:178,boom:78,trav:false,gen:24,genFlap:true,halo:'genoa',pill:[{es:'Tapado',en:'Blanketed',fr:'Déventé'},'genoa',[290,40]]}},
      {t:{es:'Arma el tangón en el palo, en el lado contrario a la mayor.',en:'Rig the pole on the mast, on the side opposite the main.',fr:'Installe le tangon sur le mât, du côté opposé à la GV.'},
       s:{sc:'top',wind:178,boom:78,trav:false,genoaSide:1,gen:80,genFlap:true,pole:true,halo:'mast',pill:[{es:'Tangón',en:'Pole',fr:'Tangon'},'mast',[300,150]]}},
      {t:{es:'Pasa la escota del génova por el extremo del tangón y abre el génova a barlovento.',en:'Lead the genoa sheet through the pole end and set the genoa to windward.',fr:"Passe l'écoute de génois dans l'embout du tangon et ouvre le génois au vent."},
       s:{sc:'top',wind:178,boom:78,trav:false,genoaSide:1,gen:80,pole:true,halo:'genoa'}},
      {t:{es:'Ajusta el tangón perpendicular al viento aparente y mantén el rumbo estable.',en:'Set the pole square to the apparent wind and keep a steady course.',fr:'Règle le tangon perpendiculaire au vent apparent et garde un cap stable.'},
       s:{sc:'top',wind:178,boom:78,trav:false,genoaSide:1,gen:80,pole:true,check:true}}],
    note:{es:'Con el tangón puesto, trasluchar es una maniobra larga: planifícala.',en:'With the pole up, gybing is a long manoeuvre: plan it.',fr:"Tangon en place, l'empannage est une longue manœuvre : prépare-le."}
  },
  ola:{
    title:{es:'Timonear con ola',en:'Steering in waves',fr:'Barrer dans la vague'},
    steps:[
      {t:{es:'Ciñendo: al encarar la ola, orza un poco para pasarla de proa.',en:'Upwind: as you meet the wave, head up a little to take it on the bow.',fr:"Au près : en attaquant la vague, lofe un peu pour la passer par l'étrave."},
       s:{sc:'wave',crest:210,bx:140,pill:[{es:'Orza al subir',en:'Head up going up',fr:'Lofe à la montée'},[96,36]]}},
      {t:{es:'Al bajarla, cae para recuperar velocidad.',en:'Going down it, bear away to pick up speed.',fr:'En la descendant, abats pour reprendre de la vitesse.'},
       s:{sc:'wave',crest:130,bx:210,pill:[{es:'Cae al bajar',en:'Bear away going down',fr:'Abats à la descente'},[110,36]]}},
      {t:{es:'En popa la ola te levanta la popa. Corrige pronto y poco.',en:'Downwind the wave lifts the stern. Correct early and small.',fr:"Au portant la vague soulève l'arrière. Corrige tôt et peu."},
       s:{sc:'wave',crest:110,bx:186,arrows:[[30,120,0,50]],pill:[{es:'Ola por popa',en:'Following sea',fr:'Mer de l\'arrière'},[270,36]]}},
      {t:{es:'Deja que la popa siga a la ola y no te pongas justo en popa: riesgo de trasluchar.',en:"Let the stern follow the wave and don't go dead downwind: risk of gybing.",fr:"Laisse l'arrière suivre la vague et ne te mets pas plein vent arrière : risque d'empannage."},
       s:{sc:'wave',crest:150,bx:228,arrows:[[30,120,0,50]]}}]
  },
  cabo_baluma:{
    title:{es:'Cabo de baluma',en:'Leech line',fr:'Hale-bas de chute'},
    steps:[
      {t:{es:'La baluma vibra o hace ruido: el borde de salida flamea.',en:'The leech vibrates or buzzes: the trailing edge is fluttering.',fr:'La chute vibre ou bat : le bord de fuite faseye.'},
       s:{sc:'main',flutter:true,halo:'leech',haloR:24,pill:['Baluma','leech',[300,60]]}},
      {t:{es:'Tensa el cabo de baluma. Suele salir por el puño o por la botavara.',en:'Tighten the leech line. It usually comes out at the clew or on the boom.',fr:"Reprends le hale-bas de chute. Il sort souvent au point d'écoute ou sur la bôme."},
       s:{sc:'main',flutter:true,halo:'clew',pill:[{es:'Cabo de baluma',en:'Leech line',fr:'Hale-bas de chute'},'clew',[130,40]]}},
      {t:{es:'Para justo cuando deja de vibrar.',en:'Stop as soon as it stops vibrating.',fr:'Arrête-toi dès que ça ne vibre plus.'},s:{sc:'main',lk:2,check:true}},
      {t:{es:'Si te pasas, la baluma hace gancho hacia barlovento y frena: afloja.',en:'Overdo it and the leech hooks to windward and slows you down: ease it.',fr:'Trop repris, la chute crochète au vent et freine : choque.'},
       s:{sc:'main',hook:true,lk:-12,halo:'leech',haloR:24,pill:[{es:'Gancho',en:'Hook',fr:'Crochet'},'leech',[300,60]]}}]
  },
  escora:{
    title:{es:'Escora y peso de la tripulación',en:'Heel and crew weight',fr:"Gîte et poids de l'équipage"},
    steps:[
      {t:{es:'Con poco viento, el barco plano no transmite sensación en el timón.',en:'In light air a flat boat gives no feel on the helm.',fr:'Dans le petit temps, un bateau à plat ne donne pas de sensations à la barre.'},
       s:{sc:'heel',heel:0,crew:[-36,-50],wind:true,pill:[{es:'Plano',en:'Flat',fr:'À plat'},[290,44]]}},
      {t:{es:'Pasa la tripulación a sotavento: algo de escora da forma a las velas y un poco de timón.',en:'Move the crew to leeward: a little heel shapes the sails and gives some helm.',fr:"Fais passer l'équipage sous le vent : un peu de gîte donne forme aux voiles et un peu de barre."},
       s:{sc:'heel',heel:7,crew:[34,48],wind:true,check:true}},
      {t:{es:'Con viento, al revés: todos a barlovento para frenar la escora.',en:'In a breeze, the opposite: everyone to windward to limit heel.',fr:"Dans la brise, l'inverse : tout le monde au vent pour limiter la gîte."},
       s:{sc:'heel',heel:15,crew:[-40,-54],wind:true,pill:[{es:'Barlovento',en:'Windward',fr:'Au vent'},[290,44]]}}]
  },
  pairo:{
    title:{es:'Ponerse al pairo',en:'Heaving to',fr:'Se mettre à la cape'},
    steps:[
      {t:{es:'Desde ceñida, vira sin soltar la escota del génova.',en:'From close-hauled, tack without releasing the genoa sheet.',fr:"Depuis le près, vire sans larguer l'écoute de génois."},
       s:{sc:'top',wind:40,turn:1,pill:[{es:'Vira',en:'Tack',fr:'Vire'},null,[96,40]]}},
      {t:{es:'El génova queda a la contra, en el lado de barlovento.',en:'The genoa ends up backed, on the windward side.',fr:'Le génois se retrouve à contre, du côté au vent.'},
       s:{sc:'top',wind:-40,side:1,genoaSide:-1,gen:16,boomSide:1,boom:12,halo:'genoa',pill:[{es:'A la contra',en:'Backed',fr:'À contre'},'genoa',[70,200]]}},
      {t:{es:'Pon la caña a sotavento (la rueda a barlovento) y fíjala. Mayor algo largada.',en:'Put the tiller to leeward (wheel to windward) and lash it. Main slightly eased.',fr:'Mets la barre franche sous le vent (la roue au vent) et bloque-la. GV un peu choquée.'},
       s:{sc:'top',wind:-40,side:1,genoaSide:-1,gen:16,boomSide:1,boom:24,rudder:-28,halo:'rudder',pill:[{es:'Timón',en:'Rudder',fr:'Safran'},'rudder',[290,206]]}},
      {t:{es:'El barco queda casi parado, derivando despacio y estable. Sirve para descansar, rizar o revisar.',en:'The boat lies almost still, drifting slowly and steadily. Good for resting, reefing or checking things.',fr:'Le bateau reste presque arrêté, dérivant lentement et stable. Utile pour se reposer, prendre un ris ou vérifier.'},
       s:{sc:'top',wind:-40,side:1,genoaSide:-1,gen:16,boomSide:1,boom:24,rudder:-28,arrows:[[262,150,60,46]]}}],
    note:{es:'Practícalo con buen tiempo: cada barco se pone al pairo de forma algo distinta.',en:'Practise in good weather: every boat heaves to a little differently.',fr:'Entraîne-toi par beau temps : chaque bateau se met à la cape un peu différemment.'}
  }
};
const HOW_BY_STEP={
  'Retrasa el escotero del génova':'escotero','Adelanta el escotero del génova':'escotero','Escotero del génova algo atrás':'escotero','Adelanta el escotero':'escotero',
  'Si el alto rompe antes que el bajo: escotero adelante':'escotero','Si el bajo rompe antes que el alto: escotero atrás':'escotero',
  'Ve fino en las rachas':'timon_rachas','Cae en las rachas':'timon_rachas',
  'Caza el tensor del estay de popa':'backstay','Suelta el tensor del estay de popa':'backstay',
  'Tensa el cunningham':'cunningham','Tensa la driza de mayor':'cunningham','Suelta el cunningham':'cunningham','Afloja un poco la driza':'cunningham',
  'Caza el pujamen a tope':'pujamen','Suelta algo el pujamen':'pujamen','Aplana la mayor':'pujamen','Más bolsa':'pujamen',
  'Baja el carro a sotavento':'carro','Carro a sotavento del todo':'carro','Carro a barlovento, escota algo suelta':'carro','Más mayor':'carro',
  'Larga escota en las rachas con la contra tensa':'contra','Larga la contra en las rachas':'contra','Contra tensa (moderada)':'contra',
  'Deja flamear el grátil de la mayor en rachas':'escota_mayor','Larga escota de mayor en la racha':'escota_mayor','No largues la mayor contra los obenques':'escota_mayor',
  'Larga hasta que flamee y caza un poco':'escota_mayor','Abre la baluma (twist)':'escota_mayor','Revisa la escota':'escota_mayor',
  'Pon una retenida en la botavara':'retenida','Timonea con la ola':'ola','Orza en la subida, cae en la bajada':'ola',
  'Génova a orejas con tangón':'orejas','Enrolla el génova':'enrollador','Menos génova si va entero y la mayor rizada':'enrollador',
  'Abre 5° el rumbo':'rumbo','Quita rizos y desenrolla':'rizo','Escora ligera con poco viento':'escora',
  'Cae un poco o caza la escota':'escota_genova','Orza un poco o larga la escota':'escota_genova','Objetivo: los dos horizontales':'escota_genova',
  'Tensa el cabo de baluma':'cabo_baluma'
};
