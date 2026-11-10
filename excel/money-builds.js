/* excel/money-builds.js (Raider FinanceLab only): Build it projects that match Personal Finance (Flynn) spreadsheets and FinanceLab tools.
   Paycheck   = sims/paycheck.js   ($55,000 paid twice a month: gross $2,291.67, take-home $1,850.79; 2026 rules as in fin.js)
   Budget     = sims/firstmonth.js and Flynn's Alex Morgan budget tracker (planned vs. actual; take-home $3,701.58 a month)
   Brackets   = sims/brackets.js   ($65,000 salary: taxable $48,900, federal tax $5,620; a $3,000 raise adds $510)
   Investing  = Flynn's 40-year compounding sheet ($2,000 a year for years 1-4, $0 for years 5-8, $5,000 for years 9-40,
                added at the start of each year, at 5%, 8% and 10%: $447,742.10, $880,174.54, $1,421,882.37 from $168,000)
   Each step may carry ans (the formula or values a student would enter), used only by the automated test.
   The model answers are computed here in plain JavaScript, separately from the spreadsheet engine. */
(function () {
  'use strict';
  var R = window.RJSheet, XL = window.XL, money = XL.money, esc = XL.util.esc, near = XL.util.near;
  function r2(v) { return Math.round(v * 100) / 100; }
  function cash(v) { return money(r2(v)); }
  function pct(v, d) { return (Math.round(v * Math.pow(10, d + 2)) / Math.pow(10, d)).toFixed(d) + '%'; }
  function gutLine(g, real, unit) {
    var d = Math.abs(g - real);
    if (unit === '$') return d < 1 ? 'Your gut said ' + cash(g) + ': right on.' : 'Your gut said ' + cash(g) + ', ' + cash(d) + ' too ' + (g < real ? 'low' : 'high') + '.';
    if (unit === '%') return d < 0.5 ? 'Your gut said ' + g + '%: right on.' : 'Your gut said ' + g + '%, ' + (Math.round(d * 10) / 10) + ' points too ' + (g < real ? 'low' : 'high') + '.';
    return 'Your gut said ' + g + ' ' + unit + '.';
  }
  function openStep(name) {
    return { kind: 'card', say: 'Finish in real Excel: open the file you just downloaded. Need the steps? Here they are.', next: 'Done',
      render: function (box, ctx) { XL.openCard(box, { file: ctx.data.downloaded || name + '.xlsx' }); } };
  }
  function dlStep() { return { kind: 'download', say: 'Press <b>Download as Excel file</b>. Your formulas come with it.', ok: function (ctx) { return 'Downloaded <b>' + esc(ctx.data.downloaded || 'the file') + '</b>.'; } }; }
  var roundWrong = function (cell, f) { return { when: function (c) { return c.info.formula && !/ROUND/.test(c.f) && typeof c.value === 'number' && Math.abs(c.value - r2(c.value)) > 1e-9; }, msg: cell + ' shows more than two decimal places. Payroll rounds every line to the cent: wrap it in ROUND( , 2), like ' + f + '.' }; };

  /* ===================== Paycheck ===================== */
  var STD = 16100, BR = [[12400, 0.10], [50400, 0.12], [105700, 0.22], [201775, 0.24], [256225, 0.32], [640600, 0.35], [Infinity, 0.37]];
  function fedTax(T) { var t = 0, lo = 0; T = Math.max(0, T); for (var i = 0; i < BR.length; i++) { var hi = BR[i][0], r = BR[i][1]; if (T > lo) t += (Math.min(T, hi) - lo) * r; lo = hi; if (T <= hi) break; } return t; }
  /* the FinanceLab paycheck model (fin.js check()): every line rounded to the cent */
  function check(gross, n) {
    var g = gross / n, T = Math.max(0, gross - STD);
    var fed = r2(fedTax(T) / n), st = r2(0.044 * T / n), ss = r2(0.062 * Math.min(gross, 184500) / n), med = r2(0.0145 * g), fam = r2(0.0044 * Math.min(gross, 184500) / n);
    var out = r2(fed + st + ss + med + fam);
    return { gross: g, fed: fed, st: st, ss: ss, med: med, fam: fam, out: out, net: g - out };
  }
  XL.payModel = check;
  var FEDF = '=ROUND((MIN(MAX(B1-16100,0),12400)*0.1+MIN(MAX(B1-28500,0),38000)*0.12+MAX(B1-66500,0)*0.22)/B2,2)';
  var COF = '=ROUND(MAX(B1-16100,0)*0.044/B2,2)';
  function payInputs(s) {
    s.set('A1', 'Salary per year'); s.setValue('B1', 55000); s.format('B1', 'currency');
    s.set('A2', 'Paychecks per year'); s.setValue('B2', 24);
    s.set('A3', 'Gross pay per paycheck'); s.format('B3', 'currency'); s.bold('A3');
    ['Taken out', 'Rate', 'Per paycheck'].forEach(function (h, j) { s.set(R.A1(5, j + 1), h); }); s.bold('A5:C5');
    s.set('A6', 'Federal income tax'); s.set('A7', 'Colorado income tax'); s.set('C6', FEDF); s.set('C7', COF);
    s.set('A8', 'Social Security'); s.setValue('B8', 0.062); s.format('B8', { type: 'percent', dp: 1 });
    s.set('A9', 'Medicare'); s.setValue('B9', 0.0145); s.format('B9', { type: 'percent', dp: 2 });
    s.set('A10', 'Colorado FAMLI'); s.setValue('B10', 0.0044); s.format('B10', { type: 'percent', dp: 2 });
    s.set('A11', 'Total taken out'); s.set('A12', 'Take-home pay'); s.set('A13', 'Share you keep'); s.bold('A11:A13');
    s.format('C6:C12', 'currency'); s.format('C13', { type: 'percent', dp: 1 });
    s.lock('A1:A13'); s.lock('B1:B2'); s.lock('A5:C5'); s.lock('C6:C7'); s.lock('B8:B10');
  }
  function payIn(sh) { return check(sh.get('B1'), sh.get('B2')); }
  XL.addBuild({
    id: 'build-paycheck', title: 'Paycheck: gross to take-home', tool: 'from the FinanceLab tool “Where did my paycheck go?” and the Career Worksheet', filename: 'paycheck',
    blurb: 'A $55,000 first job, paid twice a month. Build the pay stub: every tax, then what you take home.',
    problem: 'Your first job offer says $55,000 a year, paid twice a month. Before you sign a lease, you need to know what lands in your bank account each payday.',
    levels: [
      { key: 'big', name: 'Big picture', hint: 'Build the pay stub one line at a time',
        problem: 'Your first job offer says $55,000 a year, paid twice a month (24 paychecks). What lands in your bank account each payday? Federal and Colorado income tax are filled in for you; build the rest of the stub.',
        sheet: { name: 'Paycheck', rows: 14, cols: 3, widths: { A: 170, B: 110, C: 120 }, start: 'A1', setup: payInputs },
        ui: { tools: ['undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b> No math yet.', label: 'Your gut: what percent of each paycheck do you take home?', suffix: '%', ans: 75,
            ok: function (ctx) { return 'Locked in: ' + ctx.data.gut + '%. Now build it.'; } },
          { kind: 'info', say: '<b>Your sheet.</b> B1 and B2 hold the job. C6 and C7 already hold the federal and Colorado income tax for one paycheck: they use the tax brackets (Build it: Tax brackets shows how). You build the rest.',
            callouts: [{ at: 'cell:C6', title: 'Filled in for you', text: 'Federal income tax for one paycheck, from the 2026 brackets.' }] },
          { kind: 'type', cell: 'B3', ans: '=B1/B2', say: 'One paycheck is the salary split over the paychecks. In <b>B3</b>, type <b>=B1/B2</b>.',
            expect: { value: 55000 / 24, tol: 0.005 },
            wrong: [{ when: function (c) { return near(c.value, 24 / 55000, 1e-6); }, msg: 'That divides 24 by the salary. Put the salary first: =B1/B2.' }],
            ok: 'B3 shows $2,291.67: your gross pay, before anything comes out.' },
          { kind: 'type', cell: 'C8', ans: '=ROUND(B3*B8,2)', say: 'Social Security is 6.2% of every dollar. In <b>C8</b>, type <b>=ROUND(B3*B8,2)</b>: gross pay times the rate, rounded to the cent.',
            expect: { value: 142.08, tol: 0.001 }, wrong: [roundWrong('C8', '=ROUND(B3*B8,2)')], ok: 'C8 shows $142.08.' },
          { kind: 'type', cell: 'C9', ans: '=ROUND(B3*B9,2)', say: 'Medicare, the same way: in <b>C9</b>, type <b>=ROUND(B3*B9,2)</b>.',
            expect: { value: 33.23, tol: 0.001 }, wrong: [roundWrong('C9', '=ROUND(B3*B9,2)'), { when: function (c) { return near(c.value, 142.08, 0.001); }, msg: 'That uses B8, the Social Security rate. Medicare is in B9.' }], ok: 'C9 shows $33.23.' },
          { kind: 'type', cell: 'C10', ans: '=ROUND(B3*B10,2)', say: 'Colorado’s paid family and medical leave program (FAMLI): in <b>C10</b>, type <b>=ROUND(B3*B10,2)</b>.',
            expect: { value: 10.08, tol: 0.001 }, wrong: [roundWrong('C10', '=ROUND(B3*B10,2)')], ok: 'C10 shows $10.08.' },
          { kind: 'type', cell: 'C11', ans: '=SUM(C6:C10)', say: 'Add up everything taken out: in <b>C11</b>, type <b>=SUM(C6:C10)</b>.',
            expect: { value: 440.88, tol: 0.005 }, wrong: [{ when: function (c) { return XL.util.pastRow(c.f, 'C', 10); }, msg: 'Your range runs past C10. Add only the five taxes: C6:C10.' }], ok: 'C11 shows $440.88 taken out.' },
          { kind: 'type', cell: 'C12', ans: '=B3-C11', say: 'Take-home pay is gross pay minus everything taken out. In <b>C12</b>, type <b>=B3-C11</b>.',
            expect: { value: 55000 / 24 - 440.88, tol: 0.006 },
            wrong: [{ when: function (c) { return near(c.value, 440.88 - 55000 / 24, 0.006); }, msg: 'The sign is flipped. Gross pay first: =B3-C11.' }], ok: 'C12 shows $1,850.79 lands in your account.' },
          { kind: 'type', cell: 'C13', ans: '=C12/B3', say: 'What share do you keep? In <b>C13</b>, type <b>=C12/B3</b>. The cell already shows a percent.',
            expect: { value: (55000 / 24 - 440.88) / (55000 / 24), tol: 1e-4 }, ok: 'C13 shows 80.8%.' },
          { kind: 'check', say: 'Press <b>Check my work</b>. It compares your stub with the FinanceLab paycheck model.',
            targets: function (ctx) { var m = payIn(ctx.sheet); return [{ cell: 'C8', value: m.ss, tol: 0.001 }, { cell: 'C9', value: m.med, tol: 0.001 }, { cell: 'C10', value: m.fam, tol: 0.001 }, { cell: 'C12', value: m.net, tol: 0.011 }]; },
            ok: function (ctx) { var m = check(55000, 24); return 'It checks out: you keep ' + cash(m.net) + ' of ' + cash(m.gross) + ', ' + pct(m.net / m.gross, 1) + '. ' + gutLine(ctx.data.gut, 100 * m.net / m.gross, '%'); } },
          { kind: 'watch', say: 'Watch: a better offer comes in, $65,000 a year.', changes: [{ cell: 'B1', from: 55000, to: 65000 }], show: ['C12', 'C13'], showLabel: 'Updated',
            done: function (ctx) { var m = check(65000, 24); return 'Every line updated: take-home is now ' + ctx.sheet.display('C12') + ' a paycheck (' + ctx.sheet.display('C13') + '). The model says ' + cash(m.net) + '.'; } },
          dlStep(), openStep('paycheck'),
          { kind: 'done', say: '<b>You built a pay stub.</b> Try Closer look: payroll and Colorado tax at every salary.',
            learned: ['Gross per paycheck = salary ÷ paychecks.', 'A percent tax: <b>=ROUND(pay*rate,2)</b>.', 'Take-home = gross − everything taken out.', 'Share kept = take-home ÷ gross.'] }
        ] },
      { key: 'closer', name: 'Closer look', hint: 'Fill two tax formulas down a salary table, with locked rates',
        problem: 'How do payroll taxes and Colorado income tax change with pay? Build a table for five salaries, from a part-time job to $100,000. Write each formula once, lock the rates with $, and fill it down.',
        sheet: { name: 'Taxes by salary', rows: 13, cols: 4, widths: { A: 170, B: 130, C: 130, D: 120 }, start: 'A1',
          setup: function (s) {
            s.set('A1', 'Social Security'); s.setValue('B1', 0.062); s.format('B1', { type: 'percent', dp: 1 });
            s.set('A2', 'Medicare'); s.setValue('B2', 0.0145); s.format('B2', { type: 'percent', dp: 2 });
            s.set('A3', 'Colorado FAMLI'); s.setValue('B3', 0.0044); s.format('B3', { type: 'percent', dp: 2 });
            s.set('A4', 'Standard deduction'); s.setValue('B4', 16100); s.format('B4', 'currency');
            s.set('A5', 'Colorado income tax'); s.setValue('B5', 0.044); s.format('B5', { type: 'percent', dp: 1 });
            ['Salary per year', 'Payroll taxes', 'Colorado tax', 'Both'].forEach(function (h, j) { s.set(R.A1(7, j + 1), h); }); s.bold('A7:D7');
            SAL.forEach(function (v, i) { s.setValue('A' + (8 + i), v); });
            s.format('A8:D12', 'currency'); s.lock('A1:B5'); s.lock('A7:D7'); s.lock('A8:A12');
          } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: on a $15,000 part-time job, how much Colorado income tax do you owe for the year?', prefix: '$', ans: 300,
            ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + '.'; } },
          { kind: 'type', cell: 'B8', ans: '=A8*($B$1+$B$2+$B$3)', say: 'Payroll taxes come out of every dollar. In <b>B8</b>, multiply the salary in A8 by the three rates added together. The rates stay put when you fill, so lock them: <b>=A8*($B$1+$B$2+$B$3)</b>.',
            expect: { value: 15000 * 0.0809, tol: 0.005, mustUse: ['B$1', 'B$2', 'B$3'] }, ok: 'B8 shows $1,213.50 for the year.' },
          { kind: 'fill', src: 'B8', range: 'B8:B12', allow: 'B8:B12', lockTyping: false, say: 'Fill it down: click <b>B8</b>, then press <b>Fill down</b>.',
            targets: function () { return [{ range: 'B8:B12', values: SAL.map(function (v) { return v * 0.0809; }), tol: 0.005, mustUse: ['B$1', 'B$2', 'B$3'] }]; },
            bad: function (res) { return XL.friendly(res) + ' Fix B8, then fill down again.'; }, ok: 'Payroll taxes for all five salaries.' },
          { kind: 'type', cell: 'C8', ans: '=MAX(0,A8-$B$4)*$B$5', say: 'Colorado taxes only the pay above the standard deduction. But below it, pay minus $16,100 is negative, and there is no negative tax. <b>MAX(0, …)</b> picks the bigger of 0 and the number. In <b>C8</b>, type <b>=MAX(0,A8-$B$4)*$B$5</b>.',
            expect: { value: 0, tol: 0.005, mustUse: ['B$4', 'B$5'] },
            wrong: [{ when: function (c) { return c.value < -0.005; }, msg: 'C8 shows a negative tax. Wrap the subtraction in MAX(0, …) so it never goes below 0: =MAX(0,A8-$B$4)*$B$5.' }],
            ok: function (ctx) { return 'C8 shows $0.00: $15,000 is below the $16,100 standard deduction, so no Colorado income tax. ' + gutLine(ctx.data.gut, 0, '$'); } },
          { kind: 'fill', src: 'C8', range: 'C8:C12', allow: 'C8:C12', lockTyping: false, say: 'Fill C8 down.',
            targets: function () { return [{ range: 'C8:C12', values: SAL.map(function (v) { return Math.max(0, v - 16100) * 0.044; }), tol: 0.005, mustUse: ['B$4', 'B$5'] }]; },
            bad: function (res) { return XL.friendly(res) + ' Fix C8, then fill down again.'; }, ok: 'Colorado tax for all five salaries.' },
          { kind: 'type', cell: 'D8', ans: '=B8+C8', say: 'In <b>D8</b>, add the two: <b>=B8+C8</b>.', expect: { value: 1213.5, tol: 0.005 }, ok: 'D8 shows $1,213.50.' },
          { kind: 'fill', src: 'D8', range: 'D8:D12', allow: 'D8:D12', lockTyping: false, say: 'Fill D8 down.',
            targets: function () { return [{ range: 'D8:D12', values: SAL.map(function (v) { return v * 0.0809 + Math.max(0, v - 16100) * 0.044; }), tol: 0.005 }]; }, ok: 'The table is done.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function () { return [{ range: 'B8:B12', values: SAL.map(function (v) { return v * 0.0809; }), tol: 0.005 }, { range: 'C8:C12', values: SAL.map(function (v) { return Math.max(0, v - 16100) * 0.044; }), tol: 0.005 }]; },
            ok: 'Every salary matches the FinanceLab model. Payroll tax is the same 8.09% at every salary; Colorado tax starts only above $16,100.' },
          { kind: 'choice', say: 'At $31,533 (full time at Colorado’s $15.16 minimum wage), which takes more: payroll taxes or Colorado income tax?',
            choices: [{ t: 'Payroll taxes', ok: true, why: 'Right: $2,551.02 of payroll taxes vs. $679.05 of Colorado income tax. For most workers early on, payroll tax is the bigger bite.' }, { t: 'Colorado income tax', why: 'Look at row 9: payroll taxes are $2,551.02 and Colorado tax $679.05.' }, { t: 'About the same', why: 'Look at row 9: $2,551.02 vs. $679.05.' }] },
          dlStep(), openStep('paycheck-closer'),
          { kind: 'done', say: '<b>You built a tax table.</b>',
            learned: ['Lock the rates with $ so every row uses them.', '<b>MAX(0, …)</b> keeps a result from going below zero.', 'Payroll tax is a flat share of pay; income tax starts above the standard deduction.'] }
        ] }
    ]
  });
  var SAL = [15000, 31533, 55000, 75000, 100000];

  /* ===================== Budget ===================== */
  var BUD = [['Groceries', 433, 468], ['Eating out', 130, 185], ['Rent', 1750, 1750], ['Utilities', 125, 142], ['Car payment', 350, 350], ['Car insurance', 150, 150], ['Gas', 188, 214], ['Phone and internet', 130, 130], ['Fun', 125, 96]];
  var TAKEHOME = 3701.58, LASTB = 1 + BUD.length;
  function budSetup(s, withDE, cols) {
    ['Category', 'Planned', 'Actual', 'Difference', 'Status', '% over or under'].slice(0, cols).forEach(function (h, j) { s.set(R.A1(1, j + 1), h); }); s.bold(R.rangeText ? 'A1:' + R.A1(1, cols) : 'A1:E1');
    BUD.forEach(function (b, i) { var r = i + 2; s.set('A' + r, b[0]); s.setValue('B' + r, b[1]); s.setValue('C' + r, b[2]); if (withDE) { s.set('D' + r, '=C' + r + '-B' + r); s.set('E' + r, '=IF(D' + r + '>0,"Over","OK")'); } });
    s.set('A11', 'Total spending'); s.set('B11', '=SUM(B2:B10)'); if (withDE) s.set('C11', '=SUM(C2:C10)');
    s.set('A12', 'Take-home pay'); s.setValue('B12', TAKEHOME); s.set('C12', '=B12');
    s.set('A13', 'Left over'); s.set('B13', '=B12-B11'); if (withDE) s.set('C13', '=C12-C11');
    s.bold('A11:A13'); s.format('B2:D13', 'currency'); if (cols > 5) s.format('F2:F10', { type: 'percent', dp: 1 });
    s.lock('A1:' + R.A1(1, cols)); s.lock('A2:C10'); s.lock('A11:B13'); s.lock('C12'); if (withDE) { s.lock('C11:C13'); s.lock('D2:E10'); }
  }
  function budVals(sh) { var d = [], st = [], pc = []; for (var r = 2; r <= LASTB; r++) { var p = sh.get('B' + r), a = sh.get('C' + r); d.push(a - p); st.push(a - p > 0 ? 'Over' : 'OK'); pc.push((a - p) / p); } return { d: d, st: st, pc: pc }; }
  var ACT = BUD.reduce(function (s, b) { return s + b[2]; }, 0);
  XL.addBuild({
    id: 'build-budget', title: 'Monthly budget: planned vs. actual', tool: 'from the FinanceLab tool “Your first month on your own” and the Alex Morgan budget tracker', filename: 'monthly-budget',
    blurb: 'Alex planned a month in Denver, then lived it. Build the tracker that shows where the plan went wrong.',
    problem: 'Alex takes home $3,701.58 a month from a $55,000 job in Denver. Alex planned the month’s spending, then wrote down what was really spent.',
    levels: [
      { key: 'big', name: 'Big picture', hint: 'Differences, IF, totals and what is left over',
        problem: 'Alex takes home $3,701.58 a month. The plan left $320.58 to save. Then Alex wrote down what was really spent. Build the tracker: how far off was each line, which ones went over, and what was really left?',
        sheet: { name: 'Budget tracker', rows: 14, cols: 5, widths: { A: 150, B: 100, C: 100, D: 104, E: 84 }, start: 'A1', setup: function (s) { budSetup(s, false, 5); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: the plan left $320.58. How much did Alex really have left at the end of the month?', prefix: '$', ans: 200,
            ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + '.'; } },
          { kind: 'info', say: '<b>Your sheet.</b> Column B is the plan, column C what Alex really spent. Row 13 shows the plan left $320.58. Columns D and E are yours.',
            callouts: [{ at: 'cell:D2', title: 'Your column', text: 'How far off each line was.' }] },
          { kind: 'type', cell: 'D2', ans: '=C2-B2', say: 'How far off was groceries? Actual minus planned, so spending more shows as a positive number. In <b>D2</b>, type <b>=C2-B2</b>.',
            expect: { value: 35, tol: 0.005 }, wrong: [{ when: function (c) { return near(c.value, -35); }, msg: 'D2 shows −$35.00. Put actual first, =C2-B2, so overspending shows as a positive number.' }],
            ok: 'D2 shows $35.00: groceries ran $35 over the plan.' },
          { kind: 'fill', src: 'D2', range: 'D2:D10', allow: 'D2:D10', lockTyping: false, say: 'Fill it down: click <b>D2</b>, then press <b>Fill down</b>.',
            targets: function (ctx) { return [{ range: 'D2:D10', values: budVals(ctx.sheet).d, tol: 0.005 }]; }, ok: 'Every line has its difference. Fun shows −$29.00: Alex spent less than planned there.' },
          { kind: 'type', cell: 'E2', ans: '=IF(D2>0,"Over","OK")', say: 'Let the sheet flag the problem lines. In <b>E2</b>, type <b>=IF(D2&gt;0,"Over","OK")</b>.',
            expect: { value: 'Over' }, wrong: [{ when: function (c) { return c.info.formula && !/"/.test(c.text) && !!(c.info.error || c.info.parseError); }, msg: 'Words inside a formula need double quotes: "Over" and "OK".' }],
            ok: 'E2 says Over.' },
          { kind: 'fill', src: 'E2', range: 'E2:E10', allow: 'E2:E10', lockTyping: false, say: 'Fill E2 down.',
            targets: function (ctx) { return [{ range: 'E2:E10', values: budVals(ctx.sheet).st }]; }, ok: 'Four lines went over: groceries, eating out, utilities and gas.' },
          { kind: 'type', cell: 'C11', ans: '=SUM(C2:C10)', say: 'What did Alex really spend in all? In <b>C11</b>, type <b>=SUM(C2:C10)</b>.',
            expect: { value: ACT, tol: 0.005 }, wrong: [{ when: function (c) { return XL.util.pastRow(c.f, 'C', 10); }, msg: 'Your range runs past C10. Spending is C2 to C10.' }], ok: 'C11 shows $3,485.00, $104 more than the plan.' },
          { kind: 'type', cell: 'C13', ans: '=C12-C11', say: 'What was really left? In <b>C13</b>, type <b>=C12-C11</b>.',
            expect: { value: TAKEHOME - ACT, tol: 0.005 }, ok: 'C13 shows $216.58 left, not the $320.58 Alex planned.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function (ctx) { var v = budVals(ctx.sheet); return [{ range: 'D2:D10', values: v.d, tol: 0.005 }, { range: 'E2:E10', values: v.st }, { cell: 'C13', value: TAKEHOME - ACT, tol: 0.005 }]; },
            ok: function (ctx) { return 'It checks out. Alex had ' + cash(TAKEHOME - ACT) + ' left. ' + gutLine(ctx.data.gut, TAKEHOME - ACT, '$'); } },
          { kind: 'watch', say: 'Watch: next month Alex eats out less, $120 instead of $185.', changes: [{ cell: 'C3', from: 185, to: 120 }], show: ['E3', 'C13'], showLabel: 'Updated',
            done: function (ctx) { return 'Eating out now says ' + ctx.sheet.display('E3') + ', and ' + ctx.sheet.display('C13') + ' is left over. One line, $65 more saved.'; } },
          dlStep(), openStep('monthly-budget'),
          { kind: 'done', say: '<b>You built a budget tracker.</b> Try Closer look: percents, the biggest miss and a count.',
            learned: ['Difference = actual − planned, so overspending is positive.', '<b>IF</b> flags each line Over or OK.', '<b>SUM</b> totals a column; left over = take-home − total.'] }
        ] },
      { key: 'closer', name: 'Closer look', hint: 'Percent over or under, MAX and COUNTIF',
        problem: 'Alex’s tracker is built. Now find which misses matter: each line as a percent of its plan, the biggest overspend, and how many lines went over.',
        sheet: { name: 'Budget tracker', rows: 17, cols: 6, widths: { A: 150, B: 100, C: 100, D: 104, E: 84, F: 128 }, start: 'A1',
          setup: function (s) { budSetup(s, true, 6); s.set('A15', 'Biggest overspend'); s.set('A16', 'Lines over budget'); s.bold('A15:A16'); s.format('B15', 'currency'); s.lock('A15:A16'); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: which line went over by the biggest percent of its plan? Type the number of the row (2 to 10).', suffix: 'row', ans: 3,
            ok: function (ctx) { return 'Locked in: row ' + ctx.data.gut + '.'; } },
          { kind: 'type', cell: 'F2', ans: '=D2/B2', say: 'A $35 miss on groceries and a $35 miss on rent are not the same. In <b>F2</b>, divide the difference by the plan: <b>=D2/B2</b>. F2 already shows a percent.',
            expect: { value: 35 / 433, tol: 1e-6 }, wrong: [{ when: function (c) { return near(c.value, 35 / 468, 1e-6); }, msg: 'That divides by the actual. Compare with the plan: =D2/B2.' }], ok: 'F2 shows 8.1%: groceries ran 8.1% over plan.' },
          { kind: 'fill', src: 'F2', range: 'F2:F10', allow: 'F2:F10', lockTyping: false, say: 'Fill F2 down.',
            targets: function (ctx) { return [{ range: 'F2:F10', values: budVals(ctx.sheet).pc, tol: 1e-6 }]; },
            ok: function (ctx) { return 'Eating out: 42.3% over. ' + (ctx.data.gut === 3 ? 'Your gut picked it.' : 'Your gut said row ' + ctx.data.gut + '; it was row 3.'); } },
          { kind: 'type', cell: 'B15', ans: '=MAX(D2:D10)', say: 'The biggest overspend in dollars: in <b>B15</b>, type <b>=MAX(D2:D10)</b>.', expect: { value: 55, tol: 0.005 }, ok: 'B15 shows $55.00, eating out.' },
          { kind: 'type', cell: 'B16', ans: '=COUNTIF(E2:E10,"Over")', say: 'How many lines went over? <b>COUNTIF</b> counts the cells that match: in <b>B16</b>, type <b>=COUNTIF(E2:E10,"Over")</b>.', expect: { value: 4 }, ok: 'B16 shows 4.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function (ctx) { return [{ range: 'F2:F10', values: budVals(ctx.sheet).pc, tol: 1e-6 }, { cell: 'B15', value: 55, tol: 0.005 }, { cell: 'B16', value: 4 }]; }, ok: 'It all checks out.' },
          { kind: 'watch', say: 'Watch: gas prices jump, and gas costs $260 instead of $214.', changes: [{ cell: 'C8', from: 214, to: 260 }], show: ['F8', 'B15', 'C13'], showLabel: 'Updated',
            done: function (ctx) { return 'Gas is now ' + ctx.sheet.display('F8') + ' over plan, the biggest overspend is ' + ctx.sheet.display('B15') + ', and only ' + ctx.sheet.display('C13') + ' is left.'; } },
          dlStep(), openStep('monthly-budget-closer'),
          { kind: 'done', say: '<b>You found the misses that matter.</b>',
            learned: ['Percent off = difference ÷ plan.', '<b>MAX</b> finds the biggest number in a range.', '<b>COUNTIF(range,"Over")</b> counts the matching cells.'] }
        ] }
    ]
  });

  /* ===================== Tax brackets ===================== */
  var BRK = [[0, 12400, 0.10], [12400, 50400, 0.12], [50400, 105700, 0.22], [105700, 201775, 0.24]];
  function brkSetup(s, withD) {
    s.set('A1', 'Salary'); s.setValue('B1', 65000); s.format('B1', 'currency');
    s.set('A2', 'Standard deduction'); s.setValue('B2', 16100); s.format('B2', 'currency');
    s.set('A3', 'Taxable income'); s.format('B3', 'currency'); s.bold('A3');
    ['From', 'To', 'Rate', 'Income in this bracket', 'Tax'].forEach(function (h, j) { s.set(R.A1(5, j + 1), h); }); s.bold('A5:E5');
    BRK.forEach(function (b, i) { var r = 6 + i; s.setValue('A' + r, b[0]); s.setValue('B' + r, b[1]); s.setValue('C' + r, b[2]); s.format('C' + r, { type: 'percent', dp: 0 }); if (withD) s.set('D' + r, '=MAX(0,MIN($B$3,B' + r + ')-A' + r + ')'); });
    s.set('A10', 'Federal income tax'); s.set('A11', 'Average rate'); s.bold('A10:A11');
    s.format('A6:B9', 'currency'); s.format('D6:E10', 'currency'); s.format('E11', { type: 'percent', dp: 2 });
    s.lock('A1:A3'); s.lock('B2'); s.lock('A5:E5'); s.lock('A6:C9'); s.lock('A10:A11'); if (withD) s.lock('D6:D9');
  }
  function brkVals(sh) { var T = sh.get('B1') - sh.get('B2'), d = BRK.map(function (b) { return Math.max(0, Math.min(T, b[1]) - b[0]); }); return { T: T, d: d, e: d.map(function (x, i) { return x * BRK[i][2]; }) }; }
  XL.addBuild({
    id: 'build-brackets', title: 'Tax brackets, one slice at a time', tool: 'from the FinanceLab tool “Can a raise cost me money?”', filename: 'tax-brackets',
    blurb: 'Tax a $65,000 salary through the 2026 brackets, slice by slice, then watch a raise go through.',
    problem: 'A single worker earns $65,000 in 2026. The federal brackets tax each slice of taxable income at its own rate.',
    levels: [
      { key: 'big', name: 'Big picture', hint: 'Taxable income, the tax on each slice, the total',
        problem: 'A single worker earns $65,000 in 2026. How much federal income tax is that, and what share of the salary? Column D, the income that lands in each bracket, is filled in for you.',
        sheet: { name: 'Tax brackets', rows: 12, cols: 5, widths: { A: 150, B: 110, C: 70, D: 170, E: 110 }, start: 'A1', setup: function (s) { brkSetup(s, true); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: how much federal income tax on $65,000?', prefix: '$', ans: 9000, ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + '.'; } },
          { kind: 'type', cell: 'B3', ans: '=B1-B2', say: 'The brackets tax only taxable income: salary minus the standard deduction. In <b>B3</b>, type <b>=B1-B2</b>.', expect: { value: 48900, tol: 0.005 },
            ok: 'B3 shows $48,900. Column D fills in: $12,400 in the 10% bracket and $36,500 in the 12% bracket. Nothing reaches 22%.' },
          { kind: 'type', cell: 'E6', ans: '=D6*C6', say: 'Each slice is taxed at its own rate. In <b>E6</b>, type <b>=D6*C6</b>.', expect: { value: 1240, tol: 0.005 }, ok: 'E6 shows $1,240.00.' },
          { kind: 'fill', src: 'E6', range: 'E6:E9', allow: 'E6:E9', lockTyping: false, say: 'Fill E6 down to E9.',
            targets: function (ctx) { return [{ range: 'E6:E9', values: brkVals(ctx.sheet).e, tol: 0.005 }]; }, ok: 'The 12% slice is $4,380.00. The 22% and 24% slices are $0.00.' },
          { kind: 'type', cell: 'E10', ans: '=SUM(E6:E9)', say: 'In <b>E10</b>, add the slices: <b>=SUM(E6:E9)</b>.', expect: { value: 5620, tol: 0.005 }, ok: 'E10 shows $5,620.00.' },
          { kind: 'type', cell: 'E11', ans: '=E10/B1', say: 'What share of the salary is that? In <b>E11</b>, type <b>=E10/B1</b>.', expect: { value: 5620 / 65000, tol: 1e-6 },
            wrong: [{ when: function (c) { return near(c.value, 5620 / 48900, 1e-6); }, msg: 'That divides by taxable income. The average rate on the salary divides by the salary, B1.' }], ok: 'E11 shows 8.65%, far below the 12% top bracket.' },
          { kind: 'check', say: 'Press <b>Check my work</b>. It compares with the FinanceLab bracket model.',
            targets: function (ctx) { var v = brkVals(ctx.sheet); return [{ cell: 'B3', value: v.T, tol: 0.005 }, { range: 'E6:E9', values: v.e, tol: 0.005 }, { cell: 'E10', value: fedTax(v.T), tol: 0.005 }]; },
            ok: function (ctx) { return 'It checks out: ' + cash(5620) + '. ' + gutLine(ctx.data.gut, 5620, '$'); } },
          { kind: 'watch', say: 'Watch: a $3,000 raise, to $68,000.', changes: [{ cell: 'B1', from: 65000, to: 68000 }], show: ['E8', 'E10'], showLabel: 'Updated',
            done: function (ctx) { return 'Now $1,500 lands in the 22% bracket. The tax is ' + ctx.sheet.display('E10') + ', just $510 more: only the raise dollars are taxed at the new rate.'; } },
          dlStep(), openStep('tax-brackets'),
          { kind: 'done', say: '<b>You taxed a salary slice by slice.</b> Try Closer look: write the bracket formula yourself.',
            learned: ['Taxable income = salary − standard deduction.', 'Tax on a slice = income in the bracket × rate.', 'Average rate = total tax ÷ salary.'] }
        ] },
      { key: 'closer', name: 'Closer look', hint: 'Write the slice formula with MIN, MAX and $',
        problem: 'Write the formula that decides how much income lands in each bracket, so the sheet works for any salary. Then test a $150,000 salary.',
        sheet: { name: 'Tax brackets', rows: 12, cols: 5, widths: { A: 150, B: 110, C: 70, D: 170, E: 110 }, start: 'A1',
          setup: function (s) { brkSetup(s, false); s.set('B3', '=B1-B2'); s.lock('B3'); for (var r = 6; r <= 9; r++) s.set('E' + r, '=D' + r + '*C' + r); s.set('E10', '=SUM(E6:E9)'); s.set('E11', '=E10/B1'); s.lock('E6:E11'); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: at $150,000, what share of the salary goes to federal income tax?', suffix: '%', ans: 20, ok: function (ctx) { return 'Locked in: ' + ctx.data.gut + '%.'; } },
          { kind: 'type', cell: 'D6', ans: '=MAX(0,MIN($B$3,B6)-A6)', say: 'Income in a bracket is the part of taxable income between its From and To. <b>MIN($B$3,B6)</b> stops at the top of the bracket; subtract the bottom, A6; and <b>MAX(0, …)</b> keeps it from going negative. Lock B3. In <b>D6</b>, type <b>=MAX(0,MIN($B$3,B6)-A6)</b>.',
            expect: { value: 12400, tol: 0.005, mustUse: ['B$3'] }, ok: 'D6 shows $12,400.00: the whole 10% bracket is full.' },
          { kind: 'fill', src: 'D6', range: 'D6:D9', allow: 'D6:D9', lockTyping: false, say: 'Fill D6 down to D9.',
            targets: function (ctx) { return [{ range: 'D6:D9', values: brkVals(ctx.sheet).d, tol: 0.005, mustUse: ['B$3'] }]; },
            bad: function (res, ctx) { var f = ctx.sheet.formula(res.cell) || ''; if (!/\$3/.test(f)) return res.cell + ' says ' + esc(f) + ': the taxable income reference moved off B3. Lock it with $B$3 in D6, then fill again.'; return XL.friendly(res) + ' Fix D6, then fill again.'; },
            ok: 'D6 to D9: $12,400, $36,500, $0, $0. The tax is $5,620.00 again.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.', targets: function (ctx) { return [{ range: 'D6:D9', values: brkVals(ctx.sheet).d, tol: 0.005 }, { cell: 'E10', value: fedTax(brkVals(ctx.sheet).T), tol: 0.005 }]; }, ok: 'It checks out.' },
          { kind: 'watch', say: 'Watch: try a $150,000 salary.', changes: [{ cell: 'B1', from: 65000, to: 150000 }], show: ['D9', 'E10', 'E11'], showLabel: 'Updated',
            done: function (ctx) { var t = fedTax(150000 - 16100); return 'Now all four brackets fill: the tax is ' + ctx.sheet.display('E10') + ', ' + ctx.sheet.display('E11') + ' of the salary, though the top bracket is 24%. ' + gutLine(ctx.data.gut, 100 * t / 150000, '%'); } },
          dlStep(), openStep('tax-brackets-closer'),
          { kind: 'done', say: '<b>Your bracket sheet works for any salary up to $217,875.</b>',
            learned: ['<b>MIN</b> caps a value at the top of the bracket.', '<b>MAX(0, …)</b> keeps an empty bracket at 0.', 'Lock the cell every row shares: $B$3.'] }
        ] }
    ]
  });

  /* ===================== 40 years of investing ===================== */
  var YEARS = 40, FY = 5, LY = FY + YEARS - 1, RATES = [0.05, 0.08, 0.10];
  function addAmt(y) { return y <= 4 ? 2000 : y <= 8 ? 0 : 5000; }
  function grow(rate) { var b = 0, out = []; for (var y = 1; y <= YEARS; y++) { b = (b + addAmt(y)) * (1 + rate); out.push(b); } return out; }
  var G5 = grow(0.05), G8 = grow(0.08), G10 = grow(0.10);
  XL.investModel = grow;
  function invSetup(s, cols) {
    s.set('A1', '40 years of investing'); s.bold('A1');
    s.set('A3', 'Return per year'); ['C', 'D', 'E'].slice(0, cols - 2).forEach(function (c, i) { s.setValue(c + '3', RATES[i]); s.format(c + '3', { type: 'percent', dp: 0 }); });
    ['Year', 'You add', 'Balance at 5%', 'Balance at 8%', 'Balance at 10%'].slice(0, cols).forEach(function (h, j) { s.set(R.A1(4, j + 1), h); }); s.bold('A4:' + R.A1(4, cols));
    for (var y = 1; y <= YEARS; y++) { var r = FY + y - 1; s.setValue('A' + r, y); s.setValue('B' + r, addAmt(y)); }
    s.set('A' + (LY + 2), 'Total you put in'); s.set('B' + (LY + 2), '=SUM(B' + FY + ':B' + LY + ')'); s.bold('A' + (LY + 2));
    s.format('B' + FY + ':' + R.colName(cols) + (LY + 2), 'currency');
    s.lock('A1:A3'); s.lock('A4:' + R.A1(4, cols)); s.lock('A' + FY + ':B' + LY); s.lock('A' + (LY + 2) + ':B' + (LY + 2)); s.lock('C3:' + R.A1(3, cols));
  }
  XL.addBuild({
    id: 'build-investing', title: '40 years of investing', tool: 'from the 40-year compounding spreadsheet and the FinanceLab tool “Start at 22 or 32?”', filename: 'forty-years',
    blurb: 'Save $2,000 a year for 4 years, pause for 4, then $5,000 a year for 32. Watch compounding at 5%, 8% and 10%.',
    problem: 'You invest $2,000 a year for years 1 to 4, nothing for years 5 to 8, then $5,000 a year for years 9 to 40. Each deposit goes in at the start of the year and grows with the account. In all, you put in $168,000.',
    levels: [
      { key: 'big', name: 'Big picture', hint: 'One missing formula; the rest of the 40 years follow',
        problem: 'You put in $168,000 over 40 years: $2,000 a year for 4 years, a 4-year pause, then $5,000 a year. At 5% a year, what is it worth at the end? Every year’s formula is here except year 2.',
        sheet: { name: '40 years', rows: LY + 2, cols: 3, widths: { A: 150, B: 110, C: 140 }, start: 'A1', maxHeight: '420px',
          setup: function (s) { invSetup(s, 3); s.set('C' + FY, '=B' + FY + '*(1+$C$3)'); for (var r = FY + 2; r <= LY; r++) s.set('C' + r, '=(C' + (r - 1) + '+B' + r + ')*(1+$C$3)'); s.lock('C' + FY + ':C' + LY); s.unlock('C' + (FY + 1)); } },
        ui: { tools: ['undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: after 40 years at 5%, what is the $168,000 you put in worth?', prefix: '$', ans: 300000, ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + '.'; } },
          { kind: 'info', say: '<b>Your sheet.</b> Each row is a year. Year 1: the $2,000 goes in and grows 5%, so C5 shows $2,100. Every year after works the same way, except year 2, in <b>C6</b>.',
            callouts: [{ at: 'cell:C6', title: 'The missing formula', text: 'Last year’s balance plus this year’s deposit, then grow it.' }] },
          { kind: 'type', cell: 'C6', ans: '=(C5+B6)*(1+C3)', say: 'Year 2: last year’s balance plus this year’s deposit, then grow it by 5%. In <b>C6</b>, type <b>=(C5+B6)*(1+C3)</b>.',
            expect: { value: 4305, tol: 0.005 },
            wrong: [{ when: function (c) { return near(c.value, 4205); }, msg: 'That grows last year’s balance but not the new $2,000. Put both inside the parentheses: =(C5+B6)*(1+C3).' }, { when: function (c) { return near(c.value, 2100 + 2000 * 0.05); }, msg: 'Add the deposit to the balance first, then multiply by (1+C3).' }],
            ok: 'C6 shows $4,305.00. Scroll down: all 40 years ran.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function () { return [{ cell: 'C6', value: 4305, tol: 0.005 }, { cell: 'C' + LY, value: G5[YEARS - 1], tol: 0.01, formula: false }]; },
            ok: function (ctx) { return 'It checks out. Year 40: ' + cash(G5[YEARS - 1]) + ' from ' + cash(168000) + ' put in. ' + gutLine(ctx.data.gut, G5[YEARS - 1], '$'); }, after: function (ctx) { ctx.ui.scrollTo('C' + LY); } },
          { kind: 'watch', say: 'Watch: the same deposits earn 8% a year instead of 5%.', changes: [{ cell: 'C3', from: 0.05, to: '8%' }], show: ['C' + LY], showLabel: 'Year 40',
            done: function () { return 'Year 40 is now ' + cash(G8[YEARS - 1]) + ', almost twice as much, from the same $168,000.'; } },
          dlStep(), openStep('forty-years'),
          { kind: 'done', say: '<b>You ran 40 years of compounding.</b> Try Closer look: build the whole column.',
            learned: ['Each year: (last balance + deposit) × (1 + rate).', 'The interest earns interest, so the growth speeds up.', '3 points of return nearly doubled the ending balance.'] }
        ] },
      { key: 'closer', name: 'Closer look', hint: 'Write year 2 with a locked rate, then fill 39 years',
        problem: 'Same plan, at 5%. The balance column is empty after year 1. Write year 2 with the rate locked, then fill it down to year 40.',
        sheet: { name: '40 years', rows: LY + 2, cols: 3, widths: { A: 150, B: 110, C: 140 }, start: 'A1', maxHeight: '420px',
          setup: function (s) { invSetup(s, 3); s.set('C' + FY, '=B' + FY + '*(1+$C$3)'); s.lock('C' + FY); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: of the year-40 balance at 5%, what percent is money you put in yourself?', suffix: '%', ans: 50, ok: function (ctx) { return 'Locked in: ' + ctx.data.gut + '%.'; } },
          { kind: 'type', cell: 'C6', ans: '=(C5+B6)*(1+$C$3)', say: 'In <b>C6</b>: last year’s balance plus this year’s deposit, grown by the rate. Every year uses the rate in C3, so lock it: <b>=(C5+B6)*(1+$C$3)</b>.',
            expect: { value: 4305, tol: 0.005, mustUse: ['C$3'] }, ok: 'C6 shows $4,305.00.' },
          { kind: 'fill', src: 'C6', range: 'C6:C' + LY, allow: 'C6:C' + LY, lockTyping: false, say: 'Fill it down to year 40: click <b>C6</b>, then press <b>Fill down</b>.',
            targets: function (ctx) { var r = ctx.sheet.get('C3'); return [{ range: 'C6:C' + LY, values: grow(r).slice(1), tol: 0.01, mustUse: ['C$3'] }]; },
            bad: function (res, ctx) { var f = ctx.sheet.formula(res.cell) || ''; if (!/\$3/.test(f)) return res.cell + ' says ' + esc(f) + ': the rate moved off C3. Lock it with $C$3 in C6, then fill again.'; return XL.friendly(res) + ' Fix C6, then fill again.'; },
            ok: 'All 40 years are filled.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.', targets: function () { return [{ range: 'C6:C' + LY, values: G5.slice(1), tol: 0.01 }]; },
            ok: function (ctx) { var own = 168000 / G5[YEARS - 1]; return 'It checks out: ' + cash(G5[YEARS - 1]) + '. Your own deposits are only ' + pct(own, 1) + ' of it; the rest is growth. ' + gutLine(ctx.data.gut, 100 * own, '%'); }, after: function (ctx) { ctx.ui.scrollTo('C' + LY); } },
          { kind: 'watch', say: 'Watch: what if you had kept saving $2,000 in years 5 to 8 instead of pausing?', changes: [{ cell: 'B9', from: 0, to: 2000 }, { cell: 'B10', from: 0, to: 2000 }, { cell: 'B11', from: 0, to: 2000 }, { cell: 'B12', from: 0, to: 2000 }], show: ['C' + LY], showLabel: 'Year 40',
            done: function (ctx) { return 'Year 40 is now ' + ctx.sheet.display('C' + LY) + '. $8,000 more in years 5 to 8 adds ' + cash(ctx.sheet.get('C' + LY) - G5[YEARS - 1]) + ' by year 40.'; } },
          dlStep(), openStep('forty-years-closer'),
          { kind: 'done', say: '<b>You built the whole 40 years.</b> Try Deep dive: three rates side by side.',
            learned: ['Lock the rate with $C$3; leave C5 and B6 free to move.', 'Early dollars grow the longest.'] }
        ] },
      { key: 'deep', name: 'Deep dive', hint: 'Mixed references: one pattern for three rates, then a chart',
        problem: 'Run the same plan at 5%, 8% and 10% side by side. One formula pattern works in every column if you lock the right parts: the rate’s row and the deposit’s column.',
        sheet: { name: '40 years', rows: LY + 2, cols: 5, widths: { A: 130, B: 100, C: 130, D: 130, E: 140 }, start: 'A1', maxHeight: '420px', setup: function (s) { invSetup(s, 5); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['chart', 'check'] },
        chartTypes: ['line', 'column'],
        chart: function (ctx, sel) { var g = R.parseRange(sel); if (g.c1 >= 3 && g.c2 <= 5 && g.c1 === g.c2 && g.r1 <= FY) { var c = R.colName(g.c1); return { type: 'line', x: 'A' + FY + ':A' + LY, y: c + FY + ':' + c + LY, title: 'Balance at ' + Math.round(RATES[g.c1 - 3] * 100) + '%, year by year', xLabel: 'Year', yLabel: 'Balance ($)' }; } return 'Click E4, the Balance at 10% heading, then press Insert chart.'; },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: at 10% instead of 5%, how many times bigger is the year-40 balance?', suffix: 'times', ans: 2, ok: function (ctx) { return 'Locked in: ' + ctx.data.gut + ' times.'; } },
          { kind: 'type', cell: 'C5', ans: '=$B5*(1+C$3)', say: 'Year 1 at 5%: the deposit times (1 + rate). Write it so it can work in every column: lock the deposit’s column (<b>$B5</b>) and the rate’s row (<b>C$3</b>). In <b>C5</b>, type <b>=$B5*(1+C$3)</b>.',
            expect: { value: 2100, tol: 0.005, mustUse: ['$B5', 'C$3'] }, ok: 'C5 shows $2,100.00.' },
          { kind: 'free', allow: 'D5:E5', glowRange: 'D5:E5', ans: { D5: '=$B5*(1+D$3)', E5: '=$B5*(1+E$3)' }, say: 'Same pattern for 8% and 10%: in <b>D5</b> type <b>=$B5*(1+D$3)</b> and in <b>E5</b> type <b>=$B5*(1+E$3)</b>. Only the rate’s column letter changes.',
            first: function (ctx) { return ctx.sheet.get('D5') === null ? 'D5' : ctx.sheet.get('E5') === null ? 'E5' : null; },
            test: function (ctx) { var d = ctx.sheet.get('D5'), e = ctx.sheet.get('E5'); if (d === null || e === null) return ''; if (!near(d, 2160) ) return 'D5 should show $2,160.00: =$B5*(1+D$3).'; if (!near(e, 2200)) return 'E5 should show $2,200.00: =$B5*(1+E$3).'; if (!ctx.sheet.formula('D5') || !ctx.sheet.formula('E5')) return 'Type formulas that start with =.'; return true; },
            ok: 'Year 1 at all three rates.' },
          { kind: 'type', cell: 'C6', ans: '=(C5+$B6)*(1+C$3)', say: 'Year 2 at 5%: last year’s balance in the same column, plus the deposit, grown by the rate. In <b>C6</b>, type <b>=(C5+$B6)*(1+C$3)</b>. C5 has no $: it should move to D5 and E5 in the other columns.',
            expect: { value: 4305, tol: 0.005, mustUse: ['$B6', 'C$3'] }, ok: 'C6 shows $4,305.00.' },
          { kind: 'free', allow: 'D6:E6', glowRange: 'D6:E6', ans: { D6: '=(D5+$B6)*(1+D$3)', E6: '=(E5+$B6)*(1+E$3)' }, say: 'The same in <b>D6</b> and <b>E6</b>: <b>=(D5+$B6)*(1+D$3)</b> and <b>=(E5+$B6)*(1+E$3)</b>.',
            first: function (ctx) { return ctx.sheet.get('D6') === null ? 'D6' : ctx.sheet.get('E6') === null ? 'E6' : null; },
            test: function (ctx) { var d = ctx.sheet.get('D6'), e = ctx.sheet.get('E6'); if (d === null || e === null) return ''; if (!near(d, 4492.8)) return 'D6 should show $4,492.80: =(D5+$B6)*(1+D$3).'; if (!near(e, 4620)) return 'E6 should show $4,620.00: =(E5+$B6)*(1+E$3).'; return true; },
            ok: 'Year 2 at all three rates.' },
          { kind: 'fill', src: 'C6:E6', range: 'C6:E' + LY, byColumn: true, allow: 'C5:E6', lockTyping: false, allowSelect: true,
            say: 'Fill all three down: select <b>C6</b> to <b>E6</b> (drag, or click C6 and Shift+click E6), then press <b>Fill down</b>. On a touch screen, fill them one at a time.',
            targets: function () { return [{ range: 'C6:C' + LY, values: G5.slice(1), tol: 0.01 }, { range: 'D6:D' + LY, values: G8.slice(1), tol: 0.01 }, { range: 'E6:E' + LY, values: G10.slice(1), tol: 0.01 }]; },
            bad: function (res) { return XL.friendly(res) + ' Fix row 6, then fill down again.'; }, ok: 'All 40 years at all three rates.' },
          { kind: 'chart', cell: 'E4', say: 'Chart the 10% column: click <b>E4</b>, then press <b>Insert chart</b>.', ok: 'The curve bends up: in the last years, the growth each year is bigger than your deposit.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function () { return [{ range: 'C5:C' + LY, values: G5, tol: 0.01 }, { range: 'D5:D' + LY, values: G8, tol: 0.01 }, { range: 'E5:E' + LY, values: G10, tol: 0.01 }]; },
            ok: function (ctx) { var x = G10[YEARS - 1] / G5[YEARS - 1]; return 'It checks out. Year 40: ' + cash(G5[YEARS - 1]) + ' at 5%, ' + cash(G8[YEARS - 1]) + ' at 8%, ' + cash(G10[YEARS - 1]) + ' at 10%: ' + x.toFixed(2) + ' times as much at 10% as at 5%. ' + (Math.abs(ctx.data.gut - x) < 0.3 ? 'Your gut was close.' : 'Your gut said ' + ctx.data.gut + ' times.'); }, after: function (ctx) { ctx.ui.scrollTo('E' + LY); } },
          { kind: 'choice', say: 'At 10%, about what share of the year-40 balance is money you put in yourself ($168,000)?',
            choices: [{ t: 'About 12%', ok: true, why: '$168,000 ÷ $1,421,882 ≈ 11.8%. The other 88% is growth: returns earning returns.' }, { t: 'About 50%', why: '$168,000 ÷ $1,421,882 ≈ 11.8%.' }, { t: 'About 88%', why: 'That is the growth part. Your deposits are $168,000 ÷ $1,421,882 ≈ 11.8%.' }] },
          dlStep(), openStep('forty-years-deep'),
          { kind: 'done', say: '<b>You built a three-rate model with mixed references.</b>',
            learned: ['<b>$B5</b> locks the column; <b>C$3</b> locks the row.', 'One pattern, typed per column, fills down 40 years.', 'Returns are never guaranteed: real years go up and down. See the FinanceLab drawdown tool.'] }
        ] }
    ]
  });
})();
