import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { betaTool } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { Actor } from "@chalk/content";
import type { BoardRuntime } from "@chalk/player";
import { type Case, type Step, played, readCases, restored } from "./cases";
import { MODEL, changes, lessonOf, root, seen } from "./run";

/**
 * Jugnu and a simulated child, back and forth on one real board (platform/docs/plans/jugnu.md).
 * The child holds one genuine misconception (her `believes`, hidden from Jugnu), acts on her real
 * board as it makes her, and answers his questions in her own words. Jugnu sees only what a phone
 * would show him: her board, what she did, what she says. He probes, one small question at a time,
 * to find out why she thinks what she thinks, and helps her fix it herself. It ends when her own
 * Check says right, or after MAX_TURNS of his. Both sides' thinking is kept, to read.
 */

export const STUDENT_MODEL = "claude-haiku-5-5";
const MAX_TURNS = 6;

/** A simulated child: who she is on this case, and what she believes (Jugnu never sees it). */
export type Student = { name: string; believes: string };

export type JugnuTurn = {
  who: "jugnu";
  /** Exactly what he was given this turn (beside his instructions and the lesson). */
  given: string;
  thinking: string[];
  tries: { steps: Step[]; from: "now" | "start"; saw: unknown }[];
  /** What he thinks she believes, so far. */
  diagnosis: string;
  says: string;
  choices: string[];
  glow: string | null;
  /** His glow names a part on her board (else nothing glows: a failure to read). */
  isGlowOnList: boolean;
};
export type HerTurn = {
  who: "her";
  /** Exactly what she was given this turn (beside her instructions); "" for her first ask. */
  given: string;
  thinking: string[];
  /** What she did on her board this turn (it really happened). */
  did: Step[];
  says: string;
  /** All her steps on the board so far (to draw her board after this turn). */
  stepsSoFar: Step[];
  isRight: boolean;
};
export type Dialogue = {
  /** Its name in the list of experiments: when, which case, which child. */
  id: string;
  /** What this experiment changed, in a few words (what it is compared for). */
  note: string;
  case: Case;
  student: Student;
  models: { jugnu: string; student: string };
  /** Both sides' instructions, as they ran. */
  instructions: { jugnu: string; student: string };
  turns: (JugnuTurn | HerTurn)[];
  isRight: boolean;
  usage: { ms: number; input: number; output: number };
};

export const JUGNU = `You are Jugnu, a warm firefly who helps a class 9 child stuck on one board of a maths lesson. You talk with her in turns.

Your first job is to find out WHY she thinks what she thinks. Her board's own note is already on her screen; if she still asks, she didn't understand something, and you must find out what. Don't repeat the note.
- Keep in mind what she might believe that would make her do exactly what she did (several possibilities), and ask ONE small question that best tells them apart.
- Prefer questions she answers with a tap (give 2 to 4 short choices) or by doing one small thing on her board, not long typing.
- Her board is the truth. When she says she did something, check her board (what she has done, where things are now): if it didn't happen, gently ask her to do it.
- Once her answers make clear what she believes, say so in your diagnosis without "not sure", and move on to helping: name the rule from the lesson she has wrong, in the lesson's own words and examples (recall the page or example she met), then give her one small step to do herself.
- Never give the board's answer (where the dot goes, which option to pick): she does that herself. Recalling a rule the lesson taught is not giving the answer.
- Everything you say about the board must be true: check it first with the try tool on a copy (her board never moves). This is practice: after a wrong check her answer waits for Try again (the question's retry step: {"prop": "ask", "action": "retry"}).
- At most two short sentences a turn, in English, warm.

Answer as JSON: {"diagnosis": "what you think she believes so far (say 'not sure yet: ...' only while it really is open)", "says": "...", "choices": ["..."] or [], "glow": one part's address exactly as listed under her board's parts (e.g. "sheet/reading/point"), or null}.`;

export const STUDENT = (
  believes: string,
) => `You are a class 9 student in India, doing a maths lesson on your phone. You are stuck, and you are talking with Jugnu, the app's tutor.

What you believe (you don't know it is wrong, and you believe it firmly): ${believes}

That one belief is your only mistake. Everything else you know as a class 9 student does: the x-axis is the flat left-right line and the y-axis the up-down one, O is where they cross, right is plus and left is minus along the x-axis, up is plus along the y-axis. Don't invent other confusions.

- Act and answer exactly as someone with that one belief would. Don't guess what the tutor wants.
- Answer briefly, like a 14-year-old: a few words, in English. If he gives choices, pick one by its words.
- If he asks you to do something on the board, do it with the act tool, the way your belief tells you. Never say you did something on the board unless you did it with the act tool.
- Change your mind only when what he says really shows you your belief doesn't fit; then change it, as a real student would.
- When you think you've got it right, do it on the board (Try again first if your answer is waiting: {"prop": "ask", "action": "retry"}) and press Check yourself ({"prop": "ask", "action": "check"}).

Answer as JSON: {"says": "...", "choice": "the choice you picked, or null"}.`;

const stepsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: { prop: { type: "string" }, action: { type: "string" }, args: { type: "object" } },
    required: ["prop", "action"],
  },
} as const;

const jsonOf = (text: string): Record<string, unknown> => {
  try {
    return JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as Record<
      string,
      unknown
    >;
  } catch {
    return { says: text };
  }
};

const isRightOf = (runtime: BoardRuntime) =>
  runtime.propNames().some((n) => (runtime.getView(n) as { status?: string }).status === "correct");

/** The conversation so far, as each side reads it. */
function talk(turns: readonly (JugnuTurn | HerTurn)[], to: "jugnu" | "her"): string {
  return turns
    .map((t) =>
      t.who === "jugnu"
        ? `Jugnu: ${t.says}${t.choices.length > 0 ? `  [choices: ${t.choices.join(" | ")}]` : ""}`
        : `${to === "her" ? "You" : "She"}: ${t.says}${t.did.length > 0 ? `  (did on the board: ${JSON.stringify(t.did)})` : ""}`,
    )
    .join("\n");
}

/** Every part's address on her board as she sees it: what a glow may name. */
const partsOf = (board: BoardRuntime): string[] =>
  (seen(board) as { pieces: { parts: { part: string }[] }[] }).pieces.flatMap((p) =>
    p.parts.map((x) => x.part),
  );

/** What Jugnu is given on a turn: her board now, what she did, the talk so far. */
export const givenToJugnu = (
  board: BoardRuntime,
  herSteps: readonly Step[],
  turns: readonly (JugnuTurn | HerTurn)[],
): string =>
  [
    `Her board, as she sees it now:\n${JSON.stringify(seen(board), null, 1)}`,
    `What she has done on it, in order: ${JSON.stringify(herSteps)}`,
    `Your talk so far:\n${talk(turns, "jugnu")}`,
    "Your turn.",
  ].join("\n\n");

/** What she is given on a turn: her board now, what she did, the talk so far. */
export const givenToHer = (
  board: BoardRuntime,
  herSteps: readonly Step[],
  turns: readonly (JugnuTurn | HerTurn)[],
): string =>
  [
    `Your board, as you see it now:\n${JSON.stringify(seen(board), null, 1)}`,
    `What you have done on it so far: ${JSON.stringify(herSteps)}`,
    `Your talk with Jugnu so far:\n${talk(turns, "her")}`,
    "Your turn: answer Jugnu.",
  ].join("\n\n");

/** One case, one simulated child: their whole conversation. */
export async function runDialogue(
  caseName: string,
  studentName: string,
  note = "",
): Promise<Dialogue> {
  const one = readCases().find((c) => c.name === caseName);
  if (one === undefined) throw new Error(`No case ${caseName}`);
  const student = (one.students ?? []).find((s) => s.name === studentName);
  if (student === undefined) throw new Error(`No student ${studentName} on ${caseName}`);
  if (process.env.ANTHROPIC_API_KEY === undefined) process.loadEnvFile(join(root, ".env"));
  const client = new Anthropic();
  const started = Date.now();
  const usage = { input: 0, output: 0 };
  // Her real board: her steps so far, and every act of hers after.
  const board = await played(one.board, one.steps);
  const herSteps: Step[] = [...one.steps];
  const lesson = await lessonOf(one.board);
  const turns: (JugnuTurn | HerTurn)[] = [
    {
      who: "her",
      given: "",
      thinking: [],
      did: [],
      says: one.asks,
      stepsSoFar: [...herSteps],
      isRight: false,
    },
  ];

  /** Reads a run's messages: each thought, and the final words. */
  const read = async (
    runner: AsyncIterable<Anthropic.Beta.BetaMessage> & {
      done(): Promise<Anthropic.Beta.BetaMessage>;
    },
  ) => {
    const thinking: string[] = [];
    for await (const message of runner) {
      usage.input += message.usage.input_tokens;
      usage.output += message.usage.output_tokens;
      for (const b of message.content)
        if (b.type === "thinking" && b.thinking !== "") thinking.push(b.thinking);
    }
    const final = await runner.done();
    return {
      thinking,
      text: final.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n"),
    };
  };

  for (let turn = 0; turn < MAX_TURNS && !isRightOf(board); turn++) {
    // ---- Jugnu: her board as it is now; tries on copies of it ----
    const state = JSON.parse(JSON.stringify(board.state()));
    const tries: JugnuTurn["tries"] = [];
    const tryTool = betaTool({
      name: "try",
      description:
        "Plays steps on a copy of her board as it is now (her board never moves) and says what changed and how her questions stand. Steps are what a finger does: {prop, action, args}. From where she is now (default), or from the board's start.",
      inputSchema: {
        type: "object",
        properties: { steps: stepsSchema, from: { type: "string", enum: ["now", "start"] } },
        required: ["steps"],
      },
      run: async ({ steps, from }) => {
        const copy =
          from === "start" ? await played(one.board, []) : await restored(one.board, state);
        const before = seen(copy);
        try {
          for (const step of steps as Step[]) {
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
        tries.push({ steps: steps as Step[], from: from === "start" ? "start" : "now", saw });
        return JSON.stringify(saw);
      },
    });
    const jugnuGiven = givenToJugnu(board, herSteps, turns);
    const jugnuRun = await read(
      client.beta.messages.toolRunner({
        model: MODEL,
        max_tokens: 4000,
        output_config: { effort: "low" },
        thinking: { type: "adaptive", display: "summarized" },
        system: [
          { type: "text", text: JUGNU },
          {
            type: "text",
            text: `The lesson, as its boards teach it:\n\n${lesson}`,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: [tryTool],
        messages: [
          {
            role: "user",
            content: jugnuGiven,
          },
        ],
      }),
    );
    const j = jsonOf(jugnuRun.text);
    turns.push({
      who: "jugnu",
      given: jugnuGiven,
      thinking: jugnuRun.thinking,
      tries,
      diagnosis: String(j.diagnosis ?? ""),
      says: String(j.says ?? jugnuRun.text),
      choices: Array.isArray(j.choices) ? j.choices.map(String) : [],
      glow: typeof j.glow === "string" ? j.glow : null,
      isGlowOnList: typeof j.glow !== "string" || partsOf(board).includes(j.glow),
    });

    // ---- Her: her real board; what she does on it really happens ----
    const did: Step[] = [];
    const actTool = betaTool({
      name: "act",
      description:
        "Does steps on your board, as your finger would ({prop, action, args}; the actions the board's pieces can do), and says what you then see.",
      inputSchema: { type: "object", properties: { steps: stepsSchema }, required: ["steps"] },
      run: async ({ steps }) => {
        const before = seen(board);
        try {
          for (const step of steps as Step[]) {
            await board.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
            board.settle();
            did.push(step);
            herSteps.push(step);
          }
        } catch (error) {
          return `That can't be done: ${error instanceof Error ? error.message : String(error)}`;
        }
        return JSON.stringify({
          changed: changes(before, seen(board)),
          questions: (seen(board) as { questions: unknown }).questions,
        });
      },
    });
    const herGiven = givenToHer(board, herSteps, turns);
    const herRun = await read(
      client.beta.messages.toolRunner({
        model: STUDENT_MODEL,
        max_tokens: 3000,
        output_config: { effort: "low" },
        thinking: { type: "adaptive", display: "summarized" },
        system: STUDENT(student.believes),
        tools: [actTool],
        messages: [
          {
            role: "user",
            content: herGiven,
          },
        ],
      }),
    );
    const h = jsonOf(herRun.text);
    const choice = typeof h.choice === "string" && h.choice !== "null" ? h.choice : null;
    turns.push({
      who: "her",
      given: herGiven,
      thinking: herRun.thinking,
      did,
      says: choice !== null && String(h.says ?? "") === "" ? choice : String(h.says ?? herRun.text),
      stepsSoFar: [...herSteps],
      isRight: isRightOf(board),
    });
  }
  const isRight = isRightOf(board);
  board.dispose();
  return saveRun({
    id: runId(caseName, studentName),
    note,
    case: one,
    student,
    models: { jugnu: MODEL, student: STUDENT_MODEL },
    instructions: { jugnu: JUGNU, student: STUDENT(student.believes) },
    turns,
    isRight,
    usage: { ms: Date.now() - started, ...usage },
  });
}

/** Where every experiment is kept, to be opened again in the preview (?dev&jugnu). */
export const RUNS = join(root, "platform/studio/node_modules/.cache/jugnu-runs");

/** An experiment's name: when it ran, the case and the child. */
export const runId = (caseName: string, studentName: string, at = new Date()): string =>
  `${at.toISOString().slice(0, 16).replace(/[:T]/g, "-")}-${caseName}-${studentName}`;

/** Keeps an experiment, and gives it back. */
export function saveRun(run: Dialogue): Dialogue {
  mkdirSync(RUNS, { recursive: true });
  writeFileSync(join(RUNS, `${run.id}.json`), `${JSON.stringify(run, null, 1)}\n`);
  return run;
}

/** Every experiment kept, newest first: its name, note and how it ended. */
export function listRuns(): { id: string; note: string; isRight: boolean; turns: number }[] {
  if (!existsSync(RUNS)) return [];
  return readdirSync(RUNS)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse()
    .map((f) => {
      const run = JSON.parse(readFileSync(join(RUNS, f), "utf8")) as Dialogue;
      return { id: run.id, note: run.note, isRight: run.isRight, turns: run.turns.length };
    });
}

/** One experiment, as kept. */
export function readRun(id: string): Dialogue {
  return JSON.parse(readFileSync(join(RUNS, `${id}.json`), "utf8")) as Dialogue;
}
