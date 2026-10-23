import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./draw";
import {
  LAST_NEURON_STEP,
  NEURON_STEPS,
  NeuronAction,
  NeuronAt,
  NeuronPart,
  type NeuronState,
  NeuronTarget,
  describeNeuron,
  neuronCaption,
} from "./neuron";

const W = 320;
const H = 150;
const AXIS = 78;
const BODY = { x: 74, r: 17 };
const AXON_END = 228;
const GAP = { from: 250, to: 262 };

const WORDS = {
  dendrite: { en: "dendrite", hi: "द्रुमिका" },
  body: { en: "cell body", hi: "कोशिका काय" },
  nucleus: { en: "nucleus", hi: "केंद्रक" },
  axon: { en: "axon", hi: "तंत्रिकाक्ष" },
  ending: { en: "nerve ending", hi: "तंत्रिका सिरा" },
  synapse: { en: "synapse (gap)", hi: "सिनेप्स (अंतराल)" },
  nextNeuron: { en: "next neuron", hi: "अगली तंत्रिका" },
  muscle: { en: "muscle cell", hi: "पेशी कोशिका" },
  next: { en: "next →", hi: "आगे →" },
  again: { en: "again ↺", hi: "फिर से ↺" },
  toNeuron: { en: "to a neuron", hi: "तंत्रिका तक" },
  toMuscle: { en: "to a muscle", hi: "पेशी तक" },
  electrical: { en: "electrical", hi: "विद्युत" },
  chemical: { en: "chemical", hi: "रासायनिक" },
} as const satisfies Record<string, Words>;

/** The dendrite tree on the left of the cell body, as line segments. */
const DENDRITES: readonly [number, number, number, number][] = [
  [BODY.x - 14, AXIS - 8, 40, AXIS - 34],
  [40, AXIS - 34, 22, AXIS - 46],
  [40, AXIS - 34, 30, AXIS - 56],
  [BODY.x - 16, AXIS + 2, 30, AXIS + 4],
  [30, AXIS + 4, 12, AXIS - 8],
  [30, AXIS + 4, 14, AXIS + 18],
  [BODY.x - 12, AXIS + 11, 44, AXIS + 38],
  [44, AXIS + 38, 26, AXIS + 46],
  [44, AXIS + 38, 50, AXIS + 58],
  [BODY.x - 2, AXIS - 17, BODY.x - 6, AXIS - 46],
  [BODY.x - 6, AXIS - 46, BODY.x - 18, AXIS - 60],
];

/** The nerve ending's short branches, each ending in a knob just before the gap. */
const ENDINGS: readonly [number, number][] = [
  [GAP.from - 4, AXIS - 14],
  [GAP.from - 2, AXIS],
  [GAP.from - 4, AXIS + 14],
];

function Label({
  x,
  y,
  tx,
  ty,
  text,
  anchor = "middle",
  isNow = false,
}: {
  x: number;
  y: number;
  tx: number;
  ty: number;
  text: string;
  anchor?: "start" | "middle" | "end";
  isNow?: boolean;
}): JSX.Element {
  return (
    <g class={isNow ? "cn-label is-now" : "cn-label"}>
      <line x1={x} y1={y} x2={tx} y2={ty + (ty < y ? 3 : -9)} />
      <text x={tx} y={ty} text-anchor={anchor}>
        {text}
      </text>
    </g>
  );
}

/** Where the glowing impulse sits at each electrical step. */
function impulseAt(at: NeuronAt): [number, number] | null {
  switch (at) {
    case NeuronAt.Dendrite:
      return [22, AXIS - 46];
    case NeuronAt.CellBody:
      return [BODY.x, AXIS];
    case NeuronAt.Axon:
      return [(BODY.x + AXON_END) / 2 + 20, AXIS];
    case NeuronAt.NerveEnding:
      return [GAP.from - 4, AXIS];
    default:
      return null;
  }
}

export function NeuronSignalView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as NeuronState;
  const k = width / W;
  const height = Math.round(H * k);
  const at = NEURON_STEPS[s.step] ?? NeuronAt.Rest;
  const isMuscle = s.target === NeuronTarget.Muscle;
  const arrived = at === NeuronAt.Next;
  const chemicals = at === NeuronAt.NerveEnding || at === NeuronAt.Synapse || arrived;
  const glow = impulseAt(at);
  const clip = `cn-frame-${useId()}`;
  const caption = neuronCaption(s.step, s.target);
  return (
    <div class="cn">
      <Stage
        label={describeNeuron(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cn-svg" }}
      >
        <g transform={`scale(${k})`}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <rect class="cn-bg" x={0} y={0} width={W} height={H} />
            {/* the neuron */}
            <g
              class={at === NeuronAt.Dendrite ? "cn-cell is-lit" : "cn-cell"}
              data-part={NeuronPart.Dendrite}
            >
              {DENDRITES.map(([x1, y1, x2, y2]) => (
                <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
              ))}
            </g>
            <g
              class={at === NeuronAt.Axon ? "cn-axon is-lit" : "cn-axon"}
              data-part={NeuronPart.Axon}
            >
              <line x1={BODY.x + BODY.r - 2} y1={AXIS} x2={AXON_END} y2={AXIS} />
              {at === NeuronAt.Axon && (
                <line class="cn-flow" x1={BODY.x + BODY.r} y1={AXIS} x2={AXON_END} y2={AXIS} />
              )}
            </g>
            <g class="cn-cell" data-part={NeuronPart.NerveEnding}>
              {ENDINGS.map(([x, y]) => (
                <g key={y}>
                  <line x1={AXON_END} y1={AXIS} x2={x} y2={y} />
                  <circle class="cn-knob" cx={x} cy={y} r={3.4} />
                </g>
              ))}
            </g>
            <g
              class={at === NeuronAt.CellBody ? "cn-body is-lit" : "cn-body"}
              data-part={NeuronPart.CellBody}
            >
              <circle cx={BODY.x} cy={AXIS} r={BODY.r} />
              <circle class="cn-nucleus" cx={BODY.x - 2} cy={AXIS - 1} r={6} />
            </g>
            {/* the next cell */}
            <g data-part={NeuronPart.Next}>
              {isMuscle ? (
                <g class={arrived ? "cn-muscle is-short" : "cn-muscle"}>
                  <rect x={GAP.to} y={AXIS - 22} width={arrived ? 44 : 56} height={44} rx={10} />
                  {Array.from({ length: 6 }, (_, i) => {
                    const x = GAP.to + 8 + i * (arrived ? 6 : 8);
                    return (
                      <line
                        key={`stripe-${x}`}
                        class="cn-stripe"
                        x1={x}
                        y1={AXIS - 18}
                        x2={x}
                        y2={AXIS + 18}
                      />
                    );
                  })}
                </g>
              ) : (
                <g class={arrived ? "cn-cell is-lit" : "cn-cell"}>
                  <line x1={GAP.to} y1={AXIS - 14} x2={GAP.to + 20} y2={AXIS} />
                  <line x1={GAP.to} y1={AXIS} x2={GAP.to + 20} y2={AXIS} />
                  <line x1={GAP.to} y1={AXIS + 14} x2={GAP.to + 20} y2={AXIS} />
                  <line x1={GAP.to + 20} y1={AXIS} x2={GAP.to + 34} y2={AXIS} />
                  <circle class="cn-body-next" cx={GAP.to + 46} cy={AXIS} r={13} />
                  <line x1={GAP.to + 59} y1={AXIS} x2={W + 4} y2={AXIS} />
                </g>
              )}
            </g>
            {/* the gap and the chemicals crossing it */}
            <g data-part={NeuronPart.Synapse}>
              <rect
                class={at === NeuronAt.Synapse ? "cn-gap is-lit" : "cn-gap"}
                x={GAP.from}
                y={AXIS - 26}
                width={GAP.to - GAP.from}
                height={52}
                rx={3}
              />
              {chemicals &&
                [-16, -6, 4, 14, -11, 9].map((dy, i) => {
                  const crossed = at !== NeuronAt.NerveEnding;
                  const x = crossed
                    ? GAP.from + 3 + ((i * 5) % (GAP.to - GAP.from - 4))
                    : GAP.from - 7 + (i % 2) * 3;
                  return <circle key={dy} class="cn-chemical" cx={x} cy={AXIS + dy} r={1.8} />;
                })}
            </g>
            {glow !== null && (
              <g class="cn-glow">
                <circle class="cn-halo" cx={glow[0]} cy={glow[1]} r={9} />
                <circle cx={glow[0]} cy={glow[1]} r={4} />
              </g>
            )}
            {arrived && !isMuscle && (
              <g class="cn-glow">
                <circle class="cn-halo" cx={GAP.to + 12} cy={AXIS} r={9} />
                <circle cx={GAP.to + 12} cy={AXIS} r={4} />
              </g>
            )}
            {s.showNames && (
              <g>
                <Label
                  x={30}
                  y={AXIS - 56}
                  tx={8}
                  ty={14}
                  anchor="start"
                  text={say(locale, WORDS.dendrite)}
                  isNow={at === NeuronAt.Dendrite}
                />
                <Label
                  x={BODY.x + 6}
                  y={AXIS + 15}
                  tx={BODY.x + 24}
                  ty={H - 22}
                  text={say(locale, WORDS.body)}
                  isNow={at === NeuronAt.CellBody}
                />
                <Label
                  x={BODY.x - 2}
                  y={AXIS - 1}
                  tx={BODY.x + 30}
                  ty={AXIS - 30}
                  anchor="start"
                  text={say(locale, WORDS.nucleus)}
                />
                <Label
                  x={168}
                  y={AXIS - 2}
                  tx={168}
                  ty={AXIS - 22}
                  text={say(locale, WORDS.axon)}
                  isNow={at === NeuronAt.Axon}
                />
                <Label
                  x={GAP.from - 6}
                  y={AXIS - 15}
                  tx={GAP.from - 12}
                  ty={18}
                  anchor="end"
                  text={say(locale, WORDS.ending)}
                  isNow={at === NeuronAt.NerveEnding}
                />
                <Label
                  x={(GAP.from + GAP.to) / 2}
                  y={AXIS + 26}
                  tx={(GAP.from + GAP.to) / 2 - 20}
                  ty={H - 22}
                  text={say(locale, WORDS.synapse)}
                  isNow={at === NeuronAt.Synapse}
                />
                <text
                  class={arrived ? "cn-name is-now" : "cn-name"}
                  x={W - 6}
                  y={AXIS - 30}
                  text-anchor="end"
                >
                  {say(locale, isMuscle ? WORDS.muscle : WORDS.nextNeuron)}
                </text>
              </g>
            )}
            {at !== NeuronAt.Rest && (
              <text class="cn-form" x={W - 6} y={H - 8} text-anchor="end">
                {say(locale, at === NeuronAt.Synapse ? WORDS.chemical : WORDS.electrical)}
              </text>
            )}
          </g>
        </g>
      </Stage>
      <p class="ctc-caption">{say(locale, caption)}</p>
      <div class="ctc-controls">
        {s.canSetTarget && (
          <div class="ctc-toggle">
            {[NeuronTarget.Neuron, NeuronTarget.Muscle].map((t) => (
              <button
                key={t}
                type="button"
                class={s.target === t ? "ctc-button is-on" : "ctc-button"}
                aria-pressed={s.target === t}
                onClick={() => call(NeuronAction.SetTarget, { target: t })}
              >
                {say(locale, t === NeuronTarget.Muscle ? WORDS.toMuscle : WORDS.toNeuron)}
              </button>
            ))}
          </div>
        )}
        {s.canStep && (
          <button
            type="button"
            class="ctc-button is-main"
            data-part={NeuronPart.Button}
            onClick={() => call(NeuronAction.Next, {})}
          >
            {s.step >= LAST_NEURON_STEP
              ? say(locale, WORDS.again)
              : `${say(locale, WORDS.next)} ${s.step}/${LAST_NEURON_STEP}`}
          </button>
        )}
      </div>
    </div>
  );
}
