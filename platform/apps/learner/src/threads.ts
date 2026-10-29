import { useCallback, useEffect, useState } from "preact/hooks";

/**
 * Threads and reviews in the browser (development only), as the dev server gives them: it is their
 * one writer (platform/studio/src/comments.ts, platform/docs/comments.md). Pages here write as the
 * person.
 */

export type ThreadStatus = "open" | "planned" | "ready" | "closed" | "withdrawn";

export type Message = {
  by: string;
  role: string;
  at: string;
  text: string;
  /** The status the thread moved to with this message. */
  status?: ThreadStatus;
};

export type Thread = {
  id: string;
  status: ThreadStatus;
  /** Whose turn it is, as the thread keeps it: the agent's, the person's, or no one's (settled). */
  waitsOn: "agent" | "person" | null;
  by: string;
  role: string;
  createdAt: string;
  text: string;
  /** The board, by build path; absent for a thread on a plan. */
  board?: string;
  /** What on it, by address: "machine" or "machine/plane/handle". */
  target?: string;
  /** A thread on a prop wherever it is used: shown under every board that places it. */
  prop?: string;
  /** The line it is about: content/…/overview.ts:42, or a plan's authoring/books/…/plan.md:12. */
  source?: string;
  snapshot?: string;
  quote?: string;
  from?: string;
  changed?: string[];
  /** What the changes reach, worked out when it became ready (platform/studio/src/reach). */
  reaches?: { pieces: number; boards: number; lessons: string[]; everything?: string };
  messages: Message[];
};

/** "reaches 12 boards (31 pieces) in 3 lessons", or every board and why. */
export function reachWords(r: NonNullable<Thread["reaches"]>): string {
  const n = (count: number, one: string) => `${count} ${one}${count === 1 ? "" : "s"}`;
  if (r.everything !== undefined) return `reaches every board (${n(r.boards, "board")})`;
  if (r.pieces === 0) return "reaches no built board";
  return `reaches ${n(r.boards, "board")} (${n(r.pieces, "piece")}) in ${n(r.lessons.length, "lesson")}`;
}

/** One participant's sitting, handed over (reviews/<id>.yaml). */
export type Review = {
  id: string;
  by: string;
  role: string;
  at: string;
  /** Later handovers that added to it while it wasn't done. */
  added?: string[];
  threads: { id: string }[];
};

export type Threads = { threads: Thread[]; reviews: Review[] };

export const NO_THREADS: Threads = { threads: [], reviews: [] };

/** Sends one change to the dev server; every thread and review after it, or why not. */
export async function changeComments(change: Record<string, unknown>): Promise<Threads | string> {
  try {
    const res = await fetch("/dev-review", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(change),
    });
    const body = (await res.json()) as Partial<Threads> & { ok: boolean; error?: string };
    return body.ok
      ? { threads: body.threads ?? [], reviews: body.reviews ?? [] }
      : (body.error ?? `${res.status}`);
  } catch {
    return "the dev server isn't answering";
  }
}

/** Every thread and review, kept current: the dev server says the moment a file changes. */
export function useThreads(): {
  all: Threads;
  set: (all: Threads) => void;
  send: (change: Record<string, unknown>) => Promise<string | null>;
} {
  const [all, set] = useState<Threads>(NO_THREADS);
  const load = useCallback(() => {
    fetch("/dev-review")
      .then((r) => (r.ok ? (r.json() as Promise<Threads>) : NO_THREADS))
      .then(set)
      .catch(() => {});
  }, []);
  useEffect(() => {
    load();
    const onMessage = (e: MessageEvent) => {
      const m = e.data as { chalk?: boolean; type?: string };
      if (m?.chalk === true && m.type === "comments") load();
    };
    window.addEventListener("message", onMessage);
    const hot = import.meta.hot;
    hot?.on("chalk:comments", load);
    return () => {
      window.removeEventListener("message", onMessage);
      hot?.off?.("chalk:comments", load);
    };
  }, [load]);
  const send = useCallback(async (change: Record<string, unknown>) => {
    const after = await changeComments(change);
    if (typeof after === "string") return after;
    set(after);
    return null;
  }, []);
  return { all, set, send };
}

/** The thread's plan: the last message that moved it to planned. */
export const planOf = (t: Thread): Message | undefined =>
  [...t.messages].reverse().find((m) => m.status === "planned");

export const isFinished = (t: Thread): boolean => t.status === "closed" || t.status === "withdrawn";

/** Whether it can only be withdrawn, not deleted: handed over, or someone else wrote on it. */
export const isKept = (t: Thread, reviews: readonly Review[]): boolean =>
  t.status !== "open" ||
  t.messages.some((m) => m.by !== t.by) ||
  reviews.some((r) => r.threads.some((x) => x.id === t.id));
