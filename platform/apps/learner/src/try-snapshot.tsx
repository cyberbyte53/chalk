import type { QuestionSeen, TryCausesReply, TrySeen } from "@chalk/api";
import type { Locale, Localized } from "@chalk/content";
import { type BoardRuntime, RichText } from "@chalk/player";
import { PropRole } from "@chalk/prop";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { api } from "./api-client";
import { BoardAt } from "./board-at";
import { boardAt } from "./content-store";

/** The width a board is drawn at before it is shrunk to a snapshot: a phone's. */
const DRAWN_WIDTH = 360;
/** A snapshot's height for its width. */
const CROP = 1;
/** Room around the answered piece, in the board's own pixels. */
const MARGIN = 8;

/**
 * The piece their answer is in: what a question is `about` (a goal's prop), else the question
 * itself (a choice: its options, the one they chose marked).
 */
const questionOf = (runtime: BoardRuntime): string | undefined =>
  runtime.propNames().find((n) => runtime.getDef(n).role === PropRole.Question);

function answeredPiece(runtime: BoardRuntime): string | undefined {
  const question = questionOf(runtime);
  if (question === undefined) return undefined;
  const about = runtime.getView(question).about;
  return typeof about === "string" && runtime.propNames().includes(about) ? about : question;
}

/**
 * A child's board at one of their tries, small (platform/docs/plans/teacher-view.md, snapshots):
 * what they did on that opening up to the try, played again on the real player in the browser,
 * framed on the piece their answer is in. Drawn only once it scrolls into view. Best effort: when
 * it can't be drawn, their answer in words.
 */
export function TrySnapshot({
  groupId,
  learnerId,
  question,
  tried,
  width,
  locale,
  onAsked,
}: {
  groupId: string;
  learnerId: string;
  question: QuestionSeen;
  tried: TrySeen;
  width: number;
  locale: Locale;
  /** What the question asked, as the board says it (its prompt), once drawn. */
  onAsked?: (asked: Localized) => void;
}): JSX.Element {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [causes, setCauses] = useState<TryCausesReply["causes"] | undefined>();
  const [isBroken, setIsBroken] = useState(false);
  const [frame, setFrame] = useState<string | undefined>();
  const height = Math.round(width * CROP);
  useEffect(() => {
    const el = box.current;
    if (el === null) return;
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsInView(true);
          seen.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    seen.observe(el);
    return () => seen.disconnect();
  }, []);
  useEffect(() => {
    if (!isInView) return;
    let isCurrent = true;
    api.tryCauses(groupId, learnerId, tried.opening, tried.at).then(
      (reply) => {
        if (isCurrent) setCauses(reply.causes);
      },
      (error: unknown) => {
        console.warn("Snapshot:", error);
        if (isCurrent) setIsBroken(true);
      },
    );
    return () => {
      isCurrent = false;
    };
  }, [isInView, groupId, learnerId, tried.opening, tried.at]);

  // Once drawn: the answered piece (its picture, when it draws one), measured on the board at its
  // own size and fitted to the box.
  const watching = useRef<{ disconnect: () => void } | undefined>(undefined);
  useEffect(() => () => watching.current?.disconnect(), []);
  const fit = (runtime: BoardRuntime) => {
    const question = questionOf(runtime);
    const prompt = question === undefined ? undefined : runtime.getView(question).prompt;
    if (onAsked !== undefined && typeof prompt === "object" && prompt !== null && "en" in prompt)
      onAsked(prompt as Localized);
    const piece = answeredPiece(runtime);
    const board = inner.current;
    // Found afresh each time: the player may draw the piece again as a new element.
    const targetOf = (): Element | null => {
      const found =
        piece === undefined ? null : board?.querySelector(`[data-piece="${CSS.escape(piece)}"]`);
      return found === null || found === undefined ? null : (found.querySelector("svg") ?? found);
    };
    if (board === null || board === undefined || targetOf() === null) {
      setFrame(`scale(${width / DRAWN_WIDTH})`);
      return;
    }
    const measure = () => {
      const target = targetOf();
      if (target === null) return;
      // As drawn, then undone by the snapshot's own shrinking (its width against its layout width).
      const at = target.getBoundingClientRect();
      const from = board.getBoundingClientRect();
      const shrunk = from.width / board.offsetWidth || 1;
      const w = at.width / shrunk + 2 * MARGIN;
      const h = at.height / shrunk + 2 * MARGIN;
      if (w <= 2 * MARGIN || h <= 2 * MARGIN) return;
      const scale = Math.min(width / w, height / h);
      const left = (at.left - from.left) / shrunk - MARGIN;
      const top = (at.top - from.top) / shrunk - MARGIN;
      const x = left - (width / scale - w) / 2;
      const y = top - (height / scale - h) / 2;
      setFrame(`scale(${scale}) translate(${-x}px, ${-y}px)`);
    };
    // The player settles the piece's size after it is drawn (layout.tsx): measured again on every
    // change inside the board, once a frame at most.
    let isAsked = false;
    const again = () => {
      if (isAsked) return;
      isAsked = true;
      requestAnimationFrame(() => {
        isAsked = false;
        measure();
      });
    };
    const drawnBoard = board.firstElementChild ?? board;
    const changes = new MutationObserver(again);
    changes.observe(drawnBoard, { attributes: true, childList: true, subtree: true });
    watching.current?.disconnect();
    watching.current = changes;
    again();
  };

  return (
    <div
      class="snapshot"
      ref={box}
      style={{ width: `${width}px`, height: `${height}px` }}
      aria-hidden="true"
    >
      {isBroken ? (
        <div class="snapshot-words">
          {tried.chosen === null ? "" : <RichText text={tried.chosen[locale]} />}
        </div>
      ) : causes === undefined ? null : (
        // Measured unshrunk and unseen, then shrunk by a transform: the board lays itself out at
        // the width it is drawn at.
        <div
          class="snapshot-board"
          ref={inner}
          style={frame === undefined ? { visibility: "hidden" } : { transform: frame }}
        >
          <BoardAt
            path={question.path}
            load={(path) => boardAt({ path, version: tried.version })}
            events={causes}
            width={DRAWN_WIDTH}
            locale={locale}
            isPicture
            onDrawn={fit}
            onProblem={(problem) => {
              console.warn("Snapshot:", problem);
              setIsBroken(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
