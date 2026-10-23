import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Nudger } from "./kit/controls";
import { frameOf } from "./kit/frame";
import { type Pt, type Words, add, numText, say, scale } from "./kit/geometry";
import { CircleShape, type LabelItem, Labels, PointDot, RightMark, Seg } from "./kit/pieces";
import {
  LineCircleAction,
  LineCircleMode,
  LineCirclePart,
  type LineCircleState,
  LineKind,
  chordOf,
  commonPointsOf,
  distanceOf,
  kindOf,
  lineOf,
  oqOf,
  pivotOf,
  qOf,
} from "./line-circle";

export const LINE_WORDS = {
  [LineKind.NonIntersecting]: { en: "Non-intersecting line", hi: "अप्रतिच्छेदी रेखा" },
  [LineKind.Secant]: { en: "Secant", hi: "छेदक रेखा" },
  [LineKind.Tangent]: { en: "Tangent", hi: "स्पर्श रेखा" },
  points0: { en: "no common point", hi: "कोई उभयनिष्ठ बिंदु नहीं" },
  points1: { en: "one common point", hi: "एक उभयनिष्ठ बिंदु" },
  points2: { en: "two common points", hi: "दो उभयनिष्ठ बिंदु" },
  distance: { en: "distance from centre", hi: "केंद्र से दूरी" },
  radius: { en: "radius", hi: "त्रिज्या" },
  chord: { en: "chord", hi: "जीवा" },
  slide: { en: "slide the line", hi: "रेखा खिसकाओ" },
  turn: { en: "turn the line", hi: "रेखा घुमाओ" },
  moveQ: { en: "move Q", hi: "Q खिसकाओ" },
  longer: { en: "is longer than", hi: "से लंबी है" },
  equal: { en: "equals", hi: "के बराबर है" },
} as const satisfies Record<string, Words>;

const H = 230;
const O: Pt = [0, 0];

export function LineCircleView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as LineCircleState;
  const [nO, nP, nQ, nX, nY] = s.names as [string, string, string, string, string];
  const r = s.r;
  const frame = frameOf(
    [
      [-1.9 * r, -1.9 * r],
      [1.9 * r, 1.9 * r],
    ],
    { width, height: H },
    6,
  );
  const kind = kindOf(s);
  const pts = commonPointsOf(s);
  const { p, u } = lineOf(s);
  const isShortest = s.mode === LineCircleMode.Shortest;
  const P = pivotOf(s);
  const Q = qOf(s);
  const contact = kind === LineKind.Tangent ? (pts[0] as Pt) : null;
  const lineEnds: [Pt, Pt] = [add(p, scale(u, -2.4 * r)), add(p, scale(u, 2.4 * r))];

  const labels: LabelItem[] = [{ id: "o", at: O, text: nO, prefer: 210 }];
  if (isShortest) {
    labels.push({ id: "p", at: P, text: nP, prefer: 90 });
    labels.push({ id: "q", at: Q, text: nQ, prefer: 90 });
    labels.push({ id: "x", at: lineEnds[0], text: nX, prefer: 300, gap: 4 });
    labels.push({ id: "y", at: lineEnds[1], text: nY, prefer: 240, gap: 4 });
    labels.push({ id: "op", at: [0, -r / 2], text: numText(r), kind: "length", prefer: 0 });
    labels.push({
      id: "oq",
      at: [Q[0] / 2, Q[1] / 2],
      text: numText(oqOf(s)),
      kind: "length",
      tone: "accent",
      prefer: Q[0] >= 0 ? 0 : 180,
    });
  } else if (s.mode === LineCircleMode.Rotate) {
    labels.push({ id: "p", at: P, text: nP, prefer: 90 });
    if (pts.length === 2) labels.push({ id: "q", at: pts[1] as Pt, text: nQ, away: O });
  } else {
    pts.forEach((q, i) =>
      labels.push({ id: `c${i}`, at: q, text: pts.length === 1 ? nP : i === 0 ? nP : nQ, away: O }),
    );
  }

  const pointsWord =
    pts.length === 0
      ? LINE_WORDS.points0
      : pts.length === 1
        ? LINE_WORDS.points1
        : LINE_WORDS.points2;
  const value =
    s.mode === LineCircleMode.Slide
      ? `${numText(distanceOf(s))} cm`
      : s.mode === LineCircleMode.Rotate
        ? `${numText(s.turn)}°`
        : `${numText(Math.abs(s.along))} cm`;

  return (
    <div class="ci ci-line">
      <Stage
        label={`A circle with centre ${nO} and a line: ${LINE_WORDS[kind].en}, ${pointsWord.en}`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={H}
        svg={{ class: "ci-svg" }}
      >
        <g data-part={LineCirclePart.Circle}>
          <CircleShape centre={O} r={r} isFilled />
          <PointDot at={O} kind="centre" />
        </g>
        <g data-part={LineCirclePart.Line}>
          <Seg
            from={lineEnds[0]}
            to={lineEnds[1]}
            tone={
              kind === LineKind.Tangent ? "result" : kind === LineKind.Secant ? "accent" : "muted"
            }
          />
          {s.showChord && pts.length === 2 && (
            <Seg from={pts[0] as Pt} to={pts[1] as Pt} tone="accent" />
          )}
          {(s.showRadius || isShortest) && contact !== null && (
            <>
              <Seg from={O} to={contact} tone="main" />
              <RightMark vertex={contact} p={O} q={add(contact, u)} />
            </>
          )}
          {isShortest && Math.abs(s.along) > 1e-9 && <Seg from={O} to={Q} tone="accent" dashed />}
          {pts.map((q, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: at most two points, in order
            <PointDot key={i} at={q} tone={kind === LineKind.Tangent ? "result" : "accent"} />
          ))}
          {isShortest && Math.abs(s.along) > 1e-9 && <PointDot at={Q} kind="hollow" />}
        </g>
        <Labels
          items={labels}
          segments={[lineEnds, ...(contact === null ? [] : [[O, contact] as [Pt, Pt]])]}
          circles={[{ c: O, r }]}
        />
      </Stage>
      {s.showKind && !isShortest && (
        <p
          class={`ci-verdict ${kind === LineKind.Tangent ? "is-on" : ""}`}
          data-part={LineCirclePart.Kind}
        >
          <strong>{say(locale, LINE_WORDS[kind])}</strong>: {say(locale, pointsWord)}
          {s.showChord &&
            pts.length === 2 &&
            `, ${say(locale, LINE_WORDS.chord)} = ${numText(chordOf(s))} cm`}
        </p>
      )}
      {isShortest && (
        <p
          class={`ci-verdict ${Math.abs(s.along) < 1e-9 ? "is-on" : ""}`}
          data-part={LineCirclePart.Readout}
        >
          {Math.abs(s.along) < 1e-9
            ? `${nO}${nQ} = ${nO}${nP} = ${numText(r)} cm`
            : locale === "hi"
              ? `${nO}${nQ} = ${numText(oqOf(s))} cm, ${nO}${nP} = ${numText(r)} cm ${say(locale, LINE_WORDS.longer)}`
              : `${nO}${nQ} = ${numText(oqOf(s))} cm ${say(locale, LINE_WORDS.longer)} ${nO}${nP} = ${numText(r)} cm`}
        </p>
      )}
      {s.canMove && (
        <div class="ci-controls">
          <Nudger
            locale={locale}
            name={say(
              locale,
              s.mode === LineCircleMode.Slide
                ? LINE_WORDS.distance
                : s.mode === LineCircleMode.Rotate
                  ? LINE_WORDS.turn
                  : LINE_WORDS.moveQ,
            )}
            value={value}
            part={LineCirclePart.Move}
            onNudge={(by) => call(LineCircleAction.Move, { by })}
          />
        </div>
      )}
    </div>
  );
}
