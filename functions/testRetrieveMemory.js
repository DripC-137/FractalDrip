// functions/testRetrieveMemory.js
import memoryStorage from "./fractalMemory/memoryStorage.js";

async function runTest() {
  const uid = "test-user-123";

  try {
    console.log("1) Storing a fast memory block...");
    const fastResult = await memoryStorage.storeMemoryBlock(
      uid,
      `Fast memory at ${new Date().toISOString()}`,
      "fast",
      { testMeta: true }
    );
    console.log(" Fast store result:", fastResult);

    console.log("2) Storing an archive memory block...");
    const archiveResult = await memoryStorage.storeMemoryBlock(
      uid,
      `Archive memory at ${new Date().toISOString()}`,
      "archive",
      { testMeta: true }
    );
    console.log(" Archive store result:", archiveResult);

    console.log("3) Retrieving latest fast memory...");
    const fastRetrieved = await memoryStorage.retrieveMemoryBlock(uid, "fast");
    console.log(" Fast retrieved:", fastRetrieved);

    console.log("4) Retrieving latest archive memory...");
    const archiveRetrieved = await memoryStorage.retrieveMemoryBlock(uid, "archive");
    console.log(" Archive retrieved:", archiveRetrieved);

    console.log("5) Debug counts:");
    const counts = await memoryStorage.debugDumpUserMemory(uid);
    console.log(" Counts:", counts);

    console.log("✅ Test finished.");
  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

runTest();
