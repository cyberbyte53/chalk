/**
 * Studio (`?dev&studio`): the content pipeline as the files say it is. A board of every chapter
 * with its stage; a chapter's plan, rendered, with comments and the approve switch; its runs; a
 * drop zone for a new chapter's source. Studio builds nothing: agents build, through the skills
 * in `.claude/skills/`, and this page is how a person watches and steers. Data comes from
 * /dev-studio (see ../dev-studio.ts) and comments from /dev-review.
 */
import { Locale } from "@chalk/content";
import { marked } from "marked";
import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { Board, ChapterDetail, ChapterRow, PlanStatus } from "../dev-studio";
import { CommentStatus, type ReviewComment, statusLabel, useComments } from "./review-comments";

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

const PLAN_BOARD = "plan";

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
        <a class="review-chip" href="?dev&review">
          Screen review
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
                <th>Runs</th>
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
                      <td>{c.runs > 0 ? c.runs : ""}</td>
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
  const { comments, send } = useComments();
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
    () => comments.filter((c) => c.lessonId === chapterId && c.board === PLAN_BOARD),
    [comments, chapterId],
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
      ...planComments.filter((c) => c.quote !== "" && c.status !== CommentStatus.Done),
      ...(draft !== null && draft.quote !== ""
        ? [{ quote: draft.quote, status: "draft", text: "" }]
        : []),
    ];
    for (const c of toMark) {
      const walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
      let node: Node | null = walker.nextNode();
      while (node !== null) {
        const text = node.textContent ?? "";
        const at = text.indexOf(c.quote);
        if (at >= 0 && node instanceof Text) {
          const hit = node.splitText(at);
          hit.splitText(c.quote.length);
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
    await send({
      op: "add",
      comment: {
        lessonId: chapterId,
        lessonTitle: detail.title,
        board: PLAN_BOARD,
        boardIndex: -1,
        piece: draft.section === "" ? null : draft.section,
        part: draft.lines,
        snapshot: `content/${book}/${chapter}/plan.md${draft.lines === null ? "" : `:${draft.lines}`}`,
        locale: Locale.En,
        quote: draft.quote,
        text: draft.text,
      },
    });
    setDraft(null);
  };
  const lessonComments = detail.comments.filter(
    (c) => c.board !== PLAN_BOARD,
  ) as unknown as ReviewComment[];

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
          {detail.status === "queued" && (
            <span class="review-hint">Queued: run the plan-chapter skill.</span>
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
          <h3>Lessons</h3>
          <ol class="studio-lessons">
            {detail.lessons.map((l) => (
              <li key={l.slug}>
                {l.id !== null ? (
                  <a
                    href={`?dev&review&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`}
                  >
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
              <CommentItem
                key={c.id}
                c={c}
                onApprove={() =>
                  void send({ op: "status", id: c.id, status: CommentStatus.Approved })
                }
              />
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

function CommentItem({ c, onApprove }: { c: ReviewComment; onApprove?: () => void }): JSX.Element {
  return (
    <li class={`review-item is-${c.status}`}>
      <div class="review-item-head">
        <span>
          {c.piece ?? "The plan"}
          {c.part !== null && c.board === "plan" && (
            <span class="review-hint"> · lines {c.part}</span>
          )}
        </span>
        <span class={`review-pill is-${c.status}`}>{statusLabel[c.status]}</span>
      </div>
      {c.quote !== "" && <blockquote class="review-quote">{c.quote}</blockquote>}
      <p class="review-said">{c.text}</p>
      {c.proposal !== undefined && (
        <div class="review-proposal">
          <strong>{c.proposal.summary}</strong>
          {c.proposal.changes.map((ch, i) => (
            <p key={String(i)} class="review-msg">
              <s>{ch.before}</s> → {ch.after}
            </p>
          ))}
          {c.status === CommentStatus.Proposed && onApprove !== undefined && (
            <button type="button" class="review-primary" onClick={onApprove}>
              Approve
            </button>
          )}
        </div>
      )}
      {c.thread.map((t, i) => (
        <p key={String(i)} class="review-msg">
          <strong>{t.by}:</strong> {t.text}
        </p>
      ))}
    </li>
  );
}
