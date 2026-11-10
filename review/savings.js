BioLab.addReview({
savings:{
 questions:[
  {id:'three',kind:'real',lvl:'bio',
   q:'You deposit $2,000 at 4% APY for 3 years and add nothing. To the cent, what is the balance?',
   num:{ans:2249.73,tol:0.01,unit:'dollars'},
   steps:['Growth factor: 1.04³ = 1.124864.','$2,000 × 1.124864 = $2,249.73.'],
   lab:{set:{amt:2000,yrs:3,apy:4,dep:0,reveal:true},look:'Read <b>High-yield account</b>.'},verify:[['hi',2249.73,0.01]]},
  {id:'gap',kind:'real',lvl:'bio',
   q:'Same $2,000 for 3 years, at 4% or at 0.38%. About how much more does the 4% account earn?',
   choices:['About $10','About $72','About $227','About $2,000'],correct:2,
   steps:['4%: $2,249.73.','0.38%: $2,000 × 1.0038³ = $2,022.89.','Difference: $226.84.'],
   lab:{set:{amt:2000,yrs:3,apy:4,dep:0,reveal:true},look:'Read <b>Extra from the high-yield account</b>.'},verify:[['gap',226.84,0.01]]},
  {id:'yr1',kind:'test',lvl:'bio',
   q:'$2,000 earns 4% in year 1. How much interest does it earn in year 2 if you leave the interest in?',
   num:{ans:83.20,tol:0.01,unit:'dollars'},
   steps:['After year 1: $2,000 × 1.04 = $2,080.','Year 2 interest: $2,080 × 0.04 = $83.20, more than year 1’s $80.']},
  {id:'r72',kind:'test',lvl:'honors',
   q:'At 0.38% a year, about how many years does money take to double by the rule of 72?',
   choices:['About 19','About 72','About 190','About 380'],correct:2,
   steps:['72 ÷ 0.38 ≈ 189.5.','About 190 years. At 4% it takes about 18.']},
  {id:'monthly',kind:'real',lvl:'honors',
   q:'Start with $2,000 at 4% APY and add $50 at the end of every month. To the nearest dollar, what is the balance after 3 years?',
   num:{ans:4157,tol:2,unit:'dollars'},
   steps:['The monthly growth factor is 1.04^(1/12) ≈ 1.003274.','The $2,000 grows to $2,249.73.','The 36 deposits grow to 50 × (1.003274³⁶ − 1) ÷ 0.003274 ≈ $1,907, for a total near $4,157.'],
   lab:{set:{amt:2000,yrs:3,apy:4,dep:50,reveal:true},look:'Read <b>High-yield account</b>.'},verify:[['hi',4156.78,0.02]]},
  {id:'real',kind:'test',lvl:'ap',
   q:'A balance of $2,960.49 after 10 years, with prices rising 3.7% a year. To the nearest dollar, what is it worth in today’s dollars?',
   num:{ans:2059,tol:1,unit:'dollars'},
   steps:['1.037¹⁰ ≈ 1.4381.','$2,960.49 ÷ 1.4381 ≈ $2,058.62.'],
   lab:{set:{amt:2000,yrs:10,apy:4,dep:0,inf:3.7,reveal:true},look:'Read <b>High-yield balance in today’s dollars</b>.'},verify:[['real',2058.62,0.02]]}
 ]
}
});
