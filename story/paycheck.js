/* Where did my paycheck go? Story version (pilot, Nov 2026). Needs fin.js and story/kit.js.
   The picture: width = dollars earned, height = the 100 cents in each dollar. Every tax is a rectangle, cents per dollar × dollars.
   Social Security, Medicare and Colorado FAMLI take the same cents from every dollar. Income taxes skip the first $16,100
   of the year (the standard deduction), then go up in steps. All rates and limits come from fin.js (2026, single Colorado worker). */
(function(){
'use strict';
const {$,$c,money,clamp,lerp,ease,lin,esc,el,n1,rect,text,line,tag,ticks}=Story.h,tw=Story.tw,F=window.FIN;
const STD=F.STD,TY=F.r2(F.MINWAGE*15*52),TC=F.check(TY,26),FLAT=100*(F.SS+F.MED+F.FAMLI);
const ORDER=['ss','med','fam','fed','co'];
const TX={ss:{name:'Social Security',c:'var(--t-ss)',rate:F.SS},med:{name:'Medicare',c:'var(--t-med)',rate:F.MED},fam:{name:'Colorado FAMLI',c:'var(--t-fam)',rate:F.FAMLI},fed:{name:'Federal income tax',c:'var(--t-fed)'},co:{name:'Colorado income tax',c:'var(--t-co)'}};
const cents=v=>(Math.round(v*100)/100).toString()+'¢';
const yearTax=yr=>{const T=Math.max(0,yr-STD);return {ss:F.SS*Math.min(yr,F.SSCAP),med:F.MED*yr,fam:F.FAMLI*Math.min(yr,F.SSCAP),fed:F.fedTax(T),co:F.CO*T};};
const sumTax=Y=>Y.ss+Y.med+Y.fam+Y.fed+Y.co;
/* cents taken from the dollar at position d of the year (lev 0 = as each dollar is taxed, 1 = spread evenly over the year) */
function cuts(d,yr,lev){const Y=yearTax(yr),T=d-STD,sf=T>=0?F.marginal(T+0.01)*100:0,sc=T>=0?F.CO*100:0;
 return {ss:F.SS*100,med:F.MED*100,fam:F.FAMLI*100,fed:lerp(sf,yr>0?Y.fed/yr*100:0,lev),co:lerp(sc,yr>0?Y.co/yr*100:0,lev)};}
const gone=c=>c.ss+c.med+c.fam+c.fed+c.co;
function edges(yr){const b=[0];if(yr>STD){b.push(STD);for(const br of F.BR){const g=STD+br[0];if(g<yr)b.push(g);else break;}}b.push(yr);return b;}

const DEF={view:'H',fbar:null,hl:null,cur:null,sel:null,
 gs:0,gm:0,gf:0,stackP:0,
 yr:TY,n:26,one:1,xmaxR:500,ylo:0,rev:3,std:0,lev:0,cut:0,math:0,net:0,per:1,inset:0,taxsel:0};
function geo(W,H,k){const narrow=W<700,RP=narrow?0:288,L=74*k,T=(narrow?92:40)*k,Bm=56*k,PR=narrow?W-14:W-RP-14;return {narrow,RP,L,T,Bm,PR,pw:PR-L,ph:H-T-Bm,y0:H-Bm};}

/* ---------- view H: the first paycheck, with a line to drag ---------- */
function geoH(W,H,k){const x0=64*k,x1=W-64*k,bh=clamp(H*0.26,70,120),by=H*0.36;return {x0,x1,bh,by};}
function drawH(s,W,H,k){const g=geoH(W,H,k),gut=Story.gut,v=gut==null?TC.gross:gut,X=d=>g.x0+(g.x1-g.x0)*d/TC.gross;let o='';
 o+=text('Your first paycheck',W/2,H*0.13,{a:'middle',s:20*k,w:800})+text('30 hours × $15.16 an hour = $454.80',W/2,H*0.13+26*k,{a:'middle',s:16*k,c:'var(--muted)',w:600});
 o+=rect(g.x0,g.by,g.x1-g.x0,g.bh,'var(--track)',{rx:8})+rect(g.x0,g.by,X(v)-g.x0,g.bh,'var(--keep)',{rx:8});
 if(X(v)-g.x0>220*k)o+=text('lands in your account',g.x0+18,g.by+g.bh/2-8*k,{s:14.5*k,w:700})+text(gut==null?'?':$(v),g.x0+18,g.by+g.bh/2+22*k,{s:26*k,w:800});
 if(g.x1-X(v)>120*k)o+=text('does not',g.x1-18,g.by+g.bh/2-8*k,{a:'end',s:14.5*k,w:700,c:'var(--muted)'})+text($(TC.gross-v),g.x1-18,g.by+g.bh/2+22*k,{a:'end',s:22*k,w:800,c:'var(--muted)'});
 o+=line(X(v),g.by-16,X(v),g.by+g.bh+16,'var(--rj)',{w:4})+'<circle cx="'+n1(X(v))+'" cy="'+n1(g.by+g.bh+26)+'" r="'+n1(13*k)+'" style="fill:var(--rj)"/>'+text('⇔',X(v),g.by+g.bh+31,{a:'middle',s:15*k,w:800,c:'#fff'});
 if(gut==null)o+=tag('drag this line',X(v)-14*k,g.by-22*k,{a:'end',s:14*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2});
 [0,100,200,300,400].forEach(d=>{o+=line(X(d),g.by+g.bh,X(d),g.by+g.bh+6,'var(--axis)')+text($(d),X(d),g.by+g.bh+22*k+(Math.abs(X(d)-X(v))<30*k?26*k:0),{a:'middle',s:12.5*k,c:'var(--muted)'});});
 o+='<rect class="drag" x="'+n1(g.x0-20)+'" y="'+n1(g.by-30)+'" width="'+n1(g.x1-g.x0+40)+'" height="'+n1(g.bh+90)+'" style="fill:transparent"/>';
 return o;}

/* ---------- view G: one dollar, 100 cents ---------- */
function drawG(s,W,H,k){
 const side=Math.min(H-64*k,W*0.4),c=side/10,gx=Math.max(40*k,W*0.1),gy=(H-side)/2,e=ease(s.stackP),sx=gx+side/2-24,sw=48,ch=side/100;let o='';
 const iv=[['ss',0,s.gs],['med',s.gs,s.gs+s.gm],['fam',s.gs+s.gm,s.gs+s.gm+s.gf]];
 for(let i=0;i<100;i++){const x=lerp(gx+(i%10)*c,sx,e),y=lerp(gy+Math.floor(i/10)*c,gy+i*ch,e),w=lerp(c-2,sw,e),h=lerp(c-2,ch+0.3,e);
  o+=rect(x,y,w,h,'var(--keep)',{rx:e<0.5?2:0});
  iv.forEach(v=>{const a=Math.max(v[1],i),b=Math.min(v[2],i+1);if(b>a+1e-6)o+=e<0.5?rect(x+(a-i)*w,y,(b-a)*w,h,TX[v[0]].c,{rx:2}):rect(x,y+(a-i)*h,w,(b-a)*h+0.3,TX[v[0]].c);});}
 const tot=s.gs+s.gm+s.gf,lx=gx+side+Math.min(60*k,W*0.05),rw=Math.min(330*k,W-lx-16),ly=gy+8;
 if(e>0.6){const op=(e-0.6)/0.4,yt=gy+tot*ch;o+=line(sx+sw+8,gy,sx+sw+8,yt,'var(--fg)',{w:2.5,op})+text('taxes: '+cents(tot),sx+sw+16,gy+12*k,{s:14*k,w:800,op})+line(sx+sw+8,yt+3,sx+sw+8,gy+side,'var(--sam)',{w:2.5,op})+text('yours: '+cents(100-tot),sx+sw+16,gy+side/2,{s:14*k,w:800,c:'var(--sam)',op})+text('100 cents tall',sx+sw/2,gy+side+20*k,{a:'middle',s:12.5*k,c:'var(--muted)',op});}
 const lx2=e>0.6?Math.max(lx,sx+sw+150*k):lx;
 o+=text('One dollar = 100 cents',lx2,ly+10*k,{s:18*k,w:800});
 [['ss',s.gs],['med',s.gm],['fam',s.gf]].forEach((r,j)=>{if(r[1]<=0.001)return;const y=ly+44*k+j*34*k;
  o+=rect(lx2,y-13*k,16*k,16*k,TX[r[0]].c,{rx:3})+text(TX[r[0]].name,lx2+24*k,y,{s:15.5*k,w:700})+text(cents(r[1]),lx2+rw-(lx2-lx),y,{a:'end',s:17*k,w:800,c:TX[r[0]].c});});
 const yk=ly+44*k+3*34*k+8*k;o+=line(lx2,yk-22*k,lx+rw,yk-22*k,'var(--line)')+rect(lx2,yk-13*k,16*k,16*k,'var(--keep)',{rx:3})+text('You keep',lx2+24*k,yk,{s:15.5*k,w:700})+text(cents(100-tot),lx+rw,yk,{a:'end',s:19*k,w:800,c:'var(--sam)'});
 return o;}

/* ---------- view R: every dollar side by side ---------- */
function stubRows(s){const per=s.one||s.per>0.5;let g,a;
 if(per){const c=F.check(s.yr,s.n);g=c.gross;a={ss:c.ss,med:c.med,fam:c.fam,fed:c.fed,co:c.st};}else{g=s.yr;a=yearTax(s.yr);}
 const shown=ORDER.filter((id,j)=>s.rev>j+0.5);let net=g;shown.forEach(id=>{net-=a[id];});return {per,g,a,shown,net:F.r2(net),all:s.rev>4.5||(s.yr<=STD&&s.rev>2.5)};}
function drawR(s,W,H,k){
 const G=geo(W,H,k),{narrow,RP,L,T,PR,pw,ph,y0}=G,yr=s.yr,P=s.one?yr/s.n:yr,lev=s.one?1:s.lev,zoom=s.ylo>0.5;
 const X=d=>L+d/s.xmaxR*pw,Y=c=>y0-(Math.max(c,s.ylo)-s.ylo)/(100-s.ylo)*ph,gh=Story.gh;
 let o='<defs><clipPath id="plotclip"><rect x="'+n1(L)+'" y="'+n1(T-3)+'" width="'+n1(pw)+'" height="'+n1(ph+6)+'"/></clipPath></defs>';
 const yst=(100-s.ylo)>60?25:(100-s.ylo)>25?10:(100-s.ylo)>13?5:2,yts=[];for(let c=Math.ceil((s.ylo+(zoom?0.6:0))/yst)*yst;c<=100;c+=yst)yts.push(c);
 yts.forEach(c=>{o+=line(L,Y(c),PR,Y(c),'var(--grid)')+text(c+'¢',L-8,Y(c)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});});
 if(!narrow)o+=text('cents of each dollar',L-8-28*k,T-16*k,{s:12.5*k,c:'var(--muted)',w:600});
 ticks(s.xmaxR,5).forEach(v=>{if(v<=s.xmaxR)o+=text(s.xmaxR>=10000&&v>0?'$'+(v/1000)+'k':$(v),X(v),y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)'});});
 o+=text(s.one?'dollars in this paycheck':s.per>0.5&&s.xmaxR<yr*0.5?'dollars in one paycheck':'dollars earned this year, in order',(L+PR)/2,y0+38*k,{a:'middle',s:13*k,c:'var(--muted)',w:600});
 /* the bar and its strips */
 const E=s.one?[0,P]:edges(yr),top0=d=>{const c=cuts(d,yr,lev),t={};let top=100;ORDER.forEach((id,j)=>{const h=c[id]*clamp(s.rev-j,0,1);t[id]=[top,h];top-=h;});t.keep=top;return t;};
 let b=rect(X(0),Y(100),X(P)-X(0),y0-Y(100),'var(--keep)');
 for(let i=0;i<E.length-1;i++){const a=E[i],z=E[i+1],t=top0((a+z)/2);ORDER.forEach(id=>{const [tp,h]=t[id];if(h>0.001)b+=rect(X(a),Y(tp),X(z)-X(a)+0.6,Y(tp-h)-Y(tp)+0.3,TX[id].c);});}
 if(s.xmaxR<90){for(let d=1;d<=Math.min(P,s.xmaxR);d++)b+=line(X(d),Y(100),X(d),y0,'var(--stage)',{w:s.xmaxR<30?3:1.5,op:clamp((90-s.xmaxR)/50,0,1)});}
 if(s.cut>0.01&&!s.one){for(let i=1;i<s.n;i++){const x=X(i*yr/s.n);b+=line(x,Y(100),x,y0,'var(--stage)',{w:1.3,op:s.cut});}b+=rect(X(0)+1.5,Y(100)+1.5,X(yr/s.n)-X(0)-3,y0-Y(100)-3,'none',{stroke:'var(--fg)',sw:3,op:s.cut});}
 if(gh){const g=gh.d;let d='';const Eg=edges(g.yr);for(let i=0;i<Eg.length-1;i++){const c=cuts((Eg[i]+Eg[i+1])/2,g.yr,g.lev),yy=Y(100-gone(c));d+=(i?'L':'M')+n1(X(Eg[i]))+' '+n1(yy)+'L'+n1(X(Eg[i+1]))+' '+n1(yy);}d+='L'+n1(X(g.yr))+' '+n1(y0);
  b+='<path d="'+d+'" style="fill:none;stroke:var(--fg);stroke-width:2;stroke-dasharray:5 4;opacity:'+(0.75*gh.op).toFixed(2)+'"/>';}
 o+='<g clip-path="url(#plotclip)">'+b+'</g>';
 if(gh)o+=text('before',clamp(X(gh.d.yr)-8,L+50,PR-6),Y(100)+16*k,{a:'end',s:12.5*k,w:700,halo:1,op:gh.op});
 /* break mark when zoomed in on the top */
 if(zoom){let d='';const zy=y0-9;for(let x=L;x<=Math.min(PR,X(P));x+=14)d+=(x===L?'M':'L')+n1(x)+' '+n1(zy+(Math.round((x-L)/14)%2?5:-5));o+='<path d="'+d+'" style="fill:none;stroke:var(--stage);stroke-width:5"/>';}
 o+=line(L,y0,PR,y0,'var(--axis)',{w:1.5});
 /* labels inside the strips */
 const t0=top0(Math.min(P,STD)*0.5),lab=(id,str,x,an)=>{const [tp,h]=t0[id],py=Y(tp-h)-Y(tp);return py>=12*k&&s.rev>ORDER.indexOf(id)+0.6?text(str,x,(Y(tp)+Y(tp-h))/2+(py<15*k?4:5)*k,{a:an||'start',s:(py<15*k?12:13.5)*k,w:700,c:'#fff'}):'';};
 const bx=X(0)+10,wide=X(Math.min(P,s.one?P:STD))-X(0);
 if(wide>250*k){o+=lab('ss','Social Security: 6.2¢ of every dollar',bx)+lab('med','Medicare: 1.45¢',bx)+lab('fam','FAMLI: 0.44¢',bx);}
 if(!s.one&&yr>STD&&lev<0.5){for(let i=1;i<E.length-1;i++){const a=E[i],z=E[i+1],t=top0((a+z)/2),mid=(X(a)+X(z))/2,wpx=X(z)-X(a),c=cuts((a+z)/2,yr,0);
   if(s.rev>3.6&&wpx>46){const [tp,h]=t.fed,py=Y(tp-h)-Y(tp);if(py>=15*k)o+=text(wpx>150*k?'federal: '+cents(c.fed):cents(c.fed),mid,(Y(tp)+Y(tp-h))/2+5*k,{a:'middle',s:13.5*k,w:800,c:'#fff'});
    if(s.math>0.01&&wpx>120)o+=tag(Math.round(z-a).toLocaleString('en-US')+' dollars × '+cents(c.fed)+' = '+$((z-a)*c.fed/100),mid,Y(t.keep)+30*k+(i%2?0:30*k),{a:'middle',s:13*k,c:'var(--t-fed)',bc:'var(--t-fed)',bw:2,op:s.math});}
   if(s.rev>4.6&&wpx>46){const [tp,h]=t.co,py=Y(tp-h)-Y(tp);if(py>=15*k&&i===E.length-2)o+=text('Colorado: '+cents(c.co),mid,(Y(tp)+Y(tp-h))/2+5*k,{a:'middle',s:13.5*k,w:800,c:'#3a2a00'});}}}
 if(!s.one&&lev>0.9&&yr>STD&&s.rev>4.6){const t=top0(yr/2),c=cuts(yr/2,yr,1),xm=X(Math.min(yr,s.xmaxR)*0.5);[['fed','federal, spread evenly: '+cents(c.fed)+' of every dollar','#fff'],['co','Colorado, spread evenly: '+cents(c.co),'#3a2a00']].forEach(r=>{const [tp,h]=t[r[0]];if(Y(tp-h)-Y(tp)>=15*k)o+=text(r[1],xm,(Y(tp)+Y(tp-h))/2+5*k,{a:'middle',s:13.5*k,w:800,c:r[2]});});}
 /* the standard deduction line */
 if(s.std>0.01&&X(STD)<PR){const x=X(STD);o+=line(x,T-4,x,y0+6,'var(--fg)',{w:2.5,dash:'7 5',op:s.std})+tag('$16,100',x,T-8*k,{a:'middle',s:13.5*k,bw:2,bc:'var(--fg)',op:s.std});if(!narrow&&x-L>190*k)o+=tag('income tax skips these',x-8,y0-18*k,{a:'end',s:13*k,bw:2,bc:'var(--fg)',op:s.std});}
 /* take-home label */
 if(s.net>0.01&&!zoom){const R=stubRows(s),cx=(X(0)+Math.min(PR,X(P)))/2;o+=text('yours',cx,Y(45)-14*k,{a:'middle',s:15*k,w:700,op:s.net})+text($c(R.net),cx,Y(45)+22*k,{a:'middle',s:30*k,w:800,op:s.net});}
 /* formula ↔ picture: rate × pay = tax, for the chosen strip */
 if(s.fbar==='area'){const id=ORDER[s.taxsel],[tp,h]=t0[id],ya=Y(tp),yb=Y(tp-h);
  if(s.hl==='rate'){o+=line(X(P)+12,ya,X(P)+12,yb,'var(--fg)',{w:3})+line(X(P)+6,ya,X(P)+18,ya,'var(--fg)',{w:3})+line(X(P)+6,yb,X(P)+18,yb,'var(--fg)',{w:3})+tag('height: '+cents(h)+' from each dollar',X(P)-8,yb+26*k,{a:'end',s:13.5*k,bw:2,bc:'var(--fg)'});}
  if(s.hl==='pay'){const by=y0-24*k;o+=line(X(0),by,X(P),by,'var(--fg)',{w:3})+line(X(0),by-6,X(0),by+6,'var(--fg)',{w:3})+line(X(P),by-6,X(P),by+6,'var(--fg)',{w:3})+tag('width: '+$c(P)+', every dollar in the check',(X(0)+X(P))/2,by-10*k,{a:'middle',s:13.5*k,bw:2,bc:'var(--fg)'});}
  if(s.hl==='tax'||!s.hl)o+=rect(X(0)-2,ya-2,X(P)-X(0)+4,Math.max(5,yb-ya)+4,'none',{stroke:'var(--fg)',sw:3,rx:2});
  if(s.hl==='tax')o+=tag('the whole strip: '+$c(TX[id].rate*P),(X(0)+X(P))/2,yb+28*k,{a:'middle',s:13.5*k,bw:2,bc:'var(--fg)'});
  ['ss','med','fam'].forEach((t,j)=>{const [a,hh]=t0[t];o+='<rect class="hit" data-tax="'+j+'" x="'+n1(X(0))+'" y="'+n1(Y(a)-(hh<2?5:0))+'" width="'+n1(X(P)-X(0))+'" height="'+n1(Math.max(12,Y(a-hh)-Y(a)))+'" style="fill:transparent"/>';});}
 /* one dollar's story */
 if(s.fbar==='dollar'&&s.cur!=null){const d=clamp(s.cur,1,P),x=X(d),c=cuts(d,yr,lev);o+=line(x,T-6,x,y0+6,'var(--fg)',{w:3})+'<circle cx="'+n1(x)+'" cy="'+n1(T-8)+'" r="'+n1(7*k)+'" style="fill:var(--fg)"/>';
  o+=tag('dollar '+Math.round(d).toLocaleString('en-US')+' keeps '+cents(100-gone(c)),clamp(x,L+120*k,PR-120*k),Y(100-gone(c))+30*k,{a:'middle',s:14*k,bw:2,bc:'var(--fg)'});}
 if(s.fbar==='dollar')o+='<rect class="drag" x="'+n1(L)+'" y="'+n1(T-16)+'" width="'+n1(pw)+'" height="'+n1(ph+30)+'" style="fill:transparent"/>';
 /* the pay stub: the same picture, written as numbers */
 const R=stubRows(s);
 if(narrow){o+=text((R.per?'One paycheck: ':'The year: ')+$c(R.g),L,24*k,{s:14.5*k,w:800})+text((R.all?'take-home ':'left so far ')+$c(R.net)+(R.all?' · '+(100*R.net/R.g).toFixed(1)+'¢ of each dollar':''),L,44*k,{s:13*k,w:700,c:'var(--sam)'});}
 else{const sx=W-RP+6,sr=W-14,sy=T-8*k,rh=27*k,rows=R.shown.length,sh=rh*(rows+3)+26*k;
  o+=rect(sx,sy,sr-sx,sh,'var(--card)',{rx:8,stroke:'var(--line)',sw:1.5});
  o+=text(R.per?'PAY STUB · ONE PAYCHECK':'THE WHOLE YEAR',sx+12,sy+20*k,{s:11.5*k,w:700,c:'var(--muted)'});
  o+=text('Gross pay',sx+12,sy+20*k+rh,{s:14.5*k,w:700})+text($c(R.g),sr-12,sy+20*k+rh,{a:'end',s:15.5*k,w:800});
  R.shown.forEach((id,j)=>{const y=sy+20*k+rh*(j+2),sel=s.fbar==='area'&&ORDER[s.taxsel]===id;
   if(sel)o+=rect(sx+5,y-rh*0.68,sr-sx-10,rh*0.96,'var(--card2)',{rx:5,stroke:'var(--fg)',sw:1.5});
   o+=rect(sx+12,y-11*k,12*k,12*k,TX[id].c,{rx:2})+text(TX[id].name,sx+12+18*k,y,{s:13.5*k,w:600})+text('−'+$c(R.a[id]),sr-12,y,{a:'end',s:14.5*k,w:700});});
  const yn=sy+20*k+rh*(rows+2)+6*k;o+=line(sx+12,yn-rh*0.72,sr-12,yn-rh*0.72,'var(--line)',{w:1.5});
  o+=rect(sx+12,yn-11*k,12*k,12*k,'var(--keep)',{rx:2})+text(R.all?'Take-home pay':'Left so far',sx+12+18*k,yn,{s:14.5*k,w:800})+text($c(R.net),sr-12,yn,{a:'end',s:16.5*k,w:800,c:'var(--sam)'});
  if(R.all)o+=text((100*R.net/R.g).toFixed(1)+'¢ of every dollar',sr-12,yn+19*k,{a:'end',s:12.5*k,c:'var(--muted)',w:600});
  const gut=Story.gut;if(s.net>0.5&&gut!=null&&s.one&&Math.abs(s.yr-TY)<1)o+=tag('your guess: '+$(gut),sr-8,sy+sh+28*k,{a:'end',s:13.5*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2});
  if(s.inset>0.01){const iy=sy+sh+(s.net>0.5?48:18)*k,ih=Math.min(60*k,y0-iy-20*k),iw=30,f=c=>iy+ih-c/100*ih;
   if(ih>30)o+='<g style="opacity:'+s.inset.toFixed(2)+'">'+rect(sx+8,f(100),iw,ih,'var(--keep)')+rect(sx+8,f(100),iw,ih*FLAT/100,'var(--t-ss)')+rect(sx+4,f(100)-2,iw+8,Math.max(6,f(s.ylo)-f(100))+2,'none',{stroke:'var(--rj)',sw:2.5,rx:2})+text('The whole bar.',sx+iw+22,iy+ih*0.4,{s:12.5*k,w:700})+text('You are looking at the top.',sx+iw+22,iy+ih*0.4+16*k,{s:12*k,c:'var(--muted)'})+'</g>';}
 }
 return o;}

/* ---------- small pictures for the check ---------- */
function miniR(yr,marks){const W=560,H=200,L=10,T=22,Bm=24,pw=W-20,ph=H-T-Bm,y0=H-Bm,xm=yr*1.02,X=d=>L+d/xm*pw,Y=c=>y0-c/100*ph,E=edges(yr);let o=rect(X(0),Y(100),X(yr)-X(0),y0-Y(100),'var(--keep)');
 for(let i=0;i<E.length-1;i++){const c=cuts((E[i]+E[i+1])/2,yr,0);let top=100;ORDER.forEach(id=>{const h=c[id];if(h>0)o+=rect(X(E[i]),Y(top),X(E[i+1])-X(E[i])+0.5,Y(top-h)-Y(top)+0.3,TX[id].c);top-=h;});}
 o+=line(X(STD),T-2,X(STD),y0+4,'var(--fg)',{w:2,dash:'6 4'})+text('$16,100',X(STD),y0+18,{a:'middle',s:12.5,c:'var(--muted)',w:700})+text('$0',L,y0+18,{s:12.5,c:'var(--muted)'})+text($(yr),W-10,y0+18,{a:'end',s:12.5,c:'var(--muted)'});
 (marks||[]).forEach(m=>{o+=line(X(m[1]),T-2,X(m[1]),y0,'var(--fg)',{w:2.5})+'<circle cx="'+n1(X(m[1]))+'" cy="'+(T-8)+'" r="11" style="fill:var(--fg)"/>'+text(m[0],X(m[1]),T-3.5,{a:'middle',s:13,w:800,c:'var(--stage)'});});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="A year of pay with three dollars marked A, B and C">'+o+'</svg>';}
function miniStrip(rate,pay){const W=520,H=120,L=10,pw=W-20,T=14,ph=70,h=Math.max(3,rate*100/12*ph);let o=rect(L,T,pw,ph,'var(--keep)')+rect(L,T,pw,Math.min(ph,h),'var(--t-med)');
 o+=text(cents(rate*100)+' from each dollar',L+10,T+Math.min(ph,h)+18,{s:13,w:700})+text($c(pay)+' wide',W-10,T+ph+20,{a:'end',s:13,w:700,c:'var(--muted)'})+text('the strip: '+$c(rate*pay),W-10,T+Math.min(ph,h)+18,{a:'end',s:14,w:800,c:'var(--t-med)'});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="A paycheck bar with one thin tax strip across the top">'+o+'</svg>';}

/* ---------- steps ---------- */
const PARTS=['One dollar','A whole year','Change it','Tell it'];
const G3={view:'G',gs:6.2,gm:1.45,gf:0.44};
const CHK={view:'R',yr:TY,n:26,one:1,xmaxR:500,rev:3};
const YR={view:'R',one:0,per:0,xmaxR:60000,std:1};
const C55=Object.assign({},YR,{yr:55000,n:24});
const STEPS=[
 {part:-1,title:'Your first paycheck',st:{view:'H'},
  widget:()=>'<div class="gutrow"><label for="g-range">Your guess</label><output id="g-out">'+(Story.gut==null?'?':$(Story.gut))+'</output><input type="range" id="g-range" min="250" max="455" step="1" value="'+(Story.gut==null?455:Story.gut)+'"></div>',
  t:'You worked 30 hours at $15.16 an hour. That is <b>$454.80</b>. Payday comes. <b>Drag the line to what you think lands in your bank account.</b>',
  alt:'$15.16 is Colorado\'s minimum wage in 2026. Pay before anything comes out is called gross pay. What reaches you is net pay, or take-home pay. Go with your gut.'},
 {part:0,title:'One dollar',st:{view:'G'},
  t:'Start with one dollar of that paycheck. It is 100 cents. <b>Each square is one cent.</b>',
  alt:'Percent means per hundred. A dollar is a ready-made hundred, so cents and percents are the same count.'},
 {part:0,title:'Social Security',st:{view:'G',gs:6.2},
  play:async ok=>{await tw({gs:6.2},3000,lin);},
  t:'Social Security takes <b>6.2%</b>. Percent means out of every hundred, so 6.2 of these 100 cents go.',
  alt:'Six whole squares and one fifth of the seventh. Social Security pays monthly income to retired and disabled workers and their families.'},
 {part:0,title:'Two smaller cuts',st:G3,
  play:async ok=>{await tw({gm:1.45},1700,lin);if(!ok())return;await tw({gf:0.44},1100,lin);},
  t:'Medicare takes 1.45 cents. Colorado\'s family leave insurance, FAMLI, takes 0.44. Together <b>8.09 cents</b> are gone. You keep 91.91.',
  alt:'Medicare is health insurance for people 65 and older. FAMLI pays part of your wages if you must stop work for a new baby or a serious illness.'},
 {part:0,title:'Stand the dollar up',st:Object.assign({},G3,{stackP:1}),
  play:async ok=>{await tw({stackP:1},2600);},
  t:'Stack the 100 cents into one tall column, taxes on top. <b>Every dollar you earn looks like this.</b>',
  alt:'Same dollar, same 100 cents. Standing it up lets many dollars sit side by side.'},
 {part:0,title:'Every dollar in the check',st:CHK,
  play:async ok=>{Story.S.xmaxR=5;Story.redraw();await tw({xmaxR:500},4600);},
  t:'Now line up all 454.80 dollars. Each one loses the same 8.09 cents, so the taxes make a <b>flat band</b> across the top.',
  alt:'Width is how many dollars. Height is the 100 cents in each one. The colored band is every cent that was taken.'},
 {part:0,title:'How big is each cut?',st:Object.assign({},CHK,{ylo:91,inset:1,fbar:'area'}),
  play:async ok=>{await tw({ylo:91,inset:1},2000);},
  t:'Zoom in on the band. Each tax is a rectangle: <b>cents from each dollar × number of dollars</b>. Tap a part of the formula, or tap another strip.',
  alt:'Our words. The rate is the cents taken from each dollar, written as a decimal: 6.2% is 0.062. Rate times pay gives the tax.'},
 {part:0,title:'What lands in your account',st:Object.assign({},CHK,{net:1}),
  play:async ok=>{await tw({ylo:0,inset:0},1800);if(!ok())return;await tw({net:1},600);},
  t:'Take away the three strips: $28.20, $6.59 and $2.00.',
  t2:()=>{const g=Story.gut;return '<b>$418.01 lands in your account</b>: 91.9 cents of every dollar.'+(g==null?'':Math.abs(g-418)<=6?' You guessed '+$(g)+'. Right on it.':' You guessed '+$(g)+(g>424?'. A little came out after all.':'. You get to keep more than you thought.'));},
  alt:'The pay stub on the right is the same picture written as numbers. Every stub has these lines.'},
 {part:1,title:'A whole year of that job',st:{view:'R',yr:TY,n:26,one:0,per:0,xmaxR:13000,cut:1},
  play:async ok=>{const S=Story.S;await tw({net:0},250);if(!ok())return;S.one=0;S.per=0;S.cut=1;await tw({xmaxR:13000},3600);},
  t:'Keep that job all year: 26 paychecks side by side, <b>$11,824.80</b>. The same flat band runs across all of it.',
  alt:'The outlined slice on the left is the paycheck you just took apart. The other 25 are copies of it.'},
 {part:1,title:'The line at $16,100',st:Object.assign({},YR,{yr:TY,n:26,cut:0.4}),
  play:async ok=>{await tw({xmaxR:60000,cut:0.4},2200);if(!ok())return;await tw({std:1},700);},
  t:'Income tax works differently. It skips the first <b>$16,100</b> you earn in a year. Your whole year fits before the line, so no income tax came out.',
  alt:'That $16,100 is called the standard deduction: income every worker may earn before income tax starts. It is the 2026 amount for a single person.'},
 {part:1,title:'Your first career job',st:C55,
  play:async ok=>{const S=Story.S;await tw({cut:0},300);if(!ok())return;S.n=24;await tw({yr:55000},3600);},
  t:'Jump ahead a few years to a first career job at <b>$55,000</b>. The bar stretches. Most of these dollars are past the line.',
  alt:'The flat band stretches with it. Social Security, Medicare and FAMLI take the same cents from every dollar, however many dollars there are.'},
 {part:1,title:'Federal income tax',st:Object.assign({},C55,{rev:4,ylo:70,inset:1,math:1}),
  play:async ok=>{await tw({ylo:70,inset:1},1700);if(!ok())return;await tw({rev:4},2400);if(!ok())return;await tw({math:1},600);},
  t:'Past the line, federal income tax takes <b>10 cents</b> from each of the next 12,400 dollars, then <b>12 cents</b> from each dollar after that. Dollars before the line lose nothing to it.',
  alt:'These steps are called tax brackets. A bracket\'s rate applies only to the dollars inside it, never to the dollars before it. Together: $1,240 + $3,180 = $4,420.'},
 {part:1,title:'Colorado income tax',st:Object.assign({},C55,{rev:5,ylo:70,inset:1}),
  play:async ok=>{await tw({math:0},250);if(!ok())return;await tw({rev:5},2000);},
  t:'Colorado takes a flat <b>4.4 cents</b> from every dollar past the same line: 38,900 dollars × 4.4¢ = $1,711.60.',
  alt:'Same line, one step instead of several. A tax with a single rate like this is called a flat tax.'},
 {part:1,title:'Every dollar has a story',st:Object.assign({},C55,{rev:5,ylo:70,inset:1,fbar:'dollar',cur:40000}),
  t:'<b>Slide along the bar.</b> Your first dollars keep 91.91 cents. Your last dollars keep 75.51. Earning more never changes what happened to the dollars before.',
  alt:'This is why a raise cannot shrink your paycheck. New dollars are added on the right and taxed at the last step. Every dollar to their left stays exactly as it was.'},
 {part:1,title:'Spread over the year',st:Object.assign({},C55,{rev:5,ylo:70,inset:1,lev:1}),
  play:async ok=>{await tw({lev:1},3600);},
  t:'Your employer does not wait for dollar 16,101. It adds up the year\'s income tax and takes the same share from every paycheck. This is called <b>withholding</b>. The steps level out: same area, flat strips.',
  alt:'Leveled, federal income tax is 8.04 cents of each dollar and Colorado is 3.11. Those are averages. No single dollar was taxed at exactly that rate.'},
 {part:1,title:'One paycheck',st:Object.assign({},C55,{rev:5,lev:1,cut:1,per:1,net:1,xmaxR:2291.67*1.06,std:0}),
  play:async ok=>{await tw({ylo:0,inset:0,cut:1,std:0},1600);if(!ok())return;Story.S.per=1;await tw({xmaxR:2291.67*1.06},2600);if(!ok())return;await tw({net:1},600);},
  t:'Cut the year into 24 paychecks and look at one: $2,291.67 in, <b>$1,850.79</b> out to you. The pay stub is this picture written as numbers.',
  alt:'An offer letter says $55,000. Your bank account sees about $3,702 a month. Plan rent and car payments from the second number.'},
 {part:2,title:'Change the math, watch the picture',st:Object.assign({},C55,{rev:5,cut:0.5,fbar:'drive',xmaxR:60000}),
  t:'You drive. <b>Before you move anything, say what you think the picture will do.</b> The dashed outline shows where the taxes were.',
  alt:'The slider changes the width of the bar: how many dollars you earn. The buttons change how the same year is cut up or shown.'},
 {part:3,title:'Check yourself',st:{view:'P',panel:'check'},
  t:'Three quick ones. Each asks you to connect a picture, a formula and a story.',
  alt:'Wrong answers get a hint that points at the picture. Try again as many times as you need.'},
 {part:3,title:'Tell the story',st:{view:'P',panel:'story'},
  t:'Math is finished when you can tell its story. Three sentences is enough. Then copy your work into Canvas.',
  alt:'Use the picture words: dollar, cents, strip, flat, line, step, width. If you get stuck, go back to "Every dollar has a story" and describe what you see.'}
];

/* ---------- formula strip ---------- */
const tokB=(hl,val,name,cls)=>'<button type="button" class="tok'+(cls?' '+cls:'')+'" data-hl="'+hl+'" aria-pressed="'+(Story.S.hl===hl)+'"><b>'+val+'</b><small>'+name+'</small></button>';
const tokS=(val,name,cls)=>'<span class="tok'+(cls?' '+cls:'')+'"><b>'+val+'</b><small>'+name+'</small></span>';
const OP=s=>'<span class="op">'+s+'</span>';
function fbarHtml(S){
 const m=S.fbar;if(!m)return null;
 if(m==='area'){const id=ORDER[S.taxsel],t=TX[id],P=S.yr/S.n;
  return '<div class="chain"><b>'+t.name+'</b>: '+cents(t.rate*100)+' from each dollar, on all '+$c(P)+'. <b>A percent is a rate: cents per dollar.</b></div>'+
   '<div class="frow">'+tokB('rate',String(+t.rate.toFixed(4)),'rate, as a decimal','t-'+id)+OP('×')+tokB('pay',$c(P),'pay')+OP('=')+tokB('tax',$c(t.rate*P),'tax','t-'+id)+
   '<span class="letters">In letters: <code>tax = rate × pay</code></span></div>'+
   '<p class="hint"><b>Tap a part of the formula</b> to find it in the picture. <b>Tap another strip</b> to switch taxes.</p>';}
 if(m==='dollar'){const d=clamp(S.cur==null?40000:S.cur,1,S.yr),c=cuts(d,S.yr,S.lev);
  return '<div class="frow"><span class="who">Dollar '+Math.round(d).toLocaleString('en-US')+'</span>'+ORDER.map(id=>c[id]>0.001?tokS(cents(c[id]),id==='ss'?'Soc. Security':id==='med'?'Medicare':id==='fam'?'FAMLI':id==='fed'?'federal':'Colorado','t-'+id):'').filter(x=>x).join(OP('+'))+OP('=')+tokS(cents(gone(c)),'gone')+OP('→')+tokS(cents(100-gone(c)),'you keep','t-keep')+'</div>'+
   '<p class="hint">'+(d<STD?'This dollar is before the $16,100 line, so only the three flat taxes touch it.':'This dollar is past the $16,100 line. It is in the '+cents(c.fed)+' federal step.')+' <b>Drag anywhere on the bar.</b></p>';}
 if(m==='drive')return '<div class="drive">'+
   '<div class="ctl"><label for="c-yr">Pay for the year <output id="o-yr"></output></label><input type="range" id="c-yr" min="5000" max="150000" step="500" value="'+S.yr+'"><small>The width of the bar: how many dollars you earn.</small></div>'+
   '<div class="ctl"><label>How often you are paid</label><div class="seg" id="c-n">'+[[12,'Monthly'],[24,'Twice a month'],[26,'Every 2 wks'],[52,'Weekly']].map(o=>'<button type="button" data-n="'+o[0]+'" aria-pressed="'+(S.n===o[0])+'">'+o[1]+'</button>').join('')+'</div></div>'+
   '<div class="ctl"><label>Show income tax</label><div class="seg" id="c-lev"><button type="button" data-lev="0" aria-pressed="'+(S.lev<0.5)+'">Dollar by dollar</button><button type="button" data-lev="1" aria-pressed="'+(S.lev>=0.5)+'">Spread over the year</button></div></div></div>'+
   '<p class="narr" id="narr" aria-live="polite"></p><div class="quests" id="quests"></div>';
 return null;}
const QUESTS=[
 {id:'under',q:'Slide pay under $16,100.',ask:'Which strips will vanish?',a:'The two income tax strips vanish, because every dollar is before the line. The three flat strips stay.'},
 {id:'raise',q:'Give yourself a raise.',ask:'Do your old dollars lose more?',a:'No. Only the new dollars get the last step\'s rate. With these taxes, a raise always raises your take-home pay.'},
 {id:'b22',q:'Push pay past $66,500.',ask:'What starts there?',a:'A taller step: 22 cents from each dollar past $66,500. The dollars before it keep their lower steps.'},
 {id:'n',q:'Change how often you are paid.',ask:'Does the year change?',a:'No. The year is the same picture. It is just cut into more or fewer slices.'}
];
const qdone={};
function updateDrive(){const S=Story.S;if(S.fbar!=='drive'||!el('o-yr'))return;const Y=yearTax(S.yr),t=sumTax(Y),c=F.check(S.yr,S.n),nx=cuts(S.yr-1,S.yr,0);
 el('o-yr').textContent=$(S.yr);
 el('narr').innerHTML='At '+$(S.yr)+' a year: <b>'+$(t)+'</b> in taxes, <b>'+$(S.yr-t)+'</b> take-home ('+(100*(S.yr-t)/S.yr).toFixed(1)+'¢ of each dollar). Each of '+S.n+' paychecks: '+$c(c.net)+'. Your next dollar would keep '+cents(100-gone(nx))+'.';
 if(S.yr<STD)qdone.under=1;if(S.yr>55000)qdone.raise=1;if(S.yr>66500)qdone.b22=1;if(S.n!==24)qdone.n=1;
 document.querySelectorAll('#c-n button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.n===S.n)));
 document.querySelectorAll('#c-lev button').forEach(b=>b.setAttribute('aria-pressed',String((+b.dataset.lev>=0.5)===(S.lev>=0.5))));
 el('quests').innerHTML=QUESTS.map(q=>'<div class="quest'+(qdone[q.id]?' done':'')+'"><span class="mark">'+(qdone[q.id]?'done':'try')+'</span><b>'+q.q+'</b><p>'+(qdone[q.id]?q.a:q.ask)+'</p></div>').join('');}
const fitXR=yr=>Math.max(20000,yr*1.09);
function driveChanged(){const S=Story.S;Story.ghost(()=>({yr:S.yr,lev:S.lev>=0.5?1:0}));
 S.yr=+el('c-yr').value;const g=Story.gh.d;Story.dropTweens();Story.tw({xmaxR:Math.max(fitXR(S.yr),fitXR(g.yr))},380);updateDrive();}
function onGhostEnd(S){if(S.fbar==='drive')Story.tw({xmaxR:fitXR(S.yr)},600);}
function bindFbar(box,S){if(S.fbar!=='drive')return;
 el('c-yr').addEventListener('input',driveChanged);
 el('c-n').addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(!b)return;const S=Story.S;S.n=+b.dataset.n;S.cut=0.5;updateDrive();Story.redraw();});
 el('c-lev').addEventListener('click',e=>{const b=e.target.closest('[data-lev]');if(!b)return;Story.dropTweens();Story.tw({lev:+b.dataset.lev},1400);const S=Story.S;const want=+b.dataset.lev;document.querySelectorAll('#c-lev button').forEach(x=>x.setAttribute('aria-pressed',String(+x.dataset.lev===want)));});
 updateDrive();}
function bindWidget(box,S){const r=el('g-range');if(!r)return;r.addEventListener('input',()=>{Story.setGut(+r.value);el('g-out').textContent=$(+r.value);Story.redraw();});}

/* ---------- panels ---------- */
const ans={q1:null,q2:null,q3:null},tries={q1:0,q2:0,q3:0},story={},q2v={};
function panelHtml(p){
 if(p==='check')return '<div class="qcard" id="q1"><h2>1. Which of these three dollars loses the most to taxes?</h2><p>A year at $55,000. Dollar A is the 5,000th dollar earned, B is the 20,000th and C is the 50,000th.</p>'+
   '<div class="minibox" style="max-width:720px">'+miniR(55000,[['A',5000],['B',20000],['C',50000]])+'</div>'+
   '<div class="opts" data-q="q1" style="margin-top:10px"><button type="button" data-v="A">Dollar A</button><button type="button" data-v="B">Dollar B</button><button type="button" data-v="C">Dollar C</button></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q2"><h2>2. Turn a story into a formula</h2><p>Medicare takes 1.45% of every dollar. Ana\'s paycheck is $600. Build her Medicare tax.</p>'+
   '<div class="build"><span class="tok" id="t-rate"><b><input id="i-rate" inputmode="decimal" aria-label="rate, as a decimal" autocomplete="off"></b><small>rate, as a decimal</small></span>'+OP('×')+'<span class="tok" id="t-pay"><b><span class="unit">$</span><input id="i-pay" inputmode="decimal" aria-label="pay, in dollars" autocomplete="off"></b><small>pay</small></span>'+
   '<button type="button" class="btn" id="q2check">Check my formula</button></div><div class="minibox" id="q2pic" hidden></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q3"><h2>3. Use the line</h2><p>You earn $10,000 this year from a summer and weekend job. How much federal income tax do you owe on it?</p>'+
   '<div class="opts" data-q="q3"><button type="button" data-v="1000">$1,000</button><button type="button" data-v="0">$0</button><button type="button" data-v="1200">$1,200</button></div><div class="fbslot"></div></div>';
 return '<div class="qcard"><h2>Tell the story of a paycheck</h2><p>Write it for a friend who is about to get their first one.</p><div class="story">'+
   '<div><label for="s1">Beginning<small>What is the whole, before anything comes out?</small></label><textarea id="s1" placeholder="Gross pay is…"></textarea></div>'+
   '<div><label for="s2">Middle<small>Which taxes take from every dollar, and which wait for the line?</small></label><textarea id="s2" placeholder="Every dollar loses… Income tax only starts…"></textarea></div>'+
   '<div><label for="s3">End<small>What lands in your account, and why is it not the number on the offer letter?</small></label><textarea id="s3" placeholder="Take-home pay is… because…"></textarea></div></div>'+
   '<div class="copyrow"><button type="button" class="btn primary" id="copyb">Copy for Canvas</button><span id="copymsg">Copies your guess, your three checks and your story.</span></div><textarea id="copyfallback" hidden readonly aria-label="Your work, to copy"></textarea></div>'+
  '<div class="qcard"><h2>Use it</h2><div class="uses">'+
   '<div class="use"><b>Do:</b> fill out the W-4 on your first day carefully, and ask for help if you are not sure. <b>Why:</b> it tells your employer how much federal income tax to take from each check. Colorado uses the federal W-4 unless you file its own DR 0004.</div>'+
   '<div class="use"><b>Do:</b> if federal income tax was taken from a part-time job but you earned less than the standard deduction, file a tax return. <b>Why:</b> income under the standard deduction owes no federal income tax, so the return is how you get the withheld money back. Social Security, Medicare and FAMLI are not refunded this way.</div>'+
   '<div class="use"><b>Do:</b> build this in a spreadsheet. <b>Why:</b> typing the formulas yourself makes them yours. <a href="excel.html#build-paycheck">Build this pay stub</a>, one step at a time, then open it in Excel.</div></div></div>'+
  Story.voteCard()+
  '<details class="about"><summary>About this model</summary><p><b>This is a simplified model for learning, not tax advice.</b> It shows 2026 pay for a single Colorado worker with no dependents who takes the standard deduction ($16,100). A dependent with only wages also owes no federal income tax on wages up to that amount.</p><p><b>Rates.</b> Social Security 6.2% of wages up to $184,500 and Medicare 1.45% (Social Security Administration). Colorado FAMLI: the worker pays 0.44% in 2026. Federal income tax: 10% on the first $12,400 of taxable income, 12% up to $50,400, 22% up to $105,700, 24% above that within this tool\'s range (IRS Rev. Proc. 2025-32). Colorado: 4.4% of federal taxable income in 2026.</p><p><b>Withholding</b> is estimated as the year\'s income tax spread evenly over the paychecks, the idea behind the IRS percentage method (Publication 15-T). A real stub may also show health insurance, a retirement plan or other items, and real withholding depends on your W-4.</p></details>';
}
const FB={
 q1:{C:[1,'Yes. Dollar C is in the 12-cent step, so 24.49 cents of it are gone. Dollar A lost only 8.09.'],A:[0,'Dollar A is before the $16,100 line. Only the three flat strips touch it. Try again.'],B:[0,'Dollar B is past the line, in the 10-cent step. Look for a dollar under a taller step. Try again.']},
 q3:{0:[1,'Yes. All $10,000 sits before the $16,100 line, so income tax never starts. Social Security, Medicare and FAMLI still come out.'],1000:[0,'That would be 10 cents from every dollar. The 10-cent step only starts after the first $16,100. Try again.'],1200:[0,'That would be 12 cents from every dollar. Income tax skips the first $16,100 you earn in a year. Try again.']}
};
function setFb(card,ok,msg){card.querySelector('.fbslot').innerHTML='<p class="fb '+(ok?'ok':'no')+'" role="status">'+msg+'</p>';}
function pickOpt(q,v,silent){const card=el(q),f=FB[q][v];if(!f)return;if(!silent&&ans[q]!=='ok')tries[q]++;
 card.querySelectorAll('.opts button').forEach(b=>{b.classList.remove('right','wrong');if(b.dataset.v===String(v))b.classList.add(f[0]?'right':'wrong');});
 setFb(card,f[0],f[1]);if(f[0])ans[q]='ok';ans[q+'v']=v;}
function checkQ2(silent){const card=el('q2'),num=id=>parseFloat(String(el(id).value).replace(/[$,%\s]/g,''));
 let r=num('i-rate');const py=num('i-pay');q2v.rate=el('i-rate').value;q2v.pay=el('i-pay').value;
 if(isNaN(r)||isNaN(py)){if(!silent)setFb(card,false,'Fill in both boxes: the rate and the pay.');return;}
 const pct=r>=0.5;if(pct)r=r/100;if(!silent&&ans.q2!=='ok')tries.q2++;
 const okR=Math.abs(r-0.0145)<0.00006,okP=Math.abs(py-600)<0.5;
 el('t-rate').className='tok '+(okR?'ok':'bad');el('t-pay').className='tok '+(okP?'ok':'bad');
 if(r>0&&r<=0.4&&py>0){el('q2pic').hidden=false;el('q2pic').innerHTML=miniStrip(r,py);}
 if(okR&&okP){ans.q2='ok';setFb(card,true,'Yes. 0.0145 × $600 = $8.70. A thin strip, 1.45 cents tall, across all 600 dollars.'+(pct?' Note: in the formula, 1.45% is written 0.0145.':''));}
 else setFb(card,false,(!okR?'The rate is 1.45% as a decimal. Move the point two places: 0.0145. ':'')+(!okP?'The pay is the whole paycheck: $600. ':'')+'The picture shows the strip you built. Fix the red box and check again.');}
function bindPanel(panel,p){
 if(p==='check'){
  panel.querySelectorAll('.opts[data-q]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pickOpt(g.dataset.q,b.dataset.v);}));
  el('q2check').addEventListener('click',()=>checkQ2(false));
  ['i-rate','i-pay'].forEach(id=>el(id).addEventListener('keydown',e=>{if(e.key==='Enter')checkQ2(false);}));
  if(ans.q1v)pickOpt('q1',ans.q1v,true);if(ans.q3v!=null)pickOpt('q3',ans.q3v,true);
  if(q2v.rate!=null){el('i-rate').value=q2v.rate;el('i-pay').value=q2v.pay;checkQ2(true);}
  return;}
 ['s1','s2','s3'].forEach(id=>{el(id).value=story[id]||'';el(id).addEventListener('input',e=>{story[id]=e.target.value;});});
 el('copyb').addEventListener('click',()=>Story.copy(workText(),el('copymsg'),el('copyfallback')));
}
function workText(){const mark=q=>ans[q]==='ok'?'correct'+(tries[q]>1?' (try '+tries[q]+')':''):'not answered yet',g=Story.gut;
 return ['Where did my paycheck go? (Raider FinanceLab)','My guess for the $454.80 paycheck: '+(g==null?'none':$(g))+' (it was $418.01)','Check 1, which dollar loses most: '+mark('q1'),'Check 2, Ana\'s Medicare: '+mark('q2')+(ans.q2==='ok'?'  0.0145 x $600 = $8.70':''),'Check 3, the $16,100 line: '+mark('q3'),'Picture challenges done: '+Object.keys(qdone).length+' of 4','','My story','Beginning: '+(story.s1||''),'Middle: '+(story.s2||''),'End: '+(story.s3||'')].join('\n');}

function draw(S,W,H,k){return S.view==='H'?drawH(S,W,H,k):S.view==='G'?drawG(S,W,H,k):drawR(S,W,H,k);}
function onHit(d,S){if(d.tax!=null&&S.fbar==='area'){S.taxsel=+d.tax;if(!S.hl)S.hl='tax';return true;}return false;}
function onDrag(p,S,W,H,k){
 if(S.view==='H'){const g=geoH(W,H,k),v=Math.round(clamp((p.x-g.x0)/(g.x1-g.x0),250/TC.gross,1)*TC.gross);Story.setGut(Math.min(455,v));const r=el('g-range');if(r){r.value=Story.gut;el('g-out').textContent=$(Story.gut);}return false;}
 if(S.view==='R'&&S.fbar==='dollar'){const G=geo(W,H,k);S.cur=clamp(Math.round((p.x-G.L)/G.pw*S.xmaxR/100)*100,100,S.yr);return true;}
 return false;}
Story.start({id:'paycheck',lab:'FinanceLab',title:'Where did my paycheck go?',DEF,PARTS,STEPS,draw,fbar:fbarHtml,bindFbar,bindWidget,panel:panelHtml,bindPanel,onHit,onDrag,onGhostEnd,
 onStep:S=>{if(S.fbar==='drive')updateDrive();}});
})();
