// fractalMemory/memoryBlockManager.js

import crypto from 'crypto';
import { compress, decompress } from './memoryCompressor.js';
import { encryptData, decryptData } from './memoryEncryptor.js';
import { generateUserKey } from './utils/keyGen.js';
import { hashContent } from './utils/hashUtil.js';

// In-memory test store for blocks per user
const userMemoryBlocks = new Map();

/**
 * Create or update a memory block with new message
 * @param {string} userId - Unique user identifier
 * @param {object} message - { role: 'user' | 'ai', text: string, timestamp: number }
 * @param {string} [sessionId] - Optional: group messages into a specific session
 */
export function createOrUpdateBlock(userId, message, sessionId = null) {
  if (!userMemoryBlocks.has(userId)) {
    userMemoryBlocks.set(userId, []);
  }

  const userBlocks = userMemoryBlocks.get(userId);

  // Find the latest block by session ID or create new
  let targetBlock = userBlocks.find(b => b.sessionId === sessionId);

  if (!targetBlock) {
    // Create new block
    const newBlock = {
      blockId: hashContent(`${userId}-${Date.now()}`),
      sessionId: sessionId || generateUserKey(8),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      tags: [],
      checksum: '',
    };
    userBlocks.push(newBlock);
    targetBlock = newBlock;
  }

  // Add message to block
  targetBlock.messages.push({
    ...message,
    messageId: generateUserKey(6),
  });

  targetBlock.updatedAt = Date.now();

  // Update checksum for integrity
  const checksumSource = targetBlock.messages.map(m => m.text).join('|');
  targetBlock.checksum = hashContent(checksumSource);

  return targetBlock;
}

/**
 * Get all memory blocks for a user (for now, returns raw)
 * @param {string} userId
 */
export function getUserBlocks(userId) {
  return userMemoryBlocks.get(userId) || [];
}
