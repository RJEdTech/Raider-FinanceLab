(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
const F=window.FIN,$2=F.money2;
/* Price-to-earnings: P/E = price per share ÷ earnings per share (EPS). EPS = net income ÷ diluted shares.
   Full-year 2025 GAAP diluted EPS from each company's annual report or results release. */
const CO={
 nflx:{n:'Netflix',eps:2.53,ni:'$10,981.2 million',sh:'4,343.9 million',src:'Netflix 2025 Form 10-K'},
 ko:{n:'Coca-Cola',eps:3.04,src:'Coca-Cola full-year 2025 results, Feb 10, 2026'},
 intc:{n:'Intel',eps:-0.06,src:'Intel full-year 2025 results, Jan 22, 2026'}};
const B=sim=>CO[sim.p.b];
const peA=sim=>sim.p.pa/CO.nflx.eps,peB=sim=>B(sim).eps>0?sim.p.pb/B(sim).eps:null;
function truth(sim){const a=peA(sim),b=peB(sim);if(b===null)return 'a';if(Math.abs(a-b)/Math.min(a,b)<0.02)return 'same';return a<b?'a':'b';}
const lab=sim=>({a:'Netflix',b:B(sim).n,same:'About the same'});
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const f1=v=>(Math.round(v*10)/10).toFixed(1);
const calcAns=sim=>atLeast('ap')?Math.round(10000*CO.nflx.eps/sim.p.pa)/100:Math.round(100*peA(sim))/100;

const SIM={
 id:'peratio',hash:'peratio',apUnit:4,order:2,tab:'Price per $1 of earnings (P/E)',kind:'Simulation',
 skills:{bio:'Ratios and unit rates: P/E = price ÷ earnings per share · Personal Finance (Investing)',honors:'Ratios: earnings per share and P/E · Personal Finance (Investing)',ap:'Ratios and reciprocals: P/E and earnings yield · Personal Finance (Investing)'},
 card:'One share of Netflix or one of Coca-Cola: which costs less for each $1 the company earns? Guess by the price tag, then let the P/E ratio decide.',
 title:'Price per $1 of earnings: the P/E ratio',
 lede:{bio:'A share’s price alone does not tell you whether it is cheap. Earnings per share (EPS) is the company’s yearly profit split across its shares. Price ÷ EPS, the P/E ratio, is how many dollars you pay for each $1 the company earns in a year.',
  honors:'EPS = net income ÷ shares. Companies report “diluted” EPS, which counts shares that could be created from stock options and similar promises. A company that loses money has negative EPS, and its P/E does not mean anything.',
  ap:'The reciprocal, EPS ÷ price, is the earnings yield: the company’s yearly earnings as a percent of what you paid. A P/E of 25 is an earnings yield of 4%.'},
 scale:'Full-year 2025 earnings per share (GAAP, diluted). Prices are examples you can change: look up today’s quote and type it in.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Two stocks',
 controls:[
  {id:'who',label:'Your gut: which costs less for each $1 of earnings?',type:'seg',def:'same',options:[{v:'a',l:'Netflix'},{v:'b',l:'The other company'},{v:'same',l:'About the same'}]},
  {id:'pa',label:'Netflix price per share',type:'range',min:20,max:200,step:0.5,def:90,unit:' dollars',d:2,noGut:true,onChange:clear,help:'An example price. Netflix split each share into 10 in November 2025, so its price is about a tenth of what older articles show.'},
  {id:'b',label:'The other company',type:'seg',def:'ko',noGut:true,onChange:clear,options:[{v:'ko',l:'Coca-Cola'},{v:'intc',l:'Intel',lvl:'honors'}]},
  {id:'pb',label:'Other company’s price per share',type:'range',min:10,max:150,step:0.5,def:70,unit:' dollars',d:2,noGut:true,onChange:clear,help:'An example price. Type in today’s quote to update it.'},
  {id:'reveal',label:'Show the P/E ratios now',type:'toggle',def:false,help:'Normally they appear once you lock in your gut answer.'}
 ],
 actions:[{id:'intel',label:'Compare with Intel',lvl:'honors',run(sim){BioLab.setValues(sim,{b:'intc',pb:40,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'epsA',label:'Netflix earnings per share, 2025',unit:'dollars',d:2,min:null,max:null,get:()=>CO.nflx.eps},
  {id:'epsB',label:'Other company earnings per share, 2025',unit:'dollars',d:2,min:null,max:null,get:sim=>B(sim).eps},
  {id:'peA',label:'Netflix P/E',unit:'',d:1,min:0,max:null,get:sim=>shown(sim)?peA(sim):null},
  {id:'peB',label:'Other company P/E',text:true,get:sim=>shown(sim)?(peB(sim)===null?'Not meaningful: it lost money':f1(peB(sim))):'Lock in your gut first'},
  {id:'eyA',label:'Netflix earnings yield',unit:'%',d:2,lvl:'honors',min:null,max:null,get:sim=>shown(sim)?100*CO.nflx.eps/sim.p.pa:null},
  {id:'eyB',label:'Other company earnings yield',unit:'%',d:2,lvl:'honors',min:null,max:null,get:sim=>shown(sim)?100*B(sim).eps/sim.p.pb:null}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,'What you pay for each $1 of yearly earnings',24,32*Math.min(k,1.2),{s:17*fs,w:700});
  const card=(x,col,name,price,eps,pe)=>{const w=big?370:360,y=56*Math.min(k,1.2),h=big?330:300;ctx.fillStyle=PAL['card'];rr(ctx,x,y,w,h,12);ctx.fill();ctx.strokeStyle=PAL[col];ctx.lineWidth=3;rr(ctx,x,y,w,h,12);ctx.stroke();
   txt(ctx,name,x+w/2,y+34*fs,{s:20*fs,w:700,a:'center'});
   txt(ctx,'Price: '+$2(price),x+w/2,y+70*fs,{s:15*fs,a:'center'});
   txt(ctx,'Earnings per share: '+(eps<0?'−':'')+$2(Math.abs(eps)),x+w/2,y+96*fs,{s:15*fs,a:'center',c:eps<0?PAL['s1']:PAL['cv-ink']});
   if(sh){if(pe===null){txt(ctx,'P/E: not meaningful',x+w/2,y+h*0.62,{s:24*fs,w:700,a:'center',c:PAL['s1']});txt(ctx,'The company lost money in 2025',x+w/2,y+h*0.62+28*fs,{s:13*fs,a:'center',c:PAL['cv-soft']});}
    else{txt(ctx,'P/E '+f1(pe),x+w/2,y+h*0.62,{s:32*fs,w:700,a:'center',c:PAL[col]});txt(ctx,$2(pe)+' for each $1 earned'+(big?'':' (one dot per $1)'),x+w/2,y+h*0.62+30*fs,{s:14*fs,a:'center',c:PAL['cv-soft']});
     if(!big){const n=Math.min(40,Math.round(pe)),cw=8,cx=x+w/2-Math.min(n,20)*cw/2;for(let i=0;i<n;i++){ctx.fillStyle=PAL[col];ctx.globalAlpha=0.75;ctx.beginPath();ctx.arc(cx+(i%20)*cw+4,y+h*0.85+Math.floor(i/20)*10,3.2,0,7);ctx.fill();}ctx.globalAlpha=1;}}}
   else txt(ctx,'P/E ?',x+w/2,y+h*0.62,{s:32*fs,w:700,a:'center',c:PAL['cv-soft']});};
  card(24,'s1','Netflix',sim.p.pa,CO.nflx.eps,peA(sim));card(big?406:416,'s2',B(sim).n,sim.p.pb,B(sim).eps,peB(sim));
  const G=sim.gutS&&sim.gutS.g;if(G&&!big)txt(ctx,'Your gut: '+G.label,400,big?420:385,{s:13,w:700,c:PAL['s4'],a:'center'});
  if(!sh)txt(ctx,locked(sim)?'Work out Netflix’s P/E first':'Lock in your gut to see the P/E ratios',400,420,{s:13*fs,c:PAL['cv-soft'],a:'center'});},
 narrate(sim){if(!shown(sim))return `Netflix costs ${$2(sim.p.pa)} a share and ${B(sim).n} ${$2(sim.p.pb)}. <b>Which one costs less for each dollar the company earns?</b>`;
  const b=peB(sim);if(b===null)return `Netflix’s P/E is <b>${f1(peA(sim))}</b>. ${B(sim).n} lost money in 2025 (EPS −$0.06), so a P/E would be negative and means nothing. You cannot pay “per $1 of earnings” when there are no earnings.`;
  return `Netflix: ${$2(sim.p.pa)} ÷ $${CO.nflx.eps} = <b>P/E ${f1(peA(sim))}</b>. ${B(sim).n}: ${$2(sim.p.pb)} ÷ $${B(sim).eps} = <b>P/E ${f1(b)}</b>. A lower P/E means you pay less for each $1 of today’s earnings, but investors may pay more for a company they expect to grow.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Look at the two prices. Pick one here: which share costs less for each $1 the company earns? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth(sim)?1:0,who:w,label:lab(sim)[w]};},
  solve(sim){const t=truth(sim);sim.p.who=t;return {v:1,who:t,label:lab(sim)[t]};},
  hint:{bio:'Lock in your gut. Then you will work out Netflix’s P/E yourself.'},
  calc:{get unit(){return atLeast('ap')?'%':'';},d:2,tol:0.3,
   prompt:{bio:sim=>`Netflix costs <b>${$2(sim.p.pa)}</b> a share and earned <b>$2.53</b> per share in 2025. What is its P/E ratio (price ÷ earnings per share)?`,
    honors:sim=>`Netflix earned $10,981.2 million in 2025 on 4,343.9 million diluted shares. Find its earnings per share, then its P/E at a price of <b>${$2(sim.p.pa)}</b>.`,
    ap:sim=>`Netflix earned $2.53 per share in 2025 and costs <b>${$2(sim.p.pa)}</b>. What is its earnings yield, EPS ÷ price, as a percent?`},
   answer:calcAns,
   hint:{bio:'Divide the price by $2.53.',ap:'Divide $2.53 by the price, then multiply by 100.'},
   steps(sim){if(atLeast('ap'))return [`$2.53 ÷ ${$2(sim.p.pa)} = ${(CO.nflx.eps/sim.p.pa).toFixed(4)}.`,`Earnings yield: <b>${(100*CO.nflx.eps/sim.p.pa).toFixed(2)}%</b>. It is 1 ÷ P/E: 1 ÷ ${f1(peA(sim))} ≈ ${(1/peA(sim)*100).toFixed(2)}%.`];
    const out=[];if(atLeast('honors'))out.push('EPS: $10,981.2 million ÷ 4,343.9 million shares ≈ $2.53.');
    out.push(`P/E: ${$2(sim.p.pa)} ÷ $2.53 = <b>${(peA(sim)).toFixed(2)}</b>.`,`You pay about ${$2(peA(sim))} for each $1 Netflix earned in a year.`);return out;}},
  formula(sim){const b=peB(sim);return `Netflix: ${$2(sim.p.pa)} ÷ $2.53 = ${f1(peA(sim))}<br>${B(sim).n}: `+(b===null?`${$2(sim.p.pb)} ÷ −$0.06 is negative: not meaningful`:`${$2(sim.p.pb)} ÷ $${B(sim).eps} = ${f1(b)}`);},
  how:{bio:'The math divides each price by its earnings per share, so both stocks are measured the same way: dollars paid per $1 earned.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You figured the ratio yourself, the same number quote pages print next to the price.':'';
   const b=peB(sim),real=b===null?` Netflix costs ${$2(peA(sim))} per $1 earned; ${B(sim).n} had no earnings to buy.`:` For $1,000 you buy ${$2(1000/peA(sim))} of Netflix’s yearly earnings or ${$2(1000/b)} of ${B(sim).n}’s.`;
   if(g0.who===m.who)return `Your gut was right: ${m.label}.`+real+self;
   return `Your gut said <b>${g0.label}</b>; the P/E says <b>${m.label}</b>. A share’s price tag alone can’t tell you; what it buys can.`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.pa=R([60,75,90,110,130]);sim.p.pb=R([45,60,70,80,95]);sim.p.who='same';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A company earns $4.00 per share and its stock costs $60. What is its P/E ratio?',answer:15,tol:0.01,unit:'',d:1,hint:'Price ÷ earnings per share.',explain:'$60 ÷ $4 = 15. You pay $15 for each $1 of yearly earnings.'},
  {lvl:'bio',instant:true,q:'Stock A costs $300 a share and Stock B costs $30. Which is cheaper?',choices:['B, because its price is lower','You can’t tell from price alone: compare price to earnings','A, because expensive stocks are better'],correct:1,explain:'A $300 share of a company earning $30 a share (P/E 10) costs less per dollar of earnings than a $30 share earning $1 (P/E 30).'},
  {lvl:'bio',instant:true,q:'Netflix split each share into 10 in November 2025. What happened to its P/E?',choices:['It dropped to a tenth','Nothing: price and earnings per share both dropped to a tenth','It rose 10 times'],correct:1,explain:'Ten times as many shares means a tenth of the earnings per share and a tenth of the price. The ratio does not change.'},
  {lvl:'honors',kind:'num',q:'A company earned $500 million on 200 million diluted shares. What are its earnings per share?',answer:2.5,tol:0.001,unit:'$',d:2,hint:'Net income ÷ shares.',explain:'$500 million ÷ 200 million = $2.50 a share.'},
  {lvl:'honors',instant:true,q:'Intel’s 2025 EPS was −$0.06. At $40 a share, what does a P/E of about −667 tell you?',choices:['It is very cheap','Nothing useful: P/E only works when the company has earnings','It is very expensive'],correct:1,explain:'With a loss, “dollars per $1 of earnings” has no meaning. Investors look at other numbers, such as sales, cash flow or future earnings estimates.'},
  {lvl:'ap',kind:'num',q:'A stock has a P/E of 25. What is its earnings yield, as a percent?',answer:4,tol:0.01,unit:'%',d:1,hint:'Earnings yield = 1 ÷ P/E.',explain:'1 ÷ 25 = 0.04, so 4%. Compare it with a savings rate or a bond yield.'},
  {lvl:'ap',instant:true,q:'Company X has P/E 35, Company Y has P/E 20. When could X still be the better buy?',choices:['Never','If X’s earnings grow much faster, so its future P/E on today’s price falls','If X’s share price is higher'],correct:1,explain:'P/E uses last year’s earnings. If X’s earnings double, today’s price is only 17.5 times those future earnings. That is why investors also look at growth (the PEG ratio).'}
 ],
 tour:[
  {title:'Two price tags',text:'Netflix at $90 a share, Coca-Cola at $70. Netflix costs more per share. Does that make it more expensive?',pause:true,setup:sim=>BioLab.setValues(sim,{pa:90,b:'ko',pb:70,reveal:true})},
  {title:'Earnings per share',text:'In 2025 Netflix earned $10,981.2 million on 4,343.9 million diluted shares: $2.53 a share. Coca-Cola earned $3.04 a share.',pause:true},
  {title:'Netflix’s P/E',text:'$90 ÷ $2.53 ≈ 35.6. You pay about $35.57 for each $1 Netflix earns in a year.',pause:true},
  {title:'Coca-Cola’s P/E',text:'$70 ÷ $3.04 ≈ 23.0. Coca-Cola costs less per dollar of earnings, even though it earns more per share.',pause:true},
  {title:'Why pay more?',text:'Investors pay a higher P/E when they expect earnings to grow. Netflix’s revenue grew about 16% in 2025; Coca-Cola’s grew about 2%. P/E is a starting question, not an answer.',pause:true},
  {lvl:'honors',title:'No earnings',text:'Intel lost money in 2025 (EPS −$0.06). A negative P/E means nothing; other measures are needed.',pause:true,setup:sim=>BioLab.setValues(sim,{b:'intc',pb:40,reveal:true})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{b:'ko',pb:70,reveal:false});},
 lab:{bio:'<p><b>Question:</b> How does price change the P/E?</p><ol><li>Turn on <b>Show the P/E ratios now</b>.</li><li>Look up today’s Netflix and Coca-Cola prices and type them in.</li><li>Record both P/E ratios.</li></ol><p>Which costs less per $1 of earnings today? Did it change from the example prices?</p>',
  honors:'<p><b>Question:</b> What does your Stock Market Challenge pick cost per $1 of earnings?</p><ol><li>Find your stock’s net income and diluted shares in its annual report (the earnings per share note).</li><li>Compute EPS and P/E by hand, then compare with a quote page.</li></ol><p>Explain any difference: which earnings did the quote page use?</p>',
  ap:'<p><b>Question:</b> How does P/E compare with a savings rate?</p><ol><li>Compute the earnings yield for both stocks.</li><li>Compare them with a 4% savings account.</li></ol><p><b>CER:</b> Why might investors accept an earnings yield below a savings rate?</p>'},
 terms:[
  {t:'Earnings per share (EPS)',d:'A company’s yearly profit divided by its shares.'},
  {t:'P/E ratio',d:'Price per share ÷ earnings per share: dollars paid for each $1 of yearly earnings.'},
  {t:'Diluted shares',d:'Shares outstanding plus shares that could be created from stock options and similar promises.',lvl:'honors'},
  {t:'Stock split',d:'Dividing each share into several. A 10-for-1 split makes ten shares at a tenth of the price; the company’s value does not change.',lvl:'honors'},
  {t:'Earnings yield',d:'EPS ÷ price, the reciprocal of P/E, as a percent.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> Full-year 2025 GAAP diluted earnings per share: Netflix $2.53 (net income $10,981.2 million ÷ 4,343.9 million diluted shares, adjusted for the November 2025 10-for-1 split; Netflix 2025 Form 10-K). Coca-Cola $3.04 (full-year 2025 results, Feb 10, 2026). Intel −$0.06 (full-year 2025 results, Jan 22, 2026). Prices are examples for practice, not quotes.</p><p><b>What this number hides.</b> P/E uses last year’s earnings, which can include one-time gains or charges; many sites also show a “forward” P/E based on estimates. A low P/E can mean a bargain or a business in trouble. Comparing P/E across very different industries can mislead.</p><p><b>This is a simplified model, not investment advice.</b></p>'
};
BioLab.register(SIM);
})();
