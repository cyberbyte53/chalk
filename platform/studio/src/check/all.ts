import { spawn } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { findUp } from "../find-up";
import { lint } from "./lint";
import { checkLogFile } from "./shared";
import { stampedStep } from "./steps";
import { type TestReport, test } from "./test";
import { typecheck } from "./typecheck";

/**
 * `pnpm check`: everything that must hold before a commit, doing only the work a change calls for.
 * Type checks, tests, lint and the other steps skip what nothing they read has changed for
 * (typecheck.ts, test.ts, lint.ts, steps.ts); the content build reuses chapters whose files are
 * unchanged (content/build.ts). `pnpm check --force` ignores every cache and runs everything.
 */

const root = dirname(findUp("pnpm-workspace.yaml", process.cwd()));
const force = process.argv.includes("--force");
const studio = join(root, "platform", "studio");
const tsx = join(studio, "node_modules", ".bin", "tsx");
const tsconfig = ["--tsconfig", "../../tsconfig.base.json"];

function run(label: string, cmd: string, args: string[], cwd: string): Promise<boolean> {
  console.log(`\n▸ ${label}`);
  return new Promise((done) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit", env: process.env });
    child.on("close", (code) => done(code === 0));
    child.on("error", () => done(false));
  });
}

/** A tsx step that runs only when something it read changed (see steps.ts). */
const stamped = (name: string, args: string[]) => () => {
  console.log(`\n▸ ${name}`);
  return stampedStep(root, name, { cwd: studio, tsx: [tsx, ...tsconfig], args, force });
};

/** What the tests step ran, for the log. */
const tests: TestReport = { run: 0, unchanged: 0, files: [] };

const steps: [string, () => Promise<boolean>][] = [
  ["typecheck", () => typecheck(root, { force })],
  ["tests", () => test(root, { force, report: tests })],
  ["boundaries", stamped("boundaries", ["src/boundaries-cli.ts"])],
  ["purity", stamped("purity", ["src/purity-cli.ts"])],
  // Not stamped: it reads every source file, and is fast.
  [
    "suppressions",
    () => run("suppressions", tsx, [...tsconfig, "src/suppressions-cli.ts"], studio),
  ],
  ["catalogue", stamped("catalogue", ["src/catalogue-cli.ts", "--check"])],
  [
    "content",
    () =>
      run(
        "content",
        tsx,
        [
          ...tsconfig,
          "--import",
          "./src/content/record-imports.ts",
          "src/content/cli.ts",
          "build",
          ...(force ? ["--force"] : []),
        ],
        studio,
      ),
  ],
  // After the content build: a lesson's self-review reads its boards' records from it. Not stamped:
  // what it reports depends on git history, which a stamp doesn't see.
  ["pipeline", () => run("pipeline", tsx, [...tsconfig, "src/pipeline-cli.ts"], studio)],
  // After the content build, which records every board's pieces.
  ["threads", () => run("threads", tsx, [...tsconfig, "src/threads-cli.ts"], studio)],
  ["lint", () => lint(root, { force })],
];

/**
 * Every run, timed, so what makes a check slow is seen, not guessed: one short JSON line per run in
 * node_modules/.cache/chalk-checks.jsonl: its time, each step's, how many test files ran, and the
 * slowest of them. `pnpm tool-times` sums it up.
 */
function logRun(ms: number, steps: { name: string; ms: number }[], failed: string | null): void {
  try {
    const file = checkLogFile(root);
    mkdirSync(dirname(file), { recursive: true });
    const slowest = [...tests.files].sort((a, b) => b.ms - a.ms)[0];
    const line = {
      at: new Date(started).toISOString(),
      ms,
      ...(force ? { force } : {}),
      ...(failed === null ? {} : { failed }),
      steps: Object.fromEntries(steps.map((s) => [s.name, s.ms])),
      testsRun: tests.run,
      ...(slowest === undefined ? {} : { slowestTest: { file: slowest.file, ms: slowest.ms } }),
      ...(tests.files.some((f) => !f.ok)
        ? {
            failedTests: tests.files.filter((f) => !f.ok).map((f) => f.file),
            // Why: each failed test and its error's first line, so a failure seen once can be read later.
            failures: tests.files.flatMap((f) => (f.ok ? [] : (f.failures ?? []))),
          }
        : {}),
    };
    appendFileSync(file, `${JSON.stringify(line)}\n`);
  } catch {
    // A log that can't be written never fails a check.
  }
}

const started = Date.now();
const timed: { name: string; ms: number }[] = [];
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
const times = () => timed.map((t) => `${t.name} ${seconds(t.ms)}`).join(" · ");
for (const [name, step] of steps) {
  if (name === "typecheck" || name === "tests" || name === "lint") console.log(`\n▸ ${name}`);
  const at = Date.now();
  const ok = await step();
  timed.push({ name, ms: Date.now() - at });
  if (!ok) {
    logRun(Date.now() - started, timed, name);
    console.error(`\n✗ ${name} failed (${times()})`);
    process.exit(1);
  }
}
logRun(Date.now() - started, timed, null);
console.log(`\n✓ every check passed in ${seconds(Date.now() - started)}: ${times()}`);
