import { type PropViewProps, RichText } from "@chalk/player";
import { Coordinates, Line, Mafs, MovablePoint, Plot, Point, Text } from "mafs";
import type { JSX } from "preact";
import {
  clean,
  degreeOf,
  factoredTex,
  niceNumber,
  polyTex,
  realZeroes,
  valueAt,
  zeroesWithRepeats,
} from "./poly";
import { Stepper, SymbolButton } from "./ui";
import {
  PlaneForm,
  ZeroPlaneAction,
  type ZeroPlaneState,
  planeBox,
  productOf,
  sumOf,
} from "./zero-plane";

/** Colours are look tokens, set on the plane in styles.css and read here as CSS variables. */
const INK = "var(--color-primary)";
const ZERO = "var(--color-secondary)";
const MARK = "var(--color-on-surface-variant)";

/**
 * The plane, drawn by Mafs from the prop's state: Mafs keeps no state of its own here. Every drag
 * calls an action, and the prop moves the point (snapped), so what is drawn is always the state.
 */
export function ZeroPlaneView({ view, width, call }: PropViewProps): JSX.Element {
  const s = view as unknown as ZeroPlaneState & { coefficients: number[] };
  const p = s.coefficients;
  const v = s.variable;
  const n = degreeOf(p);
  const box = planeBox(s, width);
  const { xMin, xMax, yMin, yMax } = s.window;
  const f = (x: number) => valueAt(p, x);
  const zeroes = realZeroes(p);
  const isHeldByZeroes = s.form === PlaneForm.Zeroes;
  const canDrag = s.isDraggable;
  const snap = (x: number) => Math.round(x / s.snap) * s.snap || 0;
  const label = (x: number) => niceNumber(x).text;
  const h = n === 2 ? clean(-(p[1] ?? 0) / (2 * (p[0] ?? 1))) : null;
  const allReal = zeroesWithRepeats(p);
  // Axis numbers: none at the very edges (they'd be cut in half), none where a zero is already
  // labelled, and every other one when the plane is long (a y-range of 50 would crowd).
  const xStep = xMax - xMin > 12 ? 2 : 1;
  const yStep = yMax - yMin > 40 ? 10 : yMax - yMin > 16 ? 2 : 1;
  const isLabelledX = (x: number) =>
    x !== 0 && x > xMin && x < xMax && !zeroes.some((zero) => Math.abs(zero.x - x) < 0.3);
  const isLabelledY = (y: number) => y !== 0 && y > yMin && y < yMax;
  return (
    <div class="pp-plane">
      <div class="pp-mafs" style={{ height: `${box.height}px` }}>
        <Mafs
          width={box.width}
          height={box.height}
          viewBox={{ x: [xMin, xMax], y: [yMin, yMax], padding: 0 }}
          preserveAspectRatio={false}
          pan={false}
          zoom={false}
        >
          <Coordinates.Cartesian
            xAxis={{ lines: xStep, labels: (x) => (isLabelledX(x) ? String(x) : "") }}
            yAxis={{ lines: yStep, labels: (y) => (isLabelledY(y) ? String(y) : "") }}
          />
          {s.isSymmetryShown && h !== null && (
            <Line.ThroughPoints point1={[h, yMin]} point2={[h, yMax]} style="dashed" color={MARK} />
          )}
          <Plot.OfX y={f} color={INK} weight={3} />
          {s.isInterceptShown && (
            <>
              <Point x={0} y={f(0)} color={MARK} />
              <Text x={0} y={f(0)} attach="e" size={14}>
                {label(f(0))}
              </Text>
            </>
          )}
          {isHeldByZeroes
            ? s.zeroes.map((x, i) =>
                canDrag ? (
                  <MovablePoint
                    // biome-ignore lint/suspicious/noArrayIndexKey: a zero's handle is its place in the list
                    key={i}
                    point={[x, 0]}
                    color={ZERO}
                    constrain={([to]) => [snap(to), 0]}
                    onMove={([to]) => call(ZeroPlaneAction.MoveZero, { index: i, to })}
                  />
                ) : (
                  // biome-ignore lint/suspicious/noArrayIndexKey: a zero's handle is its place in the list
                  <Point key={i} x={x} y={0} color={ZERO} />
                ),
              )
            : zeroes.map((zero) => <Point key={zero.x} x={zero.x} y={0} color={ZERO} />)}
          {zeroes.map((zero) => (
            <Text key={`l${zero.x}`} x={zero.x} y={0} attach="n" attachDistance={18} size={14}>
              {label(zero.x)}
            </Text>
          ))}
          {s.form === PlaneForm.Vertex && canDrag && (
            <MovablePoint
              point={s.vertex}
              color={INK}
              constrain={([x, y]) => [snap(x), snap(y)]}
              onMove={([x, y]) => call(ZeroPlaneAction.MoveVertex, { x, y })}
            />
          )}
          {s.canLift && (
            <MovablePoint
              point={[0, f(0)]}
              color={INK}
              constrain={([, y]) => [0, snap(y)]}
              onMove={([, y]) => call(ZeroPlaneAction.Lift, { to: snap(y) - (f(0) - s.lift) })}
            />
          )}
          {s.probe !== null && (
            <>
              <Line.Segment
                point1={[s.probe, 0]}
                point2={[s.probe, f(s.probe)]}
                style="dashed"
                color={MARK}
              />
              <MovablePoint
                point={[s.probe, f(s.probe)]}
                color={MARK}
                constrain={([x]) => [snap(x), f(snap(x))]}
                onMove={([x]) => call(ZeroPlaneAction.MoveProbe, { x })}
              />
            </>
          )}
        </Mafs>
      </div>
      <div class="pp-readout">
        {s.probe !== null && (
          <p class="pp-probe" data-part="probe-reading">
            <RichText text={`$p(${niceNumber(s.probe).tex}) = ${niceNumber(f(s.probe)).tex}$`} />
          </p>
        )}
        {s.isEquationShown && (
          <p class="pp-equation" data-part="equation">
            <RichText text={`$y = ${polyTex(p, v)}$`} />
          </p>
        )}
        {s.isFactoredShown && allReal.length === n && (
          <p class="pp-equation" data-part="factored">
            <RichText text={`$y = ${factoredTex(p[0] ?? 1, allReal, v)}$`} />
          </p>
        )}
        {s.isSumProductShown && n === 2 && (
          <p class="pp-equation pp-sum-product">
            <span data-part="sum">
              <RichText text={`$\\alpha + \\beta = ${niceNumber(sumOf(p) ?? 0).tex}$`} />
            </span>
            <span data-part="product">
              <RichText text={`$\\alpha\\beta = ${niceNumber(productOf(p) ?? 0).tex}$`} />
            </span>
          </p>
        )}
        {s.canFlip && (
          <SymbolButton
            symbol="↕"
            label="Turn the curve upside down"
            part="flip"
            onPress={() => call(ZeroPlaneAction.Flip, {})}
          />
        )}
        {s.canSetLeading && (
          <Stepper
            name={s.leadingName}
            value={p[0] ?? 1}
            step={1}
            min={-3}
            max={3}
            skip={0}
            part="leading"
            onChange={(leading) => call(ZeroPlaneAction.SetLeading, { leading })}
          />
        )}
      </div>
    </div>
  );
}
