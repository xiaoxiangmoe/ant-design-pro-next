import * as crypto from 'crypto';

export const hmacSha256 = (data: string, key: string) =>
  crypto
    .createHmac('sha256', key)
    .update(data)
    .digest('base64');
