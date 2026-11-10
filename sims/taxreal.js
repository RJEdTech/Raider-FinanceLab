(function(){
'use strict';
const {txt,rr,PAL,atLeast}=BioLab.h;
const F=window.FIN,$=F.money;
/* Brackets on paper vs. what people really pay. IRS Statistics of Income, tax year 2023 (filed in 2024), as summarized by
   the Tax Foundation, "Summary of the Latest Federal Income Tax Data, Tax Year 2023" (Table 1): returns, AGI ($ millions)
   and income taxes paid ($ millions) by percentile; the groups here are differences of the cumulative rows.
   Income taxes paid exclude the refundable part of credits (Tax Foundation).
   Paper rate: the group's average AGI minus the 2023 standard deduction, run through the 2023 brackets
   (IRS Rev. Proc. 2022-38), as if all of it were ordinary wage income. */
const TOT={t1:[1530764,3134629,823411],t5:[7653822,5534636,1271576],t10:[15307644,7233902,1512724],t25:[38269111,10413281,1850817],t50:[76538222,13323863,2074501],b50:[76538222,1873007,69911]};
const d=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const GR={b50:{l:'Bottom 50%',s:'Bottom half',cut:'AGI under $53,801',row:TOT.b50},g50:{l:'Next 25%',s:'50th–75th',cut:'$53,801 to $105,604',row:d(TOT.t50,TOT.t25)},
 g25:{l:'Next 15%',s:'75th–90th',cut:'$105,604 to $187,608',row:d(TOT.t25,TOT.t10)},g10:{l:'Next 5%',s:'90th–95th',cut:'$187,608 to $272,209',row:d(TOT.t10,TOT.t5)},
 g5:{l:'Next 4%',s:'95th–99th',cut:'$272,209 to $675,602',row:d(TOT.t5,TOT.t1)},t1:{l:'Top 1%',s:'Top 1%',cut:'AGI over $675,602',row:TOT.t1}};
const KEYS=Object.keys(GR);
const BR={single:{std:13850,b:[[11000,.10],[44725,.12],[95375,.22],[182100,.24],[231250,.32],[578125,.35],[Infinity,.37]],l:'single filer'},
 mfj:{std:27700,b:[[22000,.10],[89450,.12],[190750,.22],[364200,.24],[462500,.32],[693750,.35],[Infinity,.37]],l:'married couple filing jointly'}};
const btax=(T,b)=>{let t=0,lo=0;T=Math.max(0,T);for(const [hi,r] of b){if(T>lo)t+=(Math.min(T,hi)-lo)*r;lo=hi;if(T<=hi)break;}return t;};
const marg=(T,b)=>{if(T<=0)return 0;for(const [hi,r] of b)if(T<=hi)return r;return .37;};
const avgAGI=k=>GR[k].row[1]*1e6/GR[k].row[0],avgTax=k=>GR[k].row[2]*1e6/GR[k].row[0];
const real=k=>100*GR[k].row[2]/GR[k].row[1];
const fl=sim=>BR[sim.p.filing]||BR.mfj;
const taxable=(sim,k)=>Math.max(0,avgAGI(k)-fl(sim).std);
const paperTax=(sim,k)=>btax(taxable(sim,k),fl(sim).b);
const paper=(sim,k)=>100*paperTax(sim,k)/avgAGI(k);
const top=(sim,k)=>100*marg(taxable(sim,k),fl(sim).b);
const g=sim=>GR[sim.p.group]?sim.p.group:'t1';
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const touring=sim=>!!(sim.tour&&sim.tour.on);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const p1=v=>(Math.round(v*10)/10).toFixed(1)+'%';
const p2=v=>(Math.round(v*100)/100).toFixed(2)+'%';
const calcAns=sim=>atLeast('ap')?Math.round(paper(sim,g(sim))*10)/10:Math.round(real(g(sim))*100)/100;

const SIM={
 id:'taxreal',hash:'taxreal',apUnit:2,order:4,tab:'Brackets vs. what people really pay',kind:'Simulation',
 skills:{bio:'Percent of a whole: tax ÷ income, for real IRS totals · Personal Finance (Taxes)',honors:'Marginal vs. average rates, and why they differ · Personal Finance (Taxes)',ap:'Piecewise brackets vs. observed averages: modeling and its limits · Personal Finance (Taxes)'},
 card:'The top bracket is 37%. What did the top 1% really pay? Compare what the brackets say on paper with what each income group actually paid, from IRS data.',
 title:'What SHOULD happen vs. what REALLY happens: income tax by income group',
 lede:{bio:'On paper, the federal brackets run from 10% to 37%. But nobody pays their top rate on all their income, and many people pay less than the brackets alone would say. The IRS counts what every income group actually paid. Compare the two.',
  honors:'Your top bracket (marginal rate) is the rate on your last dollar. Your average rate is total tax ÷ income. Deductions, credits and lower rates on some kinds of income pull the average rate further below what the brackets alone would give.',
  ap:'The paper model assumes all income is ordinary wage income taxed through one bracket schedule after the standard deduction. Real returns mix filing statuses, deductions, credits, and capital gains taxed at 0%, 15% or 20%. The gap between model and data measures what the model leaves out.'},
 scale:'All 153.1 million federal income tax returns for tax year 2023 (filed in 2024), split into six income groups.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Compare',
 controls:[
  {id:'guess',label:'Your gut: what average federal income tax rate did this group really pay in 2023?',type:'range',min:0,max:40,step:0.5,def:30,unit:'%'},
  {id:'group',label:'Income group',type:'seg',def:'t1',noGut:true,onChange:clear,options:KEYS.map(k=>({v:k,l:GR[k].l}))},
  {id:'filing',label:'Paper brackets for a',type:'seg',def:'mfj',noGut:true,options:[{v:'mfj',l:'Married couple filing jointly'},{v:'single',l:'Single filer'}],help:'Real returns mix singles, couples and heads of household. Try both.'},
  {id:'reveal',label:'Show what each group really paid',type:'toggle',def:false,help:'Normally the real rates appear once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'agi',label:'Average income (AGI) in the group',unit:'dollars',d:0,min:0,max:null,get:sim=>avgAGI(g(sim))},
  {id:'top',label:'Top bracket the group reaches, on paper',unit:'%',d:0,min:0,max:40,get:sim=>top(sim,g(sim))},
  {id:'paper',label:'Average rate the brackets give, on paper',unit:'%',d:2,min:0,max:40,get:sim=>paper(sim,g(sim))},
  {id:'real',label:'Average rate really paid (IRS)',unit:'%',d:2,min:0,max:40,get:sim=>shown(sim)?real(g(sim)):null},
  {id:'gap',label:'Paper minus real',unit:'points',d:2,min:null,max:null,get:sim=>shown(sim)?paper(sim,g(sim))-real(g(sim)):null},
  {id:'avgTax',label:'Average income tax per return (IRS)',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?avgTax(g(sim)):null},
  {id:'shareTax',label:'Group’s share of all income tax paid',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?100*GR[g(sim)].row[2]/2144411:null},
  {id:'shareAGI',label:'Group’s share of all income (AGI)',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>100*GR[g(sim)].row[1]/15196869}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3,G0=g(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,'Income tax as a share of income, 2023',20,26,{s:14.5*fs,w:700});
  {let x=big?20:440;const ly=big?36:14;[['Brackets on paper','s1'],['Really paid (IRS)','s3']].forEach(([l,c])=>{ctx.fillStyle=PAL[c];ctx.fillRect(x,ly,12,12);txt(ctx,l,x+16,ly+10,{s:11.5*fs});ctx.font='400 '+(11.5*fs)+'px sans-serif';x+=16+ctx.measureText(l).width+18;});
   if(!big){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.beginPath();ctx.moveTo(x,ly+6);ctx.lineTo(x+18,ly+6);ctx.stroke();ctx.setLineDash([]);txt(ctx,'Top bracket',x+22,ly+10,{s:11.5*fs});}}
  const L=60,R=780,T=58,B=big?330:350,Y=v=>B-(B-T)*v/40;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let v=0;v<=40;v+=10){ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();txt(ctx,v+'%',L-8,Y(v)+4,{s:11*fs,a:'right',c:PAL['cv-soft']});}
  const cw=(R-L)/6,bw=Math.min(36,cw*0.3);
  KEYS.forEach((kk,i)=>{const cx=L+cw*(i+0.5),sel=kk===G0;
   if(sel){ctx.fillStyle=PAL['card2'];rr(ctx,cx-cw/2+4,T-6,cw-8,B-T+12,6);ctx.fill();}
   const pv=paper(sim,kk),rv=real(kk),tp=top(sim,kk);
   ctx.fillStyle=PAL['s1'];ctx.globalAlpha=sel?1:0.55;ctx.fillRect(cx-bw-3,Y(pv),bw,B-Y(pv));
   if(sh){ctx.fillStyle=PAL['s3'];ctx.fillRect(cx+3,Y(rv),bw,B-Y(rv));}else{ctx.fillStyle=PAL['line'];ctx.fillRect(cx+3,Y(20),bw,B-Y(20));}
   ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.beginPath();ctx.moveTo(cx-cw/2+10,Y(tp));ctx.lineTo(cx+cw/2-10,Y(tp));ctx.stroke();ctx.setLineDash([]);
   if(!big)txt(ctx,tp+'%',cx+cw/2-12,Y(tp)-4,{s:10.5*fs,a:'right',c:PAL['cv-soft']});
   txt(ctx,p1(pv),cx-bw/2-3,Y(pv)-5,{s:11*fs,w:700,a:'center'});
   txt(ctx,sh?p1(rv):'?',cx+bw/2+3,(sh?Y(rv):Y(20))-5,{s:11*fs,w:700,a:'center',c:sh?PAL['s3']:PAL['cv-soft']});
   txt(ctx,GR[kk].l,cx,B+18*fs,{s:12*fs,w:sel?700:400,a:'center'});
   if(!big)txt(ctx,'avg '+$(avgAGI(kk)),cx,B+34*fs,{s:11*fs,a:'center',c:PAL['cv-soft']});});
  const fy=big?420:428;
  txt(ctx,sh?GR[G0].l+' ('+GR[G0].cut+'): brackets say '+p1(paper(sim,G0))+', really paid '+p1(real(G0))+'.':'Paper brackets for a '+fl(sim).l+'. Lock in your gut to see what each group really paid.',20,fy,{s:12.5*fs,w:sh?700:400,c:sh?PAL['cv-ink']:PAL['cv-soft']});},
 narrate(sim){const G0=g(sim),G1=GR[G0];
  if(!shown(sim))return `${G1.l} (${G1.cut}): average income ${$(avgAGI(G0))}. On paper, as a ${fl(sim).l}, the brackets reach ${top(sim,G0)}% and give an average rate of ${p1(paper(sim,G0))}. <b>What did they really pay?</b>`;
  return `${G1.l}: the brackets say <b>${p1(paper(sim,G0))}</b> on average (top bracket ${top(sim,G0)}%), and the group <b>really paid ${p2(real(G0))}</b>, about ${$(avgTax(G0))} per return. ${G0==='t1'?'The biggest reason at the top: long-term capital gains and qualified dividends are taxed at 20% at most, not 37%.':G0==='b50'?'At the bottom, credits like the Child Tax Credit and EITC wipe out much of the tax; many owe none.':'Deductions, credits and lower rates on investment income explain the gap.'}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Set the slider to the average federal income tax rate you think this group really paid in 2023. Then lock it in.'},
  lock(sim){const t=real(g(sim));return {v:Math.abs(sim.p.guess-t),guess:sim.p.guess,label:sim.p.guess+'%'};},
  solve(sim){const t=real(g(sim));sim.p.guess=Math.round(t*2)/2;return {v:Math.abs(sim.p.guess-t),guess:sim.p.guess,label:p1(t)};},
  hint:{bio:'Lock in your gut. Then you will work out the real rate from the IRS totals.'},
  calc:{unit:'%',d:2,tol:0.02,
   prompt:{bio:sim=>{const G0=g(sim),r=GR[G0].row;return `In tax year 2023, the ${GR[G0].l.toLowerCase()} group reported <b>$${r[1].toLocaleString('en-US')} million</b> of income (AGI) and paid <b>$${r[2].toLocaleString('en-US')} million</b> of federal income tax. What was its average tax rate?`;},
    ap:sim=>{const G0=g(sim),b=fl(sim);return `The average return in the ${GR[G0].l.toLowerCase()} group had <b>${$(avgAGI(G0))}</b> of AGI. Take away the 2023 standard deduction for a ${b.l} (${$(b.std)}) and run the rest through the 2023 brackets (${b.b.slice(0,6).map(x=>Math.round(x[1]*100)+'% to '+$(x[0])).join(', ')}, then 37%). What average rate does that give, to one decimal?`;}},
   answer:calcAns,
   hint:{bio:'Divide tax by income, then turn the decimal into a percent.',ap:'Tax each slice at its own rate, add them, then divide by AGI (not by taxable income).'},
   steps(sim){const G0=g(sim),r=GR[G0].row;if(atLeast('ap')){const b=fl(sim),T=taxable(sim,G0),out=[`Taxable: ${$(avgAGI(G0))} − ${$(b.std)} = ${$(T)}.`];let lo=0;for(const [hi,rt] of b.b){if(T>lo)out.push(`${Math.round(rt*100)}% × ${$(Math.min(T,hi)-lo)} = ${$(rt*(Math.min(T,hi)-lo))}`);lo=hi;if(T<=hi)break;}out.push(`Total ${$(paperTax(sim,G0))} ÷ ${$(avgAGI(G0))} = <b>${p1(paper(sim,G0))}</b>, on paper. The IRS says ${p2(real(G0))}.`);return out;}
    return [`${r[2].toLocaleString('en-US')} ÷ ${r[1].toLocaleString('en-US')} = ${(r[2]/r[1]).toFixed(4)}.`,`As a percent: <b>${p2(real(G0))}</b>. On paper the brackets give ${p1(paper(sim,G0))}.`];}},
  formula(sim){const G0=g(sim);return `Really paid = income tax ÷ AGI = ${p2(real(G0))}<br>On paper = bracket tax on (${$(avgAGI(G0))} − ${$(fl(sim).std)}) ÷ ${$(avgAGI(G0))} = ${p1(paper(sim,G0))}<br>Gap: ${(paper(sim,G0)-real(G0)).toFixed(1)} percentage points`;},
  how:{bio:'The real rate is just the group’s total income tax divided by its total income, both counted by the IRS from every return.',
   ap:'The paper model treats all income as wages taxed through one schedule. Real returns include capital gains at lower rates, deductions above the standard one, credits and other filing statuses, so the data sits below the model at most incomes.'},
  compare(sim,g0,m){const G0=g(sim),t=real(G0),K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the real rate yourself.':'';
   const off=Math.abs(g0.guess-t);
   return `Your gut said ${g0.guess}%; the ${GR[G0].l.toLowerCase()} really paid <b>${p2(t)}</b> (${off<1.5?'very close':off<4?'close':'off by '+off.toFixed(1)+' points'}). Their top bracket on paper is ${top(sim,G0)}%, and the brackets alone would give ${p1(paper(sim,G0))}.`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.group=R(KEYS);sim.p.guess=R([10,15,20,25,30,35]);sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In 2023 the bottom half of taxpayers reported $1,873,007 million of income and paid $69,911 million of federal income tax. To two decimals, what was their average rate?',answer:3.73,tol:0.011,unit:'%',d:2,hint:'Divide tax by income.',explain:'69,911 ÷ 1,873,007 ≈ 0.0373, or 3.73%.'},
  {lvl:'bio',instant:true,q:'The top bracket is 37%, but the top 1% paid an average of 26.3%. Which is the biggest reason?',choices:['They all cheat','Much of their income is long-term capital gains and dividends, taxed at 20% at most','The 37% bracket does not exist'],correct:1,explain:'Investment income held over a year is taxed at 0%, 15% or 20% (plus 3.8% on high incomes), well below the 37% wage bracket. Deductions and the bracket math (only the top dollars are taxed at 37%) also lower the average.'},
  {lvl:'bio',instant:true,q:'Does this data count Social Security and Medicare taxes?',choices:['Yes','No: it is federal income tax only','Only for the top 1%'],correct:1,explain:'These are income taxes only. Most lower-income workers pay more in payroll tax (7.65% of wages) than in income tax.'},
  {lvl:'honors',kind:'num',q:'In 2023 the top 1% earned 20.6% of all income and paid 38.4% of all income tax. How many times its share of income is its share of tax? (two decimals)',answer:1.86,tol:0.011,unit:'',d:2,hint:'38.4 ÷ 20.6.',explain:'38.4 ÷ 20.6 ≈ 1.86: the top 1%’s share of income tax is almost twice its share of income.'},
  {lvl:'honors',instant:true,q:'A couple’s top bracket is 24%. Why is their average rate far lower?',choices:['Only their last dollars are taxed at 24%; the first ones are taxed at 0%, 10% and 12%','They pay 24% on everything','Brackets do not apply to couples'],correct:0,explain:'The standard deduction is taxed at 0%, then each slice at its own rate. The average is a blend of all the slices.'},
  {lvl:'ap',instant:true,q:'For the bottom half, the paper model for a married couple gives 0%, but the IRS says 3.7%. What does that tell you about the model?',choices:['The IRS is wrong','Many bottom-half filers are single, with a smaller standard deduction and lower bracket limits, so one schedule cannot describe the group','Couples pay no tax'],correct:1,explain:'A group average mixes filing statuses. Switch the paper brackets to single: the model gives about 4.3%, closer to the data.'},
  {lvl:'ap',instant:true,q:'The top 0.001% (AGI over $78.6 million) paid an average of 23.6% in 2023, less than the top 1% (26.3%). What best explains the dip?',choices:['A larger share of their income is capital gains and dividends, taxed at lower rates','They are in a lower bracket','They have more children'],correct:0,explain:'At the very top, more income comes from selling assets and from dividends than from wages, and those are taxed at 20% at most (plus 3.8%).'}
 ],
 tour:[
  {title:'Six income groups',text:'The IRS counted all 153.1 million returns for 2023. Here they are in six groups, from the bottom half (income under $53,801) to the top 1% (over $675,602). Red is what the brackets alone would charge a married couple at each group’s average income.',pause:true,setup:sim=>BioLab.setValues(sim,{filing:'mfj',group:'t1',reveal:false})},
  {title:'The top bracket',text:'The dashed line is the top bracket each group reaches on paper. The top 1% reach 37%. But even on paper their average is 33.1%, because only the top dollars are taxed at 37%.',pause:true},
  {title:'What they really paid',text:'Green is what each group really paid. The top 1% paid 26.3% on average: about $537,909 per return, and 38.4% of all federal income tax. That is 6.8 points below the paper rate.',pause:true,setup:sim=>BioLab.setValues(sim,{reveal:true})},
  {title:'Why the gap at the top',text:'Most of it is how investment income is taxed. Long-term capital gains and qualified dividends pay 0%, 15% or 20% (plus 3.8% at high incomes), not 37%. Deductions for charity, retirement and business income add to it.',pause:true},
  {title:'The middle',text:'For the middle groups, the couple’s brackets on paper land close to what people really paid: 7.1% vs. 7.7%, and 10.8% vs. 10.6%. Credits for children and retirement savings pull the real rate down; single filers in the group push it up.',pause:true,setup:sim=>BioLab.setValues(sim,{group:'g50'})},
  {title:'The bottom half',text:'The bottom half paid 3.7% on average, 3.3% of all income tax. On paper a couple there owes nothing; a single filer, 4.3%. Credits like the Child Tax Credit and EITC take many to zero. This is income tax only: they still pay 7.65% in payroll tax on wages.',pause:true,setup:sim=>BioLab.setValues(sim,{group:'b50'})},
  {title:'Still progressive',text:'Even after the gap, the rate rises at every step: 3.7%, 7.7%, 10.6%, 14.2%, 18.7%, 26.3%. What should happen and what really happens differ, but higher incomes still pay higher average rates.',pause:true,setup:sim=>BioLab.setValues(sim,{group:'t1'})}
 ],
 lab:{bio:'<p><b>Question:</b> How far is “on paper” from “really paid”?</p><ol><li>Turn on <b>Show what each group really paid</b>.</li><li>Record a trial for each of the six groups with married brackets, then again with single brackets.</li></ol><p>Which group has the biggest gap? Why?</p>',
  honors:'<p><b>Question:</b> Who pays what share?</p><ol><li>For each group, record its share of income and its share of income tax.</li><li>Divide tax share by income share for each.</li></ol><p>Explain what a ratio above 1 and below 1 means.</p>',
  ap:'<p><b>Question:</b> How good is the paper model?</p><ol><li>For each group, record paper vs. real under both filing statuses.</li><li>Find which status fits each group better.</li></ol><p><b>CER:</b> Name two things the model leaves out, and predict which groups each one affects most.</p>'},
 terms:[
  {t:'Adjusted gross income (AGI)',d:'Total income minus a few adjustments, like some retirement contributions. The IRS sorts returns by AGI.'},
  {t:'Marginal rate (top bracket)',d:'The rate on your last dollar of taxable income.'},
  {t:'Average (effective) rate',d:'Total income tax ÷ income.'},
  {t:'Capital gain',d:'Profit from selling something you own, like stock. Held over a year, it is taxed at 0%, 15% or 20%.',lvl:'honors'},
  {t:'Refundable credit',d:'A credit that can be paid out even when you owe no tax, like part of the Child Tax Credit and the EITC.',lvl:'honors'},
  {t:'Model vs. data',d:'A model predicts from rules; data records what happened. The gap shows what the model leaves out.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> IRS Statistics of Income, tax year 2023 (returns filed in 2024), as summarized by the Tax Foundation, “Summary of the Latest Federal Income Tax Data, Tax Year 2023,” Table 1: 153,076,443 returns, $15,196,869 million of AGI, $2,144,411 million of income tax. The six groups are differences of the cumulative rows (for example, “Next 4%” = top 5% minus top 1%). Income taxes paid exclude the refundable part of credits, so the real rates for lower groups would be lower still if refunds were counted. The top 0.001% (1,531 returns over $78.6 million) paid 23.6%.</p><p><b>Paper model.</b> Each group’s average AGI minus the 2023 standard deduction ($13,850 single, $27,700 married filing jointly), taxed through the 2023 brackets (IRS Rev. Proc. 2022-38) as if it were all wage income. Real groups mix singles, couples and heads of household, and a group average hides a wide range of returns.</p><p><b>What this number hides.</b> This is federal income tax only. Payroll taxes (Social Security and Medicare, 7.65% of wages for workers, plus the employer’s match) are a bigger tax than income tax for most lower- and middle-income workers. State and local taxes, sales taxes and corporate taxes are also left out. Income from unsold investments is not taxed until it is sold, so it never shows up in AGI.</p><p><b>Two views, both held by real people.</b> Some point out that the top 1% pay 38.4% of all income tax on 20.6% of the income, and that average rates rise at every step, so the system is strongly progressive. Others point out that the very top pay a lower average rate than the rest of the top 1%, and that lower rates on investment income favor people with wealth over people who earn wages. This tool shows the numbers, not a verdict.</p><p><b>This is a simplified model for learning, not tax advice.</b></p>'
};
BioLab.register(SIM);
})();
