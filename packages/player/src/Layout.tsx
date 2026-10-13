import { type Locale, type Piece, PieceKind, Pin, type PropPiece } from "@chalk/content";
import { Actor } from "@chalk/content";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { PropRegistry } from "./prop-module";
import type { BoardRuntime } from "./runtime";
import { t } from "./ui-text";

export type LayoutContext = {
  locale: Locale;
  registry: PropRegistry;
  runtime: BoardRuntime;
  /** Props whose audio couldn't play; they show a small retry mark. */
  audioFailed: ReadonlySet<string>;
  onRetryAudio: (name: string) => void;
  /** What Jugnu is pointing at: a prop, or one named part of it. */
  pointed?: { prop: string; part?: string | undefined } | undefined;
};

function PropPieceView({
  piece,
  context,
}: { piece: PropPiece; context: LayoutContext }): JSX.Element {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(340);
  useEffect(() => {
    const element = box.current;
    if (element === null) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) setWidth(Math.max(200, Math.round(entry.contentRect.width)));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const module = context.registry[piece.prop];
  if (module === undefined) throw new Error(`No prop type "${piece.prop}" in the library`);
  const { View } = module;
  const { runtime } = context;
  const pointed = context.pointed?.prop === piece.name ? context.pointed : undefined;
  // A part is ringed where the prop says it is drawn; without a place, the whole prop glows.
  const ring =
    pointed?.part === undefined
      ? undefined
      : module.def.locate?.({ ...runtime.getView(piece.name) } as never, pointed.part, width);
  const isWholeGlow = pointed !== undefined && ring === undefined;
  return (
    <div
      class={`piece-prop prop-${piece.prop}${isWholeGlow ? " is-pointed" : ""}`}
      ref={box}
      data-piece={piece.name}
    >
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
      <View
        view={runtime.getView(piece.name)}
        locale={context.locale}
        width={width}
        call={(action, args) => void runtime.call(piece.name, action, args ?? {}, Actor.Learner)}
        signal={(name, payload) => runtime.signal(piece.name, name, payload ?? {}, Actor.Learner)}
      />
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
