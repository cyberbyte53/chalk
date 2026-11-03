import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { Actor, builtChapterSchema, builtConceptSchema } from "@chalk/content";
import type { BoardRuntime } from "@chalk/player";
import { CheckedBy } from "@chalk/prop";
import { findUp } from "../find-up";
import { type Case, type Step, played, readCases, restored } from "./cases";

/**
 * The minimum Jugnu on one stuck child (platform/docs/plans/jugnu.md): the board as she sees it,
 * what she did, the lesson as its built boards teach it, one tool (try steps on a copy of her
 * board), and his reply. Its whole run comes back as a record: what he was given, each thought,
 * each try and what it showed, his reply. The preview's `?dev&jugnu` shows it beside her board.
 */

/** One move of his, in order. */
export type JugnuMove =
  | { kind: "thought" | "words"; text: string }
  | { kind: "try"; steps: Step[]; from: "now" | "start"; saw: unknown };

export type JugnuRun = {
  case: Case;
  model: string;
  given: { system: string; message: string };
  moves: JugnuMove[];
  reply: { words: string; glow: string | null };
  usage: { requests: number; ms: number; input: number; output: number };
};

const MODEL = "claude-haiku-5-5";
const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const build = join(root, "build");
const readBuilt = (path: string): unknown =>
  JSON.parse(readFileSync(join(build, `${path}.json`), "utf8"));

/** What she sees, read off the board: each shown piece's summary, its parts and what it can do. */
function seen(runtime: BoardRuntime): unknown {
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
          part: decodeURIComponent(p.path),
          ...(p.value === undefined ? {} : { value: p.value }),
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
              note: (v.feedback as { en?: string } | null)?.en,
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
function barOf(runtime: BoardRuntime): string[] {
  const questions = runtime.propNames().filter((n) => "status" in (runtime.getView(n) as object));
  const status = (n: string) => (runtime.getView(n) as { status?: string }).status;
  if (questions.some((n) => status(n) === "wrong")) return ["Try again (the question's retry)"];
  if ((runtime.getView("") as { isPassed?: boolean }).isPassed === true) return ["Continue"];
  return questions
    .filter((n) => runtime.getDef(n).checkedBy === CheckedBy.Bar && status(n) !== "correct")
    .map((n) => `Check (${n}'s check)`);
}

/** Where two values differ, leaf by leaf ("sheet.reading.point.x: 4 → -2"), at most `most`. */
function changes(a: unknown, b: unknown, path = "", out: string[] = [], most = 20): string[] {
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
async function lessonOf(boardPath: string): Promise<string> {
  const question = readBuilt(boardPath) as { tests?: string[] };
  const chapter = builtChapterSchema.parse(readBuilt(boardPath.split("/").slice(0, 2).join("/")));
  const pages: string[] = [];
  for (const ref of chapter.concepts) {
    const concept = builtConceptSchema.parse(readBuilt(ref.path));
    if (!(question.tests ?? []).includes(concept.id)) continue;
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

const SYSTEM = `You are Jugnu, a warm firefly who helps a class 9 child who is stuck on one board of a maths lesson.

A good reply:
1. is true about the board: never guess what would happen; check it with the try tool first;
2. is about her actual mistake, from what she did; the board's own note is already on her screen, so go beyond it, never repeat it;
3. uses the lesson's words and examples;
4. is a nudge: one small step or question she then does herself; never do it for her, and don't give the answer unless nudges have already failed;
5. is short: at most three short sentences, in the language she wrote in (English, Hindi or Hinglish).

This is practice: after a wrong check her answer waits for Try again (in her bar) before she can change it; the bar's buttons are in what she sees.

Before you suggest any action, try it on a copy, as she would do it (Try again first if her answer is waiting), and press Check on the copy to see it marked right. If you want one part of the board to glow, give its part name in "glow". End with your reply to her.`;

/** Jugnu on one case: his whole run, as a record. */
export async function runJugnu(caseName: string): Promise<JugnuRun> {
  // The model's key is the repo's (.env), wherever this runs from (the studio service, a script).
  if (process.env.ANTHROPIC_API_KEY === undefined) process.loadEnvFile(join(root, ".env"));
  const one = readCases().find((c) => c.name === caseName);
  if (one === undefined) throw new Error(`No case ${caseName}`);
  const boardPath = one.board;
  const runtime = await played(one.board, one.steps);
  const state = JSON.parse(JSON.stringify(runtime.state()));
  const lesson = await lessonOf(one.board);
  const tried: { steps: Step[]; from: string; saw: unknown }[] = [];

  const tryTool = betaTool({
    name: "try",
    description:
      "Plays steps on a copy of her board (her board never moves) and says what changed and how her questions stand. Steps are what a finger does: {prop, action, args}, the actions the board's pieces can do. From where she is now (default), or from the board's start.",
    inputSchema: {
      type: "object",
      properties: {
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              prop: { type: "string" },
              action: { type: "string" },
              args: { type: "object" },
            },
            required: ["prop", "action"],
          },
        },
        from: { type: "string", enum: ["now", "start"] },
      },
      required: ["steps"],
    },
    run: async ({ steps, from }) => {
      const copy =
        from === "start" ? await played(one.board, []) : await restored(one.board, state);
      const before = seen(copy);
      try {
        for (const step of steps as Step[]) {
          // As her finger would: the same path a tap takes.
          await copy.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
          copy.settle();
        }
      } catch (error) {
        return `That step can't be done: ${error instanceof Error ? error.message : String(error)}`;
      }
      const after = seen(copy);
      copy.dispose();
      const saw = {
        changed: changes(before, after),
        questions: (after as { questions: unknown }).questions,
      };
      tried.push({ steps: steps as Step[], from: from ?? "now", saw });
      return JSON.stringify(saw);
    },
  });

  const first = [
    `The lesson, as its boards teach it:\n\n${lesson}`,
    `The board, as she sees it now:\n${JSON.stringify(seen(runtime), null, 1)}`,
    `What she did on it: ${JSON.stringify(one.steps)}`,
    `She asks: "${one.asks}"`,
    `Reply to her as JSON: {"words": "...", "glow": "a part's name, or null"}.`,
  ].join("\n\n");

  const client = new Anthropic();
  const started = Date.now();
  const runner = client.beta.messages.toolRunner({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: "low" },
    // His reasoning, as a readable summary: what went on before each move.
    thinking: { type: "adaptive", display: "summarized" },
    system: SYSTEM,
    tools: [tryTool],
    messages: [{ role: "user", content: first }],
  });
  let requests = 0;
  let usage = { input: 0, output: 0 };
  /** What he did, in order: each thought, each word, each try. */
  const transcript: (
    | { kind: "thought" | "words"; text: string }
    | { kind: "try"; input: unknown }
  )[] = [];
  for await (const message of runner) {
    requests++;
    usage = {
      input: usage.input + message.usage.input_tokens,
      output: usage.output + message.usage.output_tokens,
    };
    for (const block of message.content) {
      if (block.type === "thinking" && block.thinking !== "")
        transcript.push({ kind: "thought", text: block.thinking });
      else if (block.type === "text") transcript.push({ kind: "words", text: block.text });
      else if (block.type === "tool_use") transcript.push({ kind: "try", input: block.input });
    }
  }
  const final = await runner.done();
  const ms = Date.now() - started;
  const words = final.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");

  console.log(`\n=== ${one.name}: she asks "${one.asks}"`);
  console.log(`about (what a good nudge addresses): ${one.about}`);
  console.log(`\nwhat he tried (${tried.length}):`);
  for (const t of tried)
    console.log(
      `  from ${t.from}: ${JSON.stringify(t.steps)}\n    → ${JSON.stringify(t.saw).slice(0, 400)}`,
    );
  console.log(`\nhis reply:\n${words}`);
  console.log(
    `\n${MODEL}: ${requests} requests, ${ms} ms, ${usage.input} tokens in, ${usage.output} out, stop ${final.stop_reason}`,
  );

  const moves: JugnuMove[] = [];
  let tryIndex = 0;
  for (const m of transcript) {
    if (m.kind !== "try") moves.push(m);
    else {
      const t = tried[tryIndex++];
      if (t !== undefined)
        moves.push({
          kind: "try",
          steps: t.steps,
          from: t.from === "start" ? "start" : "now",
          saw: t.saw,
        });
    }
  }
  let reply: JugnuRun["reply"] = { words, glow: null };
  try {
    const parsed = JSON.parse(words.slice(words.indexOf("{"), words.lastIndexOf("}") + 1)) as {
      words?: string;
      glow?: string | null;
    };
    reply = { words: parsed.words ?? words, glow: parsed.glow ?? null };
  } catch {
    // Not JSON: his words as they are.
  }
  runtime.dispose();
  return {
    case: one,
    model: MODEL,
    given: { system: SYSTEM, message: first },
    moves,
    reply,
    usage: { requests, ms, input: usage.input, output: usage.output },
  };
}
