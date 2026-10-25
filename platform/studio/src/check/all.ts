import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { findUp } from "../pronunciations";
import { lint } from "./lint";
import { stampedStep } from "./steps";
import { test } from "./test";
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

const steps: [string, () => Promise<boolean>][] = [
  ["typecheck", () => typecheck(root, { force })],
  ["tests", () => test(root, { force })],
  ["old lessons", stamped("old lessons", ["src/cli.ts", "../../content"])],
  ["boundaries", stamped("boundaries", ["src/boundaries-cli.ts"])],
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
  ["lint", () => lint(root, { force })],
];

const started = Date.now();
const times: string[] = [];
const seconds = (since: number) => `${((Date.now() - since) / 1000).toFixed(1)}s`;
for (const [name, step] of steps) {
  if (name === "typecheck" || name === "tests" || name === "lint") console.log(`\n▸ ${name}`);
  const at = Date.now();
  const ok = await step();
  times.push(`${name} ${seconds(at)}`);
  if (!ok) {
    console.error(`\n✗ ${name} failed (${times.join(" · ")})`);
    process.exit(1);
  }
}
console.log(`\n✓ every check passed in ${seconds(started)}: ${times.join(" · ")}`);
