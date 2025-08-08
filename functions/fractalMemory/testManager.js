import memoryManager from './memoryManager.js';

const testUID = 'demoUser_123';

const testFractal = `
I had an idea about integrating AI routing using topical classification 
into a visual time-drift interface. Possibly cluster tasks by intent + frequency.
`;

const testMeta = {
  topic: 'AI Memory Architecture',
  source: 'test-run',
  timestamp: Date.now(),
};

console.log('⏳ Saving test fractal...');

(async () => {
  try {
    const result = await memoryManager.storeMemoryBlock(
      testUID,
      testFractal,
      'fast',
      testMeta
    );

    console.log('✅ Memory saved successfully:');
    console.log(result);
  } catch (err) {
    console.error('❌ Error saving memory:', err);
  }
})();
