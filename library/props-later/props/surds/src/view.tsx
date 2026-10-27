import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Layout, type Line, type Token, emWidth, layoutOf } from "./layout";
import { SurdTilesPart, type SurdTilesState } from "./model";
import { type Term, addLikeTerms, termText } from "./surd";

type SurdTilesView = SurdTilesState & {
  leftText: string;
  rightText: string;
  resultText: string;
  cancelledTiles: string[];
};

/** 0 → 1 as `x` goes from `a` to `b`. */
function phase(x: number, a: number, b: number): number {
  return Math.min(1, Math.max(0, (x - a) / (b - a)));
}

function smooth(x: number): number {
  return x * x * (3 - 2 * x);
}

/** Display type that fits a tile. */
function fitSize(text: string, width: number, height: number): number {
  const byWidth = (width - 14) / emWidth(text);
  return Math.max(12, Math.min(26, byWidth, height * 0.42));
}

/** Tint class for a tile: rational tiles on the panel, each surd its own light tint. */
function tintOf(radicand: number, surds: readonly number[]): string {
  if (radicand === 1) return "is-rational";
  return `is-tint-${surds.indexOf(radicand) % 4}`;
}

function headerText(s: SurdTilesView): { left: string; right: string } {
  const isSame = JSON.stringify(s.left) === JSON.stringify(s.right);
  if (isSame && s.left.length === 2) return { left: s.leftText, right: "²" };
  const isJuxtaposed = s.left.length === 2 && s.right.length === 2;
  return { left: s.leftText, right: isJuxtaposed ? s.rightText : ` × ${s.rightText}` };
}

/** Enter or Space on a focusable SVG group does what a tap does. */
function onKeys(action: () => void) {
  return (event: JSX.TargetedKeyboardEvent<SVGGElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    action();
  };
}

function lineTokens(
  line: Line,
  className: string,
  struck: ReadonlySet<string>,
  strike: number,
): JSX.Element {
  // A cancelled term is struck through with the sign in front of it.
  const strikes = line.tokens.flatMap((token, i) => {
    if (token.key === undefined || !struck.has(token.key) || strike === 0) return [];
    const before: Token | undefined = line.tokens[i - 1];
    const from = before?.isSign === true && before.text !== "=" ? before : token;
    const x1 = from.x - from.width / 2 - 2;
    const x2 = token.x + token.width / 2 + 2;
    return [
      <line
        key={`strike-${token.key}`}
        class="st-strike"
        x1={x1}
        x2={x1 + (x2 - x1) * strike}
        y1={line.y - line.size * 0.32}
        y2={line.y - line.size * 0.32}
      />,
    ];
  });
  return (
    <g class={className}>
      {line.tokens.map((token, i) => (
        <text
          // A token is its place on the line.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above
          key={i}
          x={token.x}
          y={line.y}
          text-anchor="middle"
          font-size={line.size}
          class={token.isSign ? "is-sign" : undefined}
        >
          {token.text}
        </text>
      ))}
      {strikes}
    </g>
  );
}

/**
 * The area model: the side factor's terms label the rows, the top factor's the columns, one tile per
 * pair. Under it the tiles written out as a sum, then the result. Tapping a top term flips its sign
 * (when allowed); `=` combines; the result separates again. It owns no state.
 */
export function SurdTilesView({ view, width, call }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as SurdTilesView;
  const hatch = `st-hatch-${useId()}`;
  const layout: Layout = layoutOf(s.left, s.right, width);
  const c = s.combine;
  const outline = smooth(phase(c, 0, 0.3));
  const fade = smooth(phase(c, 0.3, 0.6));
  const gather = smooth(phase(c, 0.45, 0.85));
  const reveal = smooth(phase(c, 0.8, 1));
  const cancelled = new Set(s.cancelledTiles);
  const surds = [...new Set(layout.tiles.map((t) => t.radicand))]
    .filter((r) => r !== 1)
    .sort((a, b) => a - b);
  const terms: Term[] = addLikeTerms(layout.tiles);
  const gridLeft = layout.columns[0]?.x ?? 0;
  const lastColumn = layout.columns.at(-1);
  const gridRight = lastColumn === undefined ? width : lastColumn.x + lastColumn.width;
  const gridTop = layout.rows[0]?.y ?? 0;
  const lastRow = layout.rows.at(-1);
  const gridBottom = lastRow === undefined ? 0 : lastRow.y + lastRow.height;
  const header = headerText(s);
  const headerSize = Math.min(
    layout.headerSize,
    (width - 8) / emWidth(`${header.left}${header.right}`),
  );
  const isIdle = c === 0;
  const combine = () => {
    if (isIdle) call("combine");
  };
  const separate = () => {
    if (c === 1) call("separate");
  };

  return (
    <div class="st">
      <svg
        class="st-svg"
        viewBox={`0 0 ${width} ${layout.height}`}
        width="100%"
        role="img"
        aria-label={`${s.leftText}${s.rightText} = ${c === 1 ? s.resultText : "?"}`}
      >
        <defs>
          <pattern
            id={hatch}
            patternUnits="userSpaceOnUse"
            width={7}
            height={7}
            patternTransform="rotate(45)"
          >
            <line class="st-hatch-line" x1={0} y1={0} x2={0} y2={7} />
          </pattern>
        </defs>

        <text class="st-header" x={width / 2} y={layout.headerY} font-size={headerSize}>
          <tspan>{header.left}</tspan>
          <tspan class={s.canChangeRight ? "is-changeable" : undefined}>{header.right}</tspan>
        </text>

        {/* Side lengths: the top factor's terms over the columns, the side factor's by the rows. */}
        {layout.columns.map((col, i) => {
          const t = s.right[i];
          const box = layout.rightLabels[i];
          if (t === undefined || box === undefined) return null;
          const label = termText(t);
          const cx = col.x + col.width / 2;
          const flip = () => call("flipSign", { term: i });
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: a side term is its place in the factor
            <g key={`right-${i}`} data-part={`${SurdTilesPart.RightTermPrefix}${i}`}>
              <line
                class="st-side"
                x1={col.x + 5}
                x2={col.x + col.width - 5}
                y1={gridTop - 7}
                y2={gridTop - 7}
              />
              <line
                class="st-side-end"
                x1={col.x + 5}
                x2={col.x + 5}
                y1={gridTop - 11}
                y2={gridTop - 3}
              />
              <line
                class="st-side-end"
                x1={col.x + col.width - 5}
                x2={col.x + col.width - 5}
                y1={gridTop - 11}
                y2={gridTop - 3}
              />
              {s.canChangeRight ? (
                <g
                  class="st-flip"
                  // biome-ignore lint/a11y/useSemanticElements: a <button> can't live inside SVG; this group is one
                  role="button"
                  tabIndex={0}
                  aria-label={`${label}: ±`}
                  onClick={flip}
                  onKeyDown={onKeys(flip)}
                >
                  <rect class="st-hit" x={col.x} y={box.y - 6} width={col.width} height={44} />
                  <rect
                    class="st-flip-pill"
                    x={cx - Math.max(30, (emWidth(label) * 20) / 2 + 14)}
                    y={box.y - 1}
                    width={Math.max(60, emWidth(label) * 20 + 28)}
                    height={32}
                    rx={16}
                  />
                  <text class="st-label is-changeable" x={cx} y={box.y + 21}>
                    {label}
                  </text>
                </g>
              ) : (
                <text class="st-label" x={cx} y={box.y + 21}>
                  {label}
                </text>
              )}
            </g>
          );
        })}
        {layout.rows.map((row, i) => {
          const t = s.left[i];
          const box = layout.leftLabels[i];
          if (t === undefined || box === undefined) return null;
          const x = box.x + box.width;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: a side term is its place in the factor
            <g key={`left-${i}`} data-part={`${SurdTilesPart.LeftTermPrefix}${i}`}>
              <line class="st-side" x1={x} x2={x} y1={row.y + 5} y2={row.y + row.height - 5} />
              <line class="st-side-end" x1={x - 4} x2={x + 4} y1={row.y + 5} y2={row.y + 5} />
              <line
                class="st-side-end"
                x1={x - 4}
                x2={x + 4}
                y1={row.y + row.height - 5}
                y2={row.y + row.height - 5}
              />
              <text class="st-label is-left" x={x - 9} y={row.y + row.height / 2 + 7}>
                {termText(t)}
              </text>
            </g>
          );
        })}

        {/* The tiles. */}
        {layout.tiles.map((tile) => {
          const { box } = tile;
          const text = termText(tile);
          const size = fitSize(text, box.width, box.height);
          const isCancelled = cancelled.has(tile.key);
          const tint = tintOf(tile.radicand, surds);
          return (
            <g key={tile.key} data-part={`${SurdTilesPart.TilePrefix}${tile.key}`}>
              {isCancelled && fade > 0 && (
                <rect
                  class="st-gone"
                  x={box.x + 1}
                  y={box.y + 1}
                  width={box.width - 2}
                  height={box.height - 2}
                  rx={7}
                  opacity={fade}
                />
              )}
              <g opacity={isCancelled ? 1 - fade : 1}>
                <rect
                  class={`st-tile ${tint}`}
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  rx={8}
                />
                {tile.coefficient < 0 && (
                  <rect
                    class="st-negative"
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    rx={8}
                    fill={`url(#${hatch})`}
                  />
                )}
                {isCancelled && outline > 0 && (
                  <rect
                    class="st-cancel"
                    x={box.x + 1.5}
                    y={box.y + 1.5}
                    width={box.width - 3}
                    height={box.height - 3}
                    rx={7}
                    opacity={outline}
                  />
                )}
                <text
                  class={`st-tile-text${tile.coefficient < 0 ? " is-negative" : ""}`}
                  x={box.x + box.width / 2}
                  y={box.y + box.height / 2 + size * 0.36}
                  font-size={size}
                  opacity={isCancelled || gather === 0 ? 1 : 0.35 * reveal}
                >
                  {text}
                </text>
              </g>
            </g>
          );
        })}
        <rect
          class="st-frame"
          x={gridLeft}
          y={gridTop}
          width={gridRight - gridLeft}
          height={gridBottom - gridTop}
          rx={9}
        />

        {/* Every tile written out, then the cancelled ones struck through. */}
        <g data-part={SurdTilesPart.Result}>
          {lineTokens(layout.expanded, "st-expanded", cancelled, outline)}

          {/* Like terms gather: each kept tile's term travels to its place in the result. */}
          {gather > 0 &&
            reveal < 1 &&
            layout.tiles
              .filter((tile) => !cancelled.has(tile.key))
              .map((tile) => {
                const index = terms.findIndex((t) => t.radicand === tile.radicand);
                const target = layout.result.tokens.find((t) => t.term === index);
                if (target === undefined) return null;
                const text = termText(tile);
                const from = {
                  x: tile.box.x + tile.box.width / 2,
                  y: tile.box.y + tile.box.height / 2,
                  size: fitSize(text, tile.box.width, tile.box.height),
                };
                const to = {
                  x: target.x,
                  y: layout.result.y - layout.result.size * 0.36,
                  size: layout.result.size * 0.8,
                };
                const x = from.x + (to.x - from.x) * gather;
                const y = from.y + (to.y - from.y) * gather;
                const size = from.size + (to.size - from.size) * gather;
                const chipWidth = emWidth(text) * size + 14;
                return (
                  <g key={`ghost-${tile.key}`} class="st-ghost" opacity={1 - reveal}>
                    <rect
                      class={`st-chip ${tintOf(tile.radicand, surds)}`}
                      x={x - chipWidth / 2}
                      y={y - size * 0.75}
                      width={chipWidth}
                      height={size * 1.5}
                      rx={size * 0.5}
                    />
                    <text class="st-tile-text" x={x} y={y + size * 0.36} font-size={size}>
                      {text}
                    </text>
                  </g>
                );
              })}

          {reveal > 0 && (
            <g
              class="st-result"
              opacity={reveal}
              transform={`translate(0 ${(1 - reveal) * 6})`}
              // biome-ignore lint/a11y/useSemanticElements: a <button> can't live inside SVG; this group is one
              role="button"
              tabIndex={c === 1 ? 0 : -1}
              aria-label={`= ${s.resultText}`}
              onClick={separate}
              onKeyDown={onKeys(separate)}
            >
              <rect
                class="st-hit"
                x={layout.result.box.x}
                y={layout.result.box.y - 6}
                width={layout.result.box.width}
                height={Math.max(44, layout.result.box.height + 6)}
              />
              {lineTokens(layout.result, "st-result-line", new Set(), 0)}
            </g>
          )}
          {gather < 1 && (
            <g
              class={`st-equals${isIdle ? "" : " is-busy"}`}
              opacity={1 - gather}
              // biome-ignore lint/a11y/useSemanticElements: a <button> can't live inside SVG; this group is one
              role="button"
              tabIndex={isIdle ? 0 : -1}
              aria-label="="
              onClick={combine}
              onKeyDown={onKeys(combine)}
            >
              <circle cx={layout.button.x} cy={layout.button.y} r={layout.button.r} />
              <text x={layout.button.x} y={layout.button.y + 9}>
                =
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
