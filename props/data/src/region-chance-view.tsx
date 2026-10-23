import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { type Words, numText, say } from "./numbers";
import {
  RegionAction,
  RegionMode,
  RegionPart,
  type RegionState,
  answerLines,
  drawnPoints,
} from "./region-chance";
import { Button } from "./ui";

const WORDS = {
  points: { en: "Points", hi: "बिंदु" },
  inside: { en: "inside", hi: "अंदर" },
  answer: { en: "Show the answer", hi: "उत्तर दिखाओ" },
  clear: { en: "Clear", hi: "साफ़ करो" },
  drop: { en: "Drop", hi: "गिराओ" },
} as const satisfies Record<string, Words>;

export function RegionChanceView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as RegionState;
  const pad = 16;
  const isLine = s.mode === RegionMode.Line;
  const w = width - 2 * pad;
  const h = isLine ? 24 : Math.min(200, (w * s.height) / s.width);
  const height = isLine ? 76 : h + 2 * pad;
  const toX = (x: number) => pad + (x / s.width) * w;
  const toY = (y: number) => (isLine ? 34 : pad + h - (y / s.height) * h);
  const pts = drawnPoints(s);
  const fraction = s.trials === 0 ? 0 : s.hits / s.trials;
  return (
    <div class="dt-region">
      <Stage label="Region" x={[0, width]} width={width} height={height} svg={{ class: "dt-svg" }}>
        <g data-part={RegionPart.Picture}>
          {isLine ? (
            <>
              <line class="dt-axis" x1={toX(0)} x2={toX(s.width)} y1={34} y2={34} />
              <rect
                class="dt-region-part"
                x={toX(s.x0)}
                y={26}
                width={toX(s.x1) - toX(s.x0)}
                height={16}
              />
              {[0, s.x0, s.x1, s.width]
                .filter((v, i, a) => a.indexOf(v) === i)
                .map((v) => (
                  <g key={v}>
                    <line class="dt-axis" x1={toX(v)} x2={toX(v)} y1={28} y2={40} />
                    <text class="dt-tick" x={toX(v)} y={58} text-anchor="middle">
                      {numText(v)}
                    </text>
                  </g>
                ))}
              <text class="dt-tick" x={toX(s.width)} y={72} text-anchor="end">
                {say(locale, s.unit)}
              </text>
            </>
          ) : (
            <>
              <rect class="dt-region-whole" x={toX(0)} y={toY(s.height)} width={w} height={h} />
              <rect
                class="dt-region-part"
                x={toX(s.x0)}
                y={toY(s.y1)}
                width={toX(s.x1) - toX(s.x0)}
                height={toY(s.y0) - toY(s.y1)}
              />
              <text
                class="dt-region-name"
                x={(toX(s.x0) + toX(s.x1)) / 2}
                y={(toY(s.y0) + toY(s.y1)) / 2}
                text-anchor="middle"
              >
                {say(locale, s.partLabel)}
              </text>
            </>
          )}
          {pts.map((p, i) => (
            <circle
              // biome-ignore lint/suspicious/noArrayIndexKey: points are positional
              key={i}
              class={`dt-drop${p.isIn ? " is-in" : ""}`}
              cx={toX(p.x)}
              cy={isLine ? 34 + (((i * 7919) % 13) - 6) : toY(p.y)}
              r={2}
            />
          ))}
        </g>
      </Stage>
      <p class="dt-given" data-part={RegionPart.Counts}>
        {`${say(locale, WORDS.points)}: ${s.trials},  ${say(locale, WORDS.inside)}: ${s.hits}${
          s.trials > 0 ? `,  ${s.hits}/${s.trials} ≈ ${numText(fraction, 3)}` : ""
        }`}
      </p>
      {s.isAnswerShown && (
        <div data-part={RegionPart.Answer}>
          {answerLines(s, locale).map((line, i, all) => (
            <p key={line} class={i === all.length - 1 ? "dt-verdict" : "dt-given"}>
              {line}
            </p>
          ))}
        </div>
      )}
      <div class="dt-controls">
        {s.canDrop &&
          s.batches.map((b) => (
            <Button
              key={b}
              isWide
              part={RegionPart.Drop}
              label={`${say(locale, WORDS.drop)} ${b}`}
              onPress={() => call(RegionAction.Drop, { times: b })}
            >
              {`×${b}`}
            </Button>
          ))}
        {s.canDrop && s.trials > 0 && (
          <Button
            isWide
            label={say(locale, WORDS.clear)}
            onPress={() => call(RegionAction.Reset, {})}
          >
            {say(locale, WORDS.clear)}
          </Button>
        )}
        {!s.isAnswerShown && (
          <Button
            isWide
            part={RegionPart.Answer}
            label={say(locale, WORDS.answer)}
            onPress={() => call(RegionAction.ShowAnswer, {})}
          >
            {say(locale, WORDS.answer)}
          </Button>
        )}
      </div>
    </div>
  );
}
