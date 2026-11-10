BioLab.addReview({
brackets:{
 questions:[
  {id:'raise3k',kind:'real',lvl:'bio',
   q:'You earn $65,000 and get a $3,000 raise. Taxable income goes from $48,900 to $51,900. How much more federal tax do you owe for the year?',
   num:{ans:510,tol:0.5,unit:'dollars'},
   steps:['$1,500 of the raise fills the rest of the 12% bracket (up to $50,400): $1,500 × 0.12 = $180.','The other $1,500 lands in the 22% bracket: $1,500 × 0.22 = $330.','Total: $180 + $330 = $510.'],
   lab:{set:{salary:65000,raise:3000,reveal:true},look:'Read <b>Extra federal tax from the raise</b>.'},verify:[['dTax',510,0.01]]},
  {id:'keep',kind:'real',lvl:'bio',
   q:'With every tax counted, about what share of that $3,000 raise do you keep?',
   choices:['About 22%','About 50%','About 70%','About 88%'],correct:2,
   steps:['Federal: $510. Colorado: 4.4% × $3,000 = $132. FICA: 7.65% × $3,000 = $229.50. FAMLI: 0.44% × $3,000 = $13.20.','Total: $884.70.','Kept: $3,000 − $884.70 = $2,115.30, about 70.5%.'],
   lab:{set:{salary:65000,raise:3000,reveal:true},look:'Read <b>Share of the raise you keep</b>.'},verify:[['dNet',2115.30,0.02],['keep',70.51,0.05]]},
  {id:'which',kind:'test',lvl:'bio',
   q:'A single filer has $60,000 of taxable income in 2026. Which statement is true?',
   choices:['All $60,000 is taxed at 22%','The first $12,400 is taxed at 10%, the next $38,000 at 12% and the last $9,600 at 22%','None of it is taxed at 22%','The first $50,400 is taxed at 22%'],correct:1,
   steps:['Each rate applies only to income inside its bracket.','$12,400 at 10%, $50,400 − $12,400 = $38,000 at 12%, and $60,000 − $50,400 = $9,600 at 22%.']},
  {id:'avg',kind:'test',lvl:'honors',
   q:'Taxable income $51,900 owes $6,130. The salary was $68,000. To one decimal, what is the average federal rate on the salary?',
   num:{ans:9.0,tol:0.06,unit:'%'},
   steps:['Average rate = total tax ÷ income.','$6,130 ÷ $68,000 ≈ 0.0901.','About 9.0%, while the next-dollar rate is 22%.'],
   lab:{set:{salary:65000,raise:3000,reveal:true},look:'Read <b>Average federal rate, after</b>.'},verify:[['e1',9.01,0.01]]},
  {id:'side',kind:'real',lvl:'honors',
   q:'Your taxable income is $70,000. You pick up $1,000 of extra work. How much more federal tax do you owe on it?',
   num:{ans:220,tol:0.5,unit:'dollars'},
   steps:['$70,000 is in the 22% bracket (from $50,400 to $105,700).','The extra $1,000 stays in that bracket.','$1,000 × 0.22 = $220.']},
  {id:'piece',kind:'test',lvl:'ap',
   q:'For taxable income T from $105,700 to $201,775, Tax(T) = 17,966 + 0.24(T − 105,700). Find Tax(150,000).',
   num:{ans:28598,tol:0.5,unit:'dollars'},
   steps:['150,000 − 105,700 = 44,300.','0.24 × 44,300 = 10,632.','17,966 + 10,632 = $28,598.'],
   lab:{set:{salary:166100,raise:500,reveal:true},look:'Read <b>Federal tax for the year, after</b>; it includes the $500, so subtract 24% of $500.'},verify:[['tax1',28718,0.01]]}
 ]
}
});
