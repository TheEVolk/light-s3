
import { INormalizedRequestOptions } from './types/request-options.interface';
import { hash, hmac, toDate, toTime } from './util';

export function createAuthorizationHeader(key, scope, signedHeaders, signature) {
  return [
    'AWS4-HMAC-SHA256 Credential=' + key + '/' + scope,
    'SignedHeaders=' + signedHeaders,
    'Signature=' + signature,
  ].join(', ');
}

export function createCredentialScope(timestamp: Date, region: string, service: string = 's3') {
  return [toDate(timestamp), region, service, 'aws4_request'].join('/');
}

export function createCanonicalQueryString(params: URLSearchParams) {
  return [...params.keys()]
    .sort()
    .map((key) => {
      const values = params.getAll(key);
      return values
        .sort()
        .map((val) => encodeURIComponent(key) + '=' + encodeURIComponent(val))
        .join('&');
    })
    .join('&');
}

export function createCanonicalHeaders(headers: Record<string, string | string[]>) {
  return Object.keys(headers)
    .sort()
    .map((name) => {
      const value = headers[name];
      const values = Array.isArray(value) ? value : [value];

      const body = values
        .map((v) => v.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, ''))
        .join(',');

      return `${name.toLowerCase().trim()}:${body}\n`;
    })
    .join('');
}

export function createSignedHeaders(headers: Record<string, string | string[]>) {
  return Object.keys(headers)
    .sort()
    .map((name) => name.toLowerCase().trim())
    .join(';');
}

export function createCanonicalPayload(payload: string) {
  if (payload === 'UNSIGNED-PAYLOAD') {
    return payload;
  }

  return hash(payload || '', 'hex');
}

export function createCanonicalRequest(options: INormalizedRequestOptions, payload: string = 'UNSIGNED-PAYLOAD') {
  return [
    options.method.toUpperCase(),
    options.key,
    createCanonicalQueryString(options.query),
    createCanonicalHeaders(options.headers),
    createSignedHeaders(options.headers),
    createCanonicalPayload(payload),
  ].join('\n');
}

export function createStringToSign(options: INormalizedRequestOptions, canonicalRequest: string) {
  return [
    'AWS4-HMAC-SHA256',
    toTime(options.timestamp),
    createCredentialScope(options.timestamp, options.client.region, options.client.service),
    hash(canonicalRequest, 'hex'),
  ].join('\n');
}

export function createSignature(options: INormalizedRequestOptions, stringToSign: string) {
  const h1 = hmac('AWS4' + options.client.secret, toDate(options.timestamp)); // date-key
  const h2 = hmac(h1, options.client.region); // region-key
  const h3 = hmac(h2, options.client.service); // service-key
  const h4 = hmac(h3, 'aws4_request'); // signing-key
  return hmac(h4, stringToSign, 'hex');
}

export function createPresignedURL(options: INormalizedRequestOptions) {
  options.headers['host'] = new URL(options.client.base).host;

  const credentialScope = createCredentialScope(options.timestamp, options.client.region, options.client.service);
  options.query.set('X-Amz-Credential', `${options.client.keyId}/${credentialScope}`);
  options.query.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
  options.query.set('X-Amz-Date', toTime(options.timestamp));
  options.query.set('X-Amz-Expires', options.expires.toString());
  options.query.set('X-Amz-SignedHeaders', createSignedHeaders(options.headers));

  const canonicalRequest = createCanonicalRequest(options);
  const stringToSign = createStringToSign(
    options,
    canonicalRequest,
  );

  const signature = createSignature(
    options,
    stringToSign,
  );

  options.query.set('X-Amz-Signature', signature);

  return `${options.client.base}${options.key}?${options.query.toString()}`;
}