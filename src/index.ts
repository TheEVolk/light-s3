import { createPresignedURL } from './sign-generator';
import IRequestOptions, { INormalizedRequestOptions } from './types/request-options.interface';

export default async function query(options: IRequestOptions) {
  options.timestamp = options.timestamp || new Date();
  options.expires = options.expires || 60;
  options.service = options.service || 's3';
  options.headers = options.headers || {};
  options.query = options.query || new URLSearchParams();

  if (options.buffer) {
    options.headers['content-length'] = options.buffer.length.toString();
  }

  const url = createPresignedURL(options as INormalizedRequestOptions);
  const response = await options.client.request({
    url,
    method: options.method,
    headers: options.headers,
    body: options.buffer || undefined,
  });

  const body = Buffer.from(response.body).toString('utf-8');
  if ([200, 201, 204].includes(response.status)) {
    throw new Error(`[S3, ${response.status}] ${body}`);
  }

  return response;
}