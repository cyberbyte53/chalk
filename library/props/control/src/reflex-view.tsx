import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./draw";
import {
  BURN_AT,
  ReflexAction,
  ReflexAt,
  ReflexPart,
  ReflexPath,
  type ReflexState,
  atOf,
  describeReflex,
  isBurnt,
  isDone,
  reflexCaption,
  stepsOf,
  ticksAt,
  totalTicks,
} from "./reflex";

const W = 320;
const H = 210;
const CORD_X = 248;
const SECTION = { x: CORD_X, y: 128, r: 20 };
const BRAIN = { x: CORD_X, y: 26 };
const MUSCLE = { x: 178, y: 104 };
const HAND = { x: 60, y: 162 };
const SHOULDER = { x: 220, y: 94 };
const ELBOW = { x: 140, y: 118 };
const BAR = { x: 12, y: 24, w: 190 };

type Pt = readonly [number, number];
/** The sensory neuron: the forearm stretch moves with the forearm when the hand is pulled away. */
const SENSORY_FORE: readonly Pt[] = [
  [HAND.x + 4, HAND.y + 2],
  [ELBOW.x, ELBOW.y + 12],
];
const SENSORY_UP: readonly Pt[] = [
  [ELBOW.x, ELBOW.y + 12],
  [204, 122],
  [SECTION.x - 12, SECTION.y + 6],
];
const SENSORY: readonly Pt[] = [...SENSORY_FORE, ...SENSORY_UP.slice(1)];
const RELAY: readonly Pt[] = [
  [SECTION.x - 12, SECTION.y + 4],
  [SECTION.x + 4, SECTION.y + 2],
  [SECTION.x - 10, SECTION.y - 8],
];
const MOTOR: readonly Pt[] = [
  [SECTION.x - 10, SECTION.y - 8],
  [212, 94],
  [MUSCLE.x + 8, MUSCLE.y - 4],
];
const UP: readonly Pt[] = [
  [CORD_X - 3, SECTION.y - SECTION.r],
  [CORD_X - 3, BRAIN.y + 22],
];
const DOWN: readonly Pt[] = [
  [CORD_X + 4, BRAIN.y + 22],
  [CORD_X + 4, SECTION.y - SECTION.r],
];

const WORDS = {
  receptor: { en: "receptor in skin", hi: "त्वचा में ग्राही" },
  sensory: { en: "sensory neuron", hi: "संवेदी तंत्रिका" },
  motor: { en: "motor neuron", hi: "प्रेरक तंत्रिका" },
  cord: { en: "spinal cord", hi: "मेरुरज्जु" },
  relay: { en: "relay neuron", hi: "प्रसारण तंत्रिका" },
  muscle: { en: "arm muscle", hi: "बाँह की पेशी" },
  brain: { en: "brain", hi: "मस्तिष्क" },
  tawa: { en: "hot tawa", hi: "गरम तवा" },
  time: { en: "time on the tawa", hi: "तवे पर समय" },
  burn: { en: "burns here", hi: "यहाँ जलता है" },
  reflex: { en: "Reflex path", hi: "प्रतिवर्ती रास्ता" },
  brainPath: { en: "Think first", hi: "पहले सोचो" },
  next: { en: "next →", hi: "आगे →" },
  again: { en: "again ↺", hi: "फिर से ↺" },
  safe: { en: "pulled away in time", hi: "समय पर हटा लिया" },
  ouch: { en: "ouch! burnt", hi: "आह! जल गया" },
  alsoBrain: { en: "also to the brain", hi: "मस्तिष्क को भी" },
} as const satisfies Record<string, Words>;

const line = (pts: readonly Pt[]): string =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");
const last = (pts: readonly Pt[]): Pt => pts[pts.length - 1] ?? [0, 0];

/** The stretch of nerve the message is on at each stage, and where its dot sits. */
function stretchOf(at: ReflexAt): { path: readonly Pt[]; dot: Pt } | null {
  switch (at) {
    case ReflexAt.Touch:
      return { path: [], dot: [HAND.x, HAND.y] };
    case ReflexAt.Sensory:
      return { path: SENSORY, dot: last(SENSORY) };
    case ReflexAt.SpinalCord:
      return { path: RELAY, dot: last(RELAY) };
    case ReflexAt.UpToBrain:
      return { path: UP, dot: last(UP) };
    case ReflexAt.Thinking:
      return { path: [], dot: [BRAIN.x, BRAIN.y] };
    case ReflexAt.DownFromBrain:
      return { path: DOWN, dot: last(DOWN) };
    case ReflexAt.Motor:
      return { path: MOTOR, dot: last(MOTOR) };
    case ReflexAt.Muscle:
      return { path: [], dot: [MUSCLE.x, MUSCLE.y] };
  }
}

export function ReflexArcView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ReflexState;
  const k = width / W;
  const height = Math.round(H * k);
  const at = atOf(s);
  const passed = new Set(stepsOf(s.path).slice(0, s.step + 1));
  const isBrainPath = s.path === ReflexPath.Brain;
  const done = isDone(s);
  const burnt = isBurnt(s);
  const ticks = ticksAt(s.path, s.step);
  const maxTicks = totalTicks(ReflexPath.Brain);
  const stretch = stretchOf(at);
  const away = done;
  const clip = `cr-frame-${useId()}`;
  const nerve = (pts: readonly Pt[], cls: string, isLit: boolean) => (
    <path class={`${cls}${isLit ? " is-lit" : ""}`} d={line(pts)} />
  );
  // When the hand is pulled away, the forearm swings up a little.
  const lift = away ? 24 : 0;
  return (
    <div class="cr">
      <Stage
        label={describeReflex(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cr-svg" }}
      >
        <g transform={`scale(${k})`}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <rect class="cr-bg" x={0} y={0} width={W} height={H} />
            {/* body: head, back, arm */}
            <circle class="cr-skin" cx={BRAIN.x} cy={BRAIN.y + 2} r={28} />
            <rect
              class="cr-shirt"
              x={CORD_X - 28}
              y={BRAIN.y + 26}
              width={56}
              height={160}
              rx={14}
            />
            <g transform={`rotate(${lift} ${ELBOW.x} ${ELBOW.y})`}>
              <path class="cr-arm" d={`M${ELBOW.x} ${ELBOW.y} L${HAND.x + 10} ${HAND.y - 4}`} />
              <ellipse class="cr-skin" cx={HAND.x} cy={HAND.y} rx={11} ry={7} />
              {burnt && <circle class="cr-blister" cx={HAND.x - 3} cy={HAND.y + 3} r={4} />}
              {nerve(SENSORY_FORE, "cr-sensory", passed.has(ReflexAt.Sensory))}
            </g>
            <path class="cr-arm" d={`M${SHOULDER.x} ${SHOULDER.y} L${ELBOW.x} ${ELBOW.y}`} />
            <ellipse
              class={away ? "cr-muscle is-short" : "cr-muscle"}
              cx={MUSCLE.x}
              cy={MUSCLE.y + 4}
              rx={away ? 12 : 16}
              ry={away ? 9 : 6}
              transform={`rotate(-20 ${MUSCLE.x} ${MUSCLE.y})`}
              data-part={ReflexPart.Muscle}
            />
            {/* the tawa */}
            <g data-part={ReflexPart.Hand}>
              <ellipse class="cr-tawa" cx={56} cy={172} rx={36} ry={7} />
              {[30, 82].map((x) => (
                <path key={x} class="cr-heat" d={`M${x} 162 q 4 -6 0 -12 q -4 -6 0 -12`} />
              ))}
            </g>
            {/* brain and spinal cord */}
            <ellipse
              class={at === ReflexAt.Thinking ? "cr-brain is-lit" : "cr-brain"}
              cx={BRAIN.x}
              cy={BRAIN.y}
              rx={20}
              ry={14}
              data-part={ReflexPart.Brain}
            />
            <g data-part={ReflexPart.SpinalCord}>
              <rect class="cr-cord" x={CORD_X - 7} y={BRAIN.y + 12} width={14} height={H} rx={7} />
              <circle class="cr-section" cx={SECTION.x} cy={SECTION.y} r={SECTION.r} />
              <path
                class="cr-grey"
                d={`M${SECTION.x - 13} ${SECTION.y - 7} q 13 8 26 0 q -5 7 0 14 q -13 -8 -26 0 q 5 -7 0 -14 z`}
              />
            </g>
            {/* the nerves */}
            {nerve(SENSORY_UP, "cr-sensory", passed.has(ReflexAt.Sensory))}
            {nerve(MOTOR, "cr-motor", passed.has(ReflexAt.Motor))}
            {nerve(RELAY, "cr-relay", !isBrainPath && passed.has(ReflexAt.SpinalCord))}
            {nerve(
              UP,
              "cr-up",
              passed.has(ReflexAt.UpToBrain) || (!isBrainPath && passed.has(ReflexAt.SpinalCord)),
            )}
            {isBrainPath && nerve(DOWN, "cr-down", passed.has(ReflexAt.DownFromBrain))}
            {stretch !== null && stretch.path.length > 1 && (
              <path class="cr-flow" d={line(stretch.path)} />
            )}
            {stretch !== null && (
              <g class="cr-dot">
                <circle class="cr-halo" cx={stretch.dot[0]} cy={stretch.dot[1]} r={8} />
                <circle cx={stretch.dot[0]} cy={stretch.dot[1]} r={3.6} />
              </g>
            )}
            {at === ReflexAt.Thinking && (
              <text class="cr-think" x={BRAIN.x} y={BRAIN.y + 4} text-anchor="middle">
                ? ? ?
              </text>
            )}
            {s.showNames && (
              <g class="cr-names">
                <text x={HAND.x - 4} y={HAND.y - 16} text-anchor="middle">
                  {say(locale, WORDS.receptor)}
                </text>
                <text x={56} y={194} text-anchor="middle">
                  {say(locale, WORDS.tawa)}
                </text>
                <text class="cr-name-sensory" x={112} y={160} transform="rotate(-20 112 160)">
                  {say(locale, WORDS.sensory)}
                </text>
                <text class="cr-name-motor" x={196} y={70} text-anchor="end">
                  {say(locale, WORDS.motor)}
                </text>
                <text x={MUSCLE.x - 22} y={MUSCLE.y - 12} text-anchor="end">
                  {say(locale, WORDS.muscle)}
                </text>
                <text x={W - 4} y={SECTION.y + 38} text-anchor="end">
                  {say(locale, WORDS.cord)}
                </text>
                {!isBrainPath && passed.has(ReflexAt.SpinalCord) && (
                  <text class="cr-name-also" x={CORD_X - 12} y={SECTION.y + 38} text-anchor="end">
                    {say(locale, WORDS.relay)}
                  </text>
                )}
                <text x={BRAIN.x + 30} y={BRAIN.y + 4}>
                  {say(locale, WORDS.brain)}
                </text>
                {!isBrainPath && passed.has(ReflexAt.SpinalCord) && (
                  <text class="cr-name-also" x={W - 4} y={78} text-anchor="end">
                    {`↑ ${say(locale, WORDS.alsoBrain)}`}
                  </text>
                )}
              </g>
            )}
            {/* time on the tawa */}
            <g class="cr-time">
              <text x={BAR.x} y={BAR.y + 18}>
                {say(locale, WORDS.time)}
              </text>
              <rect class="cr-bar" x={BAR.x} y={BAR.y} width={BAR.w} height={7} rx={3.5} />
              <rect
                class={burnt ? "cr-fill is-burnt" : "cr-fill"}
                x={BAR.x}
                y={BAR.y}
                width={(BAR.w * ticks) / maxTicks}
                height={7}
                rx={3.5}
              />
              <line
                class="cr-burn"
                x1={BAR.x + (BAR.w * BURN_AT) / maxTicks}
                y1={BAR.y - 4}
                x2={BAR.x + (BAR.w * BURN_AT) / maxTicks}
                y2={BAR.y + 11}
              />
              <text class="cr-burn-text" x={BAR.x + (BAR.w * BURN_AT) / maxTicks + 3} y={BAR.y - 4}>
                {say(locale, WORDS.burn)}
              </text>
            </g>
            {done && (
              <text class={burnt ? "cr-result is-burnt" : "cr-result"} x={BAR.x} y={BAR.y + 36}>
                {say(locale, burnt ? WORDS.ouch : WORDS.safe)}
              </text>
            )}
          </g>
        </g>
      </Stage>
      <p class="ctc-caption">{say(locale, reflexCaption(s))}</p>
      <div class="ctc-controls">
        {s.canChoose && (
          <div class="ctc-toggle">
            {[ReflexPath.Reflex, ReflexPath.Brain].map((p) => (
              <button
                key={p}
                type="button"
                class={s.path === p ? "ctc-button is-chip is-on" : "ctc-button is-chip"}
                aria-pressed={s.path === p}
                onClick={() => call(ReflexAction.Choose, { path: p })}
              >
                {say(locale, p === ReflexPath.Brain ? WORDS.brainPath : WORDS.reflex)}
              </button>
            ))}
          </div>
        )}
        {s.canStep && (
          <button
            type="button"
            class="ctc-button is-main"
            data-part={ReflexPart.Next}
            onClick={() => call(ReflexAction.Next, {})}
          >
            {done ? say(locale, WORDS.again) : say(locale, WORDS.next)}
          </button>
        )}
      </div>
    </div>
  );
}
