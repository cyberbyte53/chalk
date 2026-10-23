import { Stage, useSpace } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  CircleAreaAction,
  CircleAreaMode,
  CircleAreaPart,
  type CircleAreaState,
  areaOf,
  circumferenceOf,
  rectLengthOf,
  sliceOf,
  unrolledOf,
} from "./circle-area";
import { Button, Nudger } from "./kit/controls";
import { frameOf, px, unitPx } from "./kit/frame";
import { type Pt, type Words, numText, onCircle, say } from "./kit/geometry";
import { ArcShape, CircleShape, type LabelItem, Labels, PointDot, Seg } from "./kit/pieces";
import { amount, piText } from "./pi";

export const AREA_WORDS = {
  turn: { en: "turn", hi: "चक्कर" },
  slices: { en: "slices", hi: "टुकड़े" },
  arrange: { en: "Lay them in a row", hi: "इन्हें एक पंक्ति में रखो" },
  putBack: { en: "Put them back", hi: "वापस वृत्त में रखो" },
  rolledPart: { en: "of the rim is on the road", hi: "परिधि का इतना भाग सड़क पर आ गया" },
  oneTurn: { en: "One full turn: circumference", hi: "एक पूरा चक्कर: परिधि" },
  nearRect: { en: "nearly a rectangle", hi: "लगभग एक आयत" },
  long: { en: "long", hi: "लंबा" },
  high: { en: "high", hi: "ऊँचा" },
  area: { en: "Area", hi: "क्षेत्रफल" },
  circleArea: { en: "Area of the circle", hi: "वृत्त का क्षेत्रफल" },
  cutInto: { en: "Cut into", hi: "इतने टुकड़ों में काटा" },
} as const satisfies Record<string, Words>;

const H = 240;
const f = (n: number) => n.toFixed(1);

/** One pizza slice, drawn at the origin pointing right and moved into place by a CSS transform. */
function Slice({
  apex,
  angle,
  width,
  r,
  tone,
}: { apex: Pt; angle: number; width: number; r: number; tone: "a" | "b" }) {
  const space = useSpace();
  const rp = r * unitPx(space);
  const [x, y] = px(space, apex);
  const h = (width / 2) * (Math.PI / 180);
  const d = `M0 0 L${f(rp * Math.cos(h))} ${f(-rp * Math.sin(h))} A${f(rp)} ${f(rp)} 0 0 1 ${f(rp * Math.cos(h))} ${f(rp * Math.sin(h))} Z`;
  return (
    <path
      class={`ci-slice ci-slice-${tone}`}
      d={d}
      style={{ transform: `translate(${f(x)}px, ${f(y)}px) rotate(${f(-angle)}deg)` }}
    />
  );
}

export function CircleAreaView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as CircleAreaState;
  const r = s.r;
  const pi = piText(s.pi);
  const isRoll = s.mode === CircleAreaMode.Roll;
  const C = circumferenceOf(s);
  const A = areaOf(s);
  const L = rectLengthOf(s);
  const piR = Math.PI * r;
  const frame = isRoll
    ? frameOf(
        [
          [-1.15 * r, -0.55 * r],
          [2 * piR + 1.15 * r, 2.15 * r],
        ],
        { width, height: H },
        8,
      )
    : frameOf(
        [
          [-1.75 * r, -1.2 * r],
          [1.75 * r, 1.2 * r],
        ],
        { width, height: H },
        8,
      );

  let figure: JSX.Element;
  let labels: LabelItem[] = [];
  let readout: string;
  let stageLabel: string;
  if (isRoll) {
    const phi = (s.rolled / 8) * 360;
    const along = (s.rolled / 8) * 2 * piR;
    const c: Pt = [along, r];
    const p = onCircle(c, r, 270 - phi);
    figure = (
      <g data-part={CircleAreaPart.Figure}>
        <Seg from={[-1.1 * r, 0]} to={[2 * piR + 1.1 * r, 0]} tone="muted" />
        <Seg from={[0, -0.18 * r]} to={[0, 0.18 * r]} tone="main" />
        <Seg from={[2 * piR, -0.18 * r]} to={[2 * piR, 0.18 * r]} tone="main" />
        <CircleShape centre={c} r={r} tone="muted" isFilled />
        {[0, 90, 180, 270].map((a) => (
          <Seg key={a} from={c} to={onCircle(c, r, a - phi)} tone="muted" />
        ))}
        {s.rolled === 0 ? (
          <CircleShape centre={c} r={r} tone="result" />
        ) : s.rolled < 8 ? (
          <ArcShape centre={c} r={r} from={270} to={270 - phi} tone="result" />
        ) : null}
        {s.rolled > 0 && <Seg from={[0, 0]} to={[along, 0]} tone="result" />}
        <PointDot at={c} kind="centre" />
        <PointDot at={p} tone="accent" />
      </g>
    );
    labels = [
      { id: "p", at: p, text: "P", away: c },
      ...(s.rolled === 8
        ? [
            {
              id: "c",
              at: [piR, 0] as Pt,
              text: `2πr = ${amount(C)} cm`,
              kind: "length" as const,
              tone: "result" as const,
              prefer: 270,
            },
          ]
        : []),
    ];
    readout =
      s.rolled === 8
        ? `${say(locale, AREA_WORDS.oneTurn)} = 2πr = 2 × ${pi} × ${numText(r)} = ${amount(C)} cm`
        : `${s.rolled}/8 ${say(locale, AREA_WORDS.turn)}: ${amount(unrolledOf(s))} cm ${say(locale, AREA_WORDS.rolledPart)}`;
    stageLabel = `A wheel of radius ${numText(r)} cm rolled ${s.rolled} eighths of a turn; ${amount(unrolledOf(s))} cm of its rim lies along the road`;
  } else {
    const slices = Array.from({ length: s.slices }, (_, i) => {
      const at = sliceOf(s, i);
      const home = sliceOf({ ...s, isArranged: false }, i).angle;
      // Turn the short way round from the slice's place in the circle.
      let angle = at.angle;
      while (angle - home > 180) angle -= 360;
      while (home - angle > 180) angle += 360;
      return { ...at, angle, id: `slice-${i}` };
    });
    figure = (
      <g data-part={CircleAreaPart.Figure}>
        {!s.isArranged && <CircleShape centre={[0, 0]} r={r} tone="muted" dashed />}
        <g class="ci-slices">
          {slices.map((sl, i) => (
            <Slice
              key={sl.id}
              apex={sl.apex}
              angle={sl.angle}
              width={sl.width}
              r={r}
              tone={i % 2 === 0 ? "a" : "b"}
            />
          ))}
        </g>
        {s.isArranged && (
          <>
            <Seg from={[-piR / 2, -0.8 * r]} to={[piR / 2, -0.8 * r]} tone="main" />
            <Seg
              from={[-piR / 2 - 0.15 * r, -r / 2]}
              to={[-piR / 2 - 0.15 * r, r / 2]}
              tone="main"
            />
          </>
        )}
      </g>
    );
    labels = s.isArranged
      ? [
          { id: "l", at: [0, -0.8 * r], text: `πr = ${amount(L)} cm`, kind: "length", prefer: 270 },
          {
            id: "h",
            at: [-piR / 2 - 0.15 * r, 0],
            text: `r = ${numText(r)} cm`,
            kind: "length",
            prefer: 180,
          },
        ]
      : [];
    readout = s.isArranged
      ? `${say(locale, AREA_WORDS.nearRect)}: πr × r = πr² = ${pi} × ${numText(r)} × ${numText(r)} = ${amount(A)} cm²`
      : `${say(locale, AREA_WORDS.cutInto)}: ${s.slices}. ${say(locale, AREA_WORDS.circleArea)} = πr²`;
    stageLabel = s.isArranged
      ? `${s.slices} slices of a circle of radius ${numText(r)} cm laid alternately up and down: nearly a rectangle πr = ${amount(L)} cm long and r = ${numText(r)} cm high, area ${amount(A)} cm²`
      : `A circle of radius ${numText(r)} cm cut into ${s.slices} equal slices`;
  }

  return (
    <div class="ci ci-area">
      <Stage
        label={stageLabel}
        x={frame.x}
        y={frame.y}
        width={width}
        height={H}
        svg={{ class: "ci-svg" }}
      >
        {figure}
        <Labels items={labels} />
      </Stage>
      {s.showWorking && (
        <p
          class={`ci-verdict ${(isRoll && s.rolled === 8) || (!isRoll && s.isArranged) ? "is-on" : ""}`}
          data-part={CircleAreaPart.Readout}
        >
          {readout}
        </p>
      )}
      {s.canChange && (
        <div class="ci-controls">
          {isRoll ? (
            <Nudger
              locale={locale}
              name={say(locale, AREA_WORDS.turn)}
              value={`${s.rolled}/8`}
              part={CircleAreaPart.Roll}
              canDown={s.rolled > 0}
              canUp={s.rolled < 8}
              onNudge={(by) => call(CircleAreaAction.Roll, { by })}
            />
          ) : (
            <>
              <Nudger
                locale={locale}
                name={say(locale, AREA_WORDS.slices)}
                value={`${s.slices}`}
                part={CircleAreaPart.Slices}
                canDown={s.slices > 4}
                canUp={s.slices < 32}
                onNudge={(by) => call(CircleAreaAction.SetSlices, { by })}
              />
              <Button
                isWide
                isOn={s.isArranged}
                part={CircleAreaPart.Arrange}
                label={say(locale, s.isArranged ? AREA_WORDS.putBack : AREA_WORDS.arrange)}
                onPress={() => call(CircleAreaAction.Arrange, {})}
              >
                {say(locale, s.isArranged ? AREA_WORDS.putBack : AREA_WORDS.arrange)}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
