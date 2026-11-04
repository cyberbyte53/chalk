import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBoard } from "@chalk/author";
import { Actor, builtPageSchema, builtQuestionSchema } from "@chalk/content";
import { modules } from "@chalk/content-source/modules";
import { propModules } from "@chalk/library/modules";
import { BoardRuntime, type RuntimeState } from "@chalk/player";
import { parse } from "yaml";
import { findUp } from "../find-up";

/**
 * Jugnu's stuck children (platform/docs/plans/jugnu.md): each case is a board, the steps a child
 * took, her question and what a good nudge is about. The steps are played on the real board here,
 * so her state is the board's own (a board is deterministic: the same steps, the same state).
 * `pnpm jugnu-cases` (platform/studio) prints them; the preview's `?dev&jugnu` shows Jugnu on them.
 */

export type Step = { prop: string; action: string; args?: Record<string, unknown> };
export type Case = {
  name: string;
  board: string;
  steps: Step[];
  asks: string;
  about: string;
  /** The next question of the same kind: she does it alone once hers is right (dialogue.ts). */
  next?: string;
  /** Simulated children on it: each one genuine misconception, and what else she knows. */
  students?: { name: string; believes: string; knows: string }[];
};

const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const build = join(root, "build");
const books = join(root, "authoring/books");

/** Every chapter's file of cases (`authoring/books/<book>/<chapter>/jugnu-cases.yaml`). */
export function caseFiles(): string[] {
  if (!existsSync(books)) return [];
  return readdirSync(books).flatMap((book) =>
    statSync(join(books, book)).isDirectory()
      ? readdirSync(join(books, book))
          .map((chapter) => join(books, book, chapter, "jugnu-cases.yaml"))
          .filter((f) => existsSync(f))
      : [],
  );
}

/**
 * A board played as a child did: her steps, each played out on the board's clock. `onMade` is called
 * with the board before it starts (a recorder attached there hears everything, from its start).
 */
export async function played(
  board: string,
  steps: readonly Step[],
  onMade?: (runtime: BoardRuntime) => void,
): Promise<BoardRuntime> {
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
  onMade?.(runtime);
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
export function questionsSeen(runtime: BoardRuntime): string[] {
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

/** The cases, as written. */
/** Every case, from every chapter's file; with `board`, only the cases on that board. */
export function readCases(board?: string): Case[] {
  const all = caseFiles().flatMap((f) => parse(readFileSync(f, "utf8")) as Case[]);
  return board === undefined ? all : all.filter((c) => c.board === board);
}

/** A board's build version (every built item has one): what a run ran on. */
export const boardVersion = (board: string): string | undefined =>
  (JSON.parse(readFileSync(join(build, `${board}.json`), "utf8")) as { version?: string }).version;
