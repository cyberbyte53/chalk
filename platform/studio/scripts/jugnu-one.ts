import { readFileSync } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { Actor, builtChapterSchema, builtConceptSchema } from "@chalk/content";
import type { BoardRuntime } from "@chalk/player";
import { CheckedBy } from "@chalk/prop";
import { parse } from "yaml";
import { findUp } from "../src/find-up";
import { closeBrowser, shoot } from "../src/mcp/app-driver";
import { CASES, type Case, type Step, played, restored } from "./jugnu-cases";

/**
 * The minimum Jugnu on one stuck child, end to end (platform/docs/plans/jugnu.md): the board as
 * she sees it, what she did, the lesson as its built boards teach it, one tool (try steps on a copy
 * of her board), and his reply. Run from platform/studio: `pnpm jugnu-one <case name>`.
 */

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

const caseName = process.argv[2] ?? "plot-swapped";
const one = (parse(readFileSync(CASES, "utf8")) as Case[]).find((c) => c.name === caseName);
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
    const copy = from === "start" ? await played(one.board, []) : await restored(one.board, state);
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

// ---- The page: what he was given, what he thought and tried (each try drawn), what he said ----

const asAct = (steps: readonly Step[]) =>
  steps.map((st) => ({ act: { prop: st.prop, action: st.action, args: st.args ?? {} } }));
/** The real app drawing a board after these steps (the studio's driver; the dev preview must run). */
async function picture(steps: readonly Step[]): Promise<string | undefined> {
  if (steps.length === 0) {
    const d = await shoot(root, boardPath, {});
    return d.shots[0]?.png.toString("base64");
  }
  const d = await shoot(root, boardPath, { play: true }, { steps: asAct(steps), shots: "last" });
  return d.steps.at(-1)?.picture?.png.toString("base64");
}
const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const img = (b64: string | undefined) =>
  b64 === undefined
    ? "<p class=muted>(no picture)</p>"
    : `<img src="data:image/png;base64,${b64}">`;
const herPicture = await picture(one.steps);
const tryPictures: (string | undefined)[] = [];
for (const t of tried)
  tryPictures.push(await picture(t.from === "start" ? t.steps : [...one.steps, ...t.steps]));
await closeBrowser();

let tryIndex = 0;
const moves = transcript
  .map((m) => {
    if (m.kind === "thought")
      return `<div class="thought"><b>Thinking</b><p>${esc(m.text)}</p></div>`;
    if (m.kind === "words") return `<div class="words"><b>Says</b><p>${esc(m.text)}</p></div>`;
    if (m.kind !== "try") return "";
    const t = tried[tryIndex];
    const pic = tryPictures[tryIndex];
    tryIndex++;
    return `<div class="try"><b>Tries on a copy</b> (from ${t?.from ?? "now"})<pre>${esc(JSON.stringify(m.input, null, 1))}</pre><b>What came back</b><pre>${esc(JSON.stringify(t?.saw, null, 1))}</pre>${img(pic)}</div>`;
  })
  .join("\n");
const page = `<!doctype html><meta charset=utf-8><title>Jugnu: ${esc(one.name)}</title>
<style>body{font:15px/1.5 system-ui;max-width:900px;margin:24px auto;padding:0 16px;color:#1e2130}
h1{font-size:22px}h2{font-size:17px;margin-top:28px}pre{background:#f4f4f7;padding:10px;border-radius:8px;white-space:pre-wrap;font-size:12px;max-height:340px;overflow:auto}
img{width:360px;border:1px solid #ddd;border-radius:12px;display:block;margin:8px 0}
.thought{background:#fff8e6;padding:10px 14px;border-radius:10px;margin:10px 0}.words{background:#eef3ff;padding:10px 14px;border-radius:10px;margin:10px 0}
.try{border-left:4px solid #3f3bd9;padding:4px 14px;margin:14px 0}.reply{background:#e9f8ef;padding:14px;border-radius:12px;font-size:17px}.muted{color:#888}
details summary{cursor:pointer;font-weight:600}</style>
<h1>Jugnu on “${esc(one.name)}”</h1>
<p><b>She asks:</b> “${esc(one.asks)}”<br><b>A good nudge is about:</b> ${esc(one.about)}</p>
<h2>1. Her board, as she sees it</h2>${img(herPicture)}
<p><b>What she did:</b></p><pre>${esc(JSON.stringify(one.steps, null, 1))}</pre>
<h2>2. What he was given</h2>
<details><summary>His instructions</summary><pre>${esc(SYSTEM)}</pre></details>
<details><summary>The lesson, the board as data, her steps and question (${first.length} characters)</summary><pre>${esc(first)}</pre></details>
<h2>3. What went on: his thinking and his tries, in order</h2>${moves}
<h2>4. His reply</h2><div class="reply">${esc(words)}</div>
<p class=muted>${MODEL}: ${requests} requests, ${ms} ms, ${usage.input} tokens in, ${usage.output} out.</p>`;
const dir = join(root, "platform/studio/node_modules/.cache/jugnu");
mkdirSync(dir, { recursive: true });
const file = join(dir, `${one.name}.html`);
writeFileSync(file, page);
console.log(`\nThe page: ${file}`);
