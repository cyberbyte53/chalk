import type { Locale } from "@chalk/content";
import { SymbolButton } from "@chalk/draw";
import type { PropView } from "@chalk/player";
import { type FramePixels, does, shows } from "@chalk/prop";
import type { JSX } from "preact";
import { type Still, stillPossible } from "./clues";
import { clues } from "./clues";
import { PlaneTap, drawing } from "./layer-view";
import { WORDS, num, pair, word } from "./words";

type CluesView = PropView<typeof clues>;
const actions = clues.actions;

/** The clues given so far, in their words, in the order given. */
const givenWords = (s: CluesView, locale: Locale): string =>
  s.given
    .flatMap((g) => (s.clueChoices[g] === undefined ? [] : [s.clueChoices[g].words[locale]]))
    .join(", ");

/** Where the hidden point could still be: a shaded region, a line, or one point. */
function StillDraw({
  s,
  still,
  px,
}: { s: CluesView; still: Still; px: FramePixels }): JSX.Element | null {
  const w = s.window;
  const unit = s.unit === "" ? "" : `\u00a0${s.unit}`;
  // Each distance given, measured from its line: dashed, with its value.
  const given = s.given.flatMap((g) => {
    const c = s.clueChoices[g];
    return c === undefined ? [] : [c];
  });
  // Each measure runs through the point once the other distance is given; before that, along a
  // whole-number line near the far edge.
  const knownX = given.find((c) => c.x !== undefined)?.x;
  const knownY = given.find((c) => c.y !== undefined)?.y;
  const measured = given.flatMap((c) => {
    const out: JSX.Element[] = [];
    if (c.x !== undefined) {
      const y = knownY ?? Math.round(w.yMin + (w.yMax - w.yMin) * 0.85);
      const [x0, py] = px.toPx(0, y);
      const [x1] = px.toPx(c.x, y);
      out.push(
        <g key={`mx${c.x}`} class="cp-measure">
          <line x1={x0} y1={py} x2={x1} y2={py} />
          <text x={(x0 + x1) / 2} y={py - 6} text-anchor="middle">
            {`${num(c.x)}${unit}`}
          </text>
        </g>,
      );
    }
    if (c.y !== undefined) {
      const x = knownX ?? Math.round(w.xMin + (w.xMax - w.xMin) * 0.85);
      const [px0, y0] = px.toPx(x, 0);
      const [, y1] = px.toPx(x, c.y);
      out.push(
        <g key={`my${c.y}`} class="cp-measure">
          <line x1={px0} y1={y0} x2={px0} y2={y1} />
          <text x={px0 + 6} y={(y0 + y1) / 2} dominant-baseline="central">
            {`${num(c.y)}${unit}`}
          </text>
        </g>,
      );
    }
    return out;
  });
  // Every line a distance alone leaves, the full length of the plane (a whole line of spots).
  const fullLines = given.flatMap((c) => {
    const out: JSX.Element[] = [];
    if (c.x !== undefined) {
      const [a, b] = [px.toPx(c.x, w.yMin), px.toPx(c.x, w.yMax)];
      out.push(
        <line key={`fx${c.x}`} class="cp-still-full" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />,
      );
    }
    if (c.y !== undefined) {
      const [a, b] = [px.toPx(w.xMin, c.y), px.toPx(w.xMax, c.y)];
      out.push(
        <line key={`fy${c.y}`} class="cp-still-full" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />,
      );
    }
    return out;
  });
  // One point left: the two full lines stay, crossing there; nothing else marks it.
  let shape: JSX.Element | null = null;
  if (still.kind === "region") {
    const r = still.region;
    const [x0, y0] = px.toPx(r.xMin, r.yMax);
    const [x1, y1] = px.toPx(r.xMax, r.yMin);
    shape = <rect class="cp-still-region" x={x0} y={y0} width={x1 - x0} height={y1 - y0} />;
  } else if (still.kind === "line") {
    // Bold where the patch given before still allows it.
    const r = still.region;
    const [a, b] =
      still.axis === "x"
        ? [px.toPx(still.value, r.yMin), px.toPx(still.value, r.yMax)]
        : [px.toPx(r.xMin, still.value), px.toPx(r.xMax, still.value)];
    shape = <line class="cp-still-line" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
  }
  return (
    <g class={still.kind === "point" ? "cp-still is-point" : "cp-still"}>
      {fullLines}
      {shape}
      {measured}
    </g>
  );
}

/** The clues layer's drawing: where the point could be, the hidden dot, the clues' buttons. */
export const cluesDrawing = drawing(clues, {
  // A picture of clues already given: they are its caption, in the order given.
  above: ({ s, locale }) =>
    s.canGiveClues || s.given.length === 0 ? null : (
      <p class="cp-line cp-address" {...shows("given", s.given, givenWords(s, locale))}>
        {givenWords(s, locale)}
      </p>
    ),
  back: ({ s, px }) => <StillDraw s={s} still={stillPossible(s, s.given)} px={px} />,
  // The learner hides their own point with a tap on the plane, on a whole-number point.
  on: ({ s, px, call }) =>
    !s.canHide || !s.isPlaneFree ? null : (
      <PlaneTap window={s.window} px={px} step={1} action={actions.hideAt} call={call} />
    ),
  front: ({ s, px }) => {
    const hidden = s.hidden;
    if (hidden === null || !s.isHiddenShown) return null;
    const [cx, cy] = px.toPx(hidden.x, hidden.y);
    return (
      <circle class="cp-hidden" {...shows("hidden", hidden, pair(hidden))} cx={cx} cy={cy} r={7} />
    );
  },
  controls: ({ s, locale }) => {
    if (!s.canGiveClues) return null;
    const nextClue = s.clueChoices.findIndex((_, i) => !s.given.includes(i));
    return (
      <>
        {s.clueChoices.map((c, i) =>
          // One clue at a time, in the lesson's order: those given, and the next.
          !s.given.includes(i) && i !== nextClue ? null : (
            <SymbolButton
              key={i}
              symbol={word(c.words, locale)}
              label={word(c.words, locale)}
              isWide
              isOn={s.given.includes(i)}
              {...does(actions.giveClue, { clue: i }, i)}
            />
          ),
        )}
        {/* Where it is, only once every clue is given: before that it would give the answer away. */}
        {s.hidden !== null && !s.isHiddenShown && nextClue === -1 && (
          <SymbolButton
            symbol={word(WORDS.showPoint, locale)}
            label={word(WORDS.showPoint, locale)}
            isWide
            {...does(actions.showHidden)}
          />
        )}
      </>
    );
  },
});
