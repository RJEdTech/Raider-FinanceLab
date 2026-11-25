/* Start at 22 or 32? Story version (pilot, Nov 2026). Needs story/kit.js.
   One deposit: end = start × (1 + r)^t.
   The race: one deposit of D = 12 × monthly at the END of each year. Sam deposits at ages 23..stop, Alex at stop+1..67.
   A deposit made at age a is worth D × (1 + r)^(67 − a) at 67. Same model as sims/startearly.js. */
(function(){
'use strict';
const {$,$c,money,clamp,lerp,ease,lin,esc,el,n1,rect,text,line,tag,ticks,person}=Story.h,tw=Story.tw;
const RA=0.07,GA=1.07;
const DEF={view:'H',fbar:null,
 xmax:3,ymaxA:132,yrs:0,xk:-1,xp:0,lens:0,legend:0,dbl:0,alex:0,alexYrs:0,hl:null,cur:null,scrub:0,guessOn:0,
 plan:0,now:22,ymaxB:12000,env:0,annot:0,board:0,towers:0,stack:0,tb:0,tmax:400000,sel:null,r:7,stop:32,mo:200};

/* ---------- the race model ---------- */
function modelB(s){const D=12*s.mo,G=1+s.r/100,cols=[];let sam=0,alex=0,nS=0,nA=0;
 for(let a=23;a<=67;a++){const own=a<=s.stop?'S':'A',live=s.now>=a,v=live?D*Math.pow(G,s.now-a):0;cols.push({a,own,v,live});if(own==='S'){sam+=v;if(live)nS++;}else{alex+=v;if(live)nA++;}}
 return {D,G,cols,sam,alex,putS:D*nS,putA:D*nA};}
const fitY=M=>Math.max.apply(null,M.cols.map(c=>c.v))*1.16;
const fitT=M=>Math.max(M.sam,M.alex)*1.12;

/* ---------- view H: the question ---------- */
function drawH(s,W,H,k){const gut=Story.gut;
 const L=118*k,R=96*k,x0=L,x1=W-R,AX=a=>x0+(x1-x0)*(a-22)/45;
 const rowH=clamp(H*0.15,34,66),yS=H*0.24,yA=H*0.52,yAx=H*0.84;let o='';
 o+=text('Same job at 22. Same $200 a month. Same 7% growth a year.',W/2,H*0.115,{a:'middle',s:17*k,w:700});
 o+=line(x0,yAx,x1,yAx,'var(--axis)',{w:1.5});
 [22,32,42,52,67].forEach(a=>{o+=line(AX(a),yAx-5,AX(a),yAx+5,'var(--axis)',{w:1.5});o+=text(a===22?'age 22':String(a),AX(a),yAx+22*k,{a:'middle',s:13.5*k,c:'var(--muted)',w:a===32?700:500});});
 o+=line(AX(32),yS-10,AX(32),yAx,'var(--axis)',{dash:'3 5'});
 const row=(y,name,col,a0,a1,inside,under,idleTxt,idleMid,key)=>{
  const pick=gut===key||gut==='tie';
  o+=rect(AX(22),y+rowH*0.36,AX(67)-AX(22),rowH*0.28,'var(--track)',{rx:5});
  o+=rect(AX(a0),y,AX(a1)-AX(a0),rowH,col,{rx:7});
  o+=person(x0-64*k,y+rowH/2-2*k,col,k)+text(name,x0-64*k,y+rowH/2+32*k,{a:'middle',w:700,s:15*k});
  const bw=AX(a1)-AX(a0);
  if(bw>inside.length*8.2*k+10)o+=text(inside,AX(a0)+bw/2,y+rowH/2+5*k,{a:'middle',s:14.5*k,w:700,c:'#fff'});
  o+=text(under,AX(a0)+2,y+rowH+19*k,{s:14*k,w:700,c:col});
  o+=text(idleTxt,AX(idleMid),y+rowH*0.36-7*k,{a:'middle',s:13*k,c:'var(--muted)'});
  o+=rect(x1+16*k,y+rowH/2-22*k,58*k,44*k,'var(--card)',{rx:9,stroke:pick?'var(--hl)':col,sw:pick?3:2})+text('?',x1+45*k,y+rowH/2+9*k,{a:'middle',s:24*k,w:800,c:col});
  if(pick&&gut!=='tie')o+=tag('your pick',x1+45*k,y+rowH/2-30*k,{a:'middle',s:12*k,c:'var(--hl)',bc:'var(--hl)'});
 };
 row(yS,'Sam','var(--sam)',22,32,'saves 10 years','puts in $24,000, then stops','adds nothing for 35 years',49.5,'early');
 row(yA,'Alex','var(--alex)',32,67,'saves 35 years, puts in $84,000','','waits',27,'late');
 o+=text('at 67',x1+45*k,yS-12*k,{a:'middle',s:13*k,c:'var(--muted)',w:700});
 if(gut==='tie')o+=tag('your pick: about the same',x1+74*k,yA+rowH+30*k,{a:'end',s:12*k,c:'var(--hl)',bc:'var(--hl)'});
 return o;}

/* ---------- view A: one deposit ---------- */
const B1=i=>100*Math.pow(GA,i);
function drawA(s,W,H,k){
 const L=66*k,R=22,T=26*k,Bm=60*k,pw=W-L-R,ph=H-T-Bm,y0=H-Bm;
 const sw=pw/(s.xmax+1),cw=Math.min(sw*0.72,132),colW=lerp(cw,cw*0.47,s.alex),big=sw>=72&&s.alex<0.01;
 const X=i=>L+i*sw+(sw-cw)/2,XC=t=>L+t*sw+sw/2,Y=v=>y0-v/s.ymaxA*ph;
 const n=Math.floor(s.yrs+1e-6),frac=s.yrs-n,one=s.fbar==='one',c=s.cur==null?Math.min(n,45):s.cur;
 let o='';
 ticks(s.ymaxA,5).forEach(v=>{if(v>0)o+=line(L,Y(v),W-R,Y(v),'var(--grid)');o+=text($(v),L-8,Y(v)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});});
 for(let i=0;i<=Math.ceil(s.xmax-0.01);i++){if(!(s.xmax<=12.5||i%5===0||i===45))continue;o+=text((i===0?'age ':'')+(22+i),XC(i),y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)',w:500});}
 const parts=i=>{if(i<=n)return{flat:7*i,comp:B1(i)-100-7*i};const pb=B1(n);return{flat:7*n+7*frac,comp:(pb-100-7*n)+frac*RA*(pb-100)};};
 const focus=s.hl==='start'?0:(s.hl&&s.hl!=='t'?c:-1);
 const maxI=frac>0.001?n+1:n;
 for(let i=0;i<=maxI;i++){
  if(s.xk>=0&&i===s.xk+1)continue;
  const p=parts(i),x=X(i),ySeed=Y(100),yFlat=Y(100+p.flat),yTop=Y(100+p.flat+p.comp);
  const dim=(focus>=0&&i!==focus)?0.3:(s.dbl>0.01&&!s.hl&&s.alex<0.5?lerp(1,0.72,s.dbl):1);
  o+='<g'+(dim<1?' style="opacity:'+dim.toFixed(2)+'"':'')+'>'+rect(x,ySeed,colW,y0-ySeed,'var(--seed)')+rect(x,yFlat,colW,ySeed-yFlat,'var(--flat)')+rect(x,yTop,colW,yFlat-yTop,'var(--comp)')+'</g>';
  if(big&&i<=n){
   if(y0-ySeed>20*k)o+=text('$100',x+colW/2,(y0+ySeed)/2+5*k,{a:'middle',s:14*k,w:700,c:'var(--stage)'});
   if(ySeed-yFlat>17*k)o+=text($(p.flat),x+colW/2,(ySeed+yFlat)/2+5*k,{a:'middle',s:13*k,w:700,c:'#2b2100'});
   if(yFlat-yTop>17*k)o+=text(money(p.comp),x+colW/2,(yFlat+yTop)/2+5*k,{a:'middle',s:13*k,w:700,c:'#fff'});
   o+=text(money(100+p.flat+p.comp),x+colW/2,yTop-8*k,{a:'middle',s:(sw>130?17:13.5)*k,w:800});
  }
 }
 /* the yearly transfer: 7% of every band lifts off and lands on next year's pile */
 if(s.xk>=0){
  const i=s.xk,p=parts(i),Bi=100+p.flat+p.comp,g=Bi-100,xs=X(i),xd=X(i+1),q=s.xp;
  const a1=clamp(q/0.2,0,1),mv=ease(clamp((q-0.42)/0.5,0,1)),hop=Math.sin(Math.PI*mv)*34;
  o+='<g style="opacity:'+a1.toFixed(2)+'">'+rect(xd,Y(100),colW,y0-Y(100),'var(--seed)')+rect(xd,Y(100+p.flat),colW,Y(100)-Y(100+p.flat),'var(--flat)')+rect(xd,Y(Bi+7*mv),colW,Y(100+p.flat)-Y(Bi),'var(--comp)')+'</g>';
  if(q<0.5)o+=text('keeps what it had',xd+colW/2,Y(Bi)-12*k,{a:'middle',s:13*k,c:'var(--muted)',w:600,op:a1*clamp((0.5-q)/0.08,0,1)});
  if(q>0.14){
   const pulse=q<0.42?0.55+0.45*Math.abs(Math.sin(q*24)):1;
   const fh=Y(0)-Y(7),fx=lerp(xs,xd,mv),fy=lerp(Y(100),Y(100+p.flat+7),mv)-hop;
   o+=rect(fx,fy,colW,fh,'var(--flat)',{stroke:'var(--hl)',sw:2.5,op:pulse});
   if(fh>15*k)o+=text(mv>0.02?'+$7':'7% of $100',fx+colW/2,fy+fh/2+4.5*k,{a:'middle',s:12.5*k,w:800,c:'#2b2100'});
   else o+=text('+$7',fx+colW/2,fy-6*k,{a:'middle',s:12.5*k,w:800,c:'var(--hl)',halo:1});
   if(g>0.001){const ch=Math.max(2.2,Y(0)-Y(RA*g)),cy=lerp(Y(Bi),Y(Bi*GA),mv)-hop;
    o+=rect(fx,cy,colW,ch,'var(--comp)',{stroke:'var(--hl)',sw:2,op:pulse});
    o+=text((mv>0.02?'+':'7% of the $'+Math.round(g)+' slice = ')+money(RA*g),fx+colW/2,cy-8*k,{a:'middle',s:12.5*k,w:800,c:'var(--hl)',halo:1});}
  }
 }
 o+=line(L,y0,W-R,y0,'var(--axis)',{w:1.5});
 /* up-close view of year two's slice */
 if(s.lens>0.01){
  const lx=X(2)+colW+26,lw=W-R-lx,ly=T+8,short=lw<230,lh=Math.min(short?150:176,ph*0.62)*1,op=s.lens;
  if(lw>90){
   const bx=lx+12,bw=short?lw-24:92,by=ly+lh-14,sl=Math.min(88,lh*0.5),gl=Math.max(6,sl*0.07);
   o+='<g style="opacity:'+op.toFixed(2)+'">';
   o+=line(X(2)+colW+2,Y(B1(2)),lx,ly+26,'var(--hl)',{dash:'3 4'})+line(X(2)+colW+2,Y(107),lx,ly+lh,'var(--hl)',{dash:'3 4'});
   o+=rect(lx,ly,lw,lh,'var(--card)',{rx:10,stroke:'var(--hl)',sw:2});
   if(!short)o+=text('This year\'s new slice, up close',lx+12,ly+20*k,{s:12.5*k,w:700,c:'var(--hl)'});
   o+=rect(bx,by-22,bw,22,'var(--seed)',{op:0.5})+rect(bx,by-22-sl,bw,sl,'var(--flat)')+rect(bx,by-22-sl-gl,bw,gl,'var(--comp)',{stroke:'var(--hl)',sw:1.5});
   if(!short){
    o+=text('49¢',bx+bw+12,by-22-sl-gl+3,{s:16*k,w:800,c:'var(--comp)'})+text('7% of last year\'s $7',bx+bw+12,by-22-sl-gl+19*k,{s:12.5*k,c:'var(--muted)'});
    o+=text('$7',bx+bw+12,by-22-sl/2+14*k,{s:16*k,w:800,c:'var(--flat)'})+text('7% of the first $100',bx+bw+12,by-22-sl/2+30*k,{s:12.5*k,c:'var(--muted)'});
   }else{o+=text('49¢',bx+bw/2,by-22-sl-gl-6,{a:'middle',s:13*k,w:800,c:'var(--comp)'})+text('$7',bx+bw/2,by-22-sl/2+5,{a:'middle',s:13*k,w:800,c:'#2b2100'});}
   o+='</g>';
  }
 }
 /* live legend */
 if(s.legend>0.01){
  const t=s.cur!=null&&one?s.cur:s.yrs,bal=100*Math.pow(GA,t),fl=7*t,cp=bal-100-fl,lw=Math.min(318*k,pw*0.62),lx=L+12,ly=T+2,rh=21*k;
  o+='<g style="opacity:'+s.legend.toFixed(2)+'">'+rect(lx,ly,lw,rh*4+16,'var(--card)',{rx:10,stroke:'var(--line)',sw:1,op:0.94});
  [['var(--comp)','growth on growth',cp],['var(--flat)','$7 a year from the first $100',fl],['var(--seed)','the $100 Sam put in',100]].forEach((r,j)=>{const y=ly+12+rh*j;
   o+=rect(lx+10,y,13*k,13*k,r[0],{rx:3})+text(r[1],lx+16+13*k,y+11.5*k,{s:13*k,w:600})+text($(r[2]),lx+lw-10,y+11.5*k,{a:'end',s:13.5*k,w:800});});
  o+=line(lx+10,ly+10+rh*3,lx+lw-10,ly+10+rh*3,'var(--line)')+text('at age '+Math.floor(22+t+1e-6),lx+10,ly+10+rh*3+16*k,{s:13*k,c:'var(--muted)',w:600})+text($(bal),lx+lw-10,ly+10+rh*3+17*k,{a:'end',s:15.5*k,w:800});
  o+='</g>';
 }
 /* doublings */
 if(s.dbl>0.01){
  let d='';for(let t=0;t<=n+frac+1e-6;t+=0.5)d+=(t?'L':'M')+n1(XC(t))+' '+n1(Y(100*Math.pow(GA,t)));
  o+='<path d="'+d+'" style="fill:none;stroke:var(--fg);stroke-width:2;opacity:'+(0.75*clamp(s.dbl*3,0,1)).toFixed(2)+'"/>';
  for(let m=1;m<=4;m++){const a=clamp(s.dbl*4-(m-1),0,1);if(a<=0)continue;const t=m*Math.log(2)/Math.log(GA),v=100*Math.pow(2,m),x=XC(t),y=Y(v);
   o+=line(L,y,x,y,'var(--hl)',{dash:'5 5',op:a*0.8})+line(x,y,x,y0,'var(--hl)',{dash:'2 5',op:a*0.6})+'<circle cx="'+n1(x)+'" cy="'+n1(y)+'" r="'+n1(5*k)+'" style="fill:var(--hl);opacity:'+a.toFixed(2)+'"/>';
   if(s.alex<0.5)o+=text($(v)+' at '+Math.round(22+t)+'  (+'+$(v/2)+')',x-10*k,y-7*k,{a:'end',s:13.5*k,w:800,c:'var(--hl)',halo:1,op:a});}
 }
 /* Alex's same $100, ten years late */
 if(s.alex>0.01){
  const na=Math.floor(s.alexYrs+1e-6),fa=s.alexYrs-na,ax=cw*0.53;
  for(let j=0;j<=na+(fa>0.001?1:0);j++){const i=10+j;if(i>45)break;const v=j<=na?100*Math.pow(GA,j):100*Math.pow(GA,na)*(1+RA*fa);
   o+='<g style="opacity:'+s.alex.toFixed(2)+'">'+rect(X(i)+ax,Y(100),colW,y0-Y(100),'var(--seed)')+rect(X(i)+ax,Y(v),colW,Y(100)-Y(v),'var(--alex)')+'</g>';}
  o+=tag('Sam: in at 22, t = 45  →  '+$(B1(45)),X(45)+cw,Y(B1(45))-10*k,{a:'end',s:13.5*k,c:'var(--sam)',bc:'var(--sam)',bw:2,op:s.alex});
  if(s.alexYrs>=34.99){const yA=Y(B1(35)),yS=Y(B1(45)),bx=W-R+9;
   o+=line(X(35),yA,bx,yA,'var(--alex)',{dash:'5 4',w:1.5})+'<circle cx="'+n1(X(35)+colW/2)+'" cy="'+n1(yA)+'" r="'+n1(5*k)+'" style="fill:var(--sam);stroke:var(--stage);stroke-width:2"/>';
   o+=tag('Alex at 67 = Sam at 57: '+$(B1(35)),X(35)-10,yA+5*k,{a:'end',s:13.5*k,c:'var(--alex)',bc:'var(--alex)',bw:2});
   o+=line(bx,yA,bx,yS,'var(--hl)',{w:3})+line(bx-6,yA,bx+6,yA,'var(--hl)',{w:3})+line(bx-6,yS,bx+6,yS,'var(--hl)',{w:3});
   o+=tag('Sam\'s last 10 years: +'+$(B1(45)-B1(35)),X(41)+cw,Y(1760),{a:'end',s:13.5*k,c:'var(--hl)',bc:'var(--hl)',bw:2});}
  o+=tag('Alex puts $100 in here',XC(10),y0+44*k,{a:'middle',s:12.5*k,c:'var(--alex)',bc:'var(--alex)',op:s.alex})+line(XC(10),y0+24*k,XC(10),y0+2,'var(--alex)',{w:2,op:s.alex});
 }
 /* the student's guess for age 67 */
 if(s.guessOn>0.01&&Story.mem.g67!=null){const gy=Y(Story.mem.g67);o+=line(XC(36),gy,W-R,gy,'var(--hl)',{w:2.5,dash:'7 5',op:s.guessOn})+tag('your guess at 67: '+$(Story.mem.g67),XC(36)-8,gy+5*k,{a:'end',s:13.5*k,c:'var(--hl)',bc:'var(--hl)',bw:2,op:s.guessOn});}
 /* the clock: drag it to run the years */
 if(s.scrub>0.01){const x=XC(s.yrs),hy=y0+34*k;o+=line(x,T,x,y0+20*k,'var(--hl)',{w:2,op:0.55})+rect(x-34*k,hy-13*k,68*k,26*k,'var(--hl)',{rx:13*k})+text('age '+Math.floor(22+s.yrs+1e-6),x,hy+5*k,{a:'middle',s:13.5*k,w:800,c:'#fff'});
  if(s.yrs<Math.round(s.xmax)-0.01)o+=text('drag  →',x+42*k,hy+5*k,{s:13.5*k,w:800,c:'var(--hl)'});
  o+='<rect class="drag" x="'+n1(L)+'" y="'+n1(T)+'" width="'+n1(pw)+'" height="'+n1(ph+56*k)+'" style="fill:transparent"/>';}
 /* formula ↔ picture links */
 if(one){
  const x=X(c),yb=Y(B1(c));
  if(s.hl==='start'){o+=rect(X(0)-4,Y(100)-4,colW+8,y0-Y(100)+8,'none',{stroke:'var(--hl)',sw:3,rx:4});o+=tag('start: the $100 Sam put in at 22',X(0)+colW+12,Y(100)-16*k,{s:13.5*k,c:'var(--hl)',bc:'var(--hl)',bw:2});}
  if(s.hl==='one'&&c>=1){o+=rect(x-3,Y(B1(c-1)),colW+6,y0-Y(B1(c-1))+3,'none',{stroke:'var(--hl)',sw:3,rx:3});o+=tag('× 1: keep all of last year\'s pile, '+$(B1(c-1)),x-12,(Y(B1(c-1))+y0)/2,{a:'end',s:13.5*k,c:'var(--hl)',bc:'var(--hl)',bw:2});}
  if(s.hl==='r'&&c>=1){const h=Math.max(4,Y(B1(c-1))-yb);o+=rect(x-3,yb-3,colW+6,h+3,'none',{stroke:'var(--hl)',sw:3,rx:3});o+=tag('× 0.07: this year\'s new slice, '+money(B1(c)-B1(c-1)),x-12,yb+h/2+4*k,{a:'end',s:13.5*k,c:'var(--hl)',bc:'var(--hl)',bw:2});}
  if(s.hl==='end'){o+=rect(x-4,yb-4,colW+8,y0-yb+8,'none',{stroke:'var(--hl)',sw:3,rx:4});}
  if(s.hl==='t'||s.hl==='end'||!s.hl){const by=y0+30*k;if(s.hl==='t'&&c>=1){o+=line(XC(0),by,XC(c),by,'var(--hl)',{w:3})+line(XC(0),by-6,XC(0),by+6,'var(--hl)',{w:3})+line(XC(c),by-6,XC(c),by+6,'var(--hl)',{w:3});
    o+=tag('t = '+c+' year'+(c===1?'':'s')+' of waiting',(XC(0)+XC(c))/2,by+24*k,{a:'middle',s:13.5*k,c:'var(--hl)',bc:'var(--hl)',bw:2});}
   o+=tag($(B1(c))+' at '+(22+c),c>38?x+colW:x+colW/2,yb-10*k,{a:c>38?'end':'middle',s:14*k,c:s.hl?'var(--hl)':'var(--fg)',bc:s.hl?'var(--hl)':'var(--line)',bw:s.hl?2:1});
   o+='<path d="M'+n1(XC(c)-6*k)+' '+n1(y0+9*k)+' l'+n1(6*k)+' '+n1(-8*k)+' l'+n1(6*k)+' '+n1(8*k)+' z" style="fill:var(--hl)"/>';}
  for(let i=0;i<=45;i++)o+='<rect class="hit" data-i="'+i+'" x="'+n1(L+i*sw)+'" y="'+n1(T)+'" width="'+n1(sw)+'" height="'+n1(ph+22*k)+'" style="fill:transparent"/>';
 }
 return o;}

/* ---------- view B: the race ---------- */
function drawB(s,W,H,k){
 const narrow=W<700,RP=narrow?0:210,L=66*k,T=(narrow?94:54)*k,Bm=lerp(30,62,s.annot)*k,PR=narrow?W-14:W-RP-12,pw=PR-L,ph=H-T-Bm,y0=H-Bm,sw=pw/45,cw=sw*0.8;
 const X=a=>L+(a-23)*sw+(sw-cw)/2,XC=a=>L+(a-23)*sw+sw/2,Y=v=>y0-v/s.ymaxB*ph;
 const M=modelB(s),D=M.D,xb=L+(s.stop-22)*sw,done=s.now>=66.99,G=Story.gh,gop=G?G.op:0,GH=G?G.d:null;let o='';
 o+=rect(L,T,xb-L,ph,'var(--sam-tint)')+rect(xb,T,PR-xb,ph,'var(--alex-tint)');
 ticks(s.ymaxB,4).forEach(v=>{if(v>0)o+=line(L,Y(v),PR,Y(v),'var(--grid)');o+=text($(v),L-8,Y(v)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});});
 o+=text('age 22',L,y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)'});
 for(let a=27;a<=67;a+=5){if(Math.abs(a-s.stop)<3)continue;o+=text(String(a),XC(a)+sw/2,y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)'});}
 o+=text(String(s.stop),xb,y0+18*k,{a:'middle',s:13.5*k,w:800})+line(xb,T,xb,y0,'var(--axis)',{dash:'3 5'});
 /* status chips */
 const samTxt=s.now<=22.01?(narrow?'Sam: 10 deposits':'Sam: '+(s.stop-22)+' deposits = '+$(D*(s.stop-22))):s.now<s.stop?(narrow?'Sam · saving':'Sam · saving '+$(D)+' a year'):(narrow?'Sam · stopped':'Sam · stopped at '+s.stop+'. Adds nothing.');
 const alexTxt=s.now<=22.01?(narrow?'Alex: 35 deposits':'Alex: '+(67-s.stop)+' deposits = '+$(D*(67-s.stop))):s.now<s.stop?(narrow?'Alex · waiting':'Alex · not saving yet'):done?(narrow?'Alex · saved to 67':'Alex · saved every year to 67'):(narrow?'Alex · saving':'Alex · saving '+$(D)+' a year');
 if(!(narrow&&s.board>0.5)){const cy=narrow?24*k:T-17*k;o+='<circle cx="'+n1(L+7*k)+'" cy="'+n1(cy-5*k)+'" r="'+n1(6*k)+'" style="fill:var(--sam)"/>'+text(samTxt,L+19*k,cy,{s:14.5*k,w:700,c:'var(--sam)'});
  o+=text(alexTxt,PR-19*k,cy,{a:'end',s:14.5*k,w:700,c:'var(--alex)'})+'<circle cx="'+n1(PR-7*k)+'" cy="'+n1(cy-5*k)+'" r="'+n1(6*k)+'" style="fill:var(--alex)"/>';}
 /* the plan: one empty box per yearly deposit */
 if(s.plan>0.01)M.cols.forEach(c=>{const col=c.own==='S'?'var(--sam)':'var(--alex)';o+=rect(X(c.a),Y(D),cw,y0-Y(D),'var(--card)',{stroke:col,sw:1.5,op:s.plan});});
 if(s.plan>0.9&&s.now<=22.01)o+=line(XC(23),Y(D)-4,XC(23),Y(D)-26*k,'var(--fg)',{w:1.5})+tag('one box = one year = '+$(D),XC(23)-10,Y(D)-30*k,{s:13.5*k});
 /* ghost of the picture before the last change */
 if(GH&&gop>0){let d='';GH.vals.forEach((v,j)=>{const a=23+j,x=L+(a-23)*sw,y=Y(v);d+=(j?'L':'M')+n1(x)+' '+n1(y)+'L'+n1(x+sw)+' '+n1(y);});
  o+='<path d="'+d+'" style="fill:none;stroke:var(--fg);stroke-width:2;stroke-dasharray:5 4;opacity:'+(0.7*gop).toFixed(2)+'"/>';
  o+=text('before',L+8,Y(GH.vals[0])-8*k,{s:12.5*k,w:700,halo:1,op:gop});}
 /* columns: dark base = money put in, color = growth */
 M.cols.forEach(c=>{const col=c.own==='S'?'var(--sam)':'var(--alex)';
  if(!c.live){const pre=(s.now-(c.a-0.6))/0.6;if(pre>0&&pre<1)o+=rect(X(c.a),lerp(T-6,Y(D),pre*pre),cw,y0-Y(D),'var(--seed)',{op:0.35+0.65*pre});return;}
  const yt=Y(c.v),yb=Y(D);o+=rect(X(c.a),yt,cw,yb-yt+0.5,col)+rect(X(c.a),yb,cw,y0-yb,'var(--seed)');});
 o+=line(L,y0,PR,y0,'var(--axis)',{w:1.5});
 if(s.now>22.01&&!done){const xn=L+(s.now-22)*sw;o+=line(xn,T,xn,y0,'var(--hl)',{w:1.5,op:0.6});o+=tag('age '+Math.floor(s.now),xn,T+16*k,{a:xn>PR-70?'end':'middle',s:13*k,c:'var(--hl)',bc:'var(--hl)'});}
 /* the curve every deposit follows */
 if(s.env>0.01){let d='';for(let a=22.6;a<=67.4;a+=0.4)d+=(d?'L':'M')+n1(L+(a-22.5)*sw)+' '+n1(Y(D*Math.pow(M.G,67-a)));
  o+='<path d="'+d+'" style="fill:none;stroke:var(--fg);stroke-width:1.6;stroke-dasharray:2 4;opacity:'+(0.8*s.env).toFixed(2)+'"/>';}
 if(s.annot>0.01){const op=s.annot,by=y0+32*k,br=(a0,a1,txt,col)=>line(X(a0),by,X(a1)+cw,by,col,{w:3,op})+line(X(a0),by-5,X(a0),by+5,col,{w:3,op})+line(X(a1)+cw,by-5,X(a1)+cw,by+5,col,{w:3,op})+text(txt,(X(a0)+X(a1)+cw)/2,by+19*k,{a:'middle',s:13.5*k,w:800,c:col,op});
  o+=br(23,s.stop,narrow?'10':'width: 10 deposits','var(--sam)')+br(s.stop+1,67,'width: 35 deposits','var(--alex)');
  const g=M.G,call=(a,txt,anch,dx)=>{const v=D*Math.pow(g,67-a);return line(XC(a),Y(v)-3,XC(a),Y(v)-16*k,'var(--fg)',{w:1.5,op})+tag(txt,XC(a)+dx,Y(v)-20*k,{a:anch,s:13*k,op});};
  o+=call(23,'waited 44 years: × '+Math.pow(g,44).toFixed(1),'start',-8)+(narrow?'':call(s.stop+1,'waited 34 years: × '+Math.pow(g,34).toFixed(1),'start',-8))+call(67,'waited 0 years: × 1','end',10);
  const kx=XC(51),ky=T+ph*0.34;
  if(!narrow)o+='<g style="opacity:'+op.toFixed(2)+'">'+rect(kx,ky,13*k,13*k,'var(--alex)',{rx:3})+rect(kx+15*k,ky,13*k,13*k,'var(--sam)',{rx:3})+text('color = growth',kx+34*k,ky+11.5*k,{s:13.5*k,w:700})+rect(kx,ky+20*k,28*k,13*k,'var(--seed)',{rx:3})+text('gray strip = money they put in',kx+34*k,ky+31.5*k,{s:13.5*k,w:700})+'</g>';}
 /* selected column */
 if(s.sel!=null){const c=M.cols[s.sel-23];if(c&&c.live){const yt=Y(c.v);o+=rect(X(c.a)-3,yt-3,cw+6,y0-yt+6,'none',{stroke:'var(--hl)',sw:3,rx:3});
   o+=tag('in at '+c.a+' · waited '+(67-c.a)+' · '+$(c.v),clamp(XC(c.a),L+120*k,PR-120*k),Math.max(T+34*k,yt-12*k),{a:'middle',s:13.5*k,c:'var(--hl)',bc:'var(--hl)',bw:2});}}
 /* scoreboard and towers */
 if(narrow){
  if(s.board>0.5){o+=text('Sam '+$(M.sam),L,22*k,{s:15.5*k,w:800,c:'var(--sam)'})+text('Alex '+$(M.alex),PR,22*k,{a:'end',s:15.5*k,w:800,c:'var(--alex)'});
   o+=text('put in '+$(M.putS),L,38*k,{s:12*k,c:'var(--muted)',w:600})+text('put in '+$(M.putA),PR,38*k,{a:'end',s:12*k,c:'var(--muted)',w:600});}
  if(s.towers>0.01){const bw=v=>pw*v/s.tmax*s.stack,bh=11*k;
   o+=rect(L,46*k,bw(M.sam),bh,'var(--sam)',{rx:2})+rect(L,46*k,bw(M.putS)*s.tb,bh,'var(--seed)',{rx:2})+rect(L,61*k,bw(M.alex),bh,'var(--alex)',{rx:2})+rect(L,61*k,bw(M.putA)*s.tb,bh,'var(--seed)',{rx:2});
   if(GH&&gop>0)o+=rect(L,46*k,pw*GH.sam/s.tmax,bh,'none',{stroke:'var(--fg)',sw:1.5,dash:'4 3',op:0.7*gop})+rect(L,61*k,pw*GH.alex/s.tmax,bh,'none',{stroke:'var(--fg)',sw:1.5,dash:'4 3',op:0.7*gop});}
 }else{
 const rx=W-RP+6,rr=W-12,fs=narrow?0.86:1;
 if(s.board>0.01){const op=s.board;o+='<g style="opacity:'+op.toFixed(2)+'">';
  o+=text(done?'at 67':'age '+Math.floor(s.now),rx,T-17*k,{s:17*k*fs,w:800});
  [['Sam','var(--sam)',M.sam,M.putS],['Alex','var(--alex)',M.alex,M.putA]].forEach((r,j)=>{const y=T+14*k+j*46*k;
   o+=text(r[0],rx,y,{s:15*k*fs,w:800,c:r[1]})+text($(r[2]),rr,y,{a:'end',s:19*k*fs,w:800,c:r[1]})+text('put in '+$(r[3]),rr,y+17*k,{a:'end',s:12.5*k*fs,c:'var(--muted)',w:600});});
  o+='</g>';}
 /* towers: every column stacked */
 if(s.towers>0.01){const tT=T+104*k,phT=y0-tT,gap=14,twr=(RP-18-gap-12)/2,tx1=rx+8,tx2=tx1+twr+gap,YT=v=>y0-v/s.tmax*phT;
  o+='<g style="opacity:'+s.towers.toFixed(2)+'">'+line(rx,y0,rr,y0,'var(--axis)',{w:1.5})+text('Sam',tx1+twr/2,y0+18*k,{a:'middle',s:13.5*k,w:800,c:'var(--sam)'})+text('Alex',tx2+twr/2,y0+18*k,{a:'middle',s:13.5*k,w:800,c:'var(--alex)'});
  if(GH&&gop>0)o+=rect(tx1,YT(GH.sam),twr,y0-YT(GH.sam),'none',{stroke:'var(--fg)',sw:2,dash:'5 4',op:0.7*gop})+rect(tx2,YT(GH.alex),twr,y0-YT(GH.alex),'none',{stroke:'var(--fg)',sw:2,dash:'5 4',op:0.7*gop});
  o+='</g>';
  const order=M.cols.filter(c=>c.own==='S').concat(M.cols.filter(c=>c.own==='A')),N=order.length;let cs=0,ca=0;
  order.forEach((c,j)=>{const base=c.own==='S'?cs:ca;if(c.own==='S')cs+=c.v;else ca+=c.v;const pj=clamp(s.stack*(N+12)-j,0,12)/12;if(pj<=0||!c.live)return;
   const e=ease(pj),sx=X(c.a),sy=Y(c.v),dx=c.own==='S'?tx1:tx2,dy=YT(base+c.v),dh=YT(base)-dy;
   o+=rect(lerp(sx,dx,e),lerp(sy,dy,e),lerp(cw,twr,e),Math.max(0.8,lerp(y0-sy,dh,e)),c.own==='S'?'var(--sam)':'var(--alex)',{stroke:(pj<1||dh>5)?'var(--stage)':null,sw:0.7,op:pj<1?0.92:1});});
  if(s.tb>0.01){o+=rect(tx1,YT(M.putS),twr,y0-YT(M.putS),'var(--seed)',{op:s.tb})+rect(tx2,YT(M.putA),twr,y0-YT(M.putA),'var(--seed)',{op:s.tb});}
 }
 }
 if(s.fbar==='col'||s.fbar==='drive')M.cols.forEach(c=>{o+='<rect class="hit" data-a="'+c.a+'" x="'+n1(L+(c.a-23)*sw)+'" y="'+n1(T)+'" width="'+n1(sw)+'" height="'+n1(ph)+'" style="fill:transparent"/>';});
 return o;}

/* ---------- small pictures for the check ---------- */
function miniB(r,stop,mo,ymax,lab){const W=420,H=178,L=8,T=10,Bm=22,pw=W-16,ph=H-T-Bm,y0=H-Bm,sw=pw/45,cw=sw*0.8,M=modelB({r,stop,mo,now:67}),Y=v=>y0-v/ymax*ph;let o='';
 const xb=L+(stop-22)*sw;o+=rect(L,T,xb-L,ph,'var(--sam-tint)')+rect(xb,T,W-8-xb,ph,'var(--alex-tint)');
 M.cols.forEach(c=>{const x=L+(c.a-23)*sw+(sw-cw)/2;o+=rect(x,Y(c.v),cw,Y(M.D)-Y(c.v)+0.5,c.own==='S'?'var(--sam)':'var(--alex)')+rect(x,Y(M.D),cw,y0-Y(M.D),'var(--seed)');});
 o+=line(L,y0,W-8,y0,'var(--axis)',{w:1.5})+text('22',L,y0+16,{s:12.5,c:'var(--muted)'})+text(String(stop),xb,y0+16,{a:'middle',s:12.5,c:'var(--muted)',w:700})+text('67',W-8,y0+16,{a:'end',s:12.5,c:'var(--muted)'});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(lab)+'">'+o+'</svg>';}
function miniA(start,r,t,dbl){const W=520,H=190,L=10,T=26,Bm=22,pw=W-20,ph=H-T-Bm,y0=H-Bm,sw=pw/(t+1),cw=Math.max(1.5,sw*0.76),end=start*Math.pow(1+r,t),ymax=end*1.08,Y=v=>y0-v/ymax*ph;let o='';
 for(let i=0;i<=t;i++){const v=start*Math.pow(1+r,i),x=L+i*sw+(sw-cw)/2;o+=rect(x,Y(v),cw,Y(start)-Y(v)+0.5,'var(--comp)')+rect(x,Y(start),cw,y0-Y(start),'var(--seed)');}
 if(dbl)for(let m=1;m<=3;m++){const tt=m*Math.log(2)/Math.log(1+r),v=start*Math.pow(2,m);if(tt>t)break;o+=line(L,Y(v),L+tt*sw+sw/2,Y(v),'var(--hl)',{dash:'4 4'})+text($(v),L+tt*sw+sw/2-8,Y(v)-5,{a:'end',s:13,w:800,c:'var(--hl)',halo:1});}
 o+=line(L,y0,W-10,y0,'var(--axis)',{w:1.5})+text('start '+$(start),L,16,{s:13.5,w:700})+text('end '+$(end),W-10,16,{a:'end',s:13.5,w:800})+text('year 0',L,y0+16,{s:12.5,c:'var(--muted)'})+text('year '+t,W-10,y0+16,{a:'end',s:12.5,c:'var(--muted)'});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="A pile growing from '+$(start)+' to '+$(end)+' in '+t+' years">'+o+'</svg>';}

/* ---------- steps ---------- */
const PARTS=['One deposit','The race','Change it','Who is doing this','Tell it'];
const A45={view:'A',xmax:45,ymaxA:2300,yrs:45,legend:1};
const B67={view:'B',plan:0.3,now:67,ymaxB:54600,board:1};
const gutName={early:'Sam',late:'Alex',tie:'about the same'};
const STEPS=[
 {part:-1,title:'Who has more at 67?',st:{view:'H'},choices:[['early','Sam, the early starter'],['late','Alex, the late starter'],['tie','About the same']],locked:'Locked in. Now follow one $100 bill to see what really happens.',
  t:'Sam and Alex start work at 22. Sam saves $200 a month for 10 years, then stops for good. Alex waits until 32, then saves $200 a month for 35 years. <b>Pick who has more at 67.</b>',
  alt:'Alex puts in $84,000. Sam puts in $24,000. Both accounts grow 7% a year. Go with your gut. There is no math yet.'},
 {part:0,title:'One deposit',st:{view:'A',xmax:3,ymaxA:132,yrs:0},
  t:'Start small. Sam is 22 and puts <b>$100</b> in an account. He never touches it again.',
  alt:'The monthly plan comes later. First you follow a single $100, so you can see exactly what an account does to money.'},
 {part:0,title:'Year one',st:{view:'A',xmax:3,ymaxA:132,yrs:1},
  play:async ok=>{const S=Story.S;S.xk=0;S.xp=0;await tw({xp:1},3000,lin);if(!ok())return;S.xk=-1;S.xp=0;S.yrs=1;},
  t:'The account grows 7% a year. 7% of $100 is $7. A <b>$7 slice</b> lands on top, so at 23 Sam has $107.',
  alt:'7% means 7 for every 100. Sam has exactly $100 in there, so the account adds $7.'},
 {part:0,title:'Year two',st:{view:'A',xmax:3,ymaxA:132,yrs:2,lens:1},
  play:async ok=>{const S=Story.S;S.xk=1;S.xp=0;await tw({xp:1},3400,lin);if(!ok())return;S.xk=-1;S.xp=0;S.yrs=2;await tw({lens:1},500);},
  t:'Now 7% of the whole pile. The first $100 earns $7 again. Last year\'s $7 earns <b>49¢ of its own</b>. That thin green slice is growth on growth.',
  alt:'The $7 slice belongs to Sam now, so it earns 7% too. 7% of $7 is 49 cents. It looks like nothing. Keep your eye on the green.'},
 {part:0,title:'Ten years',st:{view:'A',xmax:10,ymaxA:250,yrs:2,legend:1,scrub:1},keep:['yrs'],
  play:async ok=>{await tw({lens:0},200);if(!ok())return;await tw({xmax:10,ymaxA:250,legend:1,scrub:1},1200);},
  todo:S=>S.yrs>=9.99,move:'Drag the age marker to 32.',auto:async ok=>{await tw({yrs:10},3600,lin);},
  t:'Your turn to run the clock. Amber is the same $7 every year. Green is growth on growth. <b>Watch which one changes.</b>',
  t2:'At 32 the $100 is $196.72. Amber has made $70. Green has made <b>$26.72 and is speeding up</b>.',
  alt:'Amber grows in a straight line, because it is always 7% of the same $100. Green curves upward, because it is 7% of a pile that keeps getting bigger.'},
 {part:0,title:'Guess first',st:{view:'A',xmax:45,ymaxA:2300,yrs:10,legend:1,guessOn:1},
  play:async ok=>{const S=Story.S;if(S.yrs<9.99){await tw({yrs:10},900,lin);if(!ok())return;}await tw({xmax:45,ymaxA:2300,scrub:0,guessOn:1},1500);},
  widget:()=>'<div class="gutrow"><label for="g-range">Your guess at 67</label><output id="g-out">'+(Story.mem.g67==null?'?':$(Story.mem.g67))+'</output><input type="range" id="g-range" min="200" max="2300" step="50" value="'+(Story.mem.g67==null?200:Story.mem.g67)+'"></div>',
  todo:(S,m)=>m.g67!=null,move:'Set the dashed line with the slider.',
  t:'Ten years turned $100 into $197. There are 35 more years to go. <b>Where do you think it will be at 67?</b>',
  alt:'One way to guess: it gained about $97 in the first ten years. Will every ten years add about the same, or more?'},
 {part:0,title:'Forty-five years',st:{view:'A',xmax:45,ymaxA:2300,yrs:10,legend:1,guessOn:1,scrub:1},keep:['yrs'],
  todo:S=>S.yrs>=44.99,move:'Drag the age marker all the way to 67.',auto:async ok=>{await tw({yrs:45},6500,lin);},
  t:'Now run the clock to 67 and watch the green.',
  t2:()=>{const g=Story.mem.g67;return 'The $100 is now <b>$2,100</b>. Amber made $315. Green made $1,685.'+(g==null?'':' You guessed '+$(g)+(g<1500?'. The growth keeps speeding up, which is hard to picture ahead of time.':'.'))+' This is called <b>compound growth</b>: growth that is added to the pile and then grows too.';},
  alt:'Look at the top slice of the last column. In its final year the pile grew $137, more than the whole $100 Sam put in.'},
 {part:0,title:'The same move, every year',st:Object.assign({},A45,{fbar:'one',cur:45}),
  t:'Every year the pile did one thing: <b>times 1.07</b>. Keep the 1 (all you had), add 0.07 (the new slice). Do that t times. Tap each part of the formula to find it in the picture.',
  alt:'Our letters. <b>r</b> is the rate: the percent added each year, written as a decimal, so 7% is 0.07. <b>t</b> is time in years. People call 1 + r the growth factor, because it is what the pile is multiplied by.'},
 {part:0,title:'Count the doublings',st:Object.assign({},A45,{fbar:'one',cur:45,dbl:1,legend:0}),
  play:async ok=>{const S=Story.S;await tw({legend:0},250);if(!ok())return;await tw({dbl:1},3200,lin);},
  t:'Another way to see it. At 7% the pile doubles about every 10 years, and <b>each doubling is twice the size of the last</b>: +$100, +$200, +$400, +$800.',
  alt:'You can estimate without the exponent. 45 years is a little more than 4 doublings: $100, $200, $400, $800, $1,600, and a bit more.'},
 {part:0,title:'Ten years late',st:Object.assign({},A45,{fbar:'two',dbl:1,legend:0,alex:1,alexYrs:35}),
  play:async ok=>{const S=Story.S;await tw({alex:1},700);if(!ok())return;await tw({alexYrs:35},4200,lin);},
  t:'Alex puts the same $100 in at 32. Same 7%, but his t is 35, not 45. He ends with $1,068, about half. He did not miss the first doubling. <b>He missed the last one.</b>',
  alt:'Both piles grow the same way for their first 35 years. Sam\'s gets ten more years at the end, when the pile is biggest and each slice is thickest.'},
 {part:1,title:'The real plan',st:{view:'B',plan:1,now:22,ymaxB:12000},
  t:'Back to the plan. $200 a month is <b>$2,400 a year</b>, and each box is one year\'s deposit. Sam fills 10 boxes. Alex fills 35.',
  alt:'Count the boxes. Alex puts in three and a half times as much money as Sam: $84,000 against $24,000.'},
 {part:1,title:'Sam saves',st:{view:'B',plan:0.3,now:32,ymaxB:12000,board:1},
  play:async ok=>{const S=Story.S;await tw({plan:0.3,board:1},400);if(!ok())return;await tw({now:32},6000,lin);},
  t:'Age 22 to 32. Sam drops in $2,400 a year. Each deposit does what the $100 did: times 1.07 for every year it waits. At 32 he has <b>$33,159</b> and stops.',
  alt:'Sam put in $24,000. The other $9,159 is growth. His oldest deposits are already the tallest.'},
 {part:1,title:'Alex saves',st:B67,
  play:async ok=>{const S=Story.S;await tw({ymaxB:54600},1400);if(!ok())return;await tw({now:67},10500,lin);},
  t:'Age 32 to 67. Sam adds nothing. His ten columns just keep multiplying. Alex adds a new column every year.',
  t2:()=>{const gut=Story.gut;return '<b>At 67: Sam $354,030, Alex $331,769.</b>'+(gut?(gut==='early'?' Your gut was right.':' Your gut said '+gutName[gut]+'. Most people pick Alex, because he puts in so much more.'):'');},
  alt:'Watch Sam\'s side: no new money, but the columns climb faster every year. Watch Alex\'s side: lots of new columns, but the newest ones have had no time to grow.'},
 {part:1,title:'Read the picture',st:Object.assign({},B67,{annot:1,env:1}),
  t:'<b>Width</b> is how many deposits. <b>Height</b> is how long each one waited. The gray strip is money they put in. Everything above it is growth.',
  alt:'Alex\'s picture is wide and low. Sam\'s is narrow and tall. Each person\'s total is their whole colored area.'},
 {part:1,title:'Add them up',st:Object.assign({},B67,{env:1,towers:1,stack:1,tb:1}),
  play:async ok=>{const S=Story.S;await tw({annot:0,towers:1},350);if(!ok())return;await tw({stack:1},5200,lin);if(!ok())return;await tw({tb:1},700);},
  t:'Stack every column to get each total. Sam\'s tower is ten tall slabs. Alex\'s is thirty-five thinner ones. <b>Sam put in $60,000 less and finished $22,261 ahead.</b>',
  alt:'Each of Sam\'s dollars became $14.75. Each of Alex\'s became $3.95. Same account, same rate. The only difference is t.'},
 {part:1,title:'One formula, 45 times',st:Object.assign({},B67,{towers:1,stack:1,tb:1,env:1,sel:25,fbar:'col'}),
  t:'Every column is the same formula with its own t. <b>Tap any column</b> to read its story.',
  alt:'The picture is 45 copies of deposit × (1 + r)ᵗ. The oldest has t = 44. The newest has t = 0, so it is still just $2,400.'},
 {part:2,title:'Change the math, watch the picture',st:Object.assign({},B67,{plan:0,towers:1,stack:1,tb:1,env:1,fbar:'drive'}),
  t:'You drive. <b>Before you move a slider, say what you think the picture will do.</b> The dashed outline shows where the picture was.',
  alt:'Change one thing at a time. Each slider is one part of the formula: the deposit, r, or how many years the deposits get to wait.'},
 {part:3,title:'A savings group in Niger',st:{view:'W'},t:()=>VS.cap(),widget:()=>VS.widget(),todo:()=>VS.done(),move:()=>VS.move(),
  alt:'Lent coins are working: a loan buys peanuts, the peanuts become oil and cakes, the sales pay the loan back with a little extra, and that extra is lent again. Coins in a locked box do nothing, so they come back the same.'},
 {part:4,title:'Check yourself',st:{view:'P',panel:'check'},
  t:'Three quick ones. Each asks you to connect a picture, a formula and a story.',
  alt:'Wrong answers get a hint that points at the picture. Try again as many times as you need.'},
 {part:4,title:'Tell the story',st:{view:'P',panel:'story'},
  t:'Math is finished when you can tell its story. Three sentences is enough. Then copy your work into Canvas.',
  alt:'Use the picture words: deposit, slice, pile, width, height, t. If you get stuck, go back to "Read the picture" and describe what you see.'}
];

/* ---------- formula strip ---------- */
const tokB=(hl,val,name,cls)=>'<button type="button" class="tok'+(cls?' '+cls:'')+'" data-hl="'+hl+'" aria-pressed="'+(Story.S.hl===hl)+'"><b>'+val+'</b><small>'+name+'</small></button>';
const tokS=(val,name,cls)=>'<span class="tok'+(cls?' '+cls:'')+'"><b>'+val+'</b><small>'+name+'</small></span>';
const OP=s=>'<span class="op">'+s+'</span>';
function fbarHtml(S){
 const m=S.fbar;if(!m)return null;
 if(m==='one'){const c=S.cur==null?45:S.cur;
  return '<div class="chain">$100 <i>× 1.07</i> → $107 <i>× 1.07</i> → $114.49 <i>× 1.07</i> → … <b>the same move, t times</b></div>'+
   '<div class="frow">'+tokB('start','$100','start')+OP('×')+OP('(')+tokB('one','1','keep it')+OP('+')+tokB('r','0.07','r, the rate')+OP(')')+tokB('t',c,'t, years','exp')+OP('=')+tokB('end',$c(B1(c)),'end, at '+(22+c))+
   '<span class="letters">In letters: <code>end = start × (1 + r)<sup>t</sup></code></span></div>'+
   '<p class="hint"><b>Tap a part of the formula</b> to find it in the picture. <b>Tap a column</b> to change t.</p>';}
 else if(m==='two'){const row=(who,cls,t)=>'<div class="frow"><span class="who '+cls+'">'+who+'</span>'+tokS('$100','start')+OP('×')+OP('(')+tokS('1','keep it')+OP('+')+tokS('0.07','r')+OP(')')+tokS(t,'t, years','exp diff')+OP('=')+tokS($(B1(t)),'end, at 67')+'</div>';
  return row('Sam','sam',45)+row('Alex','alex',35)+'<p class="hint">Same start. Same r. <b>Only t is different.</b></p>';}
 else if(m==='col'){const a=S.sel==null?25:S.sel,t=67-a,who=a<=S.stop?'Sam':'Alex';
  return '<div class="frow"><span class="who '+(who==='Sam'?'sam':'alex')+'">'+who+'</span>'+tokS('$2,400','deposit')+OP('×')+OP('(')+tokS('1','keep it')+OP('+')+tokS('0.07','r')+OP(')')+tokS(t,'t, years','exp diff')+OP('=')+tokS($(2400*Math.pow(GA,t)),'at 67')+
   '<span class="letters">In letters: <code>deposit × (1 + r)<sup>t</sup></code></span></div>'+
   '<p class="hint">This column\'s story: '+who+' put $2,400 in at age '+a+'. It waited <b>'+t+' year'+(t===1?'':'s')+'</b> and became <b>'+$(2400*Math.pow(GA,t))+'</b>.</p>';}
 else if(m==='drive'){
  return '<div class="drive">'+
   '<div class="ctl"><label for="c-r">r, the yearly rate <output id="o-r"></output></label><input type="range" id="c-r" min="3" max="10" step="0.5" value="'+S.r+'"><small>How thick each year\'s new slice is.</small></div>'+
   '<div class="ctl"><label for="c-stop">Sam stops, Alex starts, at age <output id="o-stop"></output></label><input type="range" id="c-stop" min="25" max="45" step="1" value="'+S.stop+'"><small>How many deposits each friend makes, and how long they wait.</small></div>'+
   '<div class="ctl"><label for="c-mo">The deposit, per month <output id="o-mo"></output></label><input type="range" id="c-mo" min="50" max="600" step="50" value="'+S.mo+'"><small>The gray strip at the bottom of every column.</small></div></div>'+
   '<p class="narr" id="narr" aria-live="polite"></p><div class="quests" id="quests"></div>';}
 return null;}
function bindFbar(box,S){if(S.fbar==='drive'){['c-r','c-stop','c-mo'].forEach(id=>el(id).addEventListener('input',driveChanged));updateDrive();}}
const QUESTS=[
 {id:'r',q:'Slide r.',ask:'Which columns will change the most?',a:'r bends the curve. The oldest columns move the most, so a higher r helps Sam more than Alex.'},
 {id:'mo',q:'Slide the deposit.',ask:'Will the winner change?',a:'Every column stretches by the same amount, gray strip included. The shape and the winner stay the same.'},
 {id:'stop',q:'Slide the age.',ask:'What moves in the picture?',a:'The line between green and blue moves. Columns do not change height. They change owner.'},
 {id:'alex',q:'Make Alex finish ahead.',ask:'Which slider can do it?',a:'Two ways: a lower r, or fewer years for Sam. With the switch at 32, Alex wins below about 6.6%.'}
];
const qdone={};
function updateDrive(){const S=Story.S;if(S.fbar!=='drive'||!el('o-r'))return;const M=modelB(S),d=M.sam-M.alex;
 el('o-r').textContent=S.r+'%';el('o-stop').textContent=S.stop;el('o-mo').textContent='$'+S.mo;
 el('narr').innerHTML='At '+S.r+'% a year: '+(Math.abs(d)<Math.max(M.sam,M.alex)*0.005?'they finish about even.':d>0?'<b class="sam">Sam</b> finishes '+$(d)+' ahead, after putting in '+$(Math.abs(M.putA-M.putS))+(M.putA>=M.putS?' less.':' more.'):'<b class="alex">Alex</b> finishes '+$(-d)+' ahead, after putting in '+$(Math.abs(M.putA-M.putS))+(M.putA>=M.putS?' more.':' less.'))+' Saving every year from 22 to 67 would be both colors together: <b>'+$(M.sam+M.alex)+'</b>.';
 if(S.r!==7)qdone.r=1;if(S.mo!==200)qdone.mo=1;if(S.stop!==32)qdone.stop=1;if(M.alex>M.sam)qdone.alex=1;
 el('quests').innerHTML=QUESTS.map(q=>'<div class="quest'+(qdone[q.id]?' done':'')+'"><span class="mark">'+(qdone[q.id]?'done':'try')+'</span><b>'+q.q+'</b><p>'+(qdone[q.id]?q.a:q.ask)+'</p></div>').join('');}
function driveChanged(){const S=Story.S;
 Story.ghost(()=>{const M0=modelB(S);return {vals:M0.cols.map(c=>c.v),sam:M0.sam,alex:M0.alex};});
 S.r=+el('c-r').value;S.stop=+el('c-stop').value;S.mo=+el('c-mo').value;S.sel=null;
 const M=modelB(S),g=Story.gh.d;Story.dropTweens();Story.tw({ymaxB:Math.max(fitY(M),Math.max.apply(null,g.vals)*1.16),tmax:Math.max(fitT(M),Math.max(g.sam,g.alex)*1.12)},380);updateDrive();}
function onGhostEnd(S){if(S.fbar==='drive'){const M=modelB(S);Story.tw({ymaxB:fitY(M),tmax:fitT(M)},600);}}

/* ---------- panels ---------- */
const ans={q1:null,q2:null,q3:null},tries={q1:0,q2:0,q3:0};
function panelHtml(p){
 if(p==='check'){
  const ym=2400*Math.pow(1.09,44)*1.12;
  return '<div class="qcard" id="q1"><h2>1. One number in the formula changed. Which one?</h2><p>Both pictures use the same scale.</p>'+
   '<div class="pair"><figure><figcaption>Before</figcaption>'+miniB(7,32,200,ym,'Before: columns at 7 percent')+'</figure><figure><figcaption>After</figcaption>'+miniB(9,32,200,ym,'After: the oldest columns are much taller')+'</figure></div>'+
   '<div class="opts" data-q="q1"><button type="button" data-v="mo">The deposit got bigger</button><button type="button" data-v="r">r, the rate, went up</button><button type="button" data-v="stop">Sam saved more years</button></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q2"><h2>2. Turn a story into a formula</h2><p>Maya is 16. She puts $500 from a summer job into an account and leaves it alone until she is 66. It grows 7% a year. Build her formula.</p>'+
   '<div class="build"><span class="tok" id="t-start"><b><span class="unit">$</span><input id="i-start" inputmode="decimal" aria-label="start, in dollars" autocomplete="off"></b><small>start</small></span>'+OP('×')+OP('(')+'<span class="tok"><b>1</b><small>keep it</small></span>'+OP('+')+'<span class="tok" id="t-r"><b><input id="i-r" inputmode="decimal" aria-label="r, the rate, as a decimal" autocomplete="off"></b><small>r, as a decimal</small></span>'+OP(')')+'<span class="tok exp" id="t-t"><b><input id="i-t" inputmode="numeric" aria-label="t, in years" autocomplete="off"></b><small>t, years</small></span>'+
   '<button type="button" class="btn" id="q2check">Check my formula</button></div><div class="minibox" id="q2pic" hidden></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q3"><h2>3. Use the doublings</h2><p>At 7% a pile doubles about every 10 years. $1,000 sits for 30 years. About how much is it then?</p>'+
   '<div class="opts" data-q="q3"><button type="button" data-v="3000">About $3,000</button><button type="button" data-v="8000">About $8,000</button><button type="button" data-v="30000">About $30,000</button></div><div class="minibox" id="q3pic" hidden></div><div class="fbslot"></div></div>';
  }
  return Story.orderCard([{view:'A',xmax:3,ymaxA:132,yrs:0},{view:'A',xmax:3,ymaxA:132,yrs:2,lens:1},{view:'A',xmax:45,ymaxA:2300,yrs:45},{view:'B',plan:0.3,now:32,ymaxB:54600,board:1},{view:'B',plan:0.3,now:67,ymaxB:54600,board:1,towers:1,stack:1,tb:1}])+
   '<div class="qcard"><h2>Tell the story of Sam and Alex</h2><p>Write it for a friend who has not seen the picture.</p><div class="story">'+
   '<div><label for="s1">Beginning<small>What did each of them put in?</small></label><textarea id="s1" placeholder="Sam put in… Alex put in…"></textarea></div>'+
   '<div><label for="s2">Middle<small>What happened to every deposit, every year?</small></label><textarea id="s2" placeholder="Each year, every pile…"></textarea></div>'+
   '<div><label for="s3">End<small>Who had more at 67, and which part of the formula caused it?</small></label><textarea id="s3" placeholder="At 67… because…"></textarea></div></div>'+
   Story.wordsRow(['deposit','rate','year','compound','pile','slice'])+'<div class="copyrow"><button type="button" class="btn primary" id="copyb">Copy for Canvas</button><span id="copymsg">Copies your gut pick, your three checks and your story.</span></div><textarea id="copyfallback" hidden readonly aria-label="Your work, to copy"></textarea></div>'+
  '<div class="qcard"><h2>Use it</h2><div class="uses">'+
   '<div class="use"><b>Do:</b> at your first job with a retirement plan, save at least enough to get the full employer match. <b>Why:</b> in Vanguard\'s How America Saves report, the most common match is 50 cents for each dollar you save, on the first 6% of your pay. It is money you only get if you put in your own.</div>'+
   '<div class="use"><b>Do:</b> with a summer job, ask an adult about opening a Roth IRA. <b>Why:</b> anyone with a paycheck can put in up to what they earned that year or the yearly limit ($7,500 for 2026, set by the IRS), and the growth comes out tax-free in retirement if you follow the rules.</div>'+
   '<div class="use"><b>Do:</b> build this in a spreadsheet. <b>Why:</b> typing the formula yourself makes it yours. <a href="excel.html#build-investing">Build 40 years of investing</a>, one step at a time, then open it in Excel.</div></div></div>'+
  Story.voteCard()+'<details class="about"><summary>About this model</summary><p><b>Model.</b> One deposit at the end of each year, 12 × the monthly amount. Each year every balance is multiplied by 1 + r. Monthly deposits would raise both totals a little. Who wins does not change much.</p><p><b>Where 7% comes from.</b> US stocks (the S&amp;P 500 with dividends) grew about 10% a year from 1928 to 2025, and about 7% a year after inflation (Aswath Damodaran, NYU Stern, historical returns data). Using a return after inflation keeps the totals in today\'s dollars.</p><p><b>What this number hides.</b> Real returns are not smooth: the S&amp;P 500 lost about 37% in 2008, counting dividends, and gained about 26% in 2023. Nobody earns the average every year, and the past does not promise the future. Fees, taxes and missed years all change the totals. At 6% a year, Alex comes out ahead. What holds at every rate: early dollars grow more than late ones.</p><p>This is a simplified math model, not financial advice.</p></details>';
}
function bindPanel(panel,p){
 if(p==='check'){restoreCheck(panel);return;}
 ['s1','s2','s3'].forEach(id=>{el(id).value=story[id]||'';el(id).addEventListener('input',e=>{story[id]=e.target.value;});});
 el('copyb').addEventListener('click',()=>Story.copy(workText(),el('copymsg'),el('copyfallback')));
}
const story={},q2v={};
const FB={
 q1:{r:[1,'Yes. A higher r bends the curve. The oldest columns grew the most. The newest ones barely moved.'],mo:[0,'A bigger deposit would stretch every column by the same amount. Look at the right side: the newest columns did not change. Try again.'],stop:[0,'Count the green columns. There are 10 in both pictures, so Sam saved the same number of years. Try again.']},
 q3:{8000:[1,'Yes. Three doublings: $1,000 → $2,000 → $4,000 → $8,000. The exact answer is $7,612.'],3000:[0,'That adds $1,000 for each doubling. Doubling multiplies: $1,000 → $2,000 → $4,000 and once more. Try again.'],30000:[0,'That multiplies by 30, once for each year. The pile doubles once every 10 years, so it doubles 3 times. Try again.']}
};
function setFb(card,ok,msg){card.querySelector('.fbslot').innerHTML='<p class="fb '+(ok?'ok':'no')+'" role="status">'+msg+'</p>';}
function pickOpt(q,v,silent){const card=el(q),f=FB[q][v];if(!f)return;if(!silent){if(ans[q]!=='ok')tries[q]++;}
 card.querySelectorAll('.opts button').forEach(b=>{b.classList.remove('right','wrong');if(b.dataset.v===String(v))b.classList.add(f[0]?'right':'wrong');});
 setFb(card,f[0],f[1]);if(f[0]){ans[q]='ok';if(q==='q3'){el('q3pic').hidden=false;el('q3pic').innerHTML=miniA(1000,0.07,30,true);}}ans[q+'v']=v;}
function checkQ2(silent){const card=el('q2'),num=id=>parseFloat(String(el(id).value).replace(/[$,%\s]/g,''));
 const st=num('i-start');let r=num('i-r');const t=num('i-t');q2v.start=el('i-start').value;q2v.r=el('i-r').value;q2v.t=el('i-t').value;
 if(isNaN(st)||isNaN(r)||isNaN(t)){if(!silent)setFb(card,false,'Fill in all three boxes: the start, r and t.');return;}
 if(r>=1)r=r/100;if(!silent&&ans.q2!=='ok')tries.q2++;
 const okS=Math.abs(st-500)<0.5,okR=Math.abs(r-0.07)<0.0006,okT=Math.abs(t-50)<0.01;
 el('t-start').className='tok '+(okS?'ok':'bad');el('t-r').className='tok '+(okR?'ok':'bad');el('t-t').className='tok exp '+(okT?'ok':'bad');
 if(st>0&&r>0&&r<=0.3&&t>=1&&t<=80){el('q2pic').hidden=false;el('q2pic').innerHTML=miniA(st,r,Math.round(t),false);}
 if(okS&&okR&&okT){ans.q2='ok';setFb(card,true,'Yes. $500 × (1 + 0.07)<sup>50</sup> = $14,729. Maya\'s $500 became about 29 times bigger, and she only did one thing: she waited.'+(num('i-r')>=1?' Note: in the formula, 7% is written 0.07.':''));}
 else setFb(card,false,(!okS?'The start is what goes in at the beginning: her $500. ':'')+(!okR?'r is the yearly rate as a decimal: 7% is 0.07. ':'')+(!okT?'t is how many years it waits: 66 − 16. ':'')+'The picture shows the formula you built. Fix the red box and check again.');}
function restoreCheck(panel){
 panel.querySelectorAll('.opts').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pickOpt(g.dataset.q,b.dataset.v);}));
 el('q2check').addEventListener('click',()=>checkQ2(false));
 ['i-start','i-r','i-t'].forEach(id=>el(id).addEventListener('keydown',e=>{if(e.key==='Enter')checkQ2(false);}));
 if(ans.q1v)pickOpt('q1',ans.q1v,true);if(ans.q3v)pickOpt('q3',ans.q3v,true);
 if(q2v.start!=null){el('i-start').value=q2v.start;el('i-r').value=q2v.r;el('i-t').value=q2v.t;checkQ2(true);}}
function workText(){const mark=q=>ans[q]==='ok'?'correct'+(tries[q]>1?' (try '+tries[q]+')':''):'not answered yet';
 return ['Start at 22 or 32? (Raider FinanceLab)','My gut pick: '+(Story.gut?gutName[Story.gut]:'none'),'Check 1, which number changed: '+mark('q1'),'Check 2, Maya\'s formula: '+mark('q2')+(ans.q2==='ok'?'  $500 x (1 + 0.07)^50 = $14,729':''),'Check 3, doublings: '+mark('q3'),'Picture challenges done: '+Object.keys(qdone).length+' of 4',Story.orderLine(),'','My story','Beginning: '+(story.s1||''),'Middle: '+(story.s2||''),'End: '+(story.s3||'')].join('\n');}


function draw(S,W,H,k){if(S.view==='W')return '';return S.view==='H'?drawH(S,W,H,k):S.view==='A'?drawA(S,W,H,k):drawB(S,W,H,k);}
function onDrag(p,S,W,H,k){if(S.view==='A'&&S.scrub>0.5){const L=66*k,pw=W-L-22,sw=pw/(S.xmax+1),hi=Math.round(S.xmax);let y=clamp((p.x-L)/sw-0.5,0,hi);if(y>hi-0.2)y=hi;S.yrs=y;}return false;}
function bindWidget(box,S){if(S.view==='W'){VS.bind(box);return;}const r=el('g-range');if(!r)return;r.addEventListener('input',()=>{Story.mem.g67=+r.value;el('g-out').textContent=$(+r.value);Story.redraw();Story.poke();});}
function onHit(d,S){
 if(d.i!=null&&S.fbar==='one'){S.cur=+d.i;if(S.hl==='start'||!S.hl)S.hl='t';return true;}
 if(d.a!=null){S.sel=+d.a;return S.fbar==='col';}
 return false;}
Story.start({id:'startearly',lab:'FinanceLab',title:'Start at 22 or 32',DEF,PARTS,STEPS,draw,fbar:fbarHtml,bindFbar,bindWidget,panel:panelHtml,bindPanel,onHit,onDrag,onGhostEnd,
 settle:S=>{S.xk=-1;S.xp=0;},onStep:S=>{VS.show(S.view==='W');if(S.fbar==='drive')updateDrive();}});
})();
