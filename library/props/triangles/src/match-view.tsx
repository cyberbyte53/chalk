import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { AngleArc, SideLabel, VertexLabel, centreOf, pathOf } from "./draw";
import { type Pt, type Sides, type Words, numText, placeTriangle, say } from "./geometry";
import {
  MatchAction,
  MatchEdit,
  MatchPart,
  MatchSide,
  type MatchState,
  anglesEqualOf,
  anglesFirstOf,
  anglesSecondOf,
  isSimilarMatch,
  ratiosOfMatch,
  sidesProportionalOf,
} from "./match";
import { Nudger } from "./ui";

const WORDS = {
  similar: { en: "similar", hi: "समरूप" },
  notSimilar: { en: "Not similar", hi: "समरूप नहीं" },
  angles: { en: "corresponding angles equal", hi: "संगत कोण बराबर" },
  noAngles: { en: "corresponding angles not all equal", hi: "सभी संगत कोण बराबर नहीं" },
  ratios: { en: "sides in the same ratio", hi: "भुजाएँ एक ही अनुपात में" },
  noRatios: { en: "sides not in the same ratio", hi: "भुजाएँ एक अनुपात में नहीं" },
} as const satisfies Record<string, Words>;

const H = 210;
const deg = (x: number) => `${numText(x, 0)}°`;

export function MatchView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as MatchState;
  const [A, B, C, D, E, F] = s.names as [string, string, string, string, string, string];
  const t1 = placeTriangle(s.first);
  const t2 = placeTriangle(s.second);
  const half = width / 2;
  const span = (t: { a: Pt; b: Pt; c: Pt }) => {
    const xs = [t.a[0], t.b[0], t.c[0]];
    return { w: Math.max(...xs) - Math.min(...xs), h: t.a[1], minX: Math.min(...xs) };
  };
  const s1 = span(t1);
  const s2 = span(t2);
  const k = Math.min(
    (half - 44) / Math.max(s1.w, 1e-6),
    (half - 44) / Math.max(s2.w, 1e-6),
    (H - 56) / Math.max(s1.h, s2.h, 1e-6),
  );
  const height = Math.min(H, Math.max(s1.h, s2.h) * k + 60);
  const place = (t: { a: Pt; b: Pt; c: Pt }, sp: { w: number; minX: number }, left: number) => {
    const ox = left + (half - sp.w * k) / 2 - sp.minX * k;
    const oy = height - 26;
    const px = (p: Pt): Pt => [ox + p[0] * k, oy - p[1] * k];
    return { a: px(t.a), b: px(t.b), c: px(t.c) };
  };
  const p1 = place(t1, s1, 0);
  const p2 = place(t2, s2, half);
  const a1 = anglesFirstOf(s);
  const a2 = anglesSecondOf(s);
  const eq = anglesEqualOf(s);
  const r = ratiosOfMatch(s);
  const similar = isSimilarMatch(s);
  const tri = (
    p: { a: Pt; b: Pt; c: Pt },
    names: [string, string, string],
    sides: Sides,
    angles: number[],
    cls: string,
    part: string,
  ) => {
    const c = centreOf([p.a, p.b, p.c]);
    return (
      <g data-part={part}>
        <path class={cls} d={pathOf([p.a, p.b, p.c])} />
        {s.showAngles && (
          <>
            <AngleArc
              v={p.a}
              p={p.b}
              q={p.c}
              r={12}
              label={deg(angles[0] as number)}
              cls={`tg-arc${eq[0] ? " is-match" : ""}`}
            />
            <AngleArc
              v={p.b}
              p={p.c}
              q={p.a}
              r={12}
              label={deg(angles[1] as number)}
              cls={`tg-arc${eq[1] ? " is-match" : ""}`}
            />
            <AngleArc
              v={p.c}
              p={p.a}
              q={p.b}
              r={12}
              label={deg(angles[2] as number)}
              cls={`tg-arc${eq[2] ? " is-match" : ""}`}
            />
          </>
        )}
        {s.showSides && (
          <>
            <SideLabel p={p.a} q={p.b} centre={c} text={numText(sides.ab)} gap={11} />
            <SideLabel p={p.b} q={p.c} centre={c} text={numText(sides.bc)} gap={11} />
            <SideLabel p={p.c} q={p.a} centre={c} text={numText(sides.ca)} gap={11} />
          </>
        )}
        <VertexLabel at={p.a} centre={c} text={names[0]} gap={13} />
        <VertexLabel at={p.b} centre={c} text={names[1]} gap={13} />
        <VertexLabel at={p.c} centre={c} text={names[2]} gap={13} />
      </g>
    );
  };
  const side = (which: MatchSide, name: string) => (
    <Nudger
      key={which}
      name={name}
      value={numText(s.second[which])}
      part={MatchPart.Controls}
      canDown={s.second[which] > s.step + 1e-9}
      onNudge={(b) => call(MatchAction.NudgeSide, { side: which, by: b })}
    />
  );
  const angle = (at: 0 | 1 | 2, name: string) => (
    <Nudger
      key={`a${at}`}
      name={`∠${name}`}
      value={deg(a2[at] as number)}
      part={MatchPart.Controls}
      onNudge={(b) => call(MatchAction.NudgeAngle, { at, by: b })}
    />
  );
  const controls = ((): JSX.Element[] => {
    switch (s.edit) {
      case MatchEdit.Scale:
        return [
          <Nudger
            key="k"
            name={`${D}${E} / ${A}${B}`}
            value={numText(s.second.ab / s.first.ab)}
            part={MatchPart.Controls}
            onNudge={(b) => call(MatchAction.NudgeScale, { by: b })}
          />,
        ];
      case MatchEdit.Sides:
        return [
          side(MatchSide.AB, `${D}${E}`),
          side(MatchSide.BC, `${E}${F}`),
          side(MatchSide.CA, `${F}${D}`),
        ];
      case MatchEdit.Sas:
        return [side(MatchSide.AB, `${D}${E}`), side(MatchSide.CA, `${D}${F}`), angle(0, D)];
      case MatchEdit.Angles:
        return [side(MatchSide.BC, `${E}${F}`), angle(1, E), angle(2, F)];
      case MatchEdit.None:
        return [];
    }
  })();
  return (
    <div class="tg tg-match">
      <Stage
        label={`Triangles ${A}${B}${C} and ${D}${E}${F}${s.showVerdict ? (similar ? ", similar" : ", not similar") : ""}`}
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "tg-svg" }}
      >
        {tri(p1, [A, B, C], s.first, a1, "tg-shape-1", MatchPart.First)}
        {tri(p2, [D, E, F], s.second, a2, "tg-shape-2", MatchPart.Second)}
      </Stage>
      {s.showRatios && (
        <div class="tg-readout" data-part={MatchPart.Ratios}>
          <span class="tg-chip">{`${A}${B}/${D}${E} = ${numText(r[0], 2)}`}</span>
          <span class="tg-chip">{`${B}${C}/${E}${F} = ${numText(r[1], 2)}`}</span>
          <span class="tg-chip">{`${C}${A}/${F}${D} = ${numText(r[2], 2)}`}</span>
        </div>
      )}
      {s.showVerdict && (
        <p class={`tg-verdict ${similar ? "is-on" : "is-off"}`} data-part={MatchPart.Verdict}>
          {similar
            ? `∆${A}${B}${C} ~ ∆${D}${E}${F}: ${say(locale, WORDS.angles)}, ${say(locale, WORDS.ratios)}`
            : `${say(locale, WORDS.notSimilar)}: ${say(locale, eq.every(Boolean) ? WORDS.angles : WORDS.noAngles)}, ${say(
                locale,
                sidesProportionalOf(s) ? WORDS.ratios : WORDS.noRatios,
              )}`}
        </p>
      )}
      {controls.length > 0 && <div class="tg-controls">{controls}</div>}
    </div>
  );
}
