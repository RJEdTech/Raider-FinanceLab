/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
creditcard:[
 {k:'min',s:'If you pay the minimum on a credit card every month, you pay no interest.',fact:false,why:'Interest is charged on any balance you carry past the due date. Only paying the full statement balance avoids it.'},
 {k:'full',s:'Paying your full statement balance by the due date means you usually pay no interest on purchases.',fact:true,why:'That grace period is how many people use a card for free and still build credit.'},
 {k:'apr',s:'A 24% APR means you pay 24% of your purchase once.',fact:false,why:'APR is a yearly rate charged on whatever you still owe, usually figured daily. Carry a balance for years and you can pay far more than 24% in total.'}
],
startearly:[
 {k:'early',s:'Someone who starts saving at 22 can end up with more than someone who saves twice as much starting at 35.',fact:true,why:'Compound growth needs time. Thirteen extra years of growth can beat a bigger monthly amount started later.'},
 {k:'rich',s:'You need a lot of money before investing is worth it.',fact:false,why:'Many accounts let you start with a few dollars. Starting small and early matters more than starting big.'},
 {k:'double',s:'At about 7% a year, money roughly doubles in about 10 years.',fact:true,why:'The rule of 72: 72 ÷ 7 ≈ 10 years. Returns vary year to year, so this is an average, not a promise.'}
]
});
