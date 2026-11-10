(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const F=window.FIN,$=F.money,$2=F.money2;
/* Two made-up card offers, priced for one year of a student's habits.
   Paid in full every month: no interest (the grace period), so the cost is the annual fee.
   Carrying a balance B all year: interest ≈ B × APR (interest paid each month, balance held steady), plus the fee.
   Paying 60+ days late once: a late fee, and the penalty APR on the balance for 6 months, until six on-time payments (CARD Act). */
const OF={a:{n:'Campus Card',fee:0,apr:24.99,late:30,pen:29.99,col:'s2'},b:{n:'Low-Rate Card',fee:39,apr:15.99,late:30,pen:29.99,col:'s5'}};
const HAB={full:'Pays the whole bill every month',carry:'Carries a balance all year',late:'Carries a balance and pays 60 days late once'};
function cost(o,sim){const B=sim.p.habit==='full'?0:sim.p.bal;if(sim.p.habit==='full')return o.fee;
 if(sim.p.habit==='carry')return o.fee+B*o.apr/100;return o.fee+o.late+B*(o.apr/100)*0.5+B*(o.pen/100)*0.5;}
const cA=sim=>F.r2(cost(OF.a,sim)),cB=sim=>F.r2(cost(OF.b,sim));
const truth=sim=>Math.abs(cA(sim)-cB(sim))<5?'same':cA(sim)<cB(sim)?'a':'b';
const WHO={a:'Campus Card',b:'Low-Rate Card',same:'About the same'};
const brk=()=>OF.b.fee/((OF.a.apr-OF.b.apr)/100);
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const B=sim=>sim.p.habit==='full'?0:sim.p.bal;
function calcAns(sim){if(atLeast('ap'))return F.r2(brk());if(atLeast('honors'))return F.r2(Math.max(B(sim),100)*OF.a.apr/100/365*30);return F.r2(Math.max(B(sim),100)*OF.a.apr/100);}

const SIM={
 id:'cardoffer',hash:'cardoffer',apUnit:5,order:1,tab:'Which card offer costs less?',kind:'Simulation',
 skills:{bio:'Percent of a number and comparing totals · Personal Finance (Credit cards)',honors:'Rates per day and per year: daily periodic rate · Personal Finance (Credit cards)',ap:'Linear functions and their break-even point · Personal Finance (Understanding a credit card offer)'},
 card:'Two card offers: no fee at 24.99%, or a $39 fee at 15.99%. Guess which costs you less this year, then price out the fine print for your own habits.',
 title:'Which card offer costs less? Reading the fine print',
 lede:{bio:'Every card offer has a box of rates and fees. The APR is the yearly interest rate on any balance you don’t pay off. If you pay the whole bill by the due date every month, you pay no interest at all, so the only cost is the fees.',
  honors:'Card interest is figured daily: the daily periodic rate is APR ÷ 365. A month of interest on a balance is about balance × APR ÷ 365 × days in the billing cycle.',
  ap:'For a balance B carried all year, each card’s cost is a linear function: cost = fee + B × APR. The two lines cross at the break-even balance, where fee difference = B × APR difference.'},
 scale:'Two made-up offers, priced for one year. The balance is held steady, and its interest is paid each month.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your habits',
 controls:[
  {id:'who',label:'Your gut: which card costs you less this year?',type:'seg',def:'a',options:[{v:'a',l:WHO.a},{v:'b',l:WHO.b},{v:'same',l:WHO.same}]},
  {id:'habit',label:'How you use the card',type:'seg',def:'carry',noGut:true,onChange:clear,options:Object.keys(HAB).map(k=>({v:k,l:HAB[k]}))},
  {id:'bal',label:'Balance you carry from month to month',type:'range',min:100,max:3000,step:50,def:800,unit:' dollars',noGut:true,onChange:clear,help:'Ignored if you pay the whole bill every month.'},
  {id:'reveal',label:'Show the costs now',type:'toggle',def:false,help:'Normally they appear once you lock in your gut answer.'}
 ],
 actions:[{id:'full',label:'Pay in full every month',run(sim){BioLab.setValues(sim,{habit:'full',reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'cA',label:'Campus Card: cost this year',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?cA(sim):null},
  {id:'cB',label:'Low-Rate Card: cost this year',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?cB(sim):null},
  {id:'diff',label:'You save by choosing the cheaper card',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?Math.abs(cA(sim)-cB(sim)):null},
  {id:'dpr',label:'Campus Card daily periodic rate',unit:'%',d:4,lvl:'honors',min:0,max:null,get:()=>OF.a.apr/365},
  {id:'brk',label:'Break-even balance (carried all year)',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?brk():null}
 ],
 graphs:[{id:'lines',label:'Cost for a year vs. balance carried',custom:true}],defaultGraph:'lines',
 plot(sim,ctx,box){const X=3000,Y=OF.b.fee+X*OF.a.apr/100*1.05;const ax=axes(ctx,box,{xmin:0,xmax:X,ymin:0,ymax:Y,xl:'Balance carried all year ($)',yl:'Cost ($)'});
  [[OF.a,PAL['s2']],[OF.b,PAL['s5']]].forEach(([o,c])=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(o.fee));ctx.lineTo(ax.X(X),ax.Y(o.fee+X*o.apr/100));ctx.stroke();});
  if(shown(sim)){const b=brk();ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(b),ax.Y(b*OF.a.apr/100),5,0,7);ctx.fill();txt(ctx,'break-even '+$(b),ax.X(b)+8,ax.Y(b*OF.a.apr/100)-8,{s:12,w:700,c:PAL['s4']});}
  legend(ctx,box.L+10,box.T+8,[{label:'Campus Card: 0 + 0.2499B',color:PAL['s2']},{label:'Low-Rate Card: 39 + 0.1599B',color:PAL['s5']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,'You: '+HAB[sim.p.habit].toLowerCase()+(sim.p.habit==='full'?'':', about '+$(sim.p.bal)),24,32*Math.min(k,1.2),{s:15.5*fs,w:700});
  const box=(x,o,c)=>{const w=big?370:360,y=52*Math.min(k,1.2),h=big?230:210;ctx.fillStyle=PAL['card'];rr(ctx,x,y,w,h,10);ctx.fill();ctx.strokeStyle=PAL[o.col];ctx.lineWidth=3;rr(ctx,x,y,w,h,10);ctx.stroke();
   txt(ctx,o.n,x+16,y+30*fs,{s:18*fs,w:700});
   const rows=[['APR for purchases',o.apr.toFixed(2)+'%'],['Penalty APR',o.pen.toFixed(2)+'%'],['Annual fee',o.fee?'$'+o.fee:'None'],['Late payment fee','Up to $'+o.late]];
   rows.forEach(([a,b],i)=>{const yy=y+(60+i*(big?36:32))*fs;txt(ctx,a,x+16,yy,{s:13.5*fs});txt(ctx,b,x+w-16,yy,{s:13.5*fs,w:700,a:'right'});ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+16,yy+10*fs);ctx.lineTo(x+w-16,yy+10*fs);ctx.stroke();});
   const cy=y+h+(big?42:36)*fs;txt(ctx,'Your cost this year: '+(sh?$2(c):'?'),x+w/2,cy,{s:16*fs,w:700,a:'center',c:sh?PAL[o.col]:PAL['cv-soft']});};
  box(24,OF.a,cA(sim));box(big?406:416,OF.b,cB(sim));
  const yb=big?400:385;
  if(sh){const t=truth(sim);txt(ctx,t==='same'?'About the same cost for you':(WHO[t]+' saves you '+$2(Math.abs(cA(sim)-cB(sim)))+' this year'),400,yb,{s:15*fs,w:700,a:'center',c:PAL['s3']});}
  else txt(ctx,locked(sim)?'Work out the interest to see the costs':'Lock in your gut to price out both offers',400,yb,{s:13*fs,a:'center',c:PAL['cv-soft']});
  const G=sim.gutS&&sim.gutS.g;if(G&&!big)txt(ctx,'Your gut: '+G.label,400,yb+26,{s:13,w:700,a:'center',c:PAL['s4']});},
 narrate(sim){if(!shown(sim))return `One card has no fee and a 24.99% APR; the other charges $39 a year at 15.99%. You ${HAB[sim.p.habit].toLowerCase()}. <b>Which costs you less?</b>`;
  if(sim.p.habit==='full')return `Paying the whole bill by the due date means <b>no interest on either card</b>, so only the fee counts: the Campus Card costs $0 and the Low-Rate Card $39. The APR only matters if you carry a balance.`;
  return `Carrying about ${$(sim.p.bal)}: the Campus Card costs ${$2(cA(sim))} and the Low-Rate Card ${$2(cB(sim))}${sim.p.habit==='late'?', each including a late fee and six months at the 29.99% penalty rate':''}. Above about ${$(brk())} carried, the lower rate pays for its fee.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Pick one here: for the way you use a card, which offer costs you less this year? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth(sim)?1:0,who:w,label:WHO[w]};},
  solve(sim){const t=truth(sim);sim.p.who=t;return {v:1,who:t,label:WHO[t]};},
  hint:{bio:'Lock in your gut. Then you will work out a year of interest on the Campus Card yourself.'},
  calc:{unit:'$',d:2,tol:0.6,
   prompt:{bio:sim=>`Suppose you carry <b>${$(Math.max(B(sim),100))}</b> on the Campus Card all year at a 24.99% APR. About how much interest is that for the year?`,
    honors:sim=>`The Campus Card’s APR is 24.99%, so its daily rate is 24.99% ÷ 365. How much interest does a <b>${$(Math.max(B(sim),100))}</b> balance build in a 30-day billing cycle?`,
    ap:sim=>`For a balance B carried all year, Campus Card cost = 0.2499B and Low-Rate Card cost = 39 + 0.1599B. At what balance B do they cost the same?`},
   answer:calcAns,
   hint:{bio:'Change 24.99% to 0.2499 and multiply.',honors:'Daily rate = 0.2499 ÷ 365 ≈ 0.000685. Multiply by the balance and by 30.',ap:'Set the two costs equal and solve for B.'},
   steps(sim){const b=Math.max(B(sim),100);if(atLeast('ap'))return ['0.2499B = 39 + 0.1599B','0.09B = 39',`B = 39 ÷ 0.09 = <b>${$2(brk())}</b>. Carry more than that and the lower rate wins; less, and no fee wins.`];
    if(atLeast('honors'))return [`Daily rate: 0.2499 ÷ 365 = ${(0.2499/365).toFixed(6)}.`,`${$(b)} × ${(0.2499/365).toFixed(6)} × 30 = <b>${$2(calcAns(sim))}</b> for the month.`];
    return [`${$(b)} × 0.2499 = <b>${$2(b*0.2499)}</b> of interest in a year.`,'On the Low-Rate Card: '+$(b)+' × 0.1599 = '+$2(b*0.1599)+', plus its $39 fee.'];}},
  formula(sim){const b=B(sim);if(sim.p.habit==='full')return 'No balance, so no interest. Campus Card: $0 fee. Low-Rate Card: $39 fee.';
   if(sim.p.habit==='carry')return `Campus Card: $0 + ${$(b)} × 24.99% = ${$2(cA(sim))}<br>Low-Rate Card: $39 + ${$(b)} × 15.99% = ${$2(cB(sim))}`;
   return `Campus Card: $0 + $30 + ${$(b)} × (24.99% × ½ + 29.99% × ½) = ${$2(cA(sim))}<br>Low-Rate Card: $39 + $30 + ${$(b)} × (15.99% × ½ + 29.99% × ½) = ${$2(cB(sim))}`;},
  how:{bio:'The math adds the fees you would really pay to the interest on the balance you would really carry. Your habits decide which line of the fine print matters.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You priced the interest yourself, the same way the statement does.':'';
   const real=` For you: Campus Card ${$2(cA(sim))}, Low-Rate Card ${$2(cB(sim))} this year.`;
   if(g0.who===m.who)return `Your gut was right: ${m.label}.`+real+self;
   return `Your gut picked <b>${g0.label}</b>; for your habits the math picks <b>${m.label}</b>. ${sim.p.habit==='full'?'If you never carry a balance, the APR never costs you anything.':'When you carry a balance, the rate can matter more than the fee.'}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.habit=R(Object.keys(HAB));sim.p.bal=R([200,300,400,600,800,1200,2000]);sim.p.who='a';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You carry $600 all year on a card with a 22.36% APR (the average for accounts paying interest in fall 2026). About how much interest is that?',answer:134.16,tol:0.5,unit:'$',d:2,hint:'Multiply $600 by 0.2236.',explain:'$600 × 0.2236 ≈ $134.16 in a year.'},
  {lvl:'bio',instant:true,q:'You pay your whole statement balance by the due date every month. What does the APR cost you?',choices:['The APR on your purchases','Nothing: with a grace period, no interest is charged','Half the APR'],correct:1,explain:'Most cards give a grace period: pay the full statement balance by the due date and purchases are charged no interest. The APR only matters when you carry a balance.'},
  {lvl:'bio',instant:true,q:'A starter card has a $250 credit limit, a $20 annual fee, a $20 setup fee and a $1 monthly fee, all charged at the start. About how much credit can you actually use?',choices:['$250','About $209','About $150'],correct:1,explain:'$250 − $20 − $20 − $1 = $209. The fees use up your credit before you buy anything, which is how the class’s sample offer ends at about $209.'},
  {lvl:'honors',kind:'num',q:'APR 21% on a $1,000 balance. To the cent, how much interest builds in a 31-day billing cycle?',answer:17.84,tol:0.02,unit:'$',d:2,hint:'Daily rate = 0.21 ÷ 365.',explain:'0.21 ÷ 365 ≈ 0.000575; $1,000 × 0.000575 × 31 ≈ $17.84.'},
  {lvl:'honors',instant:true,q:'Your payment is 60 days late, and the card switches your balance to a 29.99% penalty APR. Under federal rules, when must it come back down?',choices:['Never','After six on-time payments in a row','After one year no matter what'],correct:1,explain:'Under the federal CARD Act, if a penalty rate was triggered by a 60-day late payment, the issuer must lower it again after you make six consecutive on-time minimum payments.'},
  {lvl:'ap',kind:'num',q:'Card X: no fee, 26% APR. Card Y: $95 fee, 16% APR. Carrying B all year, at what balance do they cost the same?',answer:950,tol:0.5,unit:'$',d:0,hint:'0.26B = 95 + 0.16B.',explain:'0.10B = 95, so B = $950. Above $950, Card Y costs less.'},
  {lvl:'ap',instant:true,q:'Why is cost = fee + B × APR only an estimate for a real card?',choices:['Real balances change each day and unpaid interest compounds','Card companies don’t use APR','It is exact'],correct:0,explain:'Interest is charged on the average daily balance, and interest you don’t pay is added to the balance, so it compounds. The linear model assumes a steady balance with interest paid each month.'}
 ],
 tour:[
  {title:'Two offers',text:'The Campus Card has no annual fee and a 24.99% APR. The Low-Rate Card charges $39 a year and has a 15.99% APR.',pause:true,setup:sim=>BioLab.setValues(sim,{habit:'carry',bal:800,reveal:true})},
  {title:'Pay in full',text:'If you pay the whole bill by the due date every month, neither card charges interest. Campus Card: $0. Low-Rate Card: $39.',pause:true,setup:sim=>BioLab.setValues(sim,{habit:'full',reveal:true})},
  {title:'Carry $800',text:'Campus Card: $800 × 24.99% = $199.92. Low-Rate Card: $39 + $800 × 15.99% = $166.92. Now the lower rate wins by $33.',pause:true,setup:sim=>BioLab.setValues(sim,{habit:'carry',bal:800,reveal:true})},
  {title:'Break-even',text:'The fee is worth paying once 9% of your balance beats $39: $39 ÷ 0.09 ≈ $433.33.',pause:true},
  {title:'One late payment',text:'Pay 60 days late once and you pay a late fee, and the penalty APR can apply to your balance for six months. On $800: Campus Card $249.92, Low-Rate Card $252.92, about the same.',pause:true,setup:sim=>BioLab.setValues(sim,{habit:'late',bal:800,reveal:true})},
  {lvl:'honors',title:'Daily interest',text:'Card interest builds every day at APR ÷ 365. At 24.99% that is 0.0685% a day: about $16.43 a month on $800.',pause:true,setup:sim=>BioLab.setValues(sim,{habit:'carry',bal:800,reveal:true})}
 ],
 lab:{bio:'<p><b>Question:</b> When is the no-fee card the better deal?</p><ol><li>Choose <b>Carries a balance all year</b> and turn on <b>Show the costs now</b>.</li><li>Record both costs at balances of $100, $300, $500, $800 and $1,500.</li></ol><p>Write a rule: who should take each card?</p>',
  honors:'<p><b>Question:</b> What does one late payment cost?</p><ol><li>At $800, record both costs for <b>Carries a balance all year</b> and for <b>pays 60 days late once</b>.</li><li>Find the difference for each card.</li></ol><p>Read the class’s sample credit card offer. Which line in it would you check first?</p>',
  ap:'<p><b>Question:</b> Where do the lines cross?</p><ol><li>Write each card’s yearly cost as a linear function of the balance.</li><li>Solve for the break-even balance and check it on the graph.</li></ol><p><b>CER:</b> Change the fee to $95. Predict the new break-even balance, then explain why the slope difference matters most.</p>'},
 terms:[
  {t:'APR',d:'Annual percentage rate: the yearly interest rate on a balance you carry.'},
  {t:'Grace period',d:'The time between the end of a billing cycle and the due date. Pay the full statement balance by then and purchases are charged no interest.'},
  {t:'Annual fee',d:'A yearly charge just for having the card.'},
  {t:'Penalty APR',d:'A higher rate a card can charge after you pay very late.'},
  {t:'Daily periodic rate',d:'APR ÷ 365, the rate charged on each day’s balance.',lvl:'honors'},
  {t:'Break-even point',d:'The input where two costs are equal: where two lines cross.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Two made-up offers. Paid in full: cost = annual fee. Carrying a steady balance B with interest paid each month: cost = fee + B × APR. Paying 60 days late once: a $30 late fee, then the penalty APR on the balance for six months before six on-time payments bring it back down, as the federal CARD Act requires for penalty rates triggered by a 60-day late payment.</p><p><b>Real rates.</b> In the third quarter of 2026, U.S. bank card accounts that paid interest were charged an average of 22.36% APR (Federal Reserve G.19, Nov 6, 2026, preliminary).</p><p><b>What this number hides.</b> Real interest is charged on the average daily balance and compounds when you don’t pay it, so carrying a balance costs a little more than this model shows. Some cards also charge balance-transfer and cash-advance fees and higher rates for cash advances. Under the CARD Act, applicants under 21 need their own income or a cosigner.</p><p><b>This is a simplified model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
