(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* Dollar-cost averaging: the same dollars every month. shares_i = D ÷ price_i. Average cost = total invested ÷ total shares,
   which is the harmonic mean of the prices, never above their arithmetic mean (AM ≥ HM). */
const PATHS={class:{l:'The class example',p:[200,160,125,160]},rising:{l:'Steady rise',p:[100,110,120,130]},falling:{l:'Steady fall',p:[160,140,120,100]},bumpy:{l:'Drop, then recover',p:[100,60,90,120]}};
const MON=['Jan','Feb','Mar','Apr'],FULL=['January','February','March','April'];
const P=sim=>PATHS[sim.p.path].p,D=sim=>sim.p.amt;
const shares=sim=>P(sim).map(x=>D(sim)/x);
const tot=sim=>shares(sim).reduce((a,b)=>a+b,0);
const inv=sim=>4*D(sim);
const avgCost=sim=>inv(sim)/tot(sim);
const avgPrice=sim=>P(sim).reduce((a,b)=>a+b,0)/4;
const truth=sim=>Math.abs(avgCost(sim)-avgPrice(sim))<0.005?'equal':avgCost(sim)<avgPrice(sim)?'below':'above';
const WHO={below:'Below the average price',equal:'Equal to the average price',above:'Above the average price'};
const last=sim=>P(sim)[3];
const lumpShares=sim=>inv(sim)/P(sim)[0];
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const s2=v=>(Math.round(v*100)/100).toFixed(2);

const SIM={
 id:'dca',hash:'dca',apUnit:4,order:1,tab:'Dollar-cost averaging',kind:'Simulation',
 skills:{bio:'Unit rates: shares = dollars ÷ price, cost per share = dollars ÷ shares · Personal Finance (Investing)',honors:'Unit rates and comparing two plans · Personal Finance (Investing)',ap:'The harmonic mean and the AM–HM inequality · Personal Finance (Investing)'},
 card:'Invest $200 every month while the price jumps around. Guess whether your average cost per share ends up above or below the average price, then count the shares.',
 title:'Dollar-cost averaging: same dollars, different shares',
 lede:{bio:'Dollar-cost averaging means investing the same number of dollars on a schedule, whatever the price. When the price is low, your dollars buy more shares; when it is high, they buy fewer. You can buy part of a share.',
  honors:'Compare with a lump sum: putting all the money in at once, on the first day. Which plan ends with more depends on which way the price moves, and nobody knows that ahead of time.',
  ap:'Your average cost is 4D ÷ (D/p₁ + D/p₂ + D/p₃ + D/p₄) = 4 ÷ (1/p₁ + 1/p₂ + 1/p₃ + 1/p₄): the harmonic mean of the prices. The AM–HM inequality says it is never above the ordinary average, and it is below whenever the prices differ.'},
 scale:'Four monthly purchases of one stock or fund. Prices are made-up examples; the class example uses the slide’s numbers.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your plan',
 controls:[
  {id:'who',label:'Your gut: your average cost per share ends up…',type:'seg',def:'equal',options:[{v:'below',l:WHO.below},{v:'equal',l:WHO.equal},{v:'above',l:WHO.above}]},
  {id:'path',label:'How the price moves',type:'seg',def:'class',noGut:true,onChange:clear,options:Object.keys(PATHS).map(k=>({v:k,l:PATHS[k].l}))},
  {id:'amt',label:'You invest each month',type:'range',min:50,max:500,step:25,def:200,unit:' dollars',noGut:true,onChange:clear},
  {id:'reveal',label:'Show the shares now',type:'toggle',def:false,help:'Normally they appear once you lock in your gut answer.'}
 ],
 actions:[{id:'bumpy',label:'Try a drop, then a recovery',run(sim){BioLab.setValues(sim,{path:'bumpy',reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'inv',label:'Total invested',unit:'dollars',d:2,min:0,max:null,get:inv},
  {id:'avgP',label:'Average of the four prices',unit:'dollars',d:2,min:0,max:null,get:avgPrice},
  {id:'shares',label:'Total shares bought',unit:'shares',d:4,min:0,max:null,get:sim=>shown(sim)?tot(sim):null},
  {id:'avgC',label:'Your average cost per share',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?avgCost(sim):null},
  {id:'value',label:'Value at the last price',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?tot(sim)*last(sim):null},
  {id:'lump',label:'Lump sum on day one: value at the last price',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?lumpShares(sim)*last(sim):null},
  {id:'hm',label:'Harmonic mean of the prices',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?4/P(sim).reduce((a,x)=>a+1/x,0):null}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3,pr=P(sim),sv=shares(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,$(D(sim))+' every month, whatever the price',24,32*Math.min(k,1.2),{s:17*fs,w:700});
  const L=big?40:60,R=big?780:600,T=70*Math.min(k,1.2),B=360,mx=Math.max(...pr)*1.15,Y=v=>B-(B-T)*v/mx,cw=(R-L)/4;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  pr.forEach((p,i)=>{const x=L+i*cw+cw*0.18,w=cw*0.64;ctx.fillStyle=PAL['s2'];rr(ctx,x,Y(p),w,B-Y(p),6);ctx.fill();
   txt(ctx,'$'+p,x+w/2,Y(p)-8,{s:14*fs,w:700,a:'center'});txt(ctx,MON[i],x+w/2,B+18*fs,{s:13*fs,a:'center',c:PAL['cv-soft']});
   txt(ctx,sh?s2(sv[i])+' sh':'? sh',x+w/2,B-16*fs,{s:13*fs,w:700,a:'center',c:'#fff'});});
  const hl=(v,col,lab,dy)=>{ctx.strokeStyle=col;ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();ctx.setLineDash([]);if(!big)txt(ctx,lab,R+8,Y(v)+dy,{s:12.5,w:700,c:col,b:'middle'});};
  const ap=avgPrice(sim),ac=avgCost(sim),close=Math.abs(Y(ap)-Y(ac))<16;
  hl(ap,PAL['s4'],'Average price '+$2(ap),close?-8:0);
  if(sh)hl(ac,PAL['rj'],'Your cost '+$2(ac),close?8:0);
  if(sh)txt(ctx,'Total: '+s2(tot(sim))+' shares for '+$(inv(sim))+'   ·   '+$(inv(sim))+' ÷ '+s2(tot(sim))+' = '+$2(ac)+' a share',24,big?420:410,{s:13.5*fs,w:700});
  else txt(ctx,locked(sim)?'Work out your average cost to see the shares':'Lock in your gut to see how many shares each month buys',24,big?420:410,{s:13*fs,c:PAL['cv-soft']});
  const G=sim.gutS&&sim.gutS.g;if(G&&!big)txt(ctx,'Your gut: '+G.who,R+8,T+6,{s:12.5,w:700,c:PAL['s4']});},
 narrate(sim){if(!shown(sim))return `Prices this time: ${P(sim).map(p=>'$'+p).join(', ')}. You spend ${$(D(sim))} each month. <b>Is your cost per share above, equal to or below the average price?</b>`;
  const i=P(sim).indexOf(Math.min(...P(sim)));return `Your average cost is <b>${$2(avgCost(sim))}</b>, ${$2(avgPrice(sim)-avgCost(sim))} below the average price. In ${FULL[i]}, the cheapest month, the same ${$(D(sim))} bought the most shares, ${s2(shares(sim)[i])}, so cheap months count more.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Pick one here: after four months, how does your average cost per share compare with the average of the four prices? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth(sim)?1:0,who:w,label:WHO[w]};},
  solve(sim){const t=truth(sim);sim.p.who=t;return {v:1,who:t,label:WHO[t]};},
  hint:{bio:'Lock in your gut. Then you will work out your average cost per share yourself.'},
  calc:{unit:'$',d:2,tol:0.5,
   prompt:{bio:sim=>`You bought <b>${s2(tot(sim))} shares</b> in all for <b>${$(inv(sim))}</b> (4 × ${$(D(sim))}). What is your average cost per share?`,
    honors:sim=>`Each month ${$(D(sim))} buys ${$(D(sim))} ÷ price shares. The prices were ${P(sim).map(p=>'$'+p).join(', ')}. Find the total shares, then your average cost per share (total dollars ÷ total shares).`},
   answer:sim=>F.r2(avgCost(sim)),
   hint:'Divide the total dollars by the total shares.',
   steps(sim){const out=P(sim).map((p,i)=>`${MON[i]}: ${$(D(sim))} ÷ $${p} = ${s2(shares(sim)[i])} shares`);out.push(`Total: ${s2(tot(sim))} shares for ${$(inv(sim))}.`,`Average cost: ${$(inv(sim))} ÷ ${s2(tot(sim))} = <b>${$2(avgCost(sim))}</b> a share. The average price is ${$2(avgPrice(sim))}.`);return out;}},
  formula(sim){return `Shares: ${P(sim).map(p=>$(D(sim))+' ÷ $'+p).join(' + ')} = ${s2(tot(sim))}<br>Average cost: ${$(inv(sim))} ÷ ${s2(tot(sim))} = ${$2(avgCost(sim))} · average price: (${P(sim).join(' + ')}) ÷ 4 = ${$2(avgPrice(sim))}`;},
  how:{bio:'The math counts shares month by month. Equal dollars buy more shares at low prices, so the low prices pull your average cost down.',ap:'Average cost is the harmonic mean of the prices, and HM ≤ AM, with equality only when every price is the same.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the cost per share yourself, the same number your brokerage statement shows.':'';
   const real=` You paid ${$2(avgCost(sim))} a share against an average price of ${$2(avgPrice(sim))}: ${$2(avgPrice(sim)-avgCost(sim))} less per share on ${s2(tot(sim))} shares.`;
   if(g0.who===m.who)return 'Your gut was right: your cost is below the average price.'+real+self;
   return `Your gut said <b>${WHO[g0.who].toLowerCase()}</b>; the math says <b>below</b>. ${g0.who==='equal'?'Spending the same each month is not the same as buying the same shares each month.':'Cheap months buy more shares, so they pull the cost down, not up.'}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.path=R(Object.keys(PATHS));sim.p.amt=R([50,100,150,200,250]);sim.p.who='equal';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You invest $150 when a fund costs $60 a share. How many shares do you buy?',answer:2.5,tol:0.001,unit:'shares',d:2,hint:'Shares = dollars ÷ price.',explain:'$150 ÷ $60 = 2.5 shares. You can own part of a share.'},
  {lvl:'bio',instant:true,q:'In which month does your $200 buy the most shares?',choices:['When the price is highest','When the price is lowest','Every month buys the same'],correct:1,explain:'Shares = dollars ÷ price, so a smaller price gives more shares. $200 ÷ $125 = 1.6 shares, the most in the class example.'},
  {lvl:'bio',instant:true,q:'Does dollar-cost averaging guarantee you make money?',choices:['Yes, always','No: if the price keeps falling, your shares can be worth less than you paid','Only after a year'],correct:1,explain:'It lowers your average cost compared with the average price and builds a habit, but the investment can still lose value. Try the steady fall.'},
  {lvl:'honors',kind:'num',q:'Steady rise: $100, $110, $120, $130. You put all $800 in on day one instead. To the cent, what is it worth at $130?',answer:1040,tol:0.01,unit:'$',d:2,hint:'$800 ÷ $100 = 8 shares.',explain:'8 shares × $130 = $1,040. Dollar-cost averaging buys 7.0233 shares, worth $913.03. When prices only rise, investing sooner wins.'},
  {lvl:'honors',instant:true,q:'Prices drop, then recover: $100, $60, $90, $120. Which plan ends with more?',choices:['Lump sum on day one','Dollar-cost averaging, because it bought cheap shares in the dip','They tie'],correct:1,explain:'Dollar-cost averaging bought 9.2222 shares, worth $1,106.67. The lump sum bought 8 shares, worth $960.'},
  {lvl:'ap',kind:'num',q:'Prices $200, $160, $125, $160. To the cent, what is their harmonic mean, 4 ÷ (1/200 + 1/160 + 1/125 + 1/160)?',answer:156.86,tol:0.01,unit:'$',d:2,hint:'1/200 + 1/160 + 1/125 + 1/160 = 0.0255.',explain:'4 ÷ 0.0255 ≈ 156.86, exactly the average cost per share. The arithmetic mean is 161.25.'},
  {lvl:'ap',instant:true,q:'When is the average cost per share exactly equal to the average price?',choices:['When the prices rise','Only when every price is the same','Never'],correct:1,explain:'The AM–HM inequality is an equality only when all the numbers are equal.'}
 ],
 tour:[
  {title:'The plan',text:'Invest $200 at the start of every month, whatever the price. Four months: $800.',pause:true,setup:sim=>BioLab.setValues(sim,{path:'class',amt:200,reveal:true})},
  {title:'January',text:'$200 ÷ $200 = 1.00 share.',pause:true},
  {title:'The cheap month',text:'In March the price is $125, so $200 buys 1.60 shares, the most of any month.',pause:true},
  {title:'Add them up',text:'1.00 + 1.25 + 1.60 + 1.25 = 5.10 shares for $800.',pause:true},
  {title:'Average cost',text:'$800 ÷ 5.10 = $156.86 a share, below the average price of $161.25.',pause:true},
  {title:'Not a guarantee',text:'If prices only fall, you still lose money: $100 at the end is below your $126.08 cost.',pause:true,setup:sim=>BioLab.setValues(sim,{path:'falling',reveal:true})},
  {lvl:'honors',title:'Lump sum or spread out?',text:'In a steady rise, putting all $800 in on day one ends with more. In a dip and recovery, spreading it out ends with more. Nobody knows ahead of time which one is coming.',pause:true,setup:sim=>BioLab.setValues(sim,{path:'rising',reveal:true})}
 ],
 lab:{bio:'<p><b>Question:</b> Is your cost always below the average price?</p><ol><li>Turn on <b>Show the shares now</b>.</li><li>Record <b>Your average cost per share</b> and <b>Average of the four prices</b> for every price pattern.</li></ol><p>Write one sentence about what you found and why.</p>',
  honors:'<p><b>Question:</b> When does a lump sum beat dollar-cost averaging?</p><ol><li>For each pattern, record <b>Value at the last price</b> and <b>Lump sum on day one</b>.</li></ol><p>Explain the pattern. What would you need to know to always pick the winner?</p>',
  ap:'<p><b>Question:</b> Why is the average cost a harmonic mean?</p><ol><li>Write total shares and total dollars as expressions in D, p₁, …, p₄.</li><li>Divide and simplify.</li></ol><p><b>CER:</b> Use the AM–HM inequality to prove the average cost is never above the average price.</p>'},
 terms:[
  {t:'Share',d:'One unit of ownership in a company or a fund. You can buy a fraction of one.'},
  {t:'Dollar-cost averaging',d:'Investing the same number of dollars on a regular schedule, whatever the price.'},
  {t:'Average cost per share',d:'Total dollars invested ÷ total shares owned.'},
  {t:'Lump sum',d:'Investing all the money at once.',lvl:'honors'},
  {t:'Harmonic mean',d:'n ÷ (1/x₁ + … + 1/xₙ). It is never larger than the ordinary average.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> The same dollars at four prices; shares = dollars ÷ price; average cost = total dollars ÷ total shares. No fees or taxes. The price paths are made-up examples; the class example matches the Dollar-Cost Averaging slides ($200, $160, $125, $160).</p><p><b>What this number hides.</b> A lower average cost does not mean a profit: that depends on the price when you sell. Studies of past markets have found that a lump sum invested at once usually ended with more than spreading the same money out, because markets rose more often than they fell; dollar-cost averaging trades some of that for less regret and a steady habit. For most workers, dollar-cost averaging is simply how saving happens: a little from every paycheck.</p><p><b>This is a simplified model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
