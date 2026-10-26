import { type Locale, type Piece, PieceKind, Pin, type PropPiece } from "@chalk/content";
import { Actor } from "@chalk/content";
import { type Box, PHONE_COLUMN, joinPath, namesOf, segment, sizeOf, zoomFor } from "@chalk/prop";
import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { type BoardClock, BoardClockContext } from "./board-clock";
import { findNode, stampPaths } from "./part-paths";
import type { PropRegistry } from "./prop-module";
import type { BoardRuntime } from "./runtime";
import { t } from "./ui-text";

/** Where a part (its address under the piece) is drawn in the piece's box, if it is tagged. */
function tagged(box: HTMLDivElement | null, part: string): Box | undefined {
  if (box === null) return undefined;
  const name = box.getAttribute("data-piece") ?? "";
  const element = findNode(box.parentElement ?? box, joinPath(segment(name), part));
  if (element === undefined) return undefined;
  const outer = box.getBoundingClientRect();
  const inner = element.getBoundingClientRect();
  return {
    x: inner.left - outer.left,
    y: inner.top - outer.top,
    width: inner.width,
    height: inner.height,
  };
}

/** A box in the prop's own coordinates, as it is drawn at this zoom. */
function scaled(at: Box | undefined, zoom: number): Box | undefined {
  return at === undefined
    ? undefined
    : { x: at.x * zoom, y: at.y * zoom, width: at.width * zoom, height: at.height * zoom };
}

/** A leaf's part name from its address under the piece (what `locate` takes). */
const nameIn = (part: string): string => {
  const names = namesOf(part);
  return names.length === 1 ? (names[0] ?? part) : part;
};

export type LayoutContext = {
  locale: Locale;
  registry: PropRegistry;
  runtime: BoardRuntime;
  /** Props whose audio couldn't play; they show a small retry mark. */
  audioFailed: ReadonlySet<string>;
  onRetryAudio: (name: string) => void;
  /** What Jugnu is pointing at: a prop, or one named part of it. */
  pointed?: { prop: string; part?: string | undefined } | undefined;
  /** What the student held to ask Jugnu about: they glow until asked. */
  picked?: readonly { prop: string; part?: string | undefined }[];
};

function PropPieceView({
  piece,
  context,
}: { piece: PropPiece; context: LayoutContext }): JSX.Element {
  const box = useRef<HTMLDivElement>(null);
  const drawn = useRef<HTMLDivElement>(null);
  const module = context.registry[piece.prop];
  if (module === undefined) throw new Error(`No prop type "${piece.prop}" in the library`);
  // Sized by the player (size.ts): the default, over it the prop type's rule, then the board's.
  const rule = useRef(sizeOf(module.def.size, piece.size));
  rule.current = sizeOf(module.def.size, piece.size);
  // The column's width, and the zoom the prop is drawn at; the prop lays out at column ÷ zoom.
  const [column, setColumn] = useState(PHONE_COLUMN);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const element = box.current;
    const inner = drawn.current;
    if (element === null || inner === null) return;
    const fit = () => {
      const width = Math.round(element.getBoundingClientRect().width);
      // Its height as drawn now, back at 1× (zoom scales it).
      const current = Number(inner.style.zoom) || 1;
      const natural = inner.getBoundingClientRect().height / current;
      const next = zoomFor(rule.current, width, window.innerHeight, natural);
      setColumn(width);
      // Small changes are left alone, so a prop that grows as it lays out doesn't flicker.
      setZoom((was) => (Math.abs(was - next) < 0.02 ? was : Number(next.toFixed(3))));
    };
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    observer.observe(inner);
    window.addEventListener("resize", fit);
    const stopStamping = stampPaths(element);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
      stopStamping();
    };
  }, []);
  const width = Math.max(200, Math.round(column / zoom));
  const { View } = module;
  const { runtime } = context;
  const clock = useMemo<BoardClock>(
    () => ({ time: () => runtime.time(), frame: (callback) => runtime.onFrame(callback) }),
    [runtime],
  );
  const pointed = context.pointed?.prop === piece.name ? context.pointed : undefined;
  // A part is ringed where the prop says it is drawn (`locate`), or where the view tagged it
  // (`data-part`); without either, the whole prop glows.
  const ringOf = (part: string | undefined): Box | undefined =>
    part === undefined
      ? undefined
      : (scaled(
          module.def.locate?.({ ...runtime.getView(piece.name) } as never, nameIn(part), width),
          zoom,
        ) ?? tagged(box.current, part));
  const ring = ringOf(pointed?.part);
  const isWholeGlow = pointed !== undefined && ring === undefined;
  const picks = (context.picked ?? []).filter((p) => p.prop === piece.name);
  const pickRings = picks.flatMap((p) => {
    const at = ringOf(p.part);
    return at === undefined ? [] : [at];
  });
  const isWholePicked = picks.some((p) => ringOf(p.part) === undefined);
  return (
    <div
      class={`piece-prop prop-${piece.prop}${isWholeGlow ? " is-pointed" : ""}${isWholePicked ? " is-picked" : ""}`}
      ref={box}
      data-piece={piece.name}
    >
      {pickRings.map((at) => (
        <span
          key={`${at.x},${at.y}`}
          class="ask-pick"
          aria-hidden="true"
          style={{
            left: `${at.x - 6}px`,
            top: `${at.y - 6}px`,
            width: `${at.width + 12}px`,
            height: `${at.height + 12}px`,
          }}
        />
      ))}
      {ring !== undefined && (
        <span
          class="jugnu-point"
          aria-hidden="true"
          style={{
            left: `${ring.x - 6}px`,
            top: `${ring.y - 6}px`,
            width: `${ring.width + 12}px`,
            height: `${ring.height + 12}px`,
          }}
        />
      )}
      <div class="piece-drawn" ref={drawn} style={zoom === 1 ? undefined : { zoom }}>
        <BoardClockContext.Provider value={clock}>
          <View
            view={runtime.getView(piece.name)}
            locale={context.locale}
            width={width}
            call={(action, args) =>
              void runtime.call(piece.name, action, args ?? {}, Actor.Learner)
            }
            signal={(name, payload) =>
              runtime.signal(piece.name, name, payload ?? {}, Actor.Learner)
            }
          />
        </BoardClockContext.Provider>
      </div>
    </div>
  );
}

/** Shown under a line whose audio couldn't play: the text is there, and the learner can try again. */
function AudioRetry({ name, context }: { name: string; context: LayoutContext }): JSX.Element {
  return (
    <button type="button" class="audio-retry" onClick={() => context.onRetryAudio(name)}>
      {t(context.locale, "audioUnavailable")}
    </button>
  );
}

/** Renders a layout tree. Layout pieces arrange; prop pieces draw their prop. */
export function Layout({
  piece,
  context,
}: { piece: Piece; context: LayoutContext }): JSX.Element | null {
  if (context.runtime.isHidden(piece.name)) return null;
  const content = renderPiece(piece, context);
  if (content === null || !context.audioFailed.has(piece.name)) return content;
  return (
    <div class="with-audio-retry">
      {content}
      <AudioRetry name={piece.name} context={context} />
    </div>
  );
}

function renderPiece(piece: Piece, context: LayoutContext): JSX.Element | null {
  switch (piece.kind) {
    case PieceKind.Column:
    case PieceKind.Row:
      return (
        <div
          class={piece.kind === PieceKind.Column ? "layout-column" : "layout-row"}
          style={piece.gap === undefined ? undefined : { gap: `${piece.gap}px` }}
        >
          {piece.children.map((child) => (
            <Layout key={child.name} piece={child} context={context} />
          ))}
        </div>
      );
    case PieceKind.Overlay: {
      const [base, ...rest] = piece.children;
      return (
        <div class="layout-overlay">
          {base !== undefined && <Layout piece={base} context={context} />}
          {rest.map((child) => (
            <div key={child.name} class={`pin pin-${piece.pins?.[child.name] ?? Pin.TopRight}`}>
              <Layout piece={child} context={context} />
            </div>
          ))}
        </div>
      );
    }
    case PieceKind.Space:
      return <div class="layout-space" />;
    case PieceKind.Prop:
      return <PropPieceView piece={piece} context={context} />;
  }
}
