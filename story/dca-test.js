/* Test yourself questions for "Dollar-cost averaging" (story version). Steps are 1-based story steps. */
TestYourself.mount({lab:'FinanceLab',id:'dca',title:'Raider FinanceLab · Dollar-cost averaging',el:'#ty',scrollTo:'#stagebox',go:i=>Story.go(i),
 questions:[
 {q:'You invest $150 a month for three months. The share price is $50, then $30, then $25. How many shares do you own in all?',answer:14,tol:.01,unit:'shares',
  hint:'Each month: dollars ÷ price = shares. 150 ÷ 50, then 150 ÷ 30, then 150 ÷ 25. Add them.',step:6,stepName:'dollars ÷ price = shares',
  why:'3 + 5 + 6 = 14 shares. The lowest price bought the most shares.'},
 {q:'Same three months: $450 in all, for those 14 shares. What is your average cost per share?',answer:32.14,tol:.02,unit:'dollars',
  hint:v=>Math.abs(v-35)<.02?'$35 is the average price: each month counted the same. Average cost is all the dollars ÷ all the shares.':'Average cost = total dollars ÷ total shares = 450 ÷ 14.',step:9,stepName:'level it',
  why:'450 ÷ 14 ≈ $32.14, below the $35 average price.'},
 {q:'Why is your average cost lower than the average price?',choices:['You bought more shares when the price was low','The fund gives monthly buyers a discount','Prices always go down over time','You put in less money in total'],answer:0,
  hint:'Look at the widths. Which month’s rectangle is widest, and what was its price?',step:10,stepName:'why it comes out lower',
  why:'Low prices make wide rectangles, so the low-price shares count for more in your average.'},
 {q:'If the share price is the same every month, how does your average cost compare with the price?',choices:['Exactly equal to that price','A little lower than that price','A little higher than that price','Zero, since nothing was gained'],answer:0,
  hint:'If every price is the same, every rectangle has the same height. What happens when you level them?',step:12,stepName:'draw your own prices',
  why:'Same height every month: the tops are already level, so the average cost is that price.'},
 {q:'Your average cost is $156.86 a share and today’s price is $140. Your shares are worth…',choices:['Less than you paid','More than you paid','Exactly what you paid','It is impossible to tell'],answer:0,
  hint:'Compare today’s price with what each share cost you on average.',step:11,stepName:'not a promise',
  why:'$140 is below $156.86, so the shares are worth less than you paid. A low average cost is not a profit.'}]});
