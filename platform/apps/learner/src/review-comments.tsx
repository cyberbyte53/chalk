import type { Board, Locale, Piece } from "@chalk/content";
import { RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

/**
 * Where a comment stands. You comment (open); Claude proposes a change (proposed) or asks
 * (question); you approve (approved) or reply (back to open); Claude applies it (done).
 */
export const CommentStatus = {
  Open: "open",
  Proposed: "proposed",
  Question: "question",
  Approved: "approved",
  Done: "done",
} as const;
export type CommentStatus = (typeof CommentStatus)[keyof typeof CommentStatus];

export const statusLabel: Record<CommentStatus, string> = {
  open: "Waiting for Claude",
  proposed: "Proposal ready",
  question: "Claude asked",
  approved: "Approved, to apply",
  done: "Done",
};

export type ReviewComment = {
  id: string;
  createdAt: string;
  status: CommentStatus;
  lessonId: string;
  lessonTitle: string;
  board: string;
  boardIndex: number;
  /** The piece commented on, or null for the whole board. */
  piece: string | null;
  /** A named part inside the piece (an option, a button), when the tap landed on one. */
  part: string | null;
  /** What the piece said when the comment was made, in English. */
  snapshot: string;
  /** Where the board comes from, filled in by the dev server: `content/…/overview.ts (row 3)` or a family. */
  source?: string;
  sourcePath?: string;
  locale: Locale;
  /** Words selected on the screen when commenting, if any. */
  quote: string;
  text: string;
  /** Claude's proposed change: what it will do, and each edit as before and after. */
  proposal?: { summary: string; changes: { before: string; after: string }[] };
  thread: { by: "you" | "claude"; at: string; text: string }[];
};

export type NewComment = Omit<ReviewComment, "id" | "createdAt" | "status" | "thread">;

type Change =
  | { op: "add"; comment: NewComment }
  | { op: "reply"; id: string; text: string; status?: CommentStatus }
  | { op: "status"; id: string; status: CommentStatus }
  | { op: "remove"; id: string };

/** The comments file, through the dev server; re-read every few seconds to pick up Claude's replies. */
export function useComments(): {
  comments: readonly ReviewComment[];
  send: (change: Change) => Promise<void>;
  error: string | null;
} {
  const [comments, setComments] = useState<readonly ReviewComment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (init?: RequestInit) => {
    try {
      const res = await fetch("/dev-review", init);
      if (!res.ok) throw new Error(`${res.status}`);
      setComments((await res.json()) as ReviewComment[]);
      setError(null);
    } catch {
      setError("Comments couldn't be saved or loaded: is the dev server running?");
    }
  }, []);
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 8000);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);
  const send = useCallback(
    (change: Change) =>
      load({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(change),
      }),
    [load],
  );
  return { comments, send, error };
}

function findPiece(piece: Piece, name: string): Piece | undefined {
  if (piece.name === name) return piece;
  if ("children" in piece) {
    for (const child of piece.children) {
      const found = findPiece(child, name);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

type Localized = { en?: string };
/** What a piece says, in English: a line's text, a question's prompt (and the option tapped), or what a prop shows. */
export function snapshotOf(board: Board, name: string | null, part: string | null): string {
  if (name === null) return `Board "${board.name}"`;
  const piece = findPiece(board.root, name);
  if (piece === undefined || piece.kind !== "prop") return name;
  const w = (piece.with ?? {}) as Record<string, unknown>;
  const text = (w.text as Localized | undefined)?.en ?? (w.prompt as Localized | undefined)?.en;
  const options = (w.options as { id: string; label?: Localized }[] | undefined) ?? [];
  const option = options.find((o) => o.id === part);
  const about = (board.jugnu?.props as Record<string, string> | undefined)?.[name];
  const base = text ?? (about === undefined ? piece.prop : `${piece.prop}: ${about}`);
  return option?.label?.en === undefined ? base : `${base} → option "${option.label.en}"`;
}

/** Outlines, inside one phone, each piece that has comments, numbered; tapping one opens it. */
export function CommentMarks({
  phone,
  comments,
  numberOf,
  onOpen,
}: {
  phone: { current: HTMLDivElement | null };
  comments: readonly ReviewComment[];
  numberOf: (c: ReviewComment) => number;
  onOpen: (id: string) => void;
}): JSX.Element | null {
  const [boxes, setBoxes] = useState<{ id: string; n: number; done: boolean; at: DOMRect }[]>([]);
  const measure = useCallback(() => {
    const root = phone.current;
    if (root === null) return;
    const outer = root.getBoundingClientRect();
    // Measured rects are on screen; the marks are placed inside the phone, which may be zoomed.
    const k = root.offsetWidth > 0 ? outer.width / root.offsetWidth : 1;
    const next = comments.flatMap((c) => {
      if (c.piece === null) return [];
      const piece = root.querySelector(`[data-piece="${CSS.escape(c.piece)}"]`);
      const el =
        (c.part === null ? null : piece?.querySelector(`[data-part="${CSS.escape(c.part)}"]`)) ??
        piece;
      if (el === null || el === undefined) return [];
      const r = el.getBoundingClientRect();
      return [
        {
          id: c.id,
          n: numberOf(c),
          done: c.status === CommentStatus.Done,
          at: new DOMRect(
            (r.left - outer.left) / k,
            (r.top - outer.top) / k,
            r.width / k,
            r.height / k,
          ),
        },
      ];
    });
    setBoxes(next);
  }, [phone, comments, numberOf]);
  useLayoutEffect(() => {
    measure();
    const root = phone.current;
    if (root === null || comments.length === 0) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    const timer = window.setInterval(measure, 1500);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [measure, phone, comments.length]);
  if (boxes.length === 0) return null;
  return (
    <>
      {boxes.map((b) => (
        <button
          key={b.id}
          type="button"
          class={`review-mark${b.done ? " is-done" : ""}`}
          style={{
            left: `${b.at.x - 4}px`,
            top: `${b.at.y - 4}px`,
            width: `${b.at.width + 8}px`,
            height: `${b.at.height + 8}px`,
          }}
          aria-label={`Comment ${b.n}`}
          onClick={() => onOpen(b.id)}
        >
          <span>{b.n}</span>
        </button>
      ))}
    </>
  );
}

/** Where the last tap that opened a comment landed (viewport px), so the composer opens there. */
export const tapPoint: { x: number; y: number } | { x: null; y: null } = { x: null, y: null };

/** Remember a tap's position for the next composer. */
export function noteTap(x: number, y: number): void {
  Object.assign(tapPoint, { x, y });
}

const GAP = 12;
const EDGE = 12;

/**
 * Where the composer goes: beside the tap, below it if it fits, else above it, kept inside the
 * window. On a narrow screen (or with no tap) it stays a bottom sheet.
 */
function placeNear(
  sheet: HTMLElement,
  at: { x: number | null; y: number | null },
): { left: number; top: number } | null {
  if (at.x === null || at.y === null || window.innerWidth < 640) return null;
  const { width, height } = sheet.getBoundingClientRect();
  const left = Math.min(Math.max(at.x - width / 2, EDGE), window.innerWidth - width - EDGE);
  const below = at.y + GAP;
  const above = at.y - GAP - height;
  const top =
    below + height <= window.innerHeight - EDGE
      ? below
      : above >= EDGE
        ? above
        : Math.max(EDGE, window.innerHeight - height - EDGE);
  return { left, top };
}

/** The popup for writing a comment on what was tapped, opened where the tap landed. */
export function Composer({
  draft,
  onSave,
  onCancel,
}: {
  draft: NewComment;
  onSave: (text: string) => void;
  onCancel: () => void;
}): JSX.Element {
  const [text, setText] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);
  const sheet = useRef<HTMLElement>(null);
  const [place, setPlace] = useState<{ left: number; top: number } | null>(null);
  useLayoutEffect(() => {
    if (sheet.current !== null) setPlace(placeNear(sheet.current, { ...tapPoint }));
    // Focus without scrolling the page: the popup is already where the reviewer is looking.
    area.current?.focus({ preventScroll: true });
  }, []);
  const save = () => text.trim() !== "" && onSave(text.trim());
  return (
    <section
      class={`review-sheet${place === null ? "" : " is-near"}`}
      ref={sheet}
      aria-label="New comment"
      style={place === null ? undefined : { left: `${place.left}px`, top: `${place.top}px` }}
    >
      <div class="review-sheet-where">
        {`${draft.lessonTitle} · ${draft.boardIndex + 1} ${draft.board}${draft.piece === null ? " · whole board" : ` · ${draft.piece}`}`}
      </div>
      <div class="review-sheet-snap">
        <RichText text={draft.snapshot} />
      </div>
      {draft.quote !== "" && <blockquote class="review-quote">{draft.quote}</blockquote>}
      <textarea
        id="review-comment-text"
        ref={area}
        value={text}
        placeholder="What should change, or what's confusing?"
        onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
          if (e.key === "Escape") onCancel();
        }}
      />
      <div class="review-sheet-actions">
        <button type="button" class="review-chip" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" class="review-primary" disabled={text.trim() === ""} onClick={save}>
          Save comment
        </button>
      </div>
    </section>
  );
}

const Filter = { Needs: "needs", Waiting: "waiting", Done: "done", All: "all" } as const;
type Filter = (typeof Filter)[keyof typeof Filter];
const inFilter = (c: ReviewComment, f: Filter): boolean =>
  f === Filter.All
    ? true
    : f === Filter.Needs
      ? c.status === CommentStatus.Proposed || c.status === CommentStatus.Question
      : f === Filter.Waiting
        ? c.status === CommentStatus.Open || c.status === CommentStatus.Approved
        : c.status === CommentStatus.Done;

function CommentItem({
  c,
  n,
  send,
  onGo,
}: {
  c: ReviewComment;
  n: number;
  send: (change: Change) => Promise<void>;
  onGo: () => void;
}): JSX.Element {
  const [reply, setReply] = useState("");
  const replyAs = (status: CommentStatus) => {
    void send({ op: "reply", id: c.id, text: reply.trim(), status });
    setReply("");
  };
  return (
    <li class={`review-item is-${c.status}`} id={`comment-${c.id}`}>
      <div class="review-item-head">
        <button type="button" class="review-link" onClick={onGo}>
          {`#${n} · ${c.lessonTitle} · ${c.boardIndex + 1} ${c.board}${c.piece === null ? "" : ` · ${c.piece}`}`}
        </button>
        <span class={`review-pill is-${c.status}`}>{statusLabel[c.status]}</span>
      </div>
      {c.source !== undefined && <p class="review-msg">{c.source}</p>}
      {c.quote !== "" && <blockquote class="review-quote">{c.quote}</blockquote>}
      <p class="review-said">{c.text}</p>
      {c.thread.map((m) => (
        <p key={m.at} class={`review-msg by-${m.by}`}>
          <b>{m.by === "you" ? "You" : "Claude"}</b> {m.text}
        </p>
      ))}
      {c.proposal !== undefined && c.status !== CommentStatus.Open && (
        <div class="review-proposal">
          <p>
            <b>Proposal</b> {c.proposal.summary}
          </p>
          {c.proposal.changes.map((ch) => (
            <div key={ch.before} class="review-diff">
              <div class="review-before">
                <RichText text={ch.before} />
              </div>
              <div class="review-after">
                <RichText text={ch.after} />
              </div>
            </div>
          ))}
        </div>
      )}
      <textarea
        id={`reply-${c.id}`}
        class="review-reply"
        value={reply}
        placeholder={
          c.status === CommentStatus.Proposed ? "Change something in the proposal…" : "Reply…"
        }
        onInput={(e) => setReply((e.target as HTMLTextAreaElement).value)}
      />
      <div class="review-sheet-actions">
        {c.status === CommentStatus.Proposed && (
          <button
            type="button"
            class="review-primary"
            onClick={() =>
              reply.trim() === ""
                ? void send({ op: "status", id: c.id, status: CommentStatus.Approved })
                : replyAs(CommentStatus.Approved)
            }
          >
            Approve
          </button>
        )}
        <button
          type="button"
          class="review-chip"
          disabled={reply.trim() === ""}
          onClick={() => replyAs(CommentStatus.Open)}
        >
          {c.status === CommentStatus.Proposed ? "Ask for changes" : "Reply"}
        </button>
        {c.status === CommentStatus.Done && (
          <button
            type="button"
            class="review-chip"
            onClick={() => void send({ op: "status", id: c.id, status: CommentStatus.Open })}
          >
            Reopen
          </button>
        )}
        {c.status === CommentStatus.Open && c.thread.length === 0 && (
          <button
            type="button"
            class="review-chip"
            onClick={() => void send({ op: "remove", id: c.id })}
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}

/** The side panel: every comment, by what it needs. */
export function CommentPanel({
  comments,
  isAllChapters,
  onAllChapters,
  numberOf,
  send,
  onGo,
  onClose,
}: {
  /** The comments to list: the chapter on screen's, or every chapter's. */
  comments: readonly ReviewComment[];
  isAllChapters: boolean;
  onAllChapters: (isAll: boolean) => void;
  /** A comment's number among all of them, the same as its mark on the board. */
  numberOf: (c: ReviewComment) => number;
  send: (change: Change) => Promise<void>;
  onGo: (c: ReviewComment) => void;
  onClose: () => void;
}): JSX.Element {
  const [filter, setFilter] = useState<Filter>(Filter.Needs);
  const count = (f: Filter) => comments.filter((c) => inFilter(c, f)).length;
  const shown = comments.filter((c) => inFilter(c, filter));
  const proposed = comments.filter((c) => c.status === CommentStatus.Proposed);
  return (
    <aside class="review-panel" aria-label="Comments">
      <div class="review-row">
        <strong>Comments</strong>
        <button
          type="button"
          class="review-chip is-small"
          aria-pressed={isAllChapters}
          onClick={() => onAllChapters(!isAllChapters)}
        >
          {isAllChapters ? "All chapters" : "This chapter"}
        </button>
        <span class="review-hint" />
        <button type="button" class="review-chip" onClick={onClose}>
          Close
        </button>
      </div>
      <div class="review-chips">
        {(
          [
            [Filter.Needs, "Needs you"],
            [Filter.Waiting, "With Claude"],
            [Filter.Done, "Done"],
            [Filter.All, "All"],
          ] as const
        ).map(([f, label]) => (
          <button
            key={f}
            type="button"
            class="review-chip"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {`${label} ${count(f)}`}
          </button>
        ))}
      </div>
      {filter === Filter.Needs && proposed.length > 1 && (
        <button
          type="button"
          class="review-primary"
          onClick={() => {
            for (const c of proposed)
              void send({ op: "status", id: c.id, status: CommentStatus.Approved });
          }}
        >
          {`Approve all ${proposed.length} proposals`}
        </button>
      )}
      {shown.length === 0 ? (
        <p class="review-hint">Nothing here.</p>
      ) : (
        <ul class="review-list">
          {shown.map((c) => (
            <CommentItem key={c.id} c={c} n={numberOf(c)} send={send} onGo={() => onGo(c)} />
          ))}
        </ul>
      )}
    </aside>
  );
}
