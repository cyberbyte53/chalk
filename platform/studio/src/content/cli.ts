import { execFileSync, spawn } from "node:child_process";
import { cpSync, mkdirSync, readFileSync, rmSync, watch, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { WORKING_TREE } from "@chalk/content";
import { propDefs } from "@chalk/library";
import { PRONUNCIATIONS_FILE, findUp, loadReadings } from "../pronunciations";
import { ARTS_CSS, artGallery, collectArt } from "./art";
import { type BuildResult, SOURCES_FILE, buildContent } from "./build";
import { writeConceptModules } from "./concepts";

/**
 * `pnpm build-content`: builds everything content/build.yaml reaches into build/, checking it all.
 * First it brings each chapter's concepts.gen.ts in line with its build.yaml (families import it).
 * `pnpm preview`: the same on every save (the learner app shows build/ in development).
 * `pnpm publish-content`: the same from a clean git commit only; build/ is also kept as
 * published/<commit>/, the copy that ships.
 * `pnpm art`: builds, then writes build/art.html, every piece of art side by side, to look at.
 */
const Command = { Build: "build", Preview: "preview", Publish: "publish", Art: "art" } as const;

const { positionals } = parseArgs({ allowPositionals: true });
const command = positionals[0];
const root = dirname(findUp("pnpm-workspace.yaml", process.cwd()));
const contentDir = join(root, "content");
const buildDir = join(root, "build");
const readings = loadReadings(join(contentDir, PRONUNCIATIONS_FILE));

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function report(result: BuildResult): void {
  for (const notice of result.notices) console.log(`  · ${notice}`);
  if (result.problems.length === 0) {
    console.log(`✓ ${result.files.size} files, every check passed`);
    return;
  }
  console.error(`✗ ${result.problems.length} problem(s):`);
  for (const p of result.problems) console.error(`    ${p.where}: ${p.message}`);
}

/** Replaces build/ with exactly these files. */
function write(result: BuildResult): void {
  rmSync(buildDir, { recursive: true, force: true });
  for (const [path, json] of result.files) {
    const file = join(buildDir, path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  }
  // Where each board was written, for the preview's "open in editor"; not part of the content.
  writeFileSync(
    join(buildDir, SOURCES_FILE),
    `${JSON.stringify(Object.fromEntries(result.sources), null, 2)}\n`,
  );
}

async function build(commit: string): Promise<BuildResult> {
  const result = await buildContent({ contentDir, defs: propDefs, readings, commit });
  report(result);
  return result;
}

function watchAndRebuild(): void {
  let timer: NodeJS.Timeout | undefined;
  let isRunning = false;
  const rebuild = () => {
    if (isRunning) return;
    isRunning = true;
    // A fresh process each time: ES modules can't be re-imported after an edit.
    const child = spawn(
      process.execPath,
      [...process.execArgv, process.argv[1] ?? "", Command.Build],
      {
        stdio: "inherit",
      },
    );
    child.on("exit", () => {
      isRunning = false;
    });
  };
  rebuild();
  watch(contentDir, { recursive: true }, (_event, file) => {
    if (file === null || !/\.(tsx?|yaml|json)$/.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`\n↻ ${file} changed`);
      rebuild();
    }, 200);
  });
  console.log(`watching ${contentDir} …`);
}

async function publish(): Promise<void> {
  const dirty = git("status", "--porcelain");
  if (dirty !== "") {
    console.error("✗ Commit first: publish only runs from a clean git tree. Uncommitted:");
    console.error(
      dirty
        .split("\n")
        .map((line) => `    ${line}`)
        .join("\n"),
    );
    process.exit(1);
  }
  const commit = git("rev-parse", "HEAD");
  const result = await build(commit);
  if (result.problems.length > 0) {
    console.error("✗ Nothing published.");
    process.exit(1);
  }
  write(result);
  const kept = join(root, "published", commit);
  rmSync(kept, { recursive: true, force: true });
  cpSync(buildDir, kept, { recursive: true });
  rmSync(join(kept, SOURCES_FILE), { force: true });
  console.log(`✓ published ${commit.slice(0, 7)} → ${kept}`);
}

if (command === Command.Build) {
  for (const file of writeConceptModules(contentDir)) console.log(`  · generated ${file}`);
  const result = await build(WORKING_TREE);
  write(result);
  if (result.problems.length > 0) process.exitCode = 1;
} else if (command === Command.Preview) {
  watchAndRebuild();
} else if (command === Command.Publish) {
  await publish();
} else if (command === Command.Art) {
  const result = await build(WORKING_TREE);
  write(result);
  const css = ARTS_CSS.map((file) => readFileSync(join(root, file), "utf8")).join("\n");
  const page = artGallery(collectArt(result.files), css);
  writeFileSync(join(buildDir, "art.html"), page);
  console.log(`✓ ${join(buildDir, "art.html")}: open it in a browser`);
  if (result.problems.length > 0) process.exitCode = 1;
} else {
  console.error("Usage: pnpm build-content | pnpm preview | pnpm publish-content | pnpm art");
  process.exit(1);
}
