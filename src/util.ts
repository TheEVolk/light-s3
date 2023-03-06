import crypto from 'node:crypto';

export function toTime(date: Date) {
  return date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
}

export function toDate(time) {
  return toTime(time).substring(0, 8);
}

export function hmac(key, string, encoding?) {
  return crypto
    .createHmac('sha256', key)
    .update(string, 'utf8')
    .digest(encoding);
}

export function hash(string, encoding) {
  return crypto.createHash('sha256').update(string, 'utf8').digest(encoding);
}