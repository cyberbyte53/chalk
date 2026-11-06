// Every built board, played through its witness and its note checks on the jumping clock, in every
// language: at each step, every piece's state and the markup its view draws. A change that should
// leave students' screens as they were is proved by two snapshots, before and after, the same.
//
//   pnpm snapshot <file>            record (after `pnpm build-content`)
//   pnpm snapshot <before> <after>  compare: which plays differ, and where each first does
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { loadBoard } from "@chalk/author";
import {
  Actor,
  LOCALES,
  type Locale,
  builtPageSchema,
  builtQuestionSchema,
  shownOf,
} from "@chalk/content";
import { modules } from "@chalk/content-source/modules";
import { propModules } from "@chalk/library/modules";
import { BoardRuntime } from "@chalk/player";
import { h } from "preact";
import { renderToString } from "preact-render-to-string";
import { findUp } from "./find-up";

type Step = { prop: string; action: string; args?: Record<string, unknown> };
type Seen = { at: string; error?: string; pieces: Record<string, unknown> };

const root = join(findUp("pnpm-workspace.yaml", import.meta.dirname), "..");
const build = join(root, "build");

const filesUnder = (dir: string): string[] =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? filesUnder(p) : p.endsWith(".json") ? [p] : [];
      })
    : [];

/** A value with every string in it as shown. */
const asShown = (value: unknown): unknown =>
  typeof value === "string"
    ? shownOf(value)
    : Array.isArray(value)
      ? value.map(asShown)
      : value !== null && typeof value === "object"
        ? Object.fromEntries(Object.entries(value).map(([k, v]) => [k, asShown(v)]))
        : value;

/** One board played through `steps` in a language; undefined for a file that isn't a board. */
async function play(
  file: string,
  locale: Locale,
  steps: readonly Step[],
): Promise<Seen[] | undefined> {
  const json = JSON.parse(readFileSync(file, "utf8"));
  const parsed =
    json.kind === "page" ? builtPageSchema.safeParse(json) : builtQuestionSchema.safeParse(json);
  if (!parsed.success) return undefined;
  const board = await loadBoard(modules, parsed.data, () => undefined);
  const runtime = new BoardRuntime(board, (type) => propModules[type], {
    locale,
    now: () => 0,
    frame: () => () => undefined,
    speak: async () => false,
    onError: (message) => {
      throw new Error(message);
    },
  });
  const names = Object.keys(board.model.scene.children ?? {});
  const look = () =>
    Object.fromEntries(
      names.map((name) => {
        const module = propModules[runtime.getDef(name).type];
        const view = runtime.getView(name);
        const markup =
          module === undefined
            ? null
            : renderToString(
                h(module.View, {
                  view,
                  locale,
                  width: 390,
                  call: () => undefined,
                  signal: () => undefined,
                }),
              );
        // A piece's state with its text as shown (speech marks resolved): what the student meets.
        // How a line is said is compared by `pnpm said-compare`.
        return [name, { hidden: runtime.isHidden(name), view: asShown(view), markup }];
      }),
    );
  runtime.start();
  runtime.settle();
  const out: Seen[] = [{ at: "start", pieces: look() }];
  for (const step of steps) {
    let error: string | undefined;
    try {
      await runtime.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
      runtime.settle();
    } catch (e) {
      error = String(e);
    }
    out.push({
      at: `${step.prop}.${step.action} ${JSON.stringify(step.args ?? {})}`,
      ...(error === undefined ? {} : { error }),
      pieces: look(),
    });
  }
  return out;
}

async function record(file: string): Promise<void> {
  const plays: Record<string, Seen[]> = {};
  for (const path of filesUnder(build)) {
    const board = relative(build, path).replace(/\.json$/, "");
    if (board.startsWith("witness/") || board.startsWith("review/")) continue;
    const witnessFile = join(build, "witness", `${board}.json`);
    const w: { witness: Step[]; noteChecks?: Step[][] } = existsSync(witnessFile)
      ? JSON.parse(readFileSync(witnessFile, "utf8"))
      : { witness: [] };
    for (const locale of LOCALES) {
      const first = await play(path, locale, w.witness);
      if (first === undefined) break;
      plays[`${board} ${locale} witness`] = first;
      for (const [i, note] of (w.noteChecks ?? []).entries())
        plays[`${board} ${locale} note ${i + 1}`] = (await play(path, locale, note)) ?? [];
    }
  }
  writeFileSync(file, JSON.stringify(plays));
  const boards = new Set(Object.keys(plays).map((k) => k.split(" ")[0]));
  const steps = Object.values(plays).reduce((n, p) => n + p.length, 0);
  const errors = Object.values(plays)
    .flat()
    .filter((s) => s.error !== undefined).length;
  console.log(`${boards.size} boards, ${steps} steps, ${errors} step errors → ${file}`);
}

function compare(beforeFile: string, afterFile: string): void {
  const before = JSON.parse(readFileSync(beforeFile, "utf8")) as Record<string, Seen[]>;
  const after = JSON.parse(readFileSync(afterFile, "utf8")) as Record<string, Seen[]>;
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const differ = keys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  console.log(`${keys.length} plays, ${differ.length} differ`);
  for (const key of differ.slice(0, 20)) {
    const [b = [], a = []] = [before[key] ?? [], after[key] ?? []];
    const i = b.findIndex((s, n) => JSON.stringify(s) !== JSON.stringify(a[n]));
    const at = i === -1 ? b.length : i;
    const pb = b[at]?.pieces ?? {};
    const pa = a[at]?.pieces ?? {};
    const piece = Object.keys({ ...pb, ...pa }).find(
      (n) => JSON.stringify(pb[n]) !== JSON.stringify(pa[n]),
    );
    console.log(
      `  ${key}: step ${at} (${b[at]?.at ?? a[at]?.at ?? "missing"}), piece ${piece ?? "?"}`,
    );
  }
  if (differ.length > 20) console.log(`  … and ${differ.length - 20} more`);
  process.exitCode = differ.length === 0 ? 0 : 1;
}

// Paths as typed where `pnpm snapshot` was run (pnpm runs this from platform/studio).
const [first, second] = process.argv
  .slice(2)
  .map((a) => resolve(process.env.INIT_CWD ?? process.cwd(), a));
if (first === undefined) {
  console.error("pnpm snapshot <file>  |  pnpm snapshot <before> <after>");
  process.exitCode = 2;
} else if (second === undefined) await record(first);
else compare(first, second);
