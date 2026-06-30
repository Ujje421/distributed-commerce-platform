import * as crypto from 'crypto';

/**
 * Hashes a string using SHA-256.
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generates a secure random token.
 */
export function generateSecureToken(length: number = 48): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a short random ID suitable for tracking numbers, API keys, etc.
 */
export function generateShortId(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}
