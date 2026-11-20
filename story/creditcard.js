/* Paying off a credit card. Story version (pilot, Nov 2026). Needs story/kit.js.
   Month by month, same model as sims/creditcard.js:
   interest = owes × APR/12, then the payment comes off. Minimum = the larger of $25 and (interest + 1% of what she owes).
   A fixed payment is paid when it is larger than the minimum. next = owes × (1 + r) − payment. */
(function(){
'use strict';
const {$,$c,money,clamp,lerp,ease,lin,esc,el,n1,rect,text,line,tag,ticks}=Story.h,tw=Story.tw;
const FLOOR=25,INT='var(--int)',PRIN='var(--prin)',PILE='var(--seed)';
function run(B0,apr,pay){const r=apr/1200;let B=B0,m=0,I=0;const bal=[B],ints=[],pays=[];
 while(B>0.005&&m<1200){const i=B*r,mn=Math.max(FLOOR,i+0.01*B);let p=Math.max(pay||0,mn);p=Math.min(p,B+i);B=B+i-p;I+=i;m++;bal.push(Math.max(0,B));ints.push(i);pays.push(p);}
 return {m,I,bal,ints,pays,r};}
const R0=run(1500,24,0);
const ym=m=>{const y=Math.floor(m/12),mo=m%12;return (y?y+' yr':'')+(y&&mo?' ':'')+(mo||!y?mo+' mo':'');};
const payLabel=p=>p<25?'the minimum':'$'+p;
/* sums through month t (t may be a fraction while the picture is running) */
function sums(R,t){const n=Math.min(R.m,Math.floor(t+1e-6)),f=Math.min(1,t-n);let I=0,P=0;for(let j=0;j<n;j++){I+=R.ints[j];P+=R.pays[j];}if(n<R.m&&f>0){I+=R.ints[n]*f;P+=R.pays[n]*f;}return {I,P,off:P-I};}
function ticksR(lo,hi,n){const raw=(hi-lo)/n,p=Math.pow(10,Math.floor(Math.log10(raw)));let st=10*p;for(const m of[1,2,2.5,5,10]){if(raw<=m*p*1.0001){st=m*p;break;}}const out=[];for(let v=Math.ceil(lo/st)*st;v<=hi*1.0001;v+=st)out.push(v);return out;}

const DEF={view:'H',fbar:null,hl:null,cur:null,sel:null,
 ylo:0,yhi:1640,xm:3,mon:0,ph:-1,pp:0,inset:0,drop:0,board:0,tA:60,
 nowM:0,xmaxB:14,ymaxB:52,annot:0,cmp:0,tmax:2150,pay:0,apr:24,bal:1500};

/* ---------- view H: the statement ---------- */
function drawH(s,W,H,k){const gut=Story.gut;let o='';
 const lx=W*0.19,ly=H*0.4,lw=Math.min(150*k,W*0.24),lh=lw*0.64;
 o+=rect(lx-lw/2,ly-lh/2,lw,lh,PILE,{rx:8})+rect(lx-lw/2+7,ly-lh/2+7,lw-14,lh-14,'var(--card)',{rx:3})+rect(lx-lw/2-lw*0.12,ly+lh/2+2,lw*1.24,9*k,PILE,{rx:4});
 o+=text('$1,500',lx,ly+9*k,{a:'middle',s:Math.min(26,lw*0.2)*k,w:800});
 o+=text('Maya\'s new laptop',lx,ly+lh/2+36*k,{a:'middle',s:15*k,w:700})+text('on her first credit card',lx,ly+lh/2+55*k,{a:'middle',s:13.5*k,c:'var(--muted)'});
 const sx=W*0.4,sw=Math.min(W*0.54,500),sy=H*0.1,sh=H*0.76,px=sx+20,rxx=sx+sw-20,rh=Math.min(40*k,sh*0.15);
 o+=rect(sx,sy,sw,sh,'var(--card)',{rx:10,stroke:'var(--line)',sw:1.5});
 o+=text('CREDIT CARD STATEMENT',px,sy+28*k,{s:12.5*k,w:700,c:'var(--muted)'})+line(px,sy+38*k,rxx,sy+38*k,'var(--line)');
 [['New balance','$1,500.00'],['Interest rate (APR)','24% a year'],['Minimum payment due','$45.00']].forEach((r,j)=>{const y=sy+38*k+rh*(j+1);
  if(j===2)o+=rect(px-8,y-rh*0.66,sw-24,rh*0.92,'var(--card2)',{rx:6,stroke:'var(--rj)',sw:1.5});
  o+=text(r[0],px,y,{s:15.5*k,w:j===2?700:500})+text(r[1],rxx,y,{a:'end',s:(j===2?18:16)*k,w:800});});
 const wy=sy+38*k+rh*3+rh*0.72;
 o+=text('Minimum payment warning',px,wy,{s:12.5*k,w:700,c:'var(--muted)'});
 o+=text('If Maya adds nothing new and pays only the',px,wy+20*k,{s:13.5*k})+text('minimum each month, this will be paid off in',px,wy+38*k,{s:13.5*k});
 const lab=gut==='3'?'about 3 years':gut==='6'?'about 6 years':gut==='9'?'more than 9 years':'?';
 o+=tag(lab,px,wy+66*k,{s:(gut?15:20)*k,c:gut?'var(--rj-ink)':'var(--fg)',bc:'var(--rj)',bw:2});
 if(gut)o+=text('your pick',px+lab.length*15*k*0.57+24,wy+64*k,{s:12.5*k,c:'var(--muted)',w:600});
 return o;}

/* ---------- view A: what she owes, month by month ---------- */
function drawA(s,W,H,k){
 const narrow=W<700,RP=narrow?0:214,L=70*k,T=(narrow?62:30)*k,Bm=46*k,PR=narrow?W-14:W-RP-12,pw=PR-L,ph=H-T-Bm,y0=H-Bm;
 const R=R0,sw=pw/(s.xm+1),cw=Math.min(sw*0.7,132),big=sw>=48,zoom=s.ylo>1,lab=v=>sw>=92?money(v):$(v);
 const X=i=>L+i*sw+(sw-cw)/2,XC=i=>L+i*sw+sw/2,Y=v=>y0-(Math.max(v,s.ylo)-s.ylo)/(s.yhi-s.ylo)*ph;
 const n=Math.floor(s.mon+1e-6),frac=s.mon-n,month=s.fbar==='month',c=s.cur==null?1:s.cur;
 let o='';
 ticksR(s.ylo,s.yhi,5).forEach(v=>{if(v>s.ylo+1)o+=line(L,Y(v),PR,Y(v),'var(--grid)');if(v>s.ylo+1||!zoom)o+=text($(v),L-8,Y(v)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});});
 for(let i=0;i<=Math.ceil(s.xm-0.01);i++){if(!(s.xm<=13||i%6===0))continue;o+=text(i===0?'today':(i===1||s.xm>13?'month '+i:String(i)),XC(i),y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)'});}
 /* the strip a year of payments took off */
 if(s.drop>0.01){const ya=Y(1500),yb=Y(R.bal[12]);o+=rect(L,ya,pw,yb-ya,'var(--prin)',{op:0.22*s.drop})+line(L,ya,PR,ya,'var(--prin)',{dash:'5 4',op:s.drop})+line(L,yb,PR,yb,'var(--prin)',{dash:'5 4',op:s.drop});}
 const maxI=frac>0.001?n+1:n;
 for(let i=0;i<=maxI;i++){
  if(s.ph>=0&&i===s.ph+1)continue;
  const v=R.bal[i],x=X(i),dim=(s.hl&&month&&i!==c&&!(s.hl==='owes'&&i===c-1))?0.35:1,op=i>n?frac:1;
  o+=rect(x,Y(v),cw,y0-Y(v),PILE,{op:dim*op});
  if(big&&i<=n&&dim===1&&(s.drop<0.5||zoom))o+=text(lab(v),x+cw/2,Y(v)-8*k,{a:'middle',s:(sw>130?17:13)*k,w:800});
  if(big&&i<=n&&!zoom&&i===0&&s.xm<5)o+=text('what Maya owes',x+cw/2,(Y(v)+y0)/2,{a:'middle',s:13.5*k,w:700,c:'var(--stage)'});
 }
 if(s.drop>0.01){const ya=Y(1500),yb=Y(R.bal[12]);
  o+=tag('one year of payments took off $170',PR-10,ya-9*k,{a:'end',s:14*k,c:'var(--prin)',bc:'var(--prin)',bw:2,op:s.drop});
  o+=tag('after 12 payments she still owes '+$(R.bal[12]),PR-10,yb+34*k,{a:'end',s:14*k,op:s.drop});}
 /* one month: carry the pile, the card adds its slice, the payment bites */
 const narrowTow=narrow;
 const tT=T+96*k,phT=y0-tT,gap=16,twr=RP?(RP-22-gap-10)/2:0,rx=W-RP+8,tx1=rx+6,tx2=tx1+twr+gap,YT=v=>y0-v/s.tA*phT;
 const S0=sums(R,n);let fly='';
 if(s.ph>=0){
  const i=s.ph,B=R.bal[i],it=R.ints[i],p=R.pays[i],Bn=R.bal[i+1],xd=X(i+1),q=s.pp;
  const a1=clamp(q/0.12,0,1),land=ease(clamp((q-0.14)/0.3,0,1)),bite=clamp((q-0.52)/0.12,0,1),go=ease(clamp((q-0.66)/0.3,0,1));
  const yB=Y(B),yTop=Y(B+it),yBn=Y(Bn);
  o+=rect(xd,go>0?lerp(yB,yBn,1):yB,cw,y0-(go>0?yBn:yB),PILE,{op:a1});
  if(q<0.16&&q>0.02)o+=text('same pile, a month later',xd+cw/2,yB-12*k,{a:'middle',s:13*k,c:'var(--muted)',w:600,op:a1});
  /* the slice */
  if(q>0.14&&go<1){const sy=lerp(T-26,yTop,land),sh=yB-yTop;
   if(go<=0){o+=rect(xd,sy,cw,sh,INT,{op:land<1?0.9:1});
    if(bite>0)o+=rect(xd,yB,cw,yBn-yB,PRIN,{op:bite});
    if(sh>16*k)o+=text('+'+money(it),xd+cw/2,sy+sh/2+5*k,{a:'middle',s:13.5*k,w:800,c:'#fff'});
    if(land>=1&&bite<=0)o+=tag('the card adds 2%: '+money(it),xd+cw+10,yTop+16*k,{s:13.5*k,c:INT,bc:INT,bw:2})+text(money(B+it),xd+cw/2,yTop-8*k,{a:'middle',s:(sw>130?17:13)*k,w:800});
    if(bite>0){o+=rect(xd-4,yTop-4,cw+8,yBn-yTop+8,'none',{stroke:'var(--fg)',sw:3,rx:4,op:bite});
     o+=tag('payment: '+money(p),xd+cw+12,yTop+14*k,{s:13.5*k,bw:2,bc:'var(--fg)',op:bite})+tag(money(it)+' pays the slice',xd+cw+12,yTop+42*k,{s:12.5*k,c:INT,op:bite})+tag(money(p-it)+' comes off the pile',xd+cw+12,yTop+68*k,{s:12.5*k,c:PRIN,op:bite});}
   }else{
    /* the two parts of the payment leave: red to the card, blue off the debt */
    const d1=RP?{x:tx2,y:YT(S0.I+it),w:twr,h:YT(S0.I)-YT(S0.I+it)}:{x:xd,y:T-30,w:cw,h:sh},d2=RP?{x:tx1,y:YT(S0.off+p-it),w:twr,h:YT(S0.off)-YT(S0.off+p-it)}:{x:xd,y:T-30,w:cw,h:yBn-yB};
    fly+=rect(lerp(xd,d1.x,go),lerp(yTop,d1.y,go),lerp(cw,d1.w,go),Math.max(1,lerp(sh,d1.h,go)),INT,{op:RP?1:1-go});
    fly+=rect(lerp(xd,d2.x,go),lerp(yB,d2.y,go),lerp(cw,d2.w,go),Math.max(1,lerp(yBn-yB,d2.h,go)),PRIN,{op:RP?1:1-go});
    o+=text(money(Bn),xd+cw/2,yBn-8*k,{a:'middle',s:(sw>130?17:13)*k,w:800,op:go});
   }
  }
 }
 /* break mark: the pile continues below the picture */
 if(zoom){let d='';const zy=y0-9;for(let x=L;x<=PR;x+=14)d+=(x===L?'M':'L')+n1(x)+' '+n1(zy+(Math.round((x-L)/14)%2?5:-5));
  o+='<path d="'+d+'" style="fill:none;stroke:var(--stage);stroke-width:5"/>';}
 o+=line(L,y0,PR,y0,'var(--axis)',{w:1.5});
 /* formula ↔ picture links, for the month ending at column c */
 if(month&&c>=1){const B=R.bal[c-1],it=R.ints[c-1],p=R.pays[c-1],Bn=R.bal[c],x=X(c),yB=Y(B),yTop=Y(B+it),yBn=Y(Bn),tx=x+cw+12,left=c>8,ax=left?x-12:tx,an=left?'end':'start';
  if(s.hl==='owes'){o+=rect(X(c-1)-4,Y(B)-4,cw+8,y0-Y(B)+8,'none',{stroke:'var(--fg)',sw:3,rx:4});o+=tag('owes: '+money(B)+' when month '+c+' starts',X(c-1)+cw/2,Y(B)-30*k,{a:c<3?'start':'middle',s:13.5*k,bw:2,bc:'var(--fg)'});}
  if(s.hl==='one'){o+=rect(x,yB,cw,y0-yB,PILE)+rect(x-3,yB-3,cw+6,y0-yB+6,'none',{stroke:'var(--fg)',sw:3,rx:3,dash:'6 4'});o+=tag('× 1: the pile she already owed, '+money(B),ax,(yB+y0)/2,{a:an,s:13.5*k,bw:2,bc:'var(--fg)'});}
  if(s.hl==='r'){o+=rect(x,yB,cw,yBn-yB,PILE,{op:0.5})+rect(x,yTop,cw,yB-yTop,INT,{stroke:'var(--fg)',sw:3});o+=tag('× 0.02: the card\'s slice, +'+money(it),ax,yTop+16*k,{a:an,s:13.5*k,c:INT,bc:INT,bw:2});}
  if(s.hl==='pay'){o+=rect(x,yTop,cw,yB-yTop,INT)+rect(x,yB,cw,yBn-yB,PRIN)+rect(x-4,yTop-4,cw+8,yBn-yTop+8,'none',{stroke:'var(--fg)',sw:3,rx:4});
   o+=tag('− payment: '+money(p)+' comes off the top',ax,yTop+16*k,{a:an,s:13.5*k,bw:2,bc:'var(--fg)'})+tag(money(it)+' to the card, '+money(p-it)+' off the pile',ax,yTop+44*k,{a:an,s:12.5*k});}
  if(s.hl==='next'){o+=rect(x-4,yBn-4,cw+8,y0-yBn+8,'none',{stroke:'var(--fg)',sw:3,rx:4});}
  o+='<path d="M'+n1(XC(c)-6*k)+' '+n1(y0+9*k)+' l'+n1(6*k)+' '+n1(-8*k)+' l'+n1(6*k)+' '+n1(8*k)+' z" style="fill:var(--rj)"/>';
  for(let i=1;i<=Math.min(12,Math.round(s.xm));i++)o+='<rect class="hit" data-i="'+i+'" x="'+n1(L+i*sw)+'" y="'+n1(T)+'" width="'+n1(sw)+'" height="'+n1(ph+22*k)+'" style="fill:transparent"/>';
 }
 /* where the payments went */
 if(s.board>0.01){const t=s.ph>=0&&s.pp>=0.96?n+1:s.mon,Q=sums(R,t),op=s.board;
  if(narrow){o+=text('Card kept '+$c(Q.I),L,22*k,{s:14.5*k,w:800,c:INT,op})+text('Off the debt '+$c(Q.off),PR,22*k,{a:'end',s:14.5*k,w:800,c:PRIN,op})+text('Maya has paid '+$c(Q.P),L,40*k,{s:12.5*k,c:'var(--muted)',w:600,op});}
  else{o+='<g style="opacity:'+op.toFixed(2)+'">'+text('Maya has paid',rx,T-8*k,{s:13.5*k,w:600,c:'var(--muted)'})+text($c(Q.P),W-12,T-8*k,{a:'end',s:19*k,w:800});
   o+=text('where it went',rx,T+16*k,{s:12.5*k,c:'var(--muted)',w:600});
   o+=line(rx,y0,W-12,y0,'var(--axis)',{w:1.5})+rect(tx1,YT(Q.off),twr,y0-YT(Q.off),PRIN)+rect(tx2,YT(Q.I),twr,y0-YT(Q.I),INT);
   o+=text($c(Q.off),tx1+twr/2,YT(Q.off)-8*k,{a:'middle',s:15*k,w:800,c:PRIN})+text($c(Q.I),tx2+twr/2,YT(Q.I)-8*k,{a:'middle',s:15*k,w:800,c:INT});
   o+=text('off the debt',tx1+twr/2,y0+18*k,{a:'middle',s:12.5*k,w:700,c:PRIN})+text('card kept',tx2+twr/2,y0+18*k,{a:'middle',s:12.5*k,w:700,c:INT})+'</g>';}
 }
 /* the whole pile, and the part of it on screen */
 if(s.inset>0.01&&!narrow){const ix=rx+4,iy=T+30*k,ih=52*k,iw=20,f=v=>iy+ih-v/1640*ih;
  o+='<g style="opacity:'+s.inset.toFixed(2)+'">'+rect(ix,f(1500),iw,f(0)-f(1500),PILE,{op:0.55})+rect(ix-4,f(s.yhi),iw+8,Math.max(5,f(s.ylo)-f(s.yhi)),'none',{stroke:'var(--rj)',sw:2.5,rx:2});
  o+=text('The whole pile.',ix+iw+12,iy+ih*0.42,{s:12.5*k,w:700})+text('You are looking at the top.',ix+iw+12,iy+ih*0.42+16*k,{s:12*k,c:'var(--muted)'})+'</g>';}
 return o+fly;}

/* ---------- view B: every payment, side by side ---------- */
function drawB(s,W,H,k){
 const narrow=W<700,RP=narrow?0:214,L=62*k,T=(narrow?94:40)*k,Bm=lerp(36,64,s.annot)*k,PR=narrow?W-14:W-RP-12,pw=PR-L,ph=H-T-Bm,y0=H-Bm;
 const R=run(s.bal,s.apr,s.pay),N=R.m,sw=pw/s.xmaxB,cw=Math.max(1.2,sw*0.82);
 const X=m=>L+(m-1)*sw+(sw-cw)/2,Y=v=>y0-v/s.ymaxB*ph,G=Story.gh,gop=G?G.op:0,GH=G?G.d:null;
 const t=Math.min(s.nowM,N),nn=Math.floor(t+1e-6),fr=t-nn,done=t>=N-1e-6,Q=sums(R,t),owes=Math.max(0,s.bal-Q.off);
 let o='';
 ticks(s.ymaxB,4).forEach(v=>{if(v>0)o+=line(L,Y(v),PR,Y(v),'var(--grid)');o+=text($(v),L-8,Y(v)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});});
 if(!narrow)o+=text('each column: one monthly payment',L,T-12*k,{s:13*k,c:'var(--muted)',w:600});
 if(s.xmaxB<=30){for(let m=1;m<=Math.floor(s.xmaxB);m++){if(s.xmaxB>16&&m%3!==0&&m!==1)continue;o+=text(m===1?'month 1':String(m),L+(m-0.5)*sw,y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)'});}}
 else{const stepY=s.xmaxB>200?5:s.xmaxB>90?1:1;for(let y=1;y*12<=s.xmaxB;y+=stepY){const x=L+y*12*sw;o+=line(x,y0,x,y0+5,'var(--axis)')+text(y===1?'1 yr':String(y),x,y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)'});}}
 /* outline of the minimum-only plan, for comparison */
 const outline=(Rg,op,lab)=>{let d='';Rg.pays.forEach((p,j)=>{const x=L+j*sw;d+=(j?'L':'M')+n1(x)+' '+n1(Y(p))+'L'+n1(x+sw)+' '+n1(Y(p));});d+='L'+n1(L+Rg.m*sw)+' '+n1(y0);
  let q='<path d="'+d+'" style="fill:none;stroke:var(--fg);stroke-width:2;stroke-dasharray:5 4;opacity:'+(0.7*op).toFixed(2)+'"/>';
  if(lab)q+=text(lab,L+Math.min(Rg.m,s.xmaxB)*sw*0.62,Y(Rg.pays[Math.floor(Rg.m*0.62)])-9*k,{a:'middle',s:13*k,w:700,halo:1,op});return q;};
 for(let m=1;m<=Math.min(N,nn+(fr>0.001?1:0));m++){const p=R.pays[m-1],it=R.ints[m-1],x=X(m),op=m>nn?fr:1;
  o+=rect(x,Y(p-it),cw,y0-Y(p-it),PRIN,{op})+rect(x,Y(p),cw,Y(p-it)-Y(p)+0.4,INT,{op});
  if(sw>=40&&m<=nn){const f=v=>cw>=62?money(v):$(v);if(Y(p-it)-Y(p)>16*k)o+=text(f(it),x+cw/2,(Y(p)+Y(p-it))/2+5*k,{a:'middle',s:12.5*k,w:800,c:'#fff'});if(y0-Y(p-it)>16*k)o+=text(f(p-it),x+cw/2,(y0+Y(p-it))/2+5*k,{a:'middle',s:12.5*k,w:800,c:'#fff'});}}
 if(s.cmp>0.01)o+=outline(run(s.bal,s.apr,0),s.cmp,'paying only the minimum: 114 months');
 if(GH&&gop>0)o+=outline(GH,gop,'before');
 o+=line(L,y0,PR,y0,'var(--axis)',{w:1.5});
 if(!done&&t>0.01&&s.xmaxB>30){const xn=L+t*sw;o+=line(xn,T,xn,y0,'var(--rj)',{w:1.5,op:0.6})+tag('month '+nn+(nn>=12?' · '+ym(nn):''),xn,T+16*k,{a:xn>PR-110?'end':'middle',s:13*k,c:'var(--rj-ink)',bc:'var(--rj)'});}
 if(s.annot>0.01){const op=s.annot,by=y0+34*k,xe=L+N*sw;
  o+=line(L,by,xe,by,'var(--fg)',{w:3,op})+line(L,by-5,L,by+5,'var(--fg)',{w:3,op})+line(xe,by-5,xe,by+5,'var(--fg)',{w:3,op})+text('width: '+N+' months in debt ('+ym(N)+')',(L+xe)/2,by+20*k,{a:'middle',s:13.5*k,w:800,op});
  const fm=R.pays.findIndex(p=>p<=FLOOR+0.0001)+1,hm=R.bal.findIndex(b=>b<=s.bal/2);
  if(!narrow){o+=tag('all the red: what waiting cost, '+$(R.I),L+pw*0.3,T+ph*0.2,{s:14*k,c:INT,bc:INT,bw:2,op})+tag('all the blue: the laptop, '+$(s.bal),L+pw*0.3,T+ph*0.2+32*k,{s:14*k,c:PRIN,bc:PRIN,bw:2,op});}
  if(fm>1){const x=L+(fm-1)*sw;o+=line(x,T+ph*0.42,x,y0,'var(--fg)',{dash:'3 4',op})+tag(narrow?'$25 floor':'from month '+fm+' the minimum is stuck at $25',x+8,T+ph*0.42+10*k,{s:12.5*k,op});}
  if(hm>0&&!narrow){const x=L+hm*sw;o+=line(x,T+ph*0.6,x,y0,'var(--fg)',{dash:'3 4',op})+tag('month '+hm+': half the debt is still there',x+8,T+ph*0.6+10*k,{s:12.5*k,op});}}
 if(s.sel!=null&&s.sel>=1&&s.sel<=N){const p=R.pays[s.sel-1];o+=rect(X(s.sel)-3,Y(p)-3,cw+6,y0-Y(p)+6,'none',{stroke:'var(--fg)',sw:3,rx:3});}
 /* scoreboard and towers */
 const head=done?'Paid off: '+ym(N):'month '+nn;
 if(narrow){o+=text('Card kept '+$(Q.I),L,22*k,{s:15*k,w:800,c:INT})+text('Off the debt '+$(Q.off),PR,22*k,{a:'end',s:15*k,w:800,c:PRIN})+text(head,L,40*k,{s:12.5*k,c:'var(--muted)',w:600})+text('still owes '+$(owes),PR,40*k,{a:'end',s:12.5*k,c:'var(--muted)',w:600});
  const bw=v=>pw*v/s.tmax,bh=11*k;o+=rect(L,48*k,bw(Q.off),bh,PRIN,{rx:2})+rect(L,48*k,bw(s.bal),bh,'none',{stroke:PRIN,sw:1.5,dash:'4 3',rx:2})+rect(L,63*k,bw(Q.I),bh,INT,{rx:2});}
 else{const rx=W-RP+8,rr=W-12,tT=T+92*k,phT=y0-tT,gap=16,twr=(RP-22-gap-10)/2,tx1=rx+6,tx2=tx1+twr+gap,YT=v=>y0-v/s.tmax*phT;
  o+=text(head,rx,T-12*k,{s:16*k,w:800});
  [['Still owes',owes,'var(--fg)'],['Off the debt',Q.off,PRIN],['The card kept',Q.I,INT]].forEach((r,j)=>{const y=T+12*k+j*22*k;o+=text(r[0],rx,y,{s:13.5*k,w:700,c:r[2]})+text($(r[1]),rr,y,{a:'end',s:16*k,w:800,c:r[2]});});
  o+=line(rx,y0,rr,y0,'var(--axis)',{w:1.5})+rect(tx1,YT(s.bal),twr,y0-YT(s.bal),'none',{stroke:PRIN,sw:2,dash:'5 4'})+rect(tx1,YT(Q.off),twr,y0-YT(Q.off),PRIN)+rect(tx2,YT(Q.I),twr,y0-YT(Q.I),INT);
  if(Q.off<s.bal*0.86)o+=text('the laptop',tx1+twr/2,YT(s.bal)+16*k,{a:'middle',s:12*k,c:PRIN,w:700})+text($(s.bal),tx1+twr/2,YT(s.bal)+31*k,{a:'middle',s:12*k,c:PRIN,w:700});
  if(GH&&gop>0)o+=rect(tx2,YT(GH.I),twr,y0-YT(GH.I),'none',{stroke:'var(--fg)',sw:2,dash:'5 4',op:0.7*gop});
  if(s.cmp>0.01){const Im=run(s.bal,s.apr,0).I;o+=rect(tx2,YT(Im),twr,y0-YT(Im),'none',{stroke:'var(--fg)',sw:2,dash:'5 4',op:0.7*s.cmp});}
  o+=text('off the debt',tx1+twr/2,y0+18*k,{a:'middle',s:12.5*k,w:700,c:PRIN})+text('card kept',tx2+twr/2,y0+18*k,{a:'middle',s:12.5*k,w:700,c:INT});}
 if(s.fbar==='col'||s.fbar==='drive')for(let m=1;m<=N&&m<=s.xmaxB;m++)o+='<rect class="hit" data-m="'+m+'" x="'+n1(L+(m-1)*sw)+'" y="'+n1(T)+'" width="'+n1(sw)+'" height="'+n1(ph)+'" style="fill:transparent"/>';
 return o;}

/* ---------- small pictures for the check ---------- */
function miniP(bal,apr,pay,xmax,ymax,lab){const W=420,H=178,L=8,T=10,Bm=22,pw=W-16,ph=H-T-Bm,y0=H-Bm,sw=pw/xmax,cw=sw*0.8,R=run(bal,apr,pay),Y=v=>y0-v/ymax*ph;let o='';
 R.pays.forEach((p,j)=>{const x=L+j*sw+(sw-cw)/2,it=R.ints[j];o+=rect(x,Y(p-it),cw,y0-Y(p-it),PRIN)+rect(x,Y(p),cw,Y(p-it)-Y(p)+0.4,INT);});
 o+=line(L,y0,W-8,y0,'var(--axis)',{w:1.5})+text('month 1',L,y0+16,{s:12.5,c:'var(--muted)'})+text('month '+xmax,W-8,y0+16,{a:'end',s:12.5,c:'var(--muted)'});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(lab)+'">'+o+'</svg>';}
function miniMonth(owes,r,pay){const W=520,H=120,L=10,pw=W-110,top=owes*(1+r),X=v=>L+v/top*pw,it=owes*r,nx=owes+it-pay;let o='';
 o+=text('owed',L,18,{s:12.5,c:'var(--muted)',w:600})+rect(L,24,X(owes)-L,22,PILE)+rect(X(owes),24,X(owes+it)-X(owes),22,INT)+text('+'+money(it),X(owes+it)+6,40,{s:12.5,w:800,c:INT});
 o+=text('after the payment',L,72,{s:12.5,c:'var(--muted)',w:600});
 if(nx>0)o+=rect(L,78,X(nx)-L,22,PILE);
 if(pay>0&&nx<owes+it)o+=rect(X(Math.max(0,nx)),78,X(owes+it)-X(Math.max(0,nx)),22,'none',{stroke:'var(--fg)',sw:2,dash:'4 3'})+text('− '+money(pay),X(owes+it)+6,94,{s:12.5,w:800});
 o+=text('= '+money(nx),L+6,94,{s:13.5,w:800,c:'var(--stage)'});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="One month: owed plus the card\'s slice, minus the payment">'+o+'</svg>';}

/* ---------- steps ---------- */
const PARTS=['One month','The long road','Change it','Tell it'];
const ZA={view:'A',ylo:1300,yhi:1545,inset:1,board:1};
const BM={view:'B',xmaxB:118,ymaxB:52,nowM:114};
const gutName={3:'about 3 years',6:'about 6 years',9:'more than 9 years'};
const STEPS=[
 {part:-1,title:'How long will it take?',st:{view:'H'},choices:[['3','About 3 years'],['6','About 6 years'],['9','More than 9 years']],locked:'Locked in. Now watch one month happen.',
  t:'Maya is 19. Her laptop dies the week before finals, so she puts a new one, $1,500, on her first credit card. The card asks for a small minimum payment each month. <b>If she only ever pays the minimum, how long until it is paid off?</b>',
  alt:'Her first minimum payment is $45. Go with your gut. There is no math yet.'},
 {part:0,title:'What Maya owes',st:{view:'A',xm:3,mon:0},
  t:'This pile is what Maya owes the card: <b>$1,500</b>, the price of the laptop.',
  alt:'Money you still owe on a card is called your balance. The balance is this pile.'},
 {part:0,title:'The card adds its slice',st:Object.assign({},ZA,{xm:3,mon:0,ph:0,pp:0.47,board:0}),
  play:async ok=>{const S=Story.S;await tw({ylo:1300,yhi:1545,inset:1},1500);if(!ok())return;S.ph=0;S.pp=0;await tw({pp:0.47},2400,lin);},
  t:'The card charges 24% a year. That is 2% every month, and 2% of $1,500 is <b>$30</b>. The card adds it to the pile: now she owes $1,530. That slice is called <b>interest</b>.',
  alt:'Interest is the card\'s price for lending its money. Nobody hands Maya a bill for it. It is simply added to what she owes. The picture has zoomed in on the top of the pile so you can see the slice.'},
 {part:0,title:'Maya pays the minimum',st:Object.assign({},ZA,{xm:3,mon:1,tA:60}),
  play:async ok=>{const S=Story.S;S.ph=0;S.pp=0.47;await tw({board:1},300);if(!ok())return;await tw({pp:1},3400,lin);if(!ok())return;S.ph=-1;S.pp=0;S.mon=1;},
  t:'The minimum this month is <b>$45</b>. The first $30 pays the card\'s slice. Only $15 comes off what she owes. <b>She paid $45. The pile dropped $15.</b>',
  alt:'A payment always covers the interest first. Whatever is left is the only part that shrinks the debt. That left-over part is called paying down the principal.'},
 {part:0,title:'Month two',st:Object.assign({},ZA,{xm:3,mon:2,tA:60}),
  play:async ok=>{const S=Story.S;S.ph=1;S.pp=0;await tw({pp:1},4200,lin);if(!ok())return;S.ph=-1;S.pp=0;S.mon=2;},
  t:'The same two moves again. 2% of $1,485 is $29.70. The minimum shrinks along with the pile, to $44.55, so only <b>$14.85</b> comes off this time.',
  alt:'This card sets the minimum at the interest plus 1% of what she owes. A smaller pile means a smaller minimum, and a smaller minimum means a smaller bite.'},
 {part:0,title:'One year',st:Object.assign({},ZA,{xm:12,mon:12,tA:390}),
  play:async ok=>{await tw({xm:12,tA:390},1200);if(!ok())return;await tw({mon:12},5200,lin);},
  t:'Twelve minimum payments. Maya paid <b>$511</b>. The card kept $341 of it. What she owes dropped $170.',
  alt:'Two of every three dollars she paid this year never touched the debt.'},
 {part:0,title:'The same two moves, every month',st:Object.assign({},ZA,{xm:12,mon:12,tA:390,fbar:'month',cur:1}),
  t:'Every month the pile is multiplied by 1.02, then the payment comes off. <b>Tap each part of the formula</b> to find it in the picture. Tap a column to pick a month.',
  alt:'Our letters. <b>r</b> is the monthly rate: 24% a year ÷ 12 = 2%, written 0.02. The 1 keeps the pile she already owed. Times (1 + r) adds the card\'s slice. Minus the payment is the bite.'},
 {part:0,title:'Now look at the whole pile',st:{view:'A',xm:12,mon:12,tA:390,ylo:0,yhi:1640,inset:0,board:1,drop:1},
  play:async ok=>{await tw({ylo:0,yhi:1640,inset:0},2400);if(!ok())return;await tw({drop:1},700);},
  t:'You have been looking at the top of the pile. Here is all of it. <b>A year of payments took off that thin strip.</b>',
  alt:'The $170 she paid down is about a ninth of the pile. At the minimum, the pile shrinks about 1% a month.'},
 {part:1,title:'Every payment, side by side',st:{view:'B',xmaxB:14,ymaxB:52,nowM:12},
  t:'New picture, same year. Each column is one payment. <b>Red went to the card. Blue came off the debt.</b>',
  alt:'The blue pieces are small because the minimum is built that way: the interest first, then just 1% of the pile.'},
 {part:1,title:'Keep paying the minimum',st:BM,
  play:async ok=>{await tw({xmaxB:118},1500);if(!ok())return;await tw({nowM:114},11000,lin);},
  t:'Maya keeps paying the minimum. Watch the blue tower. It has to reach $1,500 before she is done.',
  t2:()=>{const g=Story.gut;return '<b>114 months: nine and a half years.</b> The card kept $1,887, more than the laptop cost.'+(g?(g==='9'?' Your gut was right.':' Your gut said '+gutName[g]+'. It takes far longer than most people expect.'):'');},
  alt:'The payments shrink as the pile shrinks, so the pile never takes a big bite. From month 60 on, the minimum is stuck at this card\'s $25 floor.'},
 {part:1,title:'Read the picture',st:Object.assign({},BM,{annot:1}),
  t:'<b>Width</b> is how long she is in debt. All the blue together is the laptop: $1,500. All the red is what waiting cost: <b>$1,887</b>.',
  alt:'The blue area is the same no matter how she pays. Only two things can change: how wide the picture is, and how much red sits on top.'},
 {part:1,title:'Pay $100 instead',st:Object.assign({},BM,{pay:100,cmp:1,ymaxB:116}),
  play:async ok=>{await tw({annot:0,cmp:1,ymaxB:116},1300);if(!ok())return;await tw({pay:100},6000,lin);},
  t:'Same laptop, same card. This time Maya pays a steady <b>$100 a month</b>. Watch the picture squeeze.',
  t2:'<b>19 months instead of 114.</b> The blue is still $1,500. The red fell from $1,887 to $301.',
  alt:'Bigger payments mean bigger blue pieces. The pile empties sooner, so the card gets fewer months to add its slice.'},
 {part:1,title:'One formula, every month',st:{view:'B',xmaxB:21,ymaxB:116,nowM:114,pay:100,fbar:'col',sel:1},
  t:'Every column is the same formula with that month\'s numbers. <b>Tap any column</b> to read its story.',
  alt:'Look at the red part of each $100. It gets smaller every month, because a smaller pile means a smaller slice for the card.'},
 {part:2,title:'Change the math, watch the picture',st:{view:'B',xmaxB:21,ymaxB:116,nowM:1200,pay:100,fbar:'drive'},
  t:'You drive. <b>Before you move a slider, say what you think the picture will do.</b> The dashed outline shows where the picture was.',
  alt:'Change one thing at a time. Each slider is one part of the formula: the payment, r, or what she owes at the start.'},
 {part:3,title:'Check yourself',st:{view:'P',panel:'check'},
  t:'Three quick ones. Each asks you to connect a picture, a formula and a story.',
  alt:'Wrong answers get a hint that points at the picture. Try again as many times as you need.'},
 {part:3,title:'Tell the story',st:{view:'P',panel:'story'},
  t:'Math is finished when you can tell its story. Three sentences is enough. Then copy your work into Canvas.',
  alt:'Use the picture words: pile, slice, payment, red, blue, width. If you get stuck, go back to "Read the picture" and describe what you see.'}
];

/* ---------- formula strip ---------- */
const tokB=(hl,val,name)=>'<button type="button" class="tok" data-hl="'+hl+'" aria-pressed="'+(Story.S.hl===hl)+'"><b>'+val+'</b><small>'+name+'</small></button>';
const tokS=(val,name,cls)=>'<span class="tok'+(cls?' '+cls:'')+'"><b>'+val+'</b><small>'+name+'</small></span>';
const OP=s=>'<span class="op">'+s+'</span>';
function fbarHtml(S){
 const m=S.fbar;if(!m)return null;
 if(m==='month'){const c=S.cur==null?1:S.cur,B=R0.bal[c-1],p=R0.pays[c-1];
  return '<div class="chain">Month '+c+': the pile <i>× 1.02</i>, then <i>− the payment</i>. <b>The same two moves, every month.</b></div>'+
   '<div class="frow">'+tokB('owes',money(B),'owes')+OP('×')+OP('(')+tokB('one','1','keep it')+OP('+')+tokB('r','0.02','r, monthly rate')+OP(')')+OP('−')+tokB('pay',money(p),'payment')+OP('=')+tokB('next',money(R0.bal[c]),'owes next month')+
   '<span class="letters">In letters: <code>next = owes × (1 + r) − payment</code></span></div>'+
   '<p class="hint"><b>Tap a part of the formula</b> to find it in the picture. <b>Tap a column</b> to pick a month.</p>';}
 if(m==='col'){const R=run(S.bal,S.apr,S.pay),c=clamp(S.sel==null?1:S.sel,1,R.m),B=R.bal[c-1],p=R.pays[c-1],it=R.ints[c-1];
  return '<div class="frow">'+tokS(money(B),'owes')+OP('×')+OP('(')+tokS('1','keep it')+OP('+')+tokS(String(+(S.apr/1200).toFixed(4)),'r')+OP(')')+OP('−')+tokS(money(p),'payment')+OP('=')+tokS(money(R.bal[c]),'owes next month','diff')+
   '<span class="letters">In letters: <code>next = owes × (1 + r) − payment</code></span></div>'+
   '<p class="hint">Month '+c+'\'s story: Maya owed '+money(B)+'. The card added <b>'+money(it)+'</b>. She paid '+money(p)+', so <b>'+money(p-it)+'</b> came off the pile.</p>';}
 if(m==='drive')return '<div class="drive">'+
   '<div class="ctl"><label for="c-pay">Maya pays each month <output id="o-pay"></output></label><input type="range" id="c-pay" min="20" max="400" step="5" value="'+(S.pay<25?20:S.pay)+'"><small>How tall each column is. All the way left is the minimum only.</small></div>'+
   '<div class="ctl"><label for="c-apr">The card\'s rate, a year <output id="o-apr"></output></label><input type="range" id="c-apr" min="10" max="30" step="1" value="'+S.apr+'"><small>r is this divided by 12. It sets how thick the red is.</small></div>'+
   '<div class="ctl"><label for="c-bal">What she owes at the start <output id="o-bal"></output></label><input type="range" id="c-bal" min="500" max="5000" step="100" value="'+S.bal+'"><small>All the blue, added together.</small></div></div>'+
   '<p class="narr" id="narr" aria-live="polite"></p><div class="quests" id="quests"></div>';
 return null;}
function bindFbar(box,S){if(S.fbar==='drive'){['c-pay','c-apr','c-bal'].forEach(id=>el(id).addEventListener('input',driveChanged));updateDrive();}}
const QUESTS=[
 {id:'pay',q:'Slide the payment up.',ask:'What will happen to the red?',a:'Taller columns, and fewer of them. More of every payment is blue, so the pile empties sooner and the card gets fewer months to charge.'},
 {id:'r',q:'Slide the rate.',ask:'Which color will change?',a:'r sets how thick the red is. The blue never changes: all of it together is always what she borrowed.'},
 {id:'yr',q:'Get her out in 12 months.',ask:'About how much a month?',a:'For $1,500 at 24%, about $142 a month does it. The card keeps about $200 instead of $1,887.'},
 {id:'red',q:'Make the red bigger than the blue.',ask:'What kind of plan does that?',a:'Small payments and a high rate. At the minimum on this card, Maya pays for the laptop more than twice.'}
];
const qdone={};
const fitX=R=>Math.max(8,R.m*1.06+1),fitYB=R=>Math.max.apply(null,R.pays)*1.16,fitTB=(R,bal)=>Math.max(bal,R.I)*1.12;
function updateDrive(){const S=Story.S;if(S.fbar!=='drive'||!el('o-pay'))return;const R=run(S.bal,S.apr,S.pay);
 el('o-pay').textContent=payLabel(S.pay);el('o-apr').textContent=S.apr+'%';el('o-bal').textContent='$'+S.bal.toLocaleString('en-US');
 el('narr').innerHTML='Paying '+(S.pay<25?'only the minimum':'$'+S.pay+' a month')+' at '+S.apr+'%: paid off in <b>'+R.m+' months</b> ('+ym(R.m)+'). The card keeps <b class="int">'+$(R.I)+'</b>, so the laptop really costs '+$(S.bal+R.I)+'.';
 if(S.pay>100)qdone.pay=1;if(S.apr!==24)qdone.r=1;if(R.m<=12)qdone.yr=1;if(R.I>S.bal)qdone.red=1;
 el('quests').innerHTML=QUESTS.map(q=>'<div class="quest'+(qdone[q.id]?' done':'')+'"><span class="mark">'+(qdone[q.id]?'done':'try')+'</span><b>'+q.q+'</b><p>'+(qdone[q.id]?q.a:q.ask)+'</p></div>').join('');}
function driveChanged(){const S=Story.S;
 Story.ghost(()=>{const R=run(S.bal,S.apr,S.pay);return {pays:R.pays,m:R.m,I:R.I};});
 const pv=+el('c-pay').value;S.pay=pv<25?0:pv;S.apr=+el('c-apr').value;S.bal=+el('c-bal').value;S.sel=null;
 const R=run(S.bal,S.apr,S.pay),g=Story.gh.d;Story.dropTweens();
 Story.tw({xmaxB:Math.max(fitX(R),g.m*1.06+1),ymaxB:Math.max(fitYB(R),Math.max.apply(null,g.pays)*1.16),tmax:Math.max(fitTB(R,S.bal),g.I*1.12)},380);updateDrive();}
function onGhostEnd(S){if(S.fbar==='drive'){const R=run(S.bal,S.apr,S.pay);Story.tw({xmaxB:fitX(R),ymaxB:fitYB(R),tmax:fitTB(R,S.bal)},600);}}

/* ---------- panels ---------- */
const ans={q1:null,q2:null,q3:null},tries={q1:0,q2:0,q3:0},story={},q2v={};
function panelHtml(p){
 if(p==='check')return '<div class="qcard" id="q1"><h2>1. One thing changed. Which one?</h2><p>Both pictures use the same scale.</p>'+
   '<div class="pair"><figure><figcaption>Before</figcaption>'+miniP(1500,24,60,38,130,'Before: 36 columns, each 60 dollars')+'</figure><figure><figcaption>After</figcaption>'+miniP(1500,24,120,38,130,'After: 15 taller columns')+'</figure></div>'+
   '<div class="opts" data-q="q1"><button type="button" data-v="r">r, the rate, went up</button><button type="button" data-v="pay">The payment went up</button><button type="button" data-v="bal">She borrowed more</button></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q2"><h2>2. Turn a story into a formula</h2><p>Leo owes $800 on a card that charges 18% a year. This month he pays $50. Build his month.</p>'+
   '<div class="build"><span class="tok" id="t-owes"><b><span class="unit">$</span><input id="i-owes" inputmode="decimal" aria-label="what he owes, in dollars" autocomplete="off"></b><small>owes</small></span>'+OP('×')+OP('(')+'<span class="tok"><b>1</b><small>keep it</small></span>'+OP('+')+'<span class="tok" id="t-r"><b><input id="i-r" inputmode="decimal" aria-label="r, the monthly rate, as a decimal" autocomplete="off"></b><small>r, monthly, as a decimal</small></span>'+OP(')')+OP('−')+'<span class="tok" id="t-pay"><b><span class="unit">$</span><input id="i-pay" inputmode="decimal" aria-label="payment, in dollars" autocomplete="off"></b><small>payment</small></span>'+
   '<button type="button" class="btn" id="q2check">Check my formula</button></div><div class="minibox" id="q2pic" hidden></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q3"><h2>3. Where did the money go?</h2><p>In her first year of minimum payments, Maya paid $511. About how much did what she owes drop?</p>'+
   '<div class="opts" data-q="q3"><button type="button" data-v="510">About $510</button><button type="button" data-v="340">About $340</button><button type="button" data-v="170">About $170</button></div><div class="fbslot"></div></div>';
 return '<div class="qcard"><h2>Tell the story of Maya\'s laptop</h2><p>Write it for a friend who has not seen the picture.</p><div class="story">'+
   '<div><label for="s1">Beginning<small>What did Maya owe, and what did the card ask for?</small></label><textarea id="s1" placeholder="Maya owed… The card asked for…"></textarea></div>'+
   '<div><label for="s2">Middle<small>What two things happen to the pile every month?</small></label><textarea id="s2" placeholder="Every month the card… then Maya…"></textarea></div>'+
   '<div><label for="s3">End<small>How did paying $100 change the ending, and which part of the formula caused it?</small></label><textarea id="s3" placeholder="At the minimum… At $100 a month… because…"></textarea></div></div>'+
   '<div class="copyrow"><button type="button" class="btn primary" id="copyb">Copy for Canvas</button><span id="copymsg">Copies your gut pick, your three checks and your story.</span></div><textarea id="copyfallback" hidden readonly aria-label="Your work, to copy"></textarea></div>'+
  '<div class="qcard"><h2>Use it</h2><div class="uses">'+
   '<div class="use"><b>Do:</b> when you get a credit card statement, find the “Minimum Payment Warning” box and compare the minimum-only line with the 3-year line. <b>Why:</b> the Credit CARD Act of 2009 makes most card statements print both: how long minimums take and what they cost, next to the payment that clears it in 3 years. That box is this picture, for your own card.</div>'+
   '<div class="use"><b>Do:</b> if you carry a balance, pay a fixed amount every month instead of whatever the minimum says, and set it up as an automatic payment. <b>Why:</b> the minimum shrinks as the balance shrinks, so each month knocks off only about 1%. A fixed $100 cleared this $1,500 in 19 months instead of 114. The Consumer Financial Protection Bureau also warns that paying only the minimum keeps you in debt longer and costs more in interest.</div>'+
   '<div class="use"><b>Do:</b> build this in a spreadsheet. <b>Why:</b> typing the formula yourself makes it yours. <a href="excel.html#build-creditcard">Build this payoff month by month</a>, one step at a time, then open it in Excel.</div></div></div>'+
  Story.voteCard()+
  '<details class="about"><summary>About this model</summary><p><b>This is a simplified model for learning, not financial advice.</b> Each month the card adds interest of APR ÷ 12 on the balance, then Maya pays. The minimum payment is <b>an assumption</b>: the interest plus 1% of the balance, or $25, whichever is more (or the whole balance if that is less). Real card terms vary, and real cards may compound daily, add fees, or change the rate. No new purchases are made.</p><p>With a fixed payment she pays her amount or the minimum, whichever is more. The tool counts whole months, so a small last payment counts as a month.</p><p>Many cards charge 20% to 30% a year. 24% APR means 2% a month.</p></details>';
}
const FB={
 q1:{pay:[1,'Yes. Taller columns and fewer of them. More of each payment is blue, so the debt ends sooner.'],r:[0,'A higher r would make the red slices thicker and the debt last longer. Here it ends sooner. Try again.'],bal:[0,'Borrowing more would add columns, because there would be more blue to pay off. Here there are fewer. Try again.']},
 q3:{170:[1,'Yes. About $341 went to the card first. Only $170 came off the pile.'],510:[0,'That would be true if the card charged nothing. The card took its 2% slice every month first. Try again.'],340:[0,'That is about what the card kept. The rest is what came off the pile. Try again.']}
};
function setFb(card,ok,msg){card.querySelector('.fbslot').innerHTML='<p class="fb '+(ok?'ok':'no')+'" role="status">'+msg+'</p>';}
function pickOpt(q,v,silent){const card=el(q),f=FB[q][v];if(!f)return;if(!silent&&ans[q]!=='ok')tries[q]++;
 card.querySelectorAll('.opts button').forEach(b=>{b.classList.remove('right','wrong');if(b.dataset.v===String(v))b.classList.add(f[0]?'right':'wrong');});
 setFb(card,f[0],f[1]);if(f[0])ans[q]='ok';ans[q+'v']=v;}
function checkQ2(silent){const card=el('q2'),num=id=>parseFloat(String(el(id).value).replace(/[$,%\s]/g,''));
 const ow=num('i-owes');let r=num('i-r');const py=num('i-pay');q2v.owes=el('i-owes').value;q2v.r=el('i-r').value;q2v.pay=el('i-pay').value;
 if(isNaN(ow)||isNaN(r)||isNaN(py)){if(!silent)setFb(card,false,'Fill in all three boxes: what he owes, r and the payment.');return;}
 const pct=r>=1;if(pct)r=r/100;if(!silent&&ans.q2!=='ok')tries.q2++;
 const okO=Math.abs(ow-800)<0.5,okR=Math.abs(r-0.015)<0.0002,okP=Math.abs(py-50)<0.5;
 el('t-owes').className='tok '+(okO?'ok':'bad');el('t-r').className='tok '+(okR?'ok':'bad');el('t-pay').className='tok '+(okP?'ok':'bad');
 if(ow>0&&r>0&&r<=0.2&&py>=0&&py<ow*3){el('q2pic').hidden=false;el('q2pic').innerHTML=miniMonth(ow,r,py);}
 if(okO&&okR&&okP){ans.q2='ok';setFb(card,true,'Yes. $800 × (1 + 0.015) − $50 = $762. Leo paid $50 and the pile dropped $38, because the card took $12 first.'+(pct?' Note: in the formula, 1.5% is written 0.015.':''));}
 else setFb(card,false,(!okO?'owes is the pile when the month starts: $800. ':'')+(!okR?'r is the monthly rate: 18% a year ÷ 12 = 1.5%, written 0.015. ':'')+(!okP?'The payment is what he pays this month: $50. ':'')+'The picture shows the month you built. Fix the red box and check again.');}
function bindPanel(panel,p){
 if(p==='check'){
  panel.querySelectorAll('.opts[data-q]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pickOpt(g.dataset.q,b.dataset.v);}));
  el('q2check').addEventListener('click',()=>checkQ2(false));
  ['i-owes','i-r','i-pay'].forEach(id=>el(id).addEventListener('keydown',e=>{if(e.key==='Enter')checkQ2(false);}));
  if(ans.q1v)pickOpt('q1',ans.q1v,true);if(ans.q3v)pickOpt('q3',ans.q3v,true);
  if(q2v.owes!=null){el('i-owes').value=q2v.owes;el('i-r').value=q2v.r;el('i-pay').value=q2v.pay;checkQ2(true);}
  return;}
 ['s1','s2','s3'].forEach(id=>{el(id).value=story[id]||'';el(id).addEventListener('input',e=>{story[id]=e.target.value;});});
 el('copyb').addEventListener('click',()=>Story.copy(workText(),el('copymsg'),el('copyfallback')));
}
function workText(){const mark=q=>ans[q]==='ok'?'correct'+(tries[q]>1?' (try '+tries[q]+')':''):'not answered yet',g=Story.gut;
 return ['Paying off a credit card (Raider FinanceLab)','My gut pick: '+(g?gutName[g]:'none'),'Check 1, what changed: '+mark('q1'),'Check 2, Leo\'s month: '+mark('q2')+(ans.q2==='ok'?'  $800 x (1 + 0.015) - $50 = $762':''),'Check 3, where the money went: '+mark('q3'),'Picture challenges done: '+Object.keys(qdone).length+' of 4','','My story','Beginning: '+(story.s1||''),'Middle: '+(story.s2||''),'End: '+(story.s3||'')].join('\n');}

function draw(S,W,H,k){return S.view==='H'?drawH(S,W,H,k):S.view==='A'?drawA(S,W,H,k):drawB(S,W,H,k);}
function onHit(d,S){
 if(d.i!=null&&S.fbar==='month'){S.cur=+d.i;if(!S.hl)S.hl='pay';return true;}
 if(d.m!=null){S.sel=+d.m;return S.fbar==='col';}
 return false;}
Story.start({id:'creditcard',lab:'FinanceLab',title:'Paying off a credit card',DEF,PARTS,STEPS,draw,fbar:fbarHtml,bindFbar,panel:panelHtml,bindPanel,onHit,onGhostEnd,
 settle:S=>{S.ph=-1;S.pp=0;},onStep:S=>{if(S.fbar==='drive')updateDrive();}});
})();
