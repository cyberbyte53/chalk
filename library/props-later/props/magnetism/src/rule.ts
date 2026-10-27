import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { DIR_WORDS, Dir, crossDir, isAlong, opposite } from "./space";

/**
 * The three direction rules of the chapter, worked as vector products in the page (right, up,
 * out of the page):
 * - Right-hand thumb rule (13.2.2): thumb along the current, fingers curl the way the field goes.
 *   The prop reports the field at a point beside the wire: B ∝ I × r.
 * - Fleming's left-hand rule (13.3): first finger field, second finger current, thumb force.
 *   F = I × B; a moving electron is a current the opposite way.
 * - Fleming's right-hand rule (13.5): first finger field, thumb motion, second finger induced
 *   current. I = v × B.
 */

export const Rule = {
  ThumbRule: "thumbRule",
  FlemingLeft: "flemingLeft",
  FlemingRight: "flemingRight",
} as const;
export type Rule = (typeof Rule)[keyof typeof Rule];

/** What moves in Fleming's left-hand rule: a current, an electron, or a positive particle. */
export const Carrier = { Current: "current", Electron: "electron", Positive: "positive" } as const;
export type Carrier = (typeof Carrier)[keyof typeof Carrier];

export const RuleAction = {
  SetFirst: "setFirst",
  SetSecond: "setSecond",
  Reveal: "reveal",
} as const;
export const RuleSignal = { Changed: "changed", Revealed: "revealed" } as const;
export const RuleDerived = { Answer: "answer", IsPerpendicular: "isPerpendicular" } as const;
export const RulePart = { Hand: "hand", Answer: "answer", Controls: "controls" } as const;

const dir = z.nativeEnum(Dir);

const ruleState = z
  .object({
    rule: z.nativeEnum(Rule),
    /**
     * The two given directions. Thumb rule: first = current, second = where the point is from the
     * wire. Left hand: first = field, second = the current (or the particle's motion). Right hand:
     * first = field, second = the conductor's motion.
     */
    first: dir,
    second: dir,
    carrier: z.nativeEnum(Carrier),
    /** The third direction drawn and named (false: hidden, to be worked out). */
    isRevealed: z.boolean(),
    canSetFirst: z.boolean(),
    canSetSecond: z.boolean(),
    canReveal: z.boolean(),
  })
  .strict();
export type RuleState = z.infer<typeof ruleState>;

/** The direction the rule gives, or null when the two given lie along one line (no force). */
export function answerOf(s: Pick<RuleState, "rule" | "first" | "second" | "carrier">): Dir | null {
  switch (s.rule) {
    case Rule.ThumbRule:
      // B at a point r from the wire is along I × r.
      return crossDir(s.first, s.second);
    case Rule.FlemingLeft: {
      // The current is the motion of positive charge; an electron's current runs the other way.
      const current = s.carrier === Carrier.Electron ? opposite(s.second) : s.second;
      return crossDir(current, s.first);
    }
    case Rule.FlemingRight:
      return crossDir(s.second, s.first);
  }
}

export const isPerpendicular = (s: Pick<RuleState, "first" | "second">) =>
  !isAlong(s.first, s.second);

/** What each finger stands for, in the rule's own words. */
export const ROLES: Readonly<
  Record<Rule, { first: string; second: string; answer: string; hand: "left" | "right" }>
> = {
  thumbRule: {
    first: "current (thumb)",
    second: "where the point is, from the wire",
    answer: "field at that point (fingers)",
    hand: "right",
  },
  flemingLeft: {
    first: "field (first finger)",
    second: "current (second finger)",
    answer: "force (thumb)",
    hand: "left",
  },
  flemingRight: {
    first: "field (first finger)",
    second: "motion of the conductor (thumb)",
    answer: "induced current (second finger)",
    hand: "right",
  },
};

export function describeRule(s: RuleState): string {
  const roles = ROLES[s.rule];
  const name =
    s.rule === Rule.ThumbRule
      ? "The right-hand thumb rule"
      : s.rule === Rule.FlemingLeft
        ? "Fleming's left-hand rule"
        : "Fleming's right-hand rule";
  const second =
    s.rule === Rule.FlemingLeft && s.carrier !== Carrier.Current
      ? `${s.carrier === Carrier.Electron ? "an electron" : "a positive particle"} moving ${DIR_WORDS[s.second].en}`
      : `${roles.second} ${DIR_WORDS[s.second].en}`;
  const a = answerOf(s);
  const answer = !s.isRevealed
    ? `The ${roles.answer} is hidden.`
    : a === null
      ? "The two lie along one line, so there is no force or field from them."
      : `So the ${roles.answer} points ${DIR_WORDS[a].en}.`;
  return `${name}: ${roles.first} ${DIR_WORDS[s.first].en}, ${second}. ${answer}`;
}

const act = actionsFor<RuleState>();
const changed = (s: RuleState) => ({
  signal: RuleSignal.Changed,
  payload: { first: s.first, second: s.second, answer: answerOf(s) },
});

export const handRule = defineProp({
  type: "handRule",
  describe:
    "The chapter's three direction rules as three perpendicular arrows (right/left, up/down, out of/into the page): the right-hand thumb rule (current → the field beside a wire), Fleming's left-hand rule (field and current → force; an electron moves opposite to the current) and Fleming's right-hand rule (field and motion → induced current). The learner sets the two given directions and reveals the third.",
  state: ruleState,
  defaults: {
    rule: Rule.FlemingLeft,
    first: Dir.Up,
    second: Dir.Out,
    carrier: Carrier.Current,
    isRevealed: true,
    canSetFirst: true,
    canSetSecond: true,
    canReveal: false,
  },
  inputs: ["isRevealed", "canSetFirst", "canSetSecond", "canReveal"],
  derived: {
    [RuleDerived.Answer]: {
      describe:
        "The direction the rule gives (right, left, up, down, out, in), or null when the two given directions lie along one line",
      compute: (s) => answerOf(s),
    },
    [RuleDerived.IsPerpendicular]: {
      describe: "The two given directions are at right angles (the rule applies)",
      compute: (s) => isPerpendicular(s),
    },
  },
  actions: {
    [RuleAction.SetFirst]: act({
      describe: "Set the first given direction (the current for the thumb rule, else the field)",
      byLearner: true,
      args: z.object({ dir }).strict(),
      run: (s, a) => set({ first: a.dir }, changed({ ...s, first: a.dir })),
    }),
    [RuleAction.SetSecond]: act({
      describe:
        "Set the second given direction (where the point is, the current or particle's motion, or the conductor's motion)",
      byLearner: true,
      args: z.object({ dir }).strict(),
      run: (s, a) => set({ second: a.dir }, changed({ ...s, second: a.dir })),
    }),
    [RuleAction.Reveal]: act({
      describe: "Show the third direction (reveals the answer)",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) =>
        set(
          { isRevealed: true },
          { signal: RuleSignal.Revealed, payload: { answer: answerOf(s) } },
        ),
    }),
  },
  signals: {
    [RuleSignal.Changed]: { describe: "A given direction changed; the payload has the answer" },
    [RuleSignal.Revealed]: { describe: "The third direction was shown" },
  },
  observe: (s) => {
    const a = answerOf(s);
    return {
      summary: describeRule(s),
      elements: [
        { id: RulePart.Hand, value: `${s.first}, ${s.second}` },
        ...(s.isRevealed ? [{ id: RulePart.Answer, value: a ?? "none" }] : []),
      ],
      hidden: s.isRevealed ? undefined : { answer: a },
    };
  },
  parts: (s) => [
    RulePart.Hand,
    ...(s.isRevealed ? [RulePart.Answer] : []),
    ...(s.canSetFirst || s.canSetSecond || s.canReveal ? [RulePart.Controls] : []),
  ],
});
