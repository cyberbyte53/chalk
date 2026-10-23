import { type PropViewProps, RichText } from "@chalk/player";
import { Coordinates, Line, Mafs, MovablePoint, Point, Polygon, Text } from "mafs";
import type { JSX } from "preact";
import {
  type Line as Eq,
  type Point as P,
  Relation,
  equationOf,
  frac,
  fracTex,
  fracText,
  isOnLine,
  niceText,
  ratiosOf,
  relationOf,
  solutionOf,
  triangleWith,
  xAt,
  yAt,
} from "./algebra";
import {
  Coefficient,
  LinePairAction,
  LinePairPart,
  type LinePairState,
  handlesFor,
  planeBox,
} from "./line-pair";
import { Stepper } from "./ui";
import { WORDS, fill, say } from "./words";

/** Line 1 and line 2 keep these colours everywhere: on the plane, in the equations and tables. */
const INK = ["var(--color-primary)", "var(--color-secondary)"] as const;
const MARK = "var(--color-on-surface-variant)";
const MEET = "var(--color-right)";
/** Keys for line 1 and line 2 (a line's place in the pair is what it is). */
const LINE_KEY = ["first", "second"] as const;

/**
 * Where a line's "(n)" sits: just inside the plane, near one end. Line 1 takes the first end
 * found and line 2 the last, so two lines on top of each other still get both labels.
 */
function labelSpot(line: Eq, s: LinePairState, i: number): P | null {
  const { xMin, xMax, yMin, yMax } = s.window;
  const inset = (xMax - xMin) * 0.06;
  const candidates: P[] = [];
  for (const x of [xMax - inset, xMin + inset]) {
    const y = yAt(line, x)?.valueOf();
    if (y !== undefined && y > yMin + inset && y < yMax - inset) candidates.push([x, y]);
  }
  for (const y of [yMax - inset, yMin + inset]) {
    const x = xAt(line, y)?.valueOf();
    if (x !== undefined && x > xMin + inset && x < xMax - inset) candidates.push([x, y]);
  }
  return (i === 0 ? candidates[0] : candidates.at(-1)) ?? null;
}

/** a/b with both numbers shown, then simplified when that differs: \frac{2}{4} = \frac{1}{2}. */
function ratioTex(top: number, bottom: number, name: string): string {
  if (bottom === 0) return `\\frac{${name}_1}{${name}_2}:\\ ${name}_2 = 0`;
  const raw = `\\frac{${fracTex(top)}}{${fracTex(bottom)}}`;
  const value = fracTex(frac(top).div(bottom));
  return `\\frac{${name}_1}{${name}_2} = ${raw}${raw === value ? "" : ` = ${value}`}`;
}

export function LinePairView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LinePairState;
  const box = planeBox(s, width);
  const { xMin, xMax, yMin, yMax } = s.window;
  const [l1, l2] = s.lines;
  const relation = l1 !== undefined && l2 !== undefined ? relationOf(l1, l2) : null;
  const meet = l1 !== undefined && l2 !== undefined ? solutionOf(l1, l2) : null;
  const span = Math.max(xMax - xMin, yMax - yMin);
  const step = span > 24 ? 5 : span > 12 ? 2 : 1;
  const isLabelled = (v: number, lo: number, hi: number) => v !== 0 && v > lo && v < hi;
  const triangle =
    s.shade !== null && l1 !== undefined && l2 !== undefined ? triangleWith(l1, l2, s.shade) : null;
  const tex = (line: Eq) => equationOf(line, s.variables, s.form, true);

  return (
    <div class="le-pair">
      <div class="le-mafs" style={{ height: `${box.height}px` }} data-part={LinePairPart.Plane}>
        <Mafs
          width={box.width}
          height={box.height}
          viewBox={{ x: [xMin, xMax], y: [yMin, yMax], padding: 0 }}
          preserveAspectRatio={false}
          pan={false}
          zoom={false}
        >
          <Coordinates.Cartesian
            xAxis={{ lines: step, labels: (x) => (isLabelled(x, xMin, xMax) ? String(x) : "") }}
            yAxis={{ lines: step, labels: (y) => (isLabelled(y, yMin, yMax) ? String(y) : "") }}
          />
          {triangle !== null && (
            <Polygon
              points={triangle.map(([x, y]) => [x.valueOf(), y.valueOf()] as [number, number])}
              color={MEET}
              fillOpacity={0.18}
              weight={0}
            />
          )}
          {s.lines.map((line, i) => {
            const [p, q] = handlesFor(s, i);
            return (
              <Line.ThroughPoints
                // biome-ignore lint/suspicious/noArrayIndexKey: a line's place is its identity
                key={`line${i}`}
                point1={[p[0], p[1]]}
                point2={[q[0], q[1]]}
                color={INK[i]}
                weight={relation === Relation.Coincident && i === 1 ? 2.5 : 3.5}
                style={relation === Relation.Coincident && i === 1 ? "dashed" : "solid"}
              />
            );
          })}
          {s.lines.map((line, i) => {
            const spot = labelSpot(line, s, i);
            if (spot === null || s.lines.length < 2) return null;
            return (
              <Text
                key={LINE_KEY[i]}
                x={spot[0]}
                y={spot[1]}
                attach={i === 0 ? "n" : "s"}
                size={15}
                color={INK[i]}
              >
                {`(${i + 1})`}
              </Text>
            );
          })}
          {(s.showTables || s.canDrag) &&
            s.lines.flatMap((_, i) =>
              handlesFor(s, i).map((p, h) =>
                s.canDrag ? (
                  <MovablePoint
                    key={`${LINE_KEY[i]}-${h === 0 ? "start" : "end"}`}
                    point={[p[0], p[1]]}
                    color={INK[i]}
                    constrain={([x, y]) => [
                      Math.round(x / s.snap) * s.snap,
                      Math.round(y / s.snap) * s.snap,
                    ]}
                    onMove={([x, y]) =>
                      call(LinePairAction.MoveHandle, { line: i, handle: h, x, y })
                    }
                  />
                ) : (
                  <Point
                    key={`${LINE_KEY[i]}-${h === 0 ? "start" : "end"}`}
                    x={p[0]}
                    y={p[1]}
                    color={INK[i]}
                  />
                ),
              ),
            )}
          {s.showSolution && meet !== null && (
            <>
              <Point x={meet[0].valueOf()} y={meet[1].valueOf()} color={MEET} />
              <Text
                x={meet[0].valueOf()}
                y={meet[1].valueOf()}
                attach="e"
                attachDistance={14}
                size={15}
                color={MEET}
              >
                {`(${fracText(meet[0])}, ${fracText(meet[1])})`}
              </Text>
            </>
          )}
          {s.probe !== null &&
            (s.canMoveProbe ? (
              <MovablePoint
                point={[s.probe[0], s.probe[1]]}
                color={MARK}
                constrain={([x, y]) => [
                  Math.round(x / s.snap) * s.snap,
                  Math.round(y / s.snap) * s.snap,
                ]}
                onMove={([x, y]) => call(LinePairAction.MoveProbe, { x, y })}
              />
            ) : (
              <Point x={s.probe[0]} y={s.probe[1]} color={MARK} />
            ))}
        </Mafs>
      </div>

      {s.showEquations && (
        <div class="le-equations" data-part={LinePairPart.Equations}>
          {s.lines.map((line, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: a line's place is its identity
            <p key={i} class={`le-equation is-line-${i}`}>
              <span class="le-chip" />
              <RichText text={`$${tex(line)}$`} />
              {s.lines.length === 2 && <span class="le-number">({i + 1})</span>}
            </p>
          ))}
        </div>
      )}

      {s.showSolution && relation !== null && relation !== Relation.Intersecting && (
        <p class="le-verdict-line">
          {say(locale, relation === Relation.Parallel ? WORDS.neverMeet : WORDS.everyPoint)}
        </p>
      )}

      {s.probe !== null && (
        <div class="le-probe" data-part={LinePairPart.Probe}>
          <span class="le-probe-at">
            {say(locale, WORDS.probe)} ({niceText(s.probe[0])}, {niceText(s.probe[1])})
          </span>
          {s.lines.map((line, i) => {
            const probe = s.probe as P;
            const on = isOnLine(line, probe[0], probe[1]);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: a line's place is its identity
              <span key={i} class={on ? "le-tag is-on" : "le-tag"}>
                {on ? "✓ " : "✗ "}
                {say(locale, fill(on ? WORDS.onLine : WORDS.notOnLine, { n: String(i + 1) }))}
              </span>
            );
          })}
        </div>
      )}

      {s.showTables && (
        <div class="le-tables" data-part={LinePairPart.Tables}>
          {s.lines.map((_, i) => {
            const [p, q] = handlesFor(s, i);
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: a line's place is its identity
              <table key={i} class={`le-table is-line-${i}`}>
                <caption>{say(locale, fill(WORDS.table, { n: String(i + 1) }))}</caption>
                <tbody>
                  <tr>
                    <th>{s.variables[0]}</th>
                    <td>{niceText(p[0])}</td>
                    <td>{niceText(q[0])}</td>
                  </tr>
                  <tr>
                    <th>{s.variables[1]}</th>
                    <td>{niceText(p[1])}</td>
                    <td>{niceText(q[1])}</td>
                  </tr>
                </tbody>
              </table>
            );
          })}
        </div>
      )}

      {s.showRatios && l1 !== undefined && l2 !== undefined && relation !== null && (
        <div class="le-ratios" data-part={LinePairPart.Ratios}>
          <p class="le-ratios-title">{say(locale, WORDS.ratios)}</p>
          <p>
            <RichText text={`$${ratioTex(l1.a, l2.a, "a")}$`} />
          </p>
          <p>
            <RichText text={`$${ratioTex(l1.b, l2.b, "b")}$`} />
          </p>
          <p>
            <RichText text={`$${ratioTex(l1.c, l2.c, "c")}$`} />
          </p>
          <p class="le-compare">
            <RichText text={`$${compareTex(l1, l2, relation)}$`} />
          </p>
          <p class={`le-verdict is-${relation}`}>{verdictWords(locale, relation)}</p>
        </div>
      )}

      {s.editLine !== null && s.lines[s.editLine] !== undefined && (
        <div class="le-steppers" data-part={LinePairPart.Steppers}>
          {([Coefficient.A, Coefficient.B, Coefficient.C] as const).map((k) => {
            const line = s.lines[s.editLine as 0 | 1] as Eq;
            const n = (s.editLine as number) + 1;
            return (
              <Stepper
                key={k}
                name={`${k}${n === 1 ? "₁" : "₂"}`}
                value={line[k]}
                shown={niceText(line[k])}
                min={-20}
                max={20}
                more={`${say(locale, WORDS.more)} ${k}${n}`}
                less={`${say(locale, WORDS.less)} ${k}${n}`}
                onChange={(value) =>
                  call(LinePairAction.SetCoefficient, { line: s.editLine, coefficient: k, value })
                }
              />
            );
          })}
        </div>
      )}
      {s.canDrag && <p class="le-hint">{say(locale, WORDS.dragHint)}</p>}
    </div>
  );
}

function compareTex(l1: Eq, l2: Eq, relation: Relation): string {
  const r = ratiosOf(l1, l2);
  const ab = "\\frac{a_1}{a_2}";
  const bb = "\\frac{b_1}{b_2}";
  const cb = "\\frac{c_1}{c_2}";
  if (relation === Relation.Intersecting) return `${ab} \\ne ${bb}`;
  if (relation === Relation.Coincident) return `${ab} = ${bb} = ${cb}`;
  return r.c === null ? `${ab} = ${bb},\\ c_2 = 0` : `${ab} = ${bb} \\ne ${cb}`;
}

function verdictWords(locale: string, relation: Relation): string {
  const [kind, count, consistency] =
    relation === Relation.Intersecting
      ? [WORDS.intersecting, WORDS.unique, WORDS.consistent]
      : relation === Relation.Parallel
        ? [WORDS.parallel, WORDS.none, WORDS.inconsistent]
        : [WORDS.coincident, WORDS.infinitelyMany, WORDS.dependent];
  return `${say(locale, kind)}: ${say(locale, count)} (${say(locale, consistency)})`;
}
