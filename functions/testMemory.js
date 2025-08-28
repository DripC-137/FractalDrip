import memoryStorage from "./fractalMemory/memoryStorage.js";

async function test() {
  try {
    const result = await memoryStorage.storeMemoryBlock(
      "test-user-123",
      "Sample memory content for testing encryption and storage.",
      "fast",
      { testMeta: true }
    );
    console.log("Memory stored successfully:", result);
  } catch (err) {
    console.error("Memory storage test failed:", err);
  }
}

test();
