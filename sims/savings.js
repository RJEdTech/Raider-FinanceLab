(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* Two savings accounts, same money. APY = growth in one year with compounding included, so balance = A(1 + APY)ᵗ.
   Monthly deposits (Closer look) are added at each month's end and grow at the monthly factor (1 + APY)^(1/12). */
const AVG=0.38;
function bal(A,apy,yrs,D){const g=Math.pow(1+apy/100,1/12);let b=A;for(let m=0;m<Math.round(yrs*12);m++)b=b*g+D;return b;}
const dep=sim=>atLeast('honors')?+sim.p.dep:0;
const hi=sim=>bal(sim.p.amt,sim.p.apy,sim.p.yrs,dep(sim)),lo=sim=>bal(sim.p.amt,AVG,sim.p.yrs,dep(sim));
const gap=sim=>hi(sim)-lo(sim);
const put=sim=>sim.p.amt+dep(sim)*12*sim.p.yrs;
const realHi=sim=>hi(sim)/Math.pow(1+sim.p.inf/100,sim.p.yrs);
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const calcAns=sim=>atLeast('ap')?F.r2(realHi(sim)):F.r2(sim.p.amt*Math.pow(1+sim.p.apy/100,sim.p.yrs));

const SIM={
 id:'savings',hash:'savings',apUnit:3,order:2,tab:'Where should my summer money sit?',kind:'Simulation',
 skills:{bio:'Compound growth: A(1 + r)ᵗ · Personal Finance (Savings accounts)',honors:'Compound growth, APY and the rule of 72 · Personal Finance (Savings accounts)',ap:'Compound growth and real value after inflation · Personal Finance (Time value of money)'},
 card:'You saved $2,000 from a summer job. Guess how much more a high-yield account earns than the average bank account in 3 years, then let compound growth count it.',
 title:'Where should my summer money sit? APY, compounding and inflation',
 lede:{bio:'A savings account pays you interest, a percent of your balance. Next year you earn interest on the interest too: that is compounding. Banks must tell you the APY, the percent your money grows in a year with compounding counted, so you can compare accounts.',
  honors:'Money that grows by the same percent each year doubles in about 72 ÷ the percent years: the rule of 72. At 0.38% that is about 190 years; at 4% about 18.',
  ap:'Real value removes inflation: real balance = balance ÷ (1 + inflation)ᵗ. A savings rate below the inflation rate loses buying power even while the balance grows.'},
 scale:'One deposit, then (at Closer look) an optional deposit at the end of each month. Rates are held steady, which real rates are not.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your savings',
 controls:[
  {id:'guess',label:'Your gut: how much more does the high-yield account earn?',type:'range',min:0,max:5000,step:10,def:60,unit:' dollars'},
  {id:'amt',label:'Money you deposit now',type:'range',min:500,max:5000,step:100,def:2000,unit:' dollars',noGut:true,onChange:clear},
  {id:'yrs',label:'Years you leave it',type:'range',min:1,max:10,step:1,def:3,unit:' yr',noGut:true,onChange:clear},
  {id:'apy',label:'High-yield account APY',type:'range',min:2,max:5,step:0.05,def:4,unit:'%',d:2,noGut:true,onChange:clear,help:'Many online banks paid about 4% in 2026. The average savings account paid 0.38% (FDIC). Rates change often.'},
  {id:'dep',label:'Add every month',type:'range',min:0,max:100,step:5,def:0,unit:' dollars',lvl:'honors',noGut:true,onChange:clear},
  {id:'inf',label:'Inflation per year',type:'range',min:0,max:6,step:0.1,def:3.7,unit:'%',d:1,lvl:'ap',noGut:true,onChange:clear,help:'Prices rose 3.7% in the 12 months to September 2026 (CPI-U).'},
  {id:'reveal',label:'Show the balances now',type:'toggle',def:false,help:'Normally they appear once you lock in your gut answer.'}
 ],
 actions:[{id:'ten',label:'Leave it 10 years',run(sim){BioLab.setValues(sim,{yrs:10,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'put',label:'Money you put in',unit:'dollars',d:2,min:0,max:null,get:put},
  {id:'lo',label:'Average account (0.38%)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?lo(sim):null},
  {id:'hi',label:'High-yield account',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?hi(sim):null},
  {id:'gap',label:'Extra from the high-yield account',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?gap(sim):null},
  {id:'dbl',label:'Years to double at the high-yield rate (rule of 72)',unit:'years',d:1,lvl:'honors',min:0,max:null,get:sim=>72/sim.p.apy},
  {id:'dblx',label:'Years to double, exact: ln 2 ÷ ln(1 + r)',unit:'years',d:2,lvl:'honors',min:0,max:null,get:sim=>Math.log(2)/Math.log(1+sim.p.apy/100)},
  {id:'real',label:'High-yield balance in today’s dollars',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?realHi(sim):null},
  {id:'realLo',label:'Average-account balance in today’s dollars',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?lo(sim)/Math.pow(1+sim.p.inf/100,sim.p.yrs):null}
 ],
 graphs:[{id:'path',label:'Balance over time',custom:true}],defaultGraph:'path',
 plot(sim,ctx,box){const Y=sim.p.yrs,top=Math.max(hi(sim),put(sim))*1.08;const ax=axes(ctx,box,{xmin:0,xmax:Y,ymin:0,ymax:top,xl:'Years',yl:'Balance ($)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the balances',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  [[AVG,PAL['s4']],[sim.p.apy,PAL['s3']]].forEach(([r,c])=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=Y*12;i++){const v=bal(sim.p.amt,r,i/12,dep(sim));i?ctx.lineTo(ax.X(i/12),ax.Y(v)):ctx.moveTo(ax.X(0),ax.Y(v));}ctx.stroke();});
  legend(ctx,box.L+10,box.T+8,[{label:'High-yield '+sim.p.apy.toFixed(2)+'%',color:PAL['s3']},{label:'Average 0.38%',color:PAL['s4']}]);},
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim)&&stg>=2,fs=Math.min(k,1.5),big=k>1.3,y1=stg===2;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,$(sim.p.amt)+(dep(sim)?' + '+$(dep(sim))+' a month':'')+' for '+sim.p.yrs+' year'+(sim.p.yrs>1?'s':''),24,32*Math.min(k,1.2),{s:17*fs,w:700});
  const acct=(x,col,name,rate,v)=>{const w=big?360:350,h=big?240:220,y=58*Math.min(k,1.2);ctx.fillStyle=PAL['card'];rr(ctx,x,y,w,h,12);ctx.fill();ctx.strokeStyle=PAL[col];ctx.lineWidth=3;rr(ctx,x,y,w,h,12);ctx.stroke();
   txt(ctx,name,x+w/2,y+32*fs,{s:16*fs,w:700,a:'center'});txt(ctx,rate+' APY',x+w/2,y+58*fs,{s:14*fs,a:'center',c:PAL['cv-soft']});
   txt(ctx,sh?$2(v):'?',x+w/2,y+h*0.62,{s:32*fs,w:700,a:'center',c:PAL[col]});
   if(sh)txt(ctx,y1?'after 1 year: earned '+$2(v-sim.p.amt):'earned '+$2(v-put(sim)),x+w/2,y+h*0.84,{s:14*fs,a:'center',c:y1?PAL['rj']:PAL['cv-soft'],w:y1?700:400});
   if(y1){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(x+30,y+h*0.62-38*fs,w-60,h*0.84-h*0.62+50*fs);}};
  acct(24,'s4','Average bank account','0.38%',y1?bal(sim.p.amt,AVG,1,0):lo(sim));acct(big?416:426,'s3','High-yield account',sim.p.apy.toFixed(2)+'%',y1?bal(sim.p.amt,sim.p.apy,1,0):hi(sim));
  const yb=big?340:318;
  if(stg===3){const n=Math.min(sim.p.yrs,5),bw=(big?752:520)/n;txt(ctx,'Interest the high-yield account earns each year',24,yb+18,{s:14*fs,w:700,c:PAL['s3']});
   let b=sim.p.amt,mxI=bal(sim.p.amt,sim.p.apy,n,0)*sim.p.apy/100;for(let i=0;i<n;i++){const I=b*sim.p.apy/100,hh=60*fs*I/mxI,x=24+i*bw;ctx.fillStyle=PAL['s3'];ctx.fillRect(x,yb+100*fs-hh,bw*0.7,hh);txt(ctx,'Year '+(i+1)+': '+$2(I),x,yb+118*fs,{s:12.5*fs,w:700});b+=I;}
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(14,yb-2,(big?772:540),126*fs);}
  else if(stg<4){}
  else if(sh){if(stg===4){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(14,yb-2,(big?772:520),32*fs);}txt(ctx,'The high-yield account earns '+$2(gap(sim))+' more',24,yb+20,{s:16*fs,w:700,c:PAL['s3']});
   if(atLeast('ap')&&stg===6){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(14,yb+30*fs,(big?772:600),26*fs);}
   if(atLeast('ap')&&(stg>=6))txt(ctx,'In today’s dollars (prices up '+sim.p.inf.toFixed(1)+'% a year): '+$2(realHi(sim))+' vs. '+$2(put(sim))+' put in',24,yb+48*fs,{s:13*fs,c:PAL['cv-soft']});}
  else txt(ctx,locked(sim)?'Work out the high-yield balance to see both accounts':'Lock in your gut to see the balances',24,yb+20,{s:14*fs,c:PAL['cv-soft']});
  const G=sim.gutS&&sim.gutS.g;if(G&&!big&&stg>=99)txt(ctx,'Your gut: '+G.label+' more',776,yb+20,{s:13,w:700,c:PAL['s4'],a:'right'});},
 narrate(sim){if(!shown(sim))return `Same ${$(sim.p.amt)}, two accounts: 0.38% and ${sim.p.apy.toFixed(2)}% a year. <b>How much more does the high-yield account earn in ${sim.p.yrs} year${sim.p.yrs>1?'s':''}?</b>`;
  return `The high-yield account ends at ${$2(hi(sim))} and the average account at ${$2(lo(sim))}: <b>${$2(gap(sim))} more</b> for moving the same money. Each year’s interest earns interest the next year.`+(atLeast('ap')?` After ${sim.p.inf.toFixed(1)}% inflation, the high-yield money buys what ${$2(realHi(sim))} buys today.`:'');},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to how many more dollars you think the high-yield account earns. Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-gap(sim)),g:sim.p.guess,label:$(sim.p.guess)};},
  solve(sim){const t=gap(sim);sim.p.guess=clamp(Math.round(t/10)*10,0,5000);return {v:Math.abs(sim.p.guess-t)<=5?0:Math.abs(sim.p.guess-t),g:t,label:$2(t)};},
  hint:{bio:'Lock in your gut. Then you will grow the deposit yourself.'},
  calc:{unit:'$',d:2,tol:0.6,
   prompt:{bio:sim=>`Your <b>${$(sim.p.amt)}</b> grows ${sim.p.apy.toFixed(2)}% a year, so each year it is multiplied by ${(1+sim.p.apy/100).toFixed(4)}. ${dep(sim)?'Leave out the monthly deposits. ':''}What is it after <b>${sim.p.yrs}</b> year${sim.p.yrs>1?'s':''}?`,
    ap:sim=>`The high-yield balance after ${sim.p.yrs} years is <b>${$2(hi(sim))}</b>. Prices rise ${sim.p.inf.toFixed(1)}% a year. Divide by (1 + inflation)ᵗ to find what it buys in today’s dollars.`},
   answer:calcAns,
   hint:{bio:'Raise the growth factor to the number of years, then multiply by the deposit.',ap:'Find 1.037 raised to the number of years first (or your inflation rate).'},
   steps(sim){if(atLeast('ap')){const f=Math.pow(1+sim.p.inf/100,sim.p.yrs);return [`Price factor: ${(1+sim.p.inf/100).toFixed(3)}^${sim.p.yrs} = ${f.toFixed(4)}.`,`${$2(hi(sim))} ÷ ${f.toFixed(4)} = <b>${$2(realHi(sim))}</b> in today’s dollars.`];}
    const f=Math.pow(1+sim.p.apy/100,sim.p.yrs);return [`Growth factor: ${(1+sim.p.apy/100).toFixed(4)}^${sim.p.yrs} = ${f.toFixed(4)}.`,`${$(sim.p.amt)} × ${f.toFixed(4)} = <b>${$2(sim.p.amt*f)}</b>.`,`At 0.38%: ${$(sim.p.amt)} × ${Math.pow(1.0038,sim.p.yrs).toFixed(4)} = ${$2(sim.p.amt*Math.pow(1.0038,sim.p.yrs))}.`];}},
  formula(sim){const A=$(sim.p.amt),n=sim.p.yrs;return dep(sim)?`Each month the balance is multiplied by (1 + APY)^(1/12), then ${$(dep(sim))} is added, for ${n*12} months.<br>High-yield ${$2(hi(sim))} − average ${$2(lo(sim))} = ${$2(gap(sim))}`:`${A} × ${(1+sim.p.apy/100).toFixed(4)}^${n} = ${$2(hi(sim))} and ${A} × 1.0038^${n} = ${$2(lo(sim))}<br>Difference: ${$2(gap(sim))}`;},
  how:{bio:'Each year the balance is multiplied by 1 + the APY. After t years that is (1 + APY)ᵗ, so the gap between two rates grows every year.'},
  compare(sim,g0,m){const t=gap(sim),K=sim.ui.calc,self=K&&K.done&&K.correct?' You grew the deposit yourself with the growth factor.':'';
   if(Math.abs(g0.g-t)<=Math.max(15,0.1*t))return `Your gut was close: the high-yield account earns ${$2(t)} more.`+self;
   return `Your gut said ${$(g0.g)}; the math says <b>${$2(t)}</b> more, for doing nothing but choosing the account. ${g0.g<t?'Compounding at a higher rate is worth more than it feels like.':'The gap is real but smaller than your gut thought over this short a time.'}`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.amt=R([800,1500,2000,2500,3000,4000]);sim.p.yrs=R([1,2,3,4,5]);sim.p.apy=R([3.5,3.75,4,4.25,4.5]);sim.p.guess=60;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You deposit $1,500 at 4% APY and add nothing. To the cent, what is the balance after 2 years?',answer:1622.40,tol:0.01,unit:'$',d:2,hint:'1.04² = 1.0816.',explain:'$1,500 × 1.0816 = $1,622.40. Year 1 earns $60, year 2 earns $62.40: interest on the interest.'},
  {lvl:'bio',instant:true,q:'Why does the second year earn more interest than the first?',choices:['The bank raises the rate','You earn interest on last year’s interest too','It doesn’t: every year earns the same'],correct:1,explain:'The balance is bigger in year 2 because it includes year 1’s interest, and the same percent of a bigger number is bigger. That is compounding.'},
  {lvl:'bio',instant:true,q:'Two accounts are FDIC insured. One pays 0.38% APY, one pays 4%. Which is safer?',choices:['The 0.38% account','The 4% account','They are equally protected up to $250,000 each'],correct:2,explain:'FDIC insurance covers deposits up to $250,000 per depositor, per bank, per ownership type, whatever the rate. The difference is the rate, not the safety.'},
  {lvl:'honors',kind:'num',q:'Use the rule of 72: at 4% a year, about how many years does money take to double?',answer:18,tol:0.01,unit:'years',d:0,hint:'72 ÷ 4.',explain:'72 ÷ 4 = 18 years. The exact answer is ln 2 ÷ ln 1.04 ≈ 17.67 years.'},
  {lvl:'honors',instant:true,q:'An account pays 4.00% interest compounded monthly. What is its APY?',choices:['Exactly 4.00%','About 4.07%','About 4.80%'],correct:1,explain:'(1 + 0.04 ÷ 12)¹² − 1 ≈ 0.0407. APY counts the interest on interest during the year.'},
  {lvl:'ap',kind:'num',q:'$2,000 grows to $2,249.73 in 3 years while prices rise 3.7% a year. To the cent, what is it worth in today’s dollars?',answer:2017.41,tol:0.02,unit:'$',d:2,hint:'Divide by 1.037³.',explain:'1.037³ ≈ 1.1152, and $2,249.73 ÷ 1.1152 ≈ $2,017.41. It barely beat inflation. At 0.38%, the $2,022.89 balance is worth only $1,813.99 in today’s dollars.'},
  {lvl:'ap',instant:true,q:'Your account pays 2% and inflation is 3%. About what is your real rate of return?',choices:['+5%','About −1%','+2%'],correct:1,explain:'Real return ≈ 2% − 3% = −1% a year. Exactly: 1.02 ÷ 1.03 − 1 ≈ −0.97%.'}
 ],
 tour:[
  {title:'Same money, two accounts',text:'You have $2,000 from a summer job. The average savings account paid 0.38% in 2026; many online banks paid about 4%.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{amt:2000,yrs:3,apy:4,dep:0,inf:3.7,reveal:true});}},
  {title:'Year one',text:'At 4%: $2,000 × 1.04 = $2,080. At 0.38%: $2,007.60.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Interest on interest',text:'Year two earns 4% of $2,080, which is $83.20, more than year one’s $80. After three years: $2,000 × 1.04³ = $2,249.73.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'The gap',text:'The average account reaches $2,022.89, so the high-yield account earns $226.84 more for the same money.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Give it time',text:'Leave it 10 years and the gap grows to $883.18: $2,960.49 against $2,077.31.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{yrs:10,reveal:true});}},
  {lvl:'ap',title:'Against inflation',text:'At 3.7% inflation, 10 years of high-yield growth is worth $2,058.62 in today’s dollars. The average account’s balance is worth only $1,444.49.',pause:true,setup:sim=>{sim.tst=6;}}
 ],
 lab:{bio:'<p><b>Question:</b> How does time change the gap?</p><ol><li>Turn on <b>Show the balances now</b>. Keep $2,000 at 4%.</li><li>Record <b>Extra from the high-yield account</b> for 1, 2, 4, 6, 8 and 10 years.</li></ol><p>Does the gap grow by the same amount each year? Explain why not.</p>',
  honors:'<p><b>Question:</b> Which matters more, the rate or adding money?</p><ol><li>Over 5 years, record the high-yield balance with $0, $25, $50 and $100 a month.</li><li>Then keep $0 a month and try 3%, 4% and 5%.</li></ol><p>Which change added more? Use the rule of 72 to explain the rate results.</p>',
  ap:'<p><b>Question:</b> When does saving beat inflation?</p><ol><li>Set inflation to 3.7%. Record the high-yield balance in today’s dollars for APYs from 2% to 5%.</li><li>Find the APY where today’s-dollar value equals what you put in.</li></ol><p><b>CER:</b> Explain the result with (1 + APY)ᵗ ÷ (1 + inflation)ᵗ.</p>'},
 terms:[
  {t:'Interest',d:'Money a bank pays you for keeping your money there, as a percent of your balance.'},
  {t:'Compounding',d:'Earning interest on earlier interest, so growth builds on growth.'},
  {t:'APY',d:'Annual percentage yield: how much your money grows in one year, with compounding counted. Banks must show it.'},
  {t:'FDIC insurance',d:'Federal protection for bank deposits, up to $250,000 per depositor, per insured bank, per ownership category.'},
  {t:'Rule of 72',d:'Years to double ≈ 72 ÷ the yearly percent.',lvl:'honors'},
  {t:'Real value',d:'A future amount divided by (1 + inflation)ᵗ, in today’s buying power.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Balance = deposit × (1 + APY)ᵗ. With monthly deposits, each month the balance grows by (1 + APY)^(1/12) and then the deposit is added. Real value = balance ÷ (1 + inflation)ᵗ.</p><p><b>Where the rates come from.</b> The FDIC’s national average savings rate was 0.38% in August 2026. Top online savings accounts paid about 4% in mid-2026; 4% is a round number for illustration, and real rates move up and down with the Federal Reserve. Inflation: the CPI-U rose 3.7% in the 12 months to September 2026 (BLS).</p><p><b>What this number hides.</b> Interest is taxable income. A high-yield rate can drop at any time, and some accounts need a minimum balance. Check that a bank is FDIC insured (or a credit union is NCUA insured) before you move money.</p><p><b>This is a simplified model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
