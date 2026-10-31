// Untrusted code never runs in the web-server process. Docker must be available;
// otherwise execution fails closed, with no VM/process fallback.
const { spawn, execFile } = require("node:child_process");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { randomUUID } = require("node:crypto");
const IMAGE =
  "node@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53";
let running = 0;
function unavailable(
  message = "The isolated execution service is unavailable. Please try again later.",
) {
  const error = new Error(message);
  error.status = 503;
  return error;
}
function executeCode(
  code,
  publicTests = [],
  hiddenTests = [],
  challengeSlug = "",
) {
  if (
    typeof code !== "string" ||
    Buffer.byteLength(code) > 16384 ||
    publicTests.length + hiddenTests.length > 24
  )
    return Promise.reject(
      Object.assign(new Error("Submission is too large."), { status: 400 }),
    );
  if (running >= 2)
    return Promise.reject(
      unavailable("Execution capacity is busy. Please retry shortly."),
    );
  running++;
  return new Promise((resolve, reject) => {
    const name = "devharbour-judge-" + randomUUID();
    const worker = readFileSync(join(__dirname, "execution-worker.js"), "utf8");
    const args = [
      "run",
      "--rm",
      "-i",
      "--pull=never",
      "--name",
      name,
      "--network=none",
      "--read-only",
      "--cap-drop=ALL",
      "--security-opt=no-new-privileges",
      "--pids-limit=32",
      "--memory=128m",
      "--memory-swap=128m",
      "--cpus=0.5",
      "--user=65534:65534",
      "--log-driver=none",
      IMAGE,
      "node",
      "--max-old-space-size=64",
      "--disable-proto=throw",
      "-e",
      worker,
    ];
    const child = spawn("docker", args, {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
      env: { ...process.env, NODE_OPTIONS: "" },
    });
    let output = "",
      finished = false;
    const cleanup = () =>
      execFile(
        "docker",
        ["rm", "-f", name],
        { windowsHide: true, timeout: 5000 },
        () => {},
      );
    const finish = (error, result) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      running--;
      if (error) {
        child.kill();
        cleanup();
        reject(error);
      } else resolve(result);
    };
    const timer = setTimeout(
      () =>
        finish(
          unavailable("Code execution exceeded its time or resource limit."),
        ),
      12000,
    );
    child.on("error", () => finish(unavailable()));
    child.stdin.on("error", () => {});
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (Buffer.byteLength(output) > 131072)
        finish(unavailable("Code produced too much output."));
    });
    // Never return Docker diagnostics, which could disclose host paths.
    child.stderr.resume();
    child.on("close", (exit) => {
      if (finished) return;
      if (exit !== 0) return finish(unavailable());
      try {
        const result = JSON.parse(output);
        if (
          !["passed", "failed", "error"].includes(result.status) ||
          typeof result.passed !== "boolean"
        )
          throw Error();
        finish(null, result);
      } catch {
        finish(unavailable());
      }
    });
    child.stdin.end(
      JSON.stringify({ code, publicTests, hiddenTests, challengeSlug }),
    );
  });
}
function deepEqual(a, b) {
  return require("node:util").isDeepStrictEqual(a, b);
}
module.exports = { executeCode, deepEqual, IMAGE };
