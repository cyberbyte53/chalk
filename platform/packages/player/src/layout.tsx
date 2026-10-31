/** @jsxImportSource preact */
import { type Locale, type Piece, PieceKind, Pin, type PropPiece } from "@chalk/content";
import { Actor } from "@chalk/content";
import {
  type Box,
  PHONE_COLUMN,
  joinPath,
  layoutWidthFor,
  nameOf,
  segment,
  sizeOf,
  zoomFor,
} from "@chalk/prop";
import type { JSX } from "preact";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { type BoardClock, BoardClockContext } from "./board-clock";
import { heard, pressHandler } from "./does";
import { type Door, DoorContext } from "./door";
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

export type LayoutContext = {
  locale: Locale;
  registry: PropRegistry;
  runtime: BoardRuntime;
  /** Props whose audio couldn't play; they show a small retry mark. */
  audioFailed: ReadonlyMap<string, unknown>;
  onRetryAudio: (name: string) => void;
  /** What Jugnu is pointing at: a prop, or one named part of it. */
  pointed?: { prop: string; part?: string | undefined } | undefined;
  /** What the student held to ask Jugnu about: they glow until asked. */
  picked?: readonly { prop: string; part?: string | undefined }[];
  /** Drawn as a picture of the board as it stands (a tool's): nothing passing shows on it. */
  isPicture?: boolean;
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
  // The column and the screen decide the layout width and the zoom (size.ts). The prop lays out at
  // a width the column alone sets; its height is then measured once and the zoom chosen to fit it.
  // Nothing inside the prop re-decides the zoom, so a prop whose height follows its width can't
  // feed back on itself, and a row of controls appearing doesn't rescale the picture.
  const [screen, setScreen] = useState({ column: PHONE_COLUMN, height: 0 });
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const element = box.current;
    if (element === null) return;
    const measure = () =>
      setScreen((was) => {
        const column = Math.round(element.getBoundingClientRect().width);
        const height = window.innerHeight;
        return was.column === column && was.height === height ? was : { column, height };
      });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    const stopStamping = stampPaths(element);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      stopStamping();
    };
  }, []);
  const width = layoutWidthFor(rule.current, screen.column);
  // Once the prop has laid out at `width`: its height at 1×, and the zoom that fits it.
  useLayoutEffect(() => {
    const inner = drawn.current;
    if (inner === null || screen.height === 0) return;
    const current = Number(inner.style.zoom) || 1;
    const natural = inner.getBoundingClientRect().height / current;
    setZoom(Number(zoomFor(rule.current, screen.column, screen.height, natural).toFixed(3)));
  }, [screen.column, screen.height]);
  const { View } = module;
  const { runtime } = context;
  const clock = useMemo<BoardClock>(
    () => ({ time: () => runtime.time(), frame: (callback) => runtime.onFrame(callback) }),
    [runtime],
  );
  // Every learner action on this piece, by path ("giveRound", or "dial.move" in a group).
  const door = useMemo<Door>(
    () => ({
      call: (path, args) =>
        heard(piece.name, path, () =>
          runtime.call(piece.name, path, { ...(args ?? {}) }, Actor.Learner),
        ),
      signal: (path) => runtime.signal(piece.name, path),
    }),
    [runtime, piece.name],
  );
  const pointed = context.pointed?.prop === piece.name ? context.pointed : undefined;
  // The line being said is about this piece: it glows, as a teacher points at what they say.
  // A line about a part inside a piece glows the piece: a piece is what the board draws as one.
  const about = context.isPicture === true ? undefined : runtime.speakingAbout();
  const isSpoken = about !== undefined && about.split(".")[0] === piece.name;
  // A part is ringed where the view tagged it (`data-part`); without that, the whole prop glows.
  const ringOf = (part: string | undefined): Box | undefined =>
    part === undefined ? undefined : tagged(box.current, part);
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
      class={`piece-prop prop-${piece.prop}${isWholeGlow ? " is-pointed" : ""}${isSpoken ? " is-spoken" : ""}${isWholePicked ? " is-picked" : ""}${piece.still !== undefined ? " is-still" : ""}`}
      ref={box}
      data-piece={piece.name}
      // A prop drawn still is a picture: nothing in it can be tapped, dragged or focused.
      {...(piece.still === undefined
        ? {}
        : { inert: true, role: "img", "aria-label": piece.still[context.locale] })}
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
      <div
        class="piece-drawn"
        ref={drawn}
        style={{ ...(zoom === 1 ? {} : { zoom }), width: `${width}px`, marginInline: "auto" }}
        onClick={pressHandler(door.call)}
        onKeyDown={pressHandler(door.call)}
      >
        <BoardClockContext.Provider value={clock}>
          <DoorContext.Provider value={door}>
            <View
              view={runtime.getView(piece.name)}
              locale={context.locale}
              width={width}
              call={(action, ...args) =>
                door.call(nameOf(action), args[0] as Readonly<Record<string, unknown>> | undefined)
              }
              signal={(signal, payload) => door.signal(nameOf(signal), payload)}
            />
          </DoorContext.Provider>
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
