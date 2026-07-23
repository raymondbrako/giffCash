import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 10) {
    throw new Error('Password must contain at least 10 characters.');
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString('hex')}`;
}

export async function verifyPassword(password, storedHash) {
  const [algorithm, salt, keyHex] = String(storedHash).split('$');
  if (algorithm !== 'scrypt' || !salt || !keyHex) return false;

  const expected = Buffer.from(keyHex, 'hex');
  const actual = Buffer.from(await scrypt(password, salt, expected.length));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separator = item.indexOf('=');
        if (separator === -1) return [item, ''];
        return [item.slice(0, separator), decodeURIComponent(item.slice(separator + 1))];
      })
  );
}

export function sessionCookie(token, { secure = false, maxAgeSeconds = 0 } = {}) {
  const attributes = [
    `giffcash_session=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict'
  ];
  if (secure) attributes.push('Secure');
  if (maxAgeSeconds > 0) attributes.push(`Max-Age=${maxAgeSeconds}`);
  return attributes.join('; ');
}

export function clearSessionCookie({ secure = false } = {}) {
  return sessionCookie('', { secure, maxAgeSeconds: 0 }) + '; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
