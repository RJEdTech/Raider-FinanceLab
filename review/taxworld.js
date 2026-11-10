BioLab.addReview({
taxworld:{
 questions:[
  {id:'usleft',kind:'real',lvl:'bio',
   q:'An average single U.S. worker earns $73,520, takes home $55,644, pays $1,440 toward a work-based premium and about $2,483 more for health care directly. To one decimal, what percent of pay is left?',
   num:{ans:70.3,tol:0.06,unit:'%'},
   steps:['Health costs: $1,440 + $2,483 = $3,923.','Left: $55,644 − $3,923 = $51,721.','$51,721 ÷ $73,520 ≈ 70.3%.'],
   lab:{set:{vs:'de',hh:'single',view:'keep',reveal:true},look:'Read <b>U.S.: share of pay left</b>.'},verify:[['usLeft',70.35,0.01]]},
  {id:'deleft',kind:'real',lvl:'bio',
   q:'An average single German worker earns $93,985, takes home $57,634 and pays about $1,285 for health care directly. To one decimal, what percent of pay is left?',
   num:{ans:60.0,tol:0.06,unit:'%'},
   steps:['Left: $57,634 − $1,285 = $56,349.','$56,349 ÷ $93,985 ≈ 60.0%.'],
   lab:{set:{vs:'de',hh:'single',view:'keep',reveal:true},look:'Read <b>Other country: share of pay left</b>.'},verify:[['vsLeft',59.96,0.01]]},
  {id:'family',kind:'test',lvl:'bio',
   q:'For a married worker with two children, the U.S. leaves 64.1% of pay after taxes and direct health costs and Germany leaves 73.2%. What is the main reason the order flips from the single worker?',
   choices:['German taxes are lower for everyone','Germany pays family benefits, and the U.S. family premium share ($6,850) is much bigger than the single one','The U.S. charges more tax to families','The exchange rate changes'],correct:1,
   steps:['Germany’s take-home rises from $57,634 to $73,946 with family benefits.','The U.S. worker’s premium share jumps from $1,440 to $6,850.'],
   lab:{set:{vs:'de',hh:'fam',view:'keep',reveal:true},look:'Compare the two <b>share of pay left</b> readings.'},verify:[['usLeft',64.07,0.01],['vsLeft',73.21,0.01]]},
  {id:'ppp',kind:'test',lvl:'honors',
   q:'Why are these salaries in PPP dollars?',
   choices:['To match the stock market','So $1 buys about the same basket of goods in every country, making pay comparable','Because every country uses the dollar','To include taxes'],correct:1,
   steps:['Purchasing power parity converts each currency at the rate that makes the same basket cost the same.','So differences in prices, a big part of cost of living, are already built in.']},
  {id:'emp',kind:'real',lvl:'honors',
   q:'A U.S. job paying $73,520 costs the employer $79,466 in all, before health insurance. The employer also pays $7,885 toward the worker’s premium. How much does the employer pay on top of the wage?',
   num:{ans:13831,tol:0.5,unit:'dollars'},
   steps:['Payroll taxes: $79,466 − $73,520 = $5,946.','Plus the premium: $5,946 + $7,885 = $13,831.'],
   lab:{set:{vs:'de',hh:'single'},look:'Read <b>U.S.: employer pays on top of the wage</b>.'},verify:[['usEmp',13831,0.01]]},
  {id:'wedge',kind:'test',lvl:'ap',
   q:'A Danish job costs the employer $89,045; the single worker takes home $57,205. To one decimal, what is the tax wedge?',
   num:{ans:35.8,tol:0.06,unit:'%'},
   steps:['$89,045 − $57,205 = $31,840.','$31,840 ÷ $89,045 ≈ 35.8%.'],
   lab:{set:{vs:'dk',hh:'single'},look:'Read <b>Other country tax wedge</b>.'},verify:[['vsWedge',35.76,0.01]]}
 ]
}
});
