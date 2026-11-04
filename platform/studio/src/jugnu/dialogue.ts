import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Actor } from "@chalk/content";
import type { BoardRuntime } from "@chalk/player";
import type { ModelMessage } from "ai";
import { z } from "zod";
import { type Request, type ToolSpec, log, runTurn } from "./agent";
import { type Case, type Step, played, readCases } from "./cases";
import { type JugnuTry, firstTurn, jugnuTurn, laterTurn, newConversation, partsOf } from "./jugnu";
import { Provider, modelOf, settingsFrom } from "./model";
import { type Prompt, Seat, promptOf } from "./prompts";
import { changes, lessonOf, root, seen } from "./sees";

/**
 * The sandbox (platform/docs/plans/jugnu-sandbox.md): Jugnu (jugnu.ts, the one production uses) and a
 * simulated child, back and forth on one real board. This file only drives him: the child's seat,
 * the run's record, and its storage. (platform/docs/plans/jugnu.md)
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
  tries: JugnuTry[];
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
  /** Both sides' instructions, as they ran (their texts, slots filled). */
  instructions: { jugnu: string; student: string };
  /** Which prompt each seat ran: its file's name and the hash of its words. */
  prompts?: { tutor: { name: string; hash: string }; student: { name: string; hash: string } };
  /** It broke: what went wrong (the run keeps what it had). */
  error?: string;
  /** The lesson as Jugnu was given it. */
  lesson: string;
  turns: (JugnuTurn | HerTurn)[];
  isRight: boolean;
  /** The next question, done alone after hers was right: right or not; null when not reached. */
  transfer: { board: string; isRight: boolean } | null;
  /** She left before getting it. */
  isLeft: boolean;
  /** Done (false while it is still going, or if it was cut off). */
  isFinished?: boolean;
  /** Input counted apart: new (uncached), read from the cache, written to it. */
  usage: { ms: number; input: number; cacheRead?: number; cacheWrite?: number; output: number };
};

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
const questionOf = (board: BoardRuntime): string =>
  String(partsOf(board).find((p) => p.part.endsWith("/prompt"))?.value ?? "");

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

/** Each seat's prompt version, by configuration (`JUGNU_PROMPT`, `JUGNU_STUDENT_PROMPT`). */
const promptName = (prefix: string): string => {
  const name = process.env[`${prefix}_PROMPT`];
  return name === undefined || name === "" ? "baseline" : name;
};

/**
 * Starts a run: it is named and kept at once (its id comes back straight away), and goes on by
 * itself, kept after every turn, so it is watched by its id.
 */
export function startDialogue(caseName: string, studentName: string, note = ""): string {
  const id = runId(caseName, studentName);
  void runDialogue(caseName, studentName, note, id).catch(() => {});
  return id;
}

/** One case, one simulated child: their whole conversation. */
export async function runDialogue(
  caseName: string,
  studentName: string,
  note = "",
  id = runId(caseName, studentName),
): Promise<Dialogue> {
  const one = readCases().find((c) => c.name === caseName);
  if (one === undefined) throw new Error(`No case ${caseName}`);
  const student = (one.students ?? []).find((s) => s.name === studentName);
  if (student === undefined) throw new Error(`No student ${studentName} on ${caseName}`);
  process.loadEnvFile(join(root, ".env"));
  const jugnu = modelOf(settingsFrom("JUGNU", DEFAULT_MODEL));
  const child = modelOf(settingsFrom("JUGNU_STUDENT", DEFAULT_MODEL));
  const tutorPrompt: Prompt = promptOf(Seat.Tutor, promptName("JUGNU"));
  const studentPrompt: Prompt = promptOf(Seat.Student, promptName("JUGNU_STUDENT"), {
    grade: gradeOf(one.board),
    believes: student.believes,
    knows: student.knows,
  });
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
  let isHandedBack = false;
  let transfer: Dialogue["transfer"] = null;
  let error: string | undefined;
  /** The run as it stands, kept (after every turn: a run is watched while it goes, and a cut-off one keeps what it had). */
  const snapshot = (isFinished: boolean): Dialogue =>
    saveRun({
      id,
      note,
      case: one,
      student,
      models: { jugnu: jugnu.name, student: child.name },
      instructions: { jugnu: tutorPrompt.text, student: studentPrompt.text },
      prompts: {
        tutor: { name: tutorPrompt.name, hash: tutorPrompt.hash },
        student: { name: studentPrompt.name, hash: studentPrompt.hash },
      },
      lesson,
      turns,
      isRight: isRightOf(board),
      transfer,
      isLeft: turns.some((t) => t.who === "her" && t.isLeaving === true),
      isFinished,
      ...(error === undefined ? {} : { error }),
      usage: { ms: Date.now() - started, ...usage },
    });
  snapshot(false);

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
          for (const step of acts) {
            await on.call(step.prop, step.action, step.args ?? {}, Actor.Learner);
            on.settle();
            did.push(step);
            steps.push(step);
          }
        } catch (e) {
          return `That can't be done: ${e instanceof Error ? e.message : String(e)}`;
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
      instructions: [studentPrompt.text],
      messages: [{ role: "user", content: given }],
      tools: { act },
      endsWith: null,
      onRequest: count,
    });
    const text = turn.ended.kind === "text" ? turn.ended.text : "";
    const h = jsonOf(text);
    const choice = typeof h.choice === "string" && h.choice !== "null" ? h.choice : null;
    return {
      who: "her" as const,
      given,
      thinking: turn.requests.flatMap((r) => r.thinking),
      did,
      says: choice !== null && String(h.says ?? "") === "" ? choice : String(h.says ?? text),
      ...(h.leaves === true ? { isLeaving: true } : {}),
    };
  };

  try {
    // Jugnu (jugnu.ts): one conversation for the whole time she is stuck.
    const conversation = newConversation();
    let studentTurn = firstTurn(board, herSteps, one.asks);
    for (let turn = 0; turn < MAX_TURNS && !isHandedBack; turn++) {
      const his = await jugnuTurn({
        conversation,
        model: jugnu,
        prompt: tutorPrompt,
        lesson,
        boardPath: one.board,
        board,
        studentTurn,
        onRequest: count,
      });
      isHandedBack = his.isHandBack;
      const glow = his.glow;
      turns.push({
        who: "jugnu",
        given: his.given,
        thinking: his.thinking,
        tries: his.tries,
        diagnosis: his.note,
        says: his.says,
        choices: [],
        glow,
        isGlowOnList: glow === null || partsOf(board).some((p) => p.part === glow),
        ...(glow !== null && partsOf(board).some((p) => p.part === glow && "value" in p)
          ? { glowShows: partsOf(board).find((p) => p.part === glow)?.value }
          : {}),
        ...(isHandedBack ? { isHandBack: true } : {}),
        requests: his.requests,
      });
      snapshot(false);
      if (isHandedBack) break;

      // ---- Her: her real board; what she does on it really happens ----
      const before = seen(board);
      const her = await herTurn(board, herSteps);
      turns.push({ ...her, stepsSoFar: [...herSteps], isRight: isRightOf(board) });
      snapshot(false);
      if (her.isLeaving === true) break;
      studentTurn = laterTurn(board, before, her);
    }
    // ---- The next question, alone: Jugnu has gone ----
    if (isHandedBack && one.next !== undefined) {
      const next = await played(one.next, []);
      const nextSteps: Step[] = [];
      const alone = await herTurn(
        next,
        nextSteps,
        `Jugnu has gone. A new board, the next question of your lesson: ${questionOf(next)}. Do it by yourself, as you now think it is done, then press Check.`,
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
  } catch (e) {
    error = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    log(`run broke: ${error}`);
  }
  const done = snapshot(true);
  board.dispose();
  return done;
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
