import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Actor } from "@chalk/content";
import type { BoardRuntime } from "@chalk/player";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { type Request, type ToolSpec, runTurn } from "./agent";
import { type Case, type Step, played, readCases, restored } from "./cases";
import { Provider, modelOf, settingsFrom } from "./model";
import { changes, checkFound, lessonOf, root, seen } from "./sees";

/**
 * Jugnu and a simulated child, back and forth on one real board (platform/docs/plans/jugnu.md).
 * The child holds one genuine misconception (her `believes`, hidden from Jugnu), acts on her real
 * board as it makes her, and answers his questions in her own words. Jugnu sees only what a phone
 * would show him: her board, what she did, what she says. He probes, one small question at a time,
 * to find out why she thinks what she thinks, and helps her fix it herself. It ends when her own
 * Check says right, or she leaves (as a child does, when she has had enough); a guard of MAX_TURNS
 * stops only a run that loops. Once her own is right, she does the case's next question alone, Jugnu
 * gone: that is the run's result. Both sides' thinking is kept, to read.
 */

/** Each side's model, from the environment (model.ts): Jugnu's JUGNU_*, the child's JUGNU_STUDENT_*. */
const DEFAULT_MODEL = { provider: Provider.Anthropic, id: "claude-haiku-5-5" };
const MAX_TURNS = 20;

/** A simulated child: who she is on this case, and what she believes (Jugnu never sees it). */
export type Student = { name: string; believes: string; knows: string };

export type JugnuTurn = {
  who: "jugnu";
  /** Exactly what he was given this turn (beside his instructions and the lesson). */
  given: string;
  thinking: string[];
  tries: { steps: Step[]; from: "now" | "start"; saw: unknown }[];
  /** What he thinks she believes, so far (his note: she never sees it). */
  diagnosis: string;
  /** He hands back: he thinks she has it, and she does the next question alone. */
  isHandBack?: boolean;
  /** Each request of his turn, as it happened (thinking, calls, cache use). */
  requests?: Request[];
  says: string;
  choices: string[];
  glow: string | null;
  /** What the part he glows shows (what she sees light up). */
  glowShows?: unknown;
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
  /** She has had enough, and leaves. */
  isLeaving?: boolean;
  /** The next question, done alone (on its own board): the run's result. */
  transfer?: { board: string };
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
  /** The lesson as Jugnu was given it. */
  lesson: string;
  turns: (JugnuTurn | HerTurn)[];
  isRight: boolean;
  /** The next question, done alone after hers was right: right or not; null when not reached. */
  transfer: { board: string; isRight: boolean } | null;
  /** She left before getting it. */
  isLeft: boolean;
  /** Input counted apart: new (uncached), read from the cache, written to it. */
  usage: { ms: number; input: number; cacheRead?: number; cacheWrite?: number; output: number };
};

export const JUGNU = `You are Jugnu, a warm firefly who helps a child stuck on a board of her lesson. You talk with her in turns, like a tutor at her elbow.

- Never explain first. Open by asking how she got her answer. Ask openly, never with choices.
- When she asks you something, answer it first, in one sentence.
- Find out why she thinks what she thinks. What her board's check found is a first guess, not her thinking: her own words and her board are the evidence.
- Don't read her board for her: how she reads it is often the mistake itself. Ask her to say what she sees and what it means; her reading is the evidence.
- Her board is the truth. Once she has said her reading, and it disagrees with her board, have her look at one against the other, rather than telling her she is wrong.
- Make it smaller: a simpler case she can do on her board, or answer in words when her board can't show it; build up from there to her question. Read what her board shows after each.
- Mistakes are of two kinds. About an agreed way (how something is written or named): say plainly that it is the agreed way, once, then let her use it. About an idea: let a small case show it; don't just tell it.
- Recall the lesson once; after that, only if she asks.
- If what you did didn't change what she does, do something different. Never say the same thing twice.
- Never give the answer: not where things end up on her board, nor the steps to get there, for her question or a smaller one.
- Everything you say about her board must be true. Her board is in your message. If you want to see what some steps would do, you can try them on a copy. Her buttons are in her board's bar, each with the step that presses it; never name one that isn't there.
- Glow the one part you are talking about.
- Each message: one question or one thing to do, about 15 to 30 words, in English, warm. A tiny praise when she gets something right ("Yes!"), then move on. End with what she does next, then wait.

To speak to her, call reply: your words to her (you talk to her, as "you"); the one part of her board to light up while you say it (its address, exactly as listed in her board's parts), if any; your note, what you believe about her now (she never sees it; write "not sure yet: …" only while it really is open); and whether you hand back, when you think she has understood and can do the next question alone. Calling reply ends your turn: then you wait for her.`;

export const STUDENT = (
  believes: string,
  knows: string,
  grade: string,
) => `You are a ${grade} student in India, doing a lesson on your phone. You are stuck, and you are talking with Jugnu, the app's tutor.

What you believe (you don't know it is wrong, and you believe it firmly): ${believes}

That one belief is your only mistake. What else you know: ${knows} Don't invent other confusions, and don't invent where your belief comes from (a book, a teacher): you just believe it.

- Act and answer exactly as someone with that one belief would. Don't guess what the tutor wants.
- Answer briefly, like a real student your age: a few words, in English.
- Touch the board only when he asks you to, or when you think you've got it right. When he asks, do exactly what he asks with the act tool, the way your belief tells you, and nothing more. Never say you did something on the board unless you did it with the act tool.
- Like a real student, when he tells you a rule from your lesson and asks you to do one step by it, you do that step by the rule, even if you're unsure why. But your belief still feels right to you: where you must decide by yourself (a new step, a new question), you go by your belief, until doing things yourself shows you it doesn't fit; then change it, as a real student would.
- Your buttons are in your board's bar, each with the step that presses it. When you think you've got it right, do it on your board and press its Check (Try again first, if your answer is waiting after a wrong check).
- You are a real child with real patience: if you have had enough (bored, frustrated, or you feel done), say so in your own words and leave.

Answer as JSON: {"says": "...", "choice": "the choice you picked, or null", "leaves": true only when you leave}.`;

const stepsSchema = z.array(
  z.object({
    prop: z.string(),
    action: z.string(),
    args: z.record(z.unknown()).optional(),
  }),
);

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

/** With JUGNU_LOG set: each request and tool call as it happens, timed (to see where a run spends its time). */
const logStart = Date.now();
const log = (line: string): void => {
  if (process.env.JUGNU_LOG !== undefined)
    process.stderr.write(`[${((Date.now() - logStart) / 1000).toFixed(1)} s] ${line}\n`);
};

/** The conversation so far, as each side reads it. */
function talk(turns: readonly (JugnuTurn | HerTurn)[], to: "jugnu" | "her"): string {
  return turns
    .map((t) =>
      t.who === "jugnu"
        ? `Jugnu: ${t.says}${t.choices.length > 0 ? `  [choices: ${t.choices.join(" | ")}]` : ""}${
            to === "her" && t.glow !== null && t.isGlowOnList
              ? `  (on your board he lights up ${t.glow}${t.glowShows === undefined ? "" : `, showing ${JSON.stringify(t.glowShows)}`})`
              : ""
          }`
        : `${to === "her" ? "You" : "She"}: ${t.says}${t.did.length > 0 ? `  (did on the board: ${JSON.stringify(t.did)})` : ""}`,
    )
    .join("\n");
}

/** Her class, from the board's book ("class9-maths/…" → "class 9"). */
const gradeOf = (board: string): string => {
  const n = /^class(\d+)/.exec(board)?.[1];
  return n === undefined ? "school" : `class ${n}`;
};

/** A board's question as she reads it (its prompt). */
const promptOf = (board: BoardRuntime): string =>
  String(partsOf(board).find((p) => p.part.endsWith("/prompt"))?.value ?? "");

/** Every part's address on her board as she sees it: what a glow may name. */
const partsOf = (board: BoardRuntime): { part: string; value?: unknown }[] =>
  (seen(board) as { pieces: { parts: { part: string; value?: unknown }[] }[] }).pieces.flatMap(
    (p) => p.parts,
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
    `What her board's check found (she doesn't see it): ${JSON.stringify(checkFound(board))}`,
    `Your talk so far:\n${talk(turns, "jugnu")}`,
    "Your turn.",
  ].join("\n\n");

/**
 * Her turn, as Jugnu reads it in his conversation (his reply's result): what she said, what she did
 * on her board and what it changed, what her check found if she checked, and her board as it now is.
 * Made once and kept: the conversation is only ever appended to.
 */
export const herTurnForJugnu = (
  board: BoardRuntime,
  before: unknown,
  her: { says: string; did: readonly Step[]; isLeaving?: boolean },
): string =>
  [
    `She says: ${her.says}`,
    her.did.length === 0
      ? "She did nothing on her board."
      : `She did on her board, in order: ${JSON.stringify(her.did)}\nWhat it changed: ${JSON.stringify(changes(before, seen(board)))}`,
    ...(her.did.some((d) => d.action === "check")
      ? [`What her board's check found (she doesn't see it): ${JSON.stringify(checkFound(board))}`]
      : []),
    `Her board, as she sees it now:\n${JSON.stringify(seen(board), null, 1)}`,
  ].join("\n\n");

/**
 * What she is given on a turn: her board now, what she did, the talk so far. On a new board (the
 * next question, alone) what she is asked comes first, as a new question is the first thing seen.
 */
export const givenToHer = (
  board: BoardRuntime,
  herSteps: readonly Step[],
  turns: readonly (JugnuTurn | HerTurn)[],
  ask = "Your turn: answer Jugnu.",
  isNewBoard = false,
): string =>
  [
    ...(isNewBoard ? [ask] : []),
    `Your board, as you see it now:\n${JSON.stringify(seen(board), null, 1)}`,
    `What you have done on it so far: ${JSON.stringify(herSteps)}`,
    `Your talk with Jugnu so far:\n${talk(turns, "her")}`,
    ...(isNewBoard ? [] : [ask]),
  ].join("\n\n");

/** Where a copy stands: each part showing a value, by its address; and her bar. */
const standing = (view: unknown) => {
  const v = view as { pieces: { parts: { part: string; value?: unknown }[] }[]; bar: unknown };
  return {
    parts: Object.fromEntries(
      v.pieces.flatMap((p) => p.parts.filter((x) => "value" in x).map((x) => [x.part, x.value])),
    ),
    bar: v.bar,
  };
};

/**
 * Jugnu's `try`: stateless. Each call makes a new copy of her board as it is now (or as it starts),
 * plays the steps in order, says where the copy ends up and what changed, and throws it away.
 * Nothing carries over between calls; her board never moves.
 */
export function tryOn(
  boardPath: string,
  /** Her board's state, or how to read it when a try is made (one try for a whole conversation). */
  state: unknown,
  /** Where tries are recorded, or how to find the current turn's record. */
  tries: JugnuTurn["tries"] | (() => JugnuTurn["tries"]),
): ToolSpec {
  const stateNow = () => (typeof state === "function" ? (state as () => unknown)() : state);
  const record = () => (typeof tries === "function" ? tries() : tries);
  return {
    description:
      'Tries steps on a copy of her board, never on her board. Each try makes a NEW copy of her board as it is now (or, with from: "start", as the board starts), plays your steps on it in order, tells you where the copy ends up and what changed, then throws the copy away. Nothing carries over between tries: to see further, send all the steps again, in one try. Steps are what a finger does: {prop, action, args}.',
    input: z.object({ steps: stepsSchema, from: z.enum(["now", "start"]).optional() }),
    run: async (input) => {
      const { steps, from } = input as { steps?: Step[]; from?: "now" | "start" };
      log(`Jugnu tries: ${JSON.stringify(steps)}`);
      const copy =
        from === "start"
          ? await played(boardPath, [])
          : await restored(boardPath, stateNow() as never);
      const before = seen(copy);
      const done: Step[] = [];
      try {
        for (const step of (steps ?? []) as Step[]) {
          await copy.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
          copy.settle();
          done.push(step);
        }
      } catch (error) {
        copy.dispose();
        return `Step ${done.length + 1} can't be done: ${error instanceof Error ? error.message : String(error)}`;
      }
      const after = seen(copy);
      copy.dispose();
      const saw = {
        played: `${done.length} step${done.length === 1 ? "" : "s"}, on a new copy of her board ${from === "start" ? "as it starts" : "as it is now"}`,
        endsAt: standing(after),
        changed: changes(before, after),
        questions: (after as { questions: unknown }).questions,
      };
      record().push({ steps: done, from: from === "start" ? "start" : "now", saw });
      return JSON.stringify(saw);
    },
  };
}

/** Jugnu's `reply`: his one message to her; calling it ends his turn. */
export const REPLY_TOOL: ToolSpec = {
  description:
    "Speak to her: your words, the one part of her board to light up while you say them (its address as listed in her board's parts), your note (what you believe about her now; she never sees it), and whether you hand back (she has understood and does the next question alone). This ends your turn.",
  input: z.object({
    says: z.string(),
    glow: z.string().nullable().optional(),
    note: z.string(),
    isHandBack: z.boolean().optional(),
  }),
};

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
  process.loadEnvFile(join(root, ".env"));
  const jugnu = modelOf(settingsFrom("JUGNU", DEFAULT_MODEL));
  const child = modelOf(settingsFrom("JUGNU_STUDENT", DEFAULT_MODEL));
  const started = Date.now();
  const usage = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 };
  const count = (r: Request) => {
    log(
      `request: ${r.finish}, ${r.calls.map((c) => c.name).join(",") || "words"}, ${r.usage.uncached ?? "?"} new in, ${r.usage.cacheRead ?? "?"} cached, ${r.usage.output ?? "?"} out, ${r.ms} ms`,
    );
    usage.input += r.usage.uncached ?? 0;
    usage.cacheRead += r.usage.cacheRead ?? 0;
    usage.cacheWrite += r.usage.cacheWrite ?? 0;
    usage.output += r.usage.output ?? 0;
  };
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

  /** One turn of hers on a board: what she does on it really happens there. */
  const herTurn = async (on: BoardRuntime, steps: Step[], ask?: string, isNewBoard = false) => {
    const did: Step[] = [];
    const act: ToolSpec = {
      description:
        "Does steps on your board, as your finger would ({prop, action, args}; the actions the board's pieces can do), and says what you then see.",
      input: z.object({ steps: stepsSchema }),
      run: async (input) => {
        const acts = (input as { steps: Step[] }).steps;
        const before = seen(on);
        try {
          for (const step of acts as Step[]) {
            await on.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
            on.settle();
            did.push(step);
            steps.push(step);
          }
        } catch (error) {
          return `That can't be done: ${error instanceof Error ? error.message : String(error)}`;
        }
        return JSON.stringify({
          changed: changes(before, seen(on)),
          questions: (seen(on) as { questions: unknown }).questions,
        });
      },
    };
    const given = givenToHer(on, steps, turns, ask, isNewBoard);
    const turn = await runTurn({
      model: child,
      instructions: [STUDENT(student.believes, student.knows, gradeOf(one.board))],
      messages: [{ role: "user", content: given }],
      tools: { act },
      endsWith: null,
      onRequest: count,
    });
    const text = turn.ended.kind === "text" ? turn.ended.text : "";
    const run = { thinking: turn.requests.flatMap((r) => r.thinking), text };
    const h = jsonOf(text);
    const choice = typeof h.choice === "string" && h.choice !== "null" ? h.choice : null;
    return {
      who: "her" as const,
      given,
      thinking: run.thinking,
      did,
      says: choice !== null && String(h.says ?? "") === "" ? choice : String(h.says ?? run.text),
      ...(h.leaves === true ? { isLeaving: true } : {}),
    };
  };

  let isHandedBack = false;
  // Jugnu's one conversation: his whole time with her, only ever appended to (jugnu-agent.md).
  const firstGiven = givenToJugnu(board, herSteps, turns);
  const messages: ModelMessage[] = [{ role: "user", content: firstGiven }];
  let given = firstGiven;
  let tries: JugnuTurn["tries"] = [];
  const tryTool = tryOn(
    one.board,
    () => JSON.parse(JSON.stringify(board.state())),
    () => tries,
  );
  for (let turn = 0; turn < MAX_TURNS && !isHandedBack; turn++) {
    // ---- Jugnu: tries on copies of her board as it is; he ends by calling reply ----
    tries = [];
    const his = await runTurn({
      model: jugnu,
      instructions: [JUGNU, `The lesson, as its boards teach it:\n\n${lesson}`],
      messages,
      tools: { reply: REPLY_TOOL, try: tryTool },
      endsWith: "reply",
      onRequest: count,
    });
    const r = (his.ended.kind === "tool" ? his.ended.input : { says: his.ended.text }) as {
      says?: string;
      glow?: string | null;
      note?: string;
      isHandBack?: boolean;
    };
    const glow = typeof r.glow === "string" && r.glow !== "" ? r.glow : null;
    isHandedBack = r.isHandBack === true;
    turns.push({
      who: "jugnu",
      given,
      thinking: his.requests.flatMap((q) => q.thinking),
      tries,
      diagnosis: String(r.note ?? ""),
      says: String(r.says ?? ""),
      choices: [],
      glow,
      isGlowOnList: glow === null || partsOf(board).some((p) => p.part === glow),
      ...(glow !== null && partsOf(board).some((p) => p.part === glow && "value" in p)
        ? { glowShows: partsOf(board).find((p) => p.part === glow)?.value }
        : {}),
      ...(isHandedBack ? { isHandBack: true } : {}),
      requests: his.requests,
    });
    if (isHandedBack) break;

    // ---- Her: her real board; what she does on it really happens ----
    const before = seen(board);
    const her = await herTurn(board, herSteps);
    turns.push({ ...her, stepsSoFar: [...herSteps], isRight: isRightOf(board) });
    if (her.isLeaving === true) break;
    // Her turn reaches him as his reply's result (or, if he answered in plain words, as a message).
    given = herTurnForJugnu(board, before, her);
    if (his.ended.kind === "tool")
      messages.push({
        role: "tool",
        content: [
          ...his.owed,
          {
            type: "tool-result",
            toolCallId: his.ended.id,
            toolName: his.ended.name,
            output: { type: "text", value: given },
          },
        ],
      });
    else messages.push({ role: "user", content: given });
  }
  // ---- The next question, alone: Jugnu has gone ----
  let transfer: Dialogue["transfer"] = null;
  if (isHandedBack && one.next !== undefined) {
    const next = await played(one.next, []);
    const nextSteps: Step[] = [];
    const alone = await herTurn(
      next,
      nextSteps,
      `Jugnu has gone. A new board, the next question of your lesson: ${promptOf(next)}. Do it by yourself, as you now think it is done, then press Check.`,
      true,
    );
    transfer = { board: one.next, isRight: isRightOf(next) };
    turns.push({
      ...alone,
      stepsSoFar: [...nextSteps],
      isRight: transfer.isRight,
      transfer: { board: one.next },
    });
    next.dispose();
  }
  const isRight = isRightOf(board);
  board.dispose();
  return saveRun({
    id: runId(caseName, studentName),
    note,
    case: one,
    student,
    models: { jugnu: jugnu.name, student: child.name },
    instructions: {
      jugnu: JUGNU,
      student: STUDENT(student.believes, student.knows, gradeOf(one.board)),
    },
    lesson,
    turns,
    isRight,
    transfer,
    isLeft: turns.some((t) => t.who === "her" && t.isLeaving === true),
    usage: { ms: Date.now() - started, ...usage },
  });
}

/** Where every experiment is kept, to be opened again in the preview (?dev&jugnu). */
export const RUNS = join(root, "platform/studio/node_modules/.cache/jugnu-runs");

/** An experiment's name: when it ran, the case and the child. */
export const runId = (caseName: string, studentName: string, at = new Date()): string =>
  `${at.toISOString().slice(0, 19).replace(/[:T]/g, "-")}-${caseName}-${studentName}`;

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
