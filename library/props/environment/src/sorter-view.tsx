import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Frame, Label, type Words, say } from "./draw";
import {
  Bin,
  SortAction,
  SortPart,
  type SortState,
  binOf,
  describeSorter,
  nextOf,
  rightOf,
} from "./sorter";
import { WASTE_WORDS } from "./waste";
import { WasteIcon } from "./waste-icons";

const W = 320;
const H = 200;

const WORDS = {
  bio: { en: "biodegradable", hi: "जैव निम्नीकरणीय" },
  nonBio: { en: "non-biodegradable", hi: "अजैव निम्नीकरणीय" },
  toBio: { en: "→ Biodegradable", hi: "→ जैव निम्नीकरणीय" },
  toNon: { en: "→ Non-biodegradable", hi: "→ अजैव निम्नीकरणीय" },
  again: { en: "Sort again", hi: "फिर से छाँटो" },
  next: { en: "next:", hi: "अगला:" },
  right: { en: "right", hi: "सही" },
} as const satisfies Record<string, Words>;

export function WasteSorterView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SortState;
  const next = nextOf(s);
  const queue = s.items.filter((i) => !s.placed.some((p) => p.item === i));
  const inBin = (bin: Bin) => s.placed.filter((p) => p.bin === bin);
  return (
    <div class="ev ev-sort">
      <Frame w={W} h={H} width={width} label={describeSorter(s)} cls="ev-sort-svg">
        <rect class="ev-bg" x={0} y={0} width={W} height={H} />
        <g data-part={SortPart.Queue}>
          {next !== null && <Label x={10} y={18} text={say(locale, WORDS.next)} cls="is-dim" />}
          {queue.map((item, i) => {
            const x = 10 + i * 38;
            return (
              <g key={item}>
                <rect
                  class={`ev-sort-card${i === 0 ? " is-next" : ""}`}
                  x={x}
                  y={24}
                  width={34}
                  height={34}
                  rx={6}
                />
                <g transform={`translate(${x + 17} 41) scale(0.8)`}>
                  <WasteIcon item={item} />
                </g>
              </g>
            );
          })}
          {next !== null && (
            <Label x={10} y={72} text={say(locale, WASTE_WORDS[next])} cls="is-big" />
          )}
          {next === null && (
            <Label
              x={160}
              y={46}
              text={`${rightOf(s)} / ${s.items.length} ${say(locale, WORDS.right)}`}
              anchor="middle"
              cls={rightOf(s) === s.items.length ? "is-big is-good" : "is-big is-bad"}
            />
          )}
        </g>
        <g data-part={SortPart.Bins}>
          {[Bin.Bio, Bin.NonBio].map((bin, b) => {
            const x0 = b === 0 ? 8 : 164;
            return (
              <g key={bin}>
                <path
                  class={`ev-sort-bin ${bin === Bin.Bio ? "is-wet" : "is-dry"}`}
                  d={`M${x0} 92 L${x0 + 148} 92 L${x0 + 140} 194 L${x0 + 8} 194 Z`}
                />
                <Label
                  x={x0 + 74}
                  y={108}
                  text={say(locale, bin === Bin.Bio ? WORDS.bio : WORDS.nonBio)}
                  anchor="middle"
                />
                {inBin(bin).map((p, i) => {
                  const cx = x0 + 28 + (i % 4) * 32;
                  const cy = 132 + Math.floor(i / 4) * 34;
                  const isRight = binOf(p.item) === p.bin;
                  return (
                    <g key={p.item}>
                      <g transform={`translate(${cx} ${cy}) scale(0.7)`}>
                        <WasteIcon item={p.item} />
                      </g>
                      {s.showFeedback && (
                        <text
                          class={isRight ? "ev-tick is-good" : "ev-tick is-bad"}
                          x={cx + 9}
                          y={cy - 6}
                        >
                          {isRight ? "✓" : "✗"}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </Frame>
      {s.canSort && (
        <Controls>
          <span class="ev-row" data-part={SortPart.Buttons}>
            {next !== null ? (
              <>
                <Button
                  label={say(locale, WORDS.toBio)}
                  onClick={() => call(SortAction.Put, { bin: Bin.Bio })}
                />
                <Button
                  label={say(locale, WORDS.toNon)}
                  onClick={() => call(SortAction.Put, { bin: Bin.NonBio })}
                />
              </>
            ) : (
              <Button label={say(locale, WORDS.again)} onClick={() => call(SortAction.Reset, {})} />
            )}
          </span>
        </Controls>
      )}
    </div>
  );
}
