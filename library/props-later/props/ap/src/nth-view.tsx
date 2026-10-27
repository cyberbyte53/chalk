import { Stage } from "@chalk/draw";
import { type PropViewProps, RichText } from "@chalk/player";
import type { JSX } from "preact";
import { type Words, clean, fracText, numText, say, sub, termName, termOf, withUnit } from "./ap";
import {
  NthAction,
  NthPart,
  type NthState,
  formulaTex,
  nForTarget,
  targetIsTerm,
  termOfState,
  workingTex,
} from "./nth";
import { Button, Nudger } from "./ui";

const WORDS = {
  next: { en: "Next step", hi: "अगला कदम" },
  which: { en: "Which term is", hi: "कौन-सा पद है" },
  hops: { en: "hops", hi: "छलाँगें" },
  notWhole: {
    en: "is not a whole number, so it is not a term",
    hi: "पूर्ण संख्या नहीं है, इसलिए यह कोई पद नहीं है",
  },
  notPositive: {
    en: "n must be a positive whole number, so it is not a term",
    hi: "n एक धनात्मक पूर्ण संख्या होनी चाहिए, इसलिए यह कोई पद नहीं है",
  },
  isTerm: { en: "is", hi: "है" },
  every: { en: "every term is", hi: "हर पद है" },
  none: { en: "no term is", hi: "कोई पद नहीं है" },
} as const satisfies Record<string, Words>;

const PAD = 22;
const LINE_Y = 92;
const FEW = 8;

export function NthView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as NthState;
  const term = termOfState(s);
  const hops = s.n - 1;
  const points = [s.a, term, ...(s.target === null ? [] : [s.target])];
  let lo = Math.min(...points);
  let hi = Math.max(...points);
  if (hi === lo) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  lo -= span * 0.06;
  hi += span * 0.06;
  const x = (v: number) => PAD + ((v - lo) / (hi - lo)) * (width - 2 * PAD);
  const height = 150;
  // Which hops to draw: all when few, else the first two and the last, with dots between.
  const drawn = hops <= FEW ? Array.from({ length: hops }, (_, i) => i + 1) : [1, 2, hops];
  const hopPath = (k: number) => {
    const x1 = x(termOf(s.a, s.d, k));
    const x2 = x(termOf(s.a, s.d, k + 1));
    const h = Math.min(34, Math.max(10, Math.abs(x2 - x1) * 0.6));
    return `M${x1} ${LINE_Y - 2} Q ${(x1 + x2) / 2} ${LINE_Y - 2 - h * 2} ${x2} ${LINE_Y - 2}`;
  };
  const ax = x(s.a);
  const nx = x(term);
  const work = workingTex(s);
  const f = nForTarget(s);
  const isTerm = targetIsTerm(s);
  const done = work !== null && s.step >= work.length;
  const verdict = ((): string | null => {
    if (!done || s.target === null) return null;
    const t = withUnit(s.target, s.unit);
    if (clean(s.d) === 0)
      return clean(s.target - s.a) === 0
        ? `${say(locale, WORDS.every)} ${t}`
        : `${say(locale, WORDS.none)} ${t}`;
    if (isTerm && f !== null)
      return locale === "hi"
        ? `${t}, ${termName(locale, f.p)} ${say(locale, WORDS.isTerm)}`
        : `${t} is ${termName(locale, f.p)}`;
    if (f !== null && f.q !== 1) return `n = ${fracText(f)} ${say(locale, WORDS.notWhole)}`;
    return say(locale, WORDS.notPositive);
  })();
  const braceY = LINE_Y + 34;
  return (
    <div class="ap-nth">
      <Stage
        label={`${hops} hops of ${numText(s.d)} from ${numText(s.a)} reach ${numText(term)}`}
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "ap-svg" }}
      >
        <line
          class="ap-axis"
          x1={PAD - 12}
          y1={LINE_Y}
          x2={width - PAD + 12}
          y2={LINE_Y}
          data-part={NthPart.Line}
        />
        <g data-part={NthPart.Hops}>
          {drawn.map((k) => (
            <g key={k} class="ap-nhop">
              <path class="ap-hop" d={hopPath(k)} />
              <circle class="ap-stop" cx={x(termOf(s.a, s.d, k + 1))} cy={LINE_Y} r={3} />
            </g>
          ))}
          {hops > FEW && (
            <text
              class="ap-gap"
              x={(x(termOf(s.a, s.d, 3)) + x(termOf(s.a, s.d, hops))) / 2}
              y={LINE_Y - 12}
              text-anchor="middle"
            >
              · · ·
            </text>
          )}
          {hops > 0 && (
            <g class="ap-brace">
              <path
                d={`M${ax} ${braceY - 8} V ${braceY} H ${nx} V ${braceY - 8} M${(ax + nx) / 2} ${braceY} v 6`}
              />
              <text x={(ax + nx) / 2} y={braceY + 20} text-anchor="middle">
                {`${hops} × ${clean(s.d) < 0 ? `(${numText(s.d)})` : numText(s.d)} = ${numText(clean(hops * s.d))}`}
              </text>
            </g>
          )}
        </g>
        <circle class="ap-start" cx={ax} cy={LINE_Y} r={5} />
        <text class="ap-tag" x={ax} y={LINE_Y + 18} text-anchor="middle">
          {`a${sub(1)} = ${withUnit(s.a, s.unit)}`}
        </text>
        {hops > 0 && (
          <g data-part={NthPart.Term}>
            <line
              class="ap-leader"
              x1={nx}
              y1={LINE_Y - 8}
              x2={Math.min(width - 30, Math.max(30, nx))}
              y2={20}
            />
            <circle class="ap-end" cx={nx} cy={LINE_Y} r={6} />
            <text
              class="ap-tag is-end"
              x={Math.min(width - 30, Math.max(30, nx))}
              y={14}
              text-anchor="middle"
            >
              {`a${sub(s.n)} = ${withUnit(term, s.unit)}`}
            </text>
          </g>
        )}
        {s.target !== null && (
          <g class="ap-target" data-part={NthPart.Target}>
            <line x1={x(s.target)} y1={LINE_Y - 22} x2={x(s.target)} y2={LINE_Y + 6} />
            <text
              x={Math.min(width - 24, Math.max(24, x(s.target)))}
              y={LINE_Y - 26}
              text-anchor="middle"
            >
              {`${withUnit(s.target, s.unit)} ?`}
            </text>
          </g>
        )}
      </Stage>
      <div class="ap-readout">
        {s.showFormula && (
          <p class="ap-formula" data-part={NthPart.Formula}>
            <RichText text={`$${formulaTex(s)}$`} />
          </p>
        )}
        {s.canMoveN && (
          <Nudger
            name="n"
            value={`${s.n}`}
            part={NthPart.StepN}
            canDown={s.n > 1}
            canUp={s.n < s.nMax}
            onNudge={(by) => call(NthAction.NudgeN, { by })}
          />
        )}
        {s.target !== null && (
          <div class="ap-solve">
            <p class="ap-question">
              {`${say(locale, WORDS.which)} ${withUnit(s.target, s.unit)}?`}
            </p>
            {work !== null && s.step > 0 && (
              <div class="ap-working" data-part={NthPart.Working}>
                {work.slice(0, s.step).map((line) => (
                  <p key={line}>
                    <RichText text={`$${line}$`} />
                  </p>
                ))}
              </div>
            )}
            {verdict !== null && (
              <p class={isTerm ? "ap-verdict is-on" : "ap-verdict is-off"}>{verdict}</p>
            )}
            {s.canStep && !done && (
              <Button
                isWide
                label={say(locale, WORDS.next)}
                part={NthPart.Next}
                onPress={() => call(NthAction.Next, {})}
              >
                {say(locale, WORDS.next)}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
