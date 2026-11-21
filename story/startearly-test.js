/* Test yourself questions for "Start at 22 or 32" (story version). Steps are 1-based story steps. */
TestYourself.mount({lab:'FinanceLab',id:'startearly',title:'Raider FinanceLab · Start at 22 or 32',el:'#ty',scrollTo:'#stagebox',go:i=>Story.go(i),
 questions:[
 {q:'You put $1,000 in an account that grows 7% a year and leave it alone. What is it worth after 2 years?',answer:1144.90,tol:.01,unit:'dollars',
  hint:v=>Math.abs(v-1140)<.01?'That is $70 twice. In year two the first $70 earns 7% too: growth on growth.':'Year one: 1,000 × 1.07. Year two: multiply that whole pile by 1.07 again.',step:4,stepName:'year two',
  why:'1,000 × 1.07 × 1.07 = $1,144.90. The extra $4.90 is year one’s growth earning its own 7%.'},
 {q:'At 7% a year, money doubles about every 10 years. About what does $500 become in 30 years?',choices:['About $4,000','About $1,500','About $3,000','About $2,000'],answer:0,
  hint:'30 years is three doublings. Double $500, then double again, then once more.',step:9,stepName:'count the doublings',
  why:'$500 → $1,000 → $2,000 → $4,000 (the exact figure is $3,806). Each doubling is twice as big as the one before.'},
 {q:'Jordan saves $1,000 a year from age 25 to 35, then stops. Taylor saves $1,000 a year from 35 to 65. Both earn 7%. Who has more at 65?',choices:['Jordan, who put in $10,000','Taylor, who put in $30,000','They end up about equal','You can’t tell'],answer:0,
  hint:'Height in the picture is how long each deposit waits. Whose deposits wait 30 years or more?',step:15,stepName:'add them up',
  why:'Jordan ends with about $112,500, Taylor about $101,000. Jordan’s ten deposits each waited 30 years or more.'},
 {q:'Which expression gives the value of $300 after 20 years at 5% a year?',choices:['300 × 1.05²⁰','300 × 1.05 × 20','300 + 0.05 × 20','300 × 20⁵'],answer:0,
  hint:'Every year the pile does one thing: times (1 + r). Do that t times.',step:8,stepName:'the same move, every year',
  why:'end = start × (1 + r)ᵗ = 300 × 1.05²⁰, about $796.'},
 {q:'Why do the last ten years add the most money?',choices:['The pile is biggest then, so each 7% slice is biggest','Interest rates rise as you get older, so it earns more','You deposit more near retirement, so the pile jumps','Banks pay a loyalty bonus for staying many years'],answer:0,
  hint:'7% of a small pile is a small slice. What is 7% of a big pile?',step:10,stepName:'ten years late',
  why:'The same 7% of a much bigger pile is a much bigger slice. Starting late costs you the last, biggest doubling.'}]});
