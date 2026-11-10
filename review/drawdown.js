BioLab.addReview({
drawdown:{
 questions:[
  {id:'bottom',kind:'real',lvl:'bio',
   q:'$10,000 falls 56.8%. How much is left?',
   num:{ans:4320,tol:0.5,unit:'dollars'},
   steps:['The drop: $10,000 × 0.568 = $5,680.','Left: $10,000 − $5,680 = $4,320.'],
   lab:{set:{crash:'2008',amt:10000,reveal:true},look:'Read <b>Value at the bottom</b>.'},verify:[['after',4320,0.01]]},
  {id:'need',kind:'real',lvl:'bio',
   q:'From $4,320, what percent gain gets back to $10,000?',
   choices:['56.8%','100%','About 131.5%','About 231.5%'],correct:2,
   steps:['Needed: $10,000 − $4,320 = $5,680.','As a percent of $4,320: 5,680 ÷ 4,320 ≈ 1.315.','About 131.5%.'],
   lab:{set:{crash:'2008',amt:10000,reveal:true},look:'Read <b>Gain needed to get back to even</b>.'},verify:[['need',131.48,0.01]]},
  {id:'fifty',kind:'test',lvl:'bio',
   q:'An investment falls 50%. What gain does it need to get back to even?',
   num:{ans:100,tol:0.5,unit:'%'},
   steps:['A 50% drop leaves half.','Half must double to get back: a 100% gain.'],
   lab:{set:{crash:'custom',drop:50,reveal:true},look:'Read <b>Gain needed to get back to even</b>.'},verify:[['need',100,0.01]]},
  {id:'y2022',kind:'real',lvl:'honors',
   q:'The 2022 bear market took the S&P 500 down 25.4%. To one decimal, what gain did it need?',
   num:{ans:34.0,tol:0.1,unit:'%'},
   steps:['Gain needed = d ÷ (1 − d).','0.254 ÷ 0.746 ≈ 0.3405.','About 34.0%. It got back in January 2024.'],
   lab:{set:{crash:'2022',reveal:true},look:'Read <b>Gain needed to get back to even</b>.'},verify:[['need',34.05,0.01]]},
  {id:'mult',kind:'test',lvl:'honors',
   q:'A stock falls 20%, then rises 20%. Overall, what is the percent change?',
   choices:['0%','−4%','+4%','−20%'],correct:1,
   steps:['Multiply the factors: 0.80 × 1.20 = 0.96.','0.96 means a 4% loss overall.']},
  {id:'years',kind:'test',lvl:'ap',
   q:'After a 56.8% drop, growing a steady 7% a year, about how many years to get back to even?',
   num:{ans:12.4,tol:0.1,unit:'years'},
   steps:['Solve 1.07ᵗ = 1 ÷ 0.432 ≈ 2.3148.','t = ln 2.3148 ÷ ln 1.07 ≈ 0.8393 ÷ 0.0677.','About 12.4 years. The real recovery took about 4, because growth was far from steady.'],
   lab:{set:{crash:'2008',r:7,reveal:true},look:'Read <b>Years to get back at a steady rate</b>.'},verify:[['yrs',12.4,0.05]]}
 ]
}
});
