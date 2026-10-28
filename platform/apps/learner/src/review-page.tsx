import { Locale } from "@chalk/content";
import { contentAddress, previewQuery } from "@chalk/content/address";
import type { EventBus } from "@chalk/events";
import { preloadProps } from "@chalk/library";
import type { JSX } from "preact";
import { useEffect, useLayoutEffect, useMemo, useState } from "preact/hooks";
import { sendKeys } from "./editor-link";
import {
  PreviewBoard,
  type Shown,
  type Sources,
  anchorOf,
  isInEditor,
  json,
  propTypes,
  shownAt,
  toEditor,
} from "./preview-shell";
import {
  type Review,
  type Thread,
  changeComments,
  isFinished,
  reachWords,
  useThreads,
} from "./threads";

/**
 * Reviews in the preview (development only; platform/docs/comments.md).
 *
 * - `?dev&reviews`: every review, newest first (and your threads not handed over yet).
 * - `?dev&review=<id>` (`review=sitting`: yours not handed over yet; `review=yours`: every thread
 *   waiting on you, an agent's question or a fix to check): the review as one page, a
 *   list of its threads. Each is a fold: what was said and every message since, then its board as
 *   it is now, drawn live with the piece outlined, and Reply, Close, Withdraw, Open board (which
 *   comes back here). `&thread=<id>` opens at that thread.
 */

const SITTING = "sitting";
const YOURS = "yours";
/** The pages that are not a handed-over review, by their title. */
const PAGES: Record<string, string> = {
  [SITTING]: "Not handed over yet",
  [YOURS]: "Waiting on you",
};
const STATUS_WORDS: Record<string, string> = {
  open: "waiting",
  planned: "planned",
  ready: "ready for you",
  closed: "closed",
  withdrawn: "withdrawn",
};

/** "1 open, 3 ready": how a set of threads stands. */
function standing(threads: readonly Thread[]): string {
  const order = ["open", "planned", "ready", "closed", "withdrawn"];
  const counts = new Map<string, number>();
  for (const t of threads) counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
  return order
    .filter((k) => counts.has(k))
    .map((k) => `${counts.get(k)} ${k}`)
    .join(", ");
}

const placeOf = (t: Thread): string =>
  t.board === undefined
    ? (t.source ?? "plan").replace(/^content\//, "").replace(/:\d.*$/, "")
    : `${t.board.split("/").at(-1)}${t.target ? ` · ${t.target}` : ""}${t.prop ? ` · prop ${t.prop}` : ""}`;

/** Copies a line for the agent: through the editor when the page is in its panel. */
async function copy(text: string): Promise<boolean> {
  if (isInEditor) {
    toEditor({ type: "copyText", text });
    return true;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Which threads are folded, kept across visits (a convenience only). */
const FOLD_KEY = "chalk-review-folds";
function readFolds(): Record<string, boolean> {
  try {
    return JSON.parse(window.localStorage.getItem(FOLD_KEY) ?? "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}
function writeFolds(folds: Record<string, boolean>): void {
  try {
    window.localStorage.setItem(FOLD_KEY, JSON.stringify(folds));
  } catch {}
}

/** Every review, newest first. */
export function ReviewList(): JSX.Element {
  const {
    all: { threads, reviews },
  } = useThreads();
  const [sitting, setSitting] = useState<Thread[]>([]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `threads` is the trigger: read the sitting again when a thread changes.
  useEffect(() => {
    fetch("/dev-review?sitting")
      .then((r) => r.json() as Promise<Thread[]>)
      .then(setSitting)
      .catch(() => {});
  }, [threads]);
  useLayoutEffect(() => {
    document.body.dataset.previewReady = window.location.search;
  });
  const yours = threads.filter((t) => t.waitsOn === "person").length;
  const of = (r: Review) => r.threads.flatMap((x) => threads.find((t) => t.id === x.id) ?? []);
  return (
    <main class="rv">
      <header class="rv-bar">
        <strong>Reviews</strong>
        <a href="?dev&activity">Activity</a>
      </header>
      <ul class="rv-list">
        {yours > 0 && (
          <li>
            <a href={`?dev&review=${YOURS}`}>
              <strong>Waiting on you</strong>
              <span>{`${yours} thread${yours === 1 ? "" : "s"}`}</span>
            </a>
          </li>
        )}
        {sitting.length > 0 && (
          <li>
            <a href={`?dev&review=${SITTING}`}>
              <strong>Not handed over yet</strong>
              <span>{`${sitting.length} thread${sitting.length === 1 ? "" : "s"}`}</span>
            </a>
          </li>
        )}
        {[...reviews].reverse().map((r) => (
          <li key={r.id}>
            <a href={`?dev&review=${encodeURIComponent(r.id)}`}>
              <strong>{r.id}</strong>
              <span>{`${r.by} · ${r.threads.length} thread${r.threads.length === 1 ? "" : "s"} · ${standing(of(r))}`}</span>
            </a>
          </li>
        ))}
        {reviews.length === 0 && sitting.length === 0 && (
          <li class="rv-empty">No reviews yet: comment on a board, then Copy for agent.</li>
        )}
      </ul>
    </main>
  );
}

/** One review as a page: its threads, each foldable, each with its board as it is now. */
export function ReviewPage({ bus }: { bus: EventBus }): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("review") ?? "";
  const focus = params.get("thread");
  const locale = params.get("locale") === "hi" ? Locale.Hi : Locale.En;
  const {
    all: { threads, reviews },
    set,
  } = useThreads();
  const [sitting, setSitting] = useState<Thread[] | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: `threads` is the trigger: read the sitting again when a thread changes.
  useEffect(() => {
    if (id !== SITTING) return;
    fetch("/dev-review?sitting")
      .then((r) => r.json() as Promise<Thread[]>)
      .then(setSitting)
      .catch(() => setSitting([]));
  }, [id, threads]);
  const review = reviews.find((r) => r.id === id);
  const shown = useMemo(
    () =>
      id === SITTING
        ? (sitting ?? []).map((s) => threads.find((t) => t.id === s.id) ?? s)
        : id === YOURS
          ? threads.filter((t) => t.waitsOn === "person" || t.id === focus)
          : (review?.threads.flatMap((x) => threads.find((t) => t.id === x.id) ?? []) ?? []),
    [id, sitting, review, threads, focus],
  );
  const [folds, setFolds] = useState<Record<string, boolean>>(readFolds);
  const isFolded = (t: Thread) => (t.id === focus ? false : (folds[t.id] ?? isFinished(t)));
  const fold = (ids: readonly string[], to: boolean) => {
    const next = { ...folds, ...Object.fromEntries(ids.map((x) => [x, to])) };
    setFolds(next);
    writeFolds(next);
  };
  const [note, setNote] = useState<string | null>(null);
  const act = async (change: Record<string, unknown>) => {
    const after = await changeComments(change);
    if (typeof after === "string") {
      setNote(after);
      return false;
    }
    setNote(null);
    set(after);
    return true;
  };
  // Opened at a thread: bring it into view once drawn.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `shown.length` is the trigger: scroll once the threads are there.
  useEffect(() => {
    if (focus === null) return;
    const el = document.getElementById(`thread-${focus}`);
    el?.scrollIntoView({ block: "start" });
  }, [focus, shown.length]);
  useLayoutEffect(() => {
    if (shown.length > 0) document.body.dataset.previewReady = window.location.search;
  });

  const isLoading = id === SITTING ? sitting === null : id === YOURS ? false : reviews.length === 0;
  if (isLoading) return <div class="preview-loading">Loading the review…</div>;
  if (PAGES[id] === undefined && review === undefined)
    return <div class="preview-empty">{`No review ${id}.`}</div>;
  const ready = shown.filter((t) => t.status === "ready");
  const copyLine =
    PAGES[id] !== undefined
      ? null
      : `apply review ${id} (${shown.length} thread${shown.length === 1 ? "" : "s"})`;
  return (
    <main class="rv">
      <header class="rv-bar">
        <a href="?dev&reviews">← Reviews</a>
        <strong>{PAGES[id] ?? `Review ${id}`}</strong>
        <span>{`${review ? `${review.by} · ` : ""}${standing(shown)}`}</span>
        <span class="rv-grow" />
        <button
          type="button"
          onClick={() =>
            fold(
              shown.map((t) => t.id),
              true,
            )
          }
        >
          Fold all
        </button>
        <button
          type="button"
          onClick={() =>
            fold(
              shown.map((t) => t.id),
              false,
            )
          }
        >
          Unfold all
        </button>
        {ready.length > 0 && (
          <button
            type="button"
            onClick={async () => {
              for (const t of ready)
                await act({ op: "write", id: t.id, text: "", status: "closed" });
            }}
          >
            {`Close all ready (${ready.length})`}
          </button>
        )}
        {copyLine !== null ? (
          <button
            type="button"
            class="rv-primary"
            onClick={async () => setNote((await copy(copyLine)) ? `Copied: ${copyLine}` : copyLine)}
          >
            Copy for agent
          </button>
        ) : (
          isInEditor && (
            <button type="button" class="rv-primary" onClick={() => toEditor({ type: "copy" })}>
              Hand over (Copy for agent)
            </button>
          )
        )}
      </header>
      {note !== null && <p class="rv-note">{note}</p>}
      {shown.length === 0 && <p class="rv-empty">Nothing here.</p>}
      {shown.map((t) => (
        <ThreadFold
          key={t.id}
          thread={t}
          isFolded={isFolded(t)}
          onFold={(to) => fold([t.id], to)}
          act={act}
          bus={bus}
          locale={locale}
        />
      ))}
    </main>
  );
}

/** One thread: its head (always), then the conversation and its board as it is now. */
function ThreadFold({
  thread: t,
  isFolded,
  onFold,
  act,
  bus,
  locale,
}: {
  thread: Thread;
  isFolded: boolean;
  onFold: (to: boolean) => void;
  act: (change: Record<string, unknown>) => Promise<boolean>;
  bus: EventBus;
  locale: Locale;
}): JSX.Element {
  const latest = [...t.messages].reverse().find((m) => m.text !== "");
  const [reply, setReply] = useState("");
  const sendReply = async () => {
    if (reply.trim() !== "" && (await act({ op: "write", id: t.id, text: reply.trim() })))
      setReply("");
  };
  const isLive = t.status === "open" || t.status === "planned" || t.status === "ready";
  const back = encodeURIComponent(
    `dev&review=${new URLSearchParams(window.location.search).get("review") ?? ""}&thread=${t.id}`,
  );
  return (
    <section
      id={`thread-${t.id}`}
      class={`rv-thread is-${t.status}${isFolded ? " is-folded" : ""}`}
    >
      <button
        type="button"
        class="rv-head"
        aria-expanded={!isFolded}
        onClick={() => onFold(!isFolded)}
      >
        <span class="rv-chevron">{isFolded ? "▸" : "▾"}</span>
        <span class={`rv-status is-${t.status}`}>{STATUS_WORDS[t.status] ?? t.status}</span>
        <span class="rv-place">{placeOf(t)}</span>
        {t.waitsOn === "person" && <span class="rv-label is-yours">your turn</span>}
        {t.role !== "person" && <span class={`rv-label is-${t.role}`}>{t.by}</span>}
        {t.about !== undefined && <span class="rv-label is-broken">broken by a change</span>}
        <span class="rv-said">
          {isFolded && latest !== undefined ? `${latest.by}: ${latest.text}` : t.text}
        </span>
      </button>
      {!isFolded && (
        <div class="rv-body">
          <div class="rv-talk">
            <p class="rv-msg is-first">
              <b>{t.by}</b>
              {t.text}
            </p>
            {t.messages.map((m) => (
              <p
                key={`${m.at}·${m.by}`}
                class={`rv-msg is-${m.role}${m.status ? ` moves-${m.status}` : ""}`}
              >
                <b>{`${m.by}${m.status === "planned" ? " · plan" : m.status ? ` → ${m.status}` : ""}`}</b>
                {m.text || "—"}
              </p>
            ))}
            {t.changed !== undefined && t.changed.length > 0 && (
              <details class="rv-changed">
                <summary>{`${t.changed.length} file${t.changed.length === 1 ? "" : "s"} changed`}</summary>
                {t.changed.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </details>
            )}
            {t.reaches && (
              <details class="rv-changed">
                <summary>{reachWords(t.reaches)}</summary>
                {t.reaches.everything !== undefined ? (
                  <div>{t.reaches.everything}</div>
                ) : (
                  t.reaches.lessons.map((l) => <div key={l}>{l}</div>)
                )}
              </details>
            )}
            <form
              class="rv-reply"
              onSubmit={(e) => {
                e.preventDefault();
                void sendReply();
              }}
            >
              <textarea
                value={reply}
                placeholder={
                  t.status === "ready" || t.status === "planned"
                    ? "What's still wrong? (sends it back to the agent)"
                    : "Reply…"
                }
                onInput={(e) => setReply((e.target as HTMLTextAreaElement).value)}
                onKeyDown={sendKeys(
                  () => void sendReply(),
                  () => (document.activeElement as HTMLElement | null)?.blur(),
                )}
              />
              <div class="rv-actions">
                <button type="submit" disabled={reply.trim() === ""}>
                  Reply
                </button>
                {isLive && (
                  <button
                    type="button"
                    onClick={() => void act({ op: "write", id: t.id, text: "", status: "closed" })}
                  >
                    Close
                  </button>
                )}
                {isLive && (
                  <button
                    type="button"
                    onClick={() =>
                      void act({ op: "write", id: t.id, text: "", status: "withdrawn" })
                    }
                  >
                    Withdraw
                  </button>
                )}
                {t.board !== undefined && (
                  <a href={`?dev&${previewQuery(contentAddress(t.board))}&back=${back}`}>
                    Open board ↗
                  </a>
                )}
              </div>
            </form>
          </div>
          {t.board !== undefined && <LiveBoard thread={t} bus={bus} locale={locale} />}
        </div>
      )}
    </section>
  );
}

/** The thread's board as it is now, drawn by the real player, with the piece outlined. */
function LiveBoard({
  thread,
  bus,
  locale,
}: { thread: Thread; bus: EventBus; locale: Locale }): JSX.Element {
  const [shown, setShown] = useState<{ board: Shown; where: Sources[string] | undefined } | null>(
    null,
  );
  const [problem, setProblem] = useState<string | null>(null);
  const path = thread.board ?? "";
  useEffect(() => {
    let isLive = true;
    void (async () => {
      const [board, sources] = await Promise.all([
        shownAt(path),
        json("sources.json").catch(() => ({})) as Promise<Sources>,
      ]);
      await preloadProps([...propTypes(board.board.root, new Set())]);
      if (isLive) setShown({ board, where: sources[path] });
    })().catch((e: unknown) => isLive && setProblem(e instanceof Error ? e.message : String(e)));
    return () => {
      isLive = false;
    };
  }, [path]);
  // Outline what the thread is about, once drawn.
  useEffect(() => {
    if (shown === null) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const box = document.querySelector<HTMLElement>(`#thread-${thread.id} .preview-phone`);
      const el = box === null ? null : anchorOf(box, thread);
      if (el !== null) {
        el.classList.add("is-revealed");
        window.clearInterval(timer);
      } else if (++tries > 20) window.clearInterval(timer);
    }, 150);
    return () => window.clearInterval(timer);
  }, [shown, thread]);
  if (problem !== null)
    return <div class="rv-board rv-empty">{`The board couldn't be drawn: ${problem}`}</div>;
  if (shown === null) return <div class="rv-board rv-empty">Drawing the board…</div>;
  return (
    <div class="rv-board">
      <PreviewBoard
        shown={shown.board}
        where={shown.where}
        locale={locale}
        isPlaying={false}
        bus={bus}
        isShot={false}
        threads={[]}
        reviews={[]}
        onThreads={() => {}}
      />
    </div>
  );
}
