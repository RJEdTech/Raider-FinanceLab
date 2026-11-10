BioLab.addReview({
cardoffer:{
 questions:[
  {id:'carry',kind:'real',lvl:'bio',
   q:'You carry $800 all year on the Low-Rate Card: $39 fee and 15.99% APR. What does it cost for the year?',
   num:{ans:166.92,tol:0.01,unit:'dollars'},
   steps:['Interest: $800 × 0.1599 = $127.92.','Plus the fee: $127.92 + $39 = $166.92.'],
   lab:{set:{habit:'carry',bal:800,reveal:true},look:'Read <b>Low-Rate Card: cost this year</b>.'},verify:[['cB',166.92,0.01],['cA',199.92,0.01]]},
  {id:'full',kind:'real',lvl:'bio',
   q:'You pay the whole bill by the due date every month. Which card costs less?',
   choices:['Low-Rate Card, because of its lower APR','Campus Card, because it has no fee and you pay no interest on either','They cost the same'],correct:1,
   steps:['With the grace period, paying in full means no interest.','Only the fees count: $0 against $39.'],
   lab:{set:{habit:'full',reveal:true},look:'Read both costs.'},verify:[['cA',0,0.001],['cB',39,0.001]]},
  {id:'starter',kind:'test',lvl:'bio',
   q:'A card has a $300 limit and charges a $25 annual fee and a $15 setup fee on day one. How much credit is left to use?',
   num:{ans:260,tol:0.5,unit:'dollars'},
   steps:['Fees: $25 + $15 = $40.','$300 − $40 = $260.']},
  {id:'daily',kind:'test',lvl:'honors',
   q:'A card’s APR is 24.99%. To the cent, how much interest does an $800 balance build in a 30-day cycle?',
   num:{ans:16.43,tol:0.02,unit:'dollars'},
   steps:['Daily periodic rate: 0.2499 ÷ 365 ≈ 0.000685.','$800 × 0.000685 × 30 ≈ $16.43.']},
  {id:'late',kind:'real',lvl:'honors',
   q:'Carrying $800, you pay 60 days late once. In this model, what does the Campus Card cost for the year?',
   num:{ans:249.92,tol:0.01,unit:'dollars'},
   steps:['Late fee: $30.','Six months at 24.99%: $800 × 0.2499 × ½ = $99.96. Six months at 29.99%: $800 × 0.2999 × ½ = $119.96.','Total: $30 + $99.96 + $119.96 = $249.92, $50 more than paying on time.'],
   lab:{set:{habit:'late',bal:800,reveal:true},look:'Read <b>Campus Card: cost this year</b>.'},verify:[['cA',249.92,0.01]]},
  {id:'brk',kind:'test',lvl:'ap',
   q:'Cost = 0.2499B for one card and 39 + 0.1599B for the other. To the cent, at what balance B are they equal?',
   num:{ans:433.33,tol:0.01,unit:'dollars'},
   steps:['0.2499B = 39 + 0.1599B.','0.09B = 39.','B = $433.33.'],
   lab:{set:{habit:'carry',reveal:true},look:'Read <b>Break-even balance</b>.'},verify:[['brk',433.33,0.01]]}
 ]
}
});
