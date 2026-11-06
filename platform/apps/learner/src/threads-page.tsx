import { Locale } from "@chalk/content";
import { contentAddress, isAboveBoard, previewQuery, screenOf } from "@chalk/content/address";
import type { EventBus } from "@chalk/events";
import { preloadProps } from "@chalk/library";
import { useWhenChanged } from "@chalk/player";
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
import { ThreadOptions } from "./thread-options";
import { ThreadText } from "./thread-text";
import {
  type Thread,
  changeComments,
  isAsking,
  isFinished,
  reachWords,
  turnWords,
  useThreads,
} from "./threads";

/**
 * The open threads in the preview (development only; platform/docs/comments.md), `?dev&threads`:
 * every thread not yet settled, yours to answer first, then the agents'. Each is a fold: what was
 * said and every message since (an agent's question with its options as buttons), then its board as
 * it is now, drawn live with the piece outlined, and Reply, Close, Withdraw, Open board (which comes
 * back here). `&thread=<id>` opens at that thread.
 */

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
    ? // A planning file: its name in the chapter (outline.yaml, plan.md).
      (t.source ?? "plan")
        .replace(/:\d.*$/, "")
        .replace(/^authoring\/books\/[^/]+\/[^/]+\//, "")
        .replace(/^source\/([a-z]{2}\/)?/, "")
    : `${t.board.split("/").at(-1)}${t.target ? ` · ${t.target}` : ""}${t.prop ? ` · prop ${t.prop}` : ""}`;

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

/** The open threads as one page: yours first, each foldable, each with its board as it is now. */
export function ThreadsPage({ bus }: { bus: EventBus }): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const focus = params.get("thread");
  const locale = params.get("locale") === "hi" ? Locale.Hi : Locale.En;
  const {
    all: { threads },
    set,
  } = useThreads();
  const shown = useMemo(
    () => [
      ...threads.filter((t) => t.waitsOn === "person" || t.id === focus),
      ...threads.filter((t) => t.waitsOn !== null && t.waitsOn !== "person" && t.id !== focus),
    ],
    [threads, focus],
  );
  const [folds, setFolds] = useState<Record<string, boolean>>(readFolds);
  const isFolded = (t: Thread) => (t.id === focus ? false : (folds[t.id] ?? isFinished(t)));
  // A device never shows two boards at once: with several open, none is heard.
  const boardsOpen = shown.filter((t) => t.board !== undefined && !isFolded(t)).length;
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
  useWhenChanged([focus, shown.length], () => {
    if (focus === null) return;
    const el = document.getElementById(`thread-${focus}`);
    el?.scrollIntoView({ block: "start" });
  });
  useLayoutEffect(() => {
    if (shown.length > 0) document.body.dataset.previewReady = window.location.search;
  });

  const ready = shown.filter((t) => t.status === "ready" && t.waitsOn === "person");
  return (
    <main class="rv">
      <header class="rv-bar">
        <strong>Open threads</strong>
        <span>{standing(shown)}</span>
        <a href="?dev&activity">Activity</a>
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
      </header>
      {note !== null && <p class="rv-note">{note}</p>}
      {shown.length === 0 && <p class="rv-empty">Nothing here.</p>}
      {shown.map((t) => (
        <ThreadFold
          key={t.id}
          thread={t}
          isFolded={isFolded(t)}
          isSilent={boardsOpen > 1}
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
  isSilent,
  onFold,
  act,
  bus,
  locale,
}: {
  thread: Thread;
  isFolded: boolean;
  /** One of several boards open on the page: nothing is heard from it. */
  isSilent: boolean;
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
  const back = encodeURIComponent(`dev&threads&thread=${t.id}`);
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
        <span class={`rv-status is-${t.status}${t.waitsOn === "person" ? " is-yours" : ""}`}>
          {turnWords(t)}
        </span>
        {t.weight !== undefined && <span class={`rv-weight is-${t.weight}`}>{t.weight}</span>}
        <span class="rv-place">{placeOf(t)}</span>
        {isFolded && (
          <span class="rv-said">
            {latest !== undefined
              ? `${latest.by}: ${latest.text.split("\n")[0]}`
              : `${t.by}: ${t.text.split("\n")[0]}`}
          </span>
        )}
      </button>
      {!isFolded && (
        <div class="rv-body">
          <div class="rv-talk">
            {t.quote !== undefined && <blockquote class="rv-quote">{t.quote}</blockquote>}
            <div class="rv-msg is-first">
              <b>{t.by}</b>
              <ThreadText text={t.text} />
            </div>
            <ThreadOptions thread={t} act={act} />
            {t.messages.map((m) => (
              <div
                key={`${m.at}·${m.by}`}
                class={`rv-msg is-${m.role}${m.status ? ` moves-${m.status}` : ""}`}
              >
                <b>{`${m.by}${m.status === "planned" ? " · plan" : m.status ? ` → ${m.status}` : ""}`}</b>
                {m.text === "" ? "—" : <ThreadText text={m.text} />}
              </div>
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
              {!isAsking(t) && (
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
              )}
              <div class="rv-actions">
                {!isAsking(t) && (
                  <button type="submit" disabled={reply.trim() === ""}>
                    Reply
                  </button>
                )}
                {isLive && (
                  <button
                    type="button"
                    onClick={() => void act({ op: "write", id: t.id, text: "", status: "closed" })}
                  >
                    Close
                  </button>
                )}
                {isLive && t.role === "person" && (
                  <button
                    type="button"
                    onClick={() =>
                      void act({ op: "write", id: t.id, text: "", status: "withdrawn" })
                    }
                  >
                    Withdraw
                  </button>
                )}
                {t.board === undefined && t.source !== undefined && isInEditor && (
                  <button type="button" onClick={() => toEditor({ type: "open", site: t.source })}>
                    Open in file ↗
                  </button>
                )}
                {t.board !== undefined && (
                  <a
                    href={`?dev&${previewQuery(contentAddress(isAboveBoard(t.board) ? screenOf(t.board, t.target) : t.board))}&back=${back}`}
                  >
                    {isAboveBoard(t.board) ? "Open its screen ↗" : "Open board ↗"}
                  </a>
                )}
              </div>
            </form>
          </div>
          {/* A book's, chapter's or lesson's screen isn't a board: "Open its screen" shows it. */}
          {t.board !== undefined && !isAboveBoard(t.board) && (
            <BoardRuntime thread={t} bus={bus} locale={locale} isSilent={isSilent} />
          )}
        </div>
      )}
    </section>
  );
}

/** The thread's board as it is now, drawn by the real player, with the piece outlined. */
function BoardRuntime({
  thread,
  bus,
  locale,
  isSilent,
}: { thread: Thread; bus: EventBus; locale: Locale; isSilent: boolean }): JSX.Element {
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
        isSilent={isSilent}
        bus={bus}
        isShot={false}
        threads={[]}
        onThreads={() => {}}
      />
    </div>
  );
}
