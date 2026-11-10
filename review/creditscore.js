BioLab.addReview({
creditscore:{
 questions:[
  {id:'now',kind:'test',lvl:'bio',
   q:'Maya owes $450. Her limits are $500 and $1,500. What is her credit utilization?',
   num:{ans:22.5,tol:0.05,unit:'%'},
   steps:['Total limit: $500 + $1,500 = $2,000.','$450 ÷ $2,000 = 0.225, so 22.5%.'],
   lab:{set:{L1:500,b1:450,L2:1500,pay:300,newL:1000,reveal:true},look:'Read <b>Credit utilization now</b>.'},verify:[['now',22.5,0.01]]},
  {id:'close',kind:'real',lvl:'bio',
   q:'If Maya closes the old $1,500 card, what is her utilization?',
   choices:['22.5%','15%','90%','0%'],correct:2,
   steps:['Her balance stays $450.','Her total limit drops to $500.','$450 ÷ $500 = 90%.'],
   lab:{set:{L1:500,b1:450,L2:1500,reveal:true},look:'Read <b>After closing the old card</b>.'},verify:[['close',90,0.01]]},
  {id:'pay',kind:'real',lvl:'bio',
   q:'Maya pays $300 toward the student card. What is her utilization?',
   num:{ans:7.5,tol:0.05,unit:'%'},
   steps:['Balance: $450 − $300 = $150.','$150 ÷ $2,000 = 7.5%.'],
   lab:{set:{L1:500,b1:450,L2:1500,pay:300,reveal:true},look:'Read <b>After paying down</b>.'},verify:[['pay',7.5,0.01]]},
  {id:'weights',kind:'test',lvl:'honors',
   q:'FICO says payment history counts 35% and amounts owed 30%. Together, what share of the score do they make up?',
   num:{ans:65,tol:0.5,unit:'%'},
   steps:['35% + 30% = 65%.','Paying on time and keeping balances low cover about two-thirds of what FICO weighs.']},
  {id:'open',kind:'real',lvl:'honors',
   q:'Maya opens a new card with a $1,000 limit. Which FICO categories does that touch?',
   choices:['Only amounts owed','Amounts owed, new credit and length of credit history','Only payment history','None'],correct:1,
   steps:['More limit lowers utilization (amounts owed).','The application is a hard inquiry (new credit).','A brand-new account lowers the average age (length of history).'],
   lab:{set:{L1:500,b1:450,L2:1500,newL:1000,reveal:true},look:'Read <b>After opening a new card</b>.'},verify:[['open',15,0.01]]},
  {id:'to10',kind:'test',lvl:'ap',
   q:'Maya owes $450 on $2,000 of credit. What is the least she can pay to bring utilization to 10% or less?',
   num:{ans:250,tol:0.5,unit:'dollars'},
   steps:['Target balance: 0.10 × $2,000 = $200.','Payment: $450 − $200 = $250.'],
   lab:{set:{L1:500,b1:450,L2:1500,reveal:true},look:'Read <b>Payment needed to get under 10%</b>.'},verify:[['to10',250,0.01]]}
 ]
}
});
