import { query } from '../lib/index.mjs';

const client = {
  base: process.env.S3_HOST,
  region: process.env.S3_REGION,
  secret: process.env.S3_SECRET,
  keyId: process.env.S3_KEY_ID,
  service: 's3',
  request: async (req) => {
    const options = {
      method: req.method,
      headers: req.headers,
    };

    if (req.body) {
      options.body = req.body;
    }

    const response = await fetch(req.url, options);

    return {
      status: response.status,
      body: await response.arrayBuffer()
    };
  }
};

query({
  client,
  method: 'PUT',
  key: '/file.txt',
  buffer: Buffer.from([1, 2, 3])
});