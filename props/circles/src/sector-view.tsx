import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Nudger } from "./kit/controls";
import { frameOf } from "./kit/frame";
import { type Pt, type Words, angleOf, numText, onCircle, say } from "./kit/geometry";
import { PathShape, shapes } from "./kit/path";
import {
  AngleMark,
  CircleShape,
  DragHandle,
  type LabelItem,
  Labels,
  PointDot,
  Seg,
} from "./kit/pieces";
import { amount, piOf, piText } from "./pi";
import {
  SectorAction,
  SectorPart,
  SectorShow,
  type SectorState,
  arcLengthOf,
  majorSectorAreaOf,
  majorSegmentAreaOf,
  sectorAreaOf,
  segmentAreaOf,
  triangleAreaOf,
} from "./sector";

export const SECTOR_WORDS = {
  sector: { en: "Sector", hi: "त्रिज्यखंड" },
  segment: { en: "Segment", hi: "वृत्तखंड" },
  arc: { en: "Arc", hi: "चाप" },
  triangle: { en: "∆OAB", hi: "∆OAB" },
  majorSector: { en: "Major sector", hi: "दीर्घ त्रिज्यखंड" },
  majorSegment: { en: "Major segment", hi: "दीर्घ वृत्तखंड" },
  angle: { en: "angle", hi: "कोण" },
  turnOB: { en: "turn OB", hi: "OB घुमाओ" },
} as const satisfies Record<string, Words>;

const H = 230;
const O: Pt = [0, 0];

export function SectorView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SectorState;
  const r = s.r;
  const t = s.theta;
  const A = onCircle(O, r, 0);
  const B = onCircle(O, r, t);
  const pi = piText(s.pi);
  const circle = piOf(s.pi) * r * r;
  const isSegment = s.show === SectorShow.Segment;
  const frame = frameOf(
    [
      [-1.3 * r, -1.3 * r],
      [1.3 * r, 1.3 * r],
    ],
    { width, height: H },
    6,
  );
  const hasAngle = t > 0.5 && t < 359.5;
  const sector = sectorAreaOf(s);
  const tri = triangleAreaOf(s);
  const lines: string[] = [];
  lines.push(
    `${say(locale, SECTOR_WORDS.sector)} = θ/360 × πr² = ${numText(t)}/360 × ${pi} × ${numText(r)} × ${numText(r)} = ${amount(sector)} cm²`,
  );
  if (s.showArc)
    lines.push(`${say(locale, SECTOR_WORDS.arc)} AB = θ/360 × 2πr = ${amount(arcLengthOf(s))} cm`);
  if (isSegment)
    lines.push(
      `${say(locale, SECTOR_WORDS.segment)} = ${say(locale, SECTOR_WORDS.sector)} − ∆OAB = ${amount(sector)} ${tri < 0 ? "+" : "−"} ${amount(Math.abs(tri))} = ${amount(segmentAreaOf(s))} cm²`,
    );
  if (s.showMajor)
    lines.push(
      isSegment
        ? `${say(locale, SECTOR_WORDS.majorSegment)} = πr² − ${amount(segmentAreaOf(s))} = ${amount(circle)} − ${amount(segmentAreaOf(s))} = ${amount(majorSegmentAreaOf(s))} cm²`
        : `${say(locale, SECTOR_WORDS.majorSector)} = πr² − ${amount(sector)} = ${amount(circle)} − ${amount(sector)} = ${amount(majorSectorAreaOf(s))} cm²`,
    );
  const labels: LabelItem[] = [
    { id: "o", at: O, text: "O", prefer: 225 },
    { id: "a", at: A, text: "A", away: O },
    { id: "b", at: B, text: "B", away: O },
  ];
  return (
    <div class="ci ci-sector">
      <Stage
        label={`A circle with centre O and radius ${numText(r)} cm; ∠AOB = ${numText(t)}°; ${isSegment ? `segment ${amount(segmentAreaOf(s))}` : `sector ${amount(sector)}`} cm²`}
        x={frame.x}
        y={frame.y}
        width={width}
        height={H}
        svg={{ class: "ci-svg" }}
      >
        <g data-part={SectorPart.Figure}>
          <CircleShape centre={O} r={r} isFilled />
          {s.showMajor && hasAngle && (
            <PathShape
              cmds={isSegment ? shapes.segment(O, r, t, 360) : shapes.sector(O, r, t, 360)}
              tone="construction"
            />
          )}
          {hasAngle && (
            <PathShape
              cmds={isSegment ? shapes.segment(O, r, 0, t) : shapes.sector(O, r, 0, t)}
              tone={isSegment ? "result" : "accent"}
            />
          )}
          {t >= 359.5 && <PathShape cmds={shapes.circle(O, r)} tone="accent" />}
          {isSegment && hasAngle && (
            <>
              <Seg from={A} to={B} tone="main" />
              <Seg from={O} to={A} tone="muted" dashed />
              <Seg from={O} to={B} tone="muted" dashed />
            </>
          )}
          {!isSegment && (
            <>
              <Seg from={O} to={A} tone="main" />
              <Seg from={O} to={B} tone="main" />
            </>
          )}
          {hasAngle && (
            <AngleMark vertex={O} p={A} q={B} label={`${numText(t)}°`} tone="accent" radius={16} />
          )}
          <PointDot at={O} kind="centre" />
          <PointDot at={A} />
        </g>
        <Labels
          items={labels}
          segments={[
            [O, A],
            [O, B],
          ]}
          circles={[{ c: O, r }]}
        />
        <DragHandle
          at={B}
          label={`${say(locale, SECTOR_WORDS.turnOB)}: ${say(locale, SECTOR_WORDS.angle)} AOB = ${numText(t)}°`}
          part={SectorPart.Handle}
          isEnabled={s.canTurn}
          onMove={(p) => {
            let a = angleOf(O, p);
            if (a < 0) a += 360;
            // Snap to 360 rather than 0 when coming round from the top.
            if (a < s.step / 2 && t > 270) a = 360;
            call(SectorAction.SetAngle, { theta: a, isSnapped: true });
          }}
          onStep={(dir) => call(SectorAction.Turn, { by: dir[0] + dir[1] >= 0 ? 1 : -1 })}
        />
      </Stage>
      {s.showWorking && (
        <div class="ci-working" data-part={SectorPart.Working}>
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      )}
      {s.canTurn && (
        <div class="ci-controls">
          <Nudger
            locale={locale}
            name="θ"
            value={`${numText(t)}°`}
            part={SectorPart.Turn}
            canDown={t > 0}
            canUp={t < 360}
            onNudge={(by) => call(SectorAction.Turn, { by })}
          />
        </div>
      )}
    </div>
  );
}
