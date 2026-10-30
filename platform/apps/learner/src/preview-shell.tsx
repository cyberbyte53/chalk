import {
  type Board,
  Locale,
  type Piece,
  builtChapterSchema,
  builtConceptSchema,
  builtFile,
  propBoard,
} from "@chalk/content";
import {
  PROPS_ROOT,
  contentAddress,
  parseAddress,
  previewQuery,
  propAddress,
} from "@chalk/content/address";
import type { EventBus } from "@chalk/events";
import { preloadProps, propLibrary, propPackages } from "@chalk/library";
import {
  BoardPlayer,
  BoardRuntime,
  BoardSpeedContext,
  SEP,
  SceneRuntime,
  addressOf,
  findNode,
  joinPath,
  namesOf,
  propPages,
  runningBoards,
  segment,
  stampCodePaths,
} from "@chalk/player";
import { useWhenChanged } from "@chalk/player";
import type { JSX } from "preact";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import type { ZodTypeAny } from "zod";
import { useChapterVoice } from "./chapter-voice";
import { CONTENT_ROUTE, boardOfFile } from "./content-store";
import type { Course } from "./course";
import { ChapterScreen, CourseScreen } from "./course-screens";
import {
  installAddressReports,
  installTextKeys,
  isInEditor,
  sendKeys,
  toEditor,
} from "./editor-link";
import { courses } from "./lessons";
import { LibraryScreen } from "./library-screen";
import { PlayInApp } from "./play-in-app";
import { PropPanel } from "./prop-panel";
import { ReviewList, ReviewPage } from "./review-page";
import { ScriptView } from "./script-view";
import { ThreadText } from "./thread-text";
import {
  type Review,
  type Thread,
  type Threads,
  changeComments,
  isKept,
  planOf,
  reachWords,
  useThreads,
} from "./threads";

/**
 * Development only (`?dev&at=<address>`): boards exactly as a phone draws them (the real player,
 * the real props, the app's CSS), one URL per address, for people and agents alike.
 *
 *   ?dev&at=content/                                                    every book, as its book screen
 *   ?dev&at=content/class10-maths                                       a book's screen (its chapters)
 *   ?dev&at=content/class10-maths/real-numbers                          a chapter's screen (its lessons)
 *   ?dev&at=content/class10-maths/real-numbers/division-lemma          every page of a lesson
 *   ?dev&at=content/class10-maths/real-numbers/division-lemma&show=questions   …then its questions
 *   ?dev&at=content/class10-maths/real-numbers/division-lemma/story          one page
 *   ?dev&at=content/class10-maths/real-numbers/questions/euclid-hcf/<id>     one question
 *   ?dev&source=content/class10-maths/real-numbers/questions/euclid-hcf   boards written in a file
 *                                                                    or folder (from sources.json)
 *
 * Book and chapter screens are the app's own; tapping a chapter or a lesson goes one level down.
 * `&play` plays it as the app does (play-in-app.tsx): the chapter's path, its lessons one board at
 * a time, results, from the board or lesson named. `&earned` keeps the boards side by side but
 * plays them as a student meets them (hidden pieces stay hidden until earned; the chalk MCP's
 * steps); without either everything is shown. `&locale=hi` for Hindi. `&shot` drops the chrome (for screenshots).
 * Each piece carries `data-source="content/…/overview.ts:42"` (from build/sources.json), so an
 * editor's browser or an agent pointed at a piece knows the line; Alt-click opens it in the editor.
 * Nothing here draws anything itself: the player does.
 */

export type Sources = Record<string, { board?: string; pieces: Record<string, string> }>;
export type Shown = { path: string; board: Board };

const url = (path: string) => `${CONTENT_ROUTE}${path}?t=${Date.now()}`;
export async function json(path: string): Promise<unknown> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`build/${path}: ${res.status} (run pnpm build-content?)`);
  return res.json();
}
/** A node's built item: build/<path>.json. */
const item = (path: string): Promise<unknown> => json(builtFile(path));

function unhide(piece: Piece): Piece {
  const { isHidden: _, ...rest } = piece;
  return "children" in rest
    ? ({ ...rest, children: rest.children.map(unhide) } as Piece)
    : (rest as Piece);
}

export function propTypes(piece: Piece, into: Set<string>): Set<string> {
  if ("prop" in piece && typeof piece.prop === "string") into.add(piece.prop);
  if ("children" in piece) for (const child of piece.children) propTypes(child, into);
  return into;
}

/** A page's or question's board, by its node path. */
export const shownAt = async (path: string): Promise<Shown> => ({
  path,
  board: await boardOfFile(await item(path)),
});

/**
 * The course path the page's `at` names (`content/…`), or undefined when it names none. A prop's
 * address is handled by its own page.
 */
function atPath(params: URLSearchParams): string | undefined {
  const at = params.get("at");
  if (at === null) return undefined;
  const a = parseAddress(at);
  return a.root === "content" ? a.path : undefined;
}

/** The library the page's `at` names (`library/props/`, or a package), if it names it. */
function atLibrary(params: URLSearchParams): { pkg?: string } | undefined {
  const at = params.get("at");
  if (at === null) return undefined;
  const a = parseAddress(at);
  return a.root === "library" ? (a.pkg === undefined ? {} : { pkg: a.pkg }) : undefined;
}

/** The prop the page's `at` names (`library/props/<package>/<type>`), if it names one. */
function atProp(params: URLSearchParams): { pkg: string; type: string } | undefined {
  const at = params.get("at");
  if (at === null) return undefined;
  const a = parseAddress(at);
  return a.root === "props" ? { pkg: a.pkg, type: a.type } : undefined;
}

/**
 * A prop on its own (its address): a board with only it on it, at its defaults or the fields in
 * `state`. Says what's wrong when the package has no such prop, the fields don't fit it, or it only
 * draws inside another prop's frame.
 */
function propShown(at: { pkg: string; type: string }, state: string | null): Shown {
  const defs = propPackages.get(at.pkg);
  if (defs === undefined)
    throw new Error(
      `No prop package "${at.pkg}" under library/props (packages: ${[...propPackages.keys()].join(", ")})`,
    );
  const def = defs.find((d) => d.type === at.type);
  if (def === undefined)
    throw new Error(
      `No prop "${at.type}" in library/props/${at.pkg} (its props: ${defs.map((d) => d.type).join(", ")})`,
    );
  if (def.drawsOn !== undefined)
    throw new Error(
      `${at.type} only draws inside a ${def.drawsOn} frame: look at it in a group that provides one`,
    );
  let given: Record<string, unknown> = {};
  if (state !== null) {
    try {
      given = JSON.parse(state) as Record<string, unknown>;
    } catch {
      throw new Error(`state isn't JSON: ${state}`);
    }
  }
  const checked = def.state.safeParse({ ...def.defaults, ...given });
  if (!checked.success)
    throw new Error(
      `${at.type} can't start from that state: ${checked.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`,
    );
  return { path: propAddress(at.pkg, at.type), board: propBoard(at.type, given) };
}

/** The boards a course path names, in order: one page or question, or a concept's. */
async function boardsAt(path: string, withQuestions: boolean): Promise<Shown[]> {
  const clean = path.replace(/\.json$/, "").replace(/\/$/, "");
  const parts = clean.split("/");
  if (parts.length >= 4) return [await shownAt(clean)];
  const [book, chapter] = parts;
  const concept = builtConceptSchema.parse(await item(clean));
  const pages = await Promise.all(concept.overview.map((ref) => shownAt(ref.path)));
  if (!withQuestions) return pages;
  const chapterJson = builtChapterSchema.parse(await item(`${book}/${chapter}`));
  const questions = await Promise.all(
    chapterJson.questions
      .filter((q) => q.tests.includes(concept.id))
      .map((ref) => shownAt(ref.path)),
  );
  return [...pages, ...questions];
}

/** The boards written in a content file or folder, in build order (from build/sources.json). */
async function boardsFrom(source: string, sources: Sources): Promise<Shown[]> {
  const prefix = source.replace(/\/$/, "");
  const fileOf = (site: string) => site.replace(/:\d+$/, "");
  const inside = (site: string | undefined) =>
    site !== undefined && (fileOf(site) === prefix || fileOf(site).startsWith(`${prefix}/`));
  const paths = Object.entries(sources)
    .filter(([, w]) => inside(w.board) || Object.values(w.pieces).some(inside))
    .map(([path]) => path)
    .slice(0, 120);
  return Promise.all(paths.map(shownAt));
}

export { isInEditor, toEditor };
installTextKeys();
installAddressReports();

/** Puts `data-source` on every piece of one drawn board; Alt-click opens that line. */
function useSourceTags(
  phone: { current: HTMLDivElement | null },
  where: Sources[string] | undefined,
  board?: string,
): void {
  useEffect(() => {
    const el = phone.current;
    if (el === null || where === undefined) return;
    const tag = () => {
      if (where.board !== undefined) el.dataset.source = where.board;
      for (const node of el.querySelectorAll<HTMLElement>("[data-piece]")) {
        const site = where.pieces[node.dataset.piece ?? ""];
        if (site !== undefined) node.dataset.source = site;
        // On the piece itself too, so a tool that reads one element (Cursor's design mode) has both.
        if (board !== undefined) node.dataset.board = board;
      }
    };
    tag();
    const watch = new MutationObserver(tag);
    watch.observe(el, { childList: true, subtree: true });
    return () => watch.disconnect();
  }, [phone, where, board]);
}

function openInEditor(site: string): void {
  if (isInEditor) {
    toEditor({ type: "open", site });
    return;
  }
  // Vite's own endpoint (LAUNCH_EDITOR=cursor picks Cursor); its root is platform/apps/learner.
  void fetch(`/__open-in-editor?file=${encodeURIComponent(`../../../${site}`)}`);
}

/** Where a comment stands, in words: waiting for the agent, planned, done. */
/** A thread's one label: whose turn it is, or how it was settled. */
const turnWords = (t: Thread): string =>
  t.waitsOn === "person"
    ? t.status === "ready"
      ? "your turn: ready"
      : "your turn"
    : t.waitsOn === "agent"
      ? t.status === "planned"
        ? "agent: planned"
        : "agent's turn"
      : t.status;

/**
 * The board's comments under it, newest first, each with its whole thread: what was said, what the
 * agent plans or did, and a reply box (a reply reopens the comment for the agent). Finished ones
 * are dimmed, and folded only when there are many.
 */
function BoardThreads({
  threads,
  reviews,
  onChange,
  phone,
}: {
  threads: readonly Thread[];
  reviews: readonly Review[];
  onChange: (all: Threads) => void;
  phone: { current: HTMLDivElement | null };
}): JSX.Element {
  const list = useRef<HTMLUListElement>(null);
  const isDone = (t: Thread) => t.status === "closed" || t.status === "withdrawn";
  const open = threads.filter((t) => !isDone(t));
  const closed = threads.filter(isDone);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  // Settled threads are history: folded into one line at the end, opened on demand.
  const [isHistory, setIsHistory] = useState(false);
  // One thread open at a time: the others are a card each (what was said, the latest answer).
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const act = async (change: Record<string, unknown>) => {
    const after = await changeComments(change);
    if (typeof after === "string") {
      setProblem(after);
      return false;
    }
    setProblem(null);
    onChange(after);
    return true;
  };
  const send = async (t: Thread) => {
    const text = draft.trim();
    if (text === "" || !(await act({ op: "write", id: t.id, text }))) return;
    setDraft("");
    setReplyingTo(null);
  };
  const reveal = (t: Thread, on: boolean) => {
    const el = phone.current === null ? null : anchorOf(phone.current, t);
    el?.classList.toggle("is-revealed", on);
  };
  const isDetached = (t: Thread) =>
    t.target !== undefined && phone.current !== null && anchorOf(phone.current, t) === null;
  const one = (t: Thread) => {
    const isOpen = openId === t.id || replyingTo === t.id;
    const latest = [...t.messages].reverse().find((m) => m.text !== "");
    return (
      <li
        key={t.id}
        data-id={t.id}
        class={`preview-thread is-${t.status}${isOpen ? " is-open" : ""}`}
        onMouseEnter={() => reveal(t, true)}
        onMouseLeave={() => reveal(t, false)}
      >
        <button
          type="button"
          class="preview-thread-head"
          aria-expanded={isOpen}
          onClick={() => setOpenId(isOpen ? null : t.id)}
        >
          <span class={`preview-turn is-${t.waitsOn ?? t.status}`}>{turnWords(t)}</span>
          {t.prop !== undefined ? (
            <span class="preview-piece is-prop">{`prop ${t.prop}${t.target?.includes(SEP) ? `${SEP}${t.target.slice(t.target.indexOf(SEP) + 1)}` : ""}`}</span>
          ) : (
            t.target && <span class="preview-piece">{t.target}</span>
          )}
          <span class="preview-thread-text">
            <ThreadText text={t.text} />
          </span>
        </button>
        {isDetached(t) && (
          <div class="preview-detached">{`Not on this board any more. It said: ${t.snapshot ?? "?"}`}</div>
        )}
        {!isOpen && latest !== undefined && (
          <button type="button" class="preview-latest" onClick={() => setOpenId(t.id)}>
            <span class="preview-who">{latest.by}</span>
            <ThreadText text={latest.text} />
          </button>
        )}
        {isOpen && (
          <div class="preview-reply">
            <span class="preview-who">{`${t.by}${t.from === "chat" ? " (in chat)" : ""}`}</span>
          </div>
        )}
        {isOpen && planOf(t) && (
          <div class="preview-plan">
            <span class="preview-who">plan</span>
            <ThreadText text={planOf(t)?.text ?? ""} />
          </div>
        )}
        {isOpen &&
          t.messages
            .filter((m) => m.status !== "planned")
            .map((m) => (
              <div class="preview-reply" key={`${m.at}·${m.by}`}>
                <span class="preview-who">{`${m.by}${m.status ? ` → ${m.status}` : ""}`}</span>
                {m.text !== "" && <ThreadText text={m.text} />}
              </div>
            ))}
        {isOpen && t.changed && t.changed.length > 0 && (
          <details class="preview-changed">
            <summary>{`${t.changed.length} file${t.changed.length === 1 ? "" : "s"} changed`}</summary>
            {t.changed.map((f) => (
              <div key={f}>{f}</div>
            ))}
          </details>
        )}
        {isOpen && t.reaches && (
          <details class="preview-changed">
            <summary>{reachWords(t.reaches)}</summary>
            {t.reaches.everything !== undefined ? (
              <div>{t.reaches.everything}</div>
            ) : (
              t.reaches.lessons.map((l) => <div key={l}>{l}</div>)
            )}
          </details>
        )}
        {!isOpen ? null : replyingTo === t.id ? (
          <form
            class="preview-reply-form"
            onSubmit={(e) => {
              e.preventDefault();
              void send(t);
            }}
          >
            <textarea
              value={draft}
              placeholder={isDone(t) ? "Reopen it with…" : "Add to this comment…"}
              ref={(el) => el?.focus()}
              onInput={(e) => setDraft((e.target as HTMLTextAreaElement).value)}
              onKeyDown={sendKeys(
                () => void send(t),
                () => setReplyingTo(null),
              )}
            />
            <div>
              <button type="submit" disabled={draft.trim() === ""}>
                Reply
              </button>
              <button type="button" onClick={() => setReplyingTo(null)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div class="preview-actions">
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setReplyingTo(t.id);
              }}
            >
              Reply
            </button>
            {!isDone(t) && (
              <button
                type="button"
                onClick={() => void act({ op: "write", id: t.id, text: "", status: "closed" })}
              >
                Close
              </button>
            )}
            {!isDone(t) &&
              (isKept(t, reviews) ? (
                <button
                  type="button"
                  onClick={() => void act({ op: "write", id: t.id, text: "", status: "withdrawn" })}
                >
                  Withdraw
                </button>
              ) : (
                <button type="button" onClick={() => void act({ op: "delete", id: t.id })}>
                  Delete
                </button>
              ))}
          </div>
        )}
        {problem !== null && replyingTo !== t.id && <div class="preview-problem">{problem}</div>}
      </li>
    );
  };
  // Beside the board, each level with what it is about (its piece, its prop's part), pushed
  // down only as far as needed not to overlap; under the board when the window is narrow.
  useLayoutEffect(() => {
    const ul = list.current;
    const ph = phone.current;
    if (ul === null || ph === null) return;
    const byId = new Map(threads.map((t) => [t.id, t]));
    const isSettled = (li: HTMLElement) => {
      const t = byId.get(li.dataset.id ?? "");
      return t !== undefined && isDone(t);
    };
    let frame = 0;
    const place = () => {
      const items = [...ul.children] as HTMLElement[];
      if (getComputedStyle(ul).position === "static") {
        for (const li of items) li.style.top = "";
        ul.style.minHeight = "";
        return;
      }
      const base = ul.getBoundingClientRect().top;
      // Live threads beside what they are about; the settled line and history after them all.
      const live = items.filter((li) => li.dataset.fold === undefined && !isSettled(li));
      const after = items.filter((li) => !live.includes(li));
      const wanted = live.map((li) => {
        const t = byId.get(li.dataset.id ?? "");
        const el = t === undefined ? null : anchorOf(ph, t);
        return { li, top: el === null ? 0 : el.getBoundingClientRect().top - base };
      });
      let bottom = 0;
      for (const { li, top } of [
        ...wanted.sort((x, y) => x.top - y.top),
        ...after.map((li) => ({ li, top: 0 })),
      ]) {
        const at = Math.max(top, bottom);
        li.style.top = `${at}px`;
        bottom = at + li.offsetHeight + 8;
      }
      ul.style.minHeight = `${bottom}px`;
    };
    const later = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    const sizes = new ResizeObserver(later);
    sizes.observe(ph);
    sizes.observe(ul);
    const changes = new MutationObserver(later);
    changes.observe(ph, { childList: true, subtree: true });
    window.addEventListener("resize", later);
    return () => {
      cancelAnimationFrame(frame);
      sizes.disconnect();
      changes.disconnect();
      window.removeEventListener("resize", later);
    };
  });
  return (
    <ul class="preview-threads" ref={list}>
      {open.map(one)}
      {closed.length > 0 && (
        <li class="preview-history" data-fold="">
          <button type="button" aria-expanded={isHistory} onClick={() => setIsHistory(!isHistory)}>
            {`${closed.length} settled ${closed.length === 1 ? "thread" : "threads"}`}
          </button>
        </li>
      )}
      {isHistory && closed.map(one)}
    </ul>
  );
}

/**
 * What a comment is about, on the drawn board: the part of the prop picked, else its piece (for a
 * prop comment, that prop where this board places it); null for a comment on the whole board.
 */
export function anchorOf(phone: HTMLElement, t: Thread): HTMLElement | null {
  const target = t.target ?? "";
  const [pieceName] = namesOf(target);
  // The part's address under its piece ("objectArrow/object"), if the comment is on a part.
  const under = target.includes(SEP) ? target.slice(target.indexOf(SEP) + 1) : undefined;
  const named = pieceName
    ? phone.querySelector<HTMLElement>(`[data-piece="${CSS.escape(pieceName)}"]`)
    : null;
  const piece =
    t.prop === undefined
      ? named
      : named?.classList.contains(`prop-${t.prop}`)
        ? named
        : phone.querySelector<HTMLElement>(`.prop-${CSS.escape(t.prop)}`);
  if (piece === null || piece === undefined) return null;
  const part =
    under === undefined
      ? undefined
      : findNode(piece.parentElement ?? phone, joinPath(segment(piece.dataset.piece ?? ""), under));
  return (part as HTMLElement | undefined) ?? piece;
}

export function PreviewBoard({
  shown,
  where,
  locale,
  isPlaying,
  bus,
  isShot,
  threads,
  reviews,
  onThreads,
}: {
  shown: Shown;
  where: Sources[string] | undefined;
  locale: Locale;
  isPlaying: boolean;
  bus: EventBus;
  isShot: boolean;
  threads: readonly Thread[];
  reviews: readonly Review[];
  onThreads: (all: Threads) => void;
}): JSX.Element {
  const board = useMemo(
    () => (isPlaying ? shown.board : { ...shown.board, root: unhide(shown.board.root) }),
    [shown, isPlaying],
  );
  const phone = useRef<HTMLDivElement>(null);
  useSourceTags(phone, where, shown.path);
  // Played as a student would (not a tool's picture): the chapter's voice, when it has one.
  const voice = useChapterVoice(shown.path, isPlaying && !isShot);
  // The board's script beside it, while reviewing (`&noscript`, or v, hides it): every line it can
  // say, including those only an interaction sets off, and each clip.
  const isScript = !new URLSearchParams(window.location.search).has("noscript");
  // A prop on its own page: what a lesson controls, beside it (prop-panel.tsx).
  const isProp = shown.path.startsWith(PROPS_ROOT);
  const [runtime, setRuntime] = useState<BoardRuntime | undefined>(undefined);
  const onClick = (e: MouseEvent) => {
    if (!e.altKey) return;
    const site = (e.target as HTMLElement).closest<HTMLElement>("[data-source]")?.dataset.source;
    if (site === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    openInEditor(site);
  };
  return (
    <section
      class={`preview-card${!isShot && threads.length > 0 ? " has-threads" : ""}${!isShot && (isProp || isScript) ? " has-panel" : ""}`}
      data-board={shown.path}
    >
      {!isShot && (
        <div class="preview-tag">
          <a href={`?dev&${previewQuery(contentAddress(shown.path))}`}>{board.name}</a>
          {where?.board !== undefined && (
            <button type="button" onClick={() => where.board && openInEditor(where.board)}>
              {where.board.replace(/^content\//, "")}
            </button>
          )}
        </div>
      )}
      <div class="preview-body">
        <div class="lesson preview-phone" ref={phone} onClickCapture={onClick}>
          {voice.isReady && (
            <BoardPlayer
              onRuntime={
                isProp
                  ? (live) => setRuntime(live instanceof BoardRuntime ? live : undefined)
                  : undefined
              }
              board={board}
              registry={propLibrary}
              locale={locale}
              record={bus.record}
              audio={voice.source}
              onPass={() => {
                const w = window as Window & { __chalkPassed?: string[] };
                w.__chalkPassed ??= [];
                w.__chalkPassed.push(shown.path);
              }}
            />
          )}
        </div>
        {!isShot && isProp && runtime !== undefined && (
          <PropPanel runtime={runtime} piece={board.name} />
        )}
        {!isShot && isScript && !isProp && (
          <ScriptView path={shown.path} boardId={board.item?.id} locale={locale} />
        )}
        {!isShot && threads.length > 0 && (
          <BoardThreads threads={threads} reviews={reviews} onChange={onThreads} phone={phone} />
        )}
      </div>
    </section>
  );
}

/** A piece's words with its maths as TeX (`$x^2 - 4$`), not KaTeX's doubled screen text. */
function wordsOf(piece: HTMLElement): string {
  const copy = piece.cloneNode(true) as HTMLElement;
  for (const maths of copy.querySelectorAll(".katex")) {
    const tex = maths.querySelector('annotation[encoding="application/x-tex"]')?.textContent;
    maths.replaceWith(tex ? `$${tex.trim()}$` : (maths.textContent ?? ""));
  }
  for (const node of copy.querySelectorAll("button, p, div, li")) node.append(" ");
  return (copy.textContent ?? "").replace(/\s+/g, " ").trim();
}

/** Asks the page to bring a board up (by its build path), when boards show one at a time. */
const SHOW_CARD = "chalk:show-card";

/** Goes to another level of the tree (and tells an editor showing this page). */
function go(board: string, isAtEnd = false): void {
  // Only the preview moves; the editor stays on the file you're in (Alt-click a piece to open it).
  // The new page tells the editor where it is (installAddressReports).
  const params = new URLSearchParams(window.location.search);
  params.delete("source");
  params.set("at", contentAddress(board));
  if (isAtEnd) params.set("end", "");
  else params.delete("end");
  window.location.search = params
    .toString()
    .replace(/%2F/g, "/")
    .replace(/=(&|$)/g, "$1");
}

/**
 * The lesson after (or before) one, as a student meets them: the next in its chapter, else the
 * first of the next chapter in the book (the last of the previous one going back).
 */
async function lessonBeside(lesson: string, by: 1 | -1): Promise<string | undefined> {
  const chapterOf = lesson.split("/").slice(0, 2).join("/");
  const course = courses.find((c) => c.chapters.some((ch) => ch.path === chapterOf));
  const chapters = course?.chapters.map((ch) => ch.path) ?? [];
  const lessonsOf = async (chapter: string) =>
    ((await item(chapter)) as { concepts: { path: string }[] }).concepts.map((c) => c.path);
  let at = chapters.indexOf(chapterOf);
  if (at === -1) return undefined;
  let lessons = await lessonsOf(chapterOf);
  let i = lessons.indexOf(lesson) + by;
  while (i < 0 || i >= lessons.length) {
    at += by;
    const chapter = chapters[at];
    if (chapter === undefined) return undefined;
    lessons = await lessonsOf(chapter);
    i = by === 1 ? 0 : lessons.length - 1;
  }
  return lessons[i];
}

/** Books and chapters, drawn by the app's own screens. */
function TreeScreen({ path, locale }: { path: string; locale: Locale }): JSX.Element {
  const [book, chapter] = path === "" ? [] : path.split("/");
  const shown: readonly Course[] =
    book === undefined
      ? courses
      : courses.filter((c) => (c.chapters[0]?.path ?? "").startsWith(`${book}/`));
  if (shown.length === 0)
    return <div class="preview-empty">No book {book} in build/ (run pnpm build-content?)</div>;
  if (chapter === undefined)
    return (
      <main class="preview">
        {shown.map((course) => {
          const bookSlug = (course.chapters[0]?.path ?? "").split("/")[0] ?? "";
          return (
            <section class="preview-card" key={course.id} data-board={bookSlug}>
              <div class="preview-tag">
                <a href={`?dev&${previewQuery(contentAddress(bookSlug))}`}>{bookSlug}</a>
              </div>
              <div class="preview-phone" data-source={`content/${bookSlug}/build.yaml:1`}>
                <CourseScreen
                  course={course}
                  locale={locale}
                  onChapter={(i) => {
                    const slug = course.chapters[i]?.path ?? "";
                    go(slug);
                  }}
                  onBack={() => go("")}
                />
              </div>
            </section>
          );
        })}
      </main>
    );
  const course = shown[0];
  const index = course?.chapters.findIndex((c) => c.path === `${book}/${chapter}`) ?? -1;
  const found = index === -1 ? undefined : course?.chapters[index];
  if (found === undefined) return <div class="preview-empty">No chapter {path} in build/</div>;
  return (
    <main class="preview">
      <section class="preview-card" data-board={path}>
        <div class="preview-tag">
          <a href={`?dev&${previewQuery(contentAddress(book ?? ""))}`}>{book}</a>
          <span>{chapter}</span>
        </div>
        <div class="preview-phone" data-source={`content/${path}/build.yaml:1`}>
          <ChapterScreen
            chapter={found}
            number={index + 1}
            locale={locale}
            progress={{}}
            onConcept={(id) => {
              void item(found.path).then((raw) => {
                const ref = (raw as { concepts: { id: string; path: string }[] }).concepts.find(
                  (c) => c.id === id,
                );
                const lesson = ref?.path;
                if (lesson !== undefined) go(lesson);
              });
            }}
            onBack={() => go(book ?? "")}
          />
        </div>
      </section>
    </main>
  );
}

/** The comments to show under a board: its own, and those on the props it places. */
function threadsOn(threads: readonly Thread[], shown: Shown): Thread[] {
  const path = shown.path;
  const props = propTypes(shown.board.root, new Set());
  return threads.filter((t) => (t.prop !== undefined ? props.has(t.prop) : t.board === path));
}

/** The package (folder under library/props) each prop type comes from. */
const packageOfProp = new Map(
  [...propPackages].flatMap(([name, defs]) => defs.map((def) => [def.type, name] as const)),
);

/** Asks for a comment box next to a picked element (PickComposer). */
const COMPOSE = "chalk:compose";
type Composing = {
  el: HTMLElement;
  words: string;
  pick: Record<string, string | undefined> & { board?: string; propPackage?: string };
};

/**
 * The box for a comment, next to what was picked: under it, or above it when there's no room
 * below; it moves with the page. ⌘↵ files it (through the editor, which writes the thread), Esc
 * leaves.
 */
function PickComposer(): JSX.Element | null {
  const [at, setAt] = useState<Composing | null>(null);
  const [note, setNote] = useState("");
  // A prop picked on a board: is this about this board, or the prop wherever it is used?
  const [scope, setScope] = useState<"board" | "prop" | undefined>(undefined);
  const [, setTick] = useState(0);
  useEffect(() => {
    const open = (e: Event) => {
      const detail = (e as CustomEvent<Composing>).detail;
      setAt(detail);
      setNote("");
      // On a prop's own page there is only the prop; elsewhere the person says which.
      setScope(
        detail.pick.propPackage === undefined
          ? "board"
          : (detail.pick.board ?? "").startsWith(PROPS_ROOT)
            ? "prop"
            : undefined,
      );
    };
    const move = () => setTick((n) => n + 1);
    window.addEventListener(COMPOSE, open);
    window.addEventListener("scroll", move, true);
    window.addEventListener("resize", move);
    return () => {
      window.removeEventListener(COMPOSE, open);
      window.removeEventListener("scroll", move, true);
      window.removeEventListener("resize", move);
    };
  }, []);
  useEffect(() => {
    if (at === null) return;
    at.el.classList.add("is-composing");
    return () => at.el.classList.remove("is-composing");
  }, [at]);
  if (at === null || !at.el.isConnected) return null;
  const close = () => setAt(null);
  const send = () => {
    if (note.trim() === "" || scope === undefined) return;
    toEditor({ type: "comment", ...at.pick, scope, note: note.trim() });
    close();
  };
  const isAsking =
    at.pick.propPackage !== undefined && !(at.pick.board ?? "").startsWith(PROPS_ROOT);
  const box = at.el.getBoundingClientRect();
  const HEIGHT = 150;
  const WIDTH = Math.min(360, window.innerWidth - 16);
  const below = box.bottom + 8 + HEIGHT <= window.innerHeight || box.top < HEIGHT + 16;
  const top = below
    ? Math.min(box.bottom + 8, window.innerHeight - HEIGHT - 8)
    : box.top - HEIGHT - 8;
  const left = Math.max(8, Math.min(box.left, window.innerWidth - WIDTH - 8));
  return (
    <form
      class="pick-composer"
      style={{ top: `${Math.max(8, top)}px`, left: `${left}px`, width: `${WIDTH}px` }}
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <div class="pick-composer-what">{`Comment on ${at.words}`}</div>
      {isAsking && (
        <fieldset class="pick-composer-scope">
          <legend>What is it about?</legend>
          {(
            [
              ["board", "This board"],
              ["prop", "The prop, everywhere"],
            ] as const
          ).map(([value, words]) => (
            <label key={value} class={scope === value ? "is-on" : ""}>
              <input
                type="radio"
                name="scope"
                checked={scope === value}
                onChange={() => setScope(value)}
              />
              {words}
            </label>
          ))}
        </fieldset>
      )}
      <textarea
        value={note}
        placeholder="What's wrong, or what should change?"
        ref={(el) => el?.focus()}
        onInput={(e) => setNote((e.target as HTMLTextAreaElement).value)}
        onKeyDown={sendKeys(send, close)}
      />
      <div class="pick-composer-actions">
        <span>⌘↵ save · Esc cancel</span>
        <button type="button" onClick={close}>
          Cancel
        </button>
        <button type="submit" disabled={note.trim() === "" || scope === undefined}>
          Comment
        </button>
      </div>
    </form>
  );
}

type PickTarget = {
  /** What it outlines. */
  el: HTMLElement;
  pieceEl?: HTMLElement;
  board?: string;
  piece?: string;
  part?: string;
  prop?: string;
  propPackage?: string;
  words: string;
};

/**
 * What a click can pick at a point, finest first: each part of a prop under the pointer (a
 * slider, a stepper, one bar; inner before outer), the piece, the whole board. The click takes the
 * finest; ↑ widens it, ↓ narrows it again. A comment on a prop or its part on a board asks whether
 * it is about this board or the prop wherever it is used (then filed with the prop,
 * library/props/<package>/comments.yaml, and shown wherever it is used); the basics (words,
 * choices, buttons) are the lesson's own, so those stay with the board. On a prop's own page,
 * everything is the prop's.
 */
/** An element's address under its piece ("objectArrow/object"). */
function underPiece(el: Element): string | undefined {
  const address = addressOf(el);
  return address?.includes(SEP) ? address.slice(address.indexOf(SEP) + 1) : undefined;
}

function picksAt(target: HTMLElement): PickTarget[] {
  const card = target.closest<HTMLElement>("[data-board]");
  // A line on the board's sound track (script-view.tsx) is part of the board like a piece: a
  // piece's line is "<piece>/said", a line of its own its name.
  const lineEl = target.closest<HTMLElement>("[data-script-line]");
  if (card !== null && lineEl !== null) {
    const line = lineEl.dataset.scriptLine ?? "";
    const piece = lineEl.dataset.scriptPiece;
    return [
      {
        el: lineEl,
        board: card.dataset.board,
        piece: piece ?? line,
        ...(piece === undefined ? {} : { part: "said" }),
        words: piece === undefined ? `line ${line}` : `${piece}${SEP}said`,
      },
    ];
  }
  const phone = target.closest<HTMLElement>(".preview-phone");
  if (card === null || phone === null) return [];
  const board = card.dataset.board;
  const whole: PickTarget = { el: phone, board, words: "board" };
  const pieceEl = target.closest<HTMLElement>("[data-piece]") ?? undefined;
  if (pieceEl === undefined) return [whole];
  const prop = /(?:^|\s)prop-(\S+)/.exec(pieceEl.className)?.[1];
  const pkg = prop === undefined ? undefined : packageOfProp.get(prop);
  const piece = pieceEl.dataset.piece;
  // On a prop's own page everything is the prop's; on a board, the basics (words, choices,
  // buttons) are the lesson's own.
  const isProp = pkg !== undefined && (pkg !== "basics" || (board ?? "").startsWith(PROPS_ROOT));
  const of = (el: HTMLElement, part?: string): PickTarget => ({
    el,
    pieceEl,
    board,
    piece,
    part,
    prop,
    propPackage: isProp ? pkg : undefined,
    words: isProp
      ? `prop ${prop}${part ? `${SEP}${part}` : ""}`
      : `${piece}${part ? `${SEP}${part}` : ""}`,
  });
  const parts: PickTarget[] = [];
  for (
    let el = target.closest<HTMLElement>("[data-part]");
    el !== null && pieceEl.contains(el) && el !== pieceEl;
    el = el.parentElement?.closest<HTMLElement>("[data-part]") ?? null
  )
    parts.push(of(el, underPiece(el)));
  return [...parts, of(pieceEl), whole];
}

/**
 * When this page sits in an editor's panel: the editor asks it to show the piece written at a
 * line (`reveal`) or to let the person pick a piece (`select`); a pick goes back with its board,
 * piece, line and words.
 */
function useEditorLink(): [boolean, (on: boolean | ((was: boolean) => boolean)) => void] {
  const [isSelecting, setIsSelecting] = useState(false);
  useEffect(() => {
    if (!isInEditor) return;
    const onMessage = (e: MessageEvent) => {
      const m = e.data as {
        chalk?: boolean;
        type?: string;
        file?: string;
        line?: number;
        on?: boolean;
      };
      if (m?.chalk !== true) return;
      if (m.type === "select") setIsSelecting(m.on === true);
      if (m.type === "reveal" && m.file !== undefined) {
        let best: HTMLElement | undefined;
        let bestLine = -1;
        for (const el of document.querySelectorAll<HTMLElement>("[data-source]")) {
          const [file, line] = (el.dataset.source ?? "").split(/:(?=\d+$)/);
          const n = Number(line);
          if (file === m.file && n <= (m.line ?? 0) && n > bestLine) {
            best = el;
            bestLine = n;
          }
        }
        if (best === undefined) return;
        // One board at a time: bring its board up first.
        const card = best.closest<HTMLElement>("[data-board]")?.dataset.board;
        if (card !== undefined) window.dispatchEvent(new CustomEvent(SHOW_CARD, { detail: card }));
        const target = best;
        requestAnimationFrame(() => target.scrollIntoView({ block: "center", behavior: "smooth" }));
        for (const old of document.querySelectorAll(".is-revealed"))
          old.classList.remove("is-revealed");
        best.classList.add("is-revealed");
      }
    };
    window.addEventListener("message", onMessage);
    toEditor({ type: "ready" });
    return () => window.removeEventListener("message", onMessage);
  }, []);
  useEffect(() => {
    if (!isSelecting) return;
    const label = document.createElement("div");
    label.className = "pick-label";
    document.body.append(label);
    let shown: HTMLElement | undefined;
    let under: HTMLElement | undefined;
    let wider = 0;
    const current = (): PickTarget | undefined => {
      const all = under === undefined ? [] : picksAt(under);
      return all[Math.min(wider, all.length - 1)];
    };
    const draw = () => {
      const at = current();
      shown?.classList.remove("is-pick-target");
      shown = at?.el;
      label.hidden = at === undefined;
      if (at === undefined) return;
      at.el.classList.add("is-pick-target");
      label.textContent = `${at.words}  ↑↓`;
      const box = at.el.getBoundingClientRect();
      label.style.left = `${Math.max(4, box.left)}px`;
      label.style.top = `${Math.max(4, box.top - 26)}px`;
    };
    const hover = (e: MouseEvent) => {
      if (e.target === under) return;
      under = e.target as HTMLElement;
      wider = 0;
      draw();
    };
    const widen = (e: KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      e.stopPropagation();
      const most = (under === undefined ? 1 : picksAt(under).length) - 1;
      wider = Math.max(0, Math.min(most, wider + (e.key === "ArrowUp" ? 1 : -1)));
      draw();
    };
    const pick = (e: MouseEvent) => {
      under = e.target as HTMLElement;
      const at = current();
      if (at === undefined) return;
      e.preventDefault();
      e.stopPropagation();
      setIsSelecting(false);
      // Outside an editor there is no chat to send it to: open its line instead.
      if (!isInEditor) {
        const site = at.el.closest<HTMLElement>("[data-source]")?.dataset.source;
        if (site !== undefined) openInEditor(site);
        return;
      }
      // The comment is written next to what was picked (PickComposer), then filed by the editor.
      window.dispatchEvent(
        new CustomEvent<Composing>(COMPOSE, {
          detail: {
            el: at.el,
            words: at.words,
            pick: {
              board: at.board,
              piece: at.piece,
              part: at.part,
              prop: at.prop,
              propPackage: at.propPackage,
              site: (at.pieceEl ?? at.el).dataset.source,
              text: wordsOf(at.el).slice(0, 400),
            },
          },
        }),
      );
    };
    window.addEventListener("keydown", widen, true);
    document.addEventListener("mouseover", hover, true);
    document.addEventListener("click", pick, true);
    document.body.classList.add("is-selecting");
    return () => {
      window.removeEventListener("keydown", widen, true);
      document.removeEventListener("mouseover", hover, true);
      document.removeEventListener("click", pick, true);
      document.body.classList.remove("is-selecting");
      shown?.classList.remove("is-pick-target");
      label.remove();
    };
  }, [isSelecting]);
  // The editor's Pick button follows the key.
  useEffect(() => {
    toEditor({ type: "selecting", on: isSelecting });
  }, [isSelecting]);
  return [isSelecting, setIsSelecting];
}

/** A view setting kept in the URL (play as the app, Hindi): the editor's panel owns it when there is one. */
function toggleParam(name: "play" | "locale" | "script"): void {
  if (name === "script") {
    const params = new URLSearchParams(window.location.search);
    if (params.has("noscript")) params.delete("noscript");
    else params.set("noscript", "");
    window.location.search = params.toString().replace(/=(&|$)/g, "$1");
    return;
  }
  if (isInEditor) {
    toEditor({ type: "toggle", what: name === "play" ? "play" : "hindi" });
    return;
  }
  const params = new URLSearchParams(window.location.search);
  if (name === "play") {
    if (params.has("play")) params.delete("play");
    else params.set("play", "");
  } else if (params.get("locale") === "hi") params.delete("locale");
  else params.set("locale", "hi");
  window.location.search = params.toString().replace(/=(&|$)/g, "$1");
}

const ZOOM_KEY = "chalk-preview-zoom";
function keptZoom(): number {
  try {
    const n = Number(window.localStorage.getItem(ZOOM_KEY));
    return n >= 0.5 && n <= 2 ? n : 1;
  } catch {
    return 1;
  }
}

/**
 * The preview, drawn afresh for each URL. A tool can move it to another board without reloading
 * the page (history.pushState, then a popstate event), which is much faster than a page load.
 * When a board is drawn, body[data-preview-ready] is set to its URL's query, so a tool knows the
 * boards on screen are the ones it asked for; data-preview-shown says which query an error or
 * "nothing to show" is about.
 */
export function PreviewShell({ bus }: { bus: EventBus }): JSX.Element {
  const [search, setSearch] = useState(window.location.search);
  useEffect(() => {
    const onMove = () => setSearch(window.location.search);
    window.addEventListener("popstate", onMove);
    return () => window.removeEventListener("popstate", onMove);
  }, []);
  useLayoutEffect(() => {
    document.body.dataset.previewShown = search;
  }, [search]);
  // The board model of every board on the page, for the chalk MCP's look and play: made from the
  // prop definitions and the running boards, with what's drawn and where each part's code is.
  useEffect(() => {
    stampCodePaths();
    const w = window as Window & { __chalkModel?: () => unknown };
    const same = (a: string, b: string) =>
      a.replace(/[^a-z0-9]/gi, "").toLowerCase() === b.replace(/[^a-z0-9]/gi, "").toLowerCase();
    w.__chalkModel = () =>
      runningBoards().flatMap((runtime) => {
        // A card is this board's when what it draws is the board's pieces: every piece shown now
        // (in play, hidden ones aren't drawn yet), and nothing else. Of those, the one named like
        // the board; a question's build path is its id, not its name, so else the only one.
        const names = new Set(runtime.propNames());
        const cards = [
          ...document.querySelectorAll<HTMLElement>(".preview-card[data-board]"),
        ].filter((c) => {
          const drawn = [...c.querySelectorAll<HTMLElement>("[data-piece]")].map(
            (e) => e.dataset.piece ?? "",
          );
          return (
            drawn.length > 0 &&
            drawn.every((n) => names.has(n)) &&
            [...names].every((n) => runtime.isHidden(n) || drawn.includes(n))
          );
        });
        // The build path is kebab-case ("draw-it"), the board's name camelCase ("drawIt").
        const card =
          cards.find((c) =>
            same((c.dataset.board ?? "").split("/").at(-1) ?? "", runtime.board.name),
          ) ?? (cards.length === 1 ? cards[0] : undefined);
        if (card === undefined) return [];
        return [
          {
            path: card.dataset.board ?? "",
            model: runtime.snapshot(card),
          },
        ];
      });
    // What is still going on, on every board here (a script, a prop's timeline): empty once all
    // have settled. A tool acting on a board waits for this before reading it.
    const busy = window as Window & { __chalkBusy?: () => string[] };
    busy.__chalkBusy = () => runningBoards().flatMap((runtime) => runtime.busyWith());
    // What the boards were heard to say, in order (the chalk MCP's play prints each step's).
    const heard = window as Window & { __chalkHeard?: () => unknown[] };
    heard.__chalkHeard = () =>
      runningBoards().flatMap((runtime) =>
        runtime instanceof SceneRuntime ? runtime.heard() : [],
      );
    // One of a piece's actions, as the lesson would call it (a prop on its own page has no lesson:
    // the person or a tool stands in). Says what went wrong, or nothing.
    const call = window as Window & {
      __chalkCall?: (piece: string, action: string, args: unknown) => string | undefined;
    };
    call.__chalkCall = (piece, action, args) => {
      const boards = runningBoards();
      if (boards.length !== 1) return `a call acts on one board; ${boards.length} are drawn`;
      const runtime = boards[0] as (typeof boards)[number];
      const def = runtime.getDef(piece);
      const actions = (def.actions ?? {}) as Readonly<
        Record<string, { args?: ZodTypeAny; payload?: ZodTypeAny }>
      >;
      // A scene's piece answers a dotted path ("walker.step"): its own action is checked when it runs.
      const spec = action.includes(".") ? { payload: undefined } : actions[action];
      if (spec === undefined)
        return `${def.type} has no action "${action}" (its actions: ${Object.keys(actions).join(", ") || "none"})`;
      const checked = ("args" in spec ? spec.args : spec.payload)?.safeParse(args);
      if (checked !== undefined && !checked.success)
        return `${action}: ${checked.error.issues.map((i: { path: (string | number)[]; message: string }) => `${i.path.join(".") || "args"}: ${i.message}`).join("; ")}`;
      void runtime.call(piece, action, args).catch(() => {});
      return undefined;
    };
    // Every prop's page (its definition, written out: @chalk/player's prop-pages.ts), for the
    // chalk MCP, which reads props only through the app.
    const props = window as Window & { __chalkProps?: () => unknown };
    props.__chalkProps = () => propPages(propPackages);
    return () => {
      w.__chalkModel = undefined;
      busy.__chalkBusy = undefined;
      heard.__chalkHeard = undefined;
      call.__chalkCall = undefined;
      props.__chalkProps = undefined;
    };
  }, []);
  // What the app did, for a tool acting on the board (the chalk MCP's play): every
  // event the bus carries, and each board passed. Kept on window, recent ones only.
  useEffect(() => {
    const w = window as Window & { __chalkEvents?: unknown[] };
    const stop = bus.subscribe((event) => {
      w.__chalkEvents ??= [];
      w.__chalkEvents.push(event);
      if (w.__chalkEvents.length > 500) w.__chalkEvents.shift();
    });
    return () => {
      stop();
    };
  }, [bus]);
  const params = new URLSearchParams(search);
  if (params.has("reviews")) return <ReviewList key={search} />;
  if (params.has("review")) return <ReviewPage key={search} bus={bus} />;
  if (params.has("play"))
    return (
      <PlayInApp
        key={search}
        path={(atPath(params) ?? params.get("source")?.replace(/^content\//, "") ?? "").replace(
          /\/$/,
          "",
        )}
        locale={params.get("locale") === "hi" ? Locale.Hi : Locale.En}
        bus={bus}
        width={Number(params.get("width")) || undefined}
      />
    );
  return <PreviewPage key={search} bus={bus} search={search} />;
}

function PreviewPage({ bus, search }: { bus: EventBus; search: string }): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const path = (atPath(params) ?? "").replace(/\/$/, "");
  const source = params.get("source");
  const prop = atProp(params);
  const library = atLibrary(params);
  const state = params.get("state");
  const isTree =
    prop === undefined &&
    library === undefined &&
    source === null &&
    path.split("/").filter(Boolean).length < 3;
  // Opened from a review page (`back=<its query>`): a way back to it.
  const back = params.get("back");
  const withQuestions = params.get("show") === "questions";
  const isPlaying = params.has("earned");
  const isShot = params.has("shot");
  // How fast the boards' clocks run (`&speed=10`): a tool watching boards runs them faster.
  const speed = Number(params.get("speed")) || 1;
  // The column's width, to see the board as another device draws it (a phone by default).
  const width = Number(params.get("width")) || undefined;
  const locale = params.get("locale") === "hi" ? Locale.Hi : Locale.En;
  const [shown, setShown] = useState<Shown[] | null>(null);
  const shownRef = useRef<Shown[] | null>(null);
  shownRef.current = shown;
  const [sources, setSources] = useState<Sources>({});
  const [error, setError] = useState<string | null>(null);
  const [build, setBuild] = useState(0);
  // One board at a time (‹ › or the arrow keys), as the student goes through them; or all at once.
  const [isOne, setIsOneState] = useState(params.has("one"));
  const [index, setIndex] = useState(0);
  const indexRef = useRef(index);
  indexRef.current = index;
  const [isHelp, setIsHelp] = useState(false);
  const [, setSelecting] = useEditorLink();
  // A lesson's neighbours: the arrows carry on past its last board into the next lesson.
  const isLesson =
    prop === undefined && source === null && path.split("/").filter(Boolean).length === 3;
  const [beside, setBeside] = useState<{ before?: string; after?: string }>({});
  const besideRef = useRef(beside);
  besideRef.current = beside;
  useEffect(() => {
    if (!isLesson) return;
    let isLive = true;
    void Promise.all([lessonBeside(path, -1), lessonBeside(path, 1)])
      .then(([before, after]) => isLive && setBeside({ before, after }))
      .catch(() => {});
    return () => {
      isLive = false;
    };
  }, [path, isLesson]);
  // Threads on the boards shown, kept current as files change (an agent's answer, a new thread).
  const {
    all: { threads, reviews },
    set: setThreads,
  } = useThreads();

  const [zoom, setZoomState] = useState(keptZoom);
  const setZoom = useCallback(
    (next: (z: number) => number) =>
      setZoomState((z) => {
        const n = Math.round(next(z) * 10) / 10;
        try {
          window.localStorage.setItem(ZOOM_KEY, String(n));
        } catch {}
        return n;
      }),
    [],
  );
  const setIsOne = useCallback((on: boolean) => {
    setIsOneState(on);
    const next = new URLSearchParams(window.location.search);
    if (on) next.set("one", "");
    else next.delete("one");
    history.replaceState(null, "", `?${next.toString().replace(/=(&|$)/g, "$1")}`);
  }, []);
  useEffect(() => {
    // s: one by one · → / j next · ← / k previous · c: pick a piece · p: play · h: Hindi ·
    // + / −: zoom · Esc: leave · ?: these keys.
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest("input, textarea, select") !== null) return;
      const last = (shownRef.current?.length ?? 1) - 1;
      const step =
        e.key === "ArrowRight" || e.key === "j"
          ? 1
          : e.key === "ArrowLeft" || e.key === "k"
            ? -1
            : 0;
      const { before, after } = besideRef.current;
      if (step !== 0 && isOne) {
        e.preventDefault();
        const i = Math.min(indexRef.current, last);
        if (i + step > last && after !== undefined) go(after);
        else if (i + step < 0 && before !== undefined) go(before, true);
        else setIndex(Math.max(0, Math.min(last, i + step)));
      } else if (step !== 0 && e.key.startsWith("Arrow") && isLesson) {
        // All at once: → / ← go to the next or previous lesson.
        const to = step === 1 ? after : before;
        if (to !== undefined) go(to);
      } else if ((e.key === "j" || e.key === "k") && !isOne) {
        const cards = [...document.querySelectorAll<HTMLElement>(".preview-slot")];
        const next = cards.findIndex((c) => c.getBoundingClientRect().top > 60);
        const at = next === -1 ? cards.length : next;
        cards[e.key === "j" ? at : Math.max(0, at - 2)]?.scrollIntoView({
          block: "start",
          behavior: "smooth",
        });
      } else if (e.key === "s") setIsOne(!isOne);
      else if (e.key === "c") setSelecting((on) => !on);
      else if (e.key === "a") toEditor({ type: "copy" });
      else if (e.key === "f") window.location.search = "?dev&activity";
      else if (e.key === "p") toggleParam("play");
      else if (e.key === "h") toggleParam("locale");
      else if (e.key === "v") toggleParam("script");
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(2, z + 0.1));
      else if (e.key === "-") setZoom((z) => Math.max(0.5, z - 0.1));
      else if (e.key === "?") setIsHelp((on) => !on);
      else if (e.key === "Escape") {
        setSelecting(false);
        setIsHelp(false);
        if (isOne) setIsOne(false);
      }
    };
    const onShow = (e: Event) => {
      const i = (shownRef.current ?? []).findIndex((s) => s.path === (e as CustomEvent).detail);
      if (i !== -1) setIndex(i);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(SHOW_CARD, onShow);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(SHOW_CARD, onShow);
    };
  }, [isOne, isLesson, setIsOne, setZoom, setSelecting]);

  useWhenChanged([path, source, prop?.pkg, prop?.type, state, isTree, withQuestions, build], () => {
    let isLive = true;
    if (isTree || library !== undefined) return;
    (async () => {
      const where = (await json("sources.json").catch(() => ({}))) as Sources;
      const boards =
        prop !== undefined
          ? [propShown(prop, state)]
          : source !== null
            ? await boardsFrom(source, where)
            : await boardsAt(path, withQuestions);
      const types = new Set<string>();
      for (const s of boards) propTypes(s.board.root, types);
      await preloadProps([...types]);
      if (!isLive) return;
      setSources(where);
      setShown(boards);
      // Come back from the next lesson: start on this one's last board.
      const now = new URLSearchParams(window.location.search);
      if (now.has("end")) {
        setIndex(boards.length - 1);
        now.delete("end");
        history.replaceState(null, "", `?${now.toString().replace(/=(&|$)/g, "$1")}`);
      }
      setError(null);
    })().catch((e: unknown) => isLive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      isLive = false;
    };
  });

  // Ready once the boards are on screen (this runs after they are drawn), not when they arrive.
  useEffect(() => {
    if (isTree || library !== undefined || shown !== null)
      document.body.dataset.previewReady = search;
  }, [isTree, library, shown, search]);

  // A rebuild (pnpm preview / build-content) redraws the boards without a reload.
  useEffect(() => {
    const hot = import.meta.hot;
    if (hot === undefined) return;
    const redraw = () => setBuild((n) => n + 1);
    hot.on("chalk:build", redraw);
    return () => hot.off?.("chalk:build", redraw);
  }, []);

  if (library !== undefined)
    return (
      <LibraryScreen pkg={library.pkg} locale={locale} bus={bus} reach={() => json("reach.json")} />
    );
  if (isTree) return <TreeScreen path={path} locale={locale} />;
  if (error !== null) return <div class="preview-empty">{error}</div>;
  // Not .preview-empty: tools wait for "ready or nothing to show", and loading is neither.
  if (shown === null)
    return <div class="preview-loading">Loading {source ?? params.get("at") ?? path}…</div>;
  if (shown.length === 0)
    return <div class="preview-empty">No boards are written in {source}.</div>;
  const count = shown.length;
  const at = Math.min(index, count - 1);
  const step = (by: number) => {
    if (at + by > count - 1 && beside.after !== undefined) go(beside.after);
    else if (at + by < 0 && beside.before !== undefined) go(beside.before, true);
    else setIndex(Math.max(0, Math.min(count - 1, at + by)));
  };
  const lessonName = (lesson: string) => lesson.split("/").at(-1) ?? lesson;
  return (
    <main
      class={`preview${isShot ? " is-shot" : ""}${isOne ? " is-one" : ""}`}
      key={build}
      style={width === undefined ? undefined : { "--phone-width": `${width}px` }}
    >
      {!isShot && back !== null && (
        <header class="preview-review-head">
          <a href={`?${back}`}>← Back to the review</a>
        </header>
      )}
      {!isShot && count > 1 && (
        <nav class="preview-nav">
          <button type="button" class={isOne ? "" : "is-on"} onClick={() => setIsOne(false)}>
            All
          </button>
          <button type="button" class={isOne ? "is-on" : ""} onClick={() => setIsOne(true)}>
            One by one
          </button>
          <button type="button" onClick={() => setIsHelp((on) => !on)} aria-label="Keys">
            ?
          </button>
          {isOne && (
            <span class="preview-step">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={at === 0 && beside.before === undefined}
                aria-label="Previous"
                title={
                  at === 0 && beside.before ? `Back to ${lessonName(beside.before)}` : undefined
                }
              >
                ‹
              </button>
              <span>{`${at + 1} / ${count}`}</span>
              <button
                type="button"
                onClick={() => step(1)}
                disabled={at === count - 1 && beside.after === undefined}
                aria-label="Next"
              >
                {at === count - 1 && beside.after ? `${lessonName(beside.after)} ›` : "›"}
              </button>
            </span>
          )}
        </nav>
      )}
      {isInEditor && <PickComposer />}
      {isHelp && (
        <div class="preview-help">
          <b>s</b> one by one · <b>→ j</b> next · <b>← k</b> previous (on into the next lesson) ·{" "}
          <b>c</b> pick (↑ ↓ wider, finer) · <b>a</b> copy review for the agent · <b>p</b> play as
          the app · <b>h</b> Hindi · <b>v</b> script beside the board (what it can say) · <b>f</b>{" "}
          activity · <b>+ −</b> zoom · <b>Esc</b> leave · <b>?</b> keys
        </div>
      )}
      <BoardSpeedContext.Provider value={speed}>
        {shown.map((s, i) => (
          <div
            class={isOne && i !== at ? "preview-away" : "preview-slot"}
            key={s.path}
            style={zoom === 1 ? undefined : { zoom }}
          >
            <PreviewBoard
              shown={s}
              where={sources[s.path]}
              threads={threadsOn(threads, s)}
              reviews={reviews}
              onThreads={setThreads}
              locale={locale}
              isPlaying={isPlaying}
              bus={bus}
              isShot={isShot}
            />
          </div>
        ))}
      </BoardSpeedContext.Provider>
      {!isShot && !isOne && (beside.before !== undefined || beside.after !== undefined) && (
        <nav class="preview-lessons">
          {beside.before !== undefined && (
            <button type="button" onClick={() => go(beside.before ?? "")}>
              {`‹ ${lessonName(beside.before)}`}
            </button>
          )}
          {beside.after !== undefined && (
            <button type="button" onClick={() => go(beside.after ?? "")}>
              {`${lessonName(beside.after)} ›`}
            </button>
          )}
        </nav>
      )}
    </main>
  );
}
