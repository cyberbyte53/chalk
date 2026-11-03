import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBoard } from "@chalk/author";
import { Actor, builtPageSchema, builtQuestionSchema } from "@chalk/content";
import { modules } from "@chalk/content-source/modules";
import { propModules } from "@chalk/library/modules";
import { BoardRuntime, type RuntimeState } from "@chalk/player";
import { parse } from "yaml";
import { findUp } from "../src/find-up";

/**
 * Jugnu's stuck children (platform/docs/plans/jugnu.md): each case is a board, the steps a child
 * took, her question and what a good nudge is about. The steps are played on the real board here,
 * so her state is the board's own (a board is deterministic: the same steps, the same state).
 * Run from platform/studio: `pnpm jugnu-cases [--probe <board>]`; it prints what she sees.
 */

export type Step = { prop: string; action: string; args?: Record<string, unknown> };
export type Case = {
  name: string;
  board: string;
  steps: Step[];
  asks: string;
  about: string;
};

const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const build = join(root, "build");
export const CASES = join(
  root,
  "authoring/books/class9-maths/coordinate-geometry/jugnu-cases.yaml",
);

/** A board played as a child did: her steps, each played out on the board's clock. */
export async function played(board: string, steps: readonly Step[]): Promise<BoardRuntime> {
  const json = JSON.parse(readFileSync(join(build, `${board}.json`), "utf8"));
  const item = json.kind === "page" ? builtPageSchema.parse(json) : builtQuestionSchema.parse(json);
  const runtime = new BoardRuntime(
    await loadBoard(modules, item, () => undefined),
    (t) => propModules[t],
    {
      locale: "en",
      now: () => 0,
      frame: () => () => undefined,
      speak: async () => false,
      onError: (message) => {
        throw new Error(message);
      },
    },
  );
  runtime.start();
  runtime.settle();
  for (const step of steps) {
    await runtime.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
    runtime.settle();
  }
  return runtime;
}

/** A copy of a board from her state (what Jugnu tries things on): the same board, going on the same. */
export async function restored(board: string, state: RuntimeState): Promise<BoardRuntime> {
  const json = JSON.parse(readFileSync(join(build, `${board}.json`), "utf8"));
  const item = json.kind === "page" ? builtPageSchema.parse(json) : builtQuestionSchema.parse(json);
  const runtime = new BoardRuntime(
    await loadBoard(modules, item, () => undefined),
    (t) => propModules[t],
    {
      locale: "en",
      now: () => 0,
      frame: () => () => undefined,
      speak: async () => false,
      onError: (message) => {
        throw new Error(message);
      },
      from: state,
    },
  );
  runtime.start();
  return runtime;
}

/** What she sees of each question on the board: its prompt, options, result, note. */
function questionsSeen(runtime: BoardRuntime): string[] {
  return runtime.propNames().flatMap((name) => {
    const view = runtime.getView(name) as Record<string, unknown>;
    if (!("status" in view)) return [];
    const words = (v: unknown) => (v as { en?: string } | null)?.en;
    const options = (view.options as { id: string; label: unknown }[] | undefined)
      ?.map((o) => `${o.id}="${words(o.label)}"`)
      .join(", ");
    return [
      `${name}: ${words(view.prompt) ?? ""}${options ? ` [${options}]` : ""} → ${String(view.status)}${view.feedback ? ` (note: ${words(view.feedback)})` : ""}`,
    ];
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const at = process.argv.indexOf("--probe");
  if (at !== -1) {
    const runtime = await played(process.argv[at + 1] ?? "", []);
    for (const line of questionsSeen(runtime)) console.log(line);
  } else {
    const cases = parse(readFileSync(CASES, "utf8")) as Case[];
    for (const c of cases) {
      const runtime = await played(c.board, c.steps);
      const state: RuntimeState = runtime.state();
      console.log(`\n${c.name} · ${c.board}\n  asks: ${c.asks}\n  about: ${c.about}`);
      for (const line of questionsSeen(runtime)) console.log(`  ${line}`);
      console.log(`  state: ${(JSON.stringify(state).length / 1024).toFixed(1)} KB`);
      runtime.dispose();
    }
  }
}
