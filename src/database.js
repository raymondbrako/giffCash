import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { hashPassword } from './security.js';
import { calculateLoanTerms, LOAN_STATUS } from './loan-engine.js';

const now = () => new Date().toISOString();

function clone(value) {
  return structuredClone(value);
}

async function seedDatabase(config) {
  const createdAt = now();
  const passwordHash = await hashPassword(config.adminPassword);
  const institutionId = crypto.randomUUID();
  const headOfficeId = crypto.randomUUID();
  const accraBranchId = crypto.randomUUID();

  const users = [
    ['System Administrator', 'admin@giffcash.local', 'ADMIN'],
    ['Loan Officer', 'officer@giffcash.local', 'LOAN_OFFICER'],
    ['Credit Approver', 'approver@giffcash.local', 'APPROVER'],
    ['Cashier', 'cashier@giffcash.local', 'CASHIER']
  ].map(([name, email, role], index) => ({
    id: crypto.randomUUID(), institutionId,
    branchId: index === 0 ? headOfficeId : accraBranchId,
    name, email, role, active: true, passwordHash, createdAt, updatedAt: createdAt
  }));

  const data = {
    version: 1,
    institutions: [{ id: institutionId, name: 'GiffCash Microfinance', currency: 'GHS', createdAt }],
    branches: [
      { id: headOfficeId, institutionId, name: 'Head Office', code: 'HO', createdAt },
      { id: accraBranchId, institutionId, name: 'Accra Central', code: 'ACC', createdAt }
    ],
    users, customers: [], loans: [], payments: [], sessions: [], auditLogs: []
  };

  if (config.seedDemoData) {
    const customerA = {
      id: crypto.randomUUID(), institutionId, branchId: accraBranchId, customerNumber: 'CUS-000001',
      fullName: 'Ama Mensah', phone: '0240000001', email: 'ama@example.com', nationalId: 'GHA-000000001-1',
      occupation: 'Retail trader', monthlyIncomePesewas: 450000, status: 'ACTIVE', createdAt, updatedAt: createdAt
    };
    const customerB = {
      id: crypto.randomUUID(), institutionId, branchId: accraBranchId, customerNumber: 'CUS-000002',
      fullName: 'Kwame Boateng', phone: '0240000002', email: 'kwame@example.com', nationalId: 'GHA-000000002-2',
      occupation: 'Electrician', monthlyIncomePesewas: 620000, status: 'ACTIVE', createdAt, updatedAt: createdAt
    };
    data.customers.push(customerA, customerB);

    const terms = calculateLoanTerms(500000, 24, 6);
    data.loans.push({
      id: crypto.randomUUID(), institutionId, branchId: accraBranchId, applicationNumber: 'APP-000001',
      customerId: customerA.id, purpose: 'Working capital', status: LOAN_STATUS.SUBMITTED,
      annualRatePercent: 24, termMonths: 6, ...terms, totalPaidPesewas: 0,
      createdBy: users[1].id, submittedAt: createdAt, approvedAt: null, disbursedAt: null,
      createdAt, updatedAt: createdAt
    });
  }

  return data;
}

export class JsonDatabase {
  constructor(filePath, config) {
    this.filePath = filePath;
    this.config = config;
    this.data = null;
    this.queue = Promise.resolve();
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      this.data = JSON.parse(await fs.readFile(this.filePath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      this.data = await seedDatabase(this.config);
      await this.persist();
    }
  }

  read() {
    if (!this.data) throw new Error('Database has not been initialized.');
    return clone(this.data);
  }

  async update(mutator) {
    this.queue = this.queue.then(async () => {
      const draft = clone(this.data);
      const result = await mutator(draft);
      this.data = draft;
      await this.persist();
      return result;
    });
    return this.queue;
  }

  async persist() {
    const temporaryPath = `${this.filePath}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(this.data, null, 2), 'utf8');
    await fs.rename(temporaryPath, this.filePath);
  }
}
