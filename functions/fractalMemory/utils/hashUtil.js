// functions/utils/hashUtil.js

import crypto from "crypto";
import memoryConfig from "../memoryConfig.js";

/**
 * Hash string or JSON content using configured hash type (e.g., SHA3-512)
 * @param {string|object} content
 * @returns {string} hex hash
 */
export function hashContent(content) {
  return crypto
    .createHash(memoryConfig.HASH.TYPE)
    .update(typeof content === "string" ? content : JSON.stringify(content))
    .digest("hex");
}
