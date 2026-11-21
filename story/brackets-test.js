/* Test yourself questions for "Can a raise cost me money?" (story version). Steps are 1-based story steps. */
TestYourself.mount({lab:'FinanceLab',id:'brackets',title:'Raider FinanceLab · Can a raise cost me money?',el:'#ty',scrollTo:'#stagebox',go:i=>Story.go(i),
 questions:[
 {q:'After the $16,100 is set aside, your taxable income is $40,000. Federal tax takes 10¢ from each of the first 12,400 dollars and 12¢ from each dollar up to 50,400. How much federal tax?',answer:4552,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-4800)<.01?'That is 12¢ on every dollar. The first 12,400 dollars fill the 10¢ room.':'Fill the rooms in order: 12,400 × 0.10, then the other 27,600 × 0.12.',step:4,stepName:'brackets are rooms',
  why:'1,240 + 3,312 = $4,552.'},
 {q:'Your taxable income is $49,400 and you get a $2,000 raise. The 12¢ room ends at 50,400; the next room is 22¢. How much more federal tax do you owe?',answer:340,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-440)<.01?'Not all of the raise lands in the 22¢ room. The first 1,000 new dollars finish filling the 12¢ room.':'Split the raise at 50,400: 1,000 new dollars at 12¢ and 1,000 at 22¢.',step:5,stepName:'now the raise',
  why:'1,000 × 0.12 + 1,000 × 0.22 = 120 + 220 = $340. Your old dollars are taxed exactly as before.'},
 {q:'Under the federal tax brackets, can a raise make your take-home pay go down?',choices:['No: only the new dollars pay the higher rate','Yes, whenever you cross into a new bracket','Yes, always','Only if the raise is large'],answer:0,
  hint:'Follow the green take-home line as pay grows. Does it ever turn down?',step:9,stepName:'it bends, it never drops',
  why:'Each new dollar keeps most of itself, so take-home pay always rises. The line bends; it never drops.'},
 {q:'You pay $6,000 in federal income tax on $70,000 of pay. What is your average rate, in cents per dollar? (Round to one decimal.)',answer:8.6,tol:.06,unit:'¢ per dollar',
  hint:'Average rate = tax ÷ pay = 6,000 ÷ 70,000. Then turn it into cents per dollar.',step:11,stepName:'level it',
  why:'6,000 ÷ 70,000 ≈ 0.086, about 8.6¢ per dollar, even if your next dollar pays 22¢.'},
 {q:'Which rate tells you how much of your next dollar goes to federal income tax?',choices:['The rate of the room that dollar lands in','Your average rate','The 10¢ rate','None: the next dollar is never taxed'],answer:0,
  hint:'There are two rates on the picture. One is the leveled-out average. Which one belongs to the next dollar?',step:10,stepName:'two rates',
  why:'The next dollar pays its room’s rate, the marginal rate. The average rate is lower because early dollars pay less.'}]});
