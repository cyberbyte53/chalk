import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { SWAPS, SWAP_STEPS, SwapAction, SwapKind, type SwapState, describeSwap } from "./particles";
import { type Words, range, say } from "./words";

const W = 320;
const H = 180;
/** The particles are laid out small; this blows them up to fill the picture. */
const ZOOM = "translate(160 96) scale(1.35) translate(-151 -88)";

const WORDS = {
  next: { en: "Next →", hi: "आगे →" },
  again: { en: "↺ Again", hi: "↺ फिर से" },
  before: { en: "Before", hi: "पहले" },
  during: { en: "During", hi: "बीच में" },
  after: { en: "After", hi: "बाद में" },
  heat: { en: "heat", hi: "ऊष्मा" },
} as const satisfies Record<string, Words>;
const STEP_WORDS = [WORDS.before, WORDS.during, WORDS.after] as const;

/** The reaction as balls: each glides to where it is at this step. */
export function ParticlesView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SwapState;
  const info = SWAPS[s.kind];
  const k = width / W;
  const height = Math.round(H * k);
  const caption = s.captions[s.step];
  const isLast = s.step === SWAP_STEPS - 1;
  const inWater = s.kind === SwapKind.Displacement || s.kind === SwapKind.DoubleDisplacement;
  return (
    <div class="ps">
      <Stage
        label={describeSwap(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ps-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="ps-bg" x={0} y={0} width={W} height={H} rx={12} />
          {inWater && <rect class="ps-water" x={8} y={22} width={W - 16} height={H - 30} rx={8} />}
          {inWater && s.step === SWAP_STEPS - 1 && info.precipitate !== undefined && (
            <rect class="ps-floor" x={8} y={H - 12} width={W - 16} height={4} rx={2} />
          )}
          <text class="ps-step-name" x={16} y={16}>
            {say(locale, STEP_WORDS[s.step] as Words)}
          </text>
          <g data-part="particles" transform={ZOOM}>
            {s.kind === SwapKind.Decomposition && s.step > 0 && (
              <g class="ps-heat">
                <path d="M150 140 q 6 -10 0 -18 q 10 6 6 18 z" />
                <path d="M136 140 q 4 -7 0 -12 q 7 4 4 12 z" />
                <path d="M164 140 q 4 -7 0 -12 q 7 4 4 12 z" />
              </g>
            )}

            {info.particles.map((particle) => {
              const [x, y] = particle.at[s.step] as readonly [number, number];
              return (
                <g
                  key={particle.id}
                  class="ps-particle"
                  style={{ transform: `translate(${x}px, ${y}px)` } as JSX.CSSProperties}
                >
                  <circle class={`ps-atom ps-${particle.colour}`} r={particle.r} />
                  <text class="ps-symbol" y={particle.r > 10 ? 3.6 : 3} text-anchor="middle">
                    {particle.label}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </Stage>
      {s.showEquation && (
        <p class="ps-equation" data-part="equation">
          {info.equation}
          {s.kind === SwapKind.Decomposition && (
            <span class="ps-condition"> ({say(locale, WORDS.heat)})</span>
          )}
        </p>
      )}
      {caption !== undefined && (
        <p class="ps-caption" data-part="caption">
          {say(locale, caption)}
        </p>
      )}
      {s.canStep && (
        <div class="ps-controls">
          <span class="ps-dots" aria-hidden="true">
            {range(SWAP_STEPS).map((i) => (
              <span key={i} class={i === s.step ? "ps-dot is-on" : "ps-dot"} />
            ))}
          </span>
          <button
            type="button"
            class="ps-next"
            data-part="next"
            onClick={() => call(SwapAction.Next, {})}
          >
            {say(locale, isLast ? WORDS.again : WORDS.next)}
          </button>
        </div>
      )}
    </div>
  );
}
