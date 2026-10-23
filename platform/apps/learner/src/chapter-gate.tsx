import type { Locale } from "@chalk/content";
import { JugnuFigure, JugnuMood } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { say } from "./app-text";
import { type ChapterContent, loadChapter, readyChapter } from "./content-store";
import type { CourseChapter } from "./course";

/** A quick load shows nothing; once the loader shows, it stays this long so it doesn't flash. */
const SHOW_AFTER_MS = 200;
const SHOW_AT_LEAST_MS = 600;
/** How long each line under Jugnu stays before the next. */
const LINE_MS = 2400;
const LINES = ["fetching1", "fetching2", "fetching3", "fetching4"] as const;

type Wait =
  | { kind: "waiting" }
  | { kind: "loading"; done: number; total: number; since: number }
  | { kind: "failed" };

/**
 * A chapter's lessons, or Jugnu fetching them. The first time a chapter is opened its pages,
 * questions and the drawing code of its props are downloaded; after that it opens at once (and
 * offline, kept by the service worker). `prepare` is anything else to fetch alongside.
 */
export function ChapterGate({
  chapter,
  locale,
  prepare,
  onBack,
  children,
}: {
  chapter: CourseChapter;
  locale: Locale;
  prepare?: (chapter: CourseChapter) => Promise<void>;
  onBack: () => void;
  children: (content: ChapterContent) => JSX.Element;
}): JSX.Element {
  const [content, setContent] = useState<ChapterContent | undefined>(() => readyChapter(chapter));
  const [wait, setWait] = useState<Wait>({ kind: "waiting" });
  const [attempt, setAttempt] = useState(0);
  const shownAt = useRef<number | null>(null);

  // A new chapter, or Try again, starts a fetch; the chapter object itself is rebuilt each render.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the chapter's path and the attempt
  useEffect(() => {
    if (content !== undefined) return;
    let isLive = true;
    let latest = { done: 0, total: 0 };
    const show = window.setTimeout(() => {
      if (!isLive) return;
      shownAt.current = performance.now();
      setWait({ kind: "loading", ...latest, since: shownAt.current });
    }, SHOW_AFTER_MS);
    Promise.all([
      loadChapter(chapter, (done, total) => {
        latest = { done, total };
        if (isLive && shownAt.current !== null)
          setWait({ kind: "loading", done, total, since: shownAt.current });
      }),
      prepare?.(chapter),
    ]).then(
      ([loaded]) => {
        window.clearTimeout(show);
        const shown = shownAt.current;
        const left = shown === null ? 0 : SHOW_AT_LEAST_MS - (performance.now() - shown);
        window.setTimeout(() => isLive && setContent(loaded), Math.max(0, left));
      },
      () => {
        window.clearTimeout(show);
        if (isLive) setWait({ kind: "failed" });
      },
    );
    return () => {
      isLive = false;
      window.clearTimeout(show);
    };
  }, [chapter.path, attempt]);

  if (content !== undefined) return children(content);
  if (wait.kind === "failed")
    return (
      <div class="lesson page">
        <div class="page-body is-centred">
          <JugnuFigure mood={JugnuMood.Gentle} size={150} />
          <div class="page-section">{chapter.title[locale]}</div>
          <p class="lead">{say(locale, "fetchFailed")}</p>
        </div>
        <div class="page-foot">
          <button type="button" class="second" onClick={onBack}>
            {say(locale, "goBack")}
          </button>
          <button
            type="button"
            class="primary"
            onClick={() => {
              shownAt.current = null;
              setWait({ kind: "waiting" });
              setAttempt((n) => n + 1);
            }}
          >
            {say(locale, "tryAgain")}
          </button>
        </div>
      </div>
    );
  if (wait.kind === "waiting") return <div class="lesson page" />;
  return (
    <JugnuLoader
      title={chapter.title[locale]}
      done={wait.done}
      total={wait.total}
      locale={locale}
    />
  );
}

/** Glowing pages fly in to Jugnu while a ring of light fills with what has arrived. */
export function JugnuLoader({
  title,
  done,
  total,
  locale,
}: {
  title: string;
  done: number;
  total: number;
  locale: Locale;
}): JSX.Element {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const turn = window.setInterval(() => setLine((n) => (n + 1) % LINES.length), LINE_MS);
    return () => window.clearInterval(turn);
  }, []);
  const R = 100;
  const around = 2 * Math.PI * R;
  const isKnown = total > 0;
  const part = isKnown ? Math.min(1, done / total) : 0.22;
  return (
    <output class="lesson page jugnu-loader" aria-live="polite">
      <div class="page-body is-centred">
        <div class="page-section">{title}</div>
        <div class="loader-stage">
          <svg viewBox="0 0 240 240" class="loader-ring" aria-hidden="true">
            <circle class="loader-halo" cx={120} cy={120} r={86} />
            <circle class="loader-track" cx={120} cy={120} r={R} />
            <circle
              class={`loader-trail${isKnown ? "" : " is-spinning"}`}
              cx={120}
              cy={120}
              r={R}
              stroke-dasharray={`${part * around} ${around}`}
              transform="rotate(-90 120 120)"
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} class="loader-page" style={{ "--i": i } as JSX.CSSProperties}>
                <rect x={-7} y={-9} width={14} height={18} rx={2.5} />
                <line x1={-3.5} y1={-3} x2={3.5} y2={-3} />
                <line x1={-3.5} y1={1} x2={3.5} y2={1} />
              </g>
            ))}
          </svg>
          <div class="loader-jugnu">
            <JugnuFigure mood={JugnuMood.Reading} size={118} />
          </div>
        </div>
        <p class="lead loader-line" key={line}>
          {say(locale, LINES[line] ?? "fetching1")}
        </p>
        <div class="small loader-count">
          {isKnown ? say(locale, "fetchProgress", { done, all: total }) : " "}
        </div>
      </div>
    </output>
  );
}
