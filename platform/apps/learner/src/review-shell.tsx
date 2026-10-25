import { type Board, Locale, type Piece } from "@chalk/content";
import type { EventBus } from "@chalk/events";
import { propLibrary } from "@chalk/library";
import { BoardPlayer, RichText, SEP, addressOf } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { JugnuLoader } from "./chapter-gate";
import type { ChapterContent } from "./content-store";
import type { CourseChapter } from "./course";
import { type PlayableLesson, chapterLessons, lessonsById, otherLessons } from "./dev-lessons";
import { courses } from "./lessons";
import {
  CommentMarks,
  CommentPanel,
  CommentStatus,
  Composer,
  type NewComment,
  type ReviewComment,
  noteTap,
  snapshotOf,
  useComments,
} from "./review-comments";

/** Every piece shown from the start: what a tap or a right answer would reveal is already there. */
function unhide(piece: Piece): Piece {
  const { isHidden: _, ...rest } = piece;
  return "children" in rest
    ? ({ ...rest, children: rest.children.map(unhide) } as Piece)
    : (rest as Piece);
}

/** What to show for each lesson of a chapter: its pages, its first-try practice, its question bank. */
const Part = { Pages: "concept", Practice: "practice", Bank: "bank" } as const;
type Part = (typeof Part)[keyof typeof Part];
const partNames: Record<Part, string> = {
  concept: "Lessons",
  practice: "First-try practice",
  bank: "Question bank",
};

/** A chapter to review: its book, its title, and each concept's id and title, in order. */
type Place = {
  book: string;
  bookTitle: string;
  chapter: number;
  title: string;
  concepts: string[];
  source: CourseChapter;
};
const OTHER = "other";
const places: Place[] = [
  ...courses.flatMap((course) =>
    course.chapters.map((chapter, i) => ({
      book: course.id,
      bookTitle: course.title.en,
      chapter: i,
      title: chapter.title.en,
      concepts: chapter.concepts.map((c) => c.id),
      source: chapter,
    })),
  ),
];
const placeOf = (lessonId: string): Place | undefined => {
  const concept = lessonId.split("/")[1];
  return places.find((p) => p.concepts.includes(concept ?? ""));
};

type View = { book: string; chapter: number; parts: Part[] };
function viewFromUrl(): View {
  const params = new URLSearchParams(window.location.search);
  const first = places[0];
  const parts = (params.get("show") ?? Part.Pages)
    .split(",")
    .filter((x): x is Part => (Object.values(Part) as string[]).includes(x));
  const chapterParam = params.get("chapter") ?? "0";
  // Studio links by folder names (`book=class10-science&chapter=light`); the chips by index.
  const bySlug = /^\d+$/.test(chapterParam)
    ? undefined
    : places.find((p) => p.source.path === `${params.get("book")}/${chapterParam}/chapter.json`);
  return {
    book: bySlug?.book ?? params.get("book") ?? first?.book ?? OTHER,
    chapter: bySlug?.chapter ?? (Number(chapterParam) || 0),
    parts: parts.length > 0 ? parts : [Part.Pages],
  };
}

function ReviewBoard({
  entry,
  board,
  index,
  locale,
  bus,
  isCommenting,
  comments,
  numberOf,
  onPick,
  onOpen,
}: {
  entry: PlayableLesson;
  board: Board;
  index: number;
  locale: Locale;
  bus: EventBus;
  isCommenting: boolean;
  comments: readonly ReviewComment[];
  numberOf: (c: ReviewComment) => number;
  onPick: (draft: NewComment) => void;
  onOpen: (id: string) => void;
}): JSX.Element {
  const shown = useMemo(() => ({ ...board, root: unhide(board.root) }), [board]);
  const phone = useRef<HTMLDivElement>(null);
  const raise = useMemo(
    () =>
      bus.raiserFor({
        lessonId: entry.lesson.id,
        item: board.item ?? null,
      }),
    [bus, entry, board],
  );
  const pick = (piece: string | null, part: string | null, quote: string) =>
    onPick({
      lessonId: entry.lesson.id,
      lessonTitle: entry.lesson.title.en,
      board: board.name,
      boardIndex: index,
      piece,
      part,
      snapshot: snapshotOf(board, piece, part),
      locale,
      quote,
      text: "",
    });
  // In comment mode a tap picks what it landed on instead of playing it.
  const onClickCapture = (e: MouseEvent) => {
    if (!isCommenting) return;
    const target = e.target as HTMLElement;
    if (target.closest(".review-mark") !== null) return;
    e.preventDefault();
    e.stopPropagation();
    noteTap(e.clientX, e.clientY);
    const piece = target.closest<HTMLElement>("[data-piece]");
    // The part by its address under the piece ("objectArrow/object"), if a part was tapped.
    const address = piece === null ? undefined : addressOf(target);
    const part = address?.includes(SEP) ? address.slice(address.indexOf(SEP) + 1) : null;
    const selected = window.getSelection()?.toString().trim() ?? "";
    pick(piece?.dataset.piece ?? null, part, selected);
  };
  const open = comments.filter((c) => c.status !== CommentStatus.Done).length;
  return (
    <section class="review-card" id={`${entry.lesson.id}/${board.name}`}>
      <div class="review-tag">
        <span>{`${index + 1} · ${board.name}`}</span>
        {comments.length > 0 && (
          <button type="button" class="review-count" onClick={() => onOpen(comments[0]?.id ?? "")}>
            {open > 0 ? `${open} open` : `${comments.length} done`}
          </button>
        )}
        {isCommenting && (
          <button
            type="button"
            class="review-link"
            onClick={(e) => {
              noteTap(e.clientX, e.clientY);
              pick(null, null, "");
            }}
          >
            + comment on board
          </button>
        )}
      </div>
      <div
        class={`lesson review-phone${isCommenting ? " is-commenting" : ""}`}
        ref={phone}
        onClickCapture={onClickCapture}
        onPointerDownCapture={(e) => isCommenting && e.stopPropagation()}
      >
        <BoardPlayer
          board={shown}
          registry={propLibrary}
          locale={locale}
          raise={raise}
          audio={entry.audio}
          onPass={() => {}}
        />
        <CommentMarks phone={phone} comments={comments} numberOf={numberOf} onOpen={onOpen} />
      </div>
    </section>
  );
}

/**
 * Development only (`?dev&review`): every board of the picked lessons at once, drawn by the real
 * player with everything revealed, so authors read a whole chapter without tapping through it.
 */
export function ReviewShell({ bus }: { bus: EventBus }): JSX.Element {
  const [view, setView] = useState<View>(viewFromUrl);
  const { comments, send, error } = useComments();
  const [isCommenting, setIsCommenting] = useState(false);
  const [draft, setDraft] = useState<NewComment | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAllChapters, setIsAllChapters] = useState(false);
  // Sequence: one board at a time, in order, ← / → to move; `at` is its place in the chapter.
  const [isSequence, setIsSequence] = useState(() =>
    new URLSearchParams(window.location.search).has("seq"),
  );
  const [at, setAt] = useState(
    () => Number(new URLSearchParams(window.location.search).get("at") ?? 0) || 0,
  );
  // How big the board is drawn in sequence: by default as tall as the screen allows; − / + change it.
  const [zoom, setZoom] = useState(() => {
    try {
      const kept = Number(window.localStorage.getItem("review-zoom"));
      if (kept >= 0.6 && kept <= 2.5) return kept;
    } catch {}
    return Math.min(2, Math.max(1, (window.innerHeight - 110) / 720));
  });
  const changeZoom = (by: number) =>
    setZoom((z) => {
      const next = Math.round(Math.min(2.5, Math.max(0.6, z + by)) * 10) / 10;
      try {
        window.localStorage.setItem("review-zoom", String(next));
      } catch {}
      return next;
    });
  const changeZoomRef = useRef(changeZoom);
  changeZoomRef.current = changeZoom;
  /** A board to land on once its chapter has loaded (a comment's "go to" in sequence). */
  const [target, setTarget] = useState<{ lessonId: string; board: string } | null>(null);
  // Only the chapter on screen is fetched (as the app does); "Other lessons" only when picked.
  const [loaded, setLoaded] = useState<{ key: string; content: ChapterContent } | null>(null);
  const [others, setOthers] = useState<PlayableLesson[] | null>(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>(
    new URLSearchParams(window.location.search).get("locale") === Locale.Hi ? Locale.Hi : Locale.En,
  );

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("dev", "");
    params.set("review", "");
    params.set("book", view.book);
    params.set("chapter", String(view.chapter));
    params.set("show", view.parts.join(","));
    params.set("locale", locale);
    if (isSequence) {
      params.set("seq", "");
      params.set("at", String(at));
    }
    window.history.replaceState(null, "", `?${params.toString().replace(/=(?=&|$)/g, "")}`);
  }, [view, locale, isSequence, at]);

  // The key handler is set up once; it reads the mode and the last board through refs.
  const isSequenceRef = useRef(isSequence);
  isSequenceRef.current = isSequence;
  const lastRef = useRef(0);

  // j / k: next and previous board (← / → in sequence); c: comment mode; s: sequence.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select") !== null) return;
      if (e.key === "c") setIsCommenting((on) => !on);
      if (e.key === "s") setIsSequence((on) => !on);
      if (isSequenceRef.current) {
        // Esc leaves sequence, unless a comment box or the panel is open (Esc is theirs then).
        if (e.key === "Escape" && document.querySelector(".review-sheet, .review-panel") === null)
          setIsSequence(false);
        // ↑ / ↓ move up and down the board; Space / Shift+Space a screen at a time.
        const focus = document.querySelector<HTMLElement>(".review-focus");
        const by =
          e.key === "ArrowDown"
            ? 0.35
            : e.key === "ArrowUp"
              ? -0.35
              : e.key === " "
                ? e.shiftKey
                  ? -0.85
                  : 0.85
                : 0;
        if (focus !== null && by !== 0) {
          e.preventDefault();
          focus.scrollBy({ top: by * focus.clientHeight, behavior: "smooth" });
        }
        if (e.key === "+" || e.key === "=") changeZoomRef.current(0.1);
        if (e.key === "-") changeZoomRef.current(-0.1);
        const step =
          e.key === "ArrowRight" || e.key === "j"
            ? 1
            : e.key === "ArrowLeft" || e.key === "k"
              ? -1
              : 0;
        if (step !== 0) {
          e.preventDefault();
          setAt((n) => Math.max(0, Math.min(lastRef.current, n + step)));
        }
        return;
      }
      if (e.key !== "j" && e.key !== "k") return;
      const cards = [...document.querySelectorAll<HTMLElement>(".review-card")];
      const top = 140;
      const next = cards.findIndex((c) => c.getBoundingClientRect().top > top + 4);
      const at = next === -1 ? cards.length : next;
      cards[e.key === "j" ? at : Math.max(0, at - 2)]?.scrollIntoView({ block: "start" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const books = [
    ...new Map(places.map((p) => [p.book, p.bookTitle])).entries(),
    [OTHER, "Other lessons"] as const,
  ];
  const chapters = places.filter((p) => p.book === view.book);
  const place = chapters[view.chapter];
  const placeKey = view.book === OTHER ? OTHER : (place?.source.path ?? "");

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the chapter's path
  useEffect(() => {
    let isLive = true;
    setLoadError(null);
    setProgress({ done: 0, total: 0 });
    if (view.book === OTHER) {
      otherLessons().then(
        (list) => isLive && setOthers(list),
        (e: unknown) => isLive && setLoadError(String(e)),
      );
    } else if (place !== undefined && loaded?.key !== placeKey) {
      chapterLessons(place.source, (done, total) => isLive && setProgress({ done, total })).then(
        (content) => isLive && setLoaded({ key: placeKey, content }),
        (e: unknown) => isLive && setLoadError(String(e)),
      );
    }
    return () => {
      isLive = false;
    };
  }, [placeKey]);
  const byId = useMemo(
    () => (loaded === null ? new Map<string, PlayableLesson>() : lessonsById(loaded.content)),
    [loaded],
  );
  const isLoading =
    loadError === null && (view.book === OTHER ? others === null : loaded?.key !== placeKey);
  // The chapter's lessons, each with the parts asked for, in order.
  const sections: { concept: string; title: string; entries: PlayableLesson[] }[] =
    view.book === OTHER
      ? (others ?? []).map((e) => ({
          concept: e.lesson.id,
          title: e.lesson.title.en,
          entries: [e],
        }))
      : isLoading
        ? []
        : (place?.concepts ?? []).flatMap((concept) => {
            const entries = view.parts.flatMap((part) => {
              const entry = byId.get(`${part}/${concept}`);
              return entry === undefined ? [] : [entry];
            });
            const title = byId.get(`concept/${concept}`)?.lesson.title.en ?? concept;
            return entries.length === 0 ? [] : [{ concept, title, entries }];
          });

  /** Every board of the chapter in order, for the sequence view. */
  const flat = sections.flatMap((section, si) =>
    section.entries.flatMap((entry) =>
      entry.lesson.boards.map((board, b) => ({ section, si, entry, board, b })),
    ),
  );
  lastRef.current = Math.max(0, flat.length - 1);
  const shown = flat[Math.min(at, lastRef.current)];
  const firstOf = (concept: string) => flat.findIndex((f) => f.section.concept === concept);

  // Each board opens at its top.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the board shown changes
  useEffect(() => {
    document.querySelector(".review-focus")?.scrollTo({ top: 0 });
  }, [at, isSequence]);

  // A new chapter or set of parts starts at its first board; a pending "go to" lands on its board.
  const placeKeyRef = useRef(`${placeKey}|${view.parts.join(",")}`);
  // biome-ignore lint/correctness/useExhaustiveDependencies: flat is rebuilt every render; its length says when boards arrived
  useEffect(() => {
    const key = `${placeKey}|${view.parts.join(",")}`;
    if (target !== null) {
      const i = flat.findIndex(
        (f) => f.entry.lesson.id === target.lessonId && f.board.name === target.board,
      );
      if (i !== -1) {
        setAt(i);
        setTarget(null);
      }
    } else if (placeKeyRef.current !== key) setAt(0);
    placeKeyRef.current = key;
  }, [placeKey, view.parts, flat.length, target]);

  // The panel and its counts are about the chapter on screen, unless asked for every chapter.
  const isHere = (c: ReviewComment) =>
    view.book === OTHER ? placeOf(c.lessonId) === undefined : placeOf(c.lessonId) === place;
  const listed = isAllChapters ? comments : comments.filter(isHere);
  const needsYou = listed.filter(
    (c) => c.status === CommentStatus.Proposed || c.status === CommentStatus.Question,
  ).length;
  const inChapter = (c: ReviewComment) =>
    sections.some((s) => s.entries.some((e) => e.lesson.id === c.lessonId));
  const chapterOpen = comments.filter(
    (c) => inChapter(c) && c.status !== CommentStatus.Done,
  ).length;
  const numberOf = (c: ReviewComment) => comments.indexOf(c) + 1;
  const openComment = (id: string) => {
    setIsPanelOpen(true);
    window.setTimeout(
      () => document.getElementById(`comment-${id}`)?.scrollIntoView({ block: "center" }),
      50,
    );
  };
  const goTo = (c: ReviewComment) => {
    const at = placeOf(c.lessonId);
    const part = c.lessonId.split("/")[0] as Part;
    if (at !== undefined) {
      const chapter = places.filter((p) => p.book === at.book).indexOf(at);
      setView({
        book: at.book,
        chapter,
        parts: view.parts.includes(part) ? view.parts : [...view.parts, part],
      });
    } else if (view.book !== OTHER) setView({ ...view, book: OTHER, chapter: 0 });
    if (isSequence) {
      setTarget({ lessonId: c.lessonId, board: c.board });
      return;
    }
    window.setTimeout(() => {
      const card = document.getElementById(`${c.lessonId}/${c.board}`);
      card?.scrollIntoView({ block: "start" });
      card?.classList.add("is-flash");
      window.setTimeout(() => card?.classList.remove("is-flash"), 1200);
    }, 80);
  };
  const togglePart = (part: Part) => {
    const parts = view.parts.includes(part)
      ? view.parts.filter((p) => p !== part)
      : (Object.values(Part) as Part[]).filter((p) => p === part || view.parts.includes(p));
    setView({ ...view, parts: parts.length > 0 ? parts : view.parts });
  };

  return (
    <div class="review">
      <header class="review-bar">
        <div class="review-row">
          <select
            id="review-book"
            class="review-select"
            aria-label="Book"
            value={view.book}
            onChange={(e) =>
              setView({ ...view, book: (e.target as HTMLSelectElement).value, chapter: 0 })
            }
          >
            {books.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
          {view.book !== OTHER && (
            <select
              id="review-chapter"
              class="review-select"
              aria-label="Chapter"
              value={String(view.chapter)}
              onChange={(e) =>
                setView({ ...view, chapter: Number((e.target as HTMLSelectElement).value) })
              }
            >
              {chapters.map((c) => (
                <option key={c.chapter} value={String(c.chapter)}>
                  {`${c.chapter + 1}. ${c.title}`}
                </option>
              ))}
            </select>
          )}
          <span class="review-hint">
            {isSequence
              ? "← / →: boards · ↑ / ↓: scroll · c: comment · s: list"
              : "j / k: boards · c: comment · s: sequence"}
          </span>
          <button
            type="button"
            class="review-chip"
            aria-pressed={isSequence}
            onClick={() => setIsSequence(!isSequence)}
          >
            {isSequence ? "Sequence" : "List"}
          </button>
          <button
            type="button"
            class="review-chip"
            aria-pressed={isCommenting}
            onClick={() => setIsCommenting(!isCommenting)}
          >
            {isCommenting ? "Commenting: tap anything" : "Comment"}
          </button>
          <button type="button" class="review-chip" onClick={() => setIsPanelOpen(!isPanelOpen)}>
            {needsYou > 0 ? `Comments · ${needsYou} need you` : `Comments ${listed.length}`}
          </button>
          <button
            type="button"
            class="review-chip"
            onClick={() => setLocale(locale === Locale.En ? Locale.Hi : Locale.En)}
          >
            {locale === Locale.En ? "हिंदी" : "English"}
          </button>
        </div>
        {view.book !== OTHER && (
          <div class="review-chips">
            {(Object.values(Part) as Part[]).map((part) => (
              <button
                key={part}
                type="button"
                class="review-chip is-small"
                aria-pressed={view.parts.includes(part)}
                onClick={() => togglePart(part)}
              >
                {partNames[part]}
              </button>
            ))}
            {chapterOpen > 0 && (
              <span class="review-hint">{`${chapterOpen} open comments here`}</span>
            )}
          </div>
        )}
        <nav class="review-chips" aria-label="Lessons">
          {sections.map((s, i) => (
            <a
              key={s.concept}
              class={`review-jump${isSequence && shown?.section.concept === s.concept ? " is-here" : ""}`}
              href={`#lesson-${s.concept}`}
              onClick={(e) => {
                if (!isSequence) return;
                e.preventDefault();
                setAt(Math.max(0, firstOf(s.concept)));
              }}
            >
              {`${i + 1}. ${s.title}`}
            </a>
          ))}
        </nav>
        {error !== null && <p class="review-error">{error}</p>}
      </header>
      {isPanelOpen && (
        <CommentPanel
          comments={listed}
          isAllChapters={isAllChapters}
          onAllChapters={setIsAllChapters}
          numberOf={numberOf}
          send={send}
          onGo={goTo}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
      {draft !== null && (
        <Composer
          draft={draft}
          onCancel={() => setDraft(null)}
          onSave={(text) => {
            void send({ op: "add", comment: { ...draft, text } });
            setDraft(null);
          }}
        />
      )}
      {loadError !== null && <p class="review-error">{`Couldn't load: ${loadError}`}</p>}
      {isLoading && (
        <JugnuLoader
          title={view.book === OTHER ? "Other lessons" : (place?.title ?? "")}
          done={progress.done}
          total={progress.total}
          locale={locale}
        />
      )}
      {!isLoading && sections.length === 0 && (
        <p class="review-hint">Nothing built for this chapter yet.</p>
      )}
      {isSequence && shown !== undefined && (
        <div class="review-focus">
          <div class="review-seq-bar">
            <button
              type="button"
              class="review-chip"
              title="Back to the list (Esc)"
              onClick={() => setIsSequence(false)}
            >
              ✕ List
            </button>
            <button
              type="button"
              class="review-chip"
              aria-label="Previous board"
              disabled={at <= 0}
              onClick={() => setAt(Math.max(0, at - 1))}
            >
              ←
            </button>
            <span class="review-seq-where">
              <strong>{`${Math.min(at, lastRef.current) + 1} / ${flat.length}`}</strong>
              {` · ${shown.si + 1}. ${shown.section.title}`}
              {shown.section.entries.length > 1 &&
                ` · ${partNames[shown.entry.lesson.id.split("/")[0] as Part] ?? ""}`}
              {` · board ${shown.b + 1} of ${shown.entry.lesson.boards.length}`}
            </span>
            <button
              type="button"
              class="review-chip"
              aria-label="Next board"
              disabled={at >= lastRef.current}
              onClick={() => setAt(Math.min(lastRef.current, at + 1))}
            >
              →
            </button>
            <button
              type="button"
              class="review-chip"
              aria-label="Smaller (−)"
              onClick={() => changeZoom(-0.1)}
            >
              −
            </button>
            <span class="review-seq-zoom">{`${Math.round(zoom * 100)}%`}</span>
            <button
              type="button"
              class="review-chip"
              aria-label="Bigger (+)"
              onClick={() => changeZoom(0.1)}
            >
              +
            </button>
            <button
              type="button"
              class="review-chip"
              aria-pressed={isCommenting}
              onClick={() => setIsCommenting(!isCommenting)}
            >
              {isCommenting ? "Commenting" : "Comment"}
            </button>
            <button type="button" class="review-chip" onClick={() => setIsPanelOpen(!isPanelOpen)}>
              {`Comments ${listed.length}`}
            </button>
          </div>
          <div class="review-seq-board" style={{ zoom }}>
            <ReviewBoard
              key={`${shown.entry.lesson.id}/${shown.board.name}-${locale}`}
              entry={shown.entry}
              board={shown.board}
              index={shown.b}
              locale={locale}
              bus={bus}
              isCommenting={isCommenting}
              comments={comments.filter(
                (c) => c.lessonId === shown.entry.lesson.id && c.board === shown.board.name,
              )}
              numberOf={numberOf}
              onPick={setDraft}
              onOpen={openComment}
            />
          </div>
        </div>
      )}
      {!isSequence &&
        sections.map((section, i) => (
          <div key={`${section.concept}-${locale}`} class="review-lesson">
            <h2
              id={`lesson-${section.concept}`}
              class="review-title"
            >{`${i + 1}. ${section.title}`}</h2>
            {section.entries.map((entry) => (
              <div key={entry.lesson.id}>
                {section.entries.length > 1 && (
                  <h3 class="review-part">
                    {partNames[entry.lesson.id.split("/")[0] as Part] ?? entry.lesson.id}
                  </h3>
                )}
                <div class="review-grid">
                  {entry.lesson.boards.map((board, b) => (
                    <ReviewBoard
                      key={board.name}
                      entry={entry}
                      board={board}
                      index={b}
                      locale={locale}
                      bus={bus}
                      isCommenting={isCommenting}
                      comments={comments.filter(
                        (c) => c.lessonId === entry.lesson.id && c.board === board.name,
                      )}
                      numberOf={numberOf}
                      onPick={setDraft}
                      onOpen={openComment}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
