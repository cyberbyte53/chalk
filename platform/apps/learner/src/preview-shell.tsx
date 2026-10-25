import {
  type Board,
  Locale,
  type Piece,
  builtChapterSchema,
  builtConceptSchema,
  builtPageSchema,
  builtQuestionSchema,
} from "@chalk/content";
import type { EventBus } from "@chalk/events";
import { preloadProps, propLibrary, propPackages } from "@chalk/library";
import { BoardPlayer, boardModel, runningBoards, stampCodePaths } from "@chalk/player";
import type { JSX } from "preact";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { CONTENT_ROUTE } from "./content-store";
import type { Course } from "./course";
import { ChapterScreen, CourseScreen } from "./course-screens";
import { courses } from "./lessons";

/**
 * Development only (`?dev&board=<path>`): boards exactly as a phone draws them (the real player,
 * the real props, the app's CSS), one URL per board, for people and agents alike.
 *
 *   ?dev&board=                                                      every book, as its book screen
 *   ?dev&board=class10-maths                                         a book's screen (its chapters)
 *   ?dev&board=class10-maths/real-numbers                            a chapter's screen (its lessons)
 *   ?dev&board=class10-maths/real-numbers/division-lemma            every page of a lesson
 *   ?dev&board=class10-maths/real-numbers/division-lemma&show=questions   …then its questions
 *   ?dev&board=class10-maths/real-numbers/division-lemma/overview/story   one page
 *   ?dev&board=class10-maths/real-numbers/questions/euclid-hcf/<id>       one question
 *   ?dev&source=content/class10-maths/real-numbers/questions/euclid-hcf   boards written in a file
 *                                                                    or folder (from sources.json)
 *
 * Book and chapter screens are the app's own; tapping a chapter or a lesson goes one level down.
 * `&play` plays boards as a student meets them (hidden pieces stay hidden until earned); without
 * it everything is shown. `&locale=hi` for Hindi. `&shot` drops the chrome (for screenshots).
 * Each piece carries `data-source="content/…/overview.ts:42"` (from build/sources.json), so an
 * editor's browser or an agent pointed at a piece knows the line; Alt-click opens it in the editor.
 * Nothing here draws anything itself: the player does.
 */

type Sources = Record<string, { board?: string; pieces: Record<string, string> }>;
type Shown = { path: string; board: Board };

/** A comment, as the dev server gives it (platform/studio/src/comments.ts). */
type Thread = {
  id: string;
  kind: "comment" | "finding" | "regression";
  status: "open" | "planned" | "ready" | "closed" | "withdrawn";
  by: string;
  text: string;
  /** The board, by build path. */
  board?: string;
  /** What on it: "machine" or "machine › put". */
  target?: string;
  /** A comment on a prop wherever it is used: shown under every board that places it. */
  prop?: string;
  snapshot?: string;
  review?: string;
  causedBy?: string;
  from?: string;
  plan?: { by: string; at: string; text: string };
  changed?: string[];
  thread: { by: string; at: string; text: string }[];
};

/** Sends one change to the dev server (the comments' one writer); the comments after it, or why not. */
async function changeComments(change: Record<string, unknown>): Promise<Thread[] | string> {
  const res = await fetch("/dev-review", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(change),
  });
  const body = (await res.json()) as { ok: boolean; error?: string; comments?: Thread[] };
  return body.ok ? (body.comments ?? []) : (body.error ?? `${res.status}`);
}

const url = (path: string) => `${CONTENT_ROUTE}${path}?t=${Date.now()}`;
async function json(path: string): Promise<unknown> {
  const res = await fetch(url(path));
  if (!res.ok) throw new Error(`build/${path}: ${res.status} (run pnpm build-content?)`);
  return res.json();
}

function unhide(piece: Piece): Piece {
  const { isHidden: _, ...rest } = piece;
  return "children" in rest
    ? ({ ...rest, children: rest.children.map(unhide) } as Piece)
    : (rest as Piece);
}

function propTypes(piece: Piece, into: Set<string>): Set<string> {
  if ("prop" in piece && typeof piece.prop === "string") into.add(piece.prop);
  if ("children" in piece) for (const child of piece.children) propTypes(child, into);
  return into;
}

/** The boards a `board=` path names, in order. */
async function boardsAt(path: string, withQuestions: boolean): Promise<Shown[]> {
  const clean = path.replace(/\.json$/, "").replace(/\/$/, "");
  const parts = clean.split("/");
  if (parts.length >= 4) {
    const item = (await json(`${clean}.json`)) as { kind?: string };
    const schema = item.kind === "question" ? builtQuestionSchema : builtPageSchema;
    return [{ path: `${clean}.json`, board: schema.parse(item).board }];
  }
  const [book, chapter] = parts;
  const concept = builtConceptSchema.parse(await json(`${clean}/concept.json`));
  const pages = await Promise.all(
    concept.overview.map(async (ref) => ({
      path: ref.path,
      board: builtPageSchema.parse(await json(ref.path)).board,
    })),
  );
  if (!withQuestions) return pages;
  const chapterJson = builtChapterSchema.parse(await json(`${book}/${chapter}/chapter.json`));
  const questions = await Promise.all(
    chapterJson.questions
      .filter((q) => q.tests.includes(concept.id))
      .map(async (ref) => ({
        path: ref.path,
        board: builtQuestionSchema.parse(await json(ref.path)).board,
      })),
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
  return Promise.all(
    paths.map(async (path) => {
      const item = (await json(path)) as { kind?: string };
      const schema = item.kind === "question" ? builtQuestionSchema : builtPageSchema;
      return { path, board: schema.parse(item).board };
    }),
  );
}

/** Messages to and from an editor that shows this page in a panel (platform/editor). */
const isInEditor = window.parent !== window;
const toEditor = (message: Record<string, unknown>) =>
  isInEditor && window.parent.postMessage({ ...message, chalk: true }, "*");

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
const STATUS_WORDS: Record<Thread["status"], string> = {
  open: "waiting",
  planned: "planned",
  ready: "ready for you",
  closed: "closed",
  withdrawn: "withdrawn",
};

/** Whether the agent has acted on it: then it can only be withdrawn, not deleted. */
const isTouched = (t: Thread) =>
  t.status !== "open" || t.plan !== undefined || t.thread.some((e) => e.by !== "you");

/**
 * The board's comments under it, newest first, each with its whole thread: what was said, what the
 * agent plans or did, and a reply box (a reply reopens the comment for the agent). Finished ones
 * are dimmed, and folded only when there are many.
 */
function BoardThreads({
  threads,
  onChange,
  phone,
}: {
  threads: readonly Thread[];
  onChange: (all: Thread[]) => void;
  phone: { current: HTMLDivElement | null };
}): JSX.Element {
  const list = useRef<HTMLUListElement>(null);
  const isDone = (t: Thread) => t.status === "closed" || t.status === "withdrawn";
  const open = threads.filter((t) => !isDone(t));
  const closed = threads.filter(isDone);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
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
    if (text === "" || !(await act({ op: "reply", id: t.id, text }))) return;
    setDraft("");
    setReplyingTo(null);
  };
  const reveal = (t: Thread, on: boolean) => {
    const el = phone.current === null ? null : anchorOf(phone.current, t);
    el?.classList.toggle("is-revealed", on);
  };
  const isDetached = (t: Thread) =>
    t.target !== undefined && phone.current !== null && anchorOf(phone.current, t) === null;
  const one = (t: Thread) => (
    <li
      key={t.id}
      data-id={t.id}
      class={`preview-thread is-${t.status}`}
      onMouseEnter={() => reveal(t, true)}
      onMouseLeave={() => reveal(t, false)}
    >
      <div>
        <span class="preview-status">{STATUS_WORDS[t.status] ?? t.status}</span>
        {t.kind !== "comment" && <span class={`preview-kind is-${t.kind}`}>{t.kind}</span>}
        {t.prop !== undefined ? (
          <span class="preview-piece is-prop">{`prop ${t.prop}${t.target?.includes("›") ? ` › ${t.target.split("›").at(-1)?.trim()}` : ""}`}</span>
        ) : (
          t.target && <span class="preview-piece">{t.target}</span>
        )}
        {t.from === "chat" && <span class="preview-piece">from chat</span>}
        {t.text}
      </div>
      {isDetached(t) && (
        <div class="preview-detached">{`Not on this board any more. It said: ${t.snapshot ?? "?"}`}</div>
      )}
      {t.plan && <div class="preview-plan">Plan: {t.plan.text}</div>}
      {t.thread.map((entry) => (
        <div
          class="preview-reply"
          key={`${entry.at}·${entry.by}·${entry.text.slice(0, 40)}`}
        >{`${entry.by}: ${entry.text}`}</div>
      ))}
      {t.changed && t.changed.length > 0 && (
        <div class="preview-changed">{`Changed: ${t.changed.join(", ")}`}</div>
      )}
      {replyingTo === t.id ? (
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void send(t);
              } else if (e.key === "Escape") setReplyingTo(null);
            }}
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
            <button type="button" onClick={() => void act({ op: "close", id: t.id })}>
              Close
            </button>
          )}
          {!isDone(t) &&
            (isTouched(t) ? (
              <button type="button" onClick={() => void act({ op: "withdraw", id: t.id })}>
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
  // Beside the board, each level with what it is about (its piece, its prop's part), pushed
  // down only as far as needed not to overlap; under the board when the window is narrow.
  useLayoutEffect(() => {
    const ul = list.current;
    const ph = phone.current;
    if (ul === null || ph === null) return;
    const byId = new Map(threads.map((t) => [t.id, t]));
    let frame = 0;
    const place = () => {
      const items = [...ul.children] as HTMLElement[];
      if (getComputedStyle(ul).position === "static") {
        for (const li of items) li.style.top = "";
        ul.style.minHeight = "";
        return;
      }
      const base = ul.getBoundingClientRect().top;
      const wanted = items.map((li) => {
        const t = byId.get(li.dataset.id ?? "");
        const el = t === undefined ? null : anchorOf(ph, t);
        return { li, top: el === null ? 0 : el.getBoundingClientRect().top - base };
      });
      let bottom = 0;
      for (const { li, top } of wanted.sort((x, y) => x.top - y.top)) {
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
      {[...open, ...closed].map(one)}
    </ul>
  );
}

/**
 * What a comment is about, on the drawn board: the part of the prop picked, else its piece (for a
 * prop comment, that prop where this board places it); null for a comment on the whole board.
 */
function anchorOf(phone: HTMLElement, t: Thread): HTMLElement | null {
  const [pieceName, ...rest] = (t.target ?? "").split("›").map((x) => x.trim());
  const partName = rest.at(-1);
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
    partName === undefined
      ? null
      : piece.querySelector<HTMLElement>(`[data-part="${CSS.escape(partName)}"]`);
  return part ?? piece;
}

function PreviewBoard({
  shown,
  where,
  locale,
  isPlaying,
  bus,
  isShot,
  threads,
  onThreads,
}: {
  shown: Shown;
  where: Sources[string] | undefined;
  locale: Locale;
  isPlaying: boolean;
  bus: EventBus;
  isShot: boolean;
  threads: readonly Thread[];
  onThreads: (all: Thread[]) => void;
}): JSX.Element {
  const board = useMemo(
    () => (isPlaying ? shown.board : { ...shown.board, root: unhide(shown.board.root) }),
    [shown, isPlaying],
  );
  const phone = useRef<HTMLDivElement>(null);
  useSourceTags(phone, where, shown.path.replace(/\.json$/, ""));
  const raise = useMemo(
    () =>
      bus.raiserFor({ lessonId: "preview", contentVersion: "preview", boardId: board.id ?? null }),
    [bus, board],
  );
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
      class={`preview-card${!isShot && threads.length > 0 ? " has-threads" : ""}`}
      data-board={shown.path}
    >
      {!isShot && (
        <div class="preview-tag">
          <a href={`?dev&board=${shown.path.replace(/\.json$/, "")}`}>{board.name}</a>
          {where?.board !== undefined && (
            <button type="button" onClick={() => where.board && openInEditor(where.board)}>
              {where.board.replace(/^content\//, "")}
            </button>
          )}
        </div>
      )}
      <div class="preview-body">
        <div class="lesson preview-phone" ref={phone} onClickCapture={onClick}>
          <BoardPlayer
            board={board}
            registry={propLibrary}
            locale={locale}
            raise={raise}
            audio={undefined}
            onPass={() => {
              const w = window as Window & { __chalkPassed?: string[] };
              w.__chalkPassed ??= [];
              w.__chalkPassed.push(shown.path);
            }}
          />
        </div>
        {!isShot && threads.length > 0 && (
          <BoardThreads threads={threads} onChange={onThreads} phone={phone} />
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
  toEditor({ type: "follow", follow: board });
  const params = new URLSearchParams(window.location.search);
  params.delete("source");
  params.set("board", board);
  if (isAtEnd) params.set("at", "end");
  else params.delete("at");
  window.location.search = params
    .toString()
    .replace(/%2F/g, "/")
    .replace(/=(&|$)/g, "$1");
}

const slugOf = (chapterPath: string) => chapterPath.replace(/\/chapter\.json$/, "");

/**
 * The lesson after (or before) one, as a student meets them: the next in its chapter, else the
 * first of the next chapter in the book (the last of the previous one going back).
 */
async function lessonBeside(lesson: string, by: 1 | -1): Promise<string | undefined> {
  const chapterOf = lesson.split("/").slice(0, 2).join("/");
  const course = courses.find((c) => c.chapters.some((ch) => slugOf(ch.path) === chapterOf));
  const chapters = course?.chapters.map((ch) => slugOf(ch.path)) ?? [];
  const lessonsOf = async (chapter: string) =>
    ((await json(`${chapter}/chapter.json`)) as { concepts: { path: string }[] }).concepts.map(
      (c) => c.path.replace(/\/concept\.json$/, ""),
    );
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
      : courses.filter((c) => slugOf(c.chapters[0]?.path ?? "").startsWith(`${book}/`));
  if (shown.length === 0)
    return <div class="preview-empty">No book {book} in build/ (run pnpm build-content?)</div>;
  if (chapter === undefined)
    return (
      <main class="preview">
        {shown.map((course) => {
          const bookSlug = slugOf(course.chapters[0]?.path ?? "").split("/")[0] ?? "";
          return (
            <section class="preview-card" key={course.id} data-board={bookSlug}>
              <div class="preview-tag">
                <a href={`?dev&board=${bookSlug}`}>{bookSlug}</a>
              </div>
              <div class="preview-phone" data-source={`content/${bookSlug}/build.yaml:1`}>
                <CourseScreen
                  course={course}
                  locale={locale}
                  onChapter={(i) => {
                    const slug = slugOf(course.chapters[i]?.path ?? "");
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
  const index = course?.chapters.findIndex((c) => slugOf(c.path) === `${book}/${chapter}`) ?? -1;
  const found = index === -1 ? undefined : course?.chapters[index];
  if (found === undefined) return <div class="preview-empty">No chapter {path} in build/</div>;
  return (
    <main class="preview">
      <section class="preview-card" data-board={path}>
        <div class="preview-tag">
          <a href={`?dev&board=${book}`}>{book}</a>
          <span>{chapter}</span>
        </div>
        <div class="preview-phone" data-source={`content/${path}/build.yaml:1`}>
          <ChapterScreen
            chapter={found}
            number={index + 1}
            locale={locale}
            progress={{}}
            onConcept={(id) => {
              void json(found.path).then((raw) => {
                const ref = (raw as { concepts: { id: string; path: string }[] }).concepts.find(
                  (c) => c.id === id,
                );
                const lesson = ref?.path.replace(/\/concept\.json$/, "");
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
  const path = shown.path.replace(/\.json$/, "");
  const props = propTypes(shown.board.root, new Set());
  return threads.filter((t) => (t.prop !== undefined ? props.has(t.prop) : t.board === path));
}

/** The package (folder under library/props) each prop type comes from. */
const packageOfProp = new Map(
  [...propPackages].flatMap(([name, defs]) => defs.map((def) => [def.type, name] as const)),
);

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
 * finest; ↑ widens it, ↓ narrows it again. A comment on a prop or its part is about the prop,
 * filed with it (library/props/<package>/comments.yaml) and shown wherever it is used; the basics
 * (words, choices, buttons) are the lesson's own, so those stay with the board.
 */
function picksAt(target: HTMLElement): PickTarget[] {
  const card = target.closest<HTMLElement>("[data-board]");
  const phone = target.closest<HTMLElement>(".preview-phone");
  if (card === null || phone === null) return [];
  const board = card.dataset.board?.replace(/\.json$/, "");
  const whole: PickTarget = { el: phone, board, words: "board" };
  const pieceEl = target.closest<HTMLElement>("[data-piece]") ?? undefined;
  if (pieceEl === undefined) return [whole];
  const prop = /(?:^|\s)prop-(\S+)/.exec(pieceEl.className)?.[1];
  const pkg = prop === undefined ? undefined : packageOfProp.get(prop);
  const piece = pieceEl.dataset.piece;
  const isProp = pkg !== undefined && pkg !== "basics";
  const of = (el: HTMLElement, part?: string): PickTarget => ({
    el,
    pieceEl,
    board,
    piece,
    part,
    prop,
    propPackage: isProp ? pkg : undefined,
    words: isProp
      ? `prop ${prop}${part ? ` › ${part}` : ""}`
      : `board › ${piece}${part ? ` › ${part}` : ""}`,
  });
  const parts: PickTarget[] = [];
  for (
    let el = target.closest<HTMLElement>("[data-part]");
    el !== null && pieceEl.contains(el) && el !== pieceEl;
    el = el.parentElement?.closest<HTMLElement>("[data-part]") ?? null
  )
    parts.push(of(el, el.dataset.part));
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
      toEditor({
        type: "pick",
        board: at.board,
        piece: at.piece,
        part: at.part,
        prop: at.prop,
        propPackage: at.propPackage,
        site: (at.pieceEl ?? at.el).dataset.source,
        text: wordsOf(at.el).slice(0, 400),
      });
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

/** A view setting kept in the URL (play, Hindi): the editor's panel owns it when there is one. */
function toggleParam(name: "play" | "locale"): void {
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
  // The board model of every board on the page, for the chalk MCP's render_board: made from the
  // prop definitions and the running boards, with what's drawn and where each part's code is.
  useEffect(() => {
    stampCodePaths();
    const w = window as Window & { __chalkModel?: () => unknown };
    w.__chalkModel = () =>
      runningBoards().flatMap((runtime) => {
        const card = [...document.querySelectorAll<HTMLElement>(".preview-card[data-board]")].find(
          (c) =>
            (c.dataset.board ?? "").replace(/\.json$/, "").endsWith(`/${runtime.board.name}`) &&
            runtime.propNames().every((n) => c.querySelector(`[data-piece="${CSS.escape(n)}"]`)),
        );
        if (card === undefined) return [];
        return [
          {
            path: (card.dataset.board ?? "").replace(/\.json$/, ""),
            model: boardModel(runtime, (piece) =>
              card.querySelector(`[data-piece="${CSS.escape(piece)}"]`),
            ),
          },
        ];
      });
    return () => {
      w.__chalkModel = undefined;
    };
  }, []);
  // What the app did, for a tool acting on the board (the chalk MCP's render_board steps): every
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
  return <PreviewPage key={search} bus={bus} search={search} />;
}

function PreviewPage({ bus, search }: { bus: EventBus; search: string }): JSX.Element {
  const params = new URLSearchParams(window.location.search);
  const path = (params.get("board") ?? "").replace(/\/$/, "");
  const source = params.get("source");
  const isTree = source === null && path.split("/").filter(Boolean).length < 3;
  const withQuestions = params.get("show") === "questions";
  const isPlaying = params.has("play");
  const isShot = params.has("shot");
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
  const isLesson = source === null && path.split("/").filter(Boolean).length === 3;
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
  // Comments on the boards shown, read from the chapters' comment files; again when one is added.
  const [threads, setThreads] = useState<Thread[]>([]);
  useEffect(() => {
    const load = () =>
      fetch("/dev-review")
        .then((r) => (r.ok ? r.json() : []))
        .then((all: Thread[]) => setThreads(all))
        .catch(() => {});
    load();
    const onMessage = (e: MessageEvent) => {
      const m = e.data as { chalk?: boolean; type?: string };
      if (m?.chalk === true && m.type === "comments") load();
    };
    window.addEventListener("message", onMessage);
    // The dev server says the moment a comments file changes (an agent's reply, a new comment).
    const hot = import.meta.hot;
    hot?.on("chalk:comments", load);
    return () => {
      window.removeEventListener("message", onMessage);
      hot?.off?.("chalk:comments", load);
    };
  }, []);
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
      else if (e.key === "p") toggleParam("play");
      else if (e.key === "h") toggleParam("locale");
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: `build` is the trigger: a rebuild fetches the boards again.
  useEffect(() => {
    let isLive = true;
    if (isTree) return;
    (async () => {
      const where = (await json("sources.json").catch(() => ({}))) as Sources;
      const boards =
        source !== null ? await boardsFrom(source, where) : await boardsAt(path, withQuestions);
      const types = new Set<string>();
      for (const s of boards) propTypes(s.board.root, types);
      await preloadProps([...types]);
      if (!isLive) return;
      setSources(where);
      setShown(boards);
      // Come back from the next lesson: start on this one's last board.
      const now = new URLSearchParams(window.location.search);
      if (now.get("at") === "end") {
        setIndex(boards.length - 1);
        now.delete("at");
        history.replaceState(null, "", `?${now.toString().replace(/=(&|$)/g, "$1")}`);
      }
      setError(null);
    })().catch((e: unknown) => isLive && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      isLive = false;
    };
  }, [path, source, isTree, withQuestions, build]);

  // Ready once the boards are on screen (this runs after they are drawn), not when they arrive.
  useEffect(() => {
    if (isTree || shown !== null) document.body.dataset.previewReady = search;
  }, [isTree, shown, search]);

  // A rebuild (pnpm preview / build-content) redraws the boards without a reload.
  useEffect(() => {
    const hot = import.meta.hot;
    if (hot === undefined) return;
    const redraw = () => setBuild((n) => n + 1);
    hot.on("chalk:build", redraw);
    return () => hot.off?.("chalk:build", redraw);
  }, []);

  if (isTree) return <TreeScreen path={path} locale={locale} />;
  if (error !== null) return <div class="preview-empty">{error}</div>;
  // Not .preview-empty: tools wait for "ready or nothing to show", and loading is neither.
  if (shown === null) return <div class="preview-loading">Loading {source ?? path}…</div>;
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
    <main class={`preview${isShot ? " is-shot" : ""}${isOne ? " is-one" : ""}`} key={build}>
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
      {isHelp && (
        <div class="preview-help">
          <b>s</b> one by one · <b>→ j</b> next · <b>← k</b> previous (on into the next lesson) ·{" "}
          <b>c</b> pick (↑ ↓ wider, finer) · <b>a</b> copy review for the agent · <b>p</b> play ·{" "}
          <b>h</b> Hindi · <b>+ −</b> zoom · <b>Esc</b> leave · <b>?</b> keys
        </div>
      )}
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
            onThreads={setThreads}
            locale={locale}
            isPlaying={isPlaying}
            bus={bus}
            isShot={isShot}
          />
        </div>
      ))}
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
