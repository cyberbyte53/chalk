import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  DiffusionAction,
  DiffusionPart,
  type DiffusionState,
  MAX_LAYERS,
  countsOf,
  describeDiffusion,
  isFed,
  sideOf,
} from "./diffusion";
import { Arrow, Button, Controls, Frame, Label, type Words, say } from "./draw";

const W = 320;
const H = 200;

const WORDS = {
  outside: { en: "water with oxygen", hi: "ऑक्सीजन वाला पानी" },
  fed: { en: "gets oxygen", hi: "ऑक्सीजन मिलती है" },
  starving: { en: "no oxygen", hi: "ऑक्सीजन नहीं" },
  vessels: { en: "blood vessels", hi: "रक्त वाहिकाएँ" },
  deep: { en: "cells deep:", hi: "कोशिकाएँ गहरा:" },
  one: { en: "1 cell", hi: "1 कोशिका" },
  on: { en: "Add blood vessels", hi: "रक्त वाहिकाएँ जोड़ो" },
  off: { en: "Remove blood vessels", hi: "रक्त वाहिकाएँ हटाओ" },
  count: { en: "cells get oxygen", hi: "कोशिकाओं को ऑक्सीजन" },
} as const satisfies Record<string, Words>;

export function DiffusionReachView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as DiffusionState;
  const n = sideOf(s.layers);
  const size = Math.min(34, 150 / n);
  const side = size * n;
  const x0 = 24 + (160 - side) / 2;
  const y0 = 22 + (156 - side) / 2;
  const { cells, fed } = countsOf(s);
  const mid = x0 + side / 2;
  const midY = y0 + side / 2;
  return (
    <div class="lp dr">
      <Frame w={W} h={H} width={width} label={describeDiffusion(s)} cls="dr-svg">
        <rect class="dr-water" x={0} y={0} width={W} height={H} />
        <Label x={214} y={34} text={say(locale, WORDS.outside)} cls="is-dim" />
        <g data-part={DiffusionPart.Body}>
          <rect class="dr-body" x={x0 - 3} y={y0 - 3} width={side + 6} height={side + 6} rx={8} />
          {Array.from({ length: n }, (_, r) =>
            Array.from({ length: n }, (_, c) => {
              const ok = isFed(s, r, c);
              const cx = x0 + c * size + size / 2;
              const cy = y0 + r * size + size / 2;
              return (
                // biome-ignore lint/suspicious/noArrayIndexKey: a fixed drawing, never reordered
                <g key={`${r}-${c}`}>
                  <rect
                    class={ok ? "dr-cell is-fed" : "dr-cell is-starving"}
                    x={x0 + c * size + 1}
                    y={y0 + r * size + 1}
                    width={size - 2}
                    height={size - 2}
                    rx={Math.min(6, size / 4)}
                  />
                  <circle class="dr-nucleus" cx={cx} cy={cy} r={Math.max(1.6, size / 9)} />
                  {ok && size > 14 && (
                    <circle class="lp-o2" cx={cx + size / 4} cy={cy - size / 4} r={2} />
                  )}
                </g>
              );
            }),
          )}
          {s.hasTransport && n > 1 && (
            <g class="dr-vessels">
              <path d={`M${x0 - 8} ${midY} L${x0 + side + 8} ${midY}`} />
              {Array.from({ length: n }, (_, c) => {
                if (c % 2 === 0) return null;
                const cx = x0 + c * size + size / 2;
                // biome-ignore lint/suspicious/noArrayIndexKey: a fixed drawing, never reordered
                return <path key={c} d={`M${cx} ${y0 + 2} L${cx} ${y0 + side - 2}`} />;
              })}
            </g>
          )}
          {/* oxygen arriving from outside, on all four sides */}
          <g class="lp-oxygen">
            <Arrow x1={mid} y1={y0 - 18} x2={mid} y2={y0 - 6} />
            <Arrow x1={mid} y1={y0 + side + 18} x2={mid} y2={y0 + side + 6} />
            <Arrow x1={x0 - 20} y1={midY - 14} x2={x0 - 7} y2={midY - 14} />
            <Arrow x1={x0 + side + 20} y1={midY + 14} x2={x0 + side + 7} y2={midY + 14} />
          </g>
        </g>
        {/* legend */}
        <g>
          <rect class="dr-cell is-fed" x={214} y={56} width={14} height={14} rx={3} />
          <Label x={234} y={67} text={say(locale, WORDS.fed)} />
          <rect class="dr-cell is-starving" x={214} y={80} width={14} height={14} rx={3} />
          <Label x={234} y={91} text={say(locale, WORDS.starving)} />
          {s.hasTransport && (
            <g class="dr-vessels">
              <path d="M214 111 L228 111" />
            </g>
          )}
          {s.hasTransport && <Label x={234} y={115} text={say(locale, WORDS.vessels)} />}
          <Label
            x={214}
            y={150}
            text={`${fed} / ${cells}`}
            cls={fed === cells ? "is-big is-good" : "is-big is-bad"}
          />
          <Label x={214} y={165} text={say(locale, WORDS.count)} cls="is-dim" />
        </g>
      </Frame>
      <Controls>
        {s.canSetLayers && (
          <span class="dr-row" data-part={DiffusionPart.Size}>
            <span class="dr-row-label">{say(locale, WORDS.deep)}</span>
            {Array.from({ length: MAX_LAYERS }, (_, i) => i + 1).map((k) => (
              <Button
                key={k}
                label={k === 1 ? say(locale, WORDS.one) : String(k)}
                isOn={s.layers === k}
                onClick={() => call(DiffusionAction.SetLayers, { layers: k })}
              />
            ))}
          </span>
        )}
        {s.canSetTransport && (
          <Button
            part={DiffusionPart.Transport}
            label={say(locale, s.hasTransport ? WORDS.off : WORDS.on)}
            isOn={s.hasTransport}
            onClick={() => call(DiffusionAction.SetTransport, { on: !s.hasTransport })}
          />
        )}
      </Controls>
    </div>
  );
}
