// fractalMemory/testBlockManager.js

import { createOrUpdateBlock, getUserBlocks } from './memoryBlockManager.js';

const userId = 'test_user_001';

const messages = [
  {
    role: 'user',
    text: 'What is the capital of France?',
    timestamp: Date.now(),
  },
  {
    role: 'ai',
    text: 'The capital of France is Paris.',
    timestamp: Date.now(),
  },
  {
    role: 'user',
    text: 'Tell me a joke.',
    timestamp: Date.now(),
  },
];

// Add messages one by one to the same session
messages.forEach((msg, index) => {
  const block = createOrUpdateBlock(userId, msg);
  const lastMsg = block.messages[block.messages.length - 1];

  console.log(`\n💾 Message #${index + 1} added to block:`);
  console.log(`   🧾 Block ID: ${block.blockId}`);
  console.log(`   📦 Session ID: ${block.sessionId}`);
  console.log(`   🗣️  Role: ${lastMsg.role}`);
  console.log(`   💬 Text: ${lastMsg.text}`);
  console.log(`   🆔 Msg ID: ${lastMsg.messageId}`);
});

// Get all blocks and display
const blocks = getUserBlocks(userId);
console.log(`\n📚 All blocks for user '${userId}':`);

blocks.forEach((block, i) => {
  console.log(`\n🔲 Block #${i + 1}`);
  console.log(`   Block ID: ${block.blockId}`);
  console.log(`   Session ID: ${block.sessionId}`);
  console.log(`   Messages: ${block.messages.length}`);
  console.log(`   Checksum: ${block.checksum}`);
});
