(function(){
'use strict';
const {txt,rr,PAL,atLeast}=BioLab.h;
const F=window.FIN,$=F.money;
/* Taxes around the world: what do taxes buy?
   Pay and taxes: OECD Taxing Wages 2026 (2025 tax year), worker at 100% of the average wage, US dollars at purchasing power
   parity (PPP). Single, no children: gross, net take-home (after income tax and employee social contributions), tax wedge and
   total labour cost. Family: married, two children, one earner at the average wage: net take-home including cash benefits.
   Health: OECD Health at a Glance 2025, health spending per person in 2024, USD PPP, split into government and compulsory
   schemes vs. voluntary insurance and out-of-pocket. (OECD counts most U.S. private insurance as compulsory under the ACA.)
   U.S. premiums: KFF 2025 Employer Health Benefits Survey: average premium $9,325 single / $26,993 family; worker pays
   $1,440 / $6,850. The OECD U.S. worker pays federal, Michigan and Detroit taxes. */
const C={
 us:{a:'American',n:'United States',s:'U.S.',g:73520,net:55644,fam:63885,w:30.0,lc:79466,hc:12402,ho:2483,prem:1440,premF:6850,epS:7885,epF:20143,
  health:'Most workers get insurance through a job and pay part of the premium. Medicare covers people 65+; Medicaid covers many low-income people.',
  college:'$11,950 a year, public 4-year in-state (College Board, 2025-26)'},
 ca:{a:'Canadian',n:'Canada',s:'Canada',g:81745,net:60811,fam:69797,w:32.1,lc:89590,hc:5125,ho:2176,prem:0,premF:0,epS:0,epF:0,
  health:'Each province’s public insurance pays for doctors and hospitals. Many people buy private coverage for drugs, dental and vision.',
  college:'CAD 7,734 a year on average for Canadian undergraduates (Statistics Canada, 2025-26)'},
 uk:{a:'British',n:'United Kingdom',s:'U.K.',g:82329,net:63277,fam:66597,w:32.4,lc:93576,hc:5486,ho:1262,prem:0,premF:0,epS:0,epF:0,
  health:'The NHS is paid for mostly from taxes and is free when you use it. England charges a small fee per prescription.',
  college:'Up to £9,790 a year in England (2026-27), paid with a government loan you repay only once you earn over a set amount'},
 de:{a:'German',n:'Germany',s:'Germany',g:93985,net:57634,fam:73946,w:49.3,lc:113595,hc:8080,ho:1285,prem:0,premF:0,epS:0,epF:0,
  health:'Workers pay a health insurance contribution out of each paycheck (it is inside the 38.7%). About 9 in 10 people are in the public system.',
  college:'No tuition at public universities for most students; a semester fee of a few hundred euros'},
 dk:{a:'Danish',n:'Denmark',s:'Denmark',g:88454,net:57205,fam:65329,w:35.8,lc:89045,hc:5900,ho:1171,prem:0,premF:0,epS:0,epF:0,
  health:'Health care is paid for from taxes; doctor visits and hospital care are free when you use them.',
  college:'No tuition for Danish and EU students, plus a monthly living grant (SU) for students'},
 jp:{a:'Japanese',n:'Japan',s:'Japan',g:59729,net:46203,fam:49468,w:33.1,lc:69083,hc:4908,ho:882,prem:0,premF:0,epS:0,epF:0,
  health:'Everyone is in public health insurance, paid through paycheck contributions. Patients pay 30% of most bills, with a monthly cap.',
  college:'¥535,800 a year standard at national universities; some charge up to ¥642,960'}};
const ORDER=['us','ca','uk','de','dk','jp'];
const fam=sim=>sim.p.hh==='fam';
const people=sim=>fam(sim)?4:1;
const net=(sim,k)=>fam(sim)?C[k].fam:C[k].net;
const health=(sim,k)=>C[k].ho*people(sim)+(fam(sim)?C[k].premF:C[k].prem);
const left=(sim,k)=>net(sim,k)-health(sim,k);
const taxP=(sim,k)=>100*(1-net(sim,k)/C[k].g);
const healthP=(sim,k)=>100*health(sim,k)/C[k].g;
const leftP=(sim,k)=>100*left(sim,k)/C[k].g;
const wedge=(sim,k)=>100*(C[k].lc-net(sim,k))/C[k].lc;
const empExtra=(sim,k)=>C[k].lc-C[k].g+(fam(sim)?C[k].epF:C[k].epS);
const vs=sim=>sim.p.vs;
const truth=sim=>{const d=leftP(sim,'us')-leftP(sim,vs(sim));return Math.abs(d)<=2?'tie':d>0?'us':'them';};
const WHO={us:'The U.S. worker keeps more',them:'The other worker keeps more',tie:'About the same (within 2 points)'};
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const p1=v=>(Math.round(v*10)/10).toFixed(1)+'%';
const hhWord=sim=>fam(sim)?'a married worker with two children (one earner)':'a single worker';
const calcAns=sim=>atLeast('ap')?Math.round(wedge(sim,vs(sim))*10)/10:Math.round(leftP(sim,vs(sim))*10)/10;
const wrap=(ctx,s,x,y,w,lh,o)=>{ctx.font=(o.w||400)+' '+o.s+'px sans-serif';const words=s.split(' ');let line='',yy=y;for(const wd of words){const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,yy,o);line=wd;yy+=lh;}else line=t;}if(line)txt(ctx,line,x,yy,o);return yy;};

const SIM={
 id:'taxworld',hash:'taxworld',apUnit:2,order:3,tab:'Taxes around the world',kind:'Simulation',
 skills:{bio:'Percent of a whole and subtracting costs: what is left of pay · Personal Finance (Taxes)',honors:'Percents of different bases and purchasing power parity · Personal Finance (Taxes)',ap:'Ratios with different denominators: the tax wedge · Personal Finance (Taxes)'},
 card:'Germany and Denmark take a bigger bite of a paycheck than the U.S. Count health care too, and guess who keeps more.',
 title:'Taxes around the world: what do they buy?',
 lede:{bio:'Every rich country taxes paychecks, but they buy different things with the money. In some countries taxes pay for health care and college. In the U.S., workers pay a big share of health care themselves, through premiums and bills. To compare fairly, count both.',
  honors:'These dollars are PPP dollars: each country’s money is converted at purchasing power parity, the rate that makes the same basket of goods cost the same. So a PPP dollar buys about the same amount everywhere, and “cost of living” is already built in.',
  ap:'The tax wedge is (labour cost − take-home pay) ÷ labour cost. It counts the employer’s contributions too, which never show up on a pay stub but are part of what the job costs.'},
 scale:'One worker earning the country’s average wage in 2025, in U.S. dollars adjusted for prices (PPP).',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Compare',
 controls:[
  {id:'who',label:'Your gut: after taxes and health care costs, who keeps the bigger share of pay?',type:'seg',def:'us',options:Object.keys(WHO).map(k=>({v:k,l:WHO[k]}))},
  {id:'vs',label:'Compare the U.S. with',type:'seg',def:'de',noGut:true,onChange:clear,options:ORDER.slice(1).map(k=>({v:k,l:C[k].n}))},
  {id:'hh',label:'Household',type:'seg',def:'single',noGut:true,onChange:clear,options:[{v:'single',l:'Single, no children'},{v:'fam',l:'Married, two children, one earner'}]},
  {id:'view',label:'Show',type:'seg',def:'keep',noGut:true,options:[{v:'keep',l:'What is left of pay'},{v:'buys',l:'What taxes buy'}]},
  {id:'reveal',label:'Show health costs now',type:'toggle',def:false,help:'Normally the health costs appear once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'usTax',label:'U.S.: taxes as a share of pay',unit:'%',d:1,min:0,max:100,get:sim=>taxP(sim,'us')},
  {id:'vsTax',label:'Other country: taxes as a share of pay',unit:'%',d:1,min:0,max:100,get:sim=>taxP(sim,vs(sim))},
  {id:'usHealth',label:'U.S.: health costs paid directly',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?health(sim,'us'):null},
  {id:'vsHealth',label:'Other country: health costs paid directly',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?health(sim,vs(sim)):null},
  {id:'usLeft',label:'U.S.: share of pay left',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?leftP(sim,'us'):null},
  {id:'vsLeft',label:'Other country: share of pay left',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?leftP(sim,vs(sim)):null},
  {id:'gap',label:'U.S. minus other country, share left',unit:'points',d:1,min:null,max:null,get:sim=>shown(sim)?leftP(sim,'us')-leftP(sim,vs(sim)):null},
  {id:'usEmp',label:'U.S.: employer pays on top of the wage',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>empExtra(sim,'us')},
  {id:'vsEmp',label:'Other country: employer pays on top of the wage',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>empExtra(sim,vs(sim))},
  {id:'usWedge',label:'U.S. tax wedge',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>wedge(sim,'us')},
  {id:'vsWedge',label:'Other country tax wedge',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>wedge(sim,vs(sim))}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3,V=vs(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(sim.p.view==='buys'){
   txt(ctx,'What taxes buy: health care and college',20,30,{s:15*fs,w:700});
   const keys=['us',V],cw=372;keys.forEach((kk,i)=>{const x=20+i*(cw+16),c=C[kk];ctx.fillStyle=PAL['card2'];rr(ctx,x,44,cw,396,8);ctx.fill();ctx.strokeStyle=kk==='us'?PAL['rj']:PAL['s1'];ctx.lineWidth=2;rr(ctx,x,44,cw,396,8);ctx.stroke();
    txt(ctx,c.n,x+14,72,{s:16*fs,w:700});
    txt(ctx,'Health spending per person, 2024',x+14,98,{s:12.5*fs,w:700,c:PAL['cv-soft']});
    const tot=c.hc+c.ho,bw=cw-28,sc=bw/15000;ctx.fillStyle=PAL['s1'];ctx.fillRect(x+14,106,c.hc*sc,16);ctx.fillStyle=PAL['s5'];ctx.fillRect(x+14+c.hc*sc,106,c.ho*sc,16);
    txt(ctx,$(c.hc)+' through taxes or required insurance',x+14,140,{s:12*fs});txt(ctx,'+ '+$(c.ho)+' paid directly = '+$(tot),x+14,158*Math.min(fs,1.06),{s:12*fs,w:700});
    let y=wrap(ctx,c.health,x+14,186,cw-28,17*fs,{s:12.5*fs})+30;
    txt(ctx,'Public college',x+14,y,{s:12.5*fs,w:700,c:PAL['cv-soft']});wrap(ctx,c.college,x+14,y+20,cw-28,17*fs,{s:12.5*fs});});
   return;}
  txt(ctx,'Average-wage worker, '+(fam(sim)?'married, 2 children':'single'),20,28,{s:15*fs,w:700});
  if(!big)txt(ctx,'Share of gross pay, in PPP dollars',20,48,{s:12*fs,c:PAL['cv-soft']});
  {let x=big?20:400;const ly=big?44:16;[['Taxes','s1'],['Health costs paid directly','s5'],['Left to spend','s3']].forEach(([l,c])=>{ctx.fillStyle=PAL[c];ctx.fillRect(x,ly,12,12);txt(ctx,l,x+16,ly+10,{s:11.5*fs});ctx.font='400 '+(11.5*fs)+'px sans-serif';x+=16+ctx.measureText(l).width+18;});}
  const top=72,rh=58,LX=150,BW=520;
  ORDER.forEach((kk,i)=>{const y=top+i*rh,c=C[kk],hi=kk==='us'||kk===V;
   txt(ctx,c.n,20,y+18,{s:13.5*fs,w:hi?700:400,c:hi?PAL['cv-ink']:PAL['cv-soft']});
   if(!big)txt(ctx,'Pay '+$(c.g),20,y+36,{s:11.5*fs,c:PAL['cv-soft']});
   const t=taxP(sim,kk),h=healthP(sim,kk),l=100-t-h;ctx.globalAlpha=hi?1:0.45;
   ctx.fillStyle=PAL['s1'];ctx.fillRect(LX,y+4,BW*t/100,26);
   if(sh){ctx.fillStyle=PAL['s5'];ctx.fillRect(LX+BW*t/100,y+4,BW*h/100,26);ctx.fillStyle=PAL['s3'];ctx.fillRect(LX+BW*(t+h)/100,y+4,BW*l/100,26);}
   else{ctx.fillStyle=PAL['line'];ctx.fillRect(LX+BW*t/100,y+4,BW*(100-t)/100,26);}
   ctx.globalAlpha=1;if(hi){ctx.strokeStyle=kk==='us'?PAL['rj']:PAL['cv-ink'];ctx.lineWidth=2;ctx.strokeRect(LX,y+4,BW,26);}
   txt(ctx,p1(t),LX+6,y+22,{s:12*fs,w:700,c:'#fff'});
   txt(ctx,sh?p1(sh?leftP(sim,kk):0)+' left':'?',LX+BW+10,y+22,{s:13*fs,w:700,c:hi?PAL['cv-ink']:PAL['cv-soft']});});
  const fy=top+6*rh+14;
  txt(ctx,sh?'U.S. '+p1(leftP(sim,'us'))+' vs. '+C[V].n+' '+p1(leftP(sim,V))+' of pay left after taxes and direct health costs':'Taxes only so far. Lock in your gut to add health costs.',20,fy,{s:12.5*fs,w:sh?700:400,c:sh?PAL['cv-ink']:PAL['cv-soft']});},
 narrate(sim){const V=vs(sim),c=C[V];
  if(sim.p.view==='buys')return `In the U.S., ${$(C.us.hc)} per person goes through taxes and required insurance and ${$(C.us.ho)} more is paid directly. In ${c.n}, ${$(c.hc)} and ${$(c.ho)}.`;
  if(!shown(sim))return `Taxes take ${p1(taxP(sim,'us'))} of an average U.S. paycheck and ${p1(taxP(sim,V))} in ${c.n}, for ${hhWord(sim)}. <b>Now count health care costs that people pay directly. Who keeps more?</b>`;
  return `After taxes and direct health costs, the U.S. worker keeps <b>${p1(leftP(sim,'us'))}</b> of pay and the ${c.a} worker <b>${p1(leftP(sim,V))}</b>. The U.S. worker pays ${$(health(sim,'us'))} for health care directly; the ${c.a} worker ${$(health(sim,V))}.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Pick one: once health care costs people pay directly are counted, who keeps the bigger share of pay? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth(sim)?1:0,who:w,label:WHO[w]};},
  solve(sim){const t=truth(sim);sim.p.who=t;return {v:1,who:t,label:WHO[t]};},
  hint:{bio:'Lock in your gut. Then you will work out one country’s share yourself.'},
  calc:{unit:'%',d:1,tol:0.1,
   prompt:{bio:sim=>{const V=vs(sim),c=C[V];return `In ${c.n}, ${hhWord(sim)} earns <b>${$(c.g)}</b> and takes home <b>${$(net(sim,V))}</b> after taxes. They pay about <b>${$(health(sim,V))}</b> a year for health care directly. What percent of gross pay is left?`;},
    ap:sim=>{const V=vs(sim),c=C[V];return `In ${c.n}, the job costs the employer <b>${$(c.lc)}</b> in all (wage plus employer contributions). The worker (${hhWord(sim)}) takes home <b>${$(net(sim,V))}</b>. What is the tax wedge, as a percent of labour cost?`;}},
   answer:calcAns,
   hint:{bio:'Subtract health costs from take-home pay, then divide by gross pay.',ap:'(labour cost − take-home) ÷ labour cost.'},
   steps(sim){const V=vs(sim),c=C[V];if(atLeast('ap'))return [`${$(c.lc)} − ${$(net(sim,V))} = ${$(c.lc-net(sim,V))}.`,`${$(c.lc-net(sim,V))} ÷ ${$(c.lc)} = <b>${p1(wedge(sim,V))}</b>.`];
    return [`Left: ${$(net(sim,V))} − ${$(health(sim,V))} = ${$(left(sim,V))}.`,`${$(left(sim,V))} ÷ ${$(c.g)} = <b>${p1(leftP(sim,V))}</b>.`];}},
  formula(sim){const V=vs(sim);return `Share left = (take-home − health costs paid directly) ÷ gross pay<br>U.S.: (${$(net(sim,'us'))} − ${$(health(sim,'us'))}) ÷ ${$(C.us.g)} = ${p1(leftP(sim,'us'))}<br>${C[V].n}: (${$(net(sim,V))} − ${$(health(sim,V))}) ÷ ${$(C[V].g)} = ${p1(leftP(sim,V))}`;},
  how:{bio:'The math subtracts both taxes and the health costs people pay out of pocket or through their share of premiums, then compares what is left.',
   ap:'Each share uses its own country’s gross pay as the base, and PPP dollars, so the percents compare across countries.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the share yourself.':'';const V=vs(sim);
   const real=` Taxes alone: U.S. ${p1(taxP(sim,'us'))}, ${C[V].n} ${p1(taxP(sim,V))}. With health costs: U.S. keeps ${p1(leftP(sim,'us'))}, ${C[V].n} ${p1(leftP(sim,V))}.`;
   if(g0.who===m.who)return `Your gut was right: ${WHO[m.who].replace('The other worker','the '+C[V].a+' worker').toLowerCase()}.`+real+self;
   return `Your gut said <b>${WHO[g0.who].toLowerCase()}</b>; the numbers say <b>${WHO[m.who].replace('The other worker','the '+C[V].a+' worker').toLowerCase()}</b>.`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.vs=R(ORDER.slice(1));sim.p.hh=R(['single','fam']);sim.p.who='us';sim.p.reveal=false;sim.p.view='keep';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'An average U.S. worker earns $73,520 and takes home $55,644. To one decimal, what percent of pay goes to income tax and payroll tax?',answer:24.3,tol:0.06,unit:'%',d:1,hint:'(gross − take-home) ÷ gross.',explain:'$73,520 − $55,644 = $17,876. $17,876 ÷ $73,520 ≈ 24.3%.'},
  {lvl:'bio',instant:true,q:'Germany takes 38.7% of an average paycheck; the U.S. takes 24.3%. What does that comparison leave out?',choices:['Nothing: Germans just pay more','What the taxes buy, like health insurance, which German workers pay for inside that 38.7%','The exchange rate'],correct:1,explain:'German workers’ health insurance contribution comes out of the paycheck as part of the 38.7%. Most U.S. workers pay a premium share on top of their taxes. A fair comparison counts both.'},
  {lvl:'bio',instant:true,q:'For a married worker with two children, which country leaves the smallest share of pay after taxes and direct health costs?',choices:['Germany','Denmark','The United States'],correct:2,explain:'U.S. 64.1%, Denmark 68.6%, Germany 73.2%. U.S. families pay about $6,850 a year toward a work-based family premium, plus out-of-pocket costs.'},
  {lvl:'honors',kind:'num',q:'A U.S. employer pays $5,946 in payroll taxes on top of a $73,520 wage, plus $7,885 toward the worker’s health premium. What is the employer’s total extra cost?',answer:13831,tol:0.5,unit:'$',d:0,hint:'Add the two.',explain:'$5,946 + $7,885 = $13,831, more than the $5,946 the OECD counts, because the U.S. employer premium is not a tax.'},
  {lvl:'honors',instant:true,q:'Why use PPP dollars instead of exchange rates?',choices:['They make the numbers bigger','A PPP dollar buys about the same basket of goods in each country, so cost of living is built in','Banks require it'],correct:1,explain:'Purchasing power parity converts each currency at the rate that makes a basket of goods cost the same, so $1 means about the same amount of stuff everywhere.'},
  {lvl:'ap',kind:'num',q:'A German job costs the employer $113,595; the worker takes home $57,634. To one decimal, what is the tax wedge?',answer:49.3,tol:0.06,unit:'%',d:1,hint:'(labour cost − take-home) ÷ labour cost.',explain:'($113,595 − $57,634) ÷ $113,595 = $55,961 ÷ $113,595 ≈ 49.3%.'},
  {lvl:'ap',instant:true,q:'The U.S. wedge is 30.0% and Germany’s 49.3%. Why might the U.S. figure understate what a U.S. job really costs beyond take-home pay?',choices:['The U.S. employer’s share of the health premium is not a tax, so it is not in the wedge','The U.S. has no payroll tax','The wedge includes sales tax'],correct:0,explain:'Adding the $7,885 average employer premium for single coverage to the U.S. labour cost would raise the gap between what the job costs and what the worker keeps.'}
 ],
 tour:[
  {title:'Taxes alone',text:'An average single worker. Taxes take 24.3% of pay in the U.S. and 38.7% in Germany. On taxes alone, the U.S. worker keeps much more.',pause:true,setup:sim=>BioLab.setValues(sim,{vs:'de',hh:'single',view:'keep',reveal:false})},
  {title:'What the taxes buy',text:'In Germany, that 38.7% includes health insurance. In the U.S., the average worker also pays $1,440 a year toward a work-based premium, and Americans pay $2,483 per person out of pocket or through voluntary insurance.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'buys'})},
  {title:'Count both',text:'Subtract taxes and direct health costs. U.S.: 70.3% left. Germany: 60.0%. The gap shrinks from 14.4 points to 10.4, but the single U.S. worker still keeps more.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'keep',reveal:true})},
  {title:'Now a family',text:'Switch to a married worker with two children. Germany pays family benefits, and the U.S. family premium share is $6,850. Now Germany leaves 73.2% and the U.S. 64.1%.',pause:true,setup:sim=>BioLab.setValues(sim,{hh:'fam'})},
  {title:'Six countries',text:'For families, the U.S. leaves the smallest share of the six. For single workers, it is in the middle: ahead of Germany and Denmark, behind Japan, the U.K. and Canada.',pause:true},
  {title:'College',text:'Taxes buy college too. Public tuition is $11,950 a year in the U.S., none for most students in Germany and Denmark, and about £9,790 in England, paid with a government loan.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'buys',vs:'dk'})}
 ],
 lab:{bio:'<p><b>Question:</b> Which countries leave a worker the most to spend?</p><ol><li>Turn on <b>Show health costs now</b>.</li><li>For each country, record a trial and write down the share of pay left, single and family.</li></ol><p>Which country moves the most when you switch to a family? Why?</p>',
  honors:'<p><b>Question:</b> What does a job cost the employer?</p><ol><li>For each country, record <b>employer pays on top of the wage</b>.</li><li>Compare the U.S. with and without the employer premium.</li></ol><p>Explain why a pay stub hides part of what a job costs.</p>',
  ap:'<p><b>Question:</b> How do the wedge and the share left differ?</p><ol><li>For each country, record the tax wedge and the share left.</li><li>Rank the countries both ways.</li></ol><p><b>CER:</b> Explain why the two rankings differ, using what each measure counts.</p>'},
 terms:[
  {t:'Average wage',d:'The OECD’s average full-time pay in each country, used so the countries compare a typical worker.'},
  {t:'Out-of-pocket cost',d:'Health care money you pay yourself: copays, deductibles, things insurance does not cover.'},
  {t:'Premium',d:'What you pay each month for health insurance, whether or not you use care.'},
  {t:'Purchasing power parity (PPP)',d:'A conversion rate that makes the same basket of goods cost the same in each country.',lvl:'honors'},
  {t:'Tax wedge',d:'(Total labour cost − take-home pay) ÷ total labour cost, counting employer contributions.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Pay, take-home and tax wedges: OECD <i>Taxing Wages 2026</i> (2025 tax year), worker at 100% of the average wage, USD PPP. Take-home is after income tax and employee social security contributions, plus cash benefits for the family. The OECD’s U.S. worker pays federal, Michigan and Detroit taxes; a Colorado worker at the same pay keeps a little more (see the paycheck tool). Health: OECD <i>Health at a Glance 2025</i>, 2024 spending per person in USD PPP, split into government and compulsory schemes and voluntary or out-of-pocket spending. U.S. premiums: KFF 2025 Employer Health Benefits Survey ($9,325 single, $26,993 family; workers pay $1,440 and $6,850). Tuition: College Board (U.S. 2025-26), Statistics Canada (2025-26), U.K. Department for Education fee cap (2026-27), Japan education ministry standard; Germany and Denmark: public tuition rules.</p><p><b>What this number hides.</b> Direct health costs here are national averages per person, and older people use far more care than a young family does, so real costs for any one family vary a lot. The OECD counts most U.S. private insurance as “compulsory” because of the ACA, so the U.S. “through taxes or required insurance” bar includes employer insurance. Sales taxes and VAT are left out: the U.S. has no national sales tax (Colorado’s state rate is 2.9%), while standard VAT rates are 19% in Germany, 25% in Denmark, 20% in the U.K., 10% in Japan and 5% federal GST in Canada. Wait times, choice of doctor, wages, job growth and quality differ too, and no single number captures them.</p><p><b>Two views, both held by real people.</b> Supporters of higher-tax systems point to universal health coverage, low-cost college and family benefits, so fewer people face big bills. Supporters of lower-tax systems point to higher take-home pay for single workers, more choice in how to spend it, and faster growth in wages and new businesses. This tool shows the trade-off, not a verdict.</p><p><b>This is a simplified model for learning.</b></p>'
};
BioLab.register(SIM);
})();
