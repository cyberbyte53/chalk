import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AGENT_LOCALE, type ChalkEvent, buildIndexSchema } from "@chalk/content";
import {
  type Attempt,
  type Mastery,
  attemptsFrom,
  catalogueOf,
  masteryFrom,
  questionVersionsOf,
} from "@chalk/learning";
import type { Conversations, memoryKeeper } from "./conversations";
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
    /** `chosen`: what they answered, in the English words they saw, or null. */
    tries: (Pick<Attempt, "isRight" | "helped" | "nth"> & { chosen: string | null })[];
  })[];
  reflections: ReflectionFacts[];
};

export type Judged = { points: UpdatePoint[]; prompt: Prompt; model: string; requests: unknown[] };

export type SetKeeper = {
  /** Sets finished with no update by this update prompt (its hash): to make (or try again). */
  toUpdate: (promptHash: string) => Promise<{ account: string; set: string }[]>;
  set: (account: string, set: string) => Promise<SetRecord | undefined>;
  /** When the learner's last finished set finished (their numbers are as of it), if any. */
  lastFinishedAt: (account: string) => Promise<number | undefined>;
  attempts: (account: string) => Promise<Attempt[]>;
  /** His reflections on the conversations at these openings: the latest on each. */
  reflectionsAt: (account: string, openings: readonly string[]) => Promise<ReflectionFacts[]>;
  questionFacts: (boards: readonly string[]) => Promise<QuestionFacts[]>;
  /** The points of the learner's latest update (their last finished set's; the state before). */
  lastPoints: (account: string) => Promise<UpdatePoint[]>;
  keepMastery: (account: string, rows: Mastery[]) => Promise<void>;
  keepUpdate: (u: {
    account: string;
    set: string;
    /** When the set finished (an update's place in their history). */
    finishedAt: number;
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
    // The numbers: as of their last finished set (this one, unless a later one finished first).
    const tries = await o.keeper.attempts(account);
    const last = Math.max(set.finishedAt, (await o.keeper.lastFinishedAt(account)) ?? 0);
    await o.keeper.keepMastery(account, masteryFrom(tries.filter((a) => a.at <= last)));
    if (o.jugnu === undefined) return;
    // Every reflection of the set's conversations exists before it is judged.
    await o.jugnu.conversations.endAt(account, set.openings);
    // The judgement: the state before, the set, what happened.
    const facts = await o.keeper.questionFacts(set.questions.map((q) => q.board));
    const inSet = tries.filter((a) => set.openings.includes(a.opening));
    const judged = await o.jugnu.judge({
      before: await o.keeper.lastPoints(account),
      questions: facts.map((f) => ({
        ...f,
        tries: inSet
          .filter((a) => a.board === f.board)
          .map(({ isRight, chosen, helped, nth }) => ({
            isRight,
            chosen: chosen?.[AGENT_LOCALE] ?? null,
            helped,
            nth,
          })),
      })),
      reflections: await o.keeper.reflectionsAt(account, set.openings),
    });
    await o.keeper.keepUpdate({
      account,
      set: setId,
      finishedAt: set.finishedAt,
      at: o.now(),
      judged,
    });
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

/**
 * A keeper of sets in memory: the preview's (teacher-view.md, the preview's gap). Its events are
 * what the preview's uploader sent; its attempts are worked out from them as the server does; its
 * reflections are the memory conversation keeper's.
 */
export function memorySetKeeper(
  conversations: ReturnType<typeof memoryKeeper>,
  buildDir: string,
): SetKeeper & {
  events: Map<string, ChalkEvent[]>;
  mastery: Map<string, Mastery[]>;
  updates: { account: string; set: string; finishedAt: number; at: number; judged: Judged }[];
} {
  const events = new Map<string, ChalkEvent[]>();
  const kept = new Map<string, Mastery[]>();
  const updates: {
    account: string;
    set: string;
    finishedAt: number;
    at: number;
    judged: Judged;
  }[] = [];
  const readBuilt = (path: string): unknown =>
    JSON.parse(readFileSync(join(buildDir, `${path}.json`), "utf8"));
  const catalogue = () =>
    catalogueOf(questionVersionsOf(buildIndexSchema.parse(readBuilt("index")), readBuilt));
  const setEntries = (account: string, set: string) =>
    (events.get(account) ?? []).filter(
      (e) => e.kind === "set" && (e.payload as { set?: string }).set === set,
    );
  return {
    events,
    mastery: kept,
    updates,
    toUpdate: async (promptHash) =>
      [...events].flatMap(([account, list]) =>
        list.flatMap((e) =>
          e.kind === "set" &&
          e.payload.what === "finished" &&
          !updates.some(
            (u) =>
              u.account === account &&
              u.set === e.payload.set &&
              u.judged.prompt.hash === promptHash,
          )
            ? [{ account, set: e.payload.set }]
            : [],
        ),
      ),
    set: async (account, set) => {
      const entries = setEntries(account, set);
      const served = entries.find((e) => e.kind === "set" && e.payload.what === "served");
      const finished = entries.find((e) => e.kind === "set" && e.payload.what === "finished");
      if (served?.kind !== "set" || served.payload.what !== "served" || finished === undefined)
        return undefined;
      const openings = new Set(
        (events.get(account) ?? []).flatMap((e) =>
          e.kind === "open" && e.payload.set === set && e.opening !== null ? [e.opening] : [],
        ),
      );
      return {
        id: set,
        by: served.payload.by,
        questions: served.payload.questions,
        finishedAt: finished.at,
        openings: [...openings],
      };
    },
    lastFinishedAt: async (account) => {
      const at = (events.get(account) ?? []).flatMap((e) =>
        e.kind === "set" && e.payload.what === "finished" ? [e.at] : [],
      );
      return at.length === 0 ? undefined : Math.max(...at);
    },
    attempts: async (account) => attemptsFrom(events.get(account) ?? [], catalogue()),
    reflectionsAt: async (account, openings) =>
      [...conversations.held.values()].flatMap((c) =>
        c.place.account === account && openings.includes(c.place.opening)
          ? c.reflections.slice(-1).map((r) => ({
              id: r.id,
              board: c.place.board,
              points: r.points,
              gotThere: r.gotThere,
            }))
          : [],
      ),
    questionFacts: async (boards) => questionFactsFrom(buildDir, boards),
    lastPoints: async (account) =>
      updates
        .filter((u) => u.account === account)
        .sort((a, b) => b.finishedAt - a.finishedAt || b.at - a.at)[0]?.judged.points ?? [],
    keepMastery: async (account, rows) => {
      kept.set(account, rows);
    },
    keepUpdate: async (u) => {
      if (
        updates.some(
          (x) =>
            x.account === u.account &&
            x.set === u.set &&
            x.judged.prompt.hash === u.judged.prompt.hash,
        )
      )
        return "";
      updates.push(u);
      return `${u.account}:${u.set}`;
    },
  };
}
