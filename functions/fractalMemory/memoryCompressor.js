// functions/fractalMemory/memoryCompressor.js

import { gzipSync, gunzipSync } from "zlib";
import memoryConfig from "./memoryConfig.js";
import lz from "lz-string";

const { encode, decode } = lz;

export function compress(content) {
  if (!memoryConfig.COMPRESSION.ENABLED) return content;
  const json = JSON.stringify(content);
  return gzipSync(encode(json));
}

export function decompress(buffer) {
  if (!memoryConfig.COMPRESSION.ENABLED) return buffer;
  const json = decode(gunzipSync(buffer).toString());
  return JSON.parse(json);
}
