import path from 'node:path';

function integerFromEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function loadConfig() {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const adminPassword = process.env.ADMIN_PASSWORD ?? (nodeEnv === 'production' ? '' : 'ChangeMe123!');

  if (nodeEnv === 'production' && !adminPassword) {
    throw new Error('ADMIN_PASSWORD is required in production.');
  }

  return {
    nodeEnv,
    host: process.env.HOST ?? '0.0.0.0',
    port: integerFromEnv('PORT', 3000),
    dataFile: path.resolve(process.env.DATA_FILE ?? './data/giffcash.json'),
    sessionTtlMs: integerFromEnv('SESSION_TTL_HOURS', 12) * 60 * 60 * 1000,
    cookieSecure: nodeEnv === 'production',
    adminPassword,
    seedDemoData: (process.env.SEED_DEMO_DATA ?? 'true').toLowerCase() !== 'false'
  };
}
