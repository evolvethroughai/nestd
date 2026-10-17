import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateChitPlan, type ChitPlanInput } from '../src/components/ChitCalculator.tsx';

const base: ChitPlanInput = { pot: '500000', monthly: '10000', months: '50', liftAt: '', discount: '', fees: '', afterLift: '', credits: '' };

test('full-term equal contributions produce no invented return or break-even month', () => {
  const result = calculateChitPlan(base);
  assert.equal(result.received, 500000);
  assert.equal(result.totalPaid, 500000);
  assert.equal(result.remaining, 0);
  assert.equal(result.net, 0);
});

test('early lifting accounts for auction deduction, separate fees and future payments', () => {
  const result = calculateChitPlan({ ...base, liftAt: '15', discount: '50000', fees: '5000', afterLift: '11000', credits: '20000' });
  assert.equal(result.received, 445000);
  assert.equal(result.paidTillLift, 150000);
  assert.equal(result.remaining, 385000);
  assert.equal(result.totalPaid, 515000);
  assert.equal(result.net, -70000);
});

test('changing lift month does not invent profit when monthly payments are constant', () => {
  assert.equal(calculateChitPlan({ ...base, liftAt: '10', discount: '50000' }).net, calculateChitPlan({ ...base, liftAt: '30', discount: '50000' }).net);
});

test('Indian comma formatting is accepted', () => {
  assert.equal(calculateChitPlan({ ...base, pot: '5,00,000', monthly: '10,000' }).net, 0);
});

test('invalid and incomplete inputs produce useful validation errors', () => {
  for (const change of [{ pot: '' }, { monthly: '-1' }, { months: '1.5' }, { liftAt: '51' }, { discount: '600000' }, { credits: '600000' }, { fees: 'abc' }]) {
    assert.throws(() => calculateChitPlan({ ...base, ...change }));
  }
});

test('fixed instalments use the entered closing month and replace the final payment', () => {
  const result = calculateChitPlan({ ...base, monthly: '15000', months: '35', closingMonths: '30', finalPayment: '7500' }, 'final-adjustment');
  assert.equal(result.totalPaid, 442500);
  assert.equal(result.net, 57500);
  assert.equal(result.paidTillLift, 442500);
  assert.equal(result.remaining, 0);
});

test('early payout still owes fixed instalments and the adjusted final payment', () => {
  const result = calculateChitPlan({ ...base, monthly: '15000', months: '35', closingMonths: '30', finalPayment: '7500', liftAt: '10', discount: '80000', fees: '6000' }, 'final-adjustment');
  assert.equal(result.received, 414000);
  assert.equal(result.paidTillLift, 150000);
  assert.equal(result.remaining, 292500);
  assert.equal(result.net, -28500);
});

test('a zero final payment differs from an unspecified final payment', () => {
  assert.equal(calculateChitPlan({ ...base, finalPayment: '0' }, 'final-adjustment').totalPaid, 490000);
  assert.equal(calculateChitPlan(base, 'final-adjustment').totalPaid, 500000);
});

test('closing month, final amount and lift month are validated', () => {
  for (const change of [{ closingMonths: '51' }, { finalPayment: '-1' }, { closingMonths: '20', liftAt: '21' }]) {
    assert.throws(() => calculateChitPlan({ ...base, ...change }, 'final-adjustment'));
  }
});

test('monthly dividend mode can use every actual instalment instead of an average', () => {
  const result = calculateChitPlan({ ...base, pot: '45000', months: '3', monthly: '', liftAt: '1', paymentSchedule: '15000\n14000\n13000' });
  assert.equal(result.totalPaid, 42000);
  assert.equal(result.paidTillLift, 15000);
  assert.equal(result.remaining, 27000);
  assert.equal(result.net, 3000);
  assert.throws(() => calculateChitPlan({ ...base, paymentSchedule: '15000\n14000' }));
});

test('dividend ledger covers four full months and leaves a partial month without shortening the chit', () => {
  const result = calculateChitPlan({ ...base, monthly: '15150', months: '33', accumulatedDividends: '68600' }, 'final-adjustment');
  assert.equal(result.months, 33);
  assert.equal(result.lastCashMonth, 29);
  assert.equal(result.lastCashPayment, 7150);
  assert.equal(result.coveredMonths, 4);
  assert.equal(result.totalPaid, 431350);
  assert.equal(result.net, 68650);
});

test('an early auction winner has the same payment obligations with a lower payout', () => {
  const result = calculateChitPlan({ ...base, monthly: '15150', months: '33', liftAt: '15', discount: '90000', accumulatedDividends: '68600' }, 'final-adjustment');
  assert.equal(result.received, 410000);
  assert.equal(result.totalPaid, 431350);
  assert.equal(result.net, -21350);
  assert.equal(result.paidTillLift + result.remaining, result.totalPaid);
});

test('75000 credits do not cover five complete 15150 instalments', () => {
  const result = calculateChitPlan({ ...base, monthly: '15150', months: '33', accumulatedDividends: '75000' }, 'final-adjustment');
  assert.equal(result.lastCashMonth, 29);
  assert.equal(result.lastCashPayment, 750);
  assert.equal(result.coveredMonths, 4);
});

test('invalid dividend ledger balances are rejected', () => {
  for (const accumulatedDividends of ['-1', 'abc', '600000']) {
    assert.throws(() => calculateChitPlan({ ...base, accumulatedDividends }, 'final-adjustment'));
  }
});

test('decimal instalments settle to whole paise without residual payments', () => {
  const result = calculateChitPlan({ ...base, monthly: '15151.52', months: '33', accumulatedDividends: '68600' }, 'final-adjustment');
  assert.equal(result.totalPaid, 431400.16);
  assert.equal(result.net, 68599.84);
  assert.equal(result.lastCashPayment, 7157.6);
  assert.equal(result.coveredMonths, 4);
  const cashPaise = result.paymentPlan.reduce((sum, payment) => sum + Math.round(payment.cash * 100), 0);
  const ledgerPaise = result.paymentPlan.reduce((sum, payment) => sum + Math.round(payment.dividend * 100), 0);
  assert.equal(cashPaise, 43140016);
  assert.equal(ledgerPaise, 6860000);
});

test('blank schedule entries and duplicate ledger credits are rejected', () => {
  assert.throws(() => calculateChitPlan({ ...base, months: '3', paymentSchedule: '10000\n\n10000' }));
  assert.throws(() => calculateChitPlan({ ...base, credits: '1000', accumulatedDividends: '1000' }, 'final-adjustment'));
  assert.throws(() => calculateChitPlan({ ...base, months: '1000000000' }));
});

test('an actual early closing month retains dividend settlement and recalculates the full outcome', () => {
  const result = calculateChitPlan({ ...base, monthly: '15150', months: '33', closingMonths: '26', liftAt: '15', accumulatedDividends: '68600' }, 'final-adjustment');
  assert.equal(result.months, 26);
  assert.equal(result.totalPaid, 325300);
  assert.equal(result.lastCashMonth, 22);
  assert.equal(result.lastCashPayment, 7150);
  assert.equal(result.net, 174700);
});

test('an ongoing chit distinguishes payout month from the latest paid instalment', () => {
  const result = calculateChitPlan({ ...base, months: '33', liftAt: '15', paidThrough: '18' }, 'final-adjustment');
  assert.equal(result.paidTillLift, 150000);
  assert.equal(result.paidSoFar, 180000);
  assert.equal(result.futurePayments, 150000);
});

test('actual closing months also apply to variable instalment chits', () => {
  const result = calculateChitPlan({ ...base, months: '33', closingMonths: '25', liftAt: '15', paidThrough: '25' });
  assert.equal(result.totalPaid, 250000);
  assert.equal(result.futurePayments, 0);
  assert.equal(result.net, 250000);
});

test('invalid payment progress is rejected', () => {
  for (const paidThrough of ['-1', '51', '1.5', 'abc']) assert.throws(() => calculateChitPlan({ ...base, paidThrough }));
});

test('early-closure checkbox uses the actual last payment without deducting dividends twice', () => {
  const result = calculateChitPlan({ ...base, monthly: '15000', months: '35', endedEarly: 'yes', closingMonths: '26', finalPayment: '7500', accumulatedDividends: '68600', liftAt: '15' }, 'final-adjustment');
  assert.equal(result.totalPaid, 382500);
  assert.equal(result.net, 117500);
  assert.equal(result.paidThrough, 26);
  assert.equal(result.futurePayments, 0);
});

test('variable instalments also use the actual last payment on early closure', () => {
  const result = calculateChitPlan({ ...base, months: '33', endedEarly: 'yes', closingMonths: '26', finalPayment: '7500' });
  assert.equal(result.totalPaid, 257500);
});

test('checked early closure requires a shorter term and a final amount, including zero', () => {
  assert.throws(() => calculateChitPlan({ ...base, endedEarly: 'yes' }));
  assert.throws(() => calculateChitPlan({ ...base, endedEarly: 'yes', closingMonths: '50', finalPayment: '7500' }));
  assert.equal(calculateChitPlan({ ...base, endedEarly: 'yes', closingMonths: '26', finalPayment: '0' }, 'final-adjustment').totalPaid, 250000);
});

test('zero in optional month fields restores the original term and final payout month', () => {
  for (const mode of ['monthly-dividend', 'final-adjustment'] as const) {
    const result = calculateChitPlan({ ...base, liftAt: '0', closingMonths: '0' }, mode);
    assert.equal(result.months, 50);
    assert.equal(result.liftAt, 50);
    assert.equal(result.totalPaid, 500000);
  }
});

test('zero is not an actual early closing month', () => {
  assert.throws(() => calculateChitPlan({ ...base, endedEarly: 'yes', closingMonths: '0', finalPayment: '7500' }));
});
