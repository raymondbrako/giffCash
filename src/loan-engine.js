export const LOAN_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  DECLINED: 'DECLINED',
  DISBURSED: 'DISBURSED',
  ACTIVE: 'ACTIVE',
  CLOSED: 'CLOSED'
});

const TRANSITIONS = Object.freeze({
  [LOAN_STATUS.DRAFT]: [LOAN_STATUS.SUBMITTED],
  [LOAN_STATUS.SUBMITTED]: [LOAN_STATUS.APPROVED, LOAN_STATUS.DECLINED],
  [LOAN_STATUS.APPROVED]: [LOAN_STATUS.DISBURSED],
  [LOAN_STATUS.DISBURSED]: [LOAN_STATUS.ACTIVE, LOAN_STATUS.CLOSED],
  [LOAN_STATUS.ACTIVE]: [LOAN_STATUS.CLOSED],
  [LOAN_STATUS.DECLINED]: [],
  [LOAN_STATUS.CLOSED]: []
});

export function assertTransition(currentStatus, nextStatus) {
  const allowed = TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(`Cannot move loan from ${currentStatus} to ${nextStatus}.`);
  }
}

export function calculateLoanTerms(principalPesewas, annualRatePercent, termMonths) {
  const principal = Number(principalPesewas);
  const rate = Number(annualRatePercent);
  const months = Number(termMonths);

  if (!Number.isInteger(principal) || principal <= 0) throw new Error('Principal must be a positive integer.');
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) throw new Error('Annual rate must be between 0 and 100.');
  if (!Number.isInteger(months) || months < 1 || months > 120) throw new Error('Term must be between 1 and 120 months.');

  const interestPesewas = Math.round(principal * (rate / 100) * (months / 12));
  const totalDuePesewas = principal + interestPesewas;
  const installmentPesewas = Math.ceil(totalDuePesewas / months);

  return { principalPesewas: principal, interestPesewas, totalDuePesewas, installmentPesewas };
}

export function applyRepayment(loan, amountPesewas) {
  const amount = Number(amountPesewas);
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('Repayment amount must be a positive integer.');
  if (![LOAN_STATUS.DISBURSED, LOAN_STATUS.ACTIVE].includes(loan.status)) {
    throw new Error('Only disbursed or active loans can receive repayments.');
  }

  const outstanding = Math.max(0, loan.totalDuePesewas - loan.totalPaidPesewas);
  if (amount > outstanding) throw new Error('Repayment cannot exceed the outstanding balance.');

  const totalPaidPesewas = loan.totalPaidPesewas + amount;
  const outstandingPesewas = loan.totalDuePesewas - totalPaidPesewas;
  const status = outstandingPesewas === 0 ? LOAN_STATUS.CLOSED : LOAN_STATUS.ACTIVE;

  return { totalPaidPesewas, outstandingPesewas, status };
}
