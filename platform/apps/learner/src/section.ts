import type { GroupLearner, PointSeen, QuestionSeen, TrySeen } from "@chalk/api";
import type { Localized } from "@chalk/content";
import { PointKind } from "@chalk/learning";

/**
 * A section's home, read from its learners' latest updates (platform/docs/plans/teacher-view.md,
 * "The section home"): who needs the teacher, and for what; the mistakes several share; everyone
 * else. Pure: the screen only draws it.
 *
 * - **Needs you**: their latest update (their last finished set's) has a point that needs the
 *   teacher. The three latest get a card (the most tries wrong first on the same set's time); the
 *   rest are named under them. They leave when a later update no longer has it; for a day after, they are shown
 *   greyed, "got it on their own".
 * - **Shared mistakes**: the same wrong answer to the same question, by two or more children, in
 *   the evidence of a point that needs them or that they are getting past. Biggest first; one
 *   whose children are all on a bigger card is left out (it would say nothing new).
 */

const DAY_MS = 24 * 60 * 60 * 1000;
/** At most this many shared mistakes are shown: the biggest. */
export const SHARED_MAX = 3;
/** At most this many children needing the teacher get a card; the rest are named under them. */
export const NEEDS_YOU_MAX = 3;

/** A try with the question it was on. */
export type TryOn = { question: QuestionSeen; try: TrySeen };

export type NeedsYou = {
  learner: GroupLearner;
  point: PointSeen;
  /** How sure: their wrong tries among their tries at the questions it cites. */
  wrong: number;
  of: number;
  /** Their last wrong try there: the proof drawn on the card. */
  shown: TryOn | undefined;
};

export type SharedMistake = {
  /** The question and the wrong answer: what makes it one mistake. */
  key: string;
  question: QuestionSeen;
  answer: Localized;
  /** The judge's words for it, the most common among the children's points; null if none. */
  label: string | null;
  learners: GroupLearner[];
};

export type Section = {
  /** The latest first, then the most tries wrong: a card each. */
  needsYou: NeedsYou[];
  /** The rest who need the teacher, by name. */
  alsoNeedsYou: GroupLearner[];
  gotIt: { learner: GroupLearner; was: string }[];
  mistakes: SharedMistake[];
  gettingThere: GroupLearner[];
  onTrack: GroupLearner[];
  /** No finished set yet. */
  notYet: GroupLearner[];
};

/** Every try at the questions a point cites, in order. */
export const triesOf = (point: PointSeen): TryOn[] =>
  point.questions
    .flatMap((question) => question.tries.map((t) => ({ question, try: t })))
    .sort((a, b) => a.try.at - b.try.at);

/** The point of theirs that needs the teacher, if any. */
export const needsYouPoint = (learner: GroupLearner): PointSeen | undefined =>
  learner.latestUpdate?.points.find((p) => p.kind === PointKind.NeedsYou);

export function sectionOf(learners: readonly GroupLearner[], now: number): Section {
  const section: Section = {
    needsYou: [],
    alsoNeedsYou: [],
    gotIt: [],
    mistakes: [],
    gettingThere: [],
    onTrack: [],
    notYet: [],
  };
  const shared = new Map<string, SharedMistake & { labels: string[] }>();
  for (const learner of learners) {
    const update = learner.latestUpdate;
    if (update === null) {
      section.notYet.push(learner);
      continue;
    }
    const point = needsYouPoint(learner);
    if (point !== undefined) {
      const tries = triesOf(point);
      const wrongs = tries.filter((t) => !t.try.isRight);
      section.needsYou.push({
        learner,
        point,
        wrong: wrongs.length,
        of: tries.length,
        shown: wrongs.at(-1),
      });
    } else {
      if (update.wasNeedsYou !== null && now - update.finishedAt < DAY_MS)
        section.gotIt.push({ learner, was: update.wasNeedsYou });
      if (update.points.some((p) => p.kind === PointKind.GettingThere))
        section.gettingThere.push(learner);
      else section.onTrack.push(learner);
    }
    // Their wrong answers behind a point that isn't on track: each counts them once.
    const mine = new Set<string>();
    for (const p of update.points) {
      if (p.kind === PointKind.OnTrack) continue;
      for (const { question, try: t } of triesOf(p)) {
        if (t.isRight || t.chosen === null) continue;
        const key = `${question.board} ${t.chosen.en}`;
        const group = shared.get(key) ?? {
          key,
          question,
          answer: t.chosen,
          label: null,
          labels: [],
          learners: [],
        };
        if (!mine.has(key)) group.learners.push(learner);
        if (p.mistake !== null) group.labels.push(p.mistake);
        mine.add(key);
        shared.set(key, group);
      }
    }
  }
  const finished = (n: NeedsYou) => n.learner.latestUpdate?.finishedAt ?? 0;
  const needing = section.needsYou.sort(
    (a, b) =>
      finished(b) - finished(a) ||
      b.wrong - a.wrong ||
      a.learner.name.localeCompare(b.learner.name),
  );
  section.needsYou = needing.slice(0, NEEDS_YOU_MAX);
  section.alsoNeedsYou = needing.slice(NEEDS_YOU_MAX).map((n) => n.learner);
  // Biggest first; one whose children are all on a card already shown says nothing new.
  const shown = new Set<string>();
  for (const { labels, ...m } of [...shared.values()]
    .filter((g) => g.learners.length >= 2)
    .sort((a, b) => b.learners.length - a.learners.length || a.key.localeCompare(b.key))) {
    if (section.mistakes.length === SHARED_MAX) break;
    if (m.learners.every((l) => shown.has(l.id))) continue;
    for (const l of m.learners) shown.add(l.id);
    section.mistakes.push({ ...m, label: mostCommon(labels) });
  }
  return section;
}

function mostCommon(words: readonly string[]): string | null {
  const counts = new Map<string, number>();
  for (const w of words) counts.set(w, (counts.get(w) ?? 0) + 1);
  let best: string | null = null;
  for (const [w, n] of counts) if (best === null || n > (counts.get(best) ?? 0)) best = w;
  return best;
}
