import type { JugnuStep, JugnuTurn } from "@chalk/jugnu";
import type { EvalCase } from "./cases";
import type { TurnRecord } from "./run";

/** The checks a script can do on its own. Maths, kindness and teaching need the judge or a person. */
export const CheckName = {
  /** Every turn got words or an action from him (not his "sorry, ask again"). */
  Answered: "answered",
  /** No reply said what the case says gives the answer away. */
  NoLeak: "noLeak",
  /** Some reply said the fact the case expects. */
  SaysFact: "saysFact",
  /** Acted, or didn't, as the case expects. */
  Acts: "acts",
  /** Took none of the actions the case says would show the answer. */
  NotDo: "notDo",
  /** Used the calculator when a number had to be worked out. */
  Calculates: "calculates",
  /** Handed the board back to the student. */
  /** Pointed at what the case expects (or didn't point, if it expects none). */
  Points: "points",
  /** The board ended as the case says (his showing left it right). */
  BoardAfter: "boardAfter",
  /**
   * Never did the student's part: answered the question, moved the board on, put a goal question
   * into its answer, or showed an action the board leaves to the student.
   */
  HoldsLine: "holdsLine",
  /** Nothing he tried was refused (wrong arguments, a tool that isn't there, a limit). */
  NoRefusals: "noRefusals",
  /** Looked ahead with `try` on what the case expects. */
  Tries: "tries",
  /** Showed on the board what the case expects. */
  Shows: "shows",
  /** Tried everything he showed before showing it. */
  TriesFirst: "triesFirst",
  /** Ended his turn as the case expects (options to tap, or the board handed back). */
  Ends: "ends",
  /** Every reply short enough. */
  Short: "short",
  /** In the student's language. */
  Language: "language",
} as const;
export type CheckName = (typeof CheckName)[keyof typeof CheckName];

export type CheckResult = { name: CheckName; isPassed: boolean; detail: string };

const DEFAULT_MAX_WORDS = 30;

/** Share of letters that are Devanagari (0 to 1). */
export function devanagariShare(text: string): number {
  const letters = [...text].filter((ch) => /\p{L}/u.test(ch));
  if (letters.length === 0) return 0;
  return letters.filter((ch) => /\p{Script=Devanagari}/u.test(ch)).length / letters.length;
}

const words = (text: string) => text.split(/\s+/).filter((w) => w.length > 0).length;

/** Refusals that mean he tried to do the student's part. */
const STUDENTS_PART = /only the student answers|moves the board on|board itself/;

const refusalOf = (step: JugnuStep): string | undefined =>
  "refused" in step ? step.refused : undefined;

const jugnuTurns = (turns: readonly TurnRecord[]): JugnuTurn[] =>
  turns.flatMap((t) => (t.kind === "student" ? [] : [t.turn]));

export function runChecks(
  testCase: EvalCase,
  turns: readonly TurnRecord[],
  conditions: readonly { expression: string; holds: boolean | string }[] = [],
): CheckResult[] {
  const out: CheckResult[] = [];
  const his = jugnuTurns(turns);
  const replies = his.map((turn) => turn.reply).filter((reply) => reply !== "");
  const all = replies.join("\n");
  const steps = his.flatMap((turn) => turn.events.filter((e): e is JugnuStep => e.kind !== "say"));
  const acts = steps.filter(
    (s): s is JugnuStep & { kind: "act" } => s.kind === "act" && s.refused === undefined,
  );
  const fallbacks = his.filter((turn) => turn.isFallback).length;
  out.push({
    name: CheckName.Answered,
    isPassed: fallbacks === 0,
    detail: fallbacks === 0 ? "ok" : `${fallbacks} turn(s) with nothing said or done`,
  });
  const { expect } = testCase;
  if (expect.notSay !== undefined) {
    const hit = expect.notSay.find((p) => new RegExp(p, "iu").test(all));
    out.push({
      name: CheckName.NoLeak,
      isPassed: hit === undefined,
      detail: hit === undefined ? "ok" : `said /${hit}/`,
    });
  }
  if (expect.say !== undefined) {
    const hit = expect.say.find((p) => new RegExp(p, "iu").test(all));
    out.push({
      name: CheckName.SaysFact,
      isPassed: hit !== undefined,
      detail: hit === undefined ? `none of ${expect.say.map((p) => `/${p}/`).join(", ")}` : "ok",
    });
  }
  const did = acts.map((a) => `${a.prop}.${a.action}`);
  if (expect.act !== undefined) {
    out.push({
      name: CheckName.Acts,
      isPassed: acts.length > 0 === expect.act,
      detail: acts.length > 0 ? `did ${did.join(", ")}` : "did nothing",
    });
  }
  if (expect.notDo !== undefined) {
    const done = did.filter((call) => expect.notDo?.includes(call));
    out.push({
      name: CheckName.NotDo,
      isPassed: done.length === 0,
      detail: done.length === 0 ? "ok" : `did ${done.join(", ")}`,
    });
  }
  if (expect.calculates !== undefined) {
    const used = steps.some((s) => s.kind === "calculate");
    out.push({
      name: CheckName.Calculates,
      isPassed: used === expect.calculates,
      detail: used ? "used the calculator" : "never used the calculator",
    });
  }
  if (expect.points !== undefined) {
    const pointed = steps.flatMap((s) =>
      s.kind === "point" && s.refused === undefined
        ? [s.part === undefined ? s.prop : `${s.prop}.${s.part}`]
        : [],
    );
    const wanted = expect.points;
    const isPassed =
      wanted.length === 0
        ? pointed.length === 0
        : pointed.some((p) =>
            wanted.some((w) => p === w || (!w.includes(".") && p.startsWith(`${w}.`))),
          );
    out.push({
      name: CheckName.Points,
      isPassed,
      detail: pointed.length === 0 ? "never pointed" : `pointed at ${pointed.join(", ")}`,
    });
  }
  if (expect.boardAfter !== undefined) {
    const broken = conditions.filter((c) => c.holds !== true);
    out.push({
      name: CheckName.BoardAfter,
      isPassed: broken.length === 0,
      detail:
        broken.length === 0
          ? "ok"
          : broken
              .map(
                (c) =>
                  `${c.expression}${typeof c.holds === "string" ? ` (${c.holds})` : " is false"}`,
              )
              .join(" | "),
    });
  }
  const overreach = [
    ...steps
      .filter((s) => STUDENTS_PART.test(refusalOf(s) ?? ""))
      .map((s) => (s.kind === "act" ? `${s.prop}.${s.action}` : s.kind)),
    ...turns.flatMap((t) => (t.kind === "ask" ? t.overreach : [])),
  ];
  out.push({
    name: CheckName.HoldsLine,
    isPassed: overreach.length === 0,
    detail: overreach.length === 0 ? "ok" : overreach.join(", "),
  });
  const refused = steps.flatMap((s) => {
    const why = refusalOf(s);
    return why === undefined ? [] : [why];
  });
  out.push({
    name: CheckName.NoRefusals,
    isPassed: refused.length === 0,
    detail: refused.length === 0 ? "ok" : refused.join(" | "),
  });
  const matches = (call: string, wanted: readonly string[]) =>
    wanted.some((w) => call === w || (!w.includes(".") && call.startsWith(`${w}.`)));
  const tried = steps.flatMap((s) => (s.kind === "try" ? s.calls.map((c) => c.call) : []));
  const shown = his.flatMap((turn) =>
    turn.cues.flatMap((cue) => (cue.kind === "act" ? [`${cue.prop}.${cue.action}`] : [])),
  );
  if (expect.tries !== undefined) {
    const wanted = expect.tries;
    const hit = tried.filter((call) => matches(call, wanted));
    out.push({
      name: CheckName.Tries,
      isPassed: hit.length > 0,
      detail:
        tried.length === 0 ? "never tried anything" : `tried ${[...new Set(tried)].join(", ")}`,
    });
  }
  if (expect.shows !== undefined) {
    const wanted = expect.shows;
    const hit = shown.filter((call) => matches(call, wanted));
    out.push({
      name: CheckName.Shows,
      isPassed: hit.length > 0,
      detail: shown.length === 0 ? "showed nothing" : `showed ${shown.join(", ")}`,
    });
  }
  if (expect.triesFirst === true) {
    const unchecked = his.flatMap((turn) => {
      const triedHere = new Set(
        turn.events.flatMap((e) => (e.kind === "try" ? e.calls.map((c) => c.call) : [])),
      );
      return turn.cues.flatMap((cue) =>
        cue.kind === "act" && !triedHere.has(`${cue.prop}.${cue.action}`)
          ? [`${cue.prop}.${cue.action}`]
          : [],
      );
    });
    out.push({
      name: CheckName.TriesFirst,
      isPassed: shown.length > 0 && unchecked.length === 0,
      detail:
        shown.length === 0
          ? "showed nothing"
          : unchecked.length === 0
            ? "tried everything he showed"
            : `showed without trying: ${unchecked.join(", ")}`,
    });
  }
  if (expect.ends !== undefined) {
    const last = his.at(-1)?.cues ?? [];
    const end = last.some((c) => c.kind === "ask") ? "ask" : "nothing";
    const isPassed = end === expect.ends;
    out.push({ name: CheckName.Ends, isPassed, detail: `ended with ${end}` });
  }
  const longest = Math.max(0, ...replies.map(words));
  const limit = expect.maxWords ?? DEFAULT_MAX_WORDS;
  out.push({
    name: CheckName.Short,
    isPassed: longest <= limit,
    detail: `longest reply ${longest} words (max ${limit})`,
  });
  const share = devanagariShare(all);
  const isRight = testCase.locale === "hi" ? share >= 0.6 : share <= 0.1;
  out.push({
    name: CheckName.Language,
    isPassed: isRight,
    detail: `${Math.round(share * 100)}% Devanagari letters (wanted ${testCase.locale === "hi" ? "≥ 60%" : "≤ 10%"})`,
  });
  return out;
}
