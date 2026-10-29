// Runs only inside a disposable container. Never load this module into Express.
const fs = require("node:fs"),
  vm = require("node:vm");
const started = Date.now();
const {
  code,
  publicTests = [],
  hiddenTests = [],
} = JSON.parse(fs.readFileSync(0, "utf8"));
const totalCount = publicTests.length + hiddenTests.length;
const context = vm.createContext(Object.create(null), {
  codeGeneration: { strings: false, wasm: false },
  microtaskMode: "afterEvaluate",
});
const logs = [];
function run(source, timeout = 1500) {
  return new vm.Script(source).runInContext(context, { timeout });
}
const equal = require("node:util").isDeepStrictEqual;
function finish(result) {
  process.stdout.write(
    JSON.stringify({
      executionTimeMs: Date.now() - started,
      logs: logs.slice(0, 15),
      ...result,
    }),
  );
}
try {
  run(
    `const __dhStringify=JSON.stringify; const __dhKeys=Object.keys; const __dhFunctionNames=()=>{const names=__dhKeys(globalThis), functions=[];for(let i=0;i<names.length;i++){if(typeof globalThis[names[i]]==='function')functions[functions.length]=names[i]}return __dhStringify(functions)}; globalThis.__logs=[];globalThis.console={log(...args){if(__logs.length<15)__logs.push(args.map(x=>String(x).slice(0,1000)).join(' ').slice(0,2000))},error(...args){console.log(...args)}};`,
    500,
  );
  run(code, 2500);
  const names = run(
    `__dhFunctionNames()`,
  );
  const known = [
    "twoSum",
    "isValid",
    "maxSubArray",
    "reverseList",
    "search",
    "minStackDriver",
  ];
  const available = JSON.parse(names);
  const target = known.find((name) => available.includes(name)) || available[0];
  if (!target) throw Error("No solution function found in submission.");
  let passedCount = 0;
  const sampleResults = [];
  for (const [index, test] of [...publicTests, ...hiddenTests].entries()) {
    if (index === publicTests.length) {
      try {
        logs.push(...JSON.parse(run("__dhStringify(__logs)", 100)));
      } catch {}
    }
    try {
      const json = run(
        `__dhStringify(globalThis[${JSON.stringify(target)}](...${JSON.stringify(test.args)}))`,
      );
      const actual = json === undefined ? undefined : JSON.parse(json);
      const passed = equal(actual, test.expected);
      if (passed) passedCount++;
      if (index < publicTests.length)
        sampleResults.push({
          testIndex: index + 1,
          input: test.args,
          expected: test.expected,
          actual,
          passed,
        });
    } catch (error) {
      if (index < publicTests.length)
        sampleResults.push({
          testIndex: index + 1,
          input: test.args,
          expected: test.expected,
          error: String(error.message).slice(0, 300),
          passed: false,
        });
    }
  }
  if (!hiddenTests.length) {
    try {
      logs.push(...JSON.parse(run("__dhStringify(__logs)", 100)));
    } catch {}
  }
  finish({
    status: passedCount === totalCount ? "passed" : "failed",
    passed: passedCount === totalCount,
    passedCount,
    totalCount,
    sampleResults,
  });
} catch (error) {
  finish({
    status: "error",
    passed: false,
    passedCount: 0,
    totalCount,
    sampleResults: [],
    errorMessage: String(error.message).slice(0, 300),
  });
}
