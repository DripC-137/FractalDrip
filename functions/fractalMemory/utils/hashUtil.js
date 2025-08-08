// utils/hashUtil.js
import crypto from 'crypto';
import memoryConfig from '../memoryConfig.js';

export function hashContent(content) {
  return crypto
    .createHash(memoryConfig.HASH.TYPE)
    .update(typeof content === 'string' ? content : JSON.stringify(content))
    .digest('hex');
}
