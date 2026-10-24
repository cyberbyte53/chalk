import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { findUp } from "../pronunciations";
import { test } from "./test";
import { typecheck } from "./typecheck";

/**
 * `pnpm check`: everything that must hold before a commit, doing only the work a change calls for.
 * Type checks and tests skip what nothing they read has changed for (typecheck.ts, test.ts); the
 * content build reuses chapters whose files are unchanged (content/build.ts). The rest are quick
 * and run in full. `pnpm check --force` ignores every cache and runs everything.
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

const steps: [string, () => Promise<boolean>][] = [
  ["typecheck", () => typecheck(root, { force })],
  ["tests", () => test(root, { force })],
  [
    "old lessons",
    () => run("old lessons", tsx, [...tsconfig, "src/cli.ts", "../../content"], studio),
  ],
  ["boundaries", () => run("boundaries", tsx, [...tsconfig, "src/boundaries-cli.ts"], studio)],
  [
    "catalogue",
    () => run("catalogue", tsx, [...tsconfig, "src/catalogue-cli.ts", "--check"], studio),
  ],
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
  ["lint", () => run("lint", join(root, "node_modules", ".bin", "biome"), ["check", "."], root)],
];

const started = Date.now();
const times: string[] = [];
const seconds = (since: number) => `${((Date.now() - since) / 1000).toFixed(1)}s`;
for (const [name, step] of steps) {
  if (name === "typecheck" || name === "tests") console.log(`\n▸ ${name}`);
  const at = Date.now();
  const ok = await step();
  times.push(`${name} ${seconds(at)}`);
  if (!ok) {
    console.error(`\n✗ ${name} failed (${times.join(" · ")})`);
    process.exit(1);
  }
}
console.log(`\n✓ every check passed in ${seconds(started)}: ${times.join(" · ")}`);
