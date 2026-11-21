/* Test yourself questions for "Paying off a credit card" (story version). Steps are 1-based story steps. */
TestYourself.mount({lab:'FinanceLab',id:'creditcard',title:'Raider FinanceLab · Paying off a credit card',el:'#ty',scrollTo:'#stagebox',go:i=>Story.go(i),
 questions:[
 {q:'A card charges 18% a year, which is 1.5% a month. You owe $800 and make no payment this month. What do you owe next month?',answer:812,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-944)<.01?'18% is the yearly rate. Each month the card adds only 1.5%.':'The card adds 1.5% of $800 to the pile: 800 × 0.015.',step:3,stepName:'the card adds its slice',
  why:'1.5% of $800 is $12, so you owe $812.'},
 {q:'You owe $1,000 on a card that charges 2% a month, and you pay $50. How much comes off what you owe?',answer:30,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-50)<.01?'First the card adds its 2% slice. Only what is left of your $50 comes off the debt.':'2% of $1,000 is the card’s slice. Take that out of your $50.',step:4,stepName:'paying the minimum',
  why:'$20 pays the card’s slice and $30 comes off. You now owe $970.'},
 {q:'Paying only the minimum, why does the debt shrink so slowly at first?',choices:['Most of each payment goes to the card’s slice, not the debt','The minimum is mostly fees, so little reaches the debt','The card adds a new fee every week that you owe it','Payments only start to count after the first year'],answer:0,
  hint:'Look at each payment’s column. How much is red, and how much is blue?',step:9,stepName:'every payment, side by side',
  why:'Early on the red part (the card’s slice) is most of each payment, so only a thin blue part comes off the debt.'},
 {q:'Two friends each owe $1,500 on the same card (2% a month). One pays $50 a month, the other $100. How does the interest they pay compare?',choices:['The $100 payer pays well under half as much interest','They pay the same interest','The $100 payer pays more interest','The $100 payer pays exactly half as much'],answer:0,
  hint:'Paying more shrinks the pile faster, so every later slice is smaller, and there are far fewer months of slices.',step:12,stepName:'pay more than the minimum',
  why:'$50 a month takes 47 months and about $814 in interest. $100 a month takes 19 months and about $301: less than half.'},
 {q:'In next = owes × (1 + r) − payment, what is r for a card that charges 24% a year?',choices:['0.02','0.24','24','1.24'],answer:0,
  hint:'The formula runs once a month, so r is the monthly rate. 24% a year spread over 12 months is how much each month?',step:7,stepName:'the same two moves, every month',
  why:'24% ÷ 12 = 2% a month, which is 0.02.'}]});
