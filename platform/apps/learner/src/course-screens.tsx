import { type Progress, isConceptDone } from "@chalk/api";
import type { BuiltArt, Locale } from "@chalk/content";
import { Stage, Trail } from "@chalk/draw";
import { OwnHtml, RichText, ours } from "@chalk/player";
import type { JSX } from "preact";
import { useLayoutEffect, useState } from "preact/hooks";
import { say } from "./app-text";
import type { Course, CourseChapter } from "./course";

/** Art from the build: checked SVG (see studio's art checks), so it is inlined as it is. */
export function ArtView({ art }: { art: BuiltArt | null }): JSX.Element | null {
  if (art === null) return null;
  return <OwnHtml tag="div" class={`art is-${art.frame}`} markup={ours(art.svg)} />;
}

function BackButton({ label, onBack }: { label: string; onBack: () => void }): JSX.Element {
  return (
    <button type="button" class="screen-back" aria-label={label} onClick={onBack}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M11 3 L5 9 L11 15" />
      </svg>
    </button>
  );
}

/** A book: its art, then its chapters as tiles. */
export function CourseScreen({
  course,
  locale,
  onChapter,
  onBack,
}: {
  course: Course;
  locale: Locale;
  onChapter: (index: number) => void;
  onBack: () => void;
}): JSX.Element {
  return (
    <div class="lesson screen">
      <header class="screen-header">
        <BackButton label="Back" onBack={onBack} />
      </header>
      <h1 class="screen-title">
        <RichText text={course.title[locale]} />
      </h1>
      {course.art !== null && (
        <div class="hero">
          <ArtView art={course.art} />
        </div>
      )}
      <h2 class="screen-section">Chapters</h2>
      <div class="chapter-grid">
        {course.chapters.map((chapter, i) => (
          <button
            key={chapter.title.en}
            type="button"
            class="chapter-tile"
            onClick={() => onChapter(i)}
          >
            <ArtView art={chapter.art} />
            <span class="chapter-number">Chapter {i + 1}</span>
            <span class="chapter-name">
              <RichText text={chapter.title[locale]} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** The chapter's path: where each stop sits, and how tall the screen it fills is. */
const ROW = 132;
const NODE_Y = 52;
/** The current concept's card under its stop: its art and a Continue line. */
const CARD = 236;
const SIDES = [0.24, 0.76] as const;

type Stop = { x: number; y: number; top: number; isCurrent: boolean };

function layoutStops(count: number, current: number): { stops: Stop[]; height: number } {
  const stops: Stop[] = [];
  let top = 8;
  for (let i = 0; i < count; i++) {
    const isCurrent = i === current;
    stops.push({ x: SIDES[i % 2] ?? 0.5, y: top + NODE_Y, top, isCurrent });
    top += ROW + (isCurrent ? CARD : 0);
  }
  return { stops, height: top };
}

/** The road from stop to stop: it leaves each stop going down and turns, an S between stops. */
function roadThrough(stops: readonly Stop[]): [number, number][] {
  const points: [number, number][] = [];
  stops.forEach((stop, i) => {
    points.push([stop.x, stop.y]);
    const next = stops[i + 1];
    if (next === undefined) return;
    const drop = next.y - stop.y;
    points.push([stop.x, stop.y + drop * 0.32], [next.x, next.y - drop * 0.32]);
  });
  return points;
}

/** The width an element is drawn at, kept up to date (the path is drawn to it). */
function useWidth(): [(el: HTMLElement | null) => void, number] {
  const [el, setEl] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (el === null) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  return [setEl, width];
}

/** Where a learner is in a chapter: the first concept not done yet (-1 when all are). */
export function currentConcept(chapter: CourseChapter, progress: Progress): number {
  return chapter.concepts.findIndex((c) => !isConceptDone(progress[c.id], c.hasPractice));
}

/**
 * A chapter: its concepts as stops on a winding path (Calm 5). Done ones are green with their
 * score; the current one is filled and shows its art; the rest wait as grey stops with their glyph.
 */
export function ChapterScreen({
  chapter,
  number,
  locale,
  progress,
  onConcept,
  onBack,
}: {
  chapter: CourseChapter;
  number: number;
  locale: Locale;
  progress: Progress;
  onConcept: (conceptId: string) => void;
  onBack: () => void;
}): JSX.Element {
  const current = currentConcept(chapter, progress);
  const [measured, width] = useWidth();
  const { stops, height } = layoutStops(chapter.concepts.length, current);
  const count = chapter.concepts.length;
  const done = current === -1 ? 1 : count < 2 ? 0 : current / (count - 1);
  return (
    <div class="lesson screen">
      <header class="screen-header">
        <BackButton label="Back to chapters" onBack={onBack} />
      </header>
      <div class="screen-kicker">{say(locale, "chapterOf", { n: number })}</div>
      <h1 class="screen-title">
        <RichText text={chapter.title[locale]} />
      </h1>
      <div class="screen-kicker">{say(locale, "conceptsThenPractice", { n: count })}</div>
      <div class="path" ref={measured} style={{ height: `${height}px` }}>
        {width > 0 && (
          <Stage label="The chapter's path" x={[0, 1]} width={width} height={height}>
            <Trail points={roadThrough(stops)} done={done} />
          </Stage>
        )}
        {chapter.concepts.map((concept, i) => {
          const stop = stops[i];
          if (stop === undefined) return null;
          const isLeft = stop.x < 0.5;
          const mine = progress[concept.id];
          const isDone = isConceptDone(mine, concept.hasPractice);
          const status = isDone
            ? mine?.practice
              ? say(locale, "practiceScore", { right: mine.practice.right, of: mine.practice.of })
              : say(locale, "learnt")
            : undefined;
          return (
            <div key={concept.id} class="stop" style={{ top: `${stop.top}px` }}>
              <button
                type="button"
                class={`stop-node${stop.isCurrent ? " is-current" : ""}${isDone ? " is-done" : ""}`}
                style={{ left: `calc(${stop.x * 100}% - 32px)`, top: `${NODE_Y - 32}px` }}
                aria-label={concept.title[locale]}
                onClick={() => onConcept(concept.id)}
              >
                {isDone ? (
                  <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                    <path d="M6 13.5 L11 18.5 L20 8.5" />
                  </svg>
                ) : (
                  (concept.glyph ?? i + 1)
                )}
              </button>
              {!stop.isCurrent && (
                <div
                  class={isLeft ? "stop-name is-right-of" : "stop-name is-left-of"}
                  style={{ top: `${NODE_Y - (status === undefined ? 14 : 22)}px` }}
                >
                  <RichText text={concept.title[locale]} />
                  {status !== undefined && <div class="stop-status">{status}</div>}
                </div>
              )}
              {stop.isCurrent && (
                <button
                  type="button"
                  class="stop-card"
                  style={{ top: `${NODE_Y + 44}px` }}
                  onClick={() => onConcept(concept.id)}
                >
                  <ArtView art={concept.art} />
                  <span class="concept-name">
                    <RichText text={concept.title[locale]} />
                  </span>
                  <span class="stop-go">
                    {say(locale, mine === undefined ? "start" : "continue")}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
