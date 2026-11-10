BioLab.addReview({
inflation:{
 questions:[
  {id:'token',kind:'real',lvl:'bio',
   q:'The CPI was 130.7 in 1990 and 336.940 in September 2026. To the cent, what is $2 from 1990 in 2026 dollars?',
   num:{ans:5.16,tol:0.01,unit:'dollars'},
   steps:['336.940 ÷ 130.7 ≈ 2.5780.','$2 × 2.5780 ≈ $5.16.'],
   lab:{set:{year:'1990',amt:2,reveal:true},look:'Read <b>Same buying power today</b>.'},verify:[['today',5.16,0.005]]},
  {id:'twenty',kind:'real',lvl:'bio',
   q:'A grandparent earned $20 for a day’s work in 1980 (CPI 82.4). About what is that in September 2026 dollars?',
   choices:['About $27','About $52','About $82','About $121'],correct:2,
   steps:['336.940 ÷ 82.4 ≈ 4.089.','$20 × 4.089 ≈ $81.78.'],
   lab:{set:{year:'1980',amt:20,reveal:true},look:'Read <b>Same buying power today</b>.'},verify:[['today',81.78,0.01]]},
  {id:'ratio',kind:'test',lvl:'bio',
   q:'Which expression converts a price from 2010 into September 2026 dollars?',
   choices:['price × 218.056 ÷ 336.940','price × 336.940 ÷ 218.056','price + (336.940 − 218.056)','price × 336.940'],correct:1,
   steps:['Prices rose by the ratio CPI now ÷ CPI then.','Multiply the old price by 336.940 ÷ 218.056 ≈ 1.545.']},
  {id:'lost',kind:'test',lvl:'honors',
   q:'Since 2020 prices rose by a factor of 1.302. To one decimal, what percent of its buying power has a 2020 dollar lost?',
   num:{ans:23.2,tol:0.1,unit:'%'},
   steps:['A 2020 dollar buys 1 ÷ 1.302 ≈ 0.768 of what it did.','Lost: 1 − 0.768 = 0.232, about 23.2%.','Prices rose 30.2%, but buying power fell 23.2%: the two are not the same percent.'],
   lab:{set:{year:'2020',amt:2,reveal:true},look:'Read <b>Buying power a dollar has lost</b>.'},verify:[['lost',23.19,0.02]]},
  {id:'real',kind:'real',lvl:'honors',
   q:'Your pay rose from $16.00 to $16.50 an hour while prices rose 3.7%. Did your buying power go up or down, and by about how much?',
   choices:['Up about 3.1%','Down about 0.6%','Down about 3.7%','Up about 0.6%'],correct:1,
   steps:['Pay rose 16.50 ÷ 16.00 = 1.03125, a 3.125% raise.','Real change: 1.03125 ÷ 1.037 − 1 ≈ −0.0055.','Buying power fell about 0.6%.']},
  {id:'rate',kind:'test',lvl:'ap',
   q:'From 1990 to 2026 (36 years) prices grew by a factor of 2.578. To two decimals, what was the average yearly inflation rate?',
   num:{ans:2.67,tol:0.01,unit:'%'},
   steps:['Solve (1 + r)³⁶ = 2.578.','r = 2.578^(1/36) − 1 ≈ 0.02665.','About 2.67% a year.'],
   lab:{set:{year:'1990',amt:2,reveal:true},look:'Read <b>Average inflation per year</b>.'},verify:[['rate',2.665,0.005]]}
 ]
}
});
