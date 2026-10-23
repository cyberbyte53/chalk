import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Nudger } from "./kit/controls";
import { frameOf } from "./kit/frame";
import { type Pt, type Words, add, numText, say, scale, sub } from "./kit/geometry";
import {
  AngleMark,
  CircleShape,
  DragHandle,
  EqualTicks,
  type LabelItem,
  Labels,
  PointDot,
  RightMark,
  Seg,
} from "./kit/pieces";
import {
  PointPlace,
  TangentsAction,
  TangentsPart,
  type TangentsState,
  angleAtOOf,
  angleAtPOf,
  contactsOf,
  lengthOf,
  placeOf,
  pointOf,
  tangentCountOf,
} from "./tangents";

export const TANGENT_WORDS = {
  [PointPlace.Inside]: { en: "P is inside the circle", hi: "P वृत्त के अंदर है" },
  [PointPlace.On]: { en: "P is on the circle", hi: "P वृत्त पर है" },
  [PointPlace.Outside]: { en: "P is outside the circle", hi: "P वृत्त के बाहर है" },
  count0: { en: "no tangent", hi: "कोई स्पर्श रेखा नहीं" },
  count1: { en: "exactly one tangent", hi: "ठीक एक स्पर्श रेखा" },
  count2: { en: "exactly two tangents", hi: "ठीक दो स्पर्श रेखाएँ" },
  distance: { en: "OP", hi: "OP" },
  moveP: { en: "move P", hi: "P खिसकाओ" },
} as const satisfies Record<string, Words>;

const H = 230;
const O: Pt = [0, 0];

export function TangentsView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as TangentsState;
  const [nO, nP, nQ, nR] = s.names as [string, string, string, string];
  const place = placeOf(s);
  const P = pointOf(s);
  const contacts = contactsOf(s);
  const len = lengthOf(s);
  const count = tangentCountOf(s);
  // Frame the circle and wherever P can go (up to 4r), so moving P doesn't rescale the picture.
  const reach = s.canMove ? Math.max(4 * s.r, s.d) : Math.max(s.d, s.r * 1.2);
  const frame = frameOf(
    [
      [-s.r * 1.15, -s.r * 1.3],
      [reach * 1.05, s.r * 1.3],
    ],
    { width, height: H },
    16,
  );
  const tangentLines: [Pt, Pt][] =
    place === PointPlace.On
      ? [[add(P, [0, -1.6 * s.r]), add(P, [0, 1.6 * s.r])]]
      : place === PointPlace.Outside
        ? contacts.map((q) => [P, add(q, scale(sub(q, P), 0.35))] as [Pt, Pt])
        : [];
  const labels: LabelItem[] = [
    { id: "o", at: O, text: nO, prefer: 180 },
    { id: "p", at: P, text: nP, prefer: 0 },
  ];
  if (place === PointPlace.Outside) {
    const [q, r] = contacts as [Pt, Pt];
    labels.push({ id: "q", at: q, text: nQ, away: O });
    labels.push({ id: "r", at: r, text: nR, away: O });
    if (s.showLengths && len !== null) {
      labels.push({
        id: "pq",
        at: [(P[0] + q[0]) / 2, (P[1] + q[1]) / 2],
        text: `${numText(len)}`,
        kind: "length",
        tone: "result",
        away: O,
      });
      labels.push({
        id: "pr",
        at: [(P[0] + r[0]) / 2, (P[1] + r[1]) / 2],
        text: `${numText(len)}`,
        kind: "length",
        tone: "result",
        away: O,
      });
    }
  }
  const countWord =
    count === 0 ? TANGENT_WORDS.count0 : count === 1 ? TANGENT_WORDS.count1 : TANGENT_WORDS.count2;
  const atP = angleAtPOf(s);
  const atO = angleAtOOf(s);
  return (
    <div class="ci ci-tangents">
      <Stage
        label={`A circle with centre ${nO}; ${TANGENT_WORDS[place].en}; ${countWord.en}${len !== null && place === PointPlace.Outside ? `, each ${numText(len)} cm long` : ""}`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={H}
        svg={{ class: "ci-svg" }}
      >
        <g data-part={TangentsPart.Circle}>
          <CircleShape centre={O} r={s.r} isFilled />
          <PointDot at={O} kind="centre" />
        </g>
        <g data-part={TangentsPart.Tangents}>
          {s.showBisector && place === PointPlace.Outside && (
            <Seg from={O} to={P} tone="muted" dashed />
          )}
          {tangentLines.map(([a, b], i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: one or two tangents, in order
            <Seg key={i} from={a} to={b} tone="result" />
          ))}
          {s.showRadii &&
            place !== PointPlace.Inside &&
            contacts.map((q, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: one or two radii, in order
              <g key={i}>
                <Seg from={O} to={q} tone="main" />
                <RightMark vertex={q} p={O} q={place === PointPlace.On ? add(q, [0, 1]) : P} />
              </g>
            ))}
          {s.showLengths && place === PointPlace.Outside && (
            <>
              <EqualTicks from={P} to={contacts[0] as Pt} count={2} />
              <EqualTicks from={P} to={contacts[1] as Pt} count={2} />
            </>
          )}
          {s.showAngles && place === PointPlace.Outside && atP !== null && atO !== null && (
            <>
              <AngleMark
                vertex={P}
                p={contacts[0] as Pt}
                q={contacts[1] as Pt}
                label={`${numText(atP, 0)}°`}
                tone="accent"
                radius={18}
              />
              <AngleMark
                vertex={O}
                p={contacts[0] as Pt}
                q={contacts[1] as Pt}
                label={`${numText(atO, 0)}°`}
                tone="result"
                radius={14}
              />
            </>
          )}
          {contacts.map((q, i) =>
            place === PointPlace.Outside ? (
              // biome-ignore lint/suspicious/noArrayIndexKey: two points of contact, in order
              <PointDot key={i} at={q} tone="result" />
            ) : null,
          )}
        </g>
        <g data-part={TangentsPart.Point}>
          <PointDot at={P} tone={place === PointPlace.Inside ? "wrong" : "accent"} />
        </g>
        <Labels
          items={labels}
          segments={[
            ...tangentLines,
            ...(s.showRadii ? contacts.map((q) => [O, q] as [Pt, Pt]) : []),
          ]}
          circles={[{ c: O, r: s.r }]}
        />
        {s.canMove && (
          <DragHandle
            at={P}
            label={`${say(locale, TANGENT_WORDS.moveP)}: ${nO}${nP} = ${numText(s.d)} cm`}
            part={TangentsPart.Point}
            onMove={(p) =>
              call(TangentsAction.SetDistance, { d: Math.max(0, p[0]), isSnapped: true })
            }
            onStep={(dir) => call(TangentsAction.Move, { by: dir[0] + dir[1] >= 0 ? 1 : -1 })}
          />
        )}
      </Stage>
      {s.showCount && (
        <p
          class={`ci-verdict ${count === 2 ? "is-on" : count === 0 ? "is-off" : ""}`}
          data-part={TangentsPart.Readout}
        >
          <strong>{say(locale, TANGENT_WORDS[place])}</strong>: {say(locale, countWord)}
          {s.showLengths &&
            place === PointPlace.Outside &&
            len !== null &&
            `. ${nP}${nQ} = ${nP}${nR} = ${numText(len)} cm`}
        </p>
      )}
      {s.canMove && (
        <div class="ci-controls">
          <Nudger
            locale={locale}
            name={`${nO}${nP}`}
            value={`${numText(s.d)} cm`}
            part={TangentsPart.Move}
            canDown={s.d > 1e-9}
            canUp={s.d < 4 * s.r - 1e-9}
            onNudge={(by) => call(TangentsAction.Move, { by })}
          />
        </div>
      )}
    </div>
  );
}
