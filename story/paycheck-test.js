/* Test yourself questions for "Where did my paycheck go?" (story version). Steps are 1-based story steps. */
TestYourself.mount({lab:'FinanceLab',id:'paycheck',title:'Raider FinanceLab · Where did my paycheck go?',el:'#ty',scrollTo:'#stagebox',go:i=>Story.go(i),
 questions:[
 {q:'A paycheck is $300 before taxes. How much goes to Social Security, at 6.2%?',answer:18.60,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-1860)<.01?'6.2% is 6.2 cents from each dollar: 0.062, not 6.2.':'Social Security takes 6.2 cents from every dollar: 300 × 0.062.',step:3,stepName:'Social Security',
  why:'300 × 0.062 = $18.60.'},
 {q:'A paycheck is $500. Social Security, Medicare and FAMLI together take 8.09 cents from every dollar. How much do you keep?',answer:459.55,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-40.45)<.01?'$40.45 is what the three taxes take. Subtract it from $500.':'You keep 91.91 cents of every dollar: 500 × 0.9191.',step:8,stepName:'what lands in your account',
  why:'500 × 0.9191 = $459.55. The taxes take $40.45.'},
 {q:'You earn $14,000 in a whole year from a part-time job. How much federal income tax do you owe?',choices:['$0, because all of it is before the $16,100 line','$1,400, which is 10% of everything you earned','$1,680, which is 12% of everything you earned','$420, which is 3% of everything you earned'],answer:0,
  hint:'Income tax skips the first $16,100 a person earns in a year. Is any of your $14,000 past that line?',step:10,stepName:'the line at $16,100',
  why:'All $14,000 sits before the line, so no federal income tax. Social Security, Medicare and FAMLI still come out.'},
 {q:'You earn $30,000 in a year. Federal income tax skips the first $16,100, then takes 10¢ from each of the next 12,400 dollars and 12¢ from each dollar after that. How much federal income tax do you owe?',answer:1420,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-3000)<.01?'Income tax skips the first $16,100. Start from the dollars past the line.':Math.abs(v-1390)<.01?'Only the first 12,400 dollars past the line are at 10¢. The rest are at 12¢.':'Past the line: 30,000 − 16,100 = 13,900 dollars. The first 12,400 at 10¢, the other 1,500 at 12¢.',step:12,stepName:'federal income tax',
  why:'12,400 × 0.10 + 1,500 × 0.12 = 1,240 + 180 = $1,420.'},
 {q:'Your pay goes up from $55,000 to $56,000. What happens to the tax on your first $55,000?',choices:['Nothing: only new dollars can land at a higher rate','All of it moves up to the higher rate','It goes down, since the rate is spread out','It doubles, since you crossed a bracket'],answer:0,
  hint:'Slide along the bar. Does earning more change what happened to the dollars before?',step:14,stepName:'every dollar has a story',
  why:'Each dollar keeps its own story. The new 1,000 dollars are taxed at their own rate; the first 55,000 are unchanged.'}]});
