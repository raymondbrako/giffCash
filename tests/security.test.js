import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../src/security.js';

test('passwords are hashed and verified with scrypt', async () => {
  const hash = await hashPassword('A-secure-password-123');
  assert.match(hash, /^scrypt\$/);
  assert.equal(await verifyPassword('A-secure-password-123', hash), true);
  assert.equal(await verifyPassword('wrong-password', hash), false);
});

test('short passwords are rejected', async () => {
  await assert.rejects(() => hashPassword('short'), /at least 10/);
});
