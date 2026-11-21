/* Dollar-cost averaging. Story version (pilot, Nov 2026). Needs story/kit.js.
   The picture: every purchase is a rectangle. Height = price of one share, width = shares bought, area = dollars spent.
   The same dollars each month makes four rectangles of equal area. shares = dollars ÷ price.
   Average cost = total dollars ÷ total shares: the height at which the tops, levelled, hold the same area.
   Same model and class numbers as sims/dca.js ($200 a month at $200, $160, $125, $160). No fees or taxes. */
(function(){
'use strict';
const {$,$c,money,clamp,lerp,ease,lin,esc,el,n1,rect,text,line,tag,ticks}=Story.h,tw=Story.tw;
const MON=['Jan','Feb','Mar','Apr'],FULL=['January','February','March','April'],COL=['var(--t-ss)','var(--sam)','var(--t-med)','var(--t-fam)'];
const P0=[200,160,125,160];
const sh=v=>(Math.round(v*100)/100).toString();
const prices=s=>[s.p0,s.p1,s.p2,s.p3];
function model(s){const p=prices(s),w=p.map(x=>s.D/x),tot=w[0]+w[1]+w[2]+w[3];return {p,w,tot,inv:4*s.D,avgC:4*s.D/tot,avgP:(p[0]+p[1]+p[2]+p[3])/4};}
const M0=model({p0:200,p1:160,p2:125,p3:160,D:200});

const DEF={view:'H',fbar:null,hl:null,cur:null,sel:null,
 p0:200,p1:160,p2:125,p3:160,D:200,nshow:1,build:-1,wb:0.45,avgP:0,bal:0,h:185,lev:0,why:0,val:0,today:160,xmaxD:5.7,ymaxD:232,free:0};
function geo(W,H,k){const narrow=W<700,RP=narrow?0:262,L=72*k,T=(narrow?62:36)*k,Bm=56*k,PR=narrow?W-14:W-RP-14;return {narrow,RP,L,T,PR,pw:PR-L,ph:H-T-Bm,y0:H-Bm};}

/* ---------- view H: four prices ---------- */
function drawH(s,W,H,k){const gut=Story.gut,L=90*k,R=W-90*k,y0=H*0.8,T=H*0.2,Y=v=>y0-(y0-T)*v/230,bw=(R-L)/4;let o='';
 o+=text('$200 goes in on the first of every month',W/2,H*0.1,{a:'middle',s:18*k,w:800});
 P0.forEach((p,i)=>{const x=L+i*bw+bw*0.2,w=bw*0.6;o+=rect(x,Y(p),w,y0-Y(p),'var(--track)',{rx:5})+text('$'+p,x+w/2,Y(p)-10*k,{a:'middle',s:19*k,w:800})+text(FULL[i],x+w/2,y0+22*k,{a:'middle',s:14.5*k,c:'var(--muted)',w:600})+text('price of one share',x+w/2,(Y(p)+y0)/2+5*k,{a:'middle',s:12.5*k,c:'var(--muted)'});});
 o+=line(L,y0,R,y0,'var(--axis)',{w:1.5})+line(L,Y(161.25),R,Y(161.25),'var(--fg)',{w:2.5,dash:'7 5'})+tag('average of the four prices: $161.25',R,Y(161.25)-10*k,{a:'end',s:14*k,bw:2,bc:'var(--fg)'});
 if(gut){const yy=gut==='below'?Y(140):gut==='above'?Y(182):Y(161.25)+34*k;o+=tag('your pick: my cost per share lands '+(gut==='equal'?'right here':gut+' the line'),L,yy,{s:14*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2});}
 return o;}

/* ---------- view D: every purchase is a rectangle ---------- */
function layout(s){const m=model(s),n=Math.floor(s.nshow+1e-6),fr=s.nshow-n,items=[];let x=0;
 for(let i=0;i<4;i++){if(i>=n+(fr>0.001?1:0))break;let w=m.w[i],built=true;if(s.build===i){w=s.wb;built=Math.abs(w*m.p[i]-s.D)<0.5;}items.push({i,x,w,p:m.p[i],op:i<n?1:fr,built});x+=w;}
 return {m,items,total:x};}
function drawD(s,W,H,k){
 const G=geo(W,H,k),{narrow,RP,L,T,PR,pw,ph,y0}=G,X=v=>L+v/s.xmaxD*pw,Y=v=>y0-v/s.ymaxD*ph,LA=layout(s),m=LA.m,gh=Story.gh;let o='';
 ticks(s.ymaxD,4).forEach(v=>{if(v>0)o+=line(L,Y(v),PR,Y(v),'var(--grid)');o+=text($(v),L-8,Y(v)+4.5*k,{a:'end',s:12.5*k,c:'var(--muted)'});});
 if(!narrow)o+=text('price of one share',L-8-30*k,T-14*k,{s:12.5*k,c:'var(--muted)',w:600});
 for(let v=0,st=s.xmaxD>12?Math.ceil(s.xmaxD/8):1;v<=s.xmaxD;v+=st)o+=text(String(v),X(v),y0+18*k,{a:'middle',s:12.5*k,c:'var(--muted)'});
 o+=text('shares you own',(L+PR)/2,y0+38*k,{a:'middle',s:13*k,c:'var(--muted)',w:600});
 const full=LA.items.length===4&&s.build<0;
 /* ghost of the last picture, in the Change it step */
 if(gh){let d='';let gx=0;gh.d.w.forEach((w,i)=>{d+=(i?'L':'M')+n1(X(gx))+' '+n1(Y(gh.d.p[i]))+'L'+n1(X(gx+w))+' '+n1(Y(gh.d.p[i]));gx+=w;});d+='L'+n1(X(gx))+' '+n1(y0);o+='<path d="'+d+'" style="fill:none;stroke:var(--fg);stroke-width:2;stroke-dasharray:5 4;opacity:'+(0.7*gh.op).toFixed(2)+'"/>';}
 /* the rectangles */
 LA.items.forEach(it=>{const hgt=full?lerp(it.p,m.avgC,s.lev):it.p,x=X(it.x),w=X(it.x+it.w)-x,dim=(s.why>0.01&&it.i!==2&&it.i!==0)?lerp(1,0.35,s.why):1;
  o+=rect(x,Y(hgt),w,y0-Y(hgt),COL[it.i],{op:it.op*dim,stroke:'var(--stage)',sw:2});
  if(full&&s.lev>0.01&&s.lev<0.999)o+=rect(x,Y(it.p),w,y0-Y(it.p),'none',{stroke:COL[it.i],sw:1.5,dash:'4 4',op:0.8});
  if(w>50*k&&it.op>0.6){const cx=x+w/2,area=it.w*it.p;
   const hp=y0-Y(hgt),mid=(Y(hgt)+y0)/2,tall=hp>104*k,shT=sh(it.w)+(it.w===1?' share':' shares'),aT=s.build===it.i?$c(area):$(area);
   if(hp>52*k)o+=text(aT,cx,mid+(tall?2:-3)*k,{a:'middle',s:(w>90*k?19:15)*k,w:800,c:'#fff',op:dim})+text(tall||s.lev>=0.5||w<130*k?MON[it.i]:MON[it.i]+' · '+shT,cx,mid+(tall?22:16)*k,{a:'middle',s:13*k,w:700,c:'#fff',op:dim});
   else if(hp>24*k)o+=text(aT+(w>150*k?' · '+MON[it.i]:''),cx,mid+5*k,{a:'middle',s:14*k,w:800,c:'#fff',op:dim});
   if(s.lev<0.5&&s.free<0.5)o+=text('$'+Math.round(it.p)+' each',cx,Y(hgt)-9*k,{a:'middle',s:13.5*k,w:800,op:dim});
   if(s.lev<0.5&&tall)o+=text(shT,cx,y0-10*k,{a:'middle',s:13*k,w:700,c:'#fff',op:dim});}});
 o+=line(L,y0,PR,y0,'var(--axis)',{w:1.5});
 /* building a month: drag the right edge until the area is the month's dollars */
 if(s.build>0){const it=LA.items[s.build];if(it){const x1=X(it.x+it.w),yt=Y(it.p),tw_=X(it.x+s.D/it.p);
   if(!it.built){o+=line(tw_,yt,tw_,y0,'var(--fg)',{w:1.5,dash:'3 5',op:0})+rect(x1-7,(yt+y0)/2-30*k,14,60*k,'var(--fg)',{rx:7})+text('⇔',x1,(yt+y0)/2+5*k,{a:'middle',s:13*k,w:800,c:'var(--stage)'});
    o+=tag('$'+Math.round(it.p)+' × '+sh(it.w)+' shares = '+$c(it.w*it.p),x1+16,yt+24*k,{s:14*k,bw:2,bc:'var(--fg)'})+tag(it.w*it.p<s.D?'not $200 yet: drag right':'too much: drag left',x1+16,yt+54*k,{s:13*k,c:'var(--rj-ink)',bc:'var(--rj)'});}
   else o+=tag('$200 ÷ $'+Math.round(it.p)+' = '+sh(it.w)+' shares',x1+12,yt+24*k,{s:14*k,bw:2,bc:'var(--fg)'});
   o+='<rect class="drag" x="'+n1(X(it.x))+'" y="'+n1(T)+'" width="'+n1(PR-X(it.x))+'" height="'+n1(ph)+'" style="fill:transparent"/>';}}
 /* formula links: shares = dollars ÷ price, for one month */
 if(s.fbar==='shares'){const it=LA.items[s.cur==null?2:s.cur];if(it){const x=X(it.x),w=X(it.x+it.w)-x,yt=Y(it.p);
   if(s.hl==='dol'||!s.hl)o+=rect(x-2,yt-2,w+4,y0-yt+4,'none',{stroke:'var(--fg)',sw:3.5,rx:2});
   if(s.hl==='dol')o+=tag('dollars: the whole area, $200',x+w/2,yt-30*k,{a:'middle',s:13.5*k,bw:2,bc:'var(--fg)'});
   if(s.hl==='price'){o+=line(x-10,yt,x-10,y0,'var(--fg)',{w:3.5})+line(x-16,yt,x-4,yt,'var(--fg)',{w:3.5})+line(x-16,y0,x-4,y0,'var(--fg)',{w:3.5})+tag('price: the height, $'+Math.round(it.p),x+w/2,yt-30*k,{a:'middle',s:13.5*k,bw:2,bc:'var(--fg)'});}
   if(s.hl==='sh'){const by=y0-30*k;o+=line(x,by,x+w,by,'var(--stage)',{w:3.5})+line(x,by-6,x,by+6,'var(--stage)',{w:3.5})+line(x+w,by-6,x+w,by+6,'var(--stage)',{w:3.5})+tag('shares: the width, '+sh(it.w),x+w/2,yt-30*k,{a:'middle',s:13.5*k,bw:2,bc:'var(--fg)'});}}
  LA.items.forEach(it=>{o+='<rect class="hit" data-m="'+it.i+'" x="'+n1(X(it.x))+'" y="'+n1(Y(it.p))+'" width="'+n1(X(it.x+it.w)-X(it.x))+'" height="'+n1(y0-Y(it.p))+'" style="fill:transparent"/>';});}
 /* why: the wide cheap month against the narrow expensive one */
 if(s.why>0.01&&full){const a=LA.items[0],b=LA.items[2];o+=tag('narrow: '+sh(a.w)+(a.w===1?' share':' shares'),X(a.x+a.w/2),Y(a.p)+26*k,{a:'middle',s:13*k,bw:2,bc:'var(--fg)',op:s.why})+tag('wide: '+sh(b.w)+' shares, counts for more',X(b.x+b.w/2),Y(b.p)+26*k,{a:'middle',s:13*k,bw:2,bc:'var(--fg)',op:s.why});}
 /* average price: every month counted the same */
 if(s.avgP>0.01&&full){const y=Y(m.avgP);o+=line(L,y,PR,y,'var(--fg)',{w:2.5,dash:'7 5',op:s.avgP});if(s.free<0.5)o+=tag('average price: '+$c(m.avgP),PR-8-s.bal*(1-s.lev)*106*k,y-10*k,{a:'end',s:13.5*k,bw:2,bc:'var(--fg)',op:s.avgP});}
 /* the student's level line: above it must fill the gaps below it */
 if(s.bal>0.01&&full){const y=Y(s.h),xe=X(m.tot);let up=0,dn=0;
  LA.items.forEach(it=>{const x=X(it.x),w=X(it.x+it.w)-x;if(it.p>s.h){up+=(it.p-s.h)*it.w;o+=rect(x+1,Y(it.p)+1,w-2,y-Y(it.p)-1,'var(--fg)',{op:0.38*s.bal});}else if(it.p<s.h){dn+=(s.h-it.p)*it.w;o+=rect(x+1,y,w-2,Y(it.p)-y,'var(--card)',{stroke:'var(--fg)',sw:1.5,dash:'4 4',op:s.bal});}});
  const ok=Math.abs(up-dn)<0.6;
  o+=line(L,y,PR,y,'var(--rj)',{w:3.5,op:s.bal})+rect(PR-100*k,y-14*k,100*k,28*k,'var(--rj)',{rx:14*k,op:s.bal})+text('⇕ '+$c(s.h),PR-50*k,y+5*k,{a:'middle',s:13.5*k,w:800,c:'#fff',op:s.bal});
  const rx0=X(1.15);o+=tag('above the line: '+$c(up),rx0,T+14*k,{s:13.5*k,bw:2,bc:'var(--fg)',op:s.bal})+tag('gaps below it: '+$c(dn),rx0+200*k,T+14*k,{s:13.5*k,bw:1.5,bc:'var(--fg)',op:s.bal});
  if(ok)o+=tag('balanced',rx0+390*k,T+14*k,{s:13.5*k,c:'var(--good)',bc:'var(--good)',bw:2,op:s.bal});
  o+='<rect class="drag" x="'+n1(L)+'" y="'+n1(T)+'" width="'+n1(pw)+'" height="'+n1(ph)+'" style="fill:transparent;cursor:ns-resize"/>';}
 if(s.lev>0.6&&full){const y=Y(m.avgC);o+=tag('average cost: '+$c(m.avgC)+' a share',PR-8,y+30*k,{a:'end',s:13.5*k,c:'var(--rj-ink)',bc:'var(--rj)',bw:2,op:(s.lev-0.6)/0.4*(1-s.val)});}
 /* today's price: what the shares are worth now */
 if(s.val>0.01&&full){const y=Y(s.today),yc=Y(m.avgC),xe=X(m.tot),up=s.today>=m.avgC,d=(s.today-m.avgC)*m.tot;
  o+=rect(L,Math.min(y,yc),xe-L,Math.abs(y-yc),up?'var(--good)':'var(--bad)',{op:0.45*s.val});
  o+=line(L,y,PR,y,'var(--fg)',{w:3,op:s.val})+rect(PR-112*k,y-14*k,112*k,28*k,'var(--fg)',{rx:14*k,op:s.val})+text('⇕ today $'+Math.round(s.today),PR-56*k,y+5*k,{a:'middle',s:13.5*k,w:800,c:'var(--stage)',op:s.val});
  o+=tag(m.tot.toFixed(2)+' shares × $'+Math.round(s.today)+' = '+$c(s.today*m.tot)+' now',L+10,T+14*k,{s:13.5*k,bw:2,bc:'var(--fg)',op:s.val})+tag((up?'ahead by ':'behind by ')+$c(Math.abs(d)),L+10+330*k,T+14*k,{s:13.5*k,c:up?'var(--good)':'var(--bad)',bc:up?'var(--good)':'var(--bad)',bw:2,op:s.val});
  o+='<rect class="drag" x="'+n1(L)+'" y="'+n1(T)+'" width="'+n1(pw)+'" height="'+n1(ph)+'" style="fill:transparent;cursor:ns-resize"/>';}
 /* Change it: drag the top of any rectangle; its area stays the same, so its width changes */
 if(s.free>0.5&&full){const yc=Y(m.avgC);o+=line(L,yc,X(m.tot),yc,'var(--rj)',{w:3,dash:'2 5'})+line(PR-330*k,T-18*k,PR-300*k,T-18*k,'var(--fg)',{w:2.5,dash:'7 5'})+text('average price',PR-294*k,T-13.5*k,{s:13*k,w:700})+line(PR-170*k,T-18*k,PR-140*k,T-18*k,'var(--rj)',{w:3,dash:'2 5'})+text('average cost',PR-134*k,T-13.5*k,{s:13*k,w:700,c:'var(--rj-ink)'});
  LA.items.forEach(it=>{const cx=X(it.x+it.w/2),yt=Y(it.p);o+=rect(cx-36*k,yt-11*k,72*k,22*k,'var(--fg)',{rx:11*k})+text('⇕ $'+Math.round(it.p),cx,yt+4.5*k,{a:'middle',s:13*k,w:800,c:'var(--stage)'});});
  o+='<rect class="drag" x="'+n1(L)+'" y="'+n1(T)+'" width="'+n1(pw)+'" height="'+n1(ph)+'" style="fill:transparent;cursor:ns-resize"/>';}
 /* the account: the same picture as numbers */
 if(!narrow){const sx=W-RP+6,sr=W-14,sy=T-6*k,rows=LA.items.length,rh=Math.min(25*k,(H-sy-34*k)/(rows+5)),done=full&&(s.lev>0.6||s.free>0.5||s.val>0.01),sh2=rh*(rows+3)+(done?rh+12*k:0)+(s.avgP>0.5||s.free>0.5?rh:0)+18*k;
  o+=rect(sx,sy,sr-sx,sh2,'var(--card)',{rx:8,stroke:'var(--line)',sw:1.5})+text('YOUR PURCHASES',sx+12,sy+20*k,{s:11.5*k,w:700,c:'var(--muted)'});
  o+=text('price',sx+108*k,sy+20*k+rh*0.9,{a:'end',s:12*k,c:'var(--muted)',w:600})+text('shares',sx+170*k,sy+20*k+rh*0.9,{a:'end',s:12*k,c:'var(--muted)',w:600})+text('paid',sr-12,sy+20*k+rh*0.9,{a:'end',s:12*k,c:'var(--muted)',w:600});
  LA.items.forEach((it,j)=>{const y=sy+20*k+rh*(j+1.9),sel=s.fbar==='shares'&&(s.cur==null?2:s.cur)===it.i;if(sel)o+=rect(sx+5,y-rh*0.7,sr-sx-10,rh*0.96,'var(--card2)',{rx:5,stroke:'var(--fg)',sw:1.5});
   o+=rect(sx+12,y-10*k,11*k,11*k,COL[it.i],{rx:2})+text(MON[it.i],sx+12+16*k,y,{s:13.5*k,w:700})+text('$'+Math.round(it.p),sx+108*k,y,{a:'end',s:13.5*k,w:600})+text(it.built?sh(it.w):'?',sx+170*k,y,{a:'end',s:13.5*k,w:700})+text(it.built?$(s.D):$c(it.w*it.p),sr-12,y,{a:'end',s:13.5*k,w:600});});
  let y=sy+20*k+rh*(rows+2.1);o+=line(sx+12,y-rh*0.72,sr-12,y-rh*0.72,'var(--line)',{w:1.5});
  const ts=LA.items.reduce((a,it)=>a+(it.built?it.w:0),0),tp=LA.items.reduce((a,it)=>a+(it.built?s.D:0),0);
  o+=text('Total',sx+12,y,{s:14*k,w:800})+text(ts.toFixed(2),sx+170*k,y,{a:'end',s:14.5*k,w:800})+text($(tp),sr-12,y,{a:'end',s:14.5*k,w:800});
  if(s.avgP>0.5||s.free>0.5){y+=rh;o+=text('Average price',sx+12,y,{s:13.5*k,w:600})+text($c(m.avgP),sr-12,y,{a:'end',s:14*k,w:700});}
  if(done){y+=rh+4*k;o+=text('Average cost',sx+12,y,{s:14*k,w:800,c:'var(--rj-ink)'})+text($c(m.avgC),sr-12,y,{a:'end',s:15.5*k,w:800,c:'var(--rj-ink)'});}
 }else if(full)o+=text(sh(m.tot)+' shares for '+$(m.inv),L,24*k,{s:14.5*k,w:800})+(s.lev>0.6||s.free>0.5?text('average cost '+$c(m.avgC)+' · average price '+$c(m.avgP),L,44*k,{s:13*k,w:700,c:'var(--rj-ink)'}):'');
 return o;}

/* ---------- small pictures for the check ---------- */
function miniRects(list){const W=560,H=190,L=10,T=24,Bm=24,pw=W-20,ph=H-T-Bm,y0=H-Bm,tot=list.reduce((a,r)=>a+r[2],0),ym=Math.max.apply(null,list.map(r=>r[1]))*1.12,X=v=>L+v/tot*pw,Y=v=>y0-v/ym*ph;let o='',x=0;
 list.forEach((r,i)=>{const x0=X(x),w=X(x+r[2])-x0;o+=rect(x0,Y(r[1]),w,y0-Y(r[1]),COL[i],{stroke:'var(--stage)',sw:2})+text(r[0],x0+w/2,(Y(r[1])+y0)/2+7,{a:'middle',s:20,w:800,c:'#fff'})+text('$'+r[1]+' each',x0+w/2,Y(r[1])-7,{a:'middle',s:13,w:700});x+=r[2];});
 o+=line(L,y0,W-10,y0,'var(--axis)',{w:1.5})+text('shares →',W-10,y0+17,{a:'end',s:12.5,c:'var(--muted)'});
 return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Three purchases drawn as rectangles of equal area">'+o+'</svg>';}

/* ---------- steps ---------- */
const PARTS=['One purchase','The average','Change it','Tell it'];
const FOUR={view:'D',nshow:4};
const STEPS=[
 {part:-1,title:'Above, below or equal?',st:{view:'H'},choices:[['below','Below the average price'],['equal','Equal to it'],['above','Above it']],locked:'Locked in. Now make the first purchase.',
  t:'You put $200 into the same fund on the first of every month. The price keeps moving: $200, $160, $125, $160. The average of those four prices is $161.25. <b>Will your average cost per share land below that, equal to it, or above it?</b>',
  alt:'A share is one small piece of a company or a fund. You can buy part of a share. Go with your gut. There is no math yet.'},
 {part:0,title:'January',st:{view:'D',nshow:1},
  t:'January. One share costs $200 and you have $200, so you buy 1 share. <b>A purchase is a rectangle: price × shares = dollars.</b>',
  alt:'The height is the price of one share. The width is how many shares you bought. Multiply them and you get the money you spent, which is the area.'},
 {part:0,title:'February: you build it',st:{view:'D',nshow:2,build:1,wb:0.45},keep:['wb'],
  todo:(S,m)=>!!m.b1,move:'Drag the right edge of the green rectangle until it holds $200.',auto:async ok=>{await tw({wb:1.25},1600);Story.mem.b1=1;},
  t:'February. The price fell to $160. You still put in $200, so you get more than one share. <b>How wide is a $200 rectangle that is only $160 tall?</b>',
  t2:'$200 ÷ $160 = <b>1.25 shares</b>. A lower price made a wider rectangle.',
  alt:'Every month has the same area, $200, because you put in the same dollars. If the rectangle gets shorter, it has to get wider.'},
 {part:0,title:'March: build it again',st:{view:'D',nshow:3,build:2,wb:0.45},keep:['wb'],
  todo:(S,m)=>!!m.b2,move:'Drag the right edge of the purple rectangle until it holds $200.',auto:async ok=>{await tw({wb:1.6},1600);Story.mem.b2=1;},
  t:'March. The price fell again, to $125. Same $200.',
  t2:'$200 ÷ $125 = <b>1.6 shares</b>, the most yet. The cheapest month bought the most shares.',
  alt:'You did not decide to buy more in March. The same $200 simply reached further because each share cost less.'},
 {part:0,title:'April',st:FOUR,
  play:async ok=>{await tw({nshow:4},1400);},
  t:'April. The price is back to $160, so you get 1.25 shares again. Four rectangles with the same area and different shapes: <b>5.10 shares for $800</b>.',
  alt:'Add the widths: 1 + 1.25 + 1.6 + 1.25 = 5.10 shares. Add the areas: four times $200 is $800.'},
 {part:0,title:'Dollars ÷ price = shares',st:Object.assign({},FOUR,{fbar:'shares',cur:2}),
  t:'Every rectangle is the same formula. <b>Tap a part of the formula</b> to find it in the picture. Tap a rectangle to switch months.',
  alt:'Our words. Dollars is what you put in. Price is what one share costs that day. Dividing tells you how many shares fit.'},
 {part:1,title:'The average price',st:Object.assign({},FOUR,{avgP:1}),
  t:'Add the four prices and divide by 4: <b>$161.25</b>. This average counts every month the same, as if you had bought one share each time.',
  alt:'($200 + $160 + $125 + $160) ÷ 4 = $161.25. It is a fair summary of the prices. It is not what you paid per share, because you did not buy the same number each month.'},
 {part:1,title:'Find your average cost',st:Object.assign({},FOUR,{avgP:1,bal:1,h:185}),keep:['h'],
  todo:(S,m)=>!!m.bal,move:'Drag the red line until the part above it exactly fills the gaps below it.',auto:async ok=>{await tw({h:M0.avgC},2200);Story.mem.bal=1;},
  t:'Your average cost is the one price all 5.10 shares would have cost if every share cost the same. <b>Level the tops:</b> what sticks up above the line has to fill the gaps below it.',
  t2:'Balanced at <b>$156.86</b>. That is your average cost per share, and it is below the average price.',
  alt:'Think of the rectangles as blocks of wet sand. Push the tall ones down and the sand fills the low ones. The flat height you end at is your average cost.'},
 {part:1,title:'Level it',st:Object.assign({},FOUR,{avgP:1,lev:1,fbar:'avg'}),
  play:async ok=>{await tw({bal:0},300);if(!ok())return;await tw({lev:1},3200);},
  t:'Pour the tops into the gaps. One flat rectangle, 5.10 shares wide and $156.86 tall, holds the same $800.',
  t2:()=>{const g=Story.gut;return '<b>Your average cost is below the average price.</b>'+(g?(g==='below'?' Your gut was right.':' Your gut said '+(g==='equal'?'equal':'above')+'.'):'');},
  alt:'Total dollars ÷ total shares: $800 ÷ 5.10 = $156.86. The area did not change. Only its shape did.'},
 {part:1,title:'Why it comes out lower',st:Object.assign({},FOUR,{avgP:1,why:1}),
  t:'March is the widest rectangle and January the narrowest. Your $125 shares outnumber your $200 shares, so the low price counts for more. <b>The same dollars buy more shares when the price is low.</b>',
  alt:'The average price gives January and March one vote each. Your average cost gives March 1.6 votes and January 1, because that is how many shares each one bought.'},
 {part:1,title:'Not a promise',st:Object.assign({},FOUR,{lev:1,val:1,today:160}),
  todo:(S,m)=>m.vUp&&m.vDn,move:'Drag today\'s price above your average cost, then below it.',
  t:'A low average cost is not a profit. What your shares are worth depends on <b>today\'s price</b>. Move it and watch.',
  t2:'Above $156.86 you are ahead. Below it you are behind, however carefully you averaged.',
  alt:'At $160 today, 5.10 shares are worth $816 and you paid $800. If the price slid to $125, the same shares would be worth $637.50.'},
 {part:2,title:'Draw your own prices',st:Object.assign({},FOUR,{avgP:1,free:1,fbar:'drive'}),
  t:'You drive. <b>Drag the top of any rectangle to set that month\'s price.</b> Its area cannot change, so watch its width.',
  alt:'Each rectangle always holds the same dollars. Lower the price and it spreads out. Raise the price and it squeezes in.'},
 {part:3,title:'Check yourself',st:{view:'P',panel:'check'},
  t:'Three quick ones. Each asks you to connect a picture, a formula and a story.',
  alt:'Wrong answers get a hint that points at the picture. Try again as many times as you need.'},
 {part:3,title:'Tell the story',st:{view:'P',panel:'story'},
  t:'Math is finished when you can tell its story. Put the pictures in order, then write three sentences and copy your work into Canvas.',
  alt:'Use the picture words: share, price, dollars, wider, average, cost. If you get stuck, go back to "Level it" and describe what you see.'}
];

/* ---------- formula strip ---------- */
const tokB=(hl,val,name)=>'<button type="button" class="tok" data-hl="'+hl+'" aria-pressed="'+(Story.S.hl===hl)+'"><b>'+val+'</b><small>'+name+'</small></button>';
const tokS=(val,name,cls)=>'<span class="tok'+(cls?' '+cls:'')+'"><b>'+val+'</b><small>'+name+'</small></span>';
const OP=s=>'<span class="op">'+s+'</span>';
function fbarHtml(S){
 const m=S.fbar;if(!m)return null;const M=model(S);
 if(m==='shares'){const i=S.cur==null?2:S.cur;
  return '<div class="chain"><b>'+FULL[i]+'</b>: the same $200, at $'+Math.round(M.p[i])+' a share. <b>A shorter rectangle has to be wider.</b></div>'+
   '<div class="frow">'+tokB('dol','$200','dollars')+OP('÷')+tokB('price','$'+Math.round(M.p[i]),'price of one share')+OP('=')+tokB('sh',sh(M.w[i]),'shares')+
   '<span class="letters">In letters: <code>shares = dollars ÷ price</code></span></div>'+
   '<p class="hint"><b>Tap a part of the formula</b> to find it in the picture. <b>Tap a rectangle</b> to switch months.</p>';}
 if(m==='avg')return '<div class="frow">'+tokS($(M.inv),'all the dollars')+OP('÷')+tokS(M.tot.toFixed(2),'all the shares')+OP('=')+tokS($c(M.avgC),'average cost of a share','diff')+
   '<span class="letters">In letters: <code>average cost = dollars ÷ shares</code></span></div>'+
   '<p class="hint">The area is all the dollars. The width is all the shares. The flat height is what each share cost you, on average.</p>';
 if(m==='drive')return '<div class="drive" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)">'+
   '<div class="ctl"><label for="c-d">You put in each month <output id="o-d"></output></label><input type="range" id="c-d" min="50" max="400" step="25" value="'+S.D+'"><small>The area of every rectangle.</small></div>'+
   '<div class="ctl"><label>Or start from a price story</label><div class="seg" id="c-path"><button type="button" data-path="200,160,125,160">The class example</button><button type="button" data-path="100,110,120,130">Steady rise</button><button type="button" data-path="160,140,120,100">Steady fall</button><button type="button" data-path="100,60,90,120">Drop, then recover</button></div></div></div>'+
   '<p class="narr" id="narr" aria-live="polite"></p><div class="quests" id="quests"></div>';
 return null;}
const QUESTS=[
 {id:'eq',q:'Make all four prices the same.',ask:'Where will your average cost land?',a:'Exactly on the average price. With no ups and downs, every rectangle is the same shape and nothing pulls the cost down.'},
 {id:'gap',q:'Open a gap of $15 or more.',ask:'What kind of prices do that?',a:'Big swings. The further the prices spread, the more the cheap months outweigh the expensive ones.'},
 {id:'rise',q:'Make the price rise every month.',ask:'Is your cost still below the average price?',a:'Yes, always. But every later share cost more than the first month\'s price, so putting all the money in on day one would have bought more shares.'},
 {id:'loss',q:'End below your average cost.',ask:'Are you ahead or behind?',a:'Behind. If the last price is under your average cost, your shares are worth less than you paid. Averaging lowers your cost. It cannot promise a gain.'}
];
const qdone={};
function updateDrive(){const S=Story.S;if(S.fbar!=='drive'||!el('o-d'))return;const M=model(S),p=M.p,worth=M.tot*p[3];
 el('o-d').textContent='$'+S.D;
 el('narr').innerHTML=M.tot.toFixed(2)+' shares for '+$(M.inv)+'. Average cost <b>'+$c(M.avgC)+'</b>, average price '+$c(M.avgP)+': a gap of '+$c(M.avgP-M.avgC)+'. At April\'s price your shares are worth '+$c(worth)+', so you are <b>'+(worth>=M.inv?'ahead':'behind')+' by '+$c(Math.abs(worth-M.inv))+'</b>.';
 if(Math.max.apply(null,p)-Math.min.apply(null,p)<0.5)qdone.eq=1;if(M.avgP-M.avgC>=15)qdone.gap=1;if(p[0]<p[1]&&p[1]<p[2]&&p[2]<p[3])qdone.rise=1;if(p[3]<M.avgC-0.005)qdone.loss=1;
 el('quests').innerHTML=QUESTS.map(q=>'<div class="quest'+(qdone[q.id]?' done':'')+'"><span class="mark">'+(qdone[q.id]?'done':'try')+'</span><b>'+q.q+'</b><p>'+(qdone[q.id]?q.a:q.ask)+'</p></div>').join('');}
const fitX=M=>Math.max(4,M.tot*1.12);
function snap(){const S=Story.S,M=model(S);return {p:M.p.slice(),w:M.w.slice()};}
function refit(ms){const S=Story.S,M=model(S),g=Story.gh?Story.gh.d:null,gt=g?g.w[0]+g.w[1]+g.w[2]+g.w[3]:0;Story.dropTweens();Story.tw({xmaxD:Math.max(fitX(M),gt*1.12)},ms||380);}
function onGhostEnd(S){if(S.fbar==='drive'){const M=model(S);Story.tw({xmaxD:fitX(M)},600);}}
function bindFbar(box,S){if(S.fbar!=='drive')return;
 el('c-d').addEventListener('input',()=>{const S=Story.S;Story.ghost(snap);S.D=+el('c-d').value;refit();updateDrive();});
 el('c-path').addEventListener('click',e=>{const b=e.target.closest('[data-path]');if(!b)return;const S=Story.S,v=b.dataset.path.split(',').map(Number);Story.ghost(snap);S.p0=v[0];S.p1=v[1];S.p2=v[2];S.p3=v[3];refit();updateDrive();Story.redraw();});
 updateDrive();}

/* ---------- panels ---------- */
const ans={q1:null,q2:null,q3:null},tries={q1:0,q2:0,q3:0},story={},q2v={};
function panelHtml(p){
 if(p==='check')return '<div class="qcard" id="q1"><h2>1. Which purchase bought the most shares?</h2><p>Three months, $120 each. Every rectangle has the same area.</p>'+
   '<div class="minibox" style="max-width:720px">'+miniRects([['A',60,2],['B',30,4],['C',40,3]])+'</div>'+
   '<div class="opts" data-q="q1" style="margin-top:10px"><button type="button" data-v="A">Month A</button><button type="button" data-v="B">Month B</button><button type="button" data-v="C">Month C</button></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q2"><h2>2. Turn a story into a formula</h2><p>Kai puts $120 into a fund on a day when one share costs $30. Build the purchase.</p>'+
   '<div class="build"><span class="tok" id="t-dol"><b><span class="unit">$</span><input id="i-dol" inputmode="decimal" aria-label="dollars" autocomplete="off"></b><small>dollars</small></span>'+OP('÷')+'<span class="tok" id="t-pr"><b><span class="unit">$</span><input id="i-pr" inputmode="decimal" aria-label="price of one share" autocomplete="off"></b><small>price of one share</small></span>'+
   '<button type="button" class="btn" id="q2check">Check my formula</button></div><div class="fbslot"></div></div>'+
  '<div class="qcard" id="q3"><h2>3. Find the average cost</h2><p>You put in $100 when the price is $100, and $100 more when the price is $50. What is your average cost per share?</p>'+
   '<div class="opts" data-q="q3"><button type="button" data-v="75">$75.00</button><button type="button" data-v="67">$66.67</button><button type="button" data-v="50">$50.00</button></div><div class="fbslot"></div></div>';
 return Story.orderCard([{view:'D',nshow:1},{view:'D',nshow:2},{view:'D',nshow:4},{view:'D',nshow:4,avgP:1,bal:1,h:185},{view:'D',nshow:4,avgP:1,lev:1}])+
  '<div class="qcard"><h2>Tell the story of the four months</h2><p>Write it for a friend who has not seen the picture.</p><div class="story">'+
   '<div><label for="s1">Beginning<small>What stayed the same every month, and what changed?</small></label><textarea id="s1" placeholder="Every month I put in… The price…"></textarea></div>'+
   '<div><label for="s2">Middle<small>What does a lower price do to the rectangle?</small></label><textarea id="s2" placeholder="When the price fell, the rectangle…"></textarea></div>'+
   '<div><label for="s3">End<small>Why is the average cost below the average price, and what can it not promise?</small></label><textarea id="s3" placeholder="My average cost was… because… But…"></textarea></div></div>'+
   Story.wordsRow(['share','price','dollars','wider','average','cost'])+
   '<div class="copyrow"><button type="button" class="btn primary" id="copyb">Copy for Canvas</button><span id="copymsg">Copies your gut pick, your checks and your story.</span></div><textarea id="copyfallback" hidden readonly aria-label="Your work, to copy"></textarea></div>'+
  '<div class="qcard"><h2>Use it</h2><div class="uses">'+
   '<div class="use"><b>Do:</b> when a job offers a 401(k) or 403(b), enroll and choose a percent of each paycheck to invest. <b>Why:</b> the plan buys the same dollar amount every pay period, so you automatically get more shares when prices are low. Most workers dollar-cost average this way without thinking about it.</div>'+
   '<div class="use"><b>Do:</b> with an adult, set up an automatic investment of a fixed dollar amount each month instead of trying to pick the cheap month. <b>Why:</b> brokerage apps can buy fractional shares, so any dollar amount works, and nobody knows ahead of time which month will be cheap.</div>'+
   '<div class="use"><b>Do:</b> find “average cost” or “cost basis” on a brokerage statement and compare it with today’s price. <b>Why:</b> your cost basis is the number used to figure your gain or loss, and the tax, when you sell.</div></div></div>'+
  Story.voteCard()+
  '<details class="about"><summary>About this model</summary><p><b>Model.</b> The same dollars at four prices; shares = dollars ÷ price; average cost = total dollars ÷ total shares. No fees or taxes. The prices are made-up examples; the first set matches the class Dollar-Cost Averaging slides ($200, $160, $125, $160).</p><p><b>What this number hides.</b> A lower average cost does not mean a profit: that depends on the price when you sell. Studies of past markets have found that a lump sum invested at once usually ended with more than spreading the same money out, because markets rose more often than they fell; dollar-cost averaging trades some of that for less regret and a steady habit. For most workers, dollar-cost averaging is simply how saving happens: a little from every paycheck.</p><p><b>This is a simplified model, not financial advice.</b></p></details>';
}
const FB={
 q1:{B:[1,'Yes. B is the widest rectangle: 4 shares. Its price was the lowest, so the same $120 reached the furthest.'],A:[0,'A is the tallest rectangle, which means the highest price. Shares are the width. Try again.'],C:[0,'C is wider than A, but there is a wider one. Shares are the width. Try again.']},
 q3:{67:[1,'Yes. $100 bought 1 share, then 2 shares: 3 shares for $200 is $66.67 each. The $50 month bought twice as many, so it counts twice.'],75:[0,'That is the average of the two prices. But you bought twice as many shares at $50. Count the shares, then divide. Try again.'],50:[0,'That was the lower price. You also bought a share at $100. Count all the shares and all the dollars. Try again.']}
};
function setFb(card,ok,msg){card.querySelector('.fbslot').innerHTML='<p class="fb '+(ok?'ok':'no')+'" role="status">'+msg+'</p>';}
function pickOpt(q,v,silent){const card=el(q),f=FB[q][v];if(!f)return;if(!silent&&ans[q]!=='ok')tries[q]++;
 card.querySelectorAll('.opts button').forEach(b=>{b.classList.remove('right','wrong');if(b.dataset.v===String(v))b.classList.add(f[0]?'right':'wrong');});
 setFb(card,f[0],f[1]);if(f[0])ans[q]='ok';ans[q+'v']=v;}
function checkQ2(silent){const card=el('q2'),num=id=>parseFloat(String(el(id).value).replace(/[$,%\s]/g,''));
 const d=num('i-dol'),pr=num('i-pr');q2v.dol=el('i-dol').value;q2v.pr=el('i-pr').value;
 if(isNaN(d)||isNaN(pr)){if(!silent)setFb(card,false,'Fill in both boxes: the dollars and the price.');return;}
 if(!silent&&ans.q2!=='ok')tries.q2++;const okD=Math.abs(d-120)<0.5,okP=Math.abs(pr-30)<0.5;
 el('t-dol').className='tok '+(okD?'ok':'bad');el('t-pr').className='tok '+(okP?'ok':'bad');
 if(okD&&okP){ans.q2='ok';setFb(card,true,'Yes. $120 ÷ $30 = 4 shares: a rectangle $30 tall and 4 wide.');}
 else setFb(card,false,(Math.abs(d-30)<0.5&&Math.abs(pr-120)<0.5?'Those are the right numbers in the wrong boxes. Dollars is what Kai put in. ':(!okD?'Dollars is what Kai put in: $120. ':'')+(!okP?'Price is what one share costs: $30. ':''))+'Fix the red box and check again.');}
function bindPanel(panel,p){
 if(p==='check'){
  panel.querySelectorAll('.opts[data-q]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('button');if(b)pickOpt(g.dataset.q,b.dataset.v);}));
  el('q2check').addEventListener('click',()=>checkQ2(false));
  ['i-dol','i-pr'].forEach(id=>el(id).addEventListener('keydown',e=>{if(e.key==='Enter')checkQ2(false);}));
  if(ans.q1v)pickOpt('q1',ans.q1v,true);if(ans.q3v)pickOpt('q3',ans.q3v,true);
  if(q2v.dol!=null){el('i-dol').value=q2v.dol;el('i-pr').value=q2v.pr;checkQ2(true);}
  return;}
 ['s1','s2','s3'].forEach(id=>{el(id).value=story[id]||'';el(id).addEventListener('input',e=>{story[id]=e.target.value;});});
 el('copyb').addEventListener('click',()=>Story.copy(workText(),el('copymsg'),el('copyfallback')));
}
const gutName={below:'below the average price',equal:'equal to it',above:'above it'};
function workText(){const mark=q=>ans[q]==='ok'?'correct'+(tries[q]>1?' (try '+tries[q]+')':''):'not answered yet',g=Story.gut;
 return ['Dollar-cost averaging (Raider FinanceLab)','My gut pick: '+(g?gutName[g]:'none'),'Check 1, most shares: '+mark('q1'),'Check 2, Kai\'s purchase: '+mark('q2')+(ans.q2==='ok'?'  $120 / $30 = 4 shares':''),'Check 3, average cost: '+mark('q3'),'Picture challenges done: '+Object.keys(qdone).length+' of 4',Story.orderLine(),'','My story','Beginning: '+(story.s1||''),'Middle: '+(story.s2||''),'End: '+(story.s3||'')].join('\n');}

function draw(S,W,H,k){return S.view==='H'?drawH(S,W,H,k):drawD(S,W,H,k);}
function onHit(d,S){if(d.m!=null&&S.fbar==='shares'){S.cur=+d.m;if(!S.hl)S.hl='sh';return true;}return false;}
function onDrag(p,S,W,H,k,mem,phase){if(S.view!=='D')return false;const G=geo(W,H,k),xv=(p.x-G.L)/G.pw*S.xmaxD,yv=(G.y0-p.y)/G.ph*S.ymaxD,M=model(S);
 if(S.build>0){const i=S.build;if(mem['b'+i])return false;let x0=0;for(let j=0;j<i;j++)x0+=M.w[j];let w=clamp(xv-x0,0.15,2.4);const t=S.D/M.p[i];if(Math.abs(w-t)<0.035){w=t;mem['b'+i]=1;}S.wb=w;return false;}
 if(S.bal>0.5){if(mem.bal)return false;let h=clamp(Math.round(yv*2)/2,110,215);if(Math.abs(h-M.avgC)<0.9){h=M.avgC;mem.bal=1;}S.h=h;return false;}
 if(S.val>0.5){S.today=clamp(Math.round(yv),90,220);if(S.today>M.avgC+3)mem.vUp=1;if(S.today<M.avgC-3)mem.vDn=1;return false;}
 if(S.free>0.5){if(phase==='start'){let x0=0;mem.di=-1;for(let j=0;j<4;j++){if(xv>=x0&&xv<x0+M.w[j])mem.di=j;x0+=M.w[j];}if(mem.di>=0)Story.ghost(snap);}
  if(mem.di>=0){S['p'+mem.di]=clamp(Math.round(yv/5)*5,40,220);const M2=model(S);if(M2.tot*1.04>S.xmaxD)S.xmaxD=M2.tot*1.12;updateDrive();}return false;}
 return false;}
function onStep(S){const m=Story.mem;if(S.build>0&&m['b'+S.build])S.wb=S.D/prices(S)[S.build];if(S.bal>0.5&&m.bal)S.h=model(S).avgC;if(S.fbar==='drive')updateDrive();Story.redraw();}
Story.start({id:'dca',lab:'FinanceLab',title:'Dollar-cost averaging',DEF,PARTS,STEPS,draw,fbar:fbarHtml,bindFbar,panel:panelHtml,bindPanel,onHit,onDrag,onGhostEnd,onStep});
})();
