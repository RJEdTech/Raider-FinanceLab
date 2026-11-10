(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* A raise and the federal brackets. Taxable income T = salary − $16,100. Tax(T) is piecewise linear (fin.js).
   Take-home change = raise − Δfederal − 4.4%·ΔT − (6.2% + 1.45% + 0.44%)·raise (all under the Social Security cap here). */
const T0=sim=>Math.max(0,sim.p.salary-F.STD),T1=sim=>Math.max(0,sim.p.salary+sim.p.raise-F.STD);
const tax0=sim=>F.fedTax(T0(sim)),tax1=sim=>F.fedTax(T1(sim)),dTax=sim=>tax1(sim)-tax0(sim);
const yearNet=g=>{const c=F.check(g,1,0);return c.net;};
const dNet=sim=>yearNet(sim.p.salary+sim.p.raise)-yearNet(sim.p.salary);
const keepShare=sim=>dNet(sim)/sim.p.raise;
const truth=sim=>dNet(sim)<0?'down':keepShare(sim)<=0.5?'half':'most';
const WHO={down:'Take-home pay goes down',half:'It goes up, by half the raise or less',most:'It goes up, by more than half the raise'};
const pct=v=>(Math.round(v*1000)/10).toFixed(1)+'%';
/* how the raise dollars split across brackets: [{r,amt}] */
function raiseSlices(sim){const a=T0(sim),b=T1(sim),out=[];let lo=0;for(const [hi,r] of F.BR){const s=Math.max(lo,a),e=Math.min(hi,b);if(e>s)out.push({r,amt:e-s});lo=hi;if(b<=hi)break;}return out;}
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const COLS=['s3','s2','s4','s1','s5','s6','muted'];
const calcAns=sim=>atLeast('ap')?Math.round(tax1(sim)*100)/100:Math.round(dTax(sim)*100)/100;

const SIM={
 id:'brackets',hash:'brackets',apUnit:2,order:1,tab:'Can a raise cost me money?',kind:'Simulation',
 skills:{bio:'Percent of a part: tax brackets one slice at a time · Personal Finance (Taxes)',honors:'Marginal and average rates · Personal Finance (Taxes)',ap:'Piecewise linear functions: the bracket table · Personal Finance (Taxes)'},
 card:'A $3,000 raise moves you into the 22% bracket. Guess what happens to your take-home pay, then tax the raise one slice at a time.',
 title:'Can a raise cost me money? How tax brackets really work',
 lede:{bio:'You hear it all the time: “Don’t take the raise, it will push you into a higher bracket.” Brackets work like buckets. Each rate applies only to the dollars that land in its bucket, so a higher rate never touches the dollars you already earned.',
  honors:'Your marginal rate is the rate on your next dollar. Your average (effective) rate is total tax ÷ income. Moving into the 22% bracket raises the marginal rate on the new dollars only, so your average rate creeps up slowly.',
  ap:'Federal tax is a continuous, piecewise linear function of taxable income T: slope 0.10 up to $12,400, then 0.12 to $50,400, then 0.22 to $105,700, and so on. Because it is continuous, a raise can never lower your take-home pay.'},
 scale:'One single filer in 2026, with the $16,100 standard deduction. Take-home pay also counts Colorado tax, Social Security, Medicare and FAMLI.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The raise',
 controls:[
  {id:'who',label:'Your gut: after this raise, your take-home pay…',type:'seg',def:'down',options:[{v:'down',l:WHO.down},{v:'half',l:WHO.half},{v:'most',l:WHO.most}]},
  {id:'salary',label:'Salary before the raise',type:'range',min:30000,max:200000,step:1000,def:65000,unit:' dollars',noGut:true,onChange:clear},
  {id:'raise',label:'The raise, per year',type:'range',min:500,max:20000,step:500,def:3000,unit:' dollars',noGut:true,onChange:clear},
  {id:'reveal',label:'Show the taxes now',type:'toggle',def:false,help:'Normally the taxes appear once you lock in your gut answer.'}
 ],
 actions:[{id:'big',label:'Try a $15,000 raise',lvl:'honors',run(sim){BioLab.setValues(sim,{raise:15000,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'T0',label:'Taxable income before',unit:'dollars',d:0,min:0,max:null,get:T0},
  {id:'T1',label:'Taxable income after',unit:'dollars',d:0,min:0,max:null,get:T1},
  {id:'dTax',label:'Extra federal tax from the raise',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?dTax(sim):null},
  {id:'dNet',label:'Extra take-home pay per year',unit:'dollars',d:2,min:null,max:null,get:sim=>shown(sim)?dNet(sim):null},
  {id:'keep',label:'Share of the raise you keep',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*keepShare(sim):null},
  {id:'m0',label:'Federal rate on the next dollar, before',unit:'%',d:0,lvl:'honors',min:0,max:40,get:sim=>100*F.marginal(T0(sim))},
  {id:'m1',label:'Federal rate on the next dollar, after',unit:'%',d:0,lvl:'honors',min:0,max:40,get:sim=>shown(sim)?100*F.marginal(T1(sim)):null},
  {id:'e0',label:'Average federal rate, before',unit:'%',d:2,lvl:'honors',min:0,max:40,get:sim=>shown(sim)?100*tax0(sim)/sim.p.salary:null},
  {id:'e1',label:'Average federal rate, after',unit:'%',d:2,lvl:'honors',min:0,max:40,get:sim=>shown(sim)?100*tax1(sim)/(sim.p.salary+sim.p.raise):null},
  {id:'tax1',label:'Federal tax for the year, after',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?tax1(sim):null}
 ],
 graphs:[{id:'fn',label:'Federal tax vs. taxable income',custom:true}],defaultGraph:'fn',
 plot(sim,ctx,box){const X=Math.max(120000,T1(sim)*1.15),Y=F.fedTax(X)*1.05;const ax=axes(ctx,box,{xmin:0,xmax:X,ymin:0,ymax:Y,xl:'Taxable income ($)',yl:'Federal tax ($)'});
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=200;i++){const x=X*i/200;const px=ax.X(x),py=ax.Y(F.fedTax(x));i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  F.BR.forEach(([hi])=>{if(hi<X){ctx.strokeStyle=PAL['line'];ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(ax.X(hi),ax.Y(0));ctx.lineTo(ax.X(hi),ax.Y(Y));ctx.stroke();ctx.setLineDash([]);}});
  const dot=(T,c,l)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(ax.X(T),ax.Y(F.fedTax(T)),5,0,7);ctx.fill();if(l)txt(ctx,l,ax.X(T)+8,ax.Y(F.fedTax(T))-8,{s:12,w:700,c});};
  dot(T0(sim),PAL['s4'],'before');if(shown(sim))dot(T1(sim),PAL['rj'],'after');
  legend(ctx,box.L+10,box.T+8,[{label:'Tax(T): no jumps, only bends',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,$(sim.p.salary)+' + '+$(sim.p.raise)+' raise',24,32*Math.min(k,1.2),{s:17*fs,w:700});
  txt(ctx,'Taxable income: '+$(T0(sim))+' → '+$(T1(sim))+' (after the '+$(F.STD)+' standard deduction)',24,56*Math.min(k,1.25),{s:12.5*fs,c:PAL['cv-soft']});
  /* buckets: one column per bracket up to the one that holds the new top dollar */
  const brs=[];let lo=0;for(const [hi,r] of F.BR){brs.push({lo,hi,r});if(T1(sim)<=hi)break;lo=hi;}
  const n=brs.length,gx=24,gw=752,top=(big?92:84)*Math.min(k,1.2),bot=(big?330:300),colW=gw/n-12;
  brs.forEach((B,i)=>{const x=gx+i*(colW+12),cap=B.hi===Infinity?Math.max(T1(sim)-B.lo,1):B.hi-B.lo,f0=clamp((T0(sim)-B.lo)/cap,0,1),f1=clamp((T1(sim)-B.lo)/cap,0,1),H=bot-top;
   ctx.fillStyle=PAL['card2'];rr(ctx,x,top,colW,H,6);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,x,top,colW,H,6);ctx.stroke();
   ctx.fillStyle=PAL[COLS[i]];ctx.globalAlpha=0.85;ctx.fillRect(x+2,bot-H*f0,colW-4,H*f0);ctx.globalAlpha=1;
   if(f1>f0){ctx.fillStyle=PAL['rj'];ctx.globalAlpha=sh?0.9:0.35;ctx.fillRect(x+2,bot-H*f1,colW-4,H*(f1-f0));ctx.globalAlpha=1;}
   txt(ctx,Math.round(B.r*100)+'%',x+colW/2,top+22*fs,{s:18*fs,w:700,a:'center'});
   if(!big)txt(ctx,B.hi===Infinity?'over '+$(B.lo):$(B.lo)+'–'+$(B.hi),x+colW/2,bot+16*fs,{s:11.5*fs,c:PAL['cv-soft'],a:'center'});
   const inB=Math.max(0,Math.min(T1(sim),B.hi)-B.lo);if(sh&&inB>0)txt(ctx,$(inB*B.r)+' tax',x+colW/2,bot+(big?18:34)*fs,{s:12.5*fs,w:700,a:'center',c:PAL['cv-ink']});});
  const yb=(big?390:388);
  if(sh){const sl=raiseSlices(sim).map(s=>$(s.amt)+' × '+Math.round(s.r*100)+'%').join(' + ');
   txt(ctx,(big?'':'The raise is taxed: ')+sl+' = '+$2(dTax(sim)),24,yb,{s:13.5*fs,w:700});
   txt(ctx,'You keep '+$2(dNet(sim))+' of '+$(sim.p.raise)+' ('+pct(keepShare(sim))+') after every tax',24,yb+24*fs,{s:13.5*fs,w:700,c:PAL['s3']});}
  else{txt(ctx,locked(sim)?'Work out the tax on the raise to see the buckets':'Red shows where the raise dollars land. Lock in your gut to see the tax.',24,yb,{s:13*fs,c:PAL['cv-soft']});}
  const G=sim.gutS&&sim.gutS.g;if(G&&!big)pill(ctx,'Your gut: '+(G.label||''),560,30,PAL['card2'],PAL['s4'],12*Math.min(k,1.3));},
 narrate(sim){const sl=raiseSlices(sim);
  if(!shown(sim))return `The raise adds ${$(sim.p.raise)} of taxable income${sl.length>1?`, and some of it lands in the ${Math.round(sl[sl.length-1].r*100)}% bracket`:''}. <b>What happens to your take-home pay?</b>`;
  return `Only the raise dollars are taxed at the new rates: ${sl.map(s=>$(s.amt)+' at '+Math.round(s.r*100)+'%').join(' and ')}. The dollars you already earned are taxed exactly as before, so you <b>keep ${$2(dNet(sim))}</b> of the ${$(sim.p.raise)} raise.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Pick one here: after the raise, what happens to your take-home pay for the year? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth(sim)?1:0,who:w,label:WHO[w]};},
  solve(sim){const t=truth(sim);sim.p.who=t;return {v:1,who:t,label:WHO[t]};},
  hint:{bio:'Lock in your gut. Then you will figure the federal tax on the raise yourself.'},
  calc:{unit:'$',d:2,tol:1,
   prompt:{bio:sim=>{const sl=raiseSlices(sim);return `Only the new dollars are taxed at the new rate. Of the ${$(sim.p.raise)} raise, ${sl.map(s=>`<b>${$(s.amt)}</b> lands in the ${Math.round(s.r*100)}% bracket`).join(' and ')}. How much more federal tax does the raise cost?`;},
    ap:sim=>`After the raise, taxable income is <b>${$(T1(sim))}</b>. Use the 2026 brackets for a single filer (10% to $12,400, 12% to $50,400, 22% to $105,700, 24% to $201,775, 32% to $256,225, then 35%) to find the federal tax for the whole year.`},
   answer:calcAns,
   hint:{bio:'Multiply each part of the raise by its rate, then add.',ap:'Tax each slice at its own rate: 10% of the first $12,400, 12% of the next $38,000, and so on, then add.'},
   steps(sim){if(atLeast('ap')){const out=F.slices(T1(sim)).filter(s=>s.amt>0).map(s=>`${Math.round(s.r*100)}% × ${$(s.amt)} = ${$2(s.tax)}`);out.push(`Total: <b>${$2(tax1(sim))}</b>. Before the raise it was ${$2(tax0(sim))}, so the raise costs ${$2(dTax(sim))}.`);return out;}
    const sl=raiseSlices(sim),out=sl.map(s=>`${$(s.amt)} × ${Math.round(s.r*100)}% = ${$2(s.amt*s.r)}`);out.push(`Extra federal tax: <b>${$2(dTax(sim))}</b>. The dollars you earned before the raise are taxed the same as before.`);return out;}},
  formula(sim){const sl=raiseSlices(sim),c0=F.check(sim.p.salary,1,0),c1=F.check(sim.p.salary+sim.p.raise,1,0);
   return `Federal on the raise: ${sl.map(s=>$(s.amt)+' × '+Math.round(s.r*100)+'%').join(' + ')} = ${$2(dTax(sim))}<br>Colorado, FICA and FAMLI on the raise: ${$2((c1.st-c0.st)+(c1.ss-c0.ss)+(c1.med-c0.med)+(c1.fam-c0.fam))}<br>Kept: ${$(sim.p.raise)} − ${$2(sim.p.raise-dNet(sim))} = ${$2(dNet(sim))} (${pct(keepShare(sim))})`;},
  how:{bio:'The math taxes only the raise dollars, each at the rate of the bucket it lands in. The money you already earned is taxed exactly as before.',
   ap:'Tax(T) is continuous and increasing, so Tax(T + Δ) − Tax(T) < Δ whenever every rate is below 100%. A raise always adds take-home pay.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You taxed the raise yourself, slice by slice.':'';
   const real=` In real terms: the raise adds ${$2(dTax(sim))} of federal tax and ${$2(sim.p.raise-dNet(sim)-dTax(sim))} of other taxes, and you keep ${$2(dNet(sim))} a year, about ${$2(dNet(sim)/12)} a month.`;
   if(g0.who===m.who)return `Your gut was right: ${WHO[m.who].toLowerCase()}.`+real+self;
   return `Your gut said <b>${WHO[g0.who].toLowerCase()}</b>; the math says <b>${WHO[m.who].toLowerCase()}</b>. ${g0.who==='down'?'A higher bracket taxes only the dollars inside it, so the raise can never shrink your pay.':'Even the new, higher rate leaves most of each new dollar with you.'}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.salary=R([45000,58000,64000,65000,98000,104000,118000]);sim.p.raise=R([1000,2000,3000,4000,5000,8000]);sim.p.who='down';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A raise adds $2,000 of taxable income, all of it in the 22% bracket. How much more federal tax is that?',answer:440,tol:0.5,unit:'$',d:0,hint:'Multiply $2,000 by 0.22.',explain:'$2,000 × 0.22 = $440. The other $1,560 of federal room stays with you, before state and payroll taxes.'},
  {lvl:'bio',instant:true,q:'Jordan’s raise pushes some income into the 22% bracket. Which dollars are taxed at 22%?',choices:['All of Jordan’s income','Only the dollars above $50,400 of taxable income','Only the dollars below $50,400'],correct:1,explain:'Each rate applies only to the income inside its bracket. The first $12,400 is still taxed at 10% and the next $38,000 at 12%.'},
  {lvl:'bio',instant:true,q:'Can a raise ever lower your take-home pay because of a federal tax bracket?',choices:['Yes, if it puts you in a new bracket','No: a higher rate applies only to the new dollars, and every rate is below 100%','Only for raises over $10,000'],correct:1,explain:'Because only the extra dollars are taxed at the higher rate, and that rate is far below 100%, more income always means more take-home pay from the brackets.'},
  {lvl:'honors',kind:'num',q:'Taxable income of $51,900 owes $6,130 of federal tax, on a $68,000 salary. To one decimal, what is the average federal rate on the salary?',answer:9.0,tol:0.06,unit:'%',d:1,hint:'Divide $6,130 by $68,000.',explain:'$6,130 ÷ $68,000 ≈ 9.0%, far below the 22% marginal rate.'},
  {lvl:'honors',instant:true,q:'Your marginal rate is 22% and your average rate is 9%. A side job pays $1,000 more. About how much more federal tax do you owe?',choices:['$90','$220','$1,000'],correct:1,explain:'Extra income is taxed at your marginal rate: $1,000 × 22% = $220. The average rate describes the whole year, not the next dollar.'},
  {lvl:'ap',kind:'num',q:'Write the 2026 tax for taxable income T between $50,400 and $105,700 as Tax(T) = 5,800 + 0.22(T − 50,400). What is Tax(80,000)?',answer:12312,tol:0.5,unit:'$',d:0,hint:'80,000 − 50,400 = 29,600.',explain:'5,800 + 0.22 × 29,600 = 5,800 + 6,512 = $12,312.'},
  {lvl:'ap',instant:true,q:'Why is Tax(T) a continuous function, with no jump at $50,400?',choices:['Each piece starts at the tax already owed at the end of the last piece','Congress rounds the brackets','It is not continuous: it jumps by 10%'],correct:0,explain:'$5,800 is exactly 10% × $12,400 + 12% × $38,000, the tax at the top of the 12% bracket. Each piece picks up where the last one ended, so the graph bends but never jumps.'}
 ],
 tour:[
  {title:'The worry',text:'You earn $65,000 and get a $3,000 raise. Taxable income goes from $48,900 to $51,900, across the $50,400 line into the 22% bracket.',pause:true,setup:sim=>BioLab.setValues(sim,{salary:65000,raise:3000,reveal:true})},
  {title:'Brackets are buckets',text:'The first $12,400 fills the 10% bucket. The next $38,000 fills the 12% bucket. Only what overflows lands in the 22% bucket.',pause:true,focus:[0,70,800,280]},
  {title:'Where the raise lands',text:'Of the $3,000 raise, $1,500 fills the rest of the 12% bucket and $1,500 lands in the 22% bucket.',pause:true,focus:[0,70,800,280]},
  {title:'Tax on the raise',text:'$1,500 × 12% + $1,500 × 22% = $180 + $330 = $510 more federal tax. Your first $48,900 is taxed exactly as before: $5,620.',pause:true},
  {title:'Everything else',text:'Colorado (4.4%), FICA (7.65%) and FAMLI (0.44%) take another $374.70. You keep $2,115.30 of the $3,000, 70.5%.',pause:true,focus:[0,370,800,80]},
  {title:'The graph',text:'Plot tax against taxable income. The line gets steeper at each bracket, but it never jumps, so more income always means more take-home pay.',pause:true},
  {lvl:'honors',title:'Two rates',text:'After the raise, your rate on the next dollar is 22%, but your average federal rate is $6,130 ÷ $68,000 ≈ 9.0%.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much of a raise do you keep?</p><ol><li>Turn on <b>Show the taxes now</b>. Keep the raise at $3,000.</li><li>Record a trial at salaries of $40,000, $65,000, $100,000, $125,000 and $190,000.</li><li>For each, write down <b>Share of the raise you keep</b>.</li></ol><p>Does it ever drop below half? Explain why not.</p>',
  honors:'<p><b>Question:</b> How do the two rates move?</p><ol><li>Start at $50,000 with a $500 raise. Record the next-dollar rate and the average rate.</li><li>Repeat at $70,000, $120,000 and $200,000.</li></ol><p>Explain why the average rate is always below the next-dollar rate.</p>',
  ap:'<p><b>Question:</b> What is the slope of Tax(T)?</p><ol><li>For four raises of $500 at different salaries, record the extra federal tax.</li><li>Divide by $500 to get the slope.</li></ol><p><b>CER:</b> Connect each slope to a bracket rate, and explain why the function is continuous.</p>'},
 terms:[
  {t:'Tax bracket',d:'A range of taxable income taxed at one rate. Each rate applies only to the income inside its range.'},
  {t:'Progressive tax',d:'A tax whose rate rises as income rises, one bracket at a time.'},
  {t:'Taxable income',d:'Income minus deductions. For most young workers that is pay minus the $16,100 standard deduction.'},
  {t:'Marginal rate',d:'The rate on your next dollar of income.',lvl:'honors'},
  {t:'Average (effective) rate',d:'Total tax ÷ total income.',lvl:'honors'},
  {t:'Piecewise linear function',d:'A function made of straight pieces with different slopes; the tax function’s slopes are the bracket rates.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> 2026 federal brackets and standard deduction for a single filer (IRS Rev. Proc. 2025-32): 10% to $12,400, 12% to $50,400, 22% to $105,700, 24% to $201,775, 32% to $256,225, 35% to $640,600, then 37%. Take-home pay also subtracts Colorado’s 4.4% of taxable income, Social Security (6.2% up to $184,500), Medicare (1.45%) and Colorado FAMLI (0.44%).</p><p><b>What this number hides.</b> Some benefits phase out as income rises, such as the Earned Income Tax Credit and some student aid. Those can take more than the bracket rate from a raise, for a while. The brackets alone never can.</p><p><b>How good is this number?</b> The brackets are exact for 2026. A real return may include other income, credits or itemized deductions.</p><p><b>This is a simplified model, not tax advice.</b></p>'
};
BioLab.register(SIM);
})();
