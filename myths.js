/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
creditcard:[
 {k:'min',s:'If you pay the minimum on a credit card every month, you pay no interest.',fact:false,why:'Interest is charged on any balance you carry past the due date. Only paying the full statement balance avoids it.'},
 {k:'full',s:'Paying your full statement balance by the due date means you usually pay no interest on purchases.',fact:true,why:'That grace period is how many people use a card for free and still build credit.'},
 {k:'apr',s:'A 24% APR means you pay 24% of your purchase once.',fact:false,why:'APR is a yearly rate charged on whatever you still owe, usually figured daily. Carry a balance for years and you can pay far more than 24% in total.'}
],
startearly:[
 {k:'early',s:'Someone who starts saving at 22 can end up with more than someone who saves twice as much starting at 35.',fact:true,why:'Compound growth needs time. Thirteen extra years of growth can beat a bigger monthly amount started later.'},
 {k:'rich',s:'You need a lot of money before investing is worth it.',fact:false,why:'Many accounts let you start with a few dollars. Starting small and early matters more than starting big.'},
 {k:'double',s:'At about 7% a year, money roughly doubles in about 10 years.',fact:true,why:'The rule of 72: 72 ÷ 7 ≈ 10 years. Returns vary year to year, so this is an average, not a promise.'}
]
});

/* Batch 2 (Nov 17, 2026): the rest of FinanceLab. */
BioLab.addMyths({
brackets:[
 {k:'raise',s:'A raise can move you into a higher tax bracket and leave you with less take-home pay.',fact:false,why:'Only the dollars above the bracket line are taxed at the higher rate. The rest are taxed as before, so income tax alone can never turn a raise into less take-home pay.'},
 {k:'marginal',s:'Your marginal rate is the rate on your last dollar of income.',fact:true,why:'Your effective rate, total tax ÷ income, is lower.'},
 {k:'all',s:'Being “in the 22% bracket” means you pay 22% of your whole income in federal income tax.',fact:false,why:'Lower slices are taxed at 10% and 12%, so the average is well below 22%.'}
],
cardoffer:[
 {k:'zero',s:'A 0% intro APR lasts forever.',fact:false,why:'Intro rates end, often after 12 to 21 months, and then the regular rate applies to any balance.'},
 {k:'fee',s:'A balance transfer usually costs a fee of a few percent of the amount moved.',fact:true,why:'Often 3% to 5%. Include it when comparing offers.'},
 {k:'fine',s:'The fine print can change which offer actually costs less.',fact:true,why:'Fees, penalty rates and when the intro rate ends all add up.'}
],
carhouse:[
 {k:'monthly',s:'A low monthly payment means a car is affordable.',fact:false,why:'A longer loan lowers the payment but raises the total interest paid.'},
 {k:'invest',s:'Money that goes to car payments for years could grow if invested instead.',fact:true,why:'Compound growth over decades can turn steady payments into a large sum.'},
 {k:'value',s:'A new car loses value fastest in its first few years.',fact:true,why:'Many lose around 20% in the first year.'}
],
carquote:[
 {k:'color',s:'Red cars cost more to insure.',fact:false,why:'Insurers don’t price by color. Age, driving record, location and the car’s value and safety matter.'},
 {k:'teen',s:'Teen drivers usually pay much more for insurance than older drivers.',fact:true,why:'Teens have higher crash rates, so the risk priced in is higher.'},
 {k:'grades',s:'Good grades can lower a teen’s car insurance price.',fact:true,why:'Many insurers offer a good-student discount.'}
],
costofliving:[
 {k:'same',s:'A salary goes just as far in any city.',fact:false,why:'Housing, transportation and taxes vary a lot, so the same paycheck can buy very different lives.'},
 {k:'housing',s:'Housing is usually the biggest monthly cost for a household.',fact:true,why:'Rent or a mortgage often takes about a third of income or more.'},
 {k:'rule',s:'A common guideline is to spend no more than about 30% of income on housing.',fact:true,why:'Above that, households are often called cost-burdened.'}
],
creditscore:[
 {k:'check',s:'Checking your own credit score lowers it.',fact:false,why:'Checking your own is a soft inquiry and doesn’t affect your score.'},
 {k:'util',s:'Using a smaller share of your credit limit helps your score.',fact:true,why:'Credit utilization is a big factor; under about 30% is a common guideline, lower is better.'},
 {k:'late',s:'Paying on time is one of the biggest parts of a credit score.',fact:true,why:'Payment history is the single largest factor in FICO scores, about 35%.'}
],
dca:[
 {k:'more',s:'Dollar-cost averaging buys more shares when prices are low.',fact:true,why:'The same dollars buy more shares when the price drops.'},
 {k:'loss',s:'Dollar-cost averaging guarantees you won’t lose money.',fact:false,why:'It spreads out timing risk, but if the investment falls and stays down, you can still lose.'},
 {k:'habit',s:'Investing a fixed amount on a schedule takes emotion out of timing the market.',fact:true,why:'You don’t have to guess the best day to buy.'}
],
debtfit:[
 {k:'same',s:'Every major leads to about the same starting salary.',fact:false,why:'Starting pay varies widely by field, which changes how much student debt fits.'},
 {k:'rule',s:'A common guideline is to borrow no more in total than your expected first-year salary.',fact:true,why:'Then payments are more likely to fit a starting budget.'},
 {k:'interest',s:'Student loan interest can make the total repaid much bigger than the amount borrowed.',fact:true,why:'Interest builds over a typical 10-year plan or longer.'}
],
drawdown:[
 {k:'equal',s:'After a 50% drop, a 50% gain brings you back to even.',fact:false,why:'You need a 100% gain. $100 → $50 needs to double to get back to $100.'},
 {k:'2008',s:'The S&P 500 fell about 57% from its 2007 peak to its 2009 low.',fact:true,why:'It didn’t get back to its 2007 high until 2013 (not counting dividends).'},
 {k:'sell',s:'Selling after a big drop locks in the loss.',fact:true,why:'If you sell low, you miss any recovery.'}
],
firstmonth:[
 {k:'gross',s:'Your first paycheck will match your hourly wage times your hours.',fact:false,why:'Taxes and other deductions come out first, so take-home pay is lower.'},
 {k:'deposit',s:'Moving into an apartment often costs a security deposit as well as the first month’s rent.',fact:true,why:'Plan for both at once.'},
 {k:'buffer',s:'An emergency fund helps when an unexpected cost hits.',fact:true,why:'A car repair won’t turn into credit card debt.'}
],
inflation:[
 {k:'same',s:'$100 today buys the same as $100 did in 1990.',fact:false,why:'Prices have risen about two and a half times since 1990, so $100 buys about 40% as much.'},
 {k:'cpi',s:'The Consumer Price Index tracks how prices change over time.',fact:true,why:'The Bureau of Labor Statistics publishes it monthly.'},
 {k:'save',s:'Cash in a 0% account loses buying power when there is inflation.',fact:true,why:'The number stays the same while prices rise.'}
],
insurance:[
 {k:'always',s:'Insurance is always worth buying.',fact:false,why:'Insurers expect to collect more than they pay out on average. It is worth it when a loss would be hard to handle.'},
 {k:'deduct',s:'A higher deductible usually means a lower premium.',fact:true,why:'You agree to pay more yourself before the insurance pays.'},
 {k:'big',s:'Insurance matters most for losses you couldn’t afford on your own.',fact:true,why:'Like a car crash or a hospital stay.'}
],
livingwage:[
 {k:'min',s:'The federal minimum wage is the same as a living wage.',fact:false,why:'The federal minimum has been $7.25 since 2009. MIT estimates a living wage for one adult is well above that in every state.'},
 {k:'place',s:'A living wage depends on where you live and how many people you support.',fact:true,why:'Rent, child care and transportation costs vary.'},
 {k:'colo',s:'Colorado’s minimum wage is higher than the federal minimum.',fact:true,why:'Colorado sets its own, adjusted for inflation each year, and Denver’s is higher still.'}
],
minutesofwork:[
 {k:'hour',s:'Thinking of a price in hours of work can change whether something feels worth it.',fact:true,why:'A $60 purchase is about 4 hours at $15/hour, before taxes.'},
 {k:'tax',s:'At $15 an hour you take home $15 for every hour worked.',fact:false,why:'Taxes and deductions come out, so take-home is less.'},
 {k:'compare',s:'Prices measured in minutes of work let you compare across years and places.',fact:true,why:'It accounts for differences in wages.'}
],
mortgageterm:[
 {k:'save',s:'A 15-year mortgage usually costs much less total interest than a 30-year one.',fact:true,why:'You pay the loan off faster, often at a lower rate.'},
 {k:'pay',s:'A 15-year mortgage has a lower monthly payment.',fact:false,why:'The monthly payment is higher because you pay the loan off in half the time.'},
 {k:'early',s:'Early mortgage payments go mostly to interest.',fact:true,why:'Interest is charged on the large remaining balance.'}
],
onepercent:[
 {k:'small',s:'A 1% difference in interest rate makes almost no difference on a big loan.',fact:false,why:'On a long mortgage, 1% can add tens of thousands of dollars in interest.'},
 {k:'save',s:'A 1% higher return compounding for decades can grow savings a lot more.',fact:true,why:'Compounding magnifies small differences over time.'},
 {k:'fees',s:'Investment fees of 1% a year can cost a large share of long-term growth.',fact:true,why:'The fee comes out every year, and the money it takes can’t compound.'}
],
passwords:[
 {k:'long',s:'A long passphrase can be stronger than a short password with symbols.',fact:true,why:'Length multiplies the number of guesses needed.'},
 {k:'reuse',s:'Reusing one strong password on many sites is safe.',fact:false,why:'If one site leaks it, attackers try it everywhere. Use a password manager.'},
 {k:'mfa',s:'Turning on two-factor sign-in makes your bank account much safer.',fact:true,why:'A stolen password alone isn’t enough.'}
],
paycheck:[
 {k:'fica',s:'Social Security and Medicare taxes come out of most paychecks.',fact:true,why:'Together they are 7.65% of wages for most workers.'},
 {k:'gross',s:'Gross pay and take-home pay are the same thing.',fact:false,why:'Take-home (net) pay is gross pay minus taxes and deductions.'},
 {k:'w4',s:'The W-4 form affects how much federal income tax is withheld.',fact:true,why:'Fill it out when you start a job.'}
],
peratio:[
 {k:'cheap',s:'A low P/E ratio always means a stock is a bargain.',fact:false,why:'It can mean investors expect earnings to fall. Compare within an industry.'},
 {k:'def',s:'P/E is the stock price divided by earnings per share.',fact:true,why:'It is what investors pay for each $1 of yearly earnings.'},
 {k:'growth',s:'Fast-growing companies often have high P/E ratios.',fact:true,why:'Investors pay more today for expected future earnings.'}
],
povertypremium:[
 {k:'fees',s:'People with less money often pay more for the same things.',fact:true,why:'Check-cashing fees, overdraft fees, higher-interest loans and buying in small sizes add up.'},
 {k:'bulk',s:'Everyone can save by buying in bulk.',fact:false,why:'Bulk buying needs cash up front, storage space and a car, which not everyone has.'},
 {k:'credit',s:'A lower credit score usually means higher interest rates.',fact:true,why:'Lenders charge more when they see more risk.'}
],
savings:[
 {k:'apy',s:'APY includes the effect of compounding.',fact:true,why:'That is why it is a fair way to compare savings accounts.'},
 {k:'same',s:'All savings accounts pay about the same interest.',fact:false,why:'Rates differ a lot; high-yield accounts can pay many times more than a typical bank savings account.'},
 {k:'fdic',s:'Money in an FDIC-insured bank account is protected up to $250,000.',fact:true,why:'Per depositor, per bank, per ownership category.'}
],
stickernet:[
 {k:'sticker',s:'Most students pay a college’s full sticker price.',fact:false,why:'Many get grants and scholarships. The net price, after aid, is often much lower.'},
 {k:'calc',s:'Every college has a net price calculator on its website.',fact:true,why:'Federal law requires it, so you can estimate your cost before applying.'},
 {k:'grant',s:'Grants don’t have to be repaid, but loans do.',fact:true,why:'Compare the grant part of an aid offer, not just the total.'}
],
taxreal:[
 {k:'rate',s:'The tax rate written in law is always the rate people actually pay.',fact:false,why:'Deductions, credits and how income is earned (wages or investments) change what people really pay.'},
 {k:'cap',s:'Long-term capital gains are taxed at lower federal rates than most wages.',fact:true,why:'Rates are 0%, 15% or 20%, below the top rates on wages.'},
 {k:'many',s:'Federal income tax is only one of several taxes people pay.',fact:true,why:'Payroll, sales, property and state taxes all count when comparing groups.'}
],
taxreceipt:[
 {k:'aid',s:'Foreign aid is about a quarter of the federal budget.',fact:false,why:'Surveys find people often guess around 25%. It is about 1%.'},
 {k:'big',s:'Social Security, Medicare and Medicaid are among the largest parts of federal spending.',fact:true,why:'Together they are close to half of all federal spending.'},
 {k:'interest',s:'Interest on the national debt is now one of the biggest federal costs.',fact:true,why:'Recently it has been larger than defense spending.'}
],
taxworld:[
 {k:'same',s:'Every country taxes paychecks about the same.',fact:false,why:'Tax levels and what they pay for, like health care or college, vary a lot between countries.'},
 {k:'buy',s:'Higher taxes in some countries pay for services people in other countries buy on their own.',fact:true,why:'Comparing take-home pay alone leaves that out.'},
 {k:'vat',s:'Many countries use a value-added tax built into prices.',fact:true,why:'The U.S. relies on state and local sales taxes instead.'}
]
});
