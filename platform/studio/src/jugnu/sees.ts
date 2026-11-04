import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Actor, builtChapterSchema, builtConceptSchema } from "@chalk/content";
import type { BoardRuntime } from "@chalk/player";
import { CheckedBy } from "@chalk/prop";
import { findUp } from "../find-up";
import { type Case, type Step, played, readCases, restored } from "./cases";

/**
 * What Jugnu sees (platform/docs/plans/jugnu-agent.md): her board as she sees it (`seen`), what
 * changed between two looks (`changes`), what her board's check found (`checkFound`, for him only),
 * and the lesson as its built boards teach it (`lessonOf`).
 */

export const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const build = join(root, "build");
const readBuilt = (path: string): unknown =>
  JSON.parse(readFileSync(join(build, `${path}.json`), "utf8"));

/** A checked question's result as her screen shows it: right or wrong, not the note. */
const withoutNote = (value: unknown): unknown =>
  value !== null && typeof value === "object" && "status" in value && "note" in value
    ? { status: (value as { status: unknown }).status }
    : value;

/** What each checked question's check found (its note): she doesn't see it; Jugnu is told. */
export function checkFound(runtime: BoardRuntime): { question: string; found: string }[] {
  return runtime.propNames().flatMap((name) => {
    const note = (runtime.getView(name) as { feedback?: { en?: string } | null }).feedback?.en;
    return note === undefined ? [] : [{ question: name, found: note }];
  });
}

/**
 * What she sees, read off the board: each shown piece's summary, its parts and what it can do. As
 * in practice on her phone: a checked question says right or wrong ("Not quite."), never its note
 * (answer-feedback.tsx; the note is what the check found: `checkFound`, for Jugnu only).
 */
export function seen(runtime: BoardRuntime): unknown {
  const snap = runtime.snapshot();
  return {
    isPassed: snap.isPassed,
    pieces: snap.nodes
      .filter((n) => n.isShown)
      .map((n) => ({
        name: n.path,
        prop: n.prop,
        shows: n.summary,
        parts: n.parts.map((p) => ({
          part: p.path,
          ...(p.value === undefined ? {} : { value: withoutNote(p.value) }),
          ...(p.words === undefined ? {} : { words: p.words }),
          ...(p.does === undefined ? {} : { does: p.does }),
        })),
        can: n.can.map((c) => ({ action: c.action, takes: c.takes })),
      })),
    questions: runtime.propNames().flatMap((name) => {
      const v = runtime.getView(name) as Record<string, unknown>;
      return "status" in v
        ? [
            {
              name,
              status: v.status,
              attempts: v.attempts,
            },
          ]
        : [];
    }),
    bar: barOf(runtime),
  };
}

/**
 * The buttons in her bar under the board, as the player shows them in practice (a bank question:
 * a wrong answer waits for Try again, the question's retry): Try again after a wrong check, Continue
 * once passed, else Check for a question checked with it.
 */
function barOf(
  runtime: BoardRuntime,
): { button: string; step?: { prop: string; action: string } }[] {
  const questions = runtime.propNames().filter((n) => "status" in (runtime.getView(n) as object));
  const status = (n: string) => (runtime.getView(n) as { status?: string }).status;
  const wrong = questions.filter((n) => status(n) === "wrong");
  if (wrong.length > 0)
    return wrong.map((n) => ({ button: "Try again", step: { prop: n, action: "retry" } }));
  if ((runtime.getView("") as { isPassed?: boolean }).isPassed === true)
    return [{ button: "Continue" }];
  return questions
    .filter((n) => runtime.getDef(n).checkedBy === CheckedBy.Bar && status(n) !== "correct")
    .map((n) => ({ button: "Check", step: { prop: n, action: "check" } }));
}

/** Where two values differ, leaf by leaf ("sheet.reading.point.x: 4 → -2"), at most `most`. */
export function changes(
  a: unknown,
  b: unknown,
  path = "",
  out: string[] = [],
  most = 20,
): string[] {
  if (out.length >= most || JSON.stringify(a) === JSON.stringify(b)) return out;
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
      changes(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        path === "" ? key : `${path}.${key}`,
        out,
        most,
      );
    return out;
  }
  out.push(`${path}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`);
  return out;
}

/** The lesson as its built boards teach it: each page's pieces, as shown once its witness is done. */
export async function lessonOf(boardPath: string): Promise<string> {
  const question = readBuilt(boardPath) as { tests?: string[] };
  const chapter = builtChapterSchema.parse(readBuilt(boardPath.split("/").slice(0, 2).join("/")));
  const pages: string[] = [];
  for (const ref of chapter.concepts) {
    const concept = builtConceptSchema.parse(readBuilt(ref.path));
    // A question: the concepts it tests. A lesson's page: the concept it is in.
    const isHere =
      (question.tests ?? []).includes(concept.id) || boardPath.startsWith(`${ref.path}/`);
    if (!isHere) continue;
    pages.push(`# ${concept.title.en}`);
    for (const page of concept.overview) {
      const witness = JSON.parse(
        readFileSync(join(build, "witness", `${page.path}.json`), "utf8"),
      ) as {
        witness: {
          kind?: string;
          prop?: string;
          action?: string;
          args?: Record<string, unknown>;
        }[];
      };
      const steps = witness.witness.flatMap((w) =>
        w.kind === "act" && w.prop && w.action
          ? [{ prop: w.prop, action: w.action, args: w.args ?? {} }]
          : [],
      );
      const runtime = await played(page.path, steps);
      const shown = runtime
        .snapshot()
        .nodes.filter((n) => n.isShown && !n.path.includes("/"))
        .map((n) => `- ${n.summary}`);
      pages.push(`## ${page.path.split("/").at(-1)}\n${shown.join("\n")}`);
      runtime.dispose();
    }
  }
  return pages.join("\n\n");
}
