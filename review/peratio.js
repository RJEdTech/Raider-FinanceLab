BioLab.addReview({
peratio:{
 questions:[
  {id:'pe',kind:'test',lvl:'bio',
   q:'Netflix earned $2.53 per share in 2025. At $90 a share, to one decimal, what is its P/E?',
   num:{ans:35.6,tol:0.06,unit:''},
   steps:['P/E = price ÷ EPS.','$90 ÷ $2.53 ≈ 35.57.','About 35.6.'],
   lab:{set:{pa:90,b:'ko',pb:70,reveal:true},look:'Read <b>Netflix P/E</b>.'},verify:[['peA',35.57,0.01]]},
  {id:'which',kind:'real',lvl:'bio',
   q:'Netflix: $90, EPS $2.53. Coca-Cola: $70, EPS $3.04. Which costs less per $1 of earnings?',
   choices:['Netflix','Coca-Cola','They are the same'],correct:1,
   steps:['Netflix: $90 ÷ $2.53 ≈ 35.6.','Coca-Cola: $70 ÷ $3.04 ≈ 23.0.','The lower P/E costs less per $1 of earnings: Coca-Cola.']},
  {id:'per1000',kind:'real',lvl:'bio',
   q:'At a P/E of 23.0, how many dollars of yearly earnings does $1,000 of stock buy?',
   num:{ans:43.48,tol:0.05,unit:'dollars'},
   steps:['Each $23 buys $1 of yearly earnings.','$1,000 ÷ 23 ≈ $43.48.']},
  {id:'eps',kind:'test',lvl:'honors',
   q:'Netflix’s 2025 net income was $10,981.2 million and it had 4,343.9 million diluted shares. To the cent, what is its EPS?',
   num:{ans:2.53,tol:0.005,unit:'dollars'},
   steps:['EPS = net income ÷ diluted shares.','$10,981.2 million ÷ 4,343.9 million ≈ $2.528.','Rounded: $2.53.']},
  {id:'split',kind:'test',lvl:'honors',
   q:'Before a 10-for-1 split a stock is $1,100 with EPS $25.30. After the split, what are the price, EPS and P/E?',
   choices:['$110, $2.53, P/E 43.5','$110, $25.30, P/E 4.3','$1,100, $2.53, P/E 434.8','$110, $2.53, P/E 4.3'],correct:0,
   steps:['Price and EPS both divide by 10: $110 and $2.53.','P/E: $110 ÷ $2.53 ≈ 43.5, the same as $1,100 ÷ $25.30.']},
  {id:'yield',kind:'test',lvl:'ap',
   q:'Netflix at $90 has EPS $2.53. To two decimals, what is its earnings yield?',
   num:{ans:2.81,tol:0.01,unit:'%'},
   steps:['Earnings yield = EPS ÷ price.','$2.53 ÷ $90 ≈ 0.02811.','About 2.81%, which is 1 ÷ 35.57.'],
   lab:{set:{pa:90,b:'ko',pb:70,reveal:true},look:'Read <b>Netflix earnings yield</b>.'},verify:[['eyA',2.811,0.001]]}
 ]
}
});
