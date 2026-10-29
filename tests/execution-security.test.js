const test = require("node:test"),
  assert = require("node:assert/strict");
const { executeCode, IMAGE } = require("../server/execution");
test("runner image is immutable and uses a digest", () =>
  assert.match(IMAGE, /^node@sha256:[a-f0-9]{64}$/));
test("user code cannot access the web-server environment or host callbacks", async () => {
  process.env.SECURITY_SENTINEL = "private-test-sentinel-value";
  const result = await executeCode(
    `function twoSum(){try{return console.log.constructor('return process')().env.SECURITY_SENTINEL}catch{return 'blocked'}}`,
    [{ args: [], expected: "blocked" }],
  );
  assert.equal(result.passed, true);
  delete process.env.SECURITY_SENTINEL;
});
test("hidden test arguments and logs are not returned", async () => {
  const result = await executeCode(
    "function twoSum(value){console.log(value);return value}",
    [{ args: ["public-value"], expected: "public-value" }],
    [{ args: ["private-hidden-value"], expected: "private-hidden-value" }],
  );
  assert.equal(result.passed, true);
  assert.equal(JSON.stringify(result).includes("private-hidden-value"), false);
});
test("oversized output and memory exhaustion fail inside container limits", async () => {
  await assert.rejects(
    executeCode('function twoSum(){return "x".repeat(200000)}', [
      { args: [], expected: 0 },
    ]),
    (error) => error.status === 503,
  );
  const memoryOutcome = await executeCode(
    "function twoSum(){const values=[];while(true)values.push(new Array(100000).fill(1));}",
    [{ args: [], expected: 0 }],
  ).then(
    (result) => ({ result }),
    (error) => ({ error }),
  );
  if (memoryOutcome.error) assert.equal(memoryOutcome.error.status, 503);
  else {
    assert.equal(memoryOutcome.result.passed, false);
    assert.match(memoryOutcome.result.sampleResults[0].error, /timed out/);
  }
});
test("unavailable Docker fails closed instead of using a local VM", async () => {
  const original = process.env.PATH;
  process.env.PATH = "";
  try {
    await assert.rejects(
      executeCode("function twoSum(){return 1}", [{ args: [], expected: 1 }]),
      (error) => error.status === 503,
    );
  } finally {
    process.env.PATH = original;
  }
});

test("submissions cannot forge evaluation results by replacing JSON serialization", async () => {
  const result = await executeCode(
    `JSON.stringify=()=> '[0,1]';function twoSum(){return [999,999]}`,
    [{ args: [[2, 7], 9], expected: [0, 1] }],
  );
  assert.equal(result.passed, false);
  assert.equal(result.status, "failed");
});
