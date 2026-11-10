(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
const F=window.FIN,$2=F.money2;
/* The Consumer Price Index (CPI-U, U.S. city average, 1982–84 = 100). Yearly averages from BLS; "now" is September 2026.
   Today's price = old price × (CPI now ÷ CPI then). */
const CPI={1980:82.4,1990:130.7,2000:172.2,2010:218.056,2020:258.811};
const NOW=336.940,NOWY=2026;
const mult=sim=>NOW/CPI[sim.p.year];
const today=sim=>F.r2(sim.p.amt*mult(sim));
const years=sim=>NOWY-(+sim.p.year);
const rate=sim=>Math.pow(mult(sim),1/years(sim))-1;
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const x2=v=>(Math.round(v*100)/100).toFixed(2);
const calcAns=sim=>atLeast('ap')?Math.round(rate(sim)*10000)/100:today(sim);

const SIM={
 id:'inflation',hash:'inflation',apUnit:3,order:1,tab:'What is $2 from 1990 worth today?',kind:'Simulation',
 skills:{bio:'Ratios and proportions: new price = old price × (CPI now ÷ CPI then) · Personal Finance (Time value of money)',honors:'Ratios and percent change: purchasing power · Personal Finance (Time value of money)',ap:'Exponential growth: the average yearly rate from a growth factor · Personal Finance (Time value of money)'},
 card:'A $2 drink token from 1990 turns up in a drawer. Guess how many dollars it takes today to buy the same thing, then let the Consumer Price Index answer.',
 title:'What is $2 from 1990 worth today? Inflation and purchasing power',
 lede:{bio:'Prices usually rise over time. That is inflation. The government tracks the price of a typical basket of things people buy with a number called the Consumer Price Index (CPI). Dividing today’s CPI by an old year’s CPI tells you how many times more dollars the same things cost now.',
  honors:'Purchasing power is how much a dollar can buy. When prices are 2.58 times higher, a dollar buys 1 ÷ 2.58 ≈ 39% of what it did, so it lost about 61% of its purchasing power.',
  ap:'If prices grow by a factor G over t years, the average yearly inflation rate r solves (1 + r)ᵗ = G, so r = G^(1/t) − 1.'},
 scale:'U.S. city average CPI-U, 1982–84 = 100. Old years use the yearly average; “today” is September 2026.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Then and now',
 controls:[
  {id:'guess',label:'Your gut: today it takes how many times as many dollars?',type:'range',min:1,max:5,step:0.05,def:1.5,unit:'×',d:2},
  {id:'year',label:'The year of the old price',type:'seg',def:'1990',noGut:true,onChange:clear,options:Object.keys(CPI).map(y=>({v:y,l:y}))},
  {id:'amt',label:'The old price',type:'range',min:1,max:50,step:0.5,def:2,unit:' dollars',d:2,noGut:true,onChange:clear,help:'$2 is the drink token from the class example. Try a movie ticket ($5 in 1990) or a family member’s first paycheck.'},
  {id:'reveal',label:'Show today’s price now',type:'toggle',def:false,help:'Normally it appears once you lock in your gut answer.'}
 ],
 actions:[{id:'movie',label:'A $5 movie ticket in 1990',run(sim){BioLab.setValues(sim,{year:'1990',amt:5,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'then',label:'CPI in the old year',unit:'',d:3,min:0,max:null,get:sim=>CPI[sim.p.year]},
  {id:'now',label:'CPI, September 2026',unit:'',d:3,min:0,max:null,get:()=>NOW},
  {id:'mult',label:'Prices now ÷ prices then',unit:'×',d:3,min:0,max:null,get:sim=>shown(sim)?mult(sim):null},
  {id:'today',label:'Same buying power today',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?today(sim):null},
  {id:'lost',label:'Buying power a dollar has lost',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?100*(1-1/mult(sim)):null},
  {id:'rate',label:'Average inflation per year',unit:'%',d:2,lvl:'ap',min:0,max:10,get:sim=>shown(sim)?100*rate(sim):null},
  {id:'r72',label:'Years for prices to double at that rate (rule of 72)',unit:'years',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?72/(100*rate(sim)):null}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3,Y=+sim.p.year;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* two price tags */
  const tag=(x,y,w,h,col,top,mid)=>{ctx.fillStyle=PAL['card'];rr(ctx,x,y,w,h,10);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=3;rr(ctx,x,y,w,h,10);ctx.stroke();
   txt(ctx,top,x+w/2,y+28*fs,{s:15*fs,w:700,a:'center',c:PAL['cv-soft']});txt(ctx,mid,x+w/2,y+h*0.68,{s:34*fs,w:700,a:'center',c:col});};
  const tw=big?330:240,th=big?150:130;
  tag(30,40,tw,th,PAL['s2'],'In '+Y,$2(sim.p.amt));
  tag(big?440:300,40,tw,th,PAL['rj'],'In 2026',sh?$2(today(sim)):'?');
  if(!big){txt(ctx,'→',285,40+th/2+10,{s:28,w:700,a:'center',c:PAL['cv-soft']});
   const G=sim.gutS&&sim.gutS.g;txt(ctx,'Your gut: × '+x2(sim.p.guess)+' = '+$2(sim.p.amt*sim.p.guess),660,80,{s:13,w:700,c:PAL['s4'],a:'center'});
   if(sh)txt(ctx,'The CPI: × '+mult(sim).toFixed(3),660,106,{s:13,w:700,c:PAL['rj'],a:'center'});}
  /* the CPI over time */
  const gx=big?60:80,gy=big?230:210,gw=big?700:680,gh=big?190:200,yrs=[1980,1990,2000,2010,2020,2026],val=y=>y===2026?NOW:CPI[y];
  const X=y=>gx+gw*(y-1980)/(46),Yp=v=>gy+gh-gh*v/360;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx,gy+gh);ctx.lineTo(gx+gw,gy+gh);ctx.stroke();
  txt(ctx,'CPI (1982–84 = 100)',gx+6,gy+4,{s:12*fs,c:PAL['cv-soft']});
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=3;ctx.beginPath();yrs.forEach((y,i)=>{const px=X(y),py=Yp(val(y));i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();
  yrs.forEach(y=>{const on=y===Y||y===2026;ctx.fillStyle=on?PAL['rj']:PAL['s2'];ctx.beginPath();ctx.arc(X(y),Yp(val(y)),on?6:4,0,7);ctx.fill();
   txt(ctx,String(y),X(y),gy+gh+16*fs,{s:12*fs,a:'center',c:PAL['cv-soft']});if(!big||on)txt(ctx,(+val(y).toFixed(1)).toString(),X(y),Yp(val(y))-10,{s:12*fs,a:'center',w:on?700:400});});},
 narrate(sim){const Y=sim.p.year;
  if(!shown(sim))return `The CPI was ${CPI[Y]} in ${Y} and ${NOW} in September 2026. <b>How many times as many dollars does the same thing cost now?</b>`;
  return `Prices are <b>${mult(sim).toFixed(3)} times</b> what they were in ${Y}, so ${$2(sim.p.amt)} then buys what ${$2(today(sim))} buys now. A dollar from ${Y} buys only ${(100/mult(sim)).toFixed(1)}% of what it did.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here: how many times as many dollars do you think it takes today to buy what the old price bought? Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-mult(sim)),g:sim.p.guess,label:'× '+x2(sim.p.guess)};},
  solve(sim){const m=mult(sim);sim.p.guess=clamp(Math.round(m*20)/20,1,5);return {v:Math.abs(sim.p.guess-m)<0.026?0:Math.abs(sim.p.guess-m),g:m,label:'× '+m.toFixed(3)};},
  hint:{bio:'Lock in your gut. Then you will use the CPI to find today’s price yourself.'},
  calc:{get unit(){return atLeast('ap')?'%':'$';},d:2,tol:0.02,
   prompt:{bio:sim=>`The CPI was <b>${CPI[sim.p.year]}</b> in ${sim.p.year} and <b>${NOW}</b> in September 2026. Multiply the old price, <b>${$2(sim.p.amt)}</b>, by CPI now ÷ CPI then. What does it take today?`,
    ap:sim=>`Prices grew by a factor of ${NOW} ÷ ${CPI[sim.p.year]} over ${years(sim)} years (${sim.p.year} to ${NOWY}). Find the average yearly inflation rate r from (1 + r)<sup>${years(sim)}</sup> = ${mult(sim).toFixed(4)}. Give r as a percent, to two decimals.`},
   answer:calcAns,
   hint:{bio:'Divide 336.940 by the old CPI first, then multiply by the old price.',ap:'Raise the growth factor to the power 1/t, then subtract 1.'},
   steps(sim){if(atLeast('ap'))return [`Growth factor: ${NOW} ÷ ${CPI[sim.p.year]} = ${mult(sim).toFixed(4)}.`,`r = ${mult(sim).toFixed(4)}^(1/${years(sim)}) − 1 = ${rate(sim).toFixed(5)}.`,`About <b>${(100*rate(sim)).toFixed(2)}%</b> a year.`];
    return [`CPI now ÷ CPI then: ${NOW} ÷ ${CPI[sim.p.year]} = ${mult(sim).toFixed(4)}.`,`${$2(sim.p.amt)} × ${mult(sim).toFixed(4)} = <b>${$2(today(sim))}</b>.`];}},
  formula(sim){return `${$2(sim.p.amt)} × (${NOW} ÷ ${CPI[sim.p.year]}) = ${$2(sim.p.amt)} × ${mult(sim).toFixed(3)} = ${$2(today(sim))}`+(atLeast('ap')?`<br>Average yearly inflation: ${mult(sim).toFixed(3)}^(1/${years(sim)}) − 1 = ${(100*rate(sim)).toFixed(2)}%`:'');},
  how:{bio:'The CPI turns prices from different years into one scale. The ratio of two CPI values is how many times more dollars the same basket costs.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You did the CPI conversion yourself, the same math the Social Security cost-of-living raise uses.':'';
   const t=today(sim),gp=sim.p.amt*g0.g;
   if(Math.abs(g0.g-mult(sim))<0.15)return `Your gut was close: × ${x2(g0.g)} against the CPI’s × ${mult(sim).toFixed(3)}. ${$2(sim.p.amt)} then is ${$2(t)} now.`+self;
   return `Your gut said × ${x2(g0.g)}, so ${$2(gp)}; the CPI says <b>× ${mult(sim).toFixed(3)}, so ${$2(t)}</b>. ${g0.g<mult(sim)?`Your gut is ${$2(t-gp)} short: inflation adds up more than it feels like year to year.`:'Your gut overshot: a few percent a year adds up, but not that fast.'}`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.year=R(Object.keys(CPI));sim.p.amt=R([1,2,3.5,5,10,20]);sim.p.guess=1.5;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A movie ticket cost $5 in 1990 (CPI 130.7). Using September 2026’s CPI of 336.940, what is that in 2026 dollars?',answer:12.89,tol:0.02,unit:'$',d:2,hint:'336.940 ÷ 130.7 ≈ 2.578.',explain:'$5 × 2.578 ≈ $12.89.'},
  {lvl:'bio',instant:true,q:'Inflation is 3.7% a year. Your savings account pays 0.38% a year. What happens to what your savings can buy?',choices:['It grows','It shrinks: prices rise faster than your balance','It stays the same'],correct:1,explain:'Your balance grows 0.38% while prices grow 3.7%, so each year your money buys about 3.2% less.'},
  {lvl:'bio',instant:true,q:'Does inflation make the dollars in your account disappear?',choices:['Yes, the bank removes them','No: you keep the same dollars, but each one buys less','Only if you spend them'],correct:1,explain:'Inflation changes what money can buy, not how many dollars you have. That is purchasing power.'},
  {lvl:'honors',kind:'num',q:'Prices are 1.957 times what they were in 2000. To one decimal, what percent of its 2000 buying power does a dollar have today?',answer:51.1,tol:0.1,unit:'%',d:1,hint:'Divide 1 by 1.957.',explain:'1 ÷ 1.957 ≈ 0.511, so 51.1%. A dollar lost about 48.9% of its buying power.'},
  {lvl:'honors',instant:true,q:'A worker got a 3% raise in a year when prices rose 3.7%. What happened to the buying power of their pay?',choices:['It rose 3%','It fell about 0.7%','It rose 6.7%'],correct:1,explain:'Real change ≈ 3% − 3.7% = −0.7%. Exactly: 1.03 ÷ 1.037 − 1 ≈ −0.68%.'},
  {lvl:'ap',kind:'num',q:'Prices doubled over 25 years. To two decimals, what was the average yearly inflation rate?',answer:2.81,tol:0.01,unit:'%',d:2,hint:'Solve (1 + r)²⁵ = 2.',explain:'r = 2^(1/25) − 1 ≈ 0.02811, about 2.81%. The rule of 72 estimates 72 ÷ 25 = 2.88%.'},
  {lvl:'ap',instant:true,q:'Why does the rule of 72 work for growth near 2% to 10%?',choices:['Because 72 is divisible by many numbers and ln 2 ÷ ln(1 + r) ≈ 0.72 ÷ r there','Because the CPI is set to 72','It works for every rate exactly'],correct:0,explain:'Doubling time t = ln 2 ÷ ln(1 + r). For small r, ln(1 + r) is a bit less than r, so 69.3 ÷ (100r) becomes about 72 ÷ (100r) in this range. 72 also divides evenly by 2, 3, 4, 6, 8, 9 and 12.'}
 ],
 tour:[
  {title:'The token',text:'A $2 drink token from 1990. What would the same drink cost in 2026?',pause:true,setup:sim=>BioLab.setValues(sim,{year:'1990',amt:2,reveal:true})},
  {title:'The CPI',text:'Every month the Bureau of Labor Statistics prices a basket of goods and services in cities across the country. Its index was 130.7 in 1990 and 336.940 in September 2026.',pause:true},
  {title:'The ratio',text:'336.940 ÷ 130.7 ≈ 2.578: the same basket costs about 2.58 times as many dollars.',pause:true},
  {title:'Today’s price',text:'$2 × 2.578 = $5.16. The token still says $2, but it buys only 39% of a drink today.',pause:true},
  {title:'Recent years',text:'Since 2020 alone, prices rose by 336.940 ÷ 258.811 ≈ 1.302, about 30% since 2020.',pause:true,setup:sim=>BioLab.setValues(sim,{year:'2020',amt:2,reveal:true})},
  {lvl:'ap',title:'The yearly rate',text:'From 1990 to 2026: 2.578^(1/36) − 1 ≈ 2.67% a year on average. At that rate, prices double about every 27 years.',pause:true,setup:sim=>BioLab.setValues(sim,{year:'1990',amt:2,reveal:true})}
 ],
 lab:{bio:'<p><b>Question:</b> How has $20 changed?</p><ol><li>Set the old price to $20.</li><li>Record today’s price for each year: 1980, 1990, 2000, 2010, 2020.</li></ol><p>Ask a parent or grandparent what $20 bought when they were your age, and compare.</p>',
  honors:'<p><b>Question:</b> How much buying power did a dollar lose in each decade?</p><ol><li>Record <b>Buying power a dollar has lost</b> for each year.</li><li>Use the CPI values to find the loss within each decade (for example, 1990 to 2000).</li></ol><p>Which decade lost the most? Look up one event from that decade that pushed prices up.</p>',
  ap:'<p><b>Question:</b> Has inflation been steady?</p><ol><li>Find the average yearly rate for 1980–1990, 1990–2000, 2000–2010, 2010–2020 and 2020–2026 from the CPI values.</li><li>Graph them.</li></ol><p><b>CER:</b> Is one average rate a fair summary of 46 years? Use your graph.</p>'},
 terms:[
  {t:'Inflation',d:'A general rise in prices over time.'},
  {t:'Consumer Price Index (CPI)',d:'A number the Bureau of Labor Statistics publishes each month that tracks the price of a basket of goods and services.'},
  {t:'Purchasing power',d:'How much a dollar can buy.'},
  {t:'Real value',d:'An amount adjusted for inflation, in one year’s dollars.',lvl:'honors'},
  {t:'Rule of 72',d:'Years to double ≈ 72 ÷ the yearly percent.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> CPI-U, U.S. city average, all items, 1982–84 = 100 (Bureau of Labor Statistics). Yearly averages: 1980 82.4; 1990 130.7; 2000 172.2; 2010 218.056; 2020 258.811. September 2026: 336.940, not seasonally adjusted, 3.7% above September 2025. The class slide used July 2026 (333.918), which gives $5.11 for the token; this tool uses the newest month.</p><p><b>What this number hides.</b> The CPI is an average basket. Your own costs can rise faster or slower: rent, college tuition and health care have often risen faster than the CPI, while TVs and phones have fallen. The CPI also tries to adjust for quality, so a 2026 phone and a 1990 phone are not counted as the same thing.</p><p><b>Questions to ask any number.</b> Who counted, and how? Average or median? Compared to what?</p>'
};
BioLab.register(SIM);
})();
