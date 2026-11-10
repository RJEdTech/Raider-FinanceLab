BioLab.addReview({
paycheck:{
 questions:[
  {id:'fica',kind:'test',lvl:'bio',
   q:'Gross pay on a paycheck is $2,291.67. To the cent, how much do Social Security (6.2%) and Medicare (1.45%) take together?',
   num:{ans:175.31,tol:0.02,unit:'dollars'},
   steps:['Social Security: $2,291.67 × 0.062 = $142.08.','Medicare: $2,291.67 × 0.0145 = $33.23.','Together: $175.31.'],
   lab:{set:{job:'first',salary:55000,freq:'semi',k401:0,reveal:true},look:'Read <b>Social Security</b> and <b>Medicare</b>.'},verify:[['ss',142.08,0.01],['med',33.23,0.01]]},
  {id:'keep55',kind:'real',lvl:'bio',
   q:'On a $55,000 salary paid twice a month, about what share of gross pay does a single Colorado worker take home?',
   choices:['About 60%','About 70%','About 81%','About 95%'],correct:2,
   steps:['Gross: $55,000 ÷ 24 = $2,291.67.','Out: $184.17 + $71.32 + $142.08 + $33.23 + $10.08 = $440.88.','Kept: $1,850.79 ÷ $2,291.67 ≈ 80.8%.'],
   lab:{set:{job:'first',salary:55000,freq:'semi',k401:0,reveal:true},look:'Read <b>Share of gross you take home</b>.'},verify:[['keepPct',80.76,0.05],['net',1850.79,0.01]]},
  {id:'parttime',kind:'real',lvl:'bio',
   q:'You work 15 hours a week at $15.16 an hour, paid every two weeks. What is your gross pay per paycheck?',
   num:{ans:454.80,tol:0.02,unit:'dollars'},
   steps:['Per week: 15 × $15.16 = $227.40.','Every two weeks: 2 × $227.40 = $454.80.','For the year that is $11,824.80, under the $16,100 standard deduction, so no income tax is withheld.'],
   lab:{set:{job:'part',wage:15.16,hours:15,freq:'biweekly',reveal:true},look:'Read <b>Gross pay, this paycheck</b> and <b>Federal income tax</b>.'},verify:[['gross',454.80,0.01],['fed',0,0.001]]},
  {id:'k401',kind:'real',lvl:'honors',
   q:'On $55,000 you start saving 5% in a traditional 401(k), $2,750 a year. By about how much does your yearly take-home pay drop?',
   choices:['$2,750','About $2,299','About $451','It does not change'],correct:1,
   steps:['Your 401(k) gets $2,750.','Income tax falls: $2,750 × (12% + 4.4%) = $451.','Take-home falls by $2,750 − $451 = $2,299.'],
   lab:{set:{job:'first',salary:55000,freq:'semi',k401:5,reveal:true},look:'Compare <b>Take-home pay for the year</b> with the value at 0%.'},verify:[['year',42120.24,0.5]]},
  {id:'taxable',kind:'test',lvl:'honors',
   q:'A single worker earns $40,000 in 2026 and takes the standard deduction. What is their taxable income?',
   num:{ans:23900,tol:1,unit:'dollars'},
   steps:['Taxable income = income − standard deduction.','$40,000 − $16,100 = $23,900.'],
   lab:{set:{job:'first',salary:40000,freq:'semi',k401:0,reveal:true},look:'Read <b>Taxable income for the year</b>.'},verify:[['taxable',23900,0.5]]},
  {id:'brk80',kind:'test',lvl:'ap',
   q:'Find the 2026 federal income tax for a single filer with $80,000 of wages and the standard deduction.',
   num:{ans:8770,tol:1,unit:'dollars'},
   steps:['Taxable: $80,000 − $16,100 = $63,900.','10% of $12,400 = $1,240; 12% of $38,000 = $4,560; 22% of $13,500 = $2,970.','Total: $8,770, an effective rate of 11.0% of wages.'],
   lab:{set:{job:'first',salary:80000,freq:'semi',k401:0,reveal:true},look:'Read <b>Federal income tax</b> and multiply by 24.'},verify:[['fed',365.42,0.01]]}
 ]
}
});
