# Raider FinanceLab

Interactive personal finance tools for Regis Jesuit's Personal Finance course (MAT413), built so students do the math on the money decisions they will actually face: a first paycheck, a budget, taxes, saving, investing, credit and borrowing. It is part of the Raider Labs suite and runs on the same engine as Raider MathLab.

**Live site:** https://rjedtech.github.io/Raider-FinanceLab/

## What every tool has
- **The question:** a real money decision with real 2026 numbers.
- **Your gut first, then your turn:** students lock in a guess, work out one number themselves, then the math runs and shows the difference in dollars.
- **Your money runs on this:** where this exact idea shows up in their life.
- **Three levels of detail:** Big picture, Closer look and Deep dive.
- **Review questions** with worked answers, and **Embed in Canvas**.

## Browse
By topic (Earning and budgeting; Taxes; Saving and the time value of money; Investing; Credit and borrowing; Paying for college; Protecting what you have), or follow the **Personal Finance** course in the order of the 2026-27 syllabus (from the Canvas shells of Mr. Flynn and Mr. Reif, Nov 2026).

## Tools
New for FinanceLab: paycheck, brackets, firstmonth, inflation, savings, dca, peratio, drawdown, cardoffer, creditscore.
Shared with Raider MathLab (copies; change both): creditcard, startearly, carhouse, mortgageterm, debtfit, stickernet, onepercent, carquote, insurance, passwords. Their skills line is set in `courses.js` so it names the Personal Finance topic.

## Teach, don't preach
The tools show what the math says and leave the choice to the student. Nothing here is financial or tax advice; every model says what it simplifies, and every number has a source and a date in its "About this model".

## Files
`index.html` (page shell), `engine.js` (shared lab bench; do not edit here alone), `biolab.css` (styles), `fin.js` (2026 tax and payroll facts used by several tools), `courses.js` (sections, the course order and the shared tools' skills lines), `sims/*.js` (one per tool), `practical/*.js` (question, answer, uses), `review/*.js` (review questions). `build_index.py` lists the tool files in `index.html` with a fresh version number.

## Updating the numbers each year
`fin.js` holds the yearly figures: federal brackets and standard deduction (IRS Rev. Proc. each October), the Social Security wage base (SSA each October), Colorado's rate and FAMLI premium, and the minimum wages. The CPI in `sims/inflation.js` and the rates in `sims/savings.js` and `sims/cardoffer.js` should be refreshed too.

## License

© 2026 Jason Beyer, RJ Ed Tech. Licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/): free to share and adapt for non-commercial use with credit. See [LICENSE](LICENSE).
