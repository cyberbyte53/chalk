import { readFileSync } from "node:fs";
import { join } from "node:path";
import { type Attempt, type Mastery, masteryFrom } from "@chalk/learning";
import type { Conversations } from "./conversations";
import type { Prompt } from "./prompts";

/**
 * Sets and the learner update, the one flow (platform/docs/plans/teacher-view.md, step 3): when a
 * set the child was given is finished, update(the state before, the set, what happened): first his
 * conversations at its openings are ended and reflected on; then the numbers (mastery from their
 * attempts up to the set's end) and the judgement (what it shows they are still not good at, each
 * point with its evidence). Once per set and update prompt; a failed step writes nothing, and the
 * sweep tries again. Written once; the keeper says where it is kept (the server's database, or the
 * preview's memory).
 */

/** A set as its events say: who made it, its questions, when it finished, its boards' openings. */
export type SetRecord = {
  id: string;
  by: string;
  questions: { board: string; version: string }[];
  finishedAt: number;
  openings: string[];
};

/** What a question is, for the judgement: its name, the concepts it tests, its level. */
export type QuestionFacts = {
  board: string;
  name: string;
  concepts: { id: string; title: string }[];
  level: string | null;
};

/** One of his reflections, as the judgement reads it. */
export type ReflectionFacts = { id: string; board: string; points: string[]; gotThere: string };

/** A point of the update, with what it rests on (question board ids, reflection ids). */
export type UpdatePoint = { text: string; questions: string[]; reflections: string[] };

export type UpdateInput = {
  before: UpdatePoint[];
  questions: (QuestionFacts & {
    tries: Pick<Attempt, "isRight" | "chosen" | "helped" | "nth">[];
  })[];
  reflections: ReflectionFacts[];
};

export type Judged = { points: UpdatePoint[]; prompt: Prompt; model: string; requests: unknown[] };

export type SetKeeper = {
  /** Sets finished with no update by this update prompt (its hash): to make (or try again). */
  toUpdate: (promptHash: string) => Promise<{ account: string; set: string }[]>;
  set: (account: string, set: string) => Promise<SetRecord | undefined>;
  attempts: (account: string) => Promise<Attempt[]>;
  reflectionsAt: (account: string, openings: readonly string[]) => Promise<ReflectionFacts[]>;
  questionFacts: (boards: readonly string[]) => Promise<QuestionFacts[]>;
  /** The learner's latest update's points (the state before), if any. */
  lastPoints: (account: string) => Promise<UpdatePoint[]>;
  keepMastery: (account: string, rows: Mastery[]) => Promise<void>;
  keepUpdate: (u: {
    account: string;
    set: string;
    at: number;
    judged: Judged;
  }) => Promise<string>;
};

export type Sets = {
  /** The update for one finished set (once per set and prompt; awaited). */
  update: (account: string, set: string) => Promise<void>;
  /** Makes every update not yet made (a failed one is tried again). */
  sweep: () => Promise<void>;
};

export function sets(o: {
  keeper: SetKeeper;
  /**
   * Where Jugnu is (a model set up): his conversations, and the judgement. Without him, a finished
   * set still gets its numbers.
   */
  jugnu?: { conversations: Conversations; judge: (input: UpdateInput) => Promise<Judged> };
  /** The committed update prompt's hash: an update is made once for each. */
  promptHash: () => string;
  now: () => number;
  onError: (message: string, error: unknown) => void;
}): Sets {
  const updating = new Map<string, Promise<void>>();
  const make = async (account: string, setId: string) => {
    const set = await o.keeper.set(account, setId);
    if (set === undefined) return;
    // The numbers: as of the set's end.
    const upTo = (await o.keeper.attempts(account)).filter((a) => a.at <= set.finishedAt);
    await o.keeper.keepMastery(account, masteryFrom(upTo));
    if (o.jugnu === undefined) return;
    // Every reflection of the set's conversations exists before it is judged.
    await o.jugnu.conversations.endAt(account, set.openings);
    // The judgement: the state before, the set, what happened.
    const facts = await o.keeper.questionFacts(set.questions.map((q) => q.board));
    const inSet = upTo.filter((a) => set.openings.includes(a.opening));
    const judged = await o.jugnu.judge({
      before: await o.keeper.lastPoints(account),
      questions: facts.map((f) => ({
        ...f,
        tries: inSet
          .filter((a) => a.board === f.board)
          .map(({ isRight, chosen, helped, nth }) => ({ isRight, chosen, helped, nth })),
      })),
      reflections: await o.keeper.reflectionsAt(account, set.openings),
    });
    await o.keeper.keepUpdate({ account, set: setId, at: o.now(), judged });
  };
  const update = (account: string, setId: string) => {
    const key = `${account}:${setId}`;
    const going = updating.get(key);
    if (going !== undefined) return going;
    const u = make(account, setId)
      .catch((error: unknown) => o.onError(`The update for set ${setId} failed`, error))
      .finally(() => updating.delete(key));
    updating.set(key, u);
    return u;
  };
  return {
    update,
    sweep: async () => {
      if (o.jugnu === undefined) return;
      try {
        for (const s of await o.keeper.toUpdate(o.promptHash())) await update(s.account, s.set);
      } catch (error) {
        o.onError("Updating finished sets failed", error);
      }
    },
  };
}

/** Keeps only the evidence the judgement was given (no invented ids). */
export const realEvidence = (points: UpdatePoint[], input: UpdateInput): UpdatePoint[] => {
  const boards = new Set(input.questions.map((q) => q.board));
  const reflections = new Set(input.reflections.map((r) => r.id));
  return points.map((p) => ({
    text: p.text,
    questions: p.questions.filter((b) => boards.has(b)),
    reflections: p.reflections.filter((r) => reflections.has(r)),
  }));
};

/**
 * Each question's facts from a build (its directory: `build/`): its name (its path's last two
 * parts), the concepts it tests (with their titles), its level. Boards are named by id.
 */
export function questionFactsFrom(buildDir: string, boards: readonly string[]): QuestionFacts[] {
  const read = (path: string): Record<string, unknown> | undefined => {
    try {
      return JSON.parse(readFileSync(join(buildDir, `${path}.json`), "utf8"));
    } catch {
      return undefined;
    }
  };
  const ids = (read("ids") ?? {}) as Record<string, string>;
  const conceptTitle = new Map<string, string>();
  for (const path of Object.values(ids)) {
    const item = read(path);
    if (item?.kind === "concept")
      conceptTitle.set(String(item.id), String((item.title as { en?: string })?.en ?? item.id));
  }
  return boards.map((board) => {
    const path = ids[board] ?? board;
    const item = read(path) ?? {};
    return {
      board,
      name: path.split("/").slice(-2).join("/"),
      concepts: ((item.tests as string[] | undefined) ?? []).map((id) => ({
        id,
        title: conceptTitle.get(id) ?? id,
      })),
      level: typeof item.level === "string" ? item.level : null,
    };
  });
}
