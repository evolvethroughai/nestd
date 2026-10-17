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
