/* Can a raise cost me money? Story version (pilot, Nov 2026). Needs fin.js and story/kit.js.
   The picture: taxable dollars stand in a line, left to right. Above each dollar is the federal tax on it, in cents.
   Brackets are rooms with ceilings (10¢, 12¢, 22¢ ...). A dollar pays the rate of the room it lands in, so the tax is the area.
   A raise is new dollars added on the right. Same model and numbers as sims/brackets.js (2026, single filer, Colorado). */
(function(){
'use strict';
const {$,$c,money,clamp,lerp,ease,lin,esc,el,n1,rect,text,line,tag,person,RM}=Story.h,tw=Story.tw,F=window.FIN;
const STD=F.STD,ROOMS=[];{let lo=0;for(const br of F.BR){ROOMS.push({lo,hi:br[0],r:br[1],c:Math.round(br[1]*100)});lo=br[0];}}
const RC=['var(--t-fam)','var(--t-ss)','var(--t-med)','var(--t-fed)','var(--bad)','var(--bad)','var(--bad)'];
const N=v=>Math.round(v).toLocaleString('en-US');
const wait=ms=>new Promise(r=>setTimeout(r,RM?0:ms));
const pct=v=>(Math.round(v*1000)/10).toFixed(1)+'%';
function slices(a,b){const out=[];ROOMS.forEach((R,i)=>{const s=Math.max(R.lo,a),e=Math.min(R.hi,b);if(e>s+1e-6)out.push({i,r:R.r,c:R.c,lo:s,hi:e,amt:e-s,tax:(e-s)*R.r});});return out;}
function model(s){const T0=Math.max(0,s.sal-STD),T1=Math.max(0,s.sal+s.rz-STD),c0=F.check(s.sal,1,0),c1=F.check(s.sal+s.rz,1,0);
 const d={fed:c1.fed-c0.fed,co:c1.st-c0.st,ss:c1.ss-c0.ss,med:c1.med-c0.med,fam:c1.fam-c0.fam,keep:c1.net-c0.net};
 return {T0,T1,d,tax0:F.fedTax(T0),tax1:F.fedTax(T1),sl:slices(T0,T1),share:d.keep/s.rz};}
const avgOf=s=>F.fedTax(s.T)/(s.T+STD)*100;
const SAL=65000,RZ=3000,T0D=SAL-STD,T1D=T0D+RZ,GMAX=130000;
const net=g=>{const T=Math.max(0,g-STD);return g-F.fedTax(T)-F.CO*T-F.SS*Math.min(g,F.SSCAP)-F.MED*g-F.FAMLI*Math.min(g,F.SSCAP);};
const fearNet=g=>{const T=Math.max(0,g-STD);return g-F.marginal(T)*T-F.CO*T-F.SS*Math.min(g,F.SSCAP)-F.MED*g-F.FAMLI*Math.min(g,F.SSCAP);};
const keepC=g=>{const T=g-STD;return 100*(1-(T>=0?F.marginal(T+0.5)+F.CO:0)-(g<F.SSCAP?F.SS+F.FAMLI:0)-F.MED);};

const DEF={view:'H',fbar:null,hl:null,cur:null,sel:null,sal:SAL,rz:RZ,T:T0D,xa:0,xb:56000,ymax:30,
 big:0,std:0,rooms:1,fill:1,math:0,myth:0,mythAfter:0,cmp:0,bal:0,h:15,lev:0,free:0,pour:0,rdrag:0,rs:0,gp:0,gm:0};
function geo(W,H,k){const narrow=W<700,RP=narrow?0:268,L=58*k,T=(narrow?66:46)*k,Bm=64*k,PR=narrow?W-14:W-RP-14;return {narrow,RP,L,T,PR,pw:PR-L,ph:H-T-Bm,y0:H-Bm};}
function geoG(W,H,k){const narrow=W<700,RP=narrow?0:268,L=76*k,T=(narrow?52:30)*k,Bm=54*k,PR=narrow?W-14:W-RP-14;return {narrow,RP,L,T,PR,pw:PR-L,ph:H-T-Bm,y0:H-Bm};}

/* a small card of numbers beside the picture */
function card(sx,sy,sr,H,k,title,rows){rows=rows.filter(Boolean);const rh=Math.min(24*k,(H-sy-34*k)/(rows.length+1.3));
 let o=rect(sx,sy,sr-sx,rh*(rows.length+0.6)+26*k,'var(--card)',{rx:8,stroke:'var(--line)',sw:1.5})+text(title,sx+12,sy+20*k,{s:11.5*k,w:700,c:'var(--muted)'});
 rows.forEach((r,j)=>{const y=sy+22*k+rh*(j+1),op=r.op==null?1:r.op;if(r.rule)o+=line(sx+12,y-rh*0.74,sr-12,y-rh*0.74,'var(--line)',{w:1.5});
  if(r.sw)o+=rect(sx+12,y-10*k,11*k,11*k,r.sw,{rx:2,op});
  o+=text(r.l,sx+12+(r.sw?16*k:0),y,{s:(r.b?14:13)*k,w:r.b?800:600,c:r.c,op})+text(r.v,sr-12,y,{a:'end',s:(r.b?15:13.5)*k,w:r.b?800:700,c:r.c,op});});
 return o;}

/* ---------- view H: the warning ---------- */
const GUT={down:'goes down',half:'goes up, by half the raise or less',most:'goes up, by more than half the raise'};
function drawH(s,W,H,k){const gut=Story.gut,L=70*k,R=W-70*k,by=H*0.6,bh=Math.min(48*k,H*0.13),X=v=>L+v/68000*(R-L);let o='';
 o+=text('You earn $65,000. Your manager offers a $3,000 raise.',W/2,H*0.12,{a:'middle',s:19*k,w:800});
 const bw=Math.min(470*k,W-190*k),bx=W/2-bw/2+24*k,bt=H*0.2,bhh=Math.min(74*k,H*0.2);
 o+=person(bx-34*k,bt+bhh-8*k,'var(--seed)',k*1.5)+rect(bx,bt,bw,bhh,'var(--card)',{rx:14,stroke:'var(--line)',sw:2});
 o+='<path d="M'+n1(bx+1)+' '+n1(bt+bhh*0.55)+'l'+n1(-14*k)+' '+n1(8*k)+'l'+n1(14*k)+' '+n1(6*k)+'" style="fill:var(--card);stroke:var(--line);stroke-width:2"/>';
 o+=text('“Careful. That puts you in the 22% bracket.',bx+bw/2,bt+bhh*0.42,{a:'middle',s:16*k,w:700})+text('You could end up taking home less.”',bx+bw/2,bt+bhh*0.42+23*k,{a:'middle',s:16*k,w:700});
 o+=rect(X(0),by,X(65000)-X(0),bh,'var(--seed)',{rx:4})+text('$65,000 of pay',X(32500),by+bh/2+6*k,{a:'middle',s:17*k,w:800,c:'var(--stage)'});
 o+=rect(X(65000)+3,by,X(68000)-X(65000)-3,bh,'var(--rj)',{rx:4})+text('+$3,000',X(66500),by-10*k,{a:'middle',s:15*k,w:800,c:'var(--rj-ink)'})+text('raise',X(66500),by+bh+18*k,{a:'middle',s:13*k,w:700,c:'var(--rj-ink)'});
 if(gut)o+=tag('your pick: take-home pay '+GUT[gut],L,by+bh+46*k,{s:14*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2});
 return o;}

/* ---------- view B: dollars in a line, rooms above them ---------- */
function xticks(xa,xb,px){const w=xb-xa;let st=50000;for(const c of [1000,2000,5000,10000,20000,50000]){if(c/w*px>=72){st=c;break;}}const out=[];for(let v=Math.ceil(Math.max(0,xa)/st)*st;v<=xb+1;v+=st)out.push(v);return out;}
function drawB(s,W,H,k){
 const G=geo(W,H,k),{narrow,RP,L,T,PR,pw,ph,y0}=G,m=model(s),gh=Story.gh,xa=s.xa,xb=s.xb,mem=Story.mem;
 const X=v=>L+(clamp(v,xa,xb)-xa)/(xb-xa)*pw,Y=c=>y0-c/s.ymax*ph;
 const Tn=s.T,T0=m.T0,avg=avgOf(s),isRaise=Tn>T0+0.5&&s.myth<0.5;let p='',o='';
 /* axes */
 for(let c=0;c<=s.ymax+0.01;c+=10){if(c>0)p+=line(L,Y(c),PR,Y(c),'var(--grid)');p+=text(c+'¢',L-8,Y(c)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});}
 if(!narrow)p+=text('federal income tax on each dollar',8,T-26*k,{s:12.5*k,c:'var(--muted)',w:600});
 if(s.std>0.5){for(let pv=0;pv-STD<=xb+1;pv+=(narrow?20000:10000))p+=text('$'+N(pv),X(pv-STD),y0+36*k,{a:'middle',s:12*k,c:'var(--muted)'});}
 else xticks(xa,xb,pw/k).forEach(v=>{p+=text('$'+N(v),X(v),y0+36*k,{a:X(v)>PR-30*k?'end':'middle',s:12*k,c:'var(--muted)'});});
 p+=text(s.std>0.5?'every dollar of pay, in order':'taxable dollars, in order',(L+PR)/2,y0+54*k,{a:'middle',s:13*k,c:'var(--muted)',w:600});
 /* the rooms: each bracket is a ceiling over its own dollars */
 if(s.rooms>0.01)ROOMS.forEach(R=>{if(R.lo>=xb||R.hi<=Math.max(xa,0))return;const x1=X(R.lo),x2=X(Math.min(R.hi,xb)),yc=Y(R.c);
  const d=(R.lo>=xa?'M'+n1(x1)+' '+n1(y0)+'L'+n1(x1)+' '+n1(yc):'M'+n1(x1)+' '+n1(yc))+'L'+n1(x2)+' '+n1(yc)+(R.hi<=xb?'L'+n1(x2)+' '+n1(y0):'');
  p+='<path d="'+d+'" style="fill:none;stroke:var(--axis);stroke-width:1.5;stroke-dasharray:5 4;opacity:'+s.rooms.toFixed(2)+'"/>';
  if(x2-x1>70*k)p+=text(R.c+'¢ room',x1+8,yc-7*k,{s:13*k,w:800,c:'var(--muted)',op:s.rooms});
  if(R.hi<xb&&R.hi>xa&&s.std<0.5)p+=text('$'+N(R.hi)+' line',x2,T-8*k,{a:'middle',s:12*k,w:700,c:'var(--muted)',op:s.rooms})+line(x2,T-2*k,x2,yc,'var(--axis)',{w:1,dash:'2 4',op:s.rooms});});
 if(s.std>0.5&&xa<0&&s.lev<0.3)p+=text('first 16,100 dollars: 0¢',X(-STD)+8,y0-9*k,{s:13*k,w:800,c:'var(--muted)'});
 /* the fear: one rate painted on every dollar */
 if(s.myth>0.01){const r0=F.marginal(T0)*100,r1=F.marginal(m.T1)*100,rc=Math.round(lerp(r0,r1,s.mythAfter)*10)/10,x0=X(0),xe=X(Tn),yy=Y(rc);
  p+=rect(x0,yy,X(Math.min(Tn,T0))-x0,y0-yy,'var(--seed)',{op:0.9*s.myth,stroke:'var(--stage)',sw:1.5});
  if(Tn>T0)p+=rect(X(T0),yy,xe-X(T0),y0-yy,'var(--rj)',{op:0.92*s.myth,stroke:'var(--stage)',sw:1.5});
  p+=text(N(Tn)+' dollars × '+Math.round(rc)+'¢',(x0+xe)/2,(yy+y0)/2-3*k,{a:'middle',s:15*k,w:700,c:'var(--stage)',op:s.myth})+text('= '+$(Tn*Math.round(rc)/100),(x0+xe)/2,(yy+y0)/2+20*k,{a:'middle',s:19*k,w:800,c:'var(--stage)',op:s.myth});
  p+=tag('THE FEAR: one rate on every dollar',x0+10,T+18*k,{s:13.5*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2,op:s.myth});
  if(s.mythAfter>0.98&&!narrow)p+=tag('extra tax: '+$(m.T1*r1/100-T0*r0/100)+' on a '+$(s.rz)+' raise',x0+304*k,T+18*k,{s:13.5*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2});}
 /* the law: every dollar pays the rate of its own room */
 if(s.fill>0.01){
  if(s.std>0.01&&s.lev>0.001)p+=rect(X(-STD),Y(avg*s.lev),X(0)-X(-STD),y0-Y(avg*s.lev),'var(--seed)',{op:0.6*s.fill,stroke:'var(--stage)',sw:1.5});
  slices(0,Tn).forEach(sl=>{const hc=lerp(sl.c,avg,s.lev),x=X(sl.lo),w=X(sl.hi)-x;p+=rect(x,Y(hc),w,y0-Y(hc),RC[sl.i],{op:s.fill,stroke:'var(--stage)',sw:1.5});});
  if(s.math>0.01&&s.lev<0.5)slices(0,Math.min(Tn,T0)).forEach(sl=>{const x=X(sl.lo),w=X(sl.hi)-x,hp=y0-Y(sl.c),cx=x+w/2;
   if(w>150*k&&hp>50*k)p+=text(N(sl.amt)+' dollars × '+sl.c+'¢',cx,Y(sl.c)+hp/2-3*k,{a:'middle',s:13.5*k,w:700,c:'#fff',op:s.math})+text('= '+$(sl.tax),cx,Y(sl.c)+hp/2+17*k,{a:'middle',s:16*k,w:800,c:'#fff',op:s.math});});
  if(isRaise)slices(T0,Tn).forEach((sl,j)=>{const hc=lerp(sl.c,avg,s.lev),x=X(sl.lo),w=X(sl.hi)-x;if(w<1)return;
   p+=rect(x+1.5,Y(hc)+1.5,w-3,y0-Y(hc)-1.5,'none',{stroke:'var(--rj)',sw:3,op:s.fill});
   if(s.lev<0.5&&s.bal<0.5&&s.cmp<0.5&&s.std<0.5&&w>60*k){const on=s.fbar==='raise'&&s.hl===(j?'b':'a');const two=slices(T0,Tn).length>1;p+=tag(N(sl.amt)+' × '+sl.c+'¢ = '+money(sl.tax),two?(j?x+2:x+w-2):x+w/2,Y(sl.c)-12*k,{a:two?(j?'start':'end'):'middle',s:13.5*k,bw:on?3:2,bc:on?'var(--fg)':'var(--rj)',c:on?'var(--fg)':'var(--rj-ink)'});
    if(on)p+=rect(x-1,Y(sl.c)-1,w+2,y0-Y(sl.c)+1,'none',{stroke:'var(--fg)',sw:4});}});}
 /* before the last change, in the Change it step */
 if(gh&&s.free>0.5)slices(gh.d.T0,gh.d.T1).forEach(sl=>{p+=rect(X(sl.lo),Y(sl.c),X(sl.hi)-X(sl.lo),y0-Y(sl.c),'none',{stroke:'var(--fg)',sw:2,dash:'5 4',op:0.7*gh.op});});
 /* the fear laid over the law */
 if(s.cmp>0.01){const rc=F.marginal(Tn)*100,yy=Y(rc),fear=Tn*rc/100,law=F.fedTax(Tn);
  slices(0,Tn).forEach(sl=>{p+=rect(X(sl.lo),yy,X(sl.hi)-X(sl.lo),Y(sl.c)-yy,'var(--rj)',{op:0.16*s.cmp});});
  p+=rect(X(0),yy,X(Tn)-X(0),y0-yy,'none',{stroke:'var(--rj)',sw:2.5,dash:'7 5',op:s.cmp});
  p+=tag('the fear: '+$(fear),X(0)+10,yy-12*k,{s:13.5*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2,op:s.cmp})+tag('tax that does not exist: '+$(fear-law),X(Tn*0.55),Y((rc+12)/2)+6*k,{a:'middle',s:13.5*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2,op:s.cmp})+tag('the law: '+$(law),X(Tn*0.55),Y(5),{a:'middle',s:13.5*k,bw:2,bc:'var(--fg)',op:s.cmp});}
 /* the student's level line: what is above it must fill the gaps below it */
 if(s.bal>0.01){const y=Y(s.h);let up=0,dn=s.h*STD/100;
  p+=rect(X(-STD)+1,y,X(0)-X(-STD)-2,y0-y,'var(--card)',{stroke:'var(--fg)',sw:1.5,dash:'4 4',op:s.bal});
  slices(0,Tn).forEach(sl=>{const x=X(sl.lo),w=X(sl.hi)-x;if(sl.c>s.h){up+=(sl.c-s.h)*sl.amt/100;p+=rect(x+1,Y(sl.c)+1,w-2,y-Y(sl.c)-1,'var(--fg)',{op:0.4*s.bal});}else if(sl.c<s.h){dn+=(s.h-sl.c)*sl.amt/100;p+=rect(x+1,y,w-2,Y(sl.c)-y,'var(--card)',{stroke:'var(--fg)',sw:1.5,dash:'4 4',op:s.bal});}});
  const ok=Math.abs(up-dn)<3;
  p+=line(L,y,PR,y,'var(--rj)',{w:3.5,op:s.bal})+rect(PR-84*k,y-14*k,84*k,28*k,'var(--rj)',{rx:14*k,op:s.bal})+text('⇕ '+s.h.toFixed(1)+'¢',PR-42*k,y+5*k,{a:'middle',s:13.5*k,w:800,c:'#fff',op:s.bal});
  p+=tag('above the line: '+$(up),L+10,T+16*k,{s:13.5*k,bw:2,bc:'var(--fg)',op:s.bal})+tag('gaps below it: '+$(dn),L+10+196*k,T+16*k,{s:13.5*k,bw:1.5,bc:'var(--fg)',op:s.bal});
  if(ok)p+=tag('balanced',narrow?L+10:L+10+382*k,T+(narrow?42:16)*k,{s:13.5*k,c:'var(--good)',bc:'var(--good)',bw:2,op:s.bal});}
 if(s.lev>0.6){const a=(s.lev-0.6)/0.4,mr=F.marginal(Tn)*100;p+=tag('average: '+avg.toFixed(1)+'¢ of every dollar',X(-STD)+10,Y(avg)-12*k,{s:13.5*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2,op:a})+tag('your next dollar: '+Math.round(mr)+'¢',PR-8,Y(mr)-26*k,{a:'end',s:13.5*k,bw:2,bc:'var(--fg)',op:a});}
 /* zoomed in: show where this window sits on the whole line */
 if(xa>0.5&&s.rooms>0.5){const mx=L+10,my=T+8*k,mw=170*k,mh=11*k,fullX=s.free>0.5?240000:60000,MX=v=>mx+clamp(v,0,fullX)/fullX*mw;
  p+=rect(mx,my,mw,mh,'var(--track)',{rx:3});ROOMS.forEach((R,i)=>{if(R.lo<Tn)p+=rect(MX(R.lo),my,MX(Math.min(R.hi,Tn))-MX(R.lo),mh,RC[i]);if(R.hi<fullX)p+=line(MX(R.hi),my-2,MX(R.hi),my+mh+2,'var(--fg)',{w:1});});
  p+=rect(MX(xa),my-3,Math.max(5,MX(xb)-MX(xa)),mh+6,'none',{stroke:'var(--rj)',sw:2.5,rx:2})+(narrow?'':text('zoomed in',mx+mw+10,my+mh-1,{s:12*k,w:700,c:'var(--muted)'}));
  p+='<path d="M'+n1(L-8)+' '+n1(y0+5)+'l4 -10l5 10l4 -10" style="fill:none;stroke:var(--axis);stroke-width:1.5"/>';}
 p+=line(L,y0,PR,y0,'var(--axis)',{w:1.5});
 /* handles */
 const hx=X(Tn),hy=(T+y0)/2;
 if((s.pour>0.5&&!mem.pour)||(s.rdrag>0.5&&!mem.rz))p+=line(hx,T+40*k,hx,y0,'var(--fg)',{w:2})+rect(hx-8,hy-28*k,16,56*k,'var(--fg)',{rx:8})+text('⇔',hx,hy+5*k,{a:'middle',s:13*k,w:800,c:'var(--stage)'});
 if(s.free>0.5)p+=rect(hx-8,Y(F.marginal(Tn)*100*0.5)-24*k,16,48*k,'var(--fg)',{rx:8})+text('⇔',hx,Y(F.marginal(Tn)*100*0.5)+5*k,{a:'middle',s:13*k,w:800,c:'var(--stage)'});
 if(s.fbar==='raise')slices(T0,Tn).forEach((sl,j)=>{p+='<rect class="hit" data-sl="'+(j?'b':'a')+'" x="'+n1(X(sl.lo))+'" y="'+n1(T)+'" width="'+n1(X(sl.hi)-X(sl.lo))+'" height="'+n1(y0-T)+'" style="fill:transparent;cursor:pointer"/>';});
 if(s.pour>0.5||s.rdrag>0.5||s.free>0.5||s.bal>0.5)p+='<rect class="drag" x="'+n1(L)+'" y="'+n1(T)+'" width="'+n1(pw)+'" height="'+n1(y0-T+22*k)+'" style="fill:transparent;cursor:'+(s.bal>0.5?'ns-resize':'ew-resize')+'"/>';
 o+='<g style="opacity:'+(1-s.big).toFixed(2)+'">'+p+'</g>';
 /* the dollars themselves: a strip under the picture (large at first) */
 const sy=lerp(y0+5*k,H*0.4,s.big),shh=lerp(15*k,56*k,s.big),xs0=X(-STD),x0=X(0),x1=X(T0),x2=X(Math.max(T0,Tn));
 o+=rect(xs0,sy,x1-xs0,shh,'var(--seed)',{rx:2});
 if(s.std>0.01)o+=rect(xs0,sy,x0-xs0,shh,'var(--track)',{rx:2,stroke:'var(--axis)',sw:1,op:s.std});
 if(x2>x1)o+=rect(x1,sy,x2-x1,shh,'var(--rj)',{rx:2});
 if(s.big>0.5){const a=(s.big-0.5)*2;o+=text('$'+N(s.sal)+' of pay, one dollar after another',(xs0+x1)/2,sy-16*k,{a:'middle',s:18*k,w:800,op:a});
  o+=text('$'+N(STD),(xs0+x0)/2,sy+shh/2+6*k,{a:'middle',s:16*k,w:800,op:a*s.std})+text('standard deduction:',(xs0+x0)/2,sy+shh+22*k,{a:'middle',s:13*k,w:700,c:'var(--muted)',op:a*s.std})+text('no income tax',(xs0+x0)/2,sy+shh+40*k,{a:'middle',s:13*k,w:700,c:'var(--muted)',op:a*s.std});
  o+=text('$'+N(T0),(x0+x1)/2,sy+shh/2+6*k,{a:'middle',s:17*k,w:800,c:'var(--stage)',op:a})+text('taxable income',(x0+x1)/2,sy+shh+22*k,{a:'middle',s:13.5*k,w:700,op:a*s.std});}
 else{const a=1-s.big*2,wr=x2-x1,wo=x1-x0;if(wr>170*k)o+=text('your raise: '+N(Tn-T0)+' new dollars',(x1+x2)/2,sy+shh-3.5*k,{a:'middle',s:11.5*k,w:800,c:'#fff',op:a});else if(wr>46*k)o+=text('raise',(x1+x2)/2,sy+shh-3.5*k,{a:'middle',s:11.5*k,w:800,c:'#fff',op:a});
  if(wo>230*k&&s.free<0.5)o+=text(xa>0.5?'dollars you already had':'your '+N(T0)+' taxable dollars',(x0+x1)/2,sy+shh-3.5*k,{a:'middle',s:11.5*k,w:800,c:'var(--stage)',op:a});}
 /* the same picture as numbers */
 if(!narrow){const sx=W-RP+6,sr=W-14,sy2=T-6*k;
  if(s.big>0.5)o+=card(sx,sy2,sr,H,k,'YOUR PAY',[{l:'Pay for the year',v:$(s.sal)},{l:'Standard deduction',v:'−'+$(STD),op:s.std},{l:'Taxable income',v:$(T0),b:1,rule:1,op:s.std}]);
  else if(s.myth>0.5){const r0=F.marginal(T0)*100,r1=F.marginal(m.T1)*100,aft=s.mythAfter>0.98;o+=card(sx,sy2,sr,H,k,'THE FEAR',[{l:N(T0)+' × '+Math.round(r0)+'¢',v:$(T0*r0/100)},aft&&{l:N(m.T1)+' × '+Math.round(r1)+'¢',v:$(m.T1*r1/100)},aft&&{l:'Extra tax',v:$(m.T1*r1/100-T0*r0/100),b:1,rule:1,c:'var(--rj-ink)'},aft&&{l:'The raise',v:$(s.rz)}]);}
  else if(s.free>0.5)o+=raiseCard(sx,sy2,sr,H,k,s,m,6);
  else{const rows=[];if(s.std>0.5)rows.push({l:N(STD)+' × 0¢',v:'$0',sw:'var(--track)'});slices(0,Tn).forEach(sl=>rows.push({l:N(sl.amt)+' × '+sl.c+'¢',v:$(sl.tax),sw:RC[sl.i]}));
   rows.push({l:'Federal income tax',v:$(F.fedTax(Tn)),b:1,rule:1});
   if(isRaise&&s.std<0.5){rows.push({l:'Before the raise',v:$(m.tax0)});rows.push({l:'The raise cost',v:'+'+$(F.fedTax(Tn)-m.tax0),b:1,c:'var(--rj-ink)'});}
   if(s.lev>0.6||(s.bal>0.5&&mem.bal))rows.push({l:'Average rate',v:avg.toFixed(1)+'¢',b:1,c:'var(--rj-ink)',rule:1});
   if(s.lev>0.6)rows.push({l:'Next dollar',v:Math.round(F.marginal(Tn)*100)+'¢',b:1});
   o+=card(sx,sy2,sr,H,k,'FEDERAL INCOME TAX',rows);}
 }else if(s.big<0.5){const r1=F.marginal(m.T1)*100;
  o+=text(s.myth>0.5?'The fear: '+N(Tn)+' × '+Math.round(lerp(F.marginal(T0)*100,r1,s.mythAfter))+'¢':s.free>0.5?$(s.rz)+' raise: you keep '+$c(m.d.keep):'Federal income tax: '+$(F.fedTax(Tn))+(isRaise?' · the raise cost '+$(F.fedTax(Tn)-m.tax0):''),L,22*k,{s:14.5*k,w:800});
  if(s.lev>0.6)o+=text('average '+avg.toFixed(1)+'¢ · next dollar '+Math.round(F.marginal(Tn)*100)+'¢',L,42*k,{s:13*k,w:700,c:'var(--rj-ink)'});}
 return o;}
const TAXROWS=[['fed','Federal income tax','var(--t-fed)'],['co','Colorado income tax','var(--t-co)'],['ss','Social Security','var(--t-ss)'],['med','Medicare','var(--t-med)'],['fam','FAMLI','var(--t-fam)']];
function raiseCard(sx,sy,sr,H,k,s,m,rs){const rows=[{l:'The raise',v:$(s.rz),b:1}];TAXROWS.forEach((t,j)=>rows.push({l:t[1],v:'−'+$c(m.d[t[0]]),sw:t[2],op:clamp(rs-j,0,1)}));
 rows.push({l:'You keep',v:$c(m.d.keep),b:1,rule:1,c:'var(--good)',op:clamp(rs-4.5,0,1)*2});rows.push({l:'of each raise dollar',v:(m.share*100).toFixed(1)+'¢',op:clamp(rs-4.5,0,1)*2});
 return card(sx,sy,sr,H,k,'THE RAISE',rows);}

/* ---------- view R: the raise by itself, 100 cents tall ---------- */
function drawR(s,W,H,k){const narrow=W<700,RP=narrow?0:268,L=58*k,T=(narrow?58:44)*k,Bm=58*k,PR=narrow?W-14:W-RP-14,pw=PR-L,ph=H-T-Bm,y0=H-Bm,m=model(s),rz=s.rz;
 const X=v=>L+v/rz*pw,Y=c=>y0-c/100*ph;let o='';
 [0,25,50,75,100].forEach(c=>{o+=text(c+'¢',L-8,Y(c)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});});
 if(!narrow)o+=text('each raise dollar is 100¢',8,T-26*k,{s:12.5*k,c:'var(--muted)',w:600});
 const per={co:m.d.co/rz*100,ss:m.d.ss/rz*100,med:m.d.med/rz*100,fam:m.d.fam/rz*100};
 o+=rect(X(0),Y(100),pw,ph,'var(--keep)',{stroke:'var(--stage)',sw:1.5});
 m.sl.forEach((sl,j)=>{const x=X(sl.lo-m.T0),w=X(sl.hi-m.T0)-x,a0=clamp(s.rs,0,1);let top=100-sl.c;
  o+=rect(x,Y(100),w,Y(top)-Y(100),'var(--t-fed)',{op:a0,stroke:'var(--stage)',sw:1.5});
  if(w>80*k&&a0>0.5&&Y(top)-Y(100)>20*k)o+=text(sl.c+'¢ federal',x+w/2,(Y(100)+Y(top))/2+5*k,{a:'middle',s:14*k,w:800,c:'#fff',op:a0});
  TAXROWS.slice(1).forEach((t,i)=>{const c=per[t[0]];o+=rect(x,Y(top),w,Y(top-c)-Y(top),t[2],{op:clamp(s.rs-1-i,0,1),stroke:'var(--stage)',sw:1});top-=c;});
  if(w>110*k){if(s.rs>4.5)o+=text('keeps '+top.toFixed(2)+'¢',x+w/2,(Y(top)+y0)/2+2*k,{a:'middle',s:19*k,w:800,op:clamp(s.rs-4.5,0,1)*2})+text('of each dollar',x+w/2,(Y(top)+y0)/2+22*k,{a:'middle',s:13*k,w:600,op:clamp(s.rs-4.5,0,1)*2});
   else if(j===0)o+=text('100¢ in every raise dollar',X(rz/2),Y(30),{a:'middle',s:16*k,w:800,op:1-clamp(s.rs-3.5,0,1)});}
  if(sl.hi<m.T1-0.5){const bx=X(sl.hi-m.T0);o+=line(bx,T-4*k,bx,y0+6*k,'var(--fg)',{w:1.5,dash:'3 4'})+text('the $'+N(sl.hi)+' line',bx,T-10*k,{a:'middle',s:12.5*k,w:700,c:'var(--muted)'});}
  o+=text(N(sl.hi-m.T0),X(sl.hi-m.T0),y0+20*k,{a:'middle',s:12*k,c:'var(--muted)'});});
 o+=text('1',X(0),y0+20*k,{a:'middle',s:12*k,c:'var(--muted)'})+line(L,y0,PR,y0,'var(--axis)',{w:1.5})+text('the '+N(rz)+' raise dollars, in order',(L+PR)/2,y0+42*k,{a:'middle',s:13*k,c:'var(--muted)',w:600});
 if(!narrow)o+=raiseCard(W-RP+6,T-6*k,W-14,H,k,s,m,s.rs);
 else o+=text(s.rs>4.5?'You keep '+$c(m.d.keep)+' of the '+$(rz)+' raise':'The '+$(rz)+' raise, dollar by dollar',L,24*k,{s:14.5*k,w:800});
 return o;}

/* ---------- view G: every pay level at once ---------- */
const BENDS=ROOMS.slice(0,4).map(R=>STD+R.lo);
function drawG(s,W,H,k){const G=geoG(W,H,k),{narrow,RP,L,T,PR,pw,ph,y0}=G,X=g=>L+g/GMAX*pw,Y=d=>y0-d/GMAX*ph,gm=s.gm,gp=s.gp;let o='';
 for(let v=0;v<=GMAX;v+=25000){if(v>0)o+=line(L,Y(v),PR,Y(v),'var(--grid)')+line(X(v),T,X(v),y0,'var(--grid)');o+=text('$'+N(v),L-8,Y(v)+4.5*k,{a:'end',s:12*k,c:'var(--muted)'})+text('$'+N(v),X(v),y0+20*k,{a:'middle',s:12*k,c:'var(--muted)'});}
 o+=text('pay for the year',(L+PR)/2,y0+42*k,{a:'middle',s:13*k,c:'var(--muted)',w:600});
 o+=line(X(0),Y(0),X(GMAX),Y(GMAX),'var(--axis)',{w:2,dash:'6 5'});
 if(gm>0){const pts=[0];for(let g=1000;g<gm;g+=1000)pts.push(g);BENDS.forEach(b=>{if(b<gm)pts.push(b);});pts.push(gm);pts.sort((a,b)=>a-b);
  o+='<path d="M'+n1(X(0))+' '+n1(Y(0))+pts.map(g=>'L'+n1(X(g))+' '+n1(Y(net(g)))).join('')+'L'+n1(X(gm))+' '+n1(Y(gm))+'Z" style="fill:var(--bad);opacity:.09"/>';
  const f0=STD+12400;if(gm>f0){let d='';const fp=[];for(let g=f0+1;g<gm;g+=500)fp.push(g);BENDS.forEach(b=>{if(b>f0&&b<gm){fp.push(b-0.5);fp.push(b+0.5);}});fp.push(gm);fp.sort((a,b)=>a-b);fp.forEach((g,i)=>{d+=(i?'L':'M')+n1(X(g))+' '+n1(Y(fearNet(g)));});
   o+='<path d="'+d+'" style="fill:none;stroke:var(--rj);stroke-width:2.5;stroke-dasharray:6 4"/>';}
  o+='<path d="'+pts.map((g,i)=>(i?'L':'M')+n1(X(g))+' '+n1(Y(net(g)))).join('')+'" style="fill:none;stroke:var(--good);stroke-width:4;stroke-linejoin:round;stroke-linecap:round"/>';
  BENDS.forEach((b,i)=>{if(b<=gm)o+='<circle cx="'+n1(X(b))+'" cy="'+n1(Y(net(b)))+'" r="'+n1(4.5*k)+'" style="fill:var(--stage);stroke:var(--fg);stroke-width:2"/>'+text(ROOMS[i].c+'¢ room',X(b)-8,Y(net(b))-9*k,{a:'end',s:12*k,w:700,halo:1});});
  const cb=STD+50400;if(gm>cb+4000)o+=tag('the fear: take-home drops '+$((ROOMS[2].r-ROOMS[1].r)*ROOMS[1].hi)+' here',X(cb)+14,Y(fearNet(cb+0.5))+34*k,{s:13*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2});
  if(gm>=100000)o+=text('taxes',X(92000),Y((92000+net(92000))/2)+5*k,{a:'middle',s:13*k,w:700,c:'var(--bad)'});}
 /* legend */
 const lx=L+16,ly=T+18*k;
 o+=line(lx,ly-4,lx+26,ly-4,'var(--axis)',{w:2,dash:'6 5'})+text('pay before taxes',lx+34,ly,{s:12.5*k,w:700})+line(lx,ly+20*k-4,lx+26,ly+20*k-4,'var(--good)',{w:4})+text('take-home pay',lx+34,ly+20*k,{s:12.5*k,w:700})+line(lx,ly+40*k-4,lx+26,ly+40*k-4,'var(--rj)',{w:2.5,dash:'6 4'})+text('what the fear predicts',lx+34,ly+40*k,{s:12.5*k,w:700,c:'var(--rj-ink)'});
 /* cursor */
 o+=line(X(gp),Y(gp),X(gp),y0,'var(--fg)',{w:1.5,dash:'3 4'})+'<circle cx="'+n1(X(gp))+'" cy="'+n1(Y(net(gp)))+'" r="'+n1(6*k)+'" style="fill:var(--good);stroke:var(--stage);stroke-width:2"/>'+rect(X(gp)-24*k,y0-10*k,48*k,20*k,'var(--fg)',{rx:10*k})+text('⇔',X(gp),y0+4.5*k,{a:'middle',s:13*k,w:800,c:'var(--stage)'});
 o+=line(L,y0,PR,y0,'var(--axis)',{w:1.5})+line(L,T,L,y0,'var(--axis)',{w:1.5});
 o+='<rect class="drag" x="'+n1(L-10)+'" y="'+n1(T)+'" width="'+n1(pw+20)+'" height="'+n1(y0-T+24*k)+'" style="fill:transparent;cursor:ew-resize"/>';
 const kc=keepC(gp),T_=gp-STD;
 if(!narrow)o+=card(W-RP+6,T-6*k,W-14,H,k,'AT '+$(gp)+' OF PAY',[{l:'Take-home pay',v:$(net(gp)),b:1,c:'var(--good)'},{l:'All taxes',v:$(gp-net(gp))},{l:'Next dollar keeps',v:kc.toFixed(2)+'¢',b:1,rule:1},{l:'The fear says',v:T_>12400?$(fearNet(gp)):'the same',c:'var(--rj-ink)'}]);
 else o+=text($(gp)+' of pay: take home '+$(net(gp)),L,22*k,{s:14.5*k,w:800})+text('the next dollar keeps '+kc.toFixed(2)+'¢',L,42*k,{s:13*k,w:700,c:'var(--good)'});
 return o;}

/* ---------- small pictures for the check ---------- */
function miniThree(){const W=720,H=190,pw=200,gap=40,T=34,y0=H-30,ph=y0-T,Tx=60000,Yc=c=>y0-c/26*ph;let o='';
 ['A','B','C'].forEach((nm,i)=>{const L=20+i*(pw+gap),X=v=>L+v/Tx*pw;
  o+=text(nm,L,22,{s:18,w:800});
  if(i===0)o+=rect(X(0),Yc(22),pw,y0-Yc(22),'var(--t-med)',{stroke:'var(--stage)',sw:1.5})+text('22¢',X(30000),Yc(11)+5,{a:'middle',s:15,w:800,c:'#fff'});
  if(i===1)slices(0,Tx).forEach(sl=>{o+=rect(X(sl.lo),Yc(sl.c),X(sl.hi)-X(sl.lo),y0-Yc(sl.c),RC[sl.i],{stroke:'var(--stage)',sw:1.5})+text(sl.c+'¢',(X(sl.lo)+X(sl.hi))/2,Yc(sl.c)-6,{a:'middle',s:13,w:800});});
  if(i===2)o+=rect(X(50400),Yc(22),X(Tx)-X(50400),y0-Yc(22),'var(--t-med)',{stroke:'var(--stage)',sw:1.5})+text('22¢',X(55200),Yc(22)-6,{a:'middle',s:13,w:800})+text('0¢',X(25000),y0-8,{a:'middle',s:13,w:800,c:'var(--muted)'});
  o+=line(L,y0,L+pw,y0,'var(--axis)',{w:1.5})+text('$0',L,y0+17,{s:12,c:'var(--muted)'})+text('$60,000',L+pw,y0+17,{a:'end',s:12,c:'var(--muted)'});});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Three pictures of the tax on 60,000 taxable dollars">'+o+'</svg>';}

/* ---------- steps ---------- */
const PARTS=['The fear','The law','What you keep','Change it','Tell it'];
const B={view:'B'},WIDE={xa:0,xb:56000},ZOOM={xa:47000,xb:54000},YEAR={xa:-STD,xb:56000,std:1,ymax:26};
const st=(...a)=>Object.assign({},B,...a);
const STEPS=[
 {part:-1,title:'Can a raise cost you money?',st:{view:'H'},choices:[['down','It goes down'],['half','It goes up, by half the raise or less'],['most','It goes up, by more than half the raise']],locked:'Locked in. Now find out which dollars the 22% touches.',
  t:'You earn $65,000 a year and your manager offers a $3,000 raise. A coworker warns you: “Careful. That puts you in the 22% bracket. You could end up taking home less.” <b>What happens to your take-home pay?</b>',
  alt:'Take-home pay is what reaches your bank account after taxes. A bracket is a range of income with its own tax rate. Go with your gut. There is no math yet.'},
 {part:0,title:'Which dollars are taxed',st:st(YEAR,{big:1,rooms:0,fill:0}),
  play:async ok=>{const S=Story.S;S.big=1;S.xa=-STD;S.xb=56000;S.std=0;S.rooms=0;S.fill=0;Story.redraw();await wait(700);if(!ok())return;await tw({std:1},1100);},
  t:'Line up your $65,000, one dollar after another. In 2026, federal income tax skips the first $16,100 a single person earns. That amount is the <b>standard deduction</b>. The $48,900 that is left is your <b>taxable income</b>.',
  alt:'$65,000 − $16,100 = $48,900. Only those 48,900 dollars are in line for federal income tax. From here on, the picture shows them in order, with the first dollar on the left.'},
 {part:0,title:'The fear, drawn',st:st(WIDE,{T:T1D,myth:1,mythAfter:1,rooms:0,fill:0}),
  play:async ok=>{const S=Story.S;S.T=T0D;S.rooms=0;S.fill=0;S.myth=0;S.mythAfter=0;await tw({big:0,xa:0,std:0},800);if(!ok())return;await tw({myth:1},700);if(!ok())return;await wait(1500);if(!ok())return;await tw({T:T1D},1100);if(!ok())return;await wait(600);if(!ok())return;await tw({mythAfter:1},1500);},
  t:'This is the picture in your coworker\'s head: one rate on every dollar. At 12¢ a dollar, 48,900 dollars owe $5,868. Add the raise, cross into the 22% bracket, and the whole rectangle jumps to 22¢.',
  t2:'By that picture, a $3,000 raise adds <b>$5,550</b> of tax. <b>That is not the law.</b>',
  alt:'22% means 22¢ out of each dollar. The fear is that all 51,900 dollars get charged 22¢: 51,900 × 22¢ = $11,418.'},
 {part:1,title:'Brackets are rooms',st:st(WIDE,{T:0,math:1,pour:1}),keep:['T'],
  todo:(S,m)=>!!m.pour,move:'Drag across the picture to pour in your 48,900 taxable dollars.',auto:async ok=>{await tw({T:T0D},2800,lin);Story.mem.pour=1;},
  t:'The law sorts your taxable dollars into <b>brackets</b>. Picture each bracket as a room with its own rate. Dollars fill the 10¢ room first. When it is full, the next dollars go into the 12¢ room.',
  t2:'12,400 dollars at 10¢ and 36,500 at 12¢: <b>$5,620</b> of federal income tax. The tax is the colored area.',
  alt:'A dollar pays the rate of the room it lands in, and no other rate. The 10¢ room holds the first 12,400 taxable dollars. The 12¢ room holds the next 38,000.'},
 {part:1,title:'Now the raise',st:st(ZOOM,{T:T0D,rdrag:1}),keep:['T'],
  play:async ok=>{await tw({xa:ZOOM.xa,xb:ZOOM.xb,math:0},1500);},
  todo:(S,m)=>!!m.rz,move:'Drag to the right to add the raise, dollar by dollar.',auto:async ok=>{await tw({T:T1D},2600,lin);Story.mem.rz=1;},
  t:'Zoom in on the $50,400 line, where the 12¢ room ends and the 22¢ room begins. Your raise is 3,000 new dollars. They go in after the dollars you already have.',
  t2:'The first 1,500 finished the 12¢ room: $180. The next 1,500 landed in the 22¢ room: $330. The raise cost <b>$510</b>, and <b>not one of your old dollars moved</b>.',
  alt:'Only the dollars past the $50,400 line pay 22¢. Here that is 1,500 dollars. Everything to the left of the raise is taxed exactly as it was before.'},
 {part:1,title:'New dollars × rate, room by room',st:st(ZOOM,{T:T1D,fbar:'raise'}),
  t:'The tax on a raise is each group of new dollars times the rate of its room. <b>Tap a part of the formula</b> to find it in the picture.',
  alt:'1,500 × 12¢ = $180 and 1,500 × 22¢ = $330. Together that is $510. A rate of 12¢ on the dollar is the same as 12%, or 0.12.'},
 {part:1,title:'What the fear got wrong',st:st(WIDE,{T:T1D,cmp:1}),
  play:async ok=>{await tw({xa:0,xb:56000},1300);if(!ok())return;await tw({cmp:1},900);},
  t:'Zoom back out. The dashed red box is the fear: 22¢ on every dollar, $11,418. The colored steps are the law: $6,130.',
  t2:'The pale red space is <b>$5,288 of tax that does not exist</b>. The 22¢ rate touches only the 1,500 dollars inside its own room.',
  alt:'The fear charges every dollar the highest rate. The law charges each dollar the rate of the room it sits in, so most of your dollars still pay 10¢ or 12¢.'},
 {part:2,title:'The raise, dollar by dollar',st:{view:'R',rs:6},
  play:async ok=>{for(let i=1;i<=5;i++){await tw({rs:i},650);if(!ok())return;await wait(i===1?900:450);if(!ok())return;}await tw({rs:6},700);},
  t:'Here is the raise by itself: 3,000 dollars wide and 100¢ tall. Federal income tax takes 12¢ from each of the first 1,500 and 22¢ from the rest. Colorado takes 4.4¢. Social Security, Medicare and FAMLI take 8.09¢.',
  t2:()=>{const g=Story.gut;return 'You keep <b>$2,115.30 of the $3,000</b>, about 70¢ of each new dollar.'+(g?(g==='most'?' Your gut was right.':' Your gut said take-home pay '+(g==='down'?'goes down':'goes up by half or less')+'.'):'');},
  alt:'$510 federal + $132 Colorado + $186 Social Security + $43.50 Medicare + $13.20 FAMLI = $884.70 in taxes. $3,000 − $884.70 = $2,115.30 kept.'},
 {part:2,title:'It bends. It never drops.',st:{view:'G',gp:0,gm:0},
  todo:(S,m)=>!!m.g,move:'Drag from $0 to $130,000 and watch the green line at each new room.',auto:async ok=>{await tw({gp:GMAX,gm:GMAX},4200,lin);Story.mem.g=1;},
  t:'Now every pay level at once. Across is pay for the year. The green line is take-home pay. The red dashes are what the fear predicts.',
  t2:'The green line bends where a new room starts, and it never turns down. The cliff the fear predicts at $66,500 of pay is not there. <b>With brackets, more pay always means more take-home pay.</b>',
  alt:'A higher room takes more cents from each new dollar, so the line gets less steep. It could only turn down if a room took more than 100¢ from a dollar. The steepest stretch here still leaves 63.51¢ of each new dollar with you.'},
 {part:2,title:'Two rates',st:st(YEAR,{T:T1D,bal:1,h:15}),keep:['h'],
  todo:(S,m)=>!!m.bal,move:'Drag the red line until the part above it exactly fills the gaps below it.',auto:async ok=>{await tw({h:avgOf({T:T1D})},2200);Story.mem.bal=1;},
  t:'Back to your year after the raise: all 68,000 dollars of pay, with the 16,100 untaxed dollars on the left at 0¢. Your <b>average rate</b> is the one flat rate that would collect the same tax.',
  t2:'Balanced at <b>9.0¢</b>. Spread over every dollar you earned, federal income tax took about 9¢ of each.',
  alt:'Think of the colored steps as wet sand. Push the tall parts down and the sand fills the low parts. The flat height you end at is the average rate.'},
 {part:2,title:'Level it',st:st(YEAR,{T:T1D,lev:1,fbar:'avg'}),
  play:async ok=>{await tw({bal:0},300);if(!ok())return;await tw({lev:1},3200);},
  t:'Pour the tops into the gaps: one flat rectangle, 68,000 dollars wide and 9.0¢ tall. It holds the same $6,130.',
  t2:'Your <b>average rate is 9¢</b>. Your <b>next dollar pays 22¢</b>. Both are true. To price a raise, overtime or a side job, use the next-dollar rate.',
  alt:'Teachers call the next-dollar rate the marginal rate, and the average rate the effective rate. $6,130 ÷ $68,000 = 0.0901, about 9%.'},
 {part:3,title:'Your salary, your raise',st:st({xa:42000,xb:55000,T:T1D,free:1,fbar:'drive'}),
  t:'You drive. <b>Drag the right edge of the picture to change the raise</b>, or use the sliders. Watch which rooms the new dollars land in.',
  alt:'The red outlines are the raise. The small bar at the top left shows where this close-up sits on the whole line of taxable dollars.'},
 {part:4,title:'Check yourself',st:{view:'P',panel:'check'},
  t:'Three quick ones. Each asks you to connect a picture, a formula and a story.',
  alt:'Wrong answers get a hint that points at the picture. Try again as many times as you need.'},
 {part:4,title:'Tell the story',st:{view:'P',panel:'story'},
  t:'Math is finished when you can tell its story. Put the pictures in order, then write three sentences and copy your work into Canvas.',
  alt:'Use the picture words: bracket, room, rate, raise, taxable, next dollar, average. If you get stuck, go back to "Now the raise" and describe what you see.'}
];

/* ---------- formula strip ---------- */
const tokB=(hl,val,name)=>'<button type="button" class="tok" data-hl="'+hl+'" aria-pressed="'+(Story.S.hl===hl)+'"><b>'+val+'</b><small>'+name+'</small></button>';
const tokS=(val,name,cls)=>'<span class="tok'+(cls?' '+cls:'')+'"><b>'+val+'</b><small>'+name+'</small></span>';
const OP=s=>'<span class="op">'+s+'</span>';
function fbarHtml(S){const f=S.fbar;if(!f)return null;const M=model(S);
 if(f==='raise'){const sl=M.sl;return '<div class="frow">'+sl.map((x,j)=>tokB(j?'b':'a',N(x.amt)+' × '+x.c+'¢','new dollars in the '+x.c+'¢ room × its rate')).join(OP('+'))+OP('=')+tokS(money(M.tax1-M.tax0),'extra federal tax','diff')+
   '<span class="letters">In letters: <code>tax on a raise = new dollars × rate, room by room</code></span></div>'+
   '<p class="hint"><b>Tap a part of the formula</b>, or a red slice in the picture. Your old dollars are not in the formula: their tax did not change.</p>';}
 if(f==='avg')return '<div class="frow">'+tokS($(M.tax1),'federal income tax for the year')+OP('÷')+tokS($(S.sal+S.rz),'all your pay')+OP('=')+tokS((M.tax1/(S.sal+S.rz)*100).toFixed(1)+'¢','from each dollar, on average','diff')+
   '<span class="letters">In letters: <code>average rate = tax ÷ pay</code></span></div>'+
   '<p class="hint">The area is the tax. The width is all your pay. The flat height is the average rate. The height of the last room you reached is the rate on your next dollar.</p>';
 if(f==='drive')return '<div class="drive" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)">'+
   '<div class="ctl"><label for="c-sal">Salary before the raise <output id="o-sal"></output></label><input type="range" id="c-sal" min="30000" max="180000" step="1000" value="'+S.sal+'"></div>'+
   '<div class="ctl"><label for="c-rz">The raise, per year <output id="o-rz"></output></label><input type="range" id="c-rz" min="500" max="20000" step="500" value="'+S.rz+'"></div></div>'+
   '<p class="narr" id="narr" aria-live="polite"></p><div class="quests" id="quests"></div>';
 return null;}
const QUESTS=[
 {id:'one',q:'Fit the whole raise in one room.',ask:'How many rates touch it?',a:'One. Every raise dollar pays that room\'s rate, and no dollar pays more.'},
 {id:'c24',q:'Cross into the 24¢ room.',ask:'Does the tax on your old dollars change?',a:'No. Only the dollars past the $105,700 line pay 24¢. Everything to the left is taxed exactly as before.'},
 {id:'low',q:'Get the share you keep under 65%.',ask:'Which room is the raise in?',a:'The 24¢ room: 24 + 4.4 + 6.2 + 1.45 + 0.44 = 36.49¢ gone from each new dollar. You still keep 63.51¢.'},
 {id:'cap',q:'Push your pay past $190,000 with the raise.',ask:'Does the share you keep go up or down?',a:'Up. Social Security and FAMLI stop at $184,500 of pay, so the raise dollars above that line keep more.'}
];
const qdone={};
function updateDrive(){const S=Story.S;if(S.fbar!=='drive'||!el('o-sal'))return;const M=model(S);
 el('o-sal').textContent=$(S.sal);el('o-rz').textContent=$(S.rz);if(+el('c-rz').value!==S.rz)el('c-rz').value=S.rz;if(+el('c-sal').value!==S.sal)el('c-sal').value=S.sal;
 el('narr').innerHTML='Of the '+$(S.rz)+' raise, '+M.sl.map(x=>N(x.amt)+' dollars pay '+x.c+'¢').join(' and ')+': <b>'+$c(M.d.fed)+'</b> of federal income tax. After every tax you keep <b>'+$c(M.d.keep)+'</b>, or '+pct(M.share)+' of the raise. Your first '+$(S.sal)+' is taxed exactly as before.';
 if(M.sl.length===1)qdone.one=1;if(M.T0<105700&&M.T1>105700)qdone.c24=1;if(M.share<0.65)qdone.low=1;if(S.sal+S.rz>=190000)qdone.cap=1;
 el('quests').innerHTML=QUESTS.map(q=>'<div class="quest'+(qdone[q.id]?' done':'')+'"><span class="mark">'+(qdone[q.id]?'done':'try')+'</span><b>'+q.q+'</b><p>'+(qdone[q.id]?q.a:q.ask)+'</p></div>').join('');}
function fitWin(M,rz){const pad=Math.max(2*rz,6000),xa=Math.max(0,Math.floor((M.T0-pad)/1000)*1000),xb=Math.ceil((M.T1+Math.max(rz,3000))/1000)*1000;let mc=0;ROOMS.forEach(R=>{if(R.lo<xb)mc=R.c;});return {xa,xb,ymax:mc>22?mc+16:30};}
function snap(){const M=model(Story.S);return {T0:M.T0,T1:M.T1};}
function refit(ms){const S=Story.S,f=fitWin(model(S),S.rz);Story.dropTweens();Story.tw({xa:f.xa,xb:f.xb,ymax:f.ymax},ms||450);}
function onGhostEnd(S){if(S.fbar==='drive')refit(600);}
function bindFbar(box,S){if(S.fbar!=='drive')return;
 el('c-sal').addEventListener('input',()=>{const S=Story.S;Story.ghost(snap);S.sal=+el('c-sal').value;S.T=model(S).T1;refit();updateDrive();});
 el('c-rz').addEventListener('input',()=>{const S=Story.S;Story.ghost(snap);S.rz=+el('c-rz').value;S.T=model(S).T1;refit();updateDrive();});
 updateDrive();}

/* ---------- panels ---------- */
const ans={q1:null,q2:null,q3:null},tries={q1:0,q2:0,q3:0},story={},q2v={};
function panelHtml(p){
 if(p==='check')return '<div class="qcard" id="q1"><h2>1. Which picture is the law?</h2><p>Jordan has $60,000 of taxable income, which reaches into the 22¢ room. Which picture shows Jordan\'s federal income tax?</p>'+
   '<div class="minibox" style="max-width:760px">'+miniThree()+'</div>'+
   '<div class="opts" data-q="q1" style="margin-top:10px"><button type="button" data-v="A">Picture A</button><button type="button" data-v="B">Picture B</button><button type="button" data-v="C">Picture C</button></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q2"><h2>2. Turn a story into a formula</h2><p>A raise adds 2,000 taxable dollars, and all of them land in the 22¢ room. Build the extra federal income tax.</p>'+
   '<div class="build"><span class="tok" id="t-dol"><b><input id="i-dol" inputmode="decimal" aria-label="new dollars" autocomplete="off"></b><small>new dollars</small></span>'+OP('×')+'<span class="tok" id="t-rt"><b><input id="i-rt" inputmode="decimal" aria-label="cents from each dollar" autocomplete="off"><span class="unit">¢</span></b><small>cents from each dollar</small></span>'+
   '<button type="button" class="btn" id="q2check">Check my formula</button></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q3"><h2>3. Which rate prices the next dollar?</h2><p>Your next-dollar rate is 22¢ and your average rate is 9¢. A side job pays you $1,000 more. About how much more federal income tax do you owe?</p>'+
   '<div class="opts" data-q="q3"><button type="button" data-v="90">$90</button><button type="button" data-v="220">$220</button><button type="button" data-v="1000">$1,000</button></div><div class="fbslot"></div></div>';
 return Story.orderCard([st(WIDE,{T:T1D,myth:1,mythAfter:1,rooms:0,fill:0}),st(WIDE,{T:T0D,math:1}),st(ZOOM,{T:T1D}),{view:'R',rs:6},st(YEAR,{T:T1D,lev:1})])+
  '<div class="qcard"><h2>Tell the story of the raise</h2><p>Write it for a friend who has not seen the picture.</p><div class="story">'+
   '<div><label for="s1">Beginning<small>What did the coworker fear, and what would that picture look like?</small></label><textarea id="s1" placeholder="My coworker thought the 22% would…"></textarea></div>'+
   '<div><label for="s2">Middle<small>Where did the raise dollars land, and what did each room charge?</small></label><textarea id="s2" placeholder="The first 1,500 new dollars… The next 1,500…"></textarea></div>'+
   '<div><label for="s3">End<small>What happened to take-home pay, and why can a bracket never shrink it?</small></label><textarea id="s3" placeholder="I kept… because each rate only touches…"></textarea></div></div>'+
   Story.wordsRow(['bracket','room','rate','raise','taxable','next dollar','average'])+
   '<div class="copyrow"><button type="button" class="btn primary" id="copyb">Copy for Canvas</button><span id="copymsg">Copies your gut pick, your checks and your story.</span></div><textarea id="copyfallback" hidden readonly aria-label="Your work, to copy"></textarea></div>'+
  '<div class="qcard"><h2>Use it</h2><div class="uses">'+
   '<div class="use"><b>Do:</b> look up next year’s bracket table when the IRS publishes it each fall, and find your bracket. <b>Why:</b> tax software and payroll systems both work through that table one bracket at a time, exactly like this tool.</div>'+
   '<div class="use"><b>Do:</b> when you decide whether overtime, a second job or a bonus is worth it, use your marginal rate. <b>Why:</b> the extra dollars are taxed at the next-dollar rate, not your average rate.</div>'+
   '<div class="use"><b>Do:</b> when you save in a traditional 401(k) or IRA, figure the tax you save at your marginal rate. <b>Why:</b> saving there lowers taxable income, so each dollar saved cuts your tax by your marginal rate, not your average rate.</div></div>'+
   '<p style="margin:10px 0 0">Build it yourself: <a href="excel.html#build-brackets">tax a salary through the brackets in a spreadsheet</a>, one step at a time.</p></div>'+
  Story.voteCard()+
  '<details class="about"><summary>About this model</summary><p><b>Model.</b> 2026 federal brackets and standard deduction for a single filer (IRS Rev. Proc. 2025-32): 10% to $12,400, 12% to $50,400, 22% to $105,700, 24% to $201,775, 32% to $256,225, 35% to $640,600, then 37%. Take-home pay also subtracts Colorado’s 4.4% of taxable income, Social Security (6.2% up to $184,500), Medicare (1.45%) and Colorado FAMLI (0.44%).</p><p><b>What this number hides.</b> Some benefits phase out as income rises, such as the Earned Income Tax Credit and some student aid. Those can take more than the bracket rate from a raise, for a while. The brackets alone never can.</p><p><b>How good is this number?</b> The brackets are exact for 2026. A real return may include other income, credits or itemized deductions.</p><p><b>This is a simplified model, not tax advice.</b></p></details>';
}
const FB={
 q1:{B:[1,'Yes. Each dollar pays the rate of the room it lands in: 10¢ on the first 12,400, 12¢ on the next 38,000, and 22¢ only on the last 9,600.'],A:[0,'That is the fear: one rate on every dollar. Only the dollars past the $50,400 line are in the 22¢ room. Try again.'],C:[0,'The dollars before the $50,400 line are not free. They pay 10¢ and 12¢ in their own rooms. Try again.']},
 q3:{220:[1,'Yes. New dollars pay the next-dollar rate: 1,000 × 22¢ = $220. The average rate describes the whole year, not the next dollar.'],90:[0,'That uses the average rate, which describes the whole year. New dollars land in the room you have reached. Try again.'],1000:[0,'That would be a rate of 100¢ on the dollar. The room you have reached charges 22¢. Try again.']}
};
function setFb(cardEl,ok,msg){cardEl.querySelector('.fbslot').innerHTML='<p class="fb '+(ok?'ok':'no')+'" role="status">'+msg+'</p>';}
function pickOpt(q,v,silent){const c=el(q),f=FB[q][v];if(!f)return;if(!silent&&ans[q]!=='ok')tries[q]++;
 c.querySelectorAll('.opts button').forEach(b=>{b.classList.remove('right','wrong');if(b.dataset.v===String(v))b.classList.add(f[0]?'right':'wrong');});
 setFb(c,f[0],f[1]);if(f[0])ans[q]='ok';ans[q+'v']=v;}
function checkQ2(silent){const c=el('q2'),num=id=>parseFloat(String(el(id).value).replace(/[$,%¢\s]/g,''));
 const d=num('i-dol');let r=num('i-rt');q2v.dol=el('i-dol').value;q2v.rt=el('i-rt').value;
 if(isNaN(d)||isNaN(r)){if(!silent)setFb(c,false,'Fill in both boxes: the new dollars and the cents each one pays.');return;}
 if(!silent&&ans.q2!=='ok')tries.q2++;if(r>0&&r<1)r=r*100;const okD=Math.abs(d-2000)<0.5,okR=Math.abs(r-22)<0.01;
 el('t-dol').className='tok '+(okD?'ok':'bad');el('t-rt').className='tok '+(okR?'ok':'bad');
 if(okD&&okR){ans.q2='ok';setFb(c,true,'Yes. 2,000 × 22¢ = $440 more federal income tax. The other $1,560 has not been taken by this tax.');}
 else setFb(c,false,(!okD?'The new dollars are the 2,000 the raise adds. ':'')+(!okR?'Each one pays the rate of the room it lands in: 22¢. ':'')+'Fix the red box and check again.');}
function bindPanel(panel,p){
 if(p==='check'){
  panel.querySelectorAll('.opts[data-q]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pickOpt(g.dataset.q,b.dataset.v);}));
  el('q2check').addEventListener('click',()=>checkQ2(false));
  ['i-dol','i-rt'].forEach(id=>el(id).addEventListener('keydown',e=>{if(e.key==='Enter')checkQ2(false);}));
  if(ans.q1v)pickOpt('q1',ans.q1v,true);if(ans.q3v)pickOpt('q3',ans.q3v,true);
  if(q2v.dol!=null){el('i-dol').value=q2v.dol;el('i-rt').value=q2v.rt;checkQ2(true);}
  return;}
 ['s1','s2','s3'].forEach(id=>{el(id).value=story[id]||'';el(id).addEventListener('input',e=>{story[id]=e.target.value;});});
 el('copyb').addEventListener('click',()=>Story.copy(workText(),el('copymsg'),el('copyfallback')));
}
function workText(){const mark=q=>ans[q]==='ok'?'correct'+(tries[q]>1?' (try '+tries[q]+')':''):'not answered yet',g=Story.gut;
 return ['Can a raise cost me money? (Raider FinanceLab)','My gut pick: take-home pay '+(g?GUT[g]:'(none)'),'Check 1, which picture is the law: '+mark('q1'),'Check 2, tax on a raise: '+mark('q2')+(ans.q2==='ok'?'  2,000 x 22 cents = $440':''),'Check 3, next-dollar rate: '+mark('q3'),'Picture challenges done: '+Object.keys(qdone).length+' of 4',Story.orderLine(),'','My story','Beginning: '+(story.s1||''),'Middle: '+(story.s2||''),'End: '+(story.s3||'')].join('\n');}

function draw(S,W,H,k){return S.view==='H'?drawH(S,W,H,k):S.view==='R'?drawR(S,W,H,k):S.view==='G'?drawG(S,W,H,k):drawB(S,W,H,k);}
function onHit(d,S){if(d.sl&&S.fbar==='raise'){S.hl=S.hl===d.sl?null:d.sl;return true;}return false;}
function onDrag(p,S,W,H,k,mem,phase){
 if(S.view==='G'){const g=geoG(W,H,k),xv=(p.x-g.L)/g.pw*GMAX;let gp=clamp(Math.round(xv/500)*500,0,GMAX);if(xv>GMAX-1500)gp=GMAX;S.gp=gp;S.gm=Math.max(S.gm,gp);if(S.gm>=GMAX)mem.g=1;return false;}
 if(S.view!=='B')return false;const G=geo(W,H,k),xv=S.xa+(p.x-G.L)/G.pw*(S.xb-S.xa),yv=(G.y0-p.y)/G.ph*S.ymax,M=model(S);
 if(S.pour>0.5){if(mem.pour)return false;let t=clamp(Math.round(xv/100)*100,0,M.T0);if(xv>M.T0-700){t=M.T0;mem.pour=1;}S.T=t;return false;}
 if(S.rdrag>0.5){if(mem.rz)return false;let t=clamp(Math.round(xv/100)*100,M.T0,M.T1);if(xv>M.T1-150){t=M.T1;mem.rz=1;}S.T=t;return false;}
 if(S.bal>0.5){if(mem.bal)return false;const a=avgOf(S);let h=clamp(Math.round(yv*10)/10,1,27);if(Math.abs(h-a)<0.3){h=a;mem.bal=1;}S.h=h;return false;}
 if(S.free>0.5){if(phase==='start')Story.ghost(snap);const rz=clamp(Math.round((xv-M.T0)/500)*500,500,20000);
  if(rz!==S.rz){S.rz=rz;const M2=model(S);S.T=M2.T1;if(M2.T1>S.xb-(S.xb-S.xa)*0.04)S.xb=M2.T1+(S.xb-S.xa)*0.1;updateDrive();}return false;}
 return false;}
function onStep(S){const m=Story.mem;
 if(S.view==='B'){if(S.pour>0.5&&m.pour)S.T=T0D;if(S.rdrag>0.5&&m.rz)S.T=T1D;if(S.bal>0.5&&m.bal)S.h=avgOf(S);if(S.free>0.5)S.T=model(S).T1;}
 if(S.view==='G'&&m.g){S.gm=GMAX;S.gp=GMAX;}
 if(S.fbar==='drive')updateDrive();Story.redraw();}
Story.start({id:'brackets',lab:'FinanceLab',title:'Can a raise cost me money?',DEF,PARTS,STEPS,draw,fbar:fbarHtml,bindFbar,panel:panelHtml,bindPanel,onHit,onDrag,onGhostEnd,onStep});
})();
