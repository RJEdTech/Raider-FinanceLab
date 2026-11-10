(function(){
'use strict';
const {txt,rr,PAL,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* Where do my taxes go? One year of pay → the five taxes in fin.js → where each one is sent.
   Federal income tax goes to the Treasury's general fund, which pays for everything except what trust funds cover.
   Method (the "taxpayer receipt" idea): split the income tax in proportion to FY2026 federal spending other than
   Social Security, which payroll taxes pay for. Federal FY2026 outlays, $B: Treasury Monthly Treasury Statement, table 9,
   fiscal year ending Sep 30, 2026. Total outlays 7,395.8; receipts 5,403.3.
   Colorado income tax: one-third of one percent of taxable income to the State Education Fund (Colo. Const. art. IX §17);
   the rest to the General Fund, split by FY2025-26 General Fund operating appropriations (Joint Budget Committee,
   FY 2025-26 Appropriations Report), total $16,941,722,229. */
const OUT=7395.8,REC=5403.3,SSOUT=1667.1,D=OUT-SSOUT;
const FED=[
 {id:'mc',l:'Medicare',d:'health insurance for people 65 and older',v:1072.6},
 {id:'int',l:'Interest on the debt',d:'interest on money already borrowed',v:1051.8},
 {id:'hl',l:'Medicaid and other health',d:'Medicaid, CHIP, ACA tax credits, NIH, CDC',v:1025.6},
 {id:'df',l:'Defense',d:'the military',v:965.2},
 {id:'is',l:'Income security',d:'SNAP, SSI, tax credits paid out, housing aid, federal pensions',v:694.2},
 {id:'va',l:'Veterans',d:'VA health care and benefits',v:416.2},
 {id:'tr',l:'Transportation',d:'highways, air traffic, transit',v:142.9},
 {id:'ed',l:'Education and job training',d:'Pell Grants, special education aid, Title I',v:107.6},
 {id:'ag',l:'Agriculture',d:'farm programs',v:52.6},
 {id:'ia',l:'Foreign aid and diplomacy',d:'all international affairs',v:48.0},
 {id:'ot',l:'Everything else',d:'courts, science, parks, disaster aid and more',v:0}];
FED[10].v=+(D-FED.slice(0,10).reduce((a,b)=>a+b.v,0)).toFixed(1);
const GF=16941722229;
const COL=[
 {id:'hc',l:'Medicaid',d:'Health Care Policy and Financing: health coverage for low-income Coloradans',v:5554316022},
 {id:'k12',l:'K-12 schools',d:'state share of public school funding',v:4669994198},
 {id:'he',l:'Colleges and universities',d:'CU, CSU, community colleges, aid',v:1684348869},
 {id:'hs',l:'Human Services',d:'child welfare, mental health, youth services',v:1322641611},
 {id:'cr',l:'Prisons (Corrections)',d:'state prisons and parole',v:1086028946},
 {id:'ju',l:'Courts (Judicial)',d:'courts, probation, public defenders',v:878946616},
 {id:'ec',l:'Early childhood',d:'universal preschool, child care aid',v:318425707},
 {id:'ps',l:'Public Safety',d:'State Patrol, CBI, fire',v:272537258},
 {id:'ot',l:'Everything else',d:'Treasury, Revenue, Natural Resources and more',v:0}];
COL[8].v=GF-COL.slice(0,8).reduce((a,b)=>a+b.v,0);
const FS=id=>{const x=FED.find(o=>o.id===id);return x.v/D;};
const CS=id=>{const x=COL.find(o=>o.id===id);return x.v/GF;};
const T=sim=>Math.max(0,sim.p.salary-F.STD);
const fed=sim=>F.fedTax(T(sim));
const ss=sim=>F.SS*Math.min(sim.p.salary,F.SSCAP),med=sim=>F.MED*sim.p.salary,fam=sim=>F.FAMLI*Math.min(sim.p.salary,F.SSCAP);
const co=sim=>F.coTax(T(sim),sim.p.rules);
const sef=sim=>Math.min(co(sim),T(sim)/300);
const gfPart=sim=>co(sim)-sef(sim);
const total=sim=>fed(sim)+ss(sim)+med(sim)+co(sim)+fam(sim);
const fedTo=(sim,id)=>fed(sim)*FS(id);
const coTo=(sim,id)=>gfPart(sim)*CS(id)+(id==='k12'?sef(sim):0);
const hourly=sim=>sim.p.salary/2080;
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const pc=v=>(Math.round(v*1000)/10).toFixed(1)+'%';
const GUT={mc:'Medicare',int:'Interest on the national debt',df:'Defense',ed:'Education',ia:'Foreign aid'};
const truth=()=>'mc';
const calcAns=sim=>Math.round(fedTo(sim,'int')*100)/100;
const fit=(ctx,s,w,font)=>{ctx.font=font;if(ctx.measureText(s).width<=w)return s;while(s.length>3&&ctx.measureText(s+'…').width>w)s=s.slice(0,-1);return s+'…';};

const SIM={
 id:'taxreceipt',hash:'taxreceipt',apUnit:2,order:2,tab:'Where do my taxes go?',kind:'Simulation',
 skills:{bio:'Percent of a whole: your dollars × each program’s share · Personal Finance (Taxes)',honors:'Proportions and unit rates: shares of a budget, dollars to hours of work · Personal Finance (Taxes)',ap:'Piecewise brackets, then proportional allocation · Personal Finance (Taxes)'},
 card:'Follow your own taxes out of your paycheck. Guess which program gets the most of your federal income tax, then find the dollars yourself.',
 title:'Where do my taxes go? Your own tax receipt',
 lede:{bio:'Five taxes come out of a Colorado paycheck, and each one goes somewhere different. Social Security and Medicare go to trust funds that pay people today. Your income taxes go to the federal and state general funds and are spent on everything else.',
  honors:'A budget is a set of shares. Your federal income tax pays for each program in proportion to that program’s share of spending. Dividing dollars by your hourly pay turns each piece into hours of your work.',
  ap:'Two steps: a piecewise function (the brackets) gives your tax, then proportional allocation splits it. The federal government also spent more than it collected, so part of every program was paid for with borrowed money.'},
 scale:'One single Colorado worker for a year, with the standard deduction. Federal shares are FY2026 spending; Colorado shares are the FY2025-26 General Fund budget.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your pay',
 controls:[
  {id:'who',label:'Your gut: which of these gets the most of your federal income tax?',type:'seg',def:'df',options:Object.keys(GUT).map(k=>({v:k,l:GUT[k]}))},
  {id:'salary',label:'Pay for the year',type:'range',min:10000,max:200000,step:1000,def:55000,unit:' dollars',noGut:true,onChange:clear,help:'$31,533 is full time at Colorado’s $15.16 minimum wage. Below $16,100 you owe no federal income tax, but you still pay Social Security and Medicare.'},
  {id:'view',label:'Follow which tax?',type:'seg',def:'fed',noGut:true,options:[{v:'fed',l:'Federal income tax'},{v:'co',l:'Colorado income tax'}]},
  {id:'rules',label:'Colorado tax rules',type:'seg',def:'2026',noGut:true,onChange:clear,options:[{v:'2026',l:'2026: flat 4.4%'},{v:'2027',l:'2027: Amendment 87 brackets'}],help:'Voters approved Amendment 87 on Nov 3, 2026. It starts with the 2027 tax year.'},
  {id:'reveal',label:'Show where it goes now',type:'toggle',def:false,help:'Normally the dollars appear once you lock in your gut answer.'}
 ],
 actions:[{id:'minwage',label:'Full time at minimum wage',run(sim){BioLab.setValues(sim,{salary:31533});}},{id:'part',label:'Part-time job ($11,825)',run(sim){BioLab.setValues(sim,{salary:11825});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'fed',label:'Federal income tax',unit:'dollars',d:2,min:0,max:null,get:fed},
  {id:'ss',label:'Social Security tax',unit:'dollars',d:2,min:0,max:null,get:ss},
  {id:'med',label:'Medicare tax',unit:'dollars',d:2,min:0,max:null,get:med},
  {id:'co',label:'Colorado income tax',unit:'dollars',d:2,min:0,max:null,get:co},
  {id:'fam',label:'Colorado FAMLI',unit:'dollars',d:2,min:0,max:null,get:fam},
  {id:'total',label:'All five taxes',unit:'dollars',d:2,min:0,max:null,get:total},
  {id:'share',label:'All five as a share of pay',unit:'%',d:1,min:0,max:100,get:sim=>100*total(sim)/sim.p.salary},
  {id:'int',label:'Your income tax to interest on the debt',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?fedTo(sim,'int'):null},
  {id:'mc',label:'Your income tax to Medicare',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?fedTo(sim,'mc'):null},
  {id:'df',label:'Your income tax to defense',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?fedTo(sim,'df'):null},
  {id:'ia',label:'Your income tax to foreign aid',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?fedTo(sim,'ia'):null},
  {id:'k12',label:'Your Colorado tax to K-12 schools',unit:'dollars',d:2,min:0,max:null,get:sim=>coTo(sim,'k12')},
  {id:'hc',label:'Your Colorado tax to Medicaid',unit:'dollars',d:2,min:0,max:null,get:sim=>coTo(sim,'hc')},
  {id:'hInt',label:'Hours of your work that pay debt interest',unit:'h',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?fedTo(sim,'int')/hourly(sim):null},
  {id:'hAll',label:'Hours of your work that pay all five taxes',unit:'h',d:0,lvl:'honors',min:0,max:null,get:sim=>total(sim)/hourly(sim)},
  {id:'spent',label:'Federal spending per $1 collected',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:()=>OUT/REC},
  {id:'a87',label:'Amendment 87 change to your Colorado tax',unit:'dollars',d:2,lvl:'honors',min:null,max:null,get:sim=>F.coTax(T(sim),2027)-F.coTax(T(sim),2026)}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the receipt */
  const RX=14,RW=big?300:292;ctx.fillStyle=PAL['card2'];rr(ctx,RX,10,RW,430,8);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,RX,10,RW,430,8);ctx.stroke();
  txt(ctx,'Your tax receipt',RX+12,34,{s:15*fs,w:700});
  txt(ctx,'Pay '+$(sim.p.salary)+' · taxable '+$(T(sim)),RX+12,34+18*fs,{s:11.5*fs,c:PAL['cv-soft']});
  const rows=[['Federal income tax',fed(sim),'U.S. Treasury: the general fund','s1'],['Social Security',ss(sim),'Trust funds: checks to retirees today','s2'],['Medicare',med(sim),'Trust fund: hospital care, 65+','s6'],['Colorado income tax',co(sim),sim.p.rules==='2027'?'State: Amendment 87 brackets':'State: General Fund and schools','s5'],['Colorado FAMLI',fam(sim),'Paid family and medical leave','s4']];
  let y=34+42*fs;const rh=big?32:50;
  rows.forEach(([n,v,dst,c])=>{ctx.fillStyle=PAL[c];ctx.fillRect(RX+12,y-11*fs,5,(big?14:30)*Math.min(fs,1.2));
   txt(ctx,n,RX+24,y,{s:13*fs,w:700});txt(ctx,$2(v),RX+RW-12,y,{s:13*fs,w:700,a:'right'});
   if(!big)txt(ctx,fit(ctx,dst,RW-40,(400)+' '+(11.5*fs)+'px sans-serif'),RX+24,y+17*fs,{s:11.5*fs,c:PAL['cv-soft']});y+=rh*Math.min(fs,1.1);});
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(RX+12,y-12);ctx.lineTo(RX+RW-12,y-12);ctx.stroke();
  txt(ctx,'Total',RX+24,y+6,{s:14*fs,w:700});txt(ctx,$2(total(sim)),RX+RW-12,y+6,{s:14*fs,w:700,a:'right'});
  txt(ctx,pc(total(sim)/sim.p.salary)+' of your pay',RX+RW-12,y+6+18*fs,{s:12*fs,a:'right',c:PAL['cv-soft']});
  if(!big)txt(ctx,'≈ '+Math.round(total(sim)/hourly(sim))+' hours of your work a year',RX+RW-12,y+6+36*fs,{s:12*fs,a:'right',c:PAL['cv-soft']});
  /* where one tax goes */
  const view=sim.p.view,isF=view==='fed',amt=isF?fed(sim):co(sim);
  const lines=(isF?FED.map(o=>({...o,$:fedTo(sim,o.id)})):COL.map(o=>({...o,$:coTo(sim,o.id)})));
  const hide=isF&&!sh,BX=RX+RW+16,BW=800-BX-14;
  txt(ctx,(isF?'Where your '+$2(amt)+' of federal income tax goes':'Where your '+$2(amt)+' of Colorado income tax goes'),BX,34,{s:14.5*fs,w:700});
  if(isF&&amt<=0){txt(ctx,'Your taxable income is $0, so you owe no federal income tax.',BX,70,{s:13*fs});txt(ctx,'You still pay Social Security and Medicare on every dollar.',BX,92,{s:13*fs,c:PAL['cv-soft']});return;}
  const show=big?lines.slice(0,6):lines,top=56,avail=(isF?360:368),rH=Math.min(34,avail/show.length);
  const sorted=hide?show:show.slice().sort((a,b)=>(a.id==='ot')-(b.id==='ot')||b.$-a.$);
  const mx=Math.max(...lines.map(o=>o.$),1),LW=big?200:186,barX=BX+LW,barW=BW-LW-(big?96:80);
  sorted.forEach((o,i)=>{const yy=top+i*rH+rH*0.62;
   txt(ctx,fit(ctx,o.l,LW-8,'700 '+(12.5*fs)+'px sans-serif'),BX,yy,{s:12.5*fs,w:700});
   if(hide){ctx.fillStyle=PAL['line'];rr(ctx,barX,yy-12,barW*0.5,14,3);ctx.fill();txt(ctx,'?',barX+barW*0.5+8,yy,{s:12.5*fs,w:700,c:PAL['cv-soft']});}
   else{const w=Math.max(2,barW*o.$/mx);ctx.fillStyle=PAL[o.id==='int'?'rj':o.id==='ot'?'muted':isF?'s1':'s5'];rr(ctx,barX,yy-12,w,14,3);ctx.fill();txt(ctx,$2(o.$),barX+w+6,yy,{s:12.5*fs,w:700});}});
  const fy=isF?430:436;
  if(isF){if(sh)txt(ctx,'The government spent $'+(OUT/REC).toFixed(2)+' for every $1 it collected; it borrowed the rest.',BX,fy,{s:12*fs,c:PAL['cv-soft']});
   else txt(ctx,'Lock in your gut to see the dollars.',BX,fy,{s:12.5*fs,c:PAL['cv-soft']});}
  else if(!big)txt(ctx,$2(sef(sim))+' of the K-12 line goes straight to the State Education Fund.',BX,fy,{s:12*fs,c:PAL['cv-soft']});},
 narrate(sim){if(fed(sim)<=0)return `At ${$(sim.p.salary)} your taxable income is $0, so you owe no federal income tax. You still pay ${$2(ss(sim)+med(sim))} of Social Security and Medicare, and those go to trust funds that pay retirees and patients today.`;
  if(!shown(sim))return `You pay ${$2(fed(sim))} of federal income tax. It is split across everything the government pays for except Social Security. <b>Which program gets the biggest piece?</b>`;
  if(sim.p.view==='co')return `Your ${$2(co(sim))} of Colorado income tax: ${$2(coTo(sim,'hc'))} to Medicaid and ${$2(coTo(sim,'k12'))} to K-12 schools, the two biggest lines in the state budget.`;
  return `Of your ${$2(fed(sim))}, the biggest pieces are <b>Medicare (${$2(fedTo(sim,'mc'))})</b> and <b>interest on the debt (${$2(fedTo(sim,'int'))})</b>, each more than defense (${$2(fedTo(sim,'df'))}). Foreign aid gets ${$2(fedTo(sim,'ia'))}.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Pick one: which of these gets the most of your federal income tax? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth()?1:0,who:w,label:GUT[w]};},
  solve(sim){sim.p.who=truth();return {v:1,who:truth(),label:GUT[truth()]};},
  hint:{bio:'Lock in your gut. Then you will find one piece of your tax yourself.'},
  calc:{unit:'$',d:2,tol:1,
   prompt:{bio:sim=>`Your federal income tax is <b>${$2(fed(sim))}</b>. Interest on the national debt is <b>18.36%</b> of the spending your income tax pays for. How many dollars of your tax pay interest?`,
    honors:sim=>`Your federal income tax is <b>${$2(fed(sim))}</b>. Not counting Social Security, the government spent <b>$5,728.7 billion</b>, and <b>$1,051.8 billion</b> of it was interest on the debt. How many dollars of your tax pay interest?`,
    ap:sim=>`Your taxable income is <b>${$(T(sim))}</b>. Use the 2026 brackets (10% to $12,400, 12% to $50,400, 22% to $105,700, 24% to $201,775) to find your federal income tax. Then find your share for interest: $1,051.8B of $5,728.7B.`},
   answer:calcAns,
   hint:{bio:'Change 18.36% to a decimal and multiply.',honors:'Find interest’s share first: 1,051.8 ÷ 5,728.7.',ap:'Tax first, slice by slice. Then multiply by 1,051.8 ÷ 5,728.7.'},
   steps(sim){const out=[];if(atLeast('ap'))F.slices(T(sim)).filter(s=>s.amt>0).forEach(s=>out.push(`${Math.round(s.r*100)}% × ${$(s.amt)} = ${$2(s.tax)}`));
    if(atLeast('ap'))out.push(`Federal income tax: ${$2(fed(sim))}.`);
    out.push(`Interest’s share: 1,051.8 ÷ 5,728.7 = ${(FS('int')).toFixed(4)}, about 18.36%.`);
    out.push(`${$2(fed(sim))} × ${(FS('int')).toFixed(4)} = <b>${$2(fedTo(sim,'int'))}</b>.`);return out;}},
  formula(sim){return `Your piece = your federal income tax × (program ÷ all spending except Social Security)<br>Interest: ${$2(fed(sim))} × 1,051.8 ÷ 5,728.7 = ${$2(fedTo(sim,'int'))}<br>Medicare: ${$2(fed(sim))} × 1,072.6 ÷ 5,728.7 = ${$2(fedTo(sim,'mc'))}<br>Hours of work: ${$2(fedTo(sim,'int'))} ÷ ${$2(hourly(sim))} an hour = ${(fedTo(sim,'int')/hourly(sim)).toFixed(1)} h`;},
  how:{bio:'The math gives each program the same share of your income tax that it has of federal spending, leaving out Social Security, which has its own tax.',
   ap:'Proportional allocation: piece = tax × (line ÷ total). Because the government borrowed about 27% of what it spent, each program also got borrowed money on top of your share.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You found the interest piece yourself.':'';
   const real=` Medicare gets ${$2(fedTo(sim,'mc'))}, interest ${$2(fedTo(sim,'int'))}, defense ${$2(fedTo(sim,'df'))}, education ${$2(fedTo(sim,'ed'))} and foreign aid ${$2(fedTo(sim,'ia'))}.`;
   if(g0.who===m.who)return `Your gut was right: Medicare, just ahead of interest on the debt.`+real+self;
   const why={int:`Interest is a close second, only ${$2(fedTo(sim,'mc')-fedTo(sim,'int'))} behind Medicare.`,df:'Defense is fourth, behind Medicare, interest and Medicaid.',ed:'Federal education is small: most school money is state and local.',ia:'Foreign aid is one of the smallest lines, under 1%.'}[g0.who]||'';
   return `Your gut said <b>${GUT[g0.who]}</b>; the biggest is <b>Medicare</b>. ${why}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.salary=R([31533,42000,55000,68000,85000,120000]);sim.p.who='df';sim.p.reveal=false;sim.p.view='fed';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Your federal income tax is $4,420. Defense is 16.85% of the spending it pays for. To the nearest dollar, how much of your tax goes to defense?',answer:745,tol:0.6,unit:'$',d:0,hint:'Multiply $4,420 by 0.1685.',explain:'$4,420 × 0.1685 ≈ $745.'},
  {lvl:'bio',instant:true,q:'Where does the Social Security tax on your paycheck go?',choices:['Into an account with your name on it','To trust funds that pay benefits to retirees, disabled workers and survivors right now','To the general fund, like income tax'],correct:1,explain:'Social Security is pay-as-you-go: today’s workers pay for today’s benefits. Your own benefit later is figured from your work record, not from an account balance.'},
  {lvl:'bio',instant:true,q:'Colorado’s General Fund spends the most on which two things?',choices:['Prisons and courts','Medicaid and K-12 schools','Roads and parks'],correct:1,explain:'Medicaid (32.8%) and K-12 schools (27.6%) are 60% of the General Fund. Roads come mostly from gas taxes and fees, not the General Fund.'},
  {lvl:'honors',kind:'num',q:'You earn $55,000, about $26.44 an hour. $811.52 of your income tax pays interest on the debt. To one decimal, how many hours of your work is that?',answer:30.7,tol:0.06,unit:'h',d:1,hint:'Divide dollars by dollars per hour.',explain:'$811.52 ÷ $26.44 ≈ 30.7 hours, almost a full work week.'},
  {lvl:'honors',kind:'num',q:'Under Amendment 87, Colorado taxes the first $25,000 of taxable income at 3.7% and the next $75,000 at 4.2%. What is the tax on $62,500?',answer:2500,tol:0.5,unit:'$',d:0,hint:'$25,000 × 0.037, plus $37,500 × 0.042.',explain:'$925 + $1,575 = $2,500, which is $250 less than 4.4% × $62,500 = $2,750. This is the Blue Book’s own example.'},
  {lvl:'ap',kind:'num',q:'In FY2026 the federal government spent $7,395.8B and collected $5,403.3B. To the nearest whole percent, what share of spending was borrowed?',answer:27,tol:0.6,unit:'%',d:0,hint:'(spending − receipts) ÷ spending.',explain:'(7,395.8 − 5,403.3) ÷ 7,395.8 = 1,992.5 ÷ 7,395.8 ≈ 26.9%, about 27%.'},
  {lvl:'ap',instant:true,q:'Amendment 87’s brackets are not adjusted for inflation. If prices and pay both rise 3% a year, what happens over time?',choices:['Nothing changes','More of each worker’s income falls in the higher brackets, so the average rate creeps up','Everyone’s tax falls'],correct:1,explain:'This is “bracket creep.” Federal brackets are indexed to inflation every year; Colorado’s new ones are not, as the Blue Book notes.'}
 ],
 tour:[
  {title:'Your tax receipt',text:'A $55,000 first job. Five taxes come out over the year: $10,581.10, about 19.2% of pay. Each one goes to a different place.',pause:true,setup:sim=>BioLab.setValues(sim,{salary:55000,view:'fed',rules:'2026',reveal:true}),focus:[[10,6,300,438]]},
  {title:'Two trust funds',text:'Social Security ($3,410) and Medicare ($797.50) are not saved for you. They pay today’s retirees, disabled workers and patients. Your future benefit is based on your work record.',pause:true,focus:[[10,90,300,110]]},
  {title:'Your federal income tax',text:'Your $4,420 of federal income tax goes to the general fund. Here it is split the way the government spent money in FY2026, leaving out Social Security, which has its own tax.',pause:true,focus:[[320,10,470,430]]},
  {title:'The surprise',text:'Medicare gets $827.57 and interest on the national debt $811.52. Both are more than defense ($744.70). Foreign aid, which many people guess is large, gets $37.03.',pause:true,focus:[[320,40,470,120]]},
  {title:'Borrowed money',text:'The government spent $7,395.8 billion and collected $5,403.3 billion: $1.37 for every $1 it took in. The rest was borrowed, and borrowing now adds to future interest.',pause:true,focus:[[320,400,470,40]]},
  {title:'Your Colorado tax',text:'Your $1,711.60 of Colorado tax: $565.73 to K-12 schools and $518.63 to Medicaid, the two biggest lines. The schools figure counts $129.67, one-third of one percent of your taxable income, that goes straight to the State Education Fund.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'co'}),focus:[[320,10,470,430]]},
  {title:'Amendment 87',text:'Voters approved Amendment 87 on Nov 3, 2026. Starting in 2027, Colorado uses six brackets: 3.7% on the first $25,000 and 4.2% up to $100,000, rising to 8.4% above $1 million. At $55,000 your Colorado tax drops $202.80, to $1,508.80.',pause:true,setup:sim=>BioLab.setValues(sim,{rules:'2027'})}
 ],
 lab:{bio:'<p><b>Question:</b> How does your tax receipt change as pay grows?</p><ol><li>Turn on <b>Show where it goes now</b>.</li><li>Record a trial at $11,825 (part-time), $31,533 (full-time minimum wage), $55,000 and $120,000.</li><li>For each, write down <b>All five as a share of pay</b> and <b>Your income tax to interest on the debt</b>.</li></ol><p>Which tax is the biggest at low pay? At high pay?</p>',
  honors:'<p><b>Question:</b> How many hours of work pay for each piece?</p><ol><li>At $55,000, record the hours for all five taxes and for debt interest.</li><li>Repeat at $31,533 and $120,000.</li></ol><p>Explain why the hours for income tax rise faster than pay.</p>',
  ap:'<p><b>Question:</b> Who gains and who pays more under Amendment 87?</p><ol><li>Record <b>Amendment 87 change to your Colorado tax</b> at $30,000, $55,000, $120,000 and $200,000.</li><li>Find the pay where the change is largest.</li></ol><p><b>CER:</b> Use the brackets to explain why the savings stop growing at $100,000 of taxable income.</p>'},
 terms:[
  {t:'General fund',d:'The main account a government pays most programs from. Income taxes go here.'},
  {t:'Trust fund',d:'An account set aside by law for one program. Social Security and Medicare payroll taxes go to trust funds.'},
  {t:'Deficit',d:'How much more a government spends than it collects in one year. The federal deficit is borrowed.'},
  {t:'Net interest',d:'Interest the government pays on its debt, minus interest it earns.',lvl:'honors'},
  {t:'Bracket creep',d:'When brackets do not rise with inflation, so a raise that only keeps up with prices pushes more income into higher brackets.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Taxes: 2026 federal brackets and $16,100 standard deduction (IRS Rev. Proc. 2025-32), Social Security 6.2% to $184,500, Medicare 1.45%, Colorado 4.4% of taxable income, FAMLI 0.44%. 2027 Colorado rules: Amendment 87, approved by voters Nov 3, 2026: 3.7% to $25,000, 4.2% to $100,000, 4.4% to $500,000, 7.4% to $750,000, 7.9% to $1,000,000, 8.4% above (2026 Blue Book, Table 1). The tool uses the same taxable income for Colorado as for federal; real Colorado taxable income has a few state adjustments.</p><p><b>Federal split.</b> FY2026 outlays from the Treasury’s Monthly Treasury Statement, table 9, fiscal year ending Sep 30, 2026: total $7,395.8B, receipts $5,403.3B. Your income tax is split in proportion to every line except Social Security ($1,667.1B), the method behind “taxpayer receipts.” “Everything else” ($152.0B) is the remainder.</p><p><b>Colorado split.</b> One-third of one percent of taxable income goes to the State Education Fund (Colorado Constitution, Art. IX, §17). The rest is split by FY2025-26 General Fund operating appropriations, total $16,941,722,229 (Joint Budget Committee, FY 2025-26 Appropriations Report). Amendment 87’s extra revenue goes to a new Colorado Future’s Account for K-12, health care and early childhood; how it is split will be set by the legislature.</p><p><b>What this number hides.</b> Money is fungible: your dollars are not tagged, so “your share” is an average, not a receipt for specific purchases. Medicare’s share is a little high here, because the Medicare payroll tax and premiums pay part of Medicare too. The split also leaves out sales tax, property tax and gas tax, which pay for cities, counties, schools and roads. And one year hides the debt built up before it.</p><p><b>Two views, both held by real people.</b> Some see the receipt as proof that most spending goes to health care and retirement, which will grow as people age. Others see interest on the debt, now bigger than defense, as the line to watch. People also disagree about Amendment 87: supporters say it lowers taxes for most Coloradans and funds schools and health care; opponents say it raises taxes on businesses and high earners and will creep up over time because its brackets do not adjust for inflation. This tool shows the numbers, not a verdict.</p><p><b>This is a simplified model, not tax advice.</b></p>'
};
BioLab.register(SIM);
})();
