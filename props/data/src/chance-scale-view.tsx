import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  ScaleAction,
  ScalePart,
  type ScaleState,
  chanceValue,
  complementText,
  itemText,
} from "./chance-scale";
import { type Words, say } from "./numbers";
import { Button, UI } from "./ui";

const WORDS = {
  impossible: { en: "impossible", hi: "असंभव" },
  even: { en: "as likely as not", hi: "बराबर संभावना" },
  sure: { en: "sure", hi: "निश्चित" },
  not: { en: "not", hi: "नहीं" },
  comp: { en: "Show the complement", hi: "पूरक दिखाओ" },
  noComp: { en: "Hide the complement", hi: "पूरक छिपाओ" },
  place: { en: "Place next", hi: "अगली रखो" },
} as const satisfies Record<string, Words>;

export function ChanceScaleView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as ScaleState;
  const left = 22;
  const right = width - 22;
  const toX = (v: number) => left + v * (right - left);
  const placed = s.items.slice(0, s.shown);
  const lineY = 44;
  const labelRows = placed.length;
  const height = lineY + 30 + labelRows * 18 + 8;
  const focus = s.shown > 0 ? s.items[s.focus] : undefined;
  return (
    <div class="dt-scale">
      <Stage
        label="Probability line"
        x={[0, width]}
        width={width}
        height={height}
        svg={{ class: "dt-svg" }}
      >
        <g data-part={ScalePart.Line}>
          <line class="dt-axis" x1={left} x2={right} y1={lineY} y2={lineY} />
          {[0, 0.5, 1].map((v) => (
            <g key={v}>
              <line class="dt-axis" x1={toX(v)} x2={toX(v)} y1={lineY - 6} y2={lineY + 6} />
              <text
                class="dt-tick"
                x={toX(v)}
                y={lineY + 20}
                text-anchor={v === 0 ? "start" : v === 1 ? "end" : "middle"}
              >
                {v === 0 ? "0" : v === 1 ? "1" : "½"}
              </text>
              <text
                class="dt-scale-end"
                x={toX(v)}
                y={lineY - 12}
                text-anchor={v === 0 ? "start" : v === 1 ? "end" : "middle"}
              >
                {say(locale, v === 0 ? WORDS.impossible : v === 1 ? WORDS.sure : WORDS.even)}
              </text>
            </g>
          ))}
          {placed.map((item, i) => {
            const x = toX(chanceValue(item));
            const y = lineY + 34 + i * 18;
            const anchor = x < width * 0.3 ? "start" : x > width * 0.7 ? "end" : "middle";
            return (
              <g
                // biome-ignore lint/suspicious/noArrayIndexKey: items are positional
                key={i}
                class={`dt-scale-item${i === s.focus ? " is-on" : ""}`}
              >
                <line x1={x} x2={x} y1={lineY} y2={y - 10} />
                <circle cx={x} cy={lineY} r={5} />
                <text x={x} y={y} text-anchor={anchor}>
                  {`${say(locale, item.label)} (${itemText(item)})`}
                </text>
              </g>
            );
          })}
        </g>
      </Stage>
      {focus !== undefined && (
        <div class="dt-split" data-part={ScalePart.Bar}>
          <span class="is-event" style={{ flexGrow: chanceValue(focus) }}>
            {chanceValue(focus) > 0 ? itemText(focus) : ""}
          </span>
          {s.isComplementShown && (
            <span class="is-comp" style={{ flexGrow: 1 - chanceValue(focus) }}>
              {chanceValue(focus) < 1 ? complementText(focus) : ""}
            </span>
          )}
          {!s.isComplementShown && (
            <span class="is-rest" style={{ flexGrow: 1 - chanceValue(focus) }} />
          )}
        </div>
      )}
      {focus !== undefined && s.isComplementShown && (
        <p class="dt-given">
          {`P(${say(locale, focus.label)}) + P(${say(locale, WORDS.not)}) = ${itemText(focus)} + ${complementText(focus)} = 1`}
        </p>
      )}
      <div class="dt-controls">
        {s.canStep && s.shown > 0 && (
          <Button
            isWide
            label={say(locale, UI.back)}
            part={ScalePart.Back}
            onPress={() => call(ScaleAction.Back, {})}
          >
            {say(locale, UI.back)}
          </Button>
        )}
        {s.canStep && s.shown < s.items.length && (
          <Button
            isWide
            label={say(locale, WORDS.place)}
            part={ScalePart.Next}
            onPress={() => call(ScaleAction.Next, {})}
          >
            {say(locale, WORDS.place)}
          </Button>
        )}
        {s.shown > 0 && (
          <Button
            isWide
            isOn={s.isComplementShown}
            part={ScalePart.Complement}
            label={say(locale, s.isComplementShown ? WORDS.noComp : WORDS.comp)}
            onPress={() => call(ScaleAction.ShowComplement, { isShown: !s.isComplementShown })}
          >
            {say(locale, s.isComplementShown ? WORDS.noComp : WORDS.comp)}
          </Button>
        )}
      </div>
    </div>
  );
}
