(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* Credit utilization = total card balances ÷ total card limits. FICO weighs five categories (myFICO): payment history 35%,
   amounts owed 30%, length of credit history 15%, new credit 10%, credit mix 10%. FICO does not publish its formula,
   so this tool computes utilization and shows which categories each move touches; it does not compute a score. */
const MOVES={pay:'Pay down the student card',open:'Open a new card',close:'Close the old card you never use'};
const b1=sim=>Math.min(sim.p.b1,sim.p.L1);
const util=(b,L)=>L>0?100*b/L:0;
const now=sim=>util(b1(sim),sim.p.L1+sim.p.L2);
function after(sim,m){if(m==='pay')return util(Math.max(0,b1(sim)-sim.p.pay),sim.p.L1+sim.p.L2);if(m==='open')return util(b1(sim),sim.p.L1+sim.p.L2+sim.p.newL);return util(b1(sim),sim.p.L1);}
const best=sim=>Object.keys(MOVES).reduce((a,m)=>after(sim,m)<after(sim,a)-1e-9?m:a,'pay');
const TOUCH={pay:{owed:1},open:{owed:1,newc:1,len:1},close:{owed:1,len:1}};
const FAC=[['pay','Payment history',35,'s3'],['owed','Amounts owed',30,'s2'],['len','Length of history',15,'s5'],['newc','New credit',10,'s4'],['mix','Credit mix',10,'s6']];
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const p1=v=>(Math.round(v*10)/10).toFixed(1)+'%';
const to10=sim=>Math.max(0,b1(sim)-0.10*(sim.p.L1+sim.p.L2));
const calcAns=sim=>atLeast('ap')?F.r2(to10(sim)):Math.round(now(sim)*100)/100;

const SIM={
 id:'creditscore',hash:'creditscore',apUnit:5,order:3,tab:'What helps a credit score?',kind:'Simulation',
 skills:{bio:'Percent of a whole: balance ÷ limit · Personal Finance (Credit scores)',honors:'Percents and weighted parts of a whole · Personal Finance (Credit reports and scores)',ap:'Solving a percent inequality: b ÷ L ≤ 10% · Personal Finance (Credit scores)'},
 card:'Maya’s student card is nearly maxed out. Pay it down, open a new card or close an old one: guess which move lowers her credit use most, then compute it.',
 title:'What helps a credit score? Credit utilization',
 lede:{bio:'Your credit score is a number lenders use to guess how likely you are to pay on time. One big part is how much of your available credit you are using: total balances ÷ total credit limits. That share is called credit utilization, and lower is better.',
  honors:'FICO, the most-used score, says it weighs five categories: payment history (35%), amounts owed (30%), length of credit history (15%), new credit (10%) and credit mix (10%). Each move below touches different categories.',
  ap:'To bring utilization under a target t, you need total balance ≤ t × total limit: solve b − x ≤ tL for the payment x.'},
 scale:'Maya, 20, has two cards and pays on time. FICO does not publish its formula, so this tool computes utilization and shows which categories a move touches; it does not compute a score.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Maya’s cards',
 controls:[
  {id:'move',label:'Your gut: which move lowers Maya’s credit utilization most?',type:'seg',def:'close',options:Object.keys(MOVES).map(k=>({v:k,l:MOVES[k]}))},
  {id:'L1',label:'Student card: credit limit',type:'range',min:300,max:2000,step:50,def:500,unit:' dollars',noGut:true,onChange:clear},
  {id:'b1',label:'Student card: balance',type:'range',min:0,max:2000,step:10,def:450,unit:' dollars',noGut:true,onChange:clear},
  {id:'L2',label:'Old card (balance $0): credit limit',type:'range',min:500,max:5000,step:100,def:1500,unit:' dollars',noGut:true,onChange:clear},
  {id:'pay',label:'How much Maya could pay down',type:'range',min:50,max:600,step:10,def:300,unit:' dollars',noGut:true,onChange:clear},
  {id:'newL',label:'Limit on a new card',type:'range',min:300,max:3000,step:100,def:1000,unit:' dollars',noGut:true,onChange:clear},
  {id:'reveal',label:'Show the results now',type:'toggle',def:false,help:'Normally they appear once you lock in your gut answer.'}
 ],
 actions:[{id:'max',label:'Max out the student card',run(sim){BioLab.setValues(sim,{b1:sim.p.L1,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'bal',label:'Total balance',unit:'dollars',d:0,min:0,max:null,get:b1},
  {id:'lim',label:'Total credit limit',unit:'dollars',d:0,min:0,max:null,get:sim=>sim.p.L1+sim.p.L2},
  {id:'now',label:'Credit utilization now',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?now(sim):null},
  {id:'pay',label:'After paying down',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?after(sim,'pay'):null},
  {id:'open',label:'After opening a new card',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?after(sim,'open'):null},
  {id:'close',label:'After closing the old card',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?after(sim,'close'):null},
  {id:'card1',label:'Student card alone: balance ÷ limit',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?util(b1(sim),sim.p.L1):null},
  {id:'to10',label:'Payment needed to get under 10%',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?to10(sim):null}
 ],
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const ttl='Maya’s credit use: '+$(b1(sim))+' of '+$(sim.p.L1+sim.p.L2)+(sh&&stg>=2?' = '+p1(now(sim)):'');txt(ctx,ttl,24,32*Math.min(k,1.2),{s:16*fs,w:700});
  if(stg===2){ctx.font='700 '+(16*fs)+'px '+FONT;ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(16,32*Math.min(k,1.2)-20*fs,ctx.measureText(ttl).width+16,28*fs);}
  const card=(y,name,b,L,col,note)=>{const x=24,w=big?752:470,h=(big?62:56)*Math.min(k,1.2);ctx.fillStyle=PAL['card'];rr(ctx,x,y,w,h,10);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,x,y,w,h,10);ctx.stroke();
   txt(ctx,name,x+14,y+22*fs,{s:14*fs,w:700});txt(ctx,$(b)+' of '+$(L)+(note?' · '+note:''),x+w-14,y+22*fs,{s:13*fs,a:'right',c:PAL['cv-soft']});
   const bx=x+14,bw=w-28,by=y+h-20*fs;ctx.fillStyle=PAL['line'];rr(ctx,bx,by,bw,10*fs,5);ctx.fill();ctx.fillStyle=PAL[col];rr(ctx,bx,by,Math.max(2,bw*Math.min(1,b/L)),10*fs,5);ctx.fill();};
  const y0=50*Math.min(k,1.2),gap=(big?74:66)*Math.min(k,1.2);
  card(y0,'Student card',b1(sim),sim.p.L1,util(b1(sim),sim.p.L1)>50?'s1':'s4','opened 1 year ago');
  card(y0+gap,'Old card',0,sim.p.L2,'s3','opened 3 years ago, never used');
  /* the three moves */
  if(stg>=3){
  const ty=y0+2*gap+(big?30:26)*fs;txt(ctx,'Credit utilization after each move',24,ty,{s:14*fs,w:700});
  const ms=Object.keys(MOVES).slice(0,stg===3?1:stg===4?2:3),hotM=stg===3?'pay':stg===4?'open':stg===5?'close':null,bw=big?752:470,mx=Math.max(100,...ms.map(m=>after(sim,m)));
  ms.forEach((m,i)=>{const y=ty+(18+i*(big?36:32))*fs,v=after(sim,m),isB=sh&&(stg>=99||stg>=5)&&m===best(sim),G=sim.gutS&&sim.gutS.g;
   txt(ctx,MOVES[m],24,y+12*fs,{s:12.5*fs,w:isB||m===hotM?700:400});if(m===hotM){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(16,y-6*fs,(big?752:470)+16,26*fs);}const bx=big?300:250,ww=(24+bw-bx)-60;
   ctx.fillStyle=PAL['line'];rr(ctx,bx,y,ww,14*fs,4);ctx.fill();
   if(sh){ctx.fillStyle=PAL[v>30?'s1':v>10?'s4':'s3'];rr(ctx,bx,y,Math.max(2,ww*v/mx),14*fs,4);ctx.fill();txt(ctx,p1(v),bx+ww+6,y+12*fs,{s:12.5*fs,w:700});}
   else txt(ctx,'?',bx+ww+6,y+12*fs,{s:12.5*fs,w:700,c:PAL['cv-soft']});
   if(G&&G.move===m&&!big)txt(ctx,'◀ your gut',bx+ww+52,y+12*fs,{s:12,w:700,c:PAL['s4']});});
  }
  /* FICO's five categories, on the right */
  if(!big&&stg>=6){const cx=650,cy=150,R=78;let a=-Math.PI/2;const tm=TOUCH[stg===6?'pay':(sim.gutS&&sim.gutS.g&&sim.gutS.g.move)||sim.p.move]||{};
   FAC.forEach(([id,name,w,col])=>{const a2=a+2*Math.PI*w/100;ctx.fillStyle=PAL[col];ctx.globalAlpha=atLeast('honors')&&!tm[id]?0.3:0.9;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R,a,a2);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    const mid=(a+a2)/2;txt(ctx,w+'%',cx+Math.cos(mid)*R*0.62,cy+Math.sin(mid)*R*0.62+4,{s:12,w:700,c:'#fff',a:'center'});a=a2;});
   FAC.forEach(([id,name,w,col],i)=>{ctx.fillStyle=PAL[col];rr(ctx,560,250+i*18,10,10,2);ctx.fill();txt(ctx,name,576,259+i*18,{s:12,w:atLeast('honors')&&tm[id]?700:400});});
   txt(ctx,'What FICO weighs',cx,58,{s:13,w:700,a:'center'});}},
 narrate(sim){if(!shown(sim))return `Maya owes ${$(b1(sim))} on a ${$(sim.p.L1)} student card and $0 on an old ${$(sim.p.L2)} card. <b>Which move lowers the share of her credit she is using the most?</b>`;
  const m=best(sim);return `Right now Maya uses ${p1(now(sim))} of her credit. Paying down gives ${p1(after(sim,'pay'))}, a new card ${p1(after(sim,'open'))}, and closing the old card <b>${p1(after(sim,'close'))}</b>, because closing it removes ${$(sim.p.L2)} of limit. The lowest: <b>${MOVES[m].toLowerCase()}</b>.`;},
 gut:{better:'lower',controls:['move'],
  ask:{bio:'Pick one move here: which one makes Maya’s credit utilization (total balance ÷ total limit) the lowest? Then lock it in.'},
  lock(sim){const m=sim.p.move;return {v:after(sim,m),move:m,label:MOVES[m]};},
  solve(sim){const m=best(sim);sim.p.move=m;return {v:after(sim,m),move:m,label:MOVES[m]};},
  hint:{bio:'Lock in your gut. Then you will work out Maya’s utilization right now.'},
  calc:{get unit(){return atLeast('ap')?'$':'%';},d:2,tol:a=>atLeast('ap')?0.5:0.1,
   prompt:{bio:sim=>`Maya owes <b>${$(b1(sim))}</b> in all. Her two cards have limits of ${$(sim.p.L1)} and ${$(sim.p.L2)}. What percent of her total credit is she using?`,
    ap:sim=>`Maya owes ${$(b1(sim))} on ${$(sim.p.L1+sim.p.L2)} of total credit. How much must she pay so her utilization is at most 10%?`},
   answer:calcAns,
   hint:{bio:'Add the two limits, divide the balance by that total, then multiply by 100.',ap:'Solve balance − x ≤ 0.10 × total limit.'},
   steps(sim){const L=sim.p.L1+sim.p.L2;if(atLeast('ap'))return [`Target balance: 0.10 × ${$(L)} = ${$2(0.1*L)}.`,`Payment: ${$(b1(sim))} − ${$2(0.1*L)} = <b>${$2(to10(sim))}</b>.`];
    return [`Total limit: ${$(sim.p.L1)} + ${$(sim.p.L2)} = ${$(L)}.`,`${$(b1(sim))} ÷ ${$(L)} = ${(b1(sim)/L).toFixed(4)}, which is <b>${now(sim).toFixed(2)}%</b>.`];}},
  formula(sim){const L=sim.p.L1+sim.p.L2;return `Now: ${$(b1(sim))} ÷ ${$(L)} = ${p1(now(sim))}<br>Pay ${$(sim.p.pay)}: ${$(Math.max(0,b1(sim)-sim.p.pay))} ÷ ${$(L)} = ${p1(after(sim,'pay'))} · New card: ${$(b1(sim))} ÷ ${$(L+sim.p.newL)} = ${p1(after(sim,'open'))} · Close old: ${$(b1(sim))} ÷ ${$(sim.p.L1)} = ${p1(after(sim,'close'))}`;},
  how:{bio:'The math divides total balance by total limit for each move. Paying lowers the top of the fraction; a new card raises the bottom; closing a card shrinks the bottom.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out utilization yourself, the same ratio on your credit report.':'';
   const real=` Your move gives ${p1(after(sim,g0.move))}; the best gives ${p1(after(sim,m.move))}.`+(atLeast('honors')?(m.move==='open'?' A new card also adds a hard inquiry and lowers the average age of her accounts, which FICO counts too.':g0.move==='open'?' A new card also adds a hard inquiry and lowers the average age of her accounts.':''):'');
   if(g0.move===m.move)return `Your gut was right: ${m.label.toLowerCase()}.`+real+self;
   return `Your gut picked <b>${g0.label.toLowerCase()}</b>; the math says <b>${m.label.toLowerCase()}</b>. ${g0.move==='close'?'Closing an unused card feels tidy, but it removes credit you weren’t using, so the same balance becomes a bigger share.':''}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.L1=R([300,500,800,1000]);sim.p.b1=Math.round(sim.p.L1*R([0.5,0.7,0.9,1])/10)*10;sim.p.L2=R([500,1000,1500,3000]);sim.p.pay=R([100,200,300,400]);sim.p.newL=R([500,1000,2000]);sim.p.move='close';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You owe $360 on cards with $1,200 of total credit. What is your credit utilization, as a percent?',answer:30,tol:0.05,unit:'%',d:1,hint:'$360 ÷ $1,200.',explain:'$360 ÷ $1,200 = 0.30, so 30%.'},
  {lvl:'bio',instant:true,q:'According to FICO, which category counts the most?',choices:['Credit mix','Payment history: paying on time','How many cards you have'],correct:1,explain:'FICO lists payment history at 35%, the biggest part. One payment 30 or more days late can hurt for years.'},
  {lvl:'bio',instant:true,q:'Maya closes her old card that she never used. What happens to her utilization?',choices:['It goes down','It goes up: the same balance over less credit','It stays the same'],correct:1,explain:'Her $450 balance stays, but her total limit falls from $2,000 to $500, so utilization jumps from 22.5% to 90%.'},
  {lvl:'honors',kind:'num',q:'Maya pays $300 and owes $150 on $2,000 of credit. Her student card alone has a $500 limit. What is that card’s utilization?',answer:30,tol:0.05,unit:'%',d:1,hint:'$150 ÷ $500.',explain:'$150 ÷ $500 = 30%. Scores look at each card as well as the total.'},
  {lvl:'honors',instant:true,q:'Opening a new card lowers utilization. What else does it do to the FICO categories?',choices:['Nothing else','Adds a hard inquiry (new credit) and lowers the average age of accounts (length of history)','Raises payment history'],correct:1,explain:'A new account usually means a hard inquiry and a younger average account age. FICO counts both, so its effect on a score can go either way for a while.'},
  {lvl:'ap',kind:'num',q:'You owe $1,350 on $6,000 of total credit. How much must you pay to get utilization to 10% or less?',answer:750,tol:0.5,unit:'$',d:0,hint:'Target balance: 0.10 × $6,000.',explain:'Target: $600. Pay $1,350 − $600 = $750.'},
  {lvl:'ap',instant:true,q:'People say “keep utilization under 30%.” What does FICO itself say?',choices:['30% is a hard cutoff','Lower utilization is generally better; 30% is a popular rule of thumb, not a FICO cutoff','Utilization does not matter'],correct:1,explain:'FICO says people with the highest scores tend to use only a small share of their credit. The 30% line is a common guideline, not a published rule.'}
 ],
 tour:[
  {title:'Maya’s cards',text:'Maya, 20, owes $450 on her $500 student card. Her old $1,500 card, opened three years ago, has a $0 balance.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{L1:500,b1:450,L2:1500,pay:300,newL:1000,reveal:true});}},
  {title:'Her utilization',text:'$450 ÷ ($500 + $1,500) = $450 ÷ $2,000 = 22.5% of her credit in use.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Pay down $300',text:'$150 ÷ $2,000 = 7.5%. The top of the fraction shrinks.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Open a new card',text:'$450 ÷ $3,000 = 15%. The bottom grows, but she adds a hard inquiry and a brand-new account.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Close the old card',text:'$450 ÷ $500 = 90%. Closing the unused card takes away $1,500 of credit, so the same debt looks much bigger.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'What FICO weighs',text:'Payment history 35%, amounts owed 30%, length of history 15%, new credit 10%, credit mix 10%. Paying down touches only amounts owed, in the right direction.',pause:true,setup:sim=>{sim.tst=6;}}
 ],
 lab:{bio:'<p><b>Question:</b> How does a balance change utilization?</p><ol><li>Turn on <b>Show the results now</b>.</li><li>Record <b>Credit utilization now</b> for student-card balances of $0, $100, $250, $450 and $500.</li></ol><p>Graph it. Is it a straight line? Why?</p>',
  honors:'<p><b>Question:</b> When does closing a card hurt least?</p><ol><li>Record <b>After closing the old card</b> with the old card’s limit at $500, $1,500 and $5,000.</li></ol><p>Explain your results, then say which FICO categories closing a card touches.</p>',
  ap:'<p><b>Question:</b> How much must Maya pay?</p><ol><li>For targets of 30%, 10% and 5%, solve for the payment by hand.</li><li>Check one answer by setting <b>How much Maya could pay down</b>.</li></ol><p><b>CER:</b> Write the payment as a function of the target t and explain its slope.</p>'},
 terms:[
  {t:'Credit score',d:'A number, usually 300 to 850, that estimates how likely you are to repay on time.'},
  {t:'Credit utilization',d:'Total card balances ÷ total card limits.'},
  {t:'Credit limit',d:'The most a card lets you owe.'},
  {t:'Credit report',d:'The record of your accounts and payments kept by Equifax, Experian and TransUnion. You can get it free at AnnualCreditReport.com.'},
  {t:'Hard inquiry',d:'A lender’s check of your credit when you apply. Too many in a short time can lower a score a little.',lvl:'honors'},
  {t:'Average account age',d:'How long, on average, your accounts have been open.',lvl:'honors'}
 ],
 about:'<p><b>Model.</b> Credit utilization = total card balances ÷ total card limits. The tool compares three moves and does not compute a score. FICO lists its five categories as payment history 35%, amounts owed 30%, length of credit history 15%, new credit 10% and credit mix 10% (myFICO); the real formula is not public, and other scores, like VantageScore, weigh things differently.</p><p><b>What this number hides.</b> Utilization is usually figured from the balance on your statement, so paying before the statement date can lower it. Utilization has no memory in many scores: it matters for the month it is reported. Payment history does have memory: a late payment can stay on a report for seven years.</p><p><b>Your turn: investigate.</b> Everyone can get free weekly credit reports from Equifax, Experian and TransUnion at AnnualCreditReport.com. Read the sample report from class and find each FICO category on it.</p>'
};
BioLab.register(SIM);
})();
