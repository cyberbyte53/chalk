import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  ElectrolysisAction,
  type ElectrolysisState,
  Tube,
  candleResult,
  describeElectrolysis,
  hydrogenMl,
  oxygenMl,
} from "./electrolysis";
import { type Words, say } from "./words";

const W = 320;
const H = 200;
const TABLE = 186;
const MUG = { left: 64, right: 236, top: 66, bottom: 160, water: 80 } as const;
const TUBE = { top: 40, bottom: 140, w: 28 } as const;
const X = { [Tube.Cathode]: 112, [Tube.Anode]: 188 } as const;
/** How far down the tube gas reaches when the cathode's tube is full. */
const FULL = 0.86;

const WORDS = {
  on: { en: "Switch on", hi: "स्विच चालू करो" },
  off: { en: "Switch off", hi: "स्विच बंद करो" },
  again: { en: "Empty the tubes", hi: "नलियाँ खाली करो" },
  testCathode: { en: "Candle to − tube", hi: "मोमबत्ती − नली पर" },
  testAnode: { en: "Candle to + tube", hi: "मोमबत्ती + नली पर" },
  cathode: { en: "cathode", hi: "कैथोड" },
  anode: { en: "anode", hi: "ऐनोड" },
  hydrogen: { en: "hydrogen", hi: "हाइड्रोजन" },
  oxygen: { en: "oxygen", hi: "ऑक्सीजन" },
  pop: { en: "pop!", hi: "फट!" },
  brighter: { en: "burns brighter", hi: "और तेज़ जलती है" },
  nothing: { en: "no gas yet", hi: "अभी गैस नहीं" },
  battery: { en: "6 V", hi: "6 V" },
  ml: { en: "mL", hi: "mL" },
} as const satisfies Record<string, Words>;

function InvertedTube({
  x,
  fraction,
  isOn,
  label,
  clip,
}: {
  x: number;
  fraction: number;
  isOn: boolean;
  label: string;
  clip: string;
}): JSX.Element {
  const r = TUBE.w / 2;
  const glass = `M${x - r} ${TUBE.bottom} V${TUBE.top + r} A${r} ${r} 0 0 1 ${x + r} ${TUBE.top + r} V${TUBE.bottom}`;
  const gasTo = TUBE.top + (TUBE.bottom - TUBE.top) * FULL * fraction;
  const ri = r - 2;
  const inside = `M${x - ri} ${TUBE.bottom} V${TUBE.top + r} A${ri} ${ri} 0 0 1 ${x + ri} ${TUBE.top + r} V${TUBE.bottom} Z`;
  return (
    <g data-part={label}>
      <clipPath id={clip}>
        <path d={inside} />
      </clipPath>
      <path class="ec-water-in" d={inside} />
      {fraction > 0 && (
        <rect
          class="ec-gas"
          x={x - r}
          y={TUBE.top}
          width={2 * r}
          height={gasTo - TUBE.top}
          clip-path={`url(#${clip})`}
        />
      )}
      {isOn &&
        [0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            class="ec-bubble"
            cx={x - 5 + ((i * 7) % 11)}
            cy={TUBE.bottom + 12}
            r={1.8}
            style={
              {
                "--rise": `${-(TUBE.bottom + 12 - Math.max(gasTo, TUBE.top + 6))}px`,
                animationDelay: `${i * 0.22}s`,
              } as JSX.CSSProperties
            }
          />
        ))}
      <path class="ec-glass" d={glass} />
    </g>
  );
}

function Candle({
  x,
  result,
  locale,
}: { x: number; result: "pop" | "brighter" | "nothing"; locale: string }) {
  const y = 34;
  return (
    <g class="ec-candle" data-part="candle">
      <rect class="ec-wax" x={x + 22} y={y - 4} width={7} height={22} rx={1.5} />
      <path
        class={result === "brighter" ? "ec-flame is-bright" : "ec-flame"}
        d={
          result === "brighter"
            ? `M${x + 25.5} ${y - 22} q 8 9 5 15 q -5 5 -10 0 q -3 -6 5 -15 z`
            : `M${x + 25.5} ${y - 14} q 4 5 3 8 q -3 3 -6 0 q -1 -3 3 -8 z`
        }
      />
      {result === "pop" && (
        <g class="ec-pop">
          <path
            d={`M${x} ${y - 16} l 4 6 l 6 -4 l -2 7 l 7 2 l -7 3 l 3 6 l -7 -3 l -4 6 l -1 -7 l -7 0 l 5 -5 z`}
          />
        </g>
      )}
      <text class="ec-result" x={x + 36} y={y - 8}>
        {say(locale, WORDS[result])}
      </text>
    </g>
  );
}

/** The mug, the electrodes, the tubes filling with gas, and buttons for the switch and the candle. */
export function ElectrolysisView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ElectrolysisState;
  const id = `ec-${useId()}`;
  const k = width / W;
  const height = Math.round(H * k);
  const h2 = hydrogenMl(s);
  const o2 = oxygenMl(s);
  const label = (
    x: number,
    y: number,
    text: string,
    cls = "ec-label",
    anchor: "start" | "middle" | "end" = "middle",
  ) => (
    <text class={cls} x={x} y={y} text-anchor={anchor}>
      {text}
    </text>
  );
  const isFull = s.progress >= 1;
  return (
    <div class="ec">
      <Stage
        label={describeElectrolysis(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "ec-svg" }}
      >
        <g transform={`scale(${k})`}>
          <rect class="ec-bg" x={0} y={0} width={W} height={H} rx={12} />
          <rect class="ec-table" x={0} y={TABLE} width={W} height={H - TABLE} />
          {/* the mug on two blocks, water inside */}
          <rect
            class="ec-block"
            x={MUG.left + 14}
            y={MUG.bottom}
            width={20}
            height={TABLE - MUG.bottom}
          />
          <rect
            class="ec-block"
            x={MUG.right - 34}
            y={MUG.bottom}
            width={20}
            height={TABLE - MUG.bottom}
          />
          <path
            class="ec-water"
            d={`M${MUG.left + 4} ${MUG.water} L${MUG.left + 10} ${MUG.bottom - 2} H${MUG.right - 10} L${MUG.right - 4} ${MUG.water} Z`}
          />
          {/* electrodes through stoppers in the base */}
          {[Tube.Cathode, Tube.Anode].map((tube) => (
            <g key={tube} data-part={tube}>
              <rect
                class="ec-stopper"
                x={X[tube] - 7}
                y={MUG.bottom - 6}
                width={14}
                height={10}
                rx={2}
              />
              <rect
                class="ec-electrode"
                x={X[tube] - 3}
                y={TUBE.bottom - 2}
                width={6}
                height={MUG.bottom - TUBE.bottom}
              />
            </g>
          ))}
          <InvertedTube
            x={X[Tube.Cathode]}
            fraction={s.progress}
            isOn={s.isOn}
            label="hydrogenTube"
            clip={`${id}-h`}
          />
          <InvertedTube
            x={X[Tube.Anode]}
            fraction={s.progress / 2}
            isOn={s.isOn}
            label="oxygenTube"
            clip={`${id}-o`}
          />
          <path
            class="ec-mug"
            d={`M${MUG.left} ${MUG.top} L${MUG.left + 10} ${MUG.bottom} H${MUG.right - 10} L${MUG.right} ${MUG.top}`}
          />
          {/* wires under the mug to the battery */}
          <path
            class={s.isOn ? "ec-wire is-on" : "ec-wire"}
            d={`M${X[Tube.Cathode]} ${MUG.bottom + 4} V${TABLE - 4} H316 V142 H304 V150`}
          />
          <path
            class={s.isOn ? "ec-wire is-on" : "ec-wire"}
            d={`M${X[Tube.Anode]} ${MUG.bottom + 4} V${TABLE - 10} H258 V142 H272 V150`}
          />
          <g data-part="battery">
            <rect class="ec-battery" x={266} y={150} width={44} height={30} rx={4} />
            {label(288, 170, say(locale, WORDS.battery), "ec-battery-text")}
            {label(272, 146, "+", "ec-sign")}
            {label(304, 146, "−", "ec-sign")}
          </g>
          {s.showElectrodes && (
            <g>
              {label(X[Tube.Cathode] - 22, MUG.bottom - 10, "−", "ec-sign")}
              {label(X[Tube.Anode] + 22, MUG.bottom - 10, "+", "ec-sign")}
              {label(
                X[Tube.Cathode] - 22,
                MUG.bottom - 24,
                say(locale, WORDS.cathode),
                "ec-label",
                "end",
              )}
              {label(
                X[Tube.Anode] + 22,
                MUG.bottom - 24,
                say(locale, WORDS.anode),
                "ec-label",
                "start",
              )}
            </g>
          )}
          {s.showVolumes && s.progress > 0 && (
            <g>
              {label(
                X[Tube.Cathode] - 18,
                58,
                `${h2} ${say(locale, WORDS.ml)}`,
                "ec-volume",
                "end",
              )}
              {label(
                X[Tube.Anode] + 18,
                58,
                `${o2} ${say(locale, WORDS.ml)}`,
                "ec-volume",
                "start",
              )}
            </g>
          )}
          {s.showGasNames && s.progress > 0 && (
            <g>
              {label(X[Tube.Cathode] - 18, 74, say(locale, WORDS.hydrogen), "ec-gas-name", "end")}
              {label(X[Tube.Anode] + 18, 74, say(locale, WORDS.oxygen), "ec-gas-name", "start")}
            </g>
          )}
          {s.tested !== null && (
            <Candle x={X[s.tested] - 30} result={candleResult(s, s.tested)} locale={locale} />
          )}
        </g>
      </Stage>
      <div class="ec-controls">
        {s.canSwitch && (
          <button
            type="button"
            class={s.isOn ? "ec-button is-on" : "ec-button"}
            data-part="switch"
            aria-pressed={s.isOn}
            onClick={() =>
              isFull
                ? call(ElectrolysisAction.Reset, {})
                : call(ElectrolysisAction.Switch, { on: !s.isOn })
            }
          >
            {say(locale, isFull ? WORDS.again : s.isOn ? WORDS.off : WORDS.on)}
          </button>
        )}
        {s.canTest && s.progress > 0 && !s.isOn && (
          <>
            <button
              type="button"
              class="ec-button"
              onClick={() => call(ElectrolysisAction.TestGas, { tube: Tube.Cathode })}
            >
              {say(locale, WORDS.testCathode)}
            </button>
            <button
              type="button"
              class="ec-button"
              onClick={() => call(ElectrolysisAction.TestGas, { tube: Tube.Anode })}
            >
              {say(locale, WORDS.testAnode)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
