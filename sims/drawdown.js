(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* Losses and gains are not symmetric. After a drop d, the value is V(1 − d); getting back to V needs a gain g with (1 − d)(1 + g) = 1,
   so g = d ÷ (1 − d). At a steady yearly return r, that takes ln(1/(1 − d)) ÷ ln(1 + r) years. */
const CR={
 '2008':{d:56.8,l:'2007–09 financial crisis',when:'Oct 9, 2007 to Mar 9, 2009',back:'about 4 years after the bottom (March 2013)'},
 '2020':{d:33.9,l:'2020 COVID crash',when:'Feb 19 to Mar 23, 2020',back:'about 5 months after the bottom (August 2020)'},
 '2022':{d:25.4,l:'2022 bear market',when:'Jan 3 to Oct 12, 2022',back:'about 15 months after the bottom (January 2024)'},
 custom:{d:null,l:'Choose your own drop'}};
const dPct=sim=>sim.p.crash==='custom'?sim.p.drop:CR[sim.p.crash].d;
const d=sim=>dPct(sim)/100;
const need=sim=>100*d(sim)/(1-d(sim));
const after=sim=>F.r2(sim.p.amt*(1-d(sim)));
const yrs=sim=>Math.log(1/(1-d(sim)))/Math.log(1+sim.p.r/100);
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const p1=v=>(Math.round(v*10)/10).toFixed(1)+'%';
const calcAns=sim=>atLeast('ap')?Math.round(yrs(sim)*100)/100:atLeast('honors')?Math.round(need(sim)*100)/100:after(sim);

const SIM={
 id:'drawdown',hash:'drawdown',apUnit:4,order:3,tab:'Down 50%, up 50%: even?',kind:'Simulation',
 skills:{bio:'Percent decrease and percent increase · Personal Finance (Investing and recessions)',honors:'Percent change as a multiplier: (1 − d)(1 + g) = 1 · Personal Finance (Investing and recessions)',ap:'Exponential growth: solving for time with logarithms · Personal Finance (Investing and recessions)'},
 card:'An index fund falls 56.8%, as the S&P 500 did in 2007–09. Guess the gain it needs just to get back to even, then let percent change do the math.',
 title:'Down 56.8%: what does it take to get back to even?',
 lede:{bio:'A loss and a gain of the same percent do not cancel. A drop takes a percent of a big number; the climb back takes a percent of a smaller one, so the gain needed is bigger than the loss.',
  honors:'Write each change as a multiplier: a 56.8% drop multiplies by 0.432. To get back, you need a multiplier of 1 ÷ 0.432 ≈ 2.315, a gain of 131.5%.',
  ap:'If the investment grows r a year after the bottom, getting back takes t years with (1 + r)ᵗ = 1 ÷ (1 − d), so t = ln(1 ÷ (1 − d)) ÷ ln(1 + r). Real recoveries have often been faster than a steady 7% would suggest, and some have been slower.'},
 scale:'An S&P 500 index fund, price only (closing values, without dividends). Real recoveries are bumpy.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The drop',
 controls:[
  {id:'guess',label:'Your gut: what gain does it need to get back to even?',type:'range',min:0,max:200,step:1,def:57,unit:'%'},
  {id:'crash',label:'Which drop?',type:'seg',def:'2008',noGut:true,onChange:clear,options:Object.keys(CR).map(k=>({v:k,l:CR[k].l}))},
  {id:'drop',label:'Your own drop',type:'range',min:5,max:65,step:1,def:50,unit:'%',noGut:true,onChange:clear,help:'Used when “Choose your own drop” is picked.'},
  {id:'amt',label:'Money in the fund at the top',type:'range',min:1000,max:50000,step:1000,def:10000,unit:' dollars',noGut:true,onChange:clear},
  {id:'r',label:'Steady yearly growth after the bottom',type:'range',min:3,max:12,step:0.5,def:7,unit:'%',d:1,lvl:'ap',noGut:true,onChange:clear},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,help:'Normally it appears once you lock in your gut answer.'}
 ],
 actions:[{id:'half',label:'Try a 50% drop',run(sim){BioLab.setValues(sim,{crash:'custom',drop:50,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'drop',label:'The drop',unit:'%',d:1,min:0,max:100,get:dPct},
  {id:'after',label:'Value at the bottom',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?after(sim):null},
  {id:'need',label:'Gain needed to get back to even',unit:'%',d:1,min:0,max:null,get:sim=>shown(sim)?need(sim):null},
  {id:'mult',label:'Multiplier needed: 1 ÷ (1 − drop)',unit:'×',d:3,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?1/(1-d(sim)):null},
  {id:'yrs',label:'Years to get back at a steady rate',unit:'years',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?yrs(sim):null},
  {id:'hist',label:'What really happened',text:true,get:sim=>sim.p.crash==='custom'?'A made-up drop':`${CR[sim.p.crash].when}; back to the old high ${CR[sim.p.crash].back}`}
 ],
 graphs:[{id:'curve',label:'Gain needed vs. size of the drop',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:0,xmax:70,ymin:0,ymax:240,xl:'Drop (%)',yl:'Gain needed (%)'});
  ctx.strokeStyle=PAL['line'];ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(70),ax.Y(70));ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();for(let x=0;x<=70;x+=0.5){const g=100*x/(100-x);const px=ax.X(x),py=ax.Y(Math.min(g,240));x?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  if(shown(sim)){ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(dPct(sim)),ax.Y(need(sim)),5,0,7);ctx.fill();}
  legend(ctx,box.L+10,box.T+8,[{label:'Gain needed = d ÷ (1 − d)',color:PAL['s2']},{label:'Same percent as the drop',color:PAL['line'],dash:true}]);},
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3,A=sim.p.amt,a=after(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,sim.p.crash==='custom'?'A '+dPct(sim)+'% drop':CR[sim.p.crash].l+': down '+p1(dPct(sim)),24,32*Math.min(k,1.2),{s:17*fs,w:700});
  const B=370,T=80*Math.min(k,1.1),sc=(B-T)/A,bw=big?150:120,xs=big?[60,320,580]:[60,250,440];
  const bar=(x,v,col,top,bot)=>{ctx.fillStyle=PAL[col];rr(ctx,x,B-v*sc,bw,v*sc,6);ctx.fill();txt(ctx,top,x+bw/2,B-v*sc-10,{s:15*fs,w:700,a:'center'});txt(ctx,bot,x+bw/2,B+20*fs,{s:13*fs,a:'center',c:PAL['cv-soft']});};
  bar(xs[0],A,'s2',$(A),'At the top');
  if(stg>=2)bar(xs[1],a,'s1',sh||!locked(sim)?$(a):'?',sim.p.crash==='custom'?'At the bottom':'At the bottom');
  ctx.strokeStyle=PAL['line'];ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(xs[0],B-A*sc);ctx.lineTo(xs[2]+bw,B-A*sc);ctx.stroke();ctx.setLineDash([]);
  if(sh&&stg>=2&&!big){txt(ctx,'−'+p1(dPct(sim)),(xs[0]+bw+xs[1])/2,B-(A+a)/2*sc,{s:13,w:700,a:'center',c:PAL['s1']});txt(ctx,'of '+$(A),(xs[0]+bw+xs[1])/2,B-(A+a)/2*sc+16,{s:12,a:'center',c:PAL['s1']});if(stg===2){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(xs[0]+bw+4,B-(A+a)/2*sc-18,xs[1]-xs[0]-bw-8,42);}}
  if(stg<3){}
  else if(sh){ctx.fillStyle=PAL['s1'];rr(ctx,xs[2],B-a*sc,bw,a*sc,6);ctx.fill();ctx.fillStyle=PAL['s3'];ctx.fillRect(xs[2],B-A*sc,bw,(A-a)*sc);
   txt(ctx,'+'+p1(need(sim))+' of '+$(a),xs[2]+bw/2,B-A*sc-10,{s:15*fs,w:700,a:'center',c:PAL['s3']});txt(ctx,'Back to even',xs[2]+bw/2,B+20*fs,{s:13*fs,a:'center',c:PAL['cv-soft']});
   if(stg===3){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.strokeRect(xs[2]-4,B-A*sc-30,bw+8,(A-a)*sc+34);}
   if(stg===4&&!big){const y=432;txt(ctx,'Same '+$(A-a)+' both ways: '+p1(dPct(sim))+' of '+$(A)+', but '+p1(need(sim))+' of '+$(a),24,y,{s:15,w:700,c:PAL['rj']});}}
  else{txt(ctx,'+ ? %',xs[2]+bw/2,B-A*sc-10,{s:15*fs,w:700,a:'center',c:PAL['cv-soft']});txt(ctx,'Back to even',xs[2]+bw/2,B+20*fs,{s:13*fs,a:'center',c:PAL['cv-soft']});}
  const G=sim.gutS&&sim.gutS.g;if(G&&!big)txt(ctx,'Your gut: +'+G.g+'%',xs[2]+bw+12,B-A*sc+20,{s:13,w:700,c:PAL['s4']});
  if(!big&&sim.p.crash!=='custom'&&stg>=5)txt(ctx,CR[sim.p.crash].when+'. Back to the old high '+CR[sim.p.crash].back+'.',24,430,{s:12.5,c:PAL['cv-soft']});},
 narrate(sim){if(!shown(sim))return `${$(sim.p.amt)} falls ${p1(dPct(sim))}. <b>What percent gain gets it back to ${$(sim.p.amt)}?</b>`;
  return `${$(sim.p.amt)} − ${p1(dPct(sim))} leaves ${$2(after(sim))}. To climb back, that smaller amount must grow by <b>${p1(need(sim))}</b>, because the gain is a percent of ${$(after(sim))}, not of ${$(sim.p.amt)}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to the percent gain you think the fund needs to get all the way back. Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-need(sim)),g:sim.p.guess,label:'+'+sim.p.guess+'%'};},
  solve(sim){const t=need(sim);sim.p.guess=clamp(Math.round(t),0,200);return {v:Math.abs(sim.p.guess-t)<=0.5?0:Math.abs(sim.p.guess-t),g:t,label:'+'+p1(t)};},
  hint:{bio:'Lock in your gut. Then you will work out what is left at the bottom.'},
  calc:{get unit(){return atLeast('ap')?'years':atLeast('honors')?'%':'$';},d:2,tol:a=>atLeast('ap')?0.1:atLeast('honors')?0.2:1,
   prompt:{bio:sim=>`The fund held <b>${$(sim.p.amt)}</b> and fell <b>${p1(dPct(sim))}</b>. How much is left at the bottom?`,
    honors:sim=>`A ${p1(dPct(sim))} drop multiplies the value by ${(1-d(sim)).toFixed(3)}. What percent gain multiplies it back to where it started? (Find 1 ÷ ${(1-d(sim)).toFixed(3)}, then subtract 1.)`,
    ap:sim=>`After a ${p1(dPct(sim))} drop, how many years does it take to get back to even if the fund then grows a steady <b>${sim.p.r}%</b> a year? Solve ${(1+sim.p.r/100).toFixed(3)}ᵗ = 1 ÷ ${(1-d(sim)).toFixed(3)}.`},
   answer:calcAns,
   hint:{bio:'Find the drop in dollars, then subtract it from the starting amount.',honors:'1 ÷ 0.432 ≈ 2.315 means you need 231.5% of the bottom value, a gain of 131.5%.',ap:'Take the natural log of both sides.'},
   steps(sim){const m=1-d(sim);if(atLeast('ap'))return [`Needed multiplier: 1 ÷ ${m.toFixed(3)} = ${(1/m).toFixed(4)}.`,`t = ln(${(1/m).toFixed(4)}) ÷ ln(${(1+sim.p.r/100).toFixed(3)}) = ${Math.log(1/m).toFixed(4)} ÷ ${Math.log(1+sim.p.r/100).toFixed(4)} = <b>${yrs(sim).toFixed(2)} years</b>.`];
    if(atLeast('honors'))return [`Bottom value = top × ${m.toFixed(3)}.`,`Multiplier back: 1 ÷ ${m.toFixed(3)} = ${(1/m).toFixed(4)}.`,`Gain: ${(1/m).toFixed(4)} − 1 = <b>${need(sim).toFixed(2)}%</b>.`];
    return [`The drop: ${$(sim.p.amt)} × ${(d(sim)).toFixed(3)} = ${$2(sim.p.amt*d(sim))}.`,`Left: ${$(sim.p.amt)} − ${$2(sim.p.amt*d(sim))} = <b>${$2(after(sim))}</b>.`,`To get back, ${$2(after(sim))} must gain ${$2(sim.p.amt-after(sim))}, which is ${p1(need(sim))} of it.`];}},
  formula(sim){return `Bottom: ${$(sim.p.amt)} × (1 − ${d(sim).toFixed(3)}) = ${$2(after(sim))}<br>Gain needed: ${d(sim).toFixed(3)} ÷ ${(1-d(sim)).toFixed(3)} = ${p1(need(sim))}`+(atLeast('ap')?`<br>At ${sim.p.r}% a year: ln(1 ÷ ${(1-d(sim)).toFixed(3)}) ÷ ln(${(1+sim.p.r/100).toFixed(3)}) = ${yrs(sim).toFixed(1)} years`:'');},
  how:{bio:'The math measures the climb back as a percent of the smaller, bottom value. Dividing the dollars lost by the dollars left gives the gain needed.'},
  compare(sim,g0,m){const t=need(sim),K=sim.ui.calc,self=K&&K.done&&K.correct?' You did the calculation yourself.':'';
   const real=` In dollars: ${$2(after(sim))} has to grow by ${$2(sim.p.amt-after(sim))} to get back to ${$(sim.p.amt)}.`;
   if(Math.abs(g0.g-t)<=3)return `Your gut was right on: it needs about ${p1(t)}.`+real+self;
   return `Your gut said +${g0.g}%; the math says <b>+${p1(t)}</b>. ${Math.abs(g0.g-dPct(sim))<=3?'A gain the same size as the loss is not enough: it is a percent of a smaller number.':''}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.crash=R(Object.keys(CR));sim.p.drop=R([10,20,25,40,50,60]);sim.p.amt=R([5000,10000,20000]);sim.p.guess=57;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'An investment worth $8,000 falls 25%. How much is it worth now?',answer:6000,tol:0.5,unit:'$',d:0,hint:'25% of $8,000 is $2,000.',explain:'$8,000 − $2,000 = $6,000. Getting back needs $2,000 more, which is 33.3% of $6,000.'},
  {lvl:'bio',instant:true,q:'Your $1,000 falls 50%, then rises 50%. What do you have?',choices:['$1,000','$750','$1,250'],correct:1,explain:'$1,000 × 0.5 = $500, then $500 × 1.5 = $750. Getting back from a 50% drop takes a 100% gain.'},
  {lvl:'bio',instant:true,q:'In March 2009, at the bottom, an investor sold. What did selling do?',choices:['Locked in the loss: the money was out when prices recovered','Nothing: the loss was the same either way','It guaranteed a profit later'],correct:0,explain:'A drop is a loss on paper until you sell. The S&P 500 returned to its 2007 high in March 2013; money sold at the bottom missed that climb.'},
  {lvl:'honors',kind:'num',q:'The 2020 crash took the S&P 500 down 33.9%. To one decimal, what percent gain did it need to get back?',answer:51.3,tol:0.1,unit:'%',d:1,hint:'0.339 ÷ 0.661.',explain:'0.339 ÷ 0.661 ≈ 0.513, a 51.3% gain. It got there in about 5 months, by August 2020.'},
  {lvl:'honors',instant:true,q:'Which is the right equation for the gain g after a drop d?',choices:['g = d','(1 − d)(1 + g) = 1','(1 + d)(1 − g) = 1'],correct:1,explain:'The drop multiplies by (1 − d) and the gain by (1 + g). To end where you started, their product must be 1.'},
  {lvl:'ap',kind:'num',q:'After a 56.8% drop, growing 7% a year, how many years does it take to get back to even? (Round to the nearest tenth.)',answer:12.4,tol:0.1,unit:'years',d:1,hint:'t = ln(1 ÷ 0.432) ÷ ln 1.07.',explain:'ln(2.3148) ÷ ln(1.07) ≈ 0.8393 ÷ 0.06766 ≈ 12.4 years. The real S&P 500 got back in about 4 years from the bottom, because it rose far faster than 7% a year in 2009 and 2010.'},
  {lvl:'ap',instant:true,q:'Why can’t one steady rate describe a real recovery?',choices:['Returns change a lot from year to year','The formula is wrong','Markets never recover'],correct:0,explain:'The S&P 500 gained about 23% in 2009 and about 13% in 2010 (price only), then much less in 2011. A steady-rate model is a benchmark, not a forecast.'}
 ],
 tour:[
  {title:'The top',text:'October 9, 2007: $10,000 in an S&P 500 index fund.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{crash:'2008',amt:10000,r:7,reveal:true});}},
  {title:'The bottom',text:'By March 9, 2009, the index had fallen 56.8%. $10,000 × 0.432 = $4,320.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'The climb back',text:'To get back to $10,000, the $4,320 must gain $5,680. That is 5,680 ÷ 4,320 ≈ 131.5%.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Why it’s bigger',text:'The loss is a percent of $10,000. The gain is a percent of $4,320, a smaller number, so it needs a bigger percent.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'History',text:'The S&P 500 closed above its 2007 high again in March 2013, about 4 years after the bottom.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'A smaller crash',text:'The 2020 drop was 33.9%, which needed a 51.3% gain. It took about 5 months.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{crash:'2020',reveal:true});}}
 ],
 lab:{bio:'<p><b>Question:</b> How does the size of a drop change the climb back?</p><ol><li>Choose <b>Choose your own drop</b> and turn on <b>Show the answer now</b>.</li><li>Record the gain needed for drops of 10%, 20%, 30%, 40%, 50% and 60%.</li></ol><p>Graph it. Why does the curve bend upward?</p>',
  honors:'<p><b>Question:</b> How long did real recoveries take?</p><ol><li>For each real crash, record the drop, the gain needed and <b>What really happened</b>.</li></ol><p>Is the bigger drop always the slower recovery? What else might matter?</p>',
  ap:'<p><b>Question:</b> How fast did 2009–2013 really grow?</p><ol><li>The index needed a 131.5% gain and took about 4 years from the bottom.</li><li>Solve (1 + r)⁴ = 2.315 for r.</li></ol><p><b>CER:</b> Compare your r with the 7% long-run average, and explain what this means for using an average to forecast.</p>'},
 terms:[
  {t:'Bear market',d:'A drop of 20% or more from a recent high.'},
  {t:'Drawdown',d:'The drop from a high to a low, as a percent of the high.'},
  {t:'Recession',d:'A broad decline in economic activity lasting more than a few months. In the U.S., the National Bureau of Economic Research dates recessions.'},
  {t:'Multiplier',d:'A percent change written as a factor: −56.8% is × 0.432; +131.5% is × 2.315.',lvl:'honors'},
  {t:'Logarithm',d:'The exponent that solves bᵗ = x: t = ln x ÷ ln b.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Bottom value = top × (1 − d). Gain needed g = d ÷ (1 − d). Years at a steady rate r: ln(1 ÷ (1 − d)) ÷ ln(1 + r).</p><p><b>Data.</b> S&P 500 closing prices, without dividends (S&P Dow Jones Indices, as widely reported): 2007–09, −56.8%, October 9, 2007 to March 9, 2009, back to the old high in March 2013; 2020, −33.9%, February 19 to March 23, 2020, back in August 2020; 2022, −25.4%, January 3 to October 12, 2022, back in January 2024.</p><p><b>What this number hides.</b> Dividends made each recovery faster for investors who reinvested them. A stock market drop is not the same as a recession: there was no recession in 2022, while 2007–09 was both. Past recoveries do not promise future ones, and a single company can fall and never come back, which is one reason people diversify.</p><p><b>This is a simplified model, not investment advice.</b></p>'
};
BioLab.register(SIM);
})();
