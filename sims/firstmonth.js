(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* Alex's first month on their own in Denver: monthly take-home (from fin.js) minus a line-item budget.
   Weekly costs × 52 ÷ 12, yearly costs ÷ 12. Leftover = what Alex can save. */
const LOANP=29560,LOANR=0.0652;
const loanPay=()=>{const r=LOANR/12;return F.r2(LOANP*r/(1-Math.pow(1+r,-120)));};
const income=sim=>F.r2(2*F.check(sim.p.salary,24,0).net);
const wk=v=>v*52/12,yr=v=>v/12;
function lines(sim){const p=sim.p,room=p.home==='room',L=[];
 const add=(id,name,v,grp,need)=>L.push({id,name,v:F.r2(v),grp,need});
 add('rent',room?'Rent (half of a 2-bedroom)':'Rent (1-bedroom alone)',room?1225:1750,'Housing',1);
 add('util','Utilities',room?62.5:125,'Housing',1);add('renters','Renters insurance',15,'Housing',1);
 add('car','Car payment (used car)',350,'Car',1);add('ins','Car insurance',150,'Car',1);add('gas','Gas (10,000 miles a year)',10000/20*4.5/12,'Car',1);
 add('reg','Registration ($310 a year)',yr(310),'Car',1);add('maint','Car repairs and upkeep',50,'Car',1);
 add('groc','Groceries ($'+p.groc+' a week)',wk(p.groc),'Food',1);add('eat','Eating out (once a week, $30)',wk(30),'Food',0);
 add('prem','Health insurance premium',65,'Health',1);add('copay','Copays and prescriptions',80,'Health',1);
 add('phone','Phone',70,'Bills',1);add('net','Internet',room?30:60,'Bills',1);add('stream','Streaming',25,'Fun',0);
 if(p.loan==='avg')add('loan','Student loan ($29,560, 10 years)',loanPay(),'Loan',1);
 if(p.ski==='yes'){add('epic','Ski pass ($675 a year)',yr(675),'Fun',0);add('gear','Ski and hiking gear ($300 a year)',yr(300),'Fun',0);add('trips','Two mountain trips (extras)',80,'Fun',0);}
 add('gym','Gym',40,'Fun',0);add('fun','Movies, games and events',60,'Fun',0);add('house','Household supplies and laundry',40,'Housing',1);add('cloth','Clothing and personal care',60,'Other',1);
 if(+p.give>0)add('give','Giving ('+p.give+'% of take-home)',income(sim)*p.give/100,'Giving',0);
 return L;}
const total=sim=>F.r2(lines(sim).reduce((s,l)=>s+l.v,0));
const left=sim=>F.r2(income(sim)-total(sim));
const needs=sim=>F.r2(lines(sim).filter(l=>l.need).reduce((s,l)=>s+l.v,0));
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const GRP=[['Housing','s2'],['Car','s1'],['Food','s4'],['Health','s6'],['Bills','s5'],['Loan','muted'],['Fun','s3'],['Other','cv-soft'],['Giving','rj']];
const sgn=v=>(v<0?'−':'+')+$2(Math.abs(v));

const SIM={
 id:'firstmonth',hash:'firstmonth',apUnit:1,order:2,tab:'Alex’s first month in Denver',kind:'Simulation',
 skills:{bio:'Unit rates: weekly and yearly costs to monthly (× 52 ÷ 12, ÷ 12) · Personal Finance (Budgeting)',honors:'Unit rates and percent of a whole (needs, wants, savings) · Personal Finance (Budgeting)',ap:'Unit rates and the loan payment formula · Personal Finance (Budgeting)'},
 card:'Alex is 25, takes home $3,702 a month and lives alone in Denver with a car, a ski pass and a student loan. Guess what is left at the end of the month, then build the budget line by line.',
 title:'Alex’s first month in Denver: does the paycheck cover it?',
 lede:{bio:'A budget lists every cost for one month. Some bills come weekly (groceries) or yearly (a ski pass, car registration), so you change them to monthly amounts first. Then subtract the total from your monthly take-home pay.',
  honors:'Sort each line as a need or a want. One common guideline, the 50/30/20 rule, suggests about 50% of take-home for needs, 30% for wants and 20% for savings. Compare Alex’s split to it.',
  ap:'The student loan line comes from the payment formula: payment = P·r ÷ (1 − (1 + r)⁻ⁿ), with r the monthly rate and n the number of months.'},
 scale:'One month for a single 25-year-old in Denver in 2026. Take-home pay comes from the paycheck tool: a $55,000 salary paid twice a month.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Alex’s month',
 controls:[
  {id:'guess',label:'Your gut: how much is left at the end of the month? (negative = short)',type:'range',min:-1500,max:1500,step:25,def:300,unit:' dollars'},
  {id:'home',label:'Where Alex lives',type:'seg',def:'alone',noGut:true,onChange:clear,options:[{v:'alone',l:'1-bedroom alone'},{v:'room',l:'2-bedroom with a roommate'}]},
  {id:'groc',label:'Groceries per week',type:'range',min:50,max:175,step:5,def:100,unit:' dollars',noGut:true,onChange:clear,help:'The class budget tracker uses $175 a week. Check your family’s receipts for a real number.'},
  {id:'ski',label:'Ski pass and two mountain trips a month?',type:'seg',def:'yes',noGut:true,onChange:clear,options:[{v:'yes',l:'Yes'},{v:'no',l:'No'}]},
  {id:'loan',label:'Student loan',type:'seg',def:'avg',noGut:true,onChange:clear,options:[{v:'avg',l:'Average debt: $29,560'},{v:'none',l:'Graduated debt-free'}]},
  {id:'give',label:'Giving: percent of take-home pay',type:'range',min:0,max:10,step:1,def:0,unit:'%',noGut:true,onChange:clear,help:'Many people give to their church, a charity or a cause as one line of their budget.'},
  {id:'salary',label:'Alex’s salary',type:'range',min:35000,max:90000,step:1000,def:55000,unit:' dollars',lvl:'honors',noGut:true,onChange:clear},
  {id:'reveal',label:'Show the totals now',type:'toggle',def:false,help:'Normally the totals appear once you lock in your gut answer.'}
 ],
 actions:[{id:'room',label:'Get a roommate',run(sim){BioLab.setValues(sim,{home:'room',reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'inc',label:'Take-home pay this month',unit:'dollars',d:2,min:0,max:null,get:income},
  {id:'spend',label:'Spending this month',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?total(sim):null},
  {id:'left',label:'Left over (negative = short)',unit:'dollars',d:2,min:null,max:null,get:sim=>shown(sim)?left(sim):null},
  {id:'rentPct',label:'Rent as a share of take-home',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*lines(sim)[0].v/income(sim):null},
  {id:'needPct',label:'Needs as a share of take-home',unit:'%',d:1,lvl:'honors',min:0,max:150,get:sim=>shown(sim)?100*needs(sim)/income(sim):null},
  {id:'wantPct',label:'Wants as a share of take-home',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?100*(total(sim)-needs(sim))/income(sim):null},
  {id:'savePct',label:'Saved as a share of take-home',unit:'%',d:1,lvl:'honors',min:null,max:100,get:sim=>shown(sim)?100*left(sim)/income(sim):null},
  {id:'loanPay',label:'Student loan payment',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>sim.p.loan==='avg'?loanPay():0}
 ],
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3,inc=income(sim),T=total(sim);
  const S2=['rent'],S3=['rent','groc','epic','reg'],hot=l=>stg===2&&l.id==='rent'||stg===3&&S3.includes(l.id)&&l.id!=='rent',L=lines(sim).filter(l=>stg>=4||stg===2&&S2.includes(l.id)||stg===3&&S3.includes(l.id));
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,'Take-home pay: '+$2(inc)+' a month',24,32*Math.min(k,1.2),{s:17*fs,w:700});
  const X0=24,X1=big?776:560,W=X1-X0,mx=Math.max(inc,T)*1.04,sc=W/mx,H=34*Math.min(k,1.3),y1=52*Math.min(k,1.3),y2=y1+H+28*fs;
  ctx.fillStyle=PAL['s3'];rr(ctx,X0,y1,inc*sc,H,5);ctx.fill();txt(ctx,'Income',X0+8,y1+H/2+1,{s:13*fs,w:700,c:'#fff',b:'middle'});
  if(stg<2){}
  else if(sh){let x=X0;GRP.forEach(([g,col])=>{const v=L.filter(l=>l.grp===g).reduce((s,l)=>s+l.v,0);if(v<=0)return;ctx.fillStyle=PAL[col];ctx.fillRect(x,y2,v*sc,H);x+=v*sc;});
   if(stg===2){const v=L[0].v;txt(ctx,Math.round(100*v/inc)+'% of take-home pay',X0+v*sc+10,y2+H/2+1,{s:15*fs,w:700,c:PAL['rj'],b:'middle'});}
   ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([4,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X0+inc*sc,y1-4);ctx.lineTo(X0+inc*sc,y2+H+4);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Spending',X0+8,y2+H/2+1,{s:13*fs,w:700,c:'#fff',b:'middle'});}
  else{ctx.fillStyle=PAL['card2'];rr(ctx,X0,y2,W,H,5);ctx.fill();txt(ctx,'Spending: ?',X0+8,y2+H/2+1,{s:13*fs,w:700,c:PAL['cv-soft'],b:'middle'});}
  /* the lines, two columns, biggest first */
  const rows=L.slice().sort((a,b)=>b.v-a.v),lh=(big?24:19)*fs,top=y2+H+(big?26:24)*fs,per=Math.floor((440-top)/lh),cols=big?1:2,colW=big?752:268;
  rows.slice(0,per*cols).forEach((l,i)=>{const c=Math.floor(i/per),r=i%per,x=X0+c*(colW+12),y=top+r*lh,col=(GRP.find(g=>g[0]===l.grp)||[0,'muted'])[1];
   ctx.fillStyle=PAL[col];rr(ctx,x,y-8*fs,10*fs,10*fs,2);ctx.fill();if(hot(l)){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.strokeRect(x-5,y-lh+5*fs,colW+10,lh);}
   let nm=l.name;ctx.font='400 '+(12*fs)+'px '+FONT;const room=colW-16*fs-62*fs;while(nm.length>8&&ctx.measureText(nm).width>room)nm=nm.replace(/…$/,'').slice(0,-1)+'…';txt(ctx,nm,x+16*fs,y+1,{s:12*fs});
   txt(ctx,(sh||l.id!=='groc'||!locked(sim))?$2(l.v):'?',x+colW,y+1,{s:12*fs,w:700,a:'right'});});
  if(!big&&stg>=5){const cx=680;if(stg===5){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(cx-100,70,200,94);}
   if(sh){const v=left(sim);txt(ctx,v>=0?'Left to save':'Short by',cx,90,{s:14,c:PAL['cv-soft'],a:'center'});txt(ctx,$2(Math.abs(v)),cx,124,{s:28,w:700,a:'center',c:v>=0?PAL['s3']:PAL['s1']});
    txt(ctx,'Spending '+$2(T),cx,152,{s:12.5,c:PAL['cv-soft'],a:'center'});}
   else{txt(ctx,locked(sim)?'Convert groceries to':'Lock in your gut',cx,100,{s:13,c:PAL['cv-soft'],a:'center'});txt(ctx,locked(sim)?'a monthly cost first':'to see the totals',cx,120,{s:13,c:PAL['cv-soft'],a:'center'});}
   const G=sim.gutS&&sim.gutS.g;if(G&&stg>=99)txt(ctx,'Your gut: '+G.label,cx,182,{s:12.5,w:700,c:PAL['s4'],a:'center'});
   if(stg===7){const nd=100*needs(sim)/inc,wt=100*(T-needs(sim))/inc,sv=Math.max(0,100*left(sim)/inc),y0=200;txt(ctx,'Alex vs. 50/30/20',cx,y0,{s:14,w:700,a:'center'});
    [['Needs',nd,50,'s2'],['Wants',wt,30,'s4'],['Saved',sv,20,'s3']].forEach(([n,v,g,c],i)=>{const y=y0+22+i*44,bx=600,bw=170,sc2=bw/100;txt(ctx,n+': '+Math.round(v)+'%',bx,y+10,{s:12.5,w:700,c:PAL[c]});ctx.fillStyle=PAL['card2'];ctx.fillRect(bx,y+16,bw,12);ctx.fillStyle=PAL[c];ctx.fillRect(bx,y+16,Math.min(bw,v*sc2),12);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx+g*sc2,y+12);ctx.lineTo(bx+g*sc2,y+32);ctx.stroke();txt(ctx,'guide '+g+'%',bx+bw,y+10,{s:11.5,a:'right',c:PAL['cv-soft']});});}}},
 narrate(sim){const inc=income(sim),T=total(sim),v=left(sim);
  if(!shown(sim))return `Alex takes home ${$2(inc)} a month. Rent alone is ${$(lines(sim)[0].v)}. <b>Is anything left at the end of the month?</b>`;
  const big=lines(sim).slice().sort((a,b)=>b.v-a.v).slice(0,3).map(l=>l.name.split(' (')[0].toLowerCase()+' '+$(l.v)).join(', ');
  return v>=0?`Spending is ${$2(T)}, so Alex has <b>${$2(v)} left</b> to save, ${(100*v/inc).toFixed(1)}% of take-home. The biggest lines: ${big}.`
   :`Spending is ${$2(T)}, <b>${$2(-v)} more than Alex takes home</b>. The gap would go on a credit card. The biggest lines: ${big}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to how much you think Alex has left at the end of the month. Below zero means Alex comes up short. Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-left(sim)),guess:sim.p.guess,label:sgn(sim.p.guess)};},
  solve(sim){const t=left(sim);sim.p.guess=clamp(Math.round(t/25)*25,-1500,1500);return {v:0,guess:t,label:sgn(t)};},
  hint:{bio:'Lock in your gut. Then you will turn the weekly grocery bill into a monthly one yourself.'},
  calc:{unit:'$',d:2,tol:0.6,
   prompt:{bio:sim=>`Alex spends <b>$${sim.p.groc}</b> on groceries every week. A year has 52 weeks and 12 months. How much is that per month?`,
    ap:sim=>sim.p.loan==='avg'?`Alex owes <b>$29,560</b> at 6.52% a year, paid monthly for 10 years. Use payment = P·r ÷ (1 − (1 + r)⁻ⁿ) with r = 0.0652 ÷ 12 and n = 120. What is the monthly payment?`:`Alex spends <b>$${sim.p.groc}</b> on groceries every week. A year has 52 weeks and 12 months. How much is that per month?`},
   answer:sim=>atLeast('ap')&&sim.p.loan==='avg'?loanPay():F.r2(wk(sim.p.groc)),
   hint:{bio:'Multiply the weekly cost by 52 to get a year, then divide by 12.',ap:'r ≈ 0.005433. Find (1 + r)⁻¹²⁰ first.'},
   steps(sim){if(atLeast('ap')&&sim.p.loan==='avg'){const r=LOANR/12,f=Math.pow(1+r,-120);return [`r = 0.0652 ÷ 12 ≈ ${r.toFixed(6)}; (1 + r)⁻¹²⁰ ≈ ${f.toFixed(4)}.`,`$29,560 × ${r.toFixed(6)} ÷ (1 − ${f.toFixed(4)}) ≈ <b>${$2(loanPay())}</b> a month.`,`Over 10 years Alex pays ${$2(loanPay()*120)}, of which ${$2(loanPay()*120-LOANP)} is interest.`];}
    return [`A year of groceries: $${sim.p.groc} × 52 = ${$(sim.p.groc*52)}.`,`Per month: ${$(sim.p.groc*52)} ÷ 12 = <b>${$2(wk(sim.p.groc))}</b>.`,`Not $${sim.p.groc} × 4 = ${$(sim.p.groc*4)}: most months are a little longer than 4 weeks.`];}},
  formula(sim){const inc=income(sim);return `Groceries: $${sim.p.groc} × 52 ÷ 12 = ${$2(wk(sim.p.groc))} · Registration: $310 ÷ 12 = ${$2(yr(310))}${sim.p.ski==='yes'?' · Ski pass: $675 ÷ 12 = '+$2(yr(675)):''}<br>Left over: ${$2(inc)} − ${$2(total(sim))} = ${$2(left(sim))}`;},
  how:{bio:'The math puts every cost on the same footing, dollars per month, then adds them and subtracts the total from take-home pay.',ap:'Unit rates turn weekly and yearly costs into monthly ones; the loan payment comes from the amortization formula.'},
  compare(sim,g0,m){const t=left(sim),gap=g0.guess-t,K=sim.ui.calc,self=K&&K.done&&K.correct?' You converted a weekly cost to a monthly one yourself, the step most budgets get wrong.':'';
   if(Math.abs(gap)<=100)return `Your gut was close: Alex ${t>=0?'has '+$2(t)+' left':'is short by '+$2(-t)}.`+self;
   return `Your gut said ${sgn(g0.guess)}; the math says <b>${sgn(t)}</b>. ${gap>0?`A plan built on your gut would be ${$(gap)} short every month, ${$(gap*12)} a year on a credit card at about 22% interest.`:`Your gut was ${$(-gap)} too gloomy.`}`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.home=R(['alone','room']);sim.p.groc=R([60,80,100,120,150]);sim.p.ski=R(['yes','no']);sim.p.loan=R(['avg','none']);sim.p.give=R([0,0,2,5,10]);sim.p.guess=300;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A streaming bundle costs $18 a week. To the cent, what is that per month? (× 52 ÷ 12)',answer:78,tol:0.01,unit:'$',d:2,hint:'$18 × 52 = $936 a year.',explain:'$936 ÷ 12 = $78.00 a month, not $72 (which would be 4 weeks a month).'},
  {lvl:'bio',instant:true,q:'Alex lives alone and comes up short every month. Which single change helps the most?',choices:['Cancel streaming ($25)','Get a roommate (saves about $618)','Skip one meal out a month ($30)'],correct:1,explain:'Housing is the biggest line in most budgets, so changes there matter most. Half of a $2,450 two-bedroom is $1,225, and the utilities and internet split too: $617.50 a month in all.'},
  {lvl:'bio',instant:true,q:'Which number should Alex start the budget from?',choices:['$55,000 ÷ 12 = $4,583','Take-home pay: about $3,702','$55,000 ÷ 52 = $1,058'],correct:1,explain:'Taxes come out before the money reaches Alex. A budget can only spend take-home pay.'},
  {lvl:'honors',kind:'num',q:'Alex takes home $3,701.58 a month. Under the 50/30/20 guideline, how much would go to savings?',answer:740.32,tol:0.5,unit:'$',d:2,hint:'20% = 0.20.',explain:'$3,701.58 × 0.20 ≈ $740.32 a month.'},
  {lvl:'honors',instant:true,q:'Is a gym membership a need or a want?',choices:['Always a need','Usually a want: there are free ways to exercise','It depends only on the price'],correct:1,explain:'A want is something you choose for comfort or fun. Exercise matters, but a paid membership is one of many ways to get it, so most budgets list it as a want.'},
  {lvl:'ap',kind:'num',q:'A $20,000 car loan at 7.14% for 60 months. Payment = P·r ÷ (1 − (1 + r)⁻ⁿ). What is the monthly payment?',answer:397.35,tol:0.5,unit:'$',d:2,hint:'r = 0.0714 ÷ 12 = 0.00595.',explain:'(1.00595)⁻⁶⁰ ≈ 0.7003, so $20,000 × 0.00595 ÷ 0.2997 ≈ $397.35. 7.14% was the average 60-month new-car rate at banks in spring 2026 (Federal Reserve G.19).'},
  {lvl:'ap',instant:true,q:'Why does $100 a week come to $433.33 a month and not $400?',choices:['Rounding','A year has 52 weeks, so a month averages 52 ÷ 12 ≈ 4.33 weeks','Prices rise during the month'],correct:1,explain:'52 ÷ 12 = 4.333…, so weekly × 4.33 is the monthly rate.'}
 ],
 tour:[
  {title:'Start with take-home pay',text:'Alex earns $55,000 and takes home $1,850.79 twice a month: $3,701.58 a month to spend.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{home:'alone',groc:100,ski:'yes',loan:'avg',give:0,salary:55000,reveal:true});}},
  {title:'Housing first',text:'A Denver one-bedroom averages about $1,750 a month. That is 47% of Alex’s take-home pay before anything else.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Convert to months',text:'Groceries: $100 × 52 ÷ 12 = $433.33. The ski pass: $675 ÷ 12 = $56.25. Registration: $310 ÷ 12 = $25.83.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Add every line',text:'Car, food, insurance, phone, the $335.95 student loan and the fun: $4,213.86 in all.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'The gap',text:'$3,701.58 − $4,213.86 = −$512.28. Alex comes up short every month, and the gap lands on a credit card.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'One big change',text:'With a roommate, rent drops to $1,225 and utilities and internet split. That saves $617.50, so Alex has $105.22 left: positive, but only 2.8% of take-home to save.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{home:'room',reveal:true});}},
  {lvl:'honors',title:'Needs, wants, savings',text:'Compare Alex’s needs, wants and savings shares to the 50/30/20 guideline. Which lines would you move?',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 lab:{bio:'<p><b>Question:</b> Which choices close Alex’s gap?</p><ol><li>Turn on <b>Show the totals now</b>.</li><li>Change one thing at a time: roommate, groceries, ski pass, student loan. Record <b>Left over</b> each time.</li><li>Rank the changes by how much they help.</li></ol><p>Write a plan that leaves at least $200 a month to save, and say what Alex gives up.</p>',
  honors:'<p><b>Question:</b> How close is Alex to 50/30/20?</p><ol><li>Record the needs, wants and saved shares for the starting budget.</li><li>Find a set of choices that reaches at least 10% saved.</li></ol><p>Which lines did you call needs? Defend one choice someone could argue the other way.</p>',
  ap:'<p><b>Question:</b> What salary does Alex need?</p><ol><li>Keep every lifestyle choice. Raise the salary until <b>Left over</b> reaches 20% of take-home.</li><li>Record the salary and the take-home pay.</li></ol><p><b>CER:</b> Explain why each extra $1,000 of salary adds less than $1,000 a year to the budget.</p>'},
 terms:[
  {t:'Budget',d:'A plan for one period (usually a month) that lists income and every cost.'},
  {t:'Unit rate',d:'A cost per one unit of time, like dollars per month. Weekly × 52 ÷ 12 = monthly; yearly ÷ 12 = monthly.'},
  {t:'Need',d:'A cost you must pay to live and work: housing, food, transportation, insurance.'},
  {t:'Want',d:'A cost you choose for comfort or fun.'},
  {t:'50/30/20 guideline',d:'A rule of thumb: about 50% of take-home for needs, 30% for wants and 20% for savings.',lvl:'honors'},
  {t:'Amortization',d:'Paying off a loan in equal payments that cover interest first, then principal.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Take-home pay is two semi-monthly paychecks from the paycheck tool (single, Colorado, 2026). Monthly costs: weekly × 52 ÷ 12, yearly ÷ 12.</p><p><b>Where the numbers come from.</b> Rent: Denver one-bedrooms average about $1,729 to $1,800 a month and two-bedrooms about $2,388 to $2,500 (Rentometer, 2026), so the tool uses $1,750 and $2,450. Student loan: $29,560 is the average debt of 2023–24 bachelor’s graduates who borrowed (College Board, Trends in Student Aid 2025), at the 2026–27 federal undergraduate rate of 6.52% over 10 years. Ski pass: an Epic Local Pass for ages 18 to 30 listed at about $675 for 2026–27 in September 2026. From the class budget tracker: utilities $125, used-car payment $350, gas at 20 mpg and $4.50 a gallon, registration $310 a year, health premium $65 and copays $80. Car insurance ($150), renters insurance ($15), phone, internet, streaming, gym and the small lines are estimates for illustration.</p><p><b>What this number hides.</b> Real months are uneven: a car repair, a medical bill or a holiday can blow a budget that balanced on paper, which is why many plans add an emergency fund. Prices differ across Denver, and a roommate also changes how you live.</p><p><b>This is a simplified model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
