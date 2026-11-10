(function(){
'use strict';
const {txt,rr,PAL,atLeast}=BioLab.h;
const F=window.FIN,$=F.money;
/* Taxes around the world: what is left of a paycheck, in all 38 OECD countries.
   Pay, take-home and labour cost: OECD Taxing Wages 2026 (2025 tax year), Tables 3.10 to 3.13, US dollars at purchasing
   power parity (PPP). Each household: [gross pay, take-home after income tax and employee contributions plus cash
   benefits, total labour cost]. s67/s100/s167 = single, no children, at 67/100/167% of the average wage (AW);
   sp = single parent, 2 children, 67% AW; m1 = married, 2 children, one earner at 100% AW; m2 = both working, 100% + 67%;
   m3 = both working, 100% + 100%. The OECD does not model 3 or more children.
   Health (hc, ho): OECD Health Statistics (SHA), 2024 health spending per person, USD PPP, current prices: government and
   compulsory schemes (HF1) and voluntary insurance plus out-of-pocket (HF2+HF3). Pulled from sdmx.oecd.org, Nov 10, 2026
   (Australia and Norway are OECD estimates; Finland and New Zealand provisional).
   U.S. premiums: KFF 2025 Employer Health Benefits Survey: $9,325 single / $26,993 family; the worker pays $1,440 / $6,850. */
const C={"AUS":{"n":"Australia","r":"ap","hc":5734,"ho":2150,"s67":[52806,42589,56015],"s100":[78815,60275,83604],"s167":[131620,93823,139619],"sp":[52806,55535,56015],"m1":[78815,65876,83604],"m2":[131620,102864,139619],"m3":[157629,120550,167208]},"AUT":{"n":"Austria","r":"eu","hc":6702,"ho":2149,"s67":[57868,42292,73844],"s100":[86370,58317,110216],"s167":[144238,90760,179764],"sp":[57868,57479,73844],"m1":[86370,73504,110216],"m2":[144238,114682,184060],"m3":[172740,130707,220431]},"BEL":{"n":"Belgium","r":"eu","hc":5941,"ho":2155,"s67":[58645,40187,74030],"s100":[87530,52914,111355],"s167":[146175,76908,185963],"sp":[58645,52851,74030],"m1":[87530,70312,111355],"m2":[146175,102380,185385],"m3":[175059,115508,222710]},"CAN":{"n":"Canada","r":"am","hc":5206,"ho":2167,"s67":[54769,42647,60838],"s100":[81745,60811,89590],"s167":[136515,94003,145693],"sp":[54769,56375,60838],"m1":[81745,69797,89590],"m2":[136515,106798,150428],"m3":[163491,123450,179181]},"CHL":{"n":"Chile","r":"am","hc":2263,"ho":1740,"s67":[20436,19005,20512],"s100":[30501,28332,30615],"s167":[50936,46673,51127],"sp":[20436,19954,20512],"m1":[30501,29100,30615],"m2":[50936,48320,51127],"m3":[61002,57221,61230]},"COL":{"n":"Colombia","r":"am","hc":1602,"ho":488,"s67":[13758,13758,13758],"s100":[20534,20534,20534],"s167":[34292,34292,34292],"sp":[13758,14749,13758],"m1":[20534,21526,20534],"m2":[34292,36275,34292],"m3":[41068,43051,41068]},"CRI":{"n":"Costa Rica","r":"am","hc":1430,"ho":628,"s67":[22433,20224,27956],"s100":[33482,30184,41725],"s167":[55915,48829,69681],"sp":[22433,20224,27956],"m1":[33482,30184,41725],"m2":[55915,50408,69681],"m3":[66964,60369,83450]},"CZE":{"n":"Czechia","r":"eu","hc":4450,"ho":752,"s67":[30239,24576,40460],"s100":[45133,35508,60388],"s167":[75373,57704,100849],"sp":[30239,30195,40460],"m1":[45133,41128,60388],"m2":[75373,62981,100849],"m3":[90267,73913,120777]},"DNK":{"n":"Denmark","r":"eu","hc":6121,"ho":1280,"s67":[59264,40011,59855],"s100":[88454,57205,89045],"s167":[147718,86274,148309],"sp":[59264,50320,59855],"m1":[88454,65329,89045],"m2":[147718,102189,148900],"m3":[176907,119343,178090]},"EST":{"n":"Estonia","r":"eu","hc":3012,"ho":919,"s67":[29110,24525,38950],"s100":[43448,33347,58134],"s167":[72558,55690,97083],"sp":[29110,31042,38950],"m1":[43448,36606,58134],"m2":[72558,61131,97083],"m3":[86896,69953,116267]},"FIN":{"n":"Finland","r":"eu","hc":5425,"ho":1326,"s67":[49244,38102,59319],"s100":[73499,50926,88536],"s167":[122743,75180,147856],"sp":[49244,43875,59319],"m1":[73499,54235,88536],"m2":[122743,92470,147856],"m3":[146997,105294,177073]},"FRA":{"n":"France","r":"eu","hc":6192,"ho":1241,"s67":[45073,34389,58459],"s100":[67273,48450,91724],"s167":[112345,74413,162182],"sp":[45073,48196,58459],"m1":[67273,55895,91724],"m2":[112345,88634,150183],"m3":[134545,102187,183447]},"DEU":{"n":"Germany","r":"eu","hc":8231,"ho":1353,"s67":[62970,41474,76162],"s100":[93985,57634,113595],"s167":[156955,90540,181031],"sp":[62970,52332,76162],"m1":[93985,73946,113595],"m2":[156955,109007,189757],"m3":[187970,125680,227190]},"GRC":{"n":"Greece","r":"eu","hc":2298,"ho":1493,"s67":[34153,26932,41595],"s100":[50974,37661,62082],"s167":[85127,57077,103677],"sp":[34153,29525,41595],"m1":[56072,42700,68290],"m2":[93640,71249,114044],"m3":[112144,82820,136580]},"HUN":{"n":"Hungary","r":"eu","hc":2467,"ho":874,"s67":[30798,20481,34802],"s100":[45967,30568,51943],"s167":[76765,51049,86744],"sp":[30798,25673,34802],"m1":[45967,35565,51943],"m2":[76765,56046,86744],"m3":[91934,66133,103885]},"ISL":{"n":"Iceland","r":"eu","hc":5869,"ho":1145,"s67":[55987,43344,59542],"s100":[83563,60863,88869],"s167":[139550,94182,148411],"sp":[55987,49976,59542],"m1":[83563,71780,88869],"m2":[139550,106628,148411],"m3":[167126,123087,177738]},"IRL":{"n":"Ireland","r":"eu","hc":6141,"ho":1759,"s67":[54250,45533,60312],"s100":[80970,60643,90018],"s167":[135220,87286,150331],"sp":[54250,57540,60312],"m1":[80970,72884,90018],"m2":[135220,111666,150331],"m3":[161940,125801,180037]},"ISR":{"n":"Israel","r":"me","hc":2657,"ho":1318,"s67":[39649,33743,41876],"s100":[59178,46495,62889],"s167":[98828,68114,105552],"sp":[39649,38797,41876],"m1":[59178,49430,62889],"m2":[98828,86266,104765],"m3":[118356,99612,125778]},"ITA":{"n":"Italy","r":"eu","hc":3930,"ho":1408,"s67":[40537,32786,53338],"s100":[60503,43182,79609],"s167":[101039,60775,132948],"sp":[40537,40762,53338],"m1":[60503,52331,79609],"m2":[101039,84989,132948],"m3":[121005,94374,159219]},"JPN":{"n":"Japan","r":"ap","hc":5085,"ho":882,"s67":[40019,31791,46286],"s100":[59729,46203,69083],"s167":[99748,72814,113716],"sp":[40019,37430,46286],"m1":[59729,49468,69083],"m2":[99748,80507,115368],"m3":[119459,94919,138166]},"KOR":{"n":"South Korea","r":"ap","hc":3049,"ho":2056,"s67":[45288,39274,50298],"s100":[67594,56417,75072],"s167":[112882,89268,124324],"sp":[45288,47748,50298],"m1":[67594,64539,75072],"m2":[112882,101998,125371],"m3":[135187,119141,150145]},"LVA":{"n":"Latvia","r":"eu","hc":2364,"ho":1400,"s67":[28793,22344,35594],"s100":[42975,31800,53122],"s167":[71768,50999,88707],"sp":[28793,27847,35594],"m1":[42975,37303,53122],"m2":[71768,59647,88716],"m3":[85950,69103,106243]},"LTU":{"n":"Lithuania","r":"eu","hc":3018,"ho":1376,"s67":[37951,25236,38630],"s100":[56643,34713,57657],"s167":[94593,57229,96287],"sp":[37951,34527,38630],"m1":[56643,44003,57657],"m2":[94593,65797,96287],"m3":[113286,75274,115313]},"LUX":{"n":"Luxembourg","r":"eu","hc":7020,"ho":1058,"s67":[62446,48052,70970],"s100":[93203,63385,105925],"s167":[155648,94822,176894],"sp":[62446,64688,70970],"m1":[93203,84014,105925],"m2":[155648,123544,176894],"m3":[186405,138446,211849]},"MEX":{"n":"Mexico","r":"am","hc":863,"ho":791,"s67":[14230,12867,15995],"s100":[21239,18441,23537],"s167":[35470,29397,38850],"sp":[14230,12867,15995],"m1":[21239,18441,23537],"m2":[35470,31308,39532],"m3":[42479,36882,47074]},"NLD":{"n":"Netherlands","r":"eu","hc":7221,"ho":1475,"s67":[62246,50833,70156],"s100":[92905,67017,104614],"s167":[155151,97395,168640],"sp":[62246,68406,70156],"m1":[92905,74842,104614],"m2":[155151,125639,174771],"m3":[185809,141823,209229]},"NZL":{"n":"New Zealand","r":"ap","hc":4841,"ho":1226,"s67":[37878,32163,37878],"s100":[56534,44766,56534],"s167":[94412,70145,94412],"sp":[37878,42170,37878],"m1":[56534,50090,56534],"m2":[94412,76929,94412],"m3":[113068,89533,113068]},"NOR":{"n":"Norway","r":"eu","hc":7959,"ho":1284,"s67":[58774,44969,66414],"s100":[87722,63052,99126],"s167":[146496,95017,165540],"sp":[58774,53264,66414],"m1":[87722,68044,99126],"m2":[146496,113013,165540],"m3":[175444,131096,198252]},"POL":{"n":"Poland","r":"eu","hc":3329,"ho":999,"s67":[35884,27777,41733],"s100":[53558,40471,62288],"s167":[89442,63267,104021],"sp":[35884,40643,41733],"m1":[53558,53450,62288],"m2":[89442,79404,104021],"m3":[107116,92098,124576]},"PRT":{"n":"Portugal","r":"eu","hc":3326,"ho":2049,"s67":[30741,24325,38042],"s100":[45882,34444,56779],"s167":[76624,51978,94822],"sp":[30741,32169,38042],"m1":[45882,41164,56779],"m2":[76624,61786,94822],"m3":[91765,71725,113559]},"SVK":{"n":"Slovakia","r":"eu","hc":3098,"ho":825,"s67":[25539,20042,33763],"s100":[38118,28865,50392],"s167":[63657,46511,84155],"sp":[25539,27513,33763],"m1":[38118,38282,50392],"m2":[63657,56379,84155],"m3":[76236,65202,100784]},"SVN":{"n":"Slovenia","r":"eu","hc":4601,"ho":780,"s67":[35977,24102,41950],"s100":[53697,34251,62611],"s167":[89675,54089,104561],"sp":[35977,31434,41950],"m1":[53697,41705,62611],"m2":[89675,62941,104561],"m3":[107395,73091,125222]},"ESP":{"n":"Spain","r":"eu","hc":3969,"ho":1524,"s67":[38537,31269,50317],"s100":[57517,43976,75101],"s167":[96054,67503,125418],"sp":[38537,35957,50317],"m1":[57517,47428,75101],"m2":[96054,76920,125418],"m3":[115035,89626,150201]},"SWE":{"n":"Sweden","r":"eu","hc":6804,"ho":1102,"s67":[44459,35749,58428],"s100":[66356,51333,87206],"s167":[110815,74544,145633],"sp":[44459,39537,58428],"m1":[66356,55121,87206],"m2":[110815,90870,145633],"m3":[132713,106454,174411]},"CHE":{"n":"Switzerland","r":"eu","hc":6783,"ho":2982,"s67":[71376,60700,75945],"s100":[106532,87303,113350],"s167":[177908,137172,189062],"sp":[71376,71592,75945],"m1":[106532,101066,113350],"m2":[177908,157001,189295],"m3":[213064,182297,226700]},"TUR":{"n":"Türkiye","r":"me","hc":1848,"ho":631,"s67":[36650,27619,43438],"s100":[54702,38683,64832],"s167":[91352,61146,108270],"sp":[36650,27619,43438],"m1":[54702,38683,64832],"m2":[91352,66301,108270],"m3":[109403,77365,129664]},"GBR":{"n":"United Kingdom","r":"eu","hc":5676,"ho":1332,"s67":[55160,44892,62332],"s100":[82329,63277,93576],"s167":[137490,95270,157010],"sp":[55160,48372,62332],"m1":[82329,66597,93576],"m2":[137490,111489,155907],"m3":[164658,129874,187151]},"USA":{"n":"United States","r":"am","hc":12324,"ho":2499,"s67":[49258,38693,53348],"s100":[73520,55644,79466],"s167":[122779,86948,132492],"sp":[49258,46863,53348],"m1":[73520,63885,79466],"m2":[122779,100188,132814],"m3":[147040,116210,158931]}};
const ORDER=Object.keys(C).filter(k=>k!=='USA').sort((a,b)=>(C[a].r+C[a].n).localeCompare(C[b].r+C[b].n));
const REG={am:'Americas',eu:'Europe',ap:'Asia-Pacific',me:'Middle East'};
/* countries where workers must also pay into private pension or health plans that the OECD does not count as taxes */
const NTCP={CHL:'Chilean workers also pay about 10% of pay into a private pension account and 7% for health insurance. The OECD does not count these as taxes, so real take-home pay is lower than shown.',
 COL:'Colombian workers also pay required pension and health contributions. The OECD does not count them as taxes, which is why Colombia’s tax looks like 0%. Real take-home pay is lower than shown.',
 CHE:'Swiss residents must also buy basic health insurance themselves and pay into a workplace pension. The OECD does not count these as taxes, so real take-home pay is lower than shown.',
 NLD:'Dutch adults must also pay a yearly premium for basic health insurance, which the OECD does not count as a tax, so real take-home pay is a bit lower than shown.',
 ISL:'Icelandic workers must also pay into a workplace pension fund, which the OECD does not count as a tax, so real take-home pay is lower than shown.'};
const COLLEGE={USA:'$11,950 a year, public 4-year in-state (College Board, 2025-26)',CAN:'CAD 7,734 a year on average for Canadian undergraduates (Statistics Canada, 2025-26)',
 GBR:'Up to £9,790 a year in England (2026-27), paid with a government loan you repay only once you earn over a set amount',
 DEU:'No tuition at public universities for most students; a semester fee of a few hundred euros',DNK:'No tuition for Danish and EU students, plus a monthly living grant (SU) for students',
 JPN:'¥535,800 a year standard at national universities; some charge up to ¥642,960'};
const HEALTH={USA:'Most workers get insurance through a job and pay part of the premium. Medicare covers people 65+; Medicaid covers many low-income people.',
 CAN:'Each province’s public insurance pays for doctors and hospitals. Many people buy private coverage for drugs, dental and vision.',
 GBR:'The NHS is paid for mostly from taxes and is free when you use it. England charges a small fee per prescription.',
 DEU:'Workers pay a health insurance contribution out of each paycheck; it is part of what comes out. About 9 in 10 people are in the public system.',
 DNK:'Health care is paid for from taxes; doctor visits and hospital care are free when you use them.',
 JPN:'Everyone is in public health insurance, paid through paycheck contributions. Patients pay 30% of most bills, with a monthly cap.'};
const HH={s67:'Single, lower pay (67% of average)',s100:'Single, average pay',s167:'Single, higher pay (167% of average)',sp:'Single parent, 2 children (67% of average)',m1:'Married, 2 children, one earner',m2:'Married, 2 children, both working (100% + 67%)',m3:'Married, 2 children, both working (100% + 100%)'};
const HHW={s67:'a single worker at 67% of the average wage',s100:'a single worker at the average wage',s167:'a single worker at 167% of the average wage',sp:'a single parent of two at 67% of the average wage',m1:'a married couple with two children and one earner at the average wage',m2:'a married couple with two children, both working (100% and 67% of the average wage)',m3:'a married couple with two children, both working at the average wage'};
const hh=sim=>sim.p.hh;
const people=sim=>hh(sim)==='sp'?3:hh(sim)[0]==='m'?4:1;
const famPrem=sim=>people(sim)>1;
const G=(sim,k)=>C[k][hh(sim)][0],net=(sim,k)=>C[k][hh(sim)][1],LC=(sim,k)=>C[k][hh(sim)][2];
const health=(sim,k)=>C[k].ho*people(sim)+(k==='USA'?(famPrem(sim)?6850:1440):0);
const left=(sim,k)=>net(sim,k)-health(sim,k);
const taxP=(sim,k)=>100*(1-net(sim,k)/G(sim,k));
const healthP=(sim,k)=>100*health(sim,k)/G(sim,k);
const leftP=(sim,k)=>100*left(sim,k)/G(sim,k);
const wedge=(sim,k)=>100*(LC(sim,k)-net(sim,k))/LC(sim,k);
const empExtra=(sim,k)=>LC(sim,k)-G(sim,k)+(k==='USA'?(famPrem(sim)?20143:7885):0);
const rank=(sim,k,f)=>{const all=Object.keys(C).map(c=>[c,f(sim,c)]).sort((a,b)=>b[1]-a[1]);return all.findIndex(x=>x[0]===k)+1;};
const vs=sim=>C[sim.p.vs]?sim.p.vs:'DEU';
const truth=sim=>{const d=leftP(sim,'USA')-leftP(sim,vs(sim));return Math.abs(d)<=2?'tie':d>0?'us':'them';};
const WHO={us:'The U.S. worker keeps more',them:'The other country’s worker keeps more',tie:'About the same (within 2 points)'};
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||(locked(sim)&&!pending(sim)));
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const p1=v=>(Math.round(v*10)/10).toFixed(1)+'%';
const ord=n=>n+(n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th');
const calcAns=sim=>atLeast('ap')?Math.round(wedge(sim,vs(sim))*10)/10:Math.round(leftP(sim,vs(sim))*10)/10;
const wrap=(ctx,s,x,y,w,lh,o)=>{ctx.font=(o.w||400)+' '+o.s+'px sans-serif';const words=s.split(' ');let line='',yy=y;for(const wd of words){const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,yy,o);line=wd;yy+=lh;}else line=t;}if(line)txt(ctx,line,x,yy,o);return yy;};

const SIM={
 id:'taxworld',hash:'taxworld',apUnit:2,order:3,tab:'Taxes around the world',kind:'Simulation',
 skills:{bio:'Percent of a whole and subtracting costs: what is left of pay · Personal Finance (Taxes)',honors:'Percents of different bases and purchasing power parity · Personal Finance (Taxes)',ap:'Ratios with different denominators: the tax wedge · Personal Finance (Taxes)'},
 card:'Could you keep more of your paycheck somewhere else? Compare the U.S. with all 38 OECD countries, counting taxes and health care costs.',
 title:'Taxes around the world: what is left of a paycheck?',
 lede:{bio:'Every rich country taxes paychecks, but they buy different things with the money. In some countries taxes pay for health care and college. In the U.S., workers pay a big share of health care themselves, through premiums and bills. To compare fairly, count both, and check more than one kind of household.',
  honors:'These dollars are PPP dollars: each country’s money is converted at purchasing power parity, the rate that makes the same basket of goods cost the same. So a PPP dollar buys about the same amount everywhere, and price differences are already built in.',
  ap:'The tax wedge is (labour cost − take-home pay) ÷ labour cost. It counts the employer’s contributions too, which never show up on a pay stub but are part of what the job costs.'},
 scale:'A worker in each country, at a share of that country’s average wage, in 2025. U.S. dollars adjusted for prices (PPP).',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Compare',
 controls:[
  {id:'who',label:'Your gut: after taxes and health care costs, who keeps the bigger share of pay?',type:'seg',def:'us',options:Object.keys(WHO).map(k=>({v:k,l:WHO[k]}))},
  {id:'vs',label:'Compare the U.S. with',type:'select',def:'DEU',noGut:true,onChange:clear,options:ORDER.map(k=>({v:k,l:REG[C[k].r]+': '+C[k].n}))},
  {id:'hh',label:'Household',type:'select',def:'s100',noGut:true,onChange:clear,options:Object.keys(HH).map(k=>({v:k,l:HH[k]})),help:'The OECD models these seven households in every country. It does not model families with 3 or more children.'},
  {id:'view',label:'Show',type:'seg',def:'keep',noGut:true,options:[{v:'keep',l:'What is left of pay'},{v:'buys',l:'What taxes buy'}]},
  {id:'reveal',label:'Show health costs now',type:'toggle',def:false,help:'Normally the health costs appear once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'usTax',label:'U.S.: taxes as a share of pay',unit:'%',d:1,min:null,max:100,get:sim=>taxP(sim,'USA')},
  {id:'vsTax',label:'Other country: taxes as a share of pay',unit:'%',d:1,min:null,max:100,get:sim=>taxP(sim,vs(sim))},
  {id:'usHealth',label:'U.S.: health costs paid directly',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?health(sim,'USA'):null},
  {id:'vsHealth',label:'Other country: health costs paid directly',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?health(sim,vs(sim)):null},
  {id:'usLeft',label:'U.S.: share of pay left',unit:'%',d:1,min:0,max:null,get:sim=>shown(sim)?leftP(sim,'USA'):null},
  {id:'vsLeft',label:'Other country: share of pay left',unit:'%',d:1,min:0,max:null,get:sim=>shown(sim)?leftP(sim,vs(sim)):null},
  {id:'gap',label:'U.S. minus other country, share left',unit:'points',d:1,min:null,max:null,get:sim=>shown(sim)?leftP(sim,'USA')-leftP(sim,vs(sim)):null},
  {id:'usRank',label:'U.S. rank of 38, share left',unit:'',d:0,min:1,max:38,get:sim=>shown(sim)?rank(sim,'USA',leftP):null},
  {id:'usEmp',label:'U.S.: employer pays on top of the wage',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>empExtra(sim,'USA')},
  {id:'vsEmp',label:'Other country: employer pays on top of the wage',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>empExtra(sim,vs(sim))},
  {id:'usWedge',label:'U.S. tax wedge',unit:'%',d:1,lvl:'ap',min:null,max:100,get:sim=>wedge(sim,'USA')},
  {id:'vsWedge',label:'Other country tax wedge',unit:'%',d:1,lvl:'ap',min:null,max:100,get:sim=>wedge(sim,vs(sim))}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),fs=Math.min(k,1.5),big=k>1.3,V=vs(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(sim.p.view==='buys'){
   txt(ctx,'What taxes buy: health care'+((COLLEGE[V])?' and college':''),20,30,{s:15*fs,w:700});
   const keys=['USA',V],cw=372;keys.forEach((kk,i)=>{const x=20+i*(cw+16),c=C[kk];ctx.fillStyle=PAL['card2'];rr(ctx,x,44,cw,396,8);ctx.fill();ctx.strokeStyle=kk==='USA'?PAL['rj']:PAL['s1'];ctx.lineWidth=2;rr(ctx,x,44,cw,396,8);ctx.stroke();
    txt(ctx,c.n,x+14,72,{s:16*fs,w:700});
    txt(ctx,'Health spending per person, 2024',x+14,98,{s:12.5*fs,w:700,c:PAL['cv-soft']});
    const tot=c.hc+c.ho,bw=cw-28,sc=bw/15000;ctx.fillStyle=PAL['s1'];ctx.fillRect(x+14,106,c.hc*sc,16);ctx.fillStyle=PAL['s5'];ctx.fillRect(x+14+c.hc*sc,106,c.ho*sc,16);
    txt(ctx,$(c.hc)+' through taxes or required insurance',x+14,140,{s:12*fs});txt(ctx,'+ '+$(c.ho)+' paid directly = '+$(tot),x+14,158*Math.min(fs,1.06),{s:12*fs,w:700});
    let y=186;if(HEALTH[kk])y=wrap(ctx,HEALTH[kk],x+14,y,cw-28,17*fs,{s:12.5*fs})+30;
    else if(NTCP[kk])y=wrap(ctx,NTCP[kk],x+14,y,cw-28,17*fs,{s:12.5*fs})+30;
    else y=wrap(ctx,'Share paid through taxes or required insurance: '+p1(100*c.hc/tot)+'.',x+14,y,cw-28,17*fs,{s:12.5*fs})+30;
    if(COLLEGE[kk]){txt(ctx,'Public college',x+14,y,{s:12.5*fs,w:700,c:PAL['cv-soft']});wrap(ctx,COLLEGE[kk],x+14,y+20,cw-28,17*fs,{s:12.5*fs});}});
   return;}
  txt(ctx,HH[hh(sim)],20,26,{s:14.5*fs,w:700});
  {let x=big?20:420;const ly=big?36:14;[['Taxes','s1'],['Health costs paid directly','s5'],['Left to spend','s3']].forEach(([l,c])=>{ctx.fillStyle=PAL[c];ctx.fillRect(x,ly,12,12);txt(ctx,l,x+16,ly+10,{s:11.5*fs});ctx.font='400 '+(11.5*fs)+'px sans-serif';x+=16+ctx.measureText(l).width+18;});}
  /* two detailed bars */
  const LX=150,BW=520,M=110;
  ['USA',V].forEach((kk,i)=>{const y=(big?62:48)+i*62,c=C[kk];
   txt(ctx,c.n,20,y+18,{s:13.5*fs,w:700});if(!big)txt(ctx,'Pay '+$(G(sim,kk)),20,y+36,{s:11.5*fs,c:PAL['cv-soft']});
   const t=taxP(sim,kk),h=healthP(sim,kk),sc=BW/M,neg=t<0;
   ctx.fillStyle=PAL['s1'];if(!neg)ctx.fillRect(LX,y+4,sc*t,26);
   const x0=LX+sc*Math.max(0,t);
   if(sh){ctx.fillStyle=PAL['s5'];ctx.fillRect(x0,y+4,sc*h,26);ctx.fillStyle=PAL['s3'];ctx.fillRect(x0+sc*h,y+4,Math.max(0,sc*leftP(sim,kk)),26);}
   else{ctx.fillStyle=PAL['line'];ctx.fillRect(x0,y+4,sc*(100-Math.max(0,t)),26);}
   ctx.strokeStyle=kk==='USA'?PAL['rj']:PAL['s2'];ctx.lineWidth=2;ctx.strokeRect(LX,y+4,sc*100,26);
   txt(ctx,neg?'benefits > tax':p1(t),LX+6,y+22,{s:12*fs,w:700,c:neg?PAL['cv-ink']:'#fff'});
   txt(ctx,sh?p1(leftP(sim,kk))+' left':'?',LX+BW+8,y+22,{s:13*fs,w:700});});
  /* every OECD country */
  const sy=big?232:214,ax0=60,ax1=760,lo=40,hi=110,X=v=>ax0+(ax1-ax0)*(Math.min(hi,Math.max(lo,v))-lo)/(hi-lo),f=sh?leftP:(s,c)=>100-taxP(s,c);
  txt(ctx,sh?'All 38 OECD countries: share of pay left after taxes and direct health costs':'All 38 OECD countries: share of pay left after taxes',20,sy,{s:13*fs,w:700});
  const ly=sy+70;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax0,ly);ctx.lineTo(ax1,ly);ctx.stroke();
  for(let v=40;v<=110;v+=10){ctx.beginPath();ctx.moveTo(X(v),ly-4);ctx.lineTo(X(v),ly+4);ctx.stroke();txt(ctx,v+'%',X(v),ly+20,{s:11*fs,a:'center',c:PAL['cv-soft']});}
  const all=Object.keys(C).map(c=>({c,v:f(sim,c)})).sort((a,b)=>a.v-b.v);
  all.forEach((o,i)=>{const x=X(o.v),hiL=o.c==='USA'||o.c===V,r=hiL?7:4.5,yy=ly-((i%3)*7)-8;ctx.beginPath();ctx.arc(x,hiL?ly-12:yy,r,0,7);
   if(NTCP[o.c]){ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.stroke();}else{ctx.fillStyle=o.c==='USA'?PAL['rj']:o.c===V?PAL['s2']:PAL['muted'];ctx.globalAlpha=hiL?1:0.6;ctx.fill();ctx.globalAlpha=1;}
   if(hiL){ctx.strokeStyle=o.c==='USA'?PAL['rj']:PAL['s2'];ctx.lineWidth=2;ctx.stroke();}});
  const lab=(c,up)=>{const x=X(f(sim,c));txt(ctx,C[c].n+' '+p1(f(sim,c)),x,up?ly-36:ly+40,{s:12*fs,w:700,a:x<120?'left':x>680?'right':'center',c:c==='USA'?PAL['rj']:PAL['s2']});};
  lab('USA',true);if(V!=='USA')lab(V,false);
  const rU=rank(sim,'USA',f),rV=rank(sim,V,f);
  if(!big)txt(ctx,'Rank (most left = 1st): U.S. '+ord(rU)+', '+C[V].n+' '+ord(rV)+' of 38. Hollow dots: required private plans not counted as taxes.',20,ly+66,{s:11.5*fs,c:PAL['cv-soft']});
  if(NTCP[V]&&!big)wrap(ctx,'Note: '+NTCP[V],20,ly+88,760,15*fs,{s:11.5*fs,c:PAL['cv-soft']});},
 narrate(sim){const V=vs(sim),c=C[V];
  if(sim.p.view==='buys')return `In the U.S., ${$(C.USA.hc)} per person goes through taxes and required insurance and ${$(C.USA.ho)} more is paid directly. In ${c.n}, ${$(c.hc)} and ${$(c.ho)}.`;
  if(!shown(sim))return `For ${HHW[hh(sim)]}, taxes take ${p1(taxP(sim,'USA'))} of U.S. pay and ${p1(taxP(sim,V))} in ${c.n}. <b>Now count health care costs people pay directly. Who keeps more?</b>`;
  return `After taxes and direct health costs, the U.S. household keeps <b>${p1(leftP(sim,'USA'))}</b> of pay (${ord(rank(sim,'USA',leftP))} of 38) and the ${c.n} household <b>${p1(leftP(sim,V))}</b> (${ord(rank(sim,V,leftP))}). Health costs paid directly: ${$(health(sim,'USA'))} in the U.S., ${$(health(sim,V))} in ${c.n}.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Pick one: once health care costs people pay directly are counted, who keeps the bigger share of pay? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth(sim)?1:0,who:w,label:WHO[w]};},
  solve(sim){const t=truth(sim);sim.p.who=t;return {v:1,who:t,label:WHO[t]};},
  hint:{bio:'Lock in your gut. Then you will work out one country’s share yourself.'},
  calc:{unit:'%',d:1,tol:0.1,
   prompt:{bio:sim=>{const V=vs(sim),c=C[V];return `In ${c.n}, ${HHW[hh(sim)]} earns <b>${$(G(sim,V))}</b> and takes home <b>${$(net(sim,V))}</b> after taxes and benefits. They pay about <b>${$(health(sim,V))}</b> a year for health care directly. What percent of gross pay is left?`;},
    ap:sim=>{const V=vs(sim),c=C[V];return `In ${c.n}, the job${people(sim)>1&&hh(sim)!=='m1'&&hh(sim)!=='sp'?'s cost':' costs'} the employer <b>${$(LC(sim,V))}</b> in all (wages plus employer contributions). The household (${HHW[hh(sim)]}) takes home <b>${$(net(sim,V))}</b>. What is the tax wedge, as a percent of labour cost?`;}},
   answer:calcAns,
   hint:{bio:'Subtract health costs from take-home pay, then divide by gross pay.',ap:'(labour cost − take-home) ÷ labour cost.'},
   steps(sim){const V=vs(sim);if(atLeast('ap'))return [`${$(LC(sim,V))} − ${$(net(sim,V))} = ${$(LC(sim,V)-net(sim,V))}.`,`${$(LC(sim,V)-net(sim,V))} ÷ ${$(LC(sim,V))} = <b>${p1(wedge(sim,V))}</b>.`];
    return [`Left: ${$(net(sim,V))} − ${$(health(sim,V))} = ${$(left(sim,V))}.`,`${$(left(sim,V))} ÷ ${$(G(sim,V))} = <b>${p1(leftP(sim,V))}</b>.`];}},
  formula(sim){const V=vs(sim);return `Share left = (take-home − health costs paid directly) ÷ gross pay<br>U.S.: (${$(net(sim,'USA'))} − ${$(health(sim,'USA'))}) ÷ ${$(G(sim,'USA'))} = ${p1(leftP(sim,'USA'))}<br>${C[V].n}: (${$(net(sim,V))} − ${$(health(sim,V))}) ÷ ${$(G(sim,V))} = ${p1(leftP(sim,V))}`;},
  how:{bio:'The math subtracts both taxes and the health costs people pay out of pocket or through their share of premiums, then compares what is left.',
   ap:'Each share uses its own country’s gross pay as the base, and PPP dollars, so the percents compare across countries.'},
  compare(sim,g0,m){const K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the share yourself.':'';const V=vs(sim),nm='the '+C[V].n+' household';
   const real=` Taxes alone: U.S. ${p1(taxP(sim,'USA'))}, ${C[V].n} ${p1(taxP(sim,V))}. With health costs: U.S. keeps ${p1(leftP(sim,'USA'))}, ${C[V].n} ${p1(leftP(sim,V))}.`;
   const say=w=>w==='them'?nm+' keeps more':w==='us'?'the U.S. household keeps more':'about the same';
   if(g0.who===m.who)return `Your gut was right: ${say(m.who)}.`+real+self;
   return `Your gut said <b>${say(g0.who)}</b>; the numbers say <b>${say(m.who)}</b>.`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.vs=R(['CAN','MEX','GBR','DEU','DNK','FRA','JPN','KOR','AUS','IRL','ESP','ITA','SWE','NOR','POL']);sim.p.hh=R(Object.keys(HH));sim.p.who='us';sim.p.reveal=false;sim.p.view='keep';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'An average single U.S. worker earns $73,520 and takes home $55,644. To one decimal, what percent of pay goes to income tax and payroll tax?',answer:24.3,tol:0.06,unit:'%',d:1,hint:'(gross − take-home) ÷ gross.',explain:'$73,520 − $55,644 = $17,876. $17,876 ÷ $73,520 ≈ 24.3%.'},
  {lvl:'bio',instant:true,q:'Germany takes 38.7% of an average paycheck; the U.S. takes 24.3%. What does that comparison leave out?',choices:['Nothing: Germans just pay more','What the taxes buy, like health insurance, which German workers pay for inside that 38.7%','The exchange rate'],correct:1,explain:'German workers’ health insurance contribution comes out of the paycheck as part of the 38.7%. Most U.S. workers pay a premium share on top of their taxes. A fair comparison counts both.'},
  {lvl:'bio',instant:true,q:'Colombia’s tax on an average single worker shows as 0%. Why?',choices:['Colombia has no government','Workers there pay required pension and health contributions that the OECD does not count as taxes','Everyone in Colombia earns too little to pay anything'],correct:1,explain:'The OECD counts only taxes. Colombian workers still pay required pension and health contributions; they are just not called taxes, so the 0% hides real costs.'},
  {lvl:'honors',kind:'num',q:'A U.S. employer pays $5,946 in payroll taxes on top of a $73,520 wage, plus $7,885 toward the worker’s health premium. What is the employer’s total extra cost?',answer:13831,tol:0.5,unit:'$',d:0,hint:'Add the two.',explain:'$5,946 + $7,885 = $13,831, more than the $5,946 the OECD counts, because the U.S. employer premium is not a tax.'},
  {lvl:'honors',instant:true,q:'Why use PPP dollars instead of exchange rates?',choices:['They make the numbers bigger','A PPP dollar buys about the same basket of goods in each country, so price differences are built in','Banks require it'],correct:1,explain:'Purchasing power parity converts each currency at the rate that makes a basket of goods cost the same, so $1 means about the same amount of stuff everywhere.'},
  {lvl:'ap',kind:'num',q:'A German job costs the employer $113,595; the single worker takes home $57,634. To one decimal, what is the tax wedge?',answer:49.3,tol:0.06,unit:'%',d:1,hint:'(labour cost − take-home) ÷ labour cost.',explain:'($113,595 − $57,634) ÷ $113,595 = $55,961 ÷ $113,595 ≈ 49.3%.'},
  {lvl:'ap',instant:true,q:'A single parent’s share of pay left is over 100% in several countries. How is that possible?',choices:['A math error','Cash benefits for the children are bigger than the taxes, so take-home pay is more than gross pay','PPP dollars are bigger'],correct:1,explain:'Take-home pay here counts cash benefits. When child benefits and refundable credits outweigh income tax and contributions, the household takes home more than its gross pay.'}
 ],
 tour:[
  {title:'Taxes alone',text:'An average single worker. Taxes take 24.3% of pay in the U.S. and 38.7% in Germany. On taxes alone, the U.S. worker keeps much more.',pause:true,setup:sim=>BioLab.setValues(sim,{vs:'DEU',hh:'s100',view:'keep',reveal:false})},
  {title:'What the taxes buy',text:'In Germany, that 38.7% includes health insurance. In the U.S., the average worker also pays $1,440 a year toward a work-based premium, and Americans pay $2,499 per person out of pocket or through voluntary insurance.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'buys'})},
  {title:'Count both',text:'Subtract taxes and direct health costs. U.S.: 70.3% left. Germany: 59.9%. The gap shrinks from 14.4 points to 10.4, but the single U.S. worker still keeps more. The U.S. ranks 26th of 38.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'keep',reveal:true})},
  {title:'Now a family',text:'Switch to a married couple with two children and one earner. Most countries pay family benefits, and the U.S. family premium share is $6,850. Germany now leaves 72.9% and the U.S. 64.0%, last of the 38.',pause:true,setup:sim=>BioLab.setValues(sim,{hh:'m1'})},
  {title:'Both parents working',text:'With both parents working at the average wage, the U.S. family keeps 67.6%, 33rd of 38. Germany keeps 64.0%. The ranking depends on the household.',pause:true,setup:sim=>BioLab.setValues(sim,{hh:'m3'})},
  {title:'Read the hollow dots',text:'Colombia, Chile, Switzerland, the Netherlands and Iceland look generous, but workers there must also pay into private pension or health plans that the OECD does not count as taxes. Pick Colombia to see its note.',pause:true,setup:sim=>BioLab.setValues(sim,{hh:'s100',vs:'COL'})},
  {title:'Try your own',text:'Pick any of the 37 countries and any household. Where would you keep the most? What would you give up or get?',pause:true,setup:sim=>BioLab.setValues(sim,{vs:'CAN'})}
 ],
 lab:{bio:'<p><b>Question:</b> Where would you keep the most of a paycheck?</p><ol><li>Turn on <b>Show health costs now</b>.</li><li>Pick five countries you might want to live in. For each, record a trial for a single worker at average pay and for a married couple with two children, both working.</li></ol><p>Which country moved the most between the two households? Why?</p>',
  honors:'<p><b>Question:</b> What does a job cost the employer?</p><ol><li>For five countries, record <b>employer pays on top of the wage</b>.</li><li>Compare the U.S. with and without the employer premium.</li></ol><p>Explain why a pay stub hides part of what a job costs.</p>',
  ap:'<p><b>Question:</b> How do the wedge and the share left differ?</p><ol><li>For eight countries, record the tax wedge and the share left, at 67%, 100% and 167% of the average wage.</li><li>Rank the countries both ways.</li></ol><p><b>CER:</b> Explain why the two rankings differ, and how progressive each country’s taxes are.</p>'},
 terms:[
  {t:'Average wage',d:'The OECD’s average full-time pay in each country. 67% and 167% of it stand for lower and higher pay.'},
  {t:'Out-of-pocket cost',d:'Health care money you pay yourself: copays, deductibles, things insurance does not cover.'},
  {t:'Premium',d:'What you pay each month for health insurance, whether or not you use care.'},
  {t:'Purchasing power parity (PPP)',d:'A conversion rate that makes the same basket of goods cost the same in each country.',lvl:'honors'},
  {t:'Tax wedge',d:'(Total labour cost − take-home pay) ÷ total labour cost, counting employer contributions.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Pay, take-home and labour cost: OECD <i>Taxing Wages 2026</i>, Tables 3.10 to 3.13 (2025 tax year), all 38 OECD countries, USD PPP. Take-home is after income tax and employee social security contributions, plus cash benefits. Seven households: single at 67%, 100% and 167% of the average wage; a single parent of two at 67%; a married couple with two children and one earner; and both working at 100% + 67% and 100% + 100%. The OECD does not model families with 3 or more children. The OECD’s U.S. worker pays federal, Michigan and Detroit taxes; a Colorado worker at the same pay keeps a little more (see the paycheck tool). Health: OECD Health Statistics, 2024 health spending per person in USD PPP, government and compulsory schemes vs. voluntary insurance and out-of-pocket (OECD data explorer, pulled Nov 10, 2026). U.S. premiums: KFF 2025 Employer Health Benefits Survey ($9,325 single, $26,993 family; workers pay $1,440 and $6,850; a single parent is counted with family coverage). Tuition: College Board (U.S. 2025-26), Statistics Canada (2025-26), U.K. Department for Education fee cap (2026-27), Japan education ministry standard; Germany and Denmark: public tuition rules.</p><p><b>What this number hides.</b> Direct health costs here are national averages per person, multiplied by the people in the household; older people use far more care than a young family, so real costs for any one family vary a lot. The OECD counts most U.S. private insurance as “compulsory” because of the ACA, so the U.S. “through taxes or required insurance” bar includes employer insurance. Hollow dots mark countries where workers must also pay into private pension or health plans that the OECD does not count as taxes, so their real take-home is lower than shown. Sales taxes and VAT are left out: the U.S. has no national sales tax (Colorado’s state rate is 2.9%), while most other countries charge VAT of 10% to 27% on what you buy. Rent, wages for your job, job openings, language and visas also decide whether moving makes sense. China, Brazil and Argentina are not OECD members and are not in these tables.</p><p><b>Two views, both held by real people.</b> Supporters of higher-tax systems point to universal health coverage, low-cost college and family benefits, so fewer people face big bills. Supporters of lower-tax systems point to higher take-home pay for many single workers, more choice in how to spend it, and faster growth in wages and new businesses. This tool shows the trade-off, not a verdict.</p><p><b>This is a simplified model for learning.</b></p>'
};
BioLab.register(SIM);
})();
