BioLab.addReview({
dca:{
 questions:[
  {id:'march',kind:'test',lvl:'bio',
   q:'You invest $200 when the price is $125. How many shares do you buy?',
   num:{ans:1.6,tol:0.001,unit:'shares'},
   steps:['Shares = dollars ÷ price.','$200 ÷ $125 = 1.6 shares.']},
  {id:'avgcost',kind:'real',lvl:'bio',
   q:'$200 a month at $200, $160, $125 and $160. To the cent, what is your average cost per share?',
   num:{ans:156.86,tol:0.01,unit:'dollars'},
   steps:['Shares: 1.00 + 1.25 + 1.60 + 1.25 = 5.10.','Average cost: $800 ÷ 5.10 ≈ $156.86.','The average price is $161.25, so you paid $4.39 less per share.'],
   lab:{set:{path:'class',amt:200,reveal:true},look:'Read <b>Your average cost per share</b>.'},verify:[['avgC',156.86,0.01],['shares',5.1,0.0001]]},
  {id:'value',kind:'real',lvl:'bio',
   q:'After those four buys you own 5.10 shares and the price is $160. What are they worth?',
   choices:['$640','$800','$816','$822.38'],correct:2,
   steps:['Value = shares × price.','5.10 × $160 = $816, a $16 gain on $800.'],
   lab:{set:{path:'class',amt:200,reveal:true},look:'Read <b>Value at the last price</b>.'},verify:[['value',816,0.01]]},
  {id:'lump',kind:'real',lvl:'honors',
   q:'Prices drop, then recover: $100, $60, $90, $120. Spreading $800 over four months ends with $1,106.67. What does $800 invested on day one end with?',
   num:{ans:960,tol:0.01,unit:'dollars'},
   steps:['$800 ÷ $100 = 8 shares.','8 × $120 = $960.','Here spreading it out won, because it bought cheap shares in the dip.'],
   lab:{set:{path:'bumpy',amt:200,reveal:true},look:'Read <b>Lump sum on day one</b>.'},verify:[['lump',960,0.01],['value',1106.67,0.01]]},
  {id:'falling',kind:'test',lvl:'honors',
   q:'Prices fall every month: $160, $140, $120, $100. With $200 a month, which is true at the end?',
   choices:['You made money because your cost was below the average price','Your cost ($126.08) is below the average price ($130), but the shares are worth $634.52, less than the $800 you put in','You own fewer shares than if prices had risen'],correct:1,
   steps:['Shares: 1.25 + 1.4286 + 1.6667 + 2 = 6.3452.','Cost: $800 ÷ 6.3452 ≈ $126.08; value: 6.3452 × $100 = $634.52.','A low average cost does not mean a profit.'],
   lab:{set:{path:'falling',amt:200,reveal:true},look:'Read <b>Your average cost per share</b> and <b>Value at the last price</b>.'},verify:[['avgC',126.08,0.01],['value',634.52,0.01]]},
  {id:'hm',kind:'test',lvl:'ap',
   q:'With equal dollars at prices p₁, …, p₄, which expression equals the average cost per share?',
   choices:['(p₁ + p₂ + p₃ + p₄) ÷ 4','4 ÷ (1/p₁ + 1/p₂ + 1/p₃ + 1/p₄)','√(p₁p₂p₃p₄)','max(p) − min(p)'],correct:1,
   steps:['Total dollars: 4D. Total shares: D/p₁ + D/p₂ + D/p₃ + D/p₄.','Divide: 4D ÷ D(1/p₁ + … + 1/p₄) = 4 ÷ (1/p₁ + … + 1/p₄).','That is the harmonic mean.']}
 ]
}
});
