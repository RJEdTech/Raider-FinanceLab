(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* One paycheck, gross to net. Yearly pay → five things come out: federal income tax, Colorado income tax,
   Social Security, Medicare and Colorado FAMLI, plus an optional pretax 401(k) at Closer look. See fin.js. */
const FREQ={weekly:{n:52,l:'Weekly (52 a year)'},biweekly:{n:26,l:'Every two weeks (26)'},semi:{n:24,l:'Twice a month (24)'},monthly:{n:12,l:'Monthly (12)'}};
const yearly=sim=>sim.p.job==='part'?sim.p.wage*sim.p.hours*52:sim.p.salary;
const nPer=sim=>FREQ[sim.p.freq].n;
const pre=sim=>atLeast('honors')?yearly(sim)*(+sim.p.k401||0)/100:0;
const C=sim=>F.check(yearly(sim),nPer(sim),pre(sim));
const keepPct=sim=>{const c=C(sim);return c.gross>0?100*c.net/c.gross:0;};
const fica=sim=>{const c=C(sim);return F.r2(c.ss+c.med);};
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const pc1=v=>(Math.round(v*10)/10).toFixed(1)+'%';
const jobLine=sim=>sim.p.job==='part'?`a part-time job at ${$2(sim.p.wage)} an hour, ${sim.p.hours} hours a week`:`a first career job paying ${$(sim.p.salary)} a year`;
const ROWS=[['fed','Federal income tax','s1'],['st','Colorado income tax','s5'],['ss','Social Security','s2'],['med','Medicare','s6'],['fam','Colorado FAMLI','s4'],['k','401(k), pretax','muted']];

const SIM={
 id:'paycheck',hash:'paycheck',apUnit:1,order:1,tab:'Where did my paycheck go?',kind:'Simulation',
 skills:{bio:'Percent of a whole and unit rates (per year → per paycheck) · Personal Finance (Getting paid)',honors:'Percents, unit rates and taxable income · Personal Finance (Getting paid and taxes)',ap:'Piecewise tax brackets and percents · Personal Finance (Taxes)'},
 card:'Your offer letter says $55,000. Guess what share of each paycheck you actually keep, then take the stub apart one tax at a time.',
 title:'Where did my paycheck go? Gross pay to take-home pay',
 lede:{bio:'Your pay before anything comes out is your gross pay. Before the money reaches you, your employer takes out taxes and sends them to the government for you. What is left is your net pay, or take-home pay. In Colorado, five things come out of most paychecks.',
  honors:'Social Security, Medicare and FAMLI are flat percents of every dollar you earn. Income taxes are not: they apply only to taxable income, the part of your pay above the standard deduction, and money you put in a traditional 401(k) lowers it.',
  ap:'Federal income tax is a piecewise function of taxable income: 10% on the first $12,400, 12% on the next $38,000, 22% after that, and so on. Your employer spreads the year’s tax across your paychecks.'},
 scale:'One paycheck in 2026 for a single Colorado worker who claims no dependents and takes the standard deduction.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The job',
 controls:[
  {id:'keep',label:'Your gut: what percent of your gross pay do you take home?',type:'range',min:50,max:100,step:1,def:70,unit:'%'},
  {id:'job',label:'Which job?',type:'seg',def:'first',noGut:true,onChange:clear,options:[{v:'first',l:'First career job'},{v:'part',l:'Part-time job now'}]},
  {id:'salary',label:'Career job: salary per year',type:'range',min:25000,max:150000,step:1000,def:55000,unit:' dollars',noGut:true,onChange:clear},
  {id:'wage',label:'Part-time job: pay per hour',type:'range',min:15.16,max:25,step:0.01,def:15.16,unit:' dollars',d:2,noGut:true,onChange:clear,help:'$15.16 is Colorado’s 2026 minimum wage. Denver’s is $19.29.'},
  {id:'hours',label:'Part-time job: hours per week',type:'range',min:5,max:30,step:1,def:15,unit:' h',noGut:true,onChange:clear},
  {id:'freq',label:'How often you are paid',type:'seg',def:'semi',noGut:true,onChange:clear,options:Object.keys(FREQ).map(k=>({v:k,l:FREQ[k].l}))},
  {id:'k401',label:'Percent of pay into a traditional 401(k)',type:'range',min:0,max:15,step:1,def:0,unit:'%',lvl:'honors',noGut:true,onChange:clear,help:'This money goes into your own retirement account before income tax is figured. Social Security, Medicare and FAMLI still apply to it.'},
  {id:'reveal',label:'Show the whole stub now',type:'toggle',def:false,help:'Normally the stub fills in once you lock in your gut answer.'}
 ],
 actions:[{id:'teen',label:'Try the part-time job',run(sim){BioLab.setValues(sim,{job:'part',reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'gross',label:'Gross pay, this paycheck',unit:'dollars',d:2,min:0,max:null,get:sim=>C(sim).gross},
  {id:'fed',label:'Federal income tax',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?C(sim).fed:null},
  {id:'st',label:'Colorado income tax',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?C(sim).st:null},
  {id:'ss',label:'Social Security (6.2%)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?C(sim).ss:null},
  {id:'med',label:'Medicare (1.45%)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?C(sim).med:null},
  {id:'fam',label:'Colorado FAMLI (0.44%)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?C(sim).fam:null},
  {id:'net',label:'Take-home pay, this paycheck',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?C(sim).net:null},
  {id:'keepPct',label:'Share of gross you take home',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?keepPct(sim):null},
  {id:'year',label:'Take-home pay for the year',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?C(sim).net*nPer(sim):null},
  {id:'taxable',label:'Taxable income for the year',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?C(sim).taxable:null},
  {id:'marg',label:'Federal rate on your next dollar',unit:'%',d:0,lvl:'ap',min:0,max:40,get:sim=>shown(sim)?100*F.marginal(C(sim).taxable):null},
  {id:'eff',label:'Federal tax as a share of gross pay',unit:'%',d:1,lvl:'ap',min:0,max:40,get:sim=>shown(sim)?100*C(sim).yearTax/yearly(sim):null}
 ],
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),c=C(sim),fs=Math.min(k,1.5),big=k>1.3;
  const RV=[[],[],['fed'],['fed','st'],['fed','st','ss','med'],['fed','st','ss','med','fam']][stg]||null,HOT=[[],[],['fed'],['st'],['ss','med'],['fam']][stg]||[];
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,(big?'Gross ':'Gross pay this paycheck: ')+$2(c.gross),24,34*Math.min(k,1.2),{s:17*fs,w:700});
  txt(ctx,(sim.p.job==='part'?$2(sim.p.wage)+'/h × '+sim.p.hours+' h/wk':$(sim.p.salary)+' a year')+', paid '+FREQ[sim.p.freq].l.toLowerCase(),24,58*Math.min(k,1.25),{s:12.5*fs,c:PAL['cv-soft']});
  /* the gross bar, split into what comes out and what you keep */
  const X0=24,X1=776,Y=78*Math.min(k,1.3),H=46*Math.min(k,1.2),W=X1-X0;
  ctx.fillStyle=PAL['line'];rr(ctx,X0,Y,W,H,6);ctx.fill();
  const rows=ROWS.filter(r=>(r[0]!=='k'||c.k>0)&&(!RV||RV.includes(r[0])));let x=X0;
  if(sh&&RV){rows.forEach(([id,,col])=>{const w=W*(c[id]/Math.max(c.gross,1e-9));if(w>0.5){ctx.fillStyle=PAL[col];ctx.fillRect(x,Y,w,H);}x+=w;});}
  else if(sh){rows.forEach(([id,,col])=>{const w=W*(c[id]/Math.max(c.gross,1e-9));if(w>0.5){ctx.fillStyle=PAL[col];ctx.fillRect(x,Y,w,H);}x+=w;});
   ctx.fillStyle=PAL['s3'];rr(ctx,x,Y,X1-x,H,6);ctx.fill();ctx.fillRect(x,Y,Math.min(8,X1-x),H);
   const lab=(big?'':'Take-home ')+$2(c.net);ctx.font='700 '+(14*fs)+'px '+FONT;const lw=ctx.measureText(lab).width;
   if(lw+16<X1-x)txt(ctx,lab,X1-10,Y+H/2+1,{s:14*fs,w:700,c:'#fff',a:'right',b:'middle'});}
  else{const G=sim.gutS&&sim.gutS.g;const gx=X0+W*sim.p.keep/100;ctx.fillStyle=PAL['card2'];rr(ctx,gx,Y,X1-gx,H,6);ctx.fill();
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,Y-6);ctx.lineTo(gx,Y+H+6);ctx.stroke();
   txt(ctx,(G?'Your gut: ':'Your guess: ')+sim.p.keep+'% kept',clamp(gx,X0+90,X1-90),Y+H+20*fs,{s:13*fs,w:700,c:PAL['s4'],a:'center'});}
  /* the stub: one line per deduction */
  const T=Y+H+(big?44:40)*fs,lh=(big?27:24)*fs;
  rows.concat(RV?[]:[['net','Take-home pay','s3']]).forEach(([id,name,col],i)=>{const y=T+i*lh;if(y>440)return;
   if(HOT.includes(id)){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(X0-8,y-lh*0.62,560,lh*0.95);}
   ctx.fillStyle=PAL[col];rr(ctx,X0,y-9*fs,14*fs,14*fs,3);ctx.fill();
   txt(ctx,name,X0+22*fs,y+2,{s:13.5*fs,w:id==='net'?700:400});
   const v=sh?(id==='net'?$2(c.net):'− '+$2(c[id])):(id==='net'?'?':'?');
   txt(ctx,v,big?560:420,y+2,{s:13.5*fs,w:700,a:'right',c:id==='net'?PAL['s3']:PAL['cv-ink']});
   if(!big&&sh&&id!=='net'){const pct=c.gross>0?100*c[id]/c.gross:0;txt(ctx,pc1(pct)+' of gross',440,y+2,{s:12*fs,c:PAL['cv-soft']});}});
  if(!sh){const msg=locked(sim)?'Work out your turn to fill in the stub':'Lock in your gut to fill in the stub';txt(ctx,msg,big?560:600,T+2*lh,{s:13*fs,c:PAL['cv-soft'],a:'center'});}
  else if(!big&&!RV){if(stg===6){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(560,T-lh*0.4,160,lh*3.9);}txt(ctx,'You keep',640,T+lh*0.6,{s:13*fs,c:PAL['cv-soft'],a:'center'});txt(ctx,pc1(keepPct(sim)),640,T+lh*1.9,{s:30*fs,w:700,c:PAL['s3'],a:'center'});
   txt(ctx,$(c.net*nPer(sim))+' a year',640,T+lh*3,{s:13*fs,c:PAL['cv-soft'],a:'center'});}},
 narrate(sim){const c=C(sim);
  if(!shown(sim))return `Gross pay is ${$2(c.gross)} a paycheck from ${jobLine(sim)}. <b>What share of it reaches your bank account?</b>`;
  if(c.fed===0)return `Your yearly pay is under the ${$(F.STD)} standard deduction, so <b>no income tax comes out</b>. Social Security, Medicare and FAMLI still take ${$2(c.ss+c.med+c.fam)}, and you keep ${pc1(keepPct(sim))}.`;
  return `Of ${$2(c.gross)}, <b>${$2(c.gross-c.net)} comes out</b>: federal income tax ${$2(c.fed)}, Colorado ${$2(c.st)}, Social Security ${$2(c.ss)}, Medicare ${$2(c.med)} and FAMLI ${$2(c.fam)}${c.k>0?`, plus ${$2(c.k)} you save in your 401(k)`:''}. You keep ${pc1(keepPct(sim))}.`;},
 gut:{better:'lower',controls:['keep'],
  ask:{bio:'Drag the slider here to the percent of your gross pay you think you actually take home. Then lock it in.'},
  lock(sim){const t=keepPct(sim);return {v:Math.abs(sim.p.keep-t),keep:sim.p.keep,label:sim.p.keep+'% kept'};},
  solve(sim){const t=keepPct(sim);sim.p.keep=Math.round(t);return {v:Math.abs(Math.round(t)-t),keep:Math.round(t),label:pc1(t)+' kept'};},
  hint:{bio:'Lock in your gut. Then you will work out one line of the stub yourself.'},
  calc:{unit:'$',d:2,tol:0.06,
   prompt:{bio:sim=>`Social Security takes 6.2% and Medicare takes 1.45% of every dollar you earn: 7.65% together. Your gross pay this paycheck is <b>${$2(C(sim).gross)}</b>. How much do those two take, together?`,
    ap:sim=>{const c=C(sim);return `Social Security (6.2%) and Medicare (1.45%) come out of every paycheck. Gross pay this paycheck is <b>${$2(c.gross)}</b>. Find each one to the cent, then add them. How much do they take together?`;}},
   answer:fica,
   hint:'Change 7.65% to a decimal, 0.0765, and multiply it by the gross pay.',
   steps(sim){const c=C(sim);return [`Social Security: ${$2(c.gross)} × 0.062 = ${$2(c.ss)}.`,`Medicare: ${$2(c.gross)} × 0.0145 = ${$2(c.med)}.`,`Together: <b>${$2(fica(sim))}</b>, about 7.65% of your gross. Your employer pays the same amount again on top of your pay.`];}},
  formula(sim){const c=C(sim),y=yearly(sim),n=nPer(sim),T=c.taxable;
   const fedLine=T>0?`Federal: (${$(y)}${c.k>0?' − '+$(pre(sim)):''} − ${$(F.STD)}) = ${$(T)} taxable; bracket tax ${$2(c.yearTax)} ÷ ${n} = ${$2(c.fed)}`:`Federal: ${$(y)} is under the ${$(F.STD)} standard deduction, so $0`;
   return `${fedLine}<br>Colorado: 4.4% × ${$(T)} ÷ ${n} = ${$2(c.st)}<br>FICA: ${$2(c.gross)} × 7.65% = ${$2(c.ss+c.med)} · FAMLI: ${$2(c.gross)} × 0.44% = ${$2(c.fam)}<br>Take-home: ${$2(c.gross)} − ${$2(c.gross-c.net)} = ${$2(c.net)} (${pc1(keepPct(sim))})`;},
  how:{bio:'Payroll taxes are a flat percent of every dollar. Income taxes skip the first $16,100 of the year’s pay, then take a percent of the rest. The math adds each line and subtracts it from your gross.',
   ap:'Each income tax is figured on the year’s taxable income, then divided by the number of paychecks. The federal tax uses the bracket table, a piecewise function.'},
  compare(sim,g0,m){const c=C(sim),t=keepPct(sim),gap=g0.keep-t,per=Math.abs(gap)/100*c.gross,K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the FICA line yourself, the same way payroll software does.':'';
   if(Math.abs(gap)<2)return `Your gut was right on: you keep about ${pc1(t)}, ${$2(c.net)} of ${$2(c.gross)}.`+self;
   return `Your gut said ${g0.keep}%; you really keep <b>${pc1(t)}</b>. That is ${$2(per)} a paycheck, ${$(per*nPer(sim))} a year, ${gap>0?'more than is really there. A budget built on your gut would come up short':'less than you really get. Your gut was too gloomy'}.`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.job=R(['first','first','part']);sim.p.salary=R([38000,45000,52000,60000,72000,85000]);sim.p.wage=R([15.16,16,17.5,19.29]);sim.p.hours=R([10,12,15,20,25]);sim.p.freq=R(['weekly','biweekly','semi']);sim.p.keep=70;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You earn $1,200 before taxes every two weeks. Social Security takes 6.2%. How much is that per paycheck?',answer:74.40,tol:0.02,unit:'$',d:2,hint:'Multiply $1,200 by 0.062.',explain:'$1,200 × 0.062 = $74.40. Medicare adds $1,200 × 0.0145 = $17.40 more.'},
  {lvl:'bio',instant:true,q:'A part-time job pays you $11,825 this year, less than the $16,100 standard deduction. What comes out of your paychecks?',choices:['Nothing at all','Social Security, Medicare and FAMLI, but no income tax','Every tax, the same as a full-time job'],correct:1,explain:'Income tax starts above the standard deduction, so none is owed. Social Security, Medicare and FAMLI are taken from every dollar, so about 8.1% still comes out.'},
  {lvl:'bio',instant:true,q:'Your offer letter says $55,000 a year. Which number should your monthly budget start from?',choices:['$55,000 ÷ 12 = $4,583','Your take-home pay: about $3,700 a month','$55,000 ÷ 24 = $2,292'],correct:1,explain:'You can only spend what reaches your account. Twice a month you take home about $1,851, so about $3,702 a month.'},
  {lvl:'honors',kind:'num',q:'On a $55,000 salary you put 5% into a traditional 401(k). That lowers your taxable income by $2,750. At 12% federal and 4.4% Colorado, how much less income tax do you pay in the year?',answer:451,tol:1,unit:'$',d:0,hint:'Multiply $2,750 by 0.12 and by 0.044, then add.',explain:'$2,750 × 0.12 = $330 and $2,750 × 0.044 = $121, so $451 less tax. Saving $2,750 cost you only $2,299 of take-home pay.'},
  {lvl:'honors',instant:true,q:'Someone earns $250,000 in 2026. Why does Social Security stop coming out of their paychecks late in the year?',choices:['High earners are exempt','Social Security applies only to the first $184,500 of pay each year','Their employer pays it instead'],correct:1,explain:'In 2026 the Social Security wage base is $184,500. Medicare has no cap, so it keeps coming out.'},
  {lvl:'ap',kind:'num',q:'A single worker earns $80,000 in 2026 and takes the $16,100 standard deduction. Use the brackets (10% to $12,400, 12% to $50,400, 22% to $105,700) to find the year’s federal income tax.',answer:8770,tol:1,unit:'$',d:0,hint:'Taxable income is $63,900. Tax the first $12,400 at 10%, the next $38,000 at 12%, and the rest at 22%.',explain:'$1,240 + $4,560 + 22% × $13,500 = $1,240 + $4,560 + $2,970 = $8,770.'},
  {lvl:'ap',instant:true,q:'On $55,000, the federal rate on the next dollar is 12%. What share of the whole $55,000 goes to federal income tax?',choices:['12%','About 8%','About 3%'],correct:1,explain:'$4,420 ÷ $55,000 ≈ 8.0%. The first $16,100 is untaxed and the next $12,400 is taxed at only 10%, so the average rate is well below the top rate.'}
 ],
 tour:[
  {title:'Start with gross pay',text:'A $55,000 salary paid twice a month is $55,000 ÷ 24 = $2,291.67 a paycheck. That is gross pay, before anything comes out.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{job:'first',salary:55000,freq:'semi',k401:0,reveal:true});},focus:[0,0,800,130]},
  {title:'Federal income tax',text:'The first $16,100 of the year is untaxed (the standard deduction). On the other $38,900: 10% of $12,400, then 12% of the rest, $4,420 for the year, or $184.17 a paycheck.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Colorado income tax',text:'Colorado takes a flat 4.4% of the same $38,900: $1,711.60 a year, $71.32 a paycheck.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Social Security and Medicare',text:'These are flat: 6.2% and 1.45% of every dollar, $142.08 and $33.23. Together they are called FICA. Your employer matches them.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Colorado FAMLI',text:'0.44% of pay, $10.08, funds paid family and medical leave for Colorado workers.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'What you keep',text:'$2,291.67 − $440.88 = $1,850.79. You keep about 80.8%, not the 70% many people guess.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'A part-time job now',text:'At $15.16 an hour for 15 hours a week, you earn $11,825 in a year, under the standard deduction. No income tax: only FICA and FAMLI, so you keep 91.9%.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{job:'part',wage:15.16,hours:15,freq:'biweekly',reveal:true});}},
  {lvl:'honors',title:'Save before tax',text:'Put 5% of $55,000 in a traditional 401(k): $2,750 a year skips income tax now, so your take-home drops by less than you save.',pause:true,setup:sim=>{sim.tst=8;BioLab.setValues(sim,{job:'first',salary:55000,freq:'semi',k401:5,reveal:true});}}
 ],
 onTourExit(sim){BioLab.setValues(sim,{k401:0,reveal:false});},
 lab:{bio:'<p><b>Question:</b> Does a bigger salary mean you keep a bigger share?</p><ol><li>Turn on <b>Show the whole stub now</b>.</li><li>Record a trial at $30,000, $45,000, $60,000, $90,000 and $120,000.</li><li>For each, write down <b>Share of gross you take home</b>.</li></ol><p>Write one sentence about the pattern, and one about why.</p>',
  honors:'<p><b>Question:</b> What does saving in a 401(k) really cost you?</p><ol><li>At $55,000, record <b>Take-home pay for the year</b> at 0%, 5% and 10%.</li><li>For each, find how much you saved and how much less you took home.</li></ol><p>Explain why the second number is smaller than the first.</p>',
  ap:'<p><b>Question:</b> How does the effective federal rate grow with pay?</p><ol><li>Record <b>Federal tax as a share of gross pay</b> from $30,000 to $150,000 in $20,000 steps.</li><li>Graph it, and mark where the next-dollar rate jumps.</li></ol><p><b>CER:</b> Use the bracket function to explain why the graph bends but never jumps.</p>'},
 terms:[
  {t:'Gross pay',d:'Your pay before anything is taken out.'},
  {t:'Net pay',d:'Your take-home pay: what is left after taxes and other deductions.'},
  {t:'Withholding',d:'Tax your employer takes out of each paycheck and sends to the government for you.'},
  {t:'FICA',d:'Social Security (6.2%) and Medicare (1.45%) taxes, taken from every dollar of pay. Employers pay the same again.'},
  {t:'Standard deduction',d:'The part of your yearly income that is not taxed: $16,100 for a single filer in 2026.',lvl:'honors'},
  {t:'Taxable income',d:'Income minus deductions (and minus traditional 401(k) savings). Income taxes are figured on this.',lvl:'honors'},
  {t:'Marginal rate',d:'The tax rate on your next dollar of income.',lvl:'ap'},
  {t:'Effective rate',d:'Total tax divided by total income: your average rate.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> A single Colorado worker in 2026 who claims no dependents and takes the standard deduction. Federal: taxable income = yearly pay − traditional 401(k) − $16,100, taxed with the 2026 brackets (IRS Rev. Proc. 2025-32). Colorado: a flat 4.4% of federal taxable income (Colorado Department of Revenue). Social Security: 6.2% up to the $184,500 wage base (SSA). Medicare: 1.45% with no cap; an extra 0.9% applies above $200,000 and is left out here. Colorado FAMLI: 0.88% of wages in 2026, and an employer with 10 or more workers may take half, 0.44%, from your pay (SB 25-144). Each yearly tax is spread evenly over the paychecks, the idea behind the IRS percentage method in Publication 15-T.</p><p><b>Why the class calls it four taxes.</b> Federal, state, Social Security and Medicare are the four taxes on most stubs. FAMLI is an insurance premium the state requires, so many Colorado stubs show a fifth line.</p><p><b>What this number hides.</b> Real stubs also take out health insurance premiums, which can be large, and some cities add a local tax: Denver’s Occupational Privilege Tax is $5.75 a month for workers earning at least $500 in the month. Real withholding depends on your W-4, so your refund or bill in April depends on how close it came.</p><p><b>This is a simplified model, not tax advice.</b></p>'
};
BioLab.register(SIM);
})();
