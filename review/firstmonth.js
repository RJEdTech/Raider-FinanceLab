BioLab.addReview({
firstmonth:{
 questions:[
  {id:'groc',kind:'real',lvl:'bio',
   q:'You spend $100 a week on groceries. To the cent, how much is that per month?',
   num:{ans:433.33,tol:0.01,unit:'dollars'},
   steps:['$100 × 52 weeks = $5,200 a year.','$5,200 ÷ 12 months = $433.33 a month.']},
  {id:'gap',kind:'real',lvl:'bio',
   q:'Alex takes home $3,701.58 and the budget adds up to $4,213.86. What is left at the end of the month?',
   choices:['$512.28 left','$512.28 short','$105.22 left','$0'],correct:1,
   steps:['Left over = take-home − spending.','$3,701.58 − $4,213.86 = −$512.28.','A negative number means Alex is short.'],
   lab:{set:{home:'alone',groc:100,ski:'yes',loan:'avg',give:0,salary:55000,reveal:true},look:'Read <b>Left over</b>.'},verify:[['left',-512.28,0.02]]},
  {id:'rent',kind:'test',lvl:'bio',
   q:'Rent is $1,750 and take-home pay is $3,701.58. To one decimal, what percent of take-home is rent?',
   num:{ans:47.3,tol:0.06,unit:'%'},
   steps:['$1,750 ÷ $3,701.58 ≈ 0.4728.','About 47.3%.'],
   lab:{set:{home:'alone',salary:55000,reveal:true},look:'Read <b>Rent as a share of take-home</b>.'},verify:[['rentPct',47.28,0.01]]},
  {id:'room',kind:'real',lvl:'bio',
   q:'With a roommate, Alex pays $1,225 rent, $62.50 utilities and $30 internet instead of $1,750, $125 and $60. How much does that save each month?',
   num:{ans:617.50,tol:0.01,unit:'dollars'},
   steps:['Rent: $1,750 − $1,225 = $525.','Utilities: $125 − $62.50 = $62.50. Internet: $60 − $30 = $30.','Total: $617.50.'],
   lab:{set:{home:'room',groc:100,ski:'yes',loan:'avg',give:0,salary:55000,reveal:true},look:'Read <b>Left over</b>; it rises from −$512.28.'},verify:[['left',105.22,0.02]]},
  {id:'fifty',kind:'test',lvl:'honors',
   q:'Under the 50/30/20 guideline, how much of $3,701.58 a month goes to needs?',
   num:{ans:1850.79,tol:0.01,unit:'dollars'},
   steps:['Needs: 50%.','$3,701.58 × 0.50 = $1,850.79.']},
  {id:'loanpay',kind:'test',lvl:'ap',
   q:'$29,560 borrowed at 6.52% a year, repaid monthly over 10 years. To the cent, what is the payment?',
   num:{ans:335.95,tol:0.02,unit:'dollars'},
   steps:['r = 0.0652 ÷ 12 ≈ 0.0054333; n = 120.','(1 + r)⁻¹²⁰ ≈ 0.5219.','$29,560 × 0.0054333 ÷ (1 − 0.5219) ≈ $335.95.'],
   lab:{set:{loan:'avg'},look:'Read <b>Student loan payment</b>.'},verify:[['loanPay',335.95,0.01]]}
 ]
}
});
