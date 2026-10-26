import { execFileSync, spawn } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  rmdirSync,
  watch,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { propDefs } from "@chalk/library";
import { PRONUNCIATIONS_FILE, findUp, loadReadings } from "../pronunciations";
import { ARTS_CSS, artGallery, collectArt } from "./art";
import { type BuildResult, PROP_DIRS, SOURCES_FILE, buildContent } from "./build";
import { MODULES_FILE, writeConceptModules, writeModulesModule } from "./concepts";
import { buildInputsKey, inputsKeyFile } from "./inputs";

/** In build/, rewritten at the end of every build: what a dev server watches to redraw. */
export const BUILT_FILE = ".built";

/**
 * `pnpm build-content`: builds everything content/build.yaml reaches into build/, checking it all.
 * First it brings each chapter's concepts.gen.ts in line with its build.yaml (families import it).
 * `pnpm preview`: the same on every save (the learner app shows build/ in development).
 * `pnpm publish-content`: the same from a clean git commit only; build/ is also kept as
 * published/<commit>/, the copy that ships.
 * `pnpm art`: builds, then writes build/art.html, every piece of art side by side, to look at.
 */
const Command = { Build: "build", Preview: "preview", Publish: "publish", Art: "art" } as const;

const { positionals, values } = parseArgs({
  // `pnpm build-content -- --force` hands the script a bare "--": skip it.
  args: process.argv.slice(2).filter((a) => a !== "--"),
  allowPositionals: true,
  options: { force: { type: "boolean", default: false } },
});
const command = positionals[0];
const root = dirname(findUp("pnpm-workspace.yaml", process.cwd()));
const contentDir = join(root, "content");
const buildDir = join(root, "build");
const readings = loadReadings(join(root, "authoring", PRONUNCIATIONS_FILE));

function git(...args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

/**
 * The commit this build is of: CHALK_COMMIT when shipping (the image has no .git), else the
 * checkout's HEAD, marked `-dirty` when there are uncommitted changes (never mistaken for a ship).
 */
function currentCommit(): string {
  const given = process.env.CHALK_COMMIT;
  if (given !== undefined && given !== "") return given;
  try {
    const head = git("rev-parse", "HEAD");
    return git("status", "--porcelain") === "" ? head : `${head}-dirty`;
  } catch {
    return "unknown";
  }
}

function report(result: BuildResult): void {
  for (const notice of result.notices) console.log(`  · ${notice}`);
  const { built, reused } = result.chapters;
  console.log(
    `  · ${built.length} chapter${built.length === 1 ? "" : "s"} built${built.length > 0 && built.length <= 5 ? ` (${built.join(", ")})` : ""}, ${reused} unchanged`,
  );
  if (result.problems.length === 0) {
    console.log(`✓ ${result.files.size} files, every check passed`);
    return;
  }
  console.error(`✗ ${result.problems.length} problem(s):`);
  for (const p of result.problems) console.error(`    ${p.where}: ${p.message}`);
}

/**
 * Makes build/ exactly these files, in place: a file is written only when it changed, and files no
 * longer built are removed. build/ never disappears, so a dev server reading it while this runs
 * (the preview's bundled course list) never sees it empty.
 */
function write(result: BuildResult): void {
  const wanted = new Map<string, string>();
  for (const [path, json] of result.files) wanted.set(path, `${JSON.stringify(json, null, 2)}\n`);
  // Where each board was written, for the preview's "open in editor"; not part of the content.
  wanted.set(SOURCES_FILE, `${JSON.stringify(Object.fromEntries(result.sources), null, 2)}\n`);
  // Written last, every time (only changed files are written, so nothing else always changes):
  // the dev server watches it to tell open previews to redraw.
  wanted.set(BUILT_FILE, `${new Date().toISOString()}\n`);
  for (const [path, text] of [...wanted].sort(
    ([a], [b]) => Number(a === BUILT_FILE) - Number(b === BUILT_FILE),
  )) {
    const file = join(buildDir, path);
    if (existsSync(file) && readFileSync(file, "utf8") === text) continue;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  }
  // Removes what is no longer built; says whether `dir` was left empty.
  const prune = (dir: string, rel: string): boolean => {
    let isEmpty = true;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = rel === "" ? entry.name : `${rel}/${entry.name}`;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (prune(full, path)) rmdirSync(full);
        else isEmpty = false;
      } else if (wanted.has(path)) isEmpty = false;
      else rmSync(full);
    }
    return isEmpty;
  };
  if (existsSync(buildDir)) prune(buildDir, "");
}

/**
 * Built chapters are kept in node_modules/.cache/chalk-content with what each read; a chapter is
 * rebuilt only when one of those files changed (see build.ts). `--force` builds everything afresh.
 */
const cacheDir = join(root, "node_modules", ".cache", "chalk-content");
const propDirs = PROP_DIRS;

async function build(commit: string): Promise<BuildResult> {
  if (values.force) rmSync(cacheDir, { recursive: true, force: true });
  const result = await buildContent({
    contentDir,
    defs: propDefs,
    readings,
    commit,
    cache: { dir: cacheDir, root, propDirs },
  });
  report(result);
  return result;
}

function watchAndRebuild(): void {
  let timer: NodeJS.Timeout | undefined;
  let isRunning = false;
  // A save while a build runs: build again when it ends, or the preview misses that save.
  let isWanted = false;
  const rebuild = () => {
    if (isRunning) {
      isWanted = true;
      return;
    }
    isRunning = true;
    isWanted = false;
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
      if (isWanted) rebuild();
    });
  };
  rebuild();
  watch(contentDir, { recursive: true }, (_event, file) => {
    // Comments aren't content: a new comment rebuilds nothing.
    if (file === null || !/\.(tsx?|yaml|json)$/.test(file) || file.endsWith("comments.yaml"))
      return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log(`\n↻ ${file} changed`);
      rebuild();
    }, 200);
  });
  console.log(`watching ${contentDir} …`);
}

/**
 * One build at a time: the dev server's rebuild-on-save and an agent's render_board may both start
 * one, and two writing build/ at once would mix. The lock is a file only one process can create;
 * a lock left by a process that died is taken over.
 */
async function holdBuildLock(): Promise<void> {
  const lock = join(cacheDir, "build.lock");
  mkdirSync(cacheDir, { recursive: true });
  for (let waited = 0; ; waited += 200) {
    try {
      writeFileSync(lock, String(process.pid), { flag: "wx" });
      process.on("exit", () => rmSync(lock, { force: true }));
      return;
    } catch {
      const holder = Number(readFileSync(lock, "utf8"));
      let isAlive = false;
      try {
        process.kill(holder, 0);
        isAlive = holder !== process.pid;
      } catch {}
      if (!isAlive || waited > 180_000) rmSync(lock, { force: true });
      else await new Promise((r) => setTimeout(r, 200));
    }
  }
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
  await holdBuildLock();
  for (const file of writeConceptModules(contentDir)) console.log(`  · generated ${file}`);
  if (writeModulesModule(contentDir)) console.log(`  · generated ${MODULES_FILE}`);
  // Taken before building: an edit made while the build runs must not count as built.
  const inputs = buildInputsKey(root);
  const result = await build(currentCommit());
  write(result);
  if (result.problems.length > 0) process.exitCode = 1;
  else {
    mkdirSync(dirname(inputsKeyFile(root)), { recursive: true });
    writeFileSync(inputsKeyFile(root), inputs);
  }
} else if (command === Command.Preview) {
  watchAndRebuild();
} else if (command === Command.Publish) {
  await publish();
} else if (command === Command.Art) {
  const result = await build(currentCommit());
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
