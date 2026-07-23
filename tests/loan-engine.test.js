import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRepayment, assertTransition, calculateLoanTerms, LOAN_STATUS } from '../src/loan-engine.js';

test('flat-rate loan terms are calculated in pesewas', () => {
  assert.deepEqual(calculateLoanTerms(500000, 24, 6), {
    principalPesewas: 500000,
    interestPesewas: 60000,
    totalDuePesewas: 560000,
    installmentPesewas: 93334
  });
});

test('workflow rejects invalid transitions', () => {
  assert.doesNotThrow(() => assertTransition(LOAN_STATUS.DRAFT, LOAN_STATUS.SUBMITTED));
  assert.throws(() => assertTransition(LOAN_STATUS.DRAFT, LOAN_STATUS.DISBURSED), /Cannot move loan/);
});

test('repayment closes a fully paid loan', () => {
  const result = applyRepayment({ status: LOAN_STATUS.ACTIVE, totalDuePesewas: 100000, totalPaidPesewas: 75000 }, 25000);
  assert.deepEqual(result, { totalPaidPesewas: 100000, outstandingPesewas: 0, status: LOAN_STATUS.CLOSED });
});
