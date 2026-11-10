BioLab.addReview({
taxreal:{
 questions:[
  {id:'top1',kind:'real',lvl:'bio',
   q:'In tax year 2023 the top 1% reported $3,134,629 million of AGI and paid $823,411 million of federal income tax. To two decimals, what was their average rate?',
   num:{ans:26.27,tol:0.011,unit:'%'},
   steps:['Average rate = tax ÷ income.','823,411 ÷ 3,134,629 ≈ 0.2627.','26.27%, well below the 37% top bracket.'],
   lab:{set:{group:'t1',filing:'mfj',reveal:true},look:'Read <b>Average rate really paid (IRS)</b>.'},verify:[['real',26.27,0.01]]},
  {id:'why',kind:'test',lvl:'bio',
   q:'Which is NOT a reason people often pay a lower average rate than their top bracket?',
   choices:['Only the top slice of income is taxed at the top rate','Long-term capital gains are taxed at 20% at most','Credits like the Child Tax Credit','Everyone pays the top rate on all their income'],correct:3,
   steps:['Brackets tax each slice at its own rate.','Investment income held over a year has its own lower rates.','Credits subtract straight from the tax.']},
  {id:'paper',kind:'real',lvl:'honors',
   q:'A married couple has $138,466 of AGI. With the 2023 standard deduction of $27,700, their taxable income is $110,766. Using 10% to $22,000, 12% to $89,450 and 22% above, what is their tax on paper?',
   num:{ans:14983.52,tol:0.5,unit:'dollars'},
   steps:['10% × $22,000 = $2,200.','12% × $67,450 = $8,094.','22% × $21,316 = $4,689.52. Total $14,983.52.'],
   lab:{set:{group:'g25',filing:'mfj',reveal:true},look:'Read <b>Average rate the brackets give, on paper</b> and multiply by the average income.'}},
  {id:'share',kind:'test',lvl:'honors',
   q:'The bottom half earned 12.3% of all income and paid 3.3% of all income tax. Which is true?',
   choices:['Its tax share is less than its income share','Its tax share equals its income share','It paid no tax at all'],correct:0,
   steps:['3.3% < 12.3%.','Low brackets, the standard deduction and credits make its average rate (3.7%) far below the overall average (14.1%).'],
   lab:{set:{group:'b50',reveal:true},look:'Compare <b>share of all income tax</b> with <b>share of all income</b>.'},verify:[['shareTax',3.26,0.01],['shareAGI',12.32,0.01]]},
  {id:'model',kind:'test',lvl:'ap',
   q:'For the top 1%, the paper model (married) gives 33.1% and the IRS says 26.3%. Which change to the model would close most of the gap?',
   choices:['Tax capital gains and qualified dividends at 20% instead of 37%','Use the single brackets','Raise the standard deduction'],correct:0,
   steps:['The top 1% get a large share of income from capital gains and dividends.','Taxing that part at 20% instead of 37% lowers the model’s average the most.']}
 ]
}
});
