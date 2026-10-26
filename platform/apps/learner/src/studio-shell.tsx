/**
 * Studio (`?dev&studio`): the content pipeline as the files say it is. A board of every chapter
 * with its stage; a chapter's plan, rendered, with comments and the approve switch; its runs; a
 * drop zone for a new chapter's source. Studio builds nothing: agents build, through the skills
 * in `.claude/skills/`, and this page is how a person watches and steers. Data comes from
 * /dev-studio (see ../dev-studio.ts) and comments from /dev-review.
 */
import { marked } from "marked";
import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { RunState, Step } from "../dev-runner";
import type { Board, ChapterDetail, ChapterRow, PlanStatus } from "../dev-studio";
import { type Thread, isFinished, useThreads } from "./threads";

const Stage = {
  None: "none",
  Queued: "queued",
  Draft: "draft",
  Approved: "approved",
  Building: "building",
  Built: "built",
} as const;
type Stage = (typeof Stage)[keyof typeof Stage];

const stageLabel: Record<Stage, string> = {
  none: "No plan",
  queued: "Queued",
  draft: "Plan to review",
  approved: "Approved",
  building: "Building",
  built: "Built",
};

/** Where a chapter stands, from its plan's status and how many of its lessons exist. */
function stageOf(row: ChapterRow): Stage {
  const written = row.lessons.filter((l) => l.isWritten).length;
  if (row.status === "none") return written > 0 ? Stage.Built : Stage.None;
  if (row.status === "queued" || row.status === "draft") return row.status;
  if (row.status === "built") return Stage.Built;
  if (written === 0) return Stage.Approved;
  return row.lessonsPlanned > 0 && written < row.lessonsPlanned ? Stage.Building : Stage.Built;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `${res.status}`);
  return json;
}
const post = <T,>(path: string, body: unknown) =>
  getJson<T>(`/dev-studio/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

type Route = { book: string; chapter: string } | null;
function routeFromUrl(): Route {
  const p = new URLSearchParams(window.location.search);
  const book = p.get("book");
  const chapter = p.get("chapter");
  return book !== null && chapter !== null && !/^\d+$/.test(chapter) ? { book, chapter } : null;
}
function go(route: Route) {
  const p = new URLSearchParams(window.location.search);
  p.delete("book");
  p.delete("chapter");
  if (route !== null) {
    p.set("book", route.book);
    p.set("chapter", route.chapter);
  }
  window.history.pushState(null, "", `?${p.toString()}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function StudioShell(): JSX.Element {
  const [route, setRoute] = useState<Route>(routeFromUrl);
  useEffect(() => {
    const onPop = () => setRoute(routeFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  return (
    <div class="studio">
      <header class="studio-bar">
        <button type="button" class="review-link studio-home" onClick={() => go(null)}>
          Chalk Studio
        </button>
        <span class="review-hint">
          {route === null
            ? "Every chapter and where it stands."
            : `${route.book} / ${route.chapter}`}
        </span>
        <a class="review-chip" href="?dev&activity">
          Activity
        </a>
      </header>
      {route === null ? <BoardView /> : <ChapterView book={route.book} chapter={route.chapter} />}
    </div>
  );
}

function BoardView(): JSX.Element {
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    getJson<Board>("/dev-studio/board")
      .then((b) => {
        setBoard(b);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, []);
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [load]);
  if (error !== null) return <p class="review-msg">Studio can't read the tree: {error}</p>;
  if (board === null) return <p class="review-msg">Reading the content tree…</p>;
  return (
    <div class="studio-board">
      {board.books.map((book) => (
        <section key={book.id} class="studio-book">
          <h2>
            {book.title}{" "}
            <span class="review-hint">
              {book.id}
              {book.isListed ? "" : " · not in the build"}
            </span>
          </h2>
          <table class="studio-table">
            <thead>
              <tr>
                <th>Chapter</th>
                <th>Stage</th>
                <th>Lessons</th>
                <th>Comments</th>
                <th>Next</th>
              </tr>
            </thead>
            <tbody>
              {board.chapters
                .filter((c) => c.book === book.id)
                .map((c) => {
                  const stage = stageOf(c);
                  const written = c.lessons.filter((l) => l.isWritten).length;
                  return (
                    <tr key={c.chapter}>
                      <td>
                        <button
                          type="button"
                          class="review-link"
                          onClick={() => go({ book: c.book, chapter: c.chapter })}
                        >
                          {c.title}
                        </button>
                        {!c.isListed && <span class="review-hint"> · not in the build</span>}
                      </td>
                      <td>
                        <span class={`studio-stage is-${stage}`}>{stageLabel[stage]}</span>
                        {c.openQuestions > 0 && (
                          <span class="review-hint">
                            {" "}
                            · {c.openQuestions} open question{c.openQuestions > 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td>
                        {written}
                        {c.lessonsPlanned > 0 ? ` / ${c.lessonsPlanned}` : ""}
                      </td>
                      <td>{c.openComments > 0 ? c.openComments : ""}</td>
                      <td class="review-hint">
                        {c.next === null
                          ? c.status === "draft"
                            ? "your review"
                            : ""
                          : `${c.next.step}${c.next.lesson ? ` ${c.next.lesson}` : ""}`}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </section>
      ))}
      <DropZone books={board.books} onDone={load} />
    </div>
  );
}

function DropZone({ books, onDone }: { books: Board["books"]; onDone: () => void }): JSX.Element {
  const [book, setBook] = useState(books[0]?.id ?? "");
  const [newBook, setNewBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const isNew = book === "__new";
  const submit = async () => {
    if (file === null || chapter.trim() === "" || (isNew ? newBook.trim() === "" : book === ""))
      return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      const where = await post<{ book: string; chapter: string }>("drop", {
        book: isNew ? newBook : book,
        bookTitle: isNew ? newBook : undefined,
        chapter,
        chapterTitle: chapter,
        fileName: file.name,
        base64: btoa(binary),
      });
      setNote(
        `Queued content/${where.book}/${where.chapter}. Next: run the plan-chapter skill on it.`,
      );
      setChapter("");
      setFile(null);
      onDone();
    } catch (e) {
      setNote(`Couldn't drop it: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section class="studio-drop">
      <h2>New chapter</h2>
      <p class="review-hint">
        Drop the source (a PDF, a text extract, notes) and the chapter is queued with an empty plan.
        Nothing is built here; the plan skill picks it up.
      </p>
      <div class="studio-drop-row">
        <select value={book} onChange={(e) => setBook((e.target as HTMLSelectElement).value)}>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
          <option value="__new">New book…</option>
        </select>
        {isNew && (
          <input
            placeholder="Book title (e.g. Class 9 Science)"
            value={newBook}
            onInput={(e) => setNewBook((e.target as HTMLInputElement).value)}
          />
        )}
        <input
          placeholder="Chapter title (e.g. Motion)"
          value={chapter}
          onInput={(e) => setChapter((e.target as HTMLInputElement).value)}
        />
        <input
          type="file"
          onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0] ?? null)}
        />
        <button
          type="button"
          class="review-primary"
          disabled={busy || file === null || chapter.trim() === ""}
          onClick={() => void submit()}
        >
          {busy ? "Dropping…" : "Queue chapter"}
        </button>
      </div>
      {note !== null && <p class="review-msg">{note}</p>}
    </section>
  );
}

/** The plan's markdown with an id on each heading, so comments can point at sections. */
function renderPlan(plan: string): { html: string; sections: string[] } {
  const body = plan.replace(/^---\n[\s\S]*?\n---\n/, "");
  const sections: string[] = [];
  const renderer = new marked.Renderer();
  renderer.heading = ({ text, depth }) => {
    const id = `plan-${sections.length}`;
    sections.push(text);
    return `<h${depth} id="${id}" data-section="${text.replace(/"/g, "&quot;")}">${text}</h${depth}>`;
  };
  const html = marked.parse(body, { renderer, async: false }) as string;
  return { html, sections };
}

/**
 * Where a quoted passage sits in plan.md, as 1-based lines ("12" or "12-14"), so an agent can
 * open the file at the place. Markdown marks are ignored when matching, and the quote may run
 * over several lines.
 */
export function linesOf(plan: string, quote: string): string | null {
  const plain = (t: string) =>
    t
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, "")
      .replace(/[*_`#>|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  const wanted = plain(quote);
  if (wanted === "") return null;
  const lines = plan.split("\n").map(plain);
  // The tightest window: the latest start that still matches, with its earliest end.
  let best: { start: number; end: number } | null = null;
  for (let start = 0; start < lines.length; start++) {
    let joined = "";
    for (let end = start; end < lines.length && end < start + 12; end++) {
      joined = joined === "" ? (lines[end] ?? "") : `${joined} ${lines[end] ?? ""}`;
      if (joined.includes(wanted)) {
        best = { start, end };
        break;
      }
    }
  }
  if (best === null) return null;
  return best.start === best.end ? `${best.start + 1}` : `${best.start + 1}-${best.end + 1}`;
}

type Draft = {
  section: string;
  quote: string;
  lines: string | null;
  text: string;
  at: { x: number; y: number } | null;
};

function ChapterView({ book, chapter }: { book: string; chapter: string }): JSX.Element {
  const [detail, setDetail] = useState<ChapterDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    all: { threads },
    send,
  } = useThreads();
  const load = useCallback(() => {
    getJson<ChapterDetail>(
      `/dev-studio/chapter?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`,
    )
      .then((d) => {
        setDetail(d);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [book, chapter]);
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [load]);
  const chapterId = `${book}/${chapter}`;
  const planComments = useMemo(
    () =>
      threads.filter(
        (t) => t.board === undefined && t.source?.startsWith(`content/${chapterId}/plan.md`),
      ),
    [threads, chapterId],
  );
  const rendered = useMemo(() => (detail?.plan ? renderPlan(detail.plan) : null), [detail?.plan]);
  const [draft, setDraft] = useState<Draft | null>(null);
  /** A "Comment" button floating by the words just selected in the plan. */
  const [pick, setPick] = useState<{ quote: string; section: string; x: number; y: number } | null>(
    null,
  );
  const planRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onUp = () => {
      window.setTimeout(() => {
        const selection = window.getSelection();
        const quote = selection?.toString().trim() ?? "";
        const box = planRef.current;
        if (quote === "" || selection === null || selection.rangeCount === 0 || box === null) {
          setPick(null);
          return;
        }
        const range = selection.getRangeAt(0);
        if (!box.contains(range.commonAncestorContainer)) {
          setPick(null);
          return;
        }
        const rect = range.getBoundingClientRect();
        const host = box.getBoundingClientRect();
        setPick({
          quote,
          section: sectionOf(range.startContainer),
          x: rect.left - host.left,
          y: rect.top - host.top,
        });
      }, 0);
    };
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onUp);
    };
  }, []);
  // Underline what has been commented on, so the plan shows its own review. Runs again when the
  // plan is re-rendered, since that replaces the marked nodes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `rendered` is the trigger, not an input
  useEffect(() => {
    const box = planRef.current;
    if (box === null) return;
    for (const mark of box.querySelectorAll("mark.studio-mark")) {
      const parent = mark.parentNode;
      if (parent === null) continue;
      parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
      parent.normalize();
    }
    const toMark = [
      ...planComments.filter((c) => (c.quote ?? "") !== "" && !isFinished(c)),
      ...(draft !== null && draft.quote !== ""
        ? [{ quote: draft.quote, status: "draft", text: "" }]
        : []),
    ];
    for (const c of toMark) {
      const quote = c.quote ?? "";
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      let node: Node | null = walker.nextNode();
      while (node !== null) {
        const text = node.textContent ?? "";
        const at = text.indexOf(quote);
        if (at >= 0 && node instanceof Text) {
          const hit = node.splitText(at);
          hit.splitText(quote.length);
          const mark = document.createElement("mark");
          mark.className = `studio-mark is-${c.status}`;
          mark.title = c.text;
          hit.parentNode?.replaceChild(mark, hit);
          mark.appendChild(hit);
          break;
        }
        node = walker.nextNode();
      }
    }
  }, [planComments, rendered, draft]);

  if (error !== null) return <p class="review-msg">{error}</p>;
  if (detail === null) return <p class="review-msg">Reading the chapter…</p>;
  const stage = stageOf(detail);
  const setStatus = async (status: Extract<PlanStatus, "approved" | "draft">) => {
    const next = await post<ChapterDetail>(status === "approved" ? "approve" : "reopen", {
      book,
      chapter,
    });
    setDetail(next);
  };
  const startComment = (from?: { quote: string; section: string; x: number; y: number }) => {
    const quote = from?.quote ?? "";
    const section = from?.section ?? "";
    setDraft({
      section,
      quote,
      lines: detail?.plan ? linesOf(detail.plan, quote) : null,
      text: "",
      at: from === undefined ? null : { x: from.x, y: from.y },
    });
    setPick(null);
    window.getSelection()?.removeAllRanges();
  };
  const saveComment = async () => {
    if (draft === null || draft.text.trim() === "") return;
    const problem = await send({
      op: "start",
      thread: {
        source: `content/${book}/${chapter}/plan.md${draft.lines === null ? "" : `:${draft.lines}`}`,
        ...(draft.section === "" ? {} : { snapshot: draft.section }),
        ...(draft.quote === "" ? {} : { quote: draft.quote }),
        text: draft.text,
      },
    });
    if (problem === null) setDraft(null);
    else setError(problem);
  };
  const lessonComments = threads.filter((t) => t.board?.startsWith(`${chapterId}/`));

  return (
    <div class="studio-chapter">
      <section class="studio-head">
        <h1>{detail.title}</h1>
        <p class="review-hint">
          {detail.bookTitle} · <span class={`studio-stage is-${stage}`}>{stageLabel[stage]}</span>
          {detail.approvedOn !== null && ` · approved ${detail.approvedOn}`}
          {detail.source !== null && ` · source: ${detail.source}`}
          {detail.files.length > 0 && ` (${detail.files.join(", ")})`}
        </p>
        <div class="review-chips">
          {detail.status === "draft" && (
            <button type="button" class="review-primary" onClick={() => void setStatus("approved")}>
              Approve the plan
            </button>
          )}
          {detail.status === "approved" && (
            <button type="button" class="review-chip" onClick={() => void setStatus("draft")}>
              Reopen the plan
            </button>
          )}
          {detail.plan !== null && (
            <button type="button" class="review-chip" onClick={() => startComment()}>
              Comment on the whole plan
            </button>
          )}
          {detail.plan !== null && (
            <span class="review-hint">Select words in the plan to comment on that place.</span>
          )}
        </div>
      </section>

      <div class="studio-columns">
        <section class="studio-plan" ref={planRef}>
          {rendered === null ? (
            <p class="review-msg">No plan yet.</p>
          ) : (
            // biome-ignore lint/security/noDangerouslySetInnerHtml: the plan is this repo's own markdown, not user input
            <div class="studio-md" dangerouslySetInnerHTML={{ __html: rendered.html }} />
          )}
          {pick !== null && draft === null && (
            <button
              type="button"
              class="review-primary studio-pick"
              style={{ left: `${Math.max(0, pick.x)}px`, top: `${pick.y - 38}px` }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => startComment(pick)}
            >
              Comment
            </button>
          )}
        </section>

        <aside class="studio-side">
          {draft !== null && (
            <div class="review-sheet is-near studio-sheet">
              <div class="review-sheet-where">
                {draft.section === "" ? "The plan" : draft.section}
                {draft.lines !== null && <span class="review-hint"> · plan.md:{draft.lines}</span>}
              </div>
              {draft.quote !== "" && <blockquote class="review-quote">{draft.quote}</blockquote>}
              <textarea
                value={draft.text}
                placeholder="What should change?"
                onInput={(e) =>
                  setDraft({ ...draft, text: (e.target as HTMLTextAreaElement).value })
                }
              />
              <div class="review-sheet-actions">
                <button type="button" class="review-chip" onClick={() => setDraft(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  class="review-primary"
                  disabled={draft.text.trim() === ""}
                  onClick={() => void saveComment()}
                >
                  Save comment
                </button>
              </div>
            </div>
          )}
          <RunPanel detail={detail} onChanged={load} />

          <h3>Lessons</h3>
          <ol class="studio-lessons">
            {detail.lessons.map((l) => (
              <li key={l.slug}>
                {l.id !== null ? (
                  <a href={`?dev&board=${encodeURIComponent(`${book}/${chapter}/${l.slug}`)}`}>
                    {l.title}
                  </a>
                ) : (
                  l.title
                )}
                <span class="review-hint">
                  {" "}
                  {l.isWritten ? "written" : "not yet"}
                  {l.isWritten && !l.isListed ? ", not in the build" : ""}
                </span>
              </li>
            ))}
            {detail.lessons.length === 0 && <li class="review-hint">None built.</li>}
          </ol>

          <h3>Plan comments</h3>
          <ul class="review-list">
            {planComments.length === 0 && <li class="review-hint">None.</li>}
            {planComments.map((c) => (
              <CommentItem key={c.id} c={c} />
            ))}
          </ul>

          <h3>Screen comments</h3>
          <ul class="review-list">
            {lessonComments.length === 0 && <li class="review-hint">None.</li>}
            {lessonComments.map((c) => (
              <CommentItem key={c.id} c={c} />
            ))}
          </ul>

          <h3>Runs</h3>
          {detail.runList.length === 0 && <p class="review-hint">No runs recorded.</p>}
          {detail.runList.map((r) => (
            <details key={r.name} class="studio-run">
              <summary>{r.name.replace(/\.md$/, "")}</summary>
              <pre>{r.text}</pre>
            </details>
          ))}
        </aside>
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  "plan-chapter",
  "apply-review",
  "build-props",
  "build-lesson",
  "self-review",
];

/**
 * The agent, from here: what the pipeline would do next and a button to do it, any other step on
 * request, and the live transcript of the run going now. One run at a time for the repo.
 */
function RunPanel({
  detail,
  onChanged,
}: { detail: ChapterDetail; onChanged: () => void }): JSX.Element {
  const [runs, setRuns] = useState<{ current: RunState | null; recent: RunState[] } | null>(null);
  const [pickStep, setPickStep] = useState<Step | "">("");
  const [lesson, setLesson] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const logRef = useRef<HTMLPreElement>(null);
  const poll = useCallback(() => {
    getJson<{ current: RunState | null; recent: RunState[] }>("/dev-studio/runs")
      .then(setRuns)
      .catch(() => {});
  }, []);
  useEffect(() => {
    poll();
    const timer = window.setInterval(poll, 2000);
    return () => window.clearInterval(timer);
  }, [poll]);
  const live = runs?.current ?? null;
  const isRunning = live !== null && live.endedAt === null;
  const mine = live !== null && live.book === detail.book && live.chapter === detail.chapter;
  // When a run ends, the files changed: re-read the chapter.
  const endedAt = live?.endedAt ?? null;
  useEffect(() => {
    if (endedAt !== null) onChanged();
  }, [endedAt, onChanged]);
  const lineCount = live?.lines.length ?? 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll to the end when a line arrives
  useEffect(() => {
    const el = logRef.current;
    if (el !== null) el.scrollTop = el.scrollHeight;
  }, [lineCount]);
  const start = async (step?: Step) => {
    setNote(null);
    try {
      await post<RunState>("run", {
        book: detail.book,
        chapter: detail.chapter,
        ...(step !== undefined ? { step } : {}),
        ...(step === "build-lesson" && lesson !== "" ? { lesson } : {}),
      });
      poll();
    } catch (e) {
      setNote(e instanceof Error ? e.message : String(e));
    }
  };
  return (
    <section class="studio-runpanel">
      <h3>Agent</h3>
      {detail.next === null ? (
        <p class="review-hint">
          {detail.status === "draft"
            ? "Nothing to run: the plan waits for your review and approval."
            : "Nothing to run: the chapter is up to date."}
        </p>
      ) : (
        <p class="review-msg">
          Next: <strong>{detail.next.step}</strong>
          {detail.next.lesson !== undefined && <code> {detail.next.lesson}</code>} —{" "}
          {detail.next.reason}.
        </p>
      )}
      <div class="review-chips">
        {detail.next !== null && (
          <button
            type="button"
            class="review-primary"
            disabled={isRunning}
            onClick={() => void start()}
          >
            {isRunning ? "A run is going…" : "Run next step"}
          </button>
        )}
        <select
          value={pickStep}
          disabled={isRunning}
          onChange={(e) => setPickStep((e.target as HTMLSelectElement).value as Step | "")}
        >
          <option value="">Another step…</option>
          {STEPS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {pickStep === "build-lesson" && (
          <input
            placeholder="lesson slug"
            value={lesson}
            onInput={(e) => setLesson((e.target as HTMLInputElement).value)}
          />
        )}
        {pickStep !== "" && (
          <button
            type="button"
            class="review-chip"
            disabled={isRunning}
            onClick={() => void start(pickStep)}
          >
            Run {pickStep}
          </button>
        )}
        {isRunning && (
          <button
            type="button"
            class="review-chip"
            onClick={() => void post("stop", {}).then(poll)}
          >
            Stop
          </button>
        )}
      </div>
      {note !== null && <p class="review-msg">{note}</p>}
      {live !== null && (
        <details class="studio-run" open={mine}>
          <summary>
            {isRunning ? "Running" : live.exitCode === 0 ? "Finished" : "Ended"}: {live.step} on{" "}
            {live.book}/{live.chapter}
            {!mine && " (another chapter)"}
          </summary>
          <pre ref={logRef} class="studio-log">
            {live.lines.join("\n")}
          </pre>
        </details>
      )}
    </section>
  );
}

/** The heading a node sits under in the rendered plan. */
function sectionOf(start: Node): string {
  let node: Node | null = start;
  while (node !== null) {
    if (node instanceof HTMLElement) {
      const heading = node.closest("[data-section]") ?? previousHeading(node);
      const name = heading?.getAttribute("data-section");
      if (name) return name;
    }
    node = node.parentNode;
  }
  return "";
}

function previousHeading(el: HTMLElement): Element | null {
  let node: Element | null = el;
  while (node !== null) {
    let sibling = node.previousElementSibling;
    while (sibling !== null) {
      if (sibling.hasAttribute("data-section")) return sibling;
      sibling = sibling.previousElementSibling;
    }
    node = node.parentElement;
    if (node?.classList.contains("studio-md")) return null;
  }
  return null;
}

/** A thread, as the studio lists it: where, what was said, and everything written on it since. */
function CommentItem({ c }: { c: Thread }): JSX.Element {
  return (
    <li class={`review-item is-${c.status}`}>
      <div class="review-item-head">
        <span>
          {c.board === undefined ? (c.snapshot ?? "The plan") : (c.target ?? c.board)}
          {c.label !== "comment" && <span class="review-hint">{` · ${c.label}`}</span>}
        </span>
        <span class={`review-pill is-${c.status}`}>{c.status}</span>
      </div>
      {c.source !== undefined && <p class="review-msg">{c.source}</p>}
      {c.quote !== undefined && <blockquote class="review-quote">{c.quote}</blockquote>}
      <p class="review-said">{c.text}</p>
      {c.messages.map((m) => (
        <p key={`${m.at}·${m.by}`} class="review-msg">
          <strong>{`${m.by}${m.status ? ` → ${m.status}` : ""}:`}</strong> {m.text}
        </p>
      ))}
    </li>
  );
}
