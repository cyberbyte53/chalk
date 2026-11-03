import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, matchesGlob, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { filesUnder, fingerprint } from "../content/deps";
import { rootFiles } from "./shared";

/**
 * Runs the test files that could have changed outcome, and only those. After a test file passes,
 * what it depended on is stamped with hashes: every module it imported (from Vite's module graph:
 * sources, other packages, JSON fixtures, other chapters' files) and every repo file it read from
 * disk (noted by trace-reads.ts). Next time, if all of those and the repo's root files are
 * byte-for-byte the same, the file is skipped; otherwise it runs. Nothing is declared by hand.
 */

type Stamp = { key: string; files: string[] };

/** What a test step did, for the check's log: how many files ran or were skipped, each one run's time. */
export type TestReport = {
  run: number;
  unchanged: number;
  files: { file: string; ms: number; ok: boolean; failures?: string[] }[];
};

type TaskResult = { state?: string; errors?: readonly { message?: string }[] };
type Task = { name: string; result?: TaskResult; tasks?: readonly Task[] };

/** Each failed test in a file, by name, with the first line of its error: what a log keeps. */
function failuresOf(task: Task, path: readonly string[] = []): string[] {
  const here = [...path, task.name];
  const own =
    task.result?.state === "fail" && (task.tasks === undefined || task.tasks.length === 0)
      ? [
          `${here.slice(1).join(" > ")}: ${(task.result.errors?.[0]?.message ?? "failed").split("\n")[0]}`,
        ]
      : [];
  return [...own, ...(task.tasks ?? []).flatMap((t) => failuresOf(t, here))];
}

type Graph = {
  getModuleById(id: string): ModuleNode | undefined;
  getModulesByFile(file: string): Set<ModuleNode> | undefined;
};
type ModuleNode = { file: string | null; importedModules: Set<ModuleNode> };

/** The test files vitest.config.ts includes. */
async function testFiles(root: string): Promise<string[]> {
  const config = (await import(pathToFileURL(join(root, "vitest.config.ts")).href)) as {
    default: { test?: { include?: string[] } };
  };
  const include = config.default.test?.include ?? [];
  const bases = [...new Set(include.map((g) => g.slice(0, g.indexOf("*")).replace(/[^/]*$/, "")))];
  const all = bases.flatMap((base) => filesUnder(join(root, base)));
  return [...new Set(all)]
    .filter((f) => include.some((g) => matchesGlob(relative(root, f), g)))
    .sort();
}

const nameOf = (file: string) => createHash("sha1").update(file).digest("hex");

function importsOf(graph: Graph | undefined, file: string): string[] {
  if (graph === undefined) return [];
  const start = graph.getModuleById(file) ?? [...(graph.getModulesByFile(file) ?? [])][0];
  const seen = new Set<ModuleNode>();
  const todo = start === undefined ? [] : [start];
  while (todo.length > 0) {
    const m = todo.pop() as ModuleNode;
    if (seen.has(m)) continue;
    seen.add(m);
    for (const next of m.importedModules) todo.push(next);
  }
  return [...seen]
    .map((m) => m.file)
    .filter((f): f is string => f !== null && !f.includes("/node_modules/"));
}

export async function test(
  root: string,
  options: { force: boolean; report?: TestReport },
): Promise<boolean> {
  const cache = join(root, "node_modules", ".cache", "chalk-check");
  const stamps = join(cache, "tests");
  if (options.force) rmSync(stamps, { recursive: true, force: true });
  mkdirSync(stamps, { recursive: true });
  const shared = rootFiles(root);
  const files = await testFiles(root);
  const stale = files.filter((file) => {
    const stampFile = join(stamps, `${nameOf(file)}.json`);
    if (!existsSync(stampFile)) return true;
    try {
      const stamp = JSON.parse(readFileSync(stampFile, "utf8")) as Stamp;
      return fingerprint([...stamp.files, file, ...shared]) !== stamp.key;
    } catch {
      return true;
    }
  });
  console.log(`test: ${stale.length} to run, ${files.length - stale.length} unchanged`);
  if (options.report !== undefined) {
    options.report.run = stale.length;
    options.report.unchanged = files.length - stale.length;
  }
  if (stale.length === 0) return true;

  const { startVitest } = await import("vitest/node");
  const vitest = await startVitest("test", stale, { run: true, watch: false, root });
  if (vitest === undefined) return false;
  const project = vitest.projects[0] as unknown as {
    vitenode?: { server?: { moduleGraph?: Graph } };
    server?: { moduleGraph?: Graph };
  };
  const graph = project.vitenode?.server?.moduleGraph ?? project.server?.moduleGraph;
  let ok = true;
  for (const result of vitest.state.getFiles()) {
    const isPass = result.result?.state === "pass";
    options.report?.files.push({
      file: relative(root, result.filepath),
      ms: Math.round(result.result?.duration ?? 0),
      ok: isPass,
      ...(isPass ? {} : { failures: failuresOf(result as unknown as Task) }),
    });
    if (result.result?.state !== "pass") {
      ok = false;
      continue;
    }
    const file = result.filepath;
    let reads: string[] = [];
    try {
      reads = JSON.parse(
        readFileSync(join(cache, "reads", `${nameOf(file)}.json`), "utf8"),
      ) as string[];
    } catch {
      continue; // nothing recorded about what it read: run it again next time
    }
    const deps = [...new Set([...importsOf(graph, file), ...reads])];
    const stamp: Stamp = { key: fingerprint([...deps, file, ...shared]), files: deps };
    writeFileSync(join(stamps, `${nameOf(file)}.json`), JSON.stringify(stamp));
  }
  await vitest.close();
  return ok && process.exitCode !== 1;
}
