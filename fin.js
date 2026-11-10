/* Raider FinanceLab: shared 2026 money facts, loaded after engine.js and before the tools.
   Sources (checked Nov 10, 2026):
   - Federal brackets and standard deduction, tax year 2026, single filer: IRS Rev. Proc. 2025-32, Table 3 and section 4.14.
   - Social Security 6.2% up to the 2026 wage base of $184,500; Medicare 1.45% with no cap (SSA, Oct 24, 2025).
   - Colorado: flat 4.4% of federal taxable income (Colorado Department of Revenue; Proposition 121).
   - Colorado FAMLI: 0.88% of wages in 2026, of which the employee pays 0.44% (SB 25-144; FAMLI Division).
   - Colorado minimum wage $15.16 in 2026; Denver $19.29 (CDLE; City and County of Denver). */
(function(){
'use strict';
const STD=16100;
const BR=[[12400,0.10],[50400,0.12],[105700,0.22],[201775,0.24],[256225,0.32],[640600,0.35],[Infinity,0.37]];
const SS=0.062,SSCAP=184500,MED=0.0145,CO=0.044,FAMLI=0.0044;
/* federal income tax on taxable income T, bracket by bracket */
function fedTax(T){let tax=0,lo=0;T=Math.max(0,T);for(const [hi,r] of BR){if(T>lo)tax+=(Math.min(T,hi)-lo)*r;lo=hi;if(T<=hi)break;}return tax;}
/* the slice of income taxed in each bracket: [{lo,hi,r,amt,tax}] */
function slices(T){const out=[];let lo=0;T=Math.max(0,T);for(const [hi,r] of BR){const amt=Math.max(0,Math.min(T,hi)-lo);out.push({lo,hi,r,amt,tax:amt*r});lo=hi;if(T<=hi)break;}return out;}
function marginal(T){if(T<=0)return 0;for(const [hi,r] of BR)if(T<=hi)return r;return 0.37;}
const r2=v=>Math.round(v*100)/100;
/* one paycheck. gross = yearly pay; n = paychecks a year; pre = yearly pretax 401(k) dollars.
   Withholding is estimated as the year's tax spread evenly over the paychecks, the idea behind the IRS percentage method (Pub. 15-T). */
function check(gross,n,pre){pre=pre||0;const g=gross/n,taxable=Math.max(0,gross-pre-STD);
 const fed=r2(fedTax(taxable)/n),st=r2(CO*taxable/n),ss=r2(SS*Math.min(gross,SSCAP)/n),med=r2(MED*g),fam=r2(FAMLI*Math.min(gross,SSCAP)/n),k=r2(pre/n);
 const gr=r2(g),net=r2(gr-fed-st-ss-med-fam-k);return {gross:gr,fed,st,ss,med,fam,k,net,taxable,yearTax:fedTax(taxable)};}
const money=v=>(v<0?'−':'')+'$'+Math.abs(Math.round(v)).toLocaleString('en-US');
const money2=v=>(v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
window.FIN={STD,BR,SS,SSCAP,MED,CO,FAMLI,fedTax,slices,marginal,check,r2,money,money2,MINWAGE:15.16,DENVERWAGE:19.29};
})();
