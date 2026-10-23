import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Button, Controls, Frame, type Words, say, tappable } from "./draw";
import { NOTES } from "./elements";
import {
  DOUBLE_SLOTS,
  OCTAVE_ROWS,
  OctaveAction,
  OctavePart,
  type OctaveState,
  columnOf,
  describeOctaves,
  isPastCalcium,
} from "./octaves";

const W = 320;
const LEFT = 8;
const COL = (W - 2 * LEFT) / 7;
const HEAD = 34;
const ROW = 25;
const H = HEAD + OCTAVE_ROWS.length * ROW + 26;

const WORDS = {
  breaks: { en: "Where it breaks", hi: "कहाँ टूटता है" },
  hide: { en: "Hide breaks", hi: "छिपाओ" },
  tap: { en: "Tap a note to light its column.", hi: "किसी स्वर पर टैप करो, उसका स्तंभ चमकेगा।" },
  column: { en: "Under this note:", hi: "इस स्वर के नीचे:" },
  pastCa: {
    en: "After calcium, every eighth element is no longer alike.",
    hi: "कैल्शियम के बाद हर आठवाँ तत्व एक जैसा नहीं रहता।",
  },
  far: { en: "alike, but far apart", hi: "एक जैसे, पर दूर" },
  and: { en: "and", hi: "और" },
} as const satisfies Record<string, Words>;

const cx = (note: number) => LEFT + COL * note + COL / 2;
const cy = (row: number) => HEAD + ROW * row + ROW / 2;

function slotText(x: string, locale: string): string {
  return x.includes("/") ? x.replace("/", ` ${say(locale, WORDS.and)} `) : x;
}

export function OctavesView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as OctaveState;
  return (
    <div class="pt pt-octaves">
      <Frame w={W} h={H} width={width} label={describeOctaves(s)} cls="pt-octave-svg">
        <rect class="pt-bg" x={0} y={0} width={W} height={H} />
        {s.note !== null && (
          <rect
            class="pt-lit-col"
            x={LEFT + COL * s.note + 2}
            y={4}
            width={COL - 4}
            height={H - 8}
            rx={8}
          />
        )}
        <g data-part={OctavePart.Notes}>
          {NOTES.map((n, i) => (
            <g
              key={n.en}
              class={s.canPick ? "pt-note is-tappable" : "pt-note"}
              {...tappable(s.canPick, () => call(OctaveAction.PickNote, { note: i }), n.en)}
            >
              <rect
                class={i === s.note ? "pt-note-chip is-on" : "pt-note-chip"}
                x={LEFT + COL * i + 4}
                y={8}
                width={COL - 8}
                height={20}
                rx={10}
              />
              <text class="pt-note-text" x={cx(i)} y={22} text-anchor="middle">
                {locale === "hi" ? n.hi : (n.en.split(" ")[0] as string)}
              </text>
            </g>
          ))}
        </g>
        <g data-part={OctavePart.Table}>
          {OCTAVE_ROWS.map((row, r) =>
            row.map((x, c) => {
              if (x === "") return null;
              const broken = s.showBreaks && isPastCalcium(r, c);
              const isDouble = (DOUBLE_SLOTS as readonly string[]).includes(x);
              const isKin = s.showBreaks && (x === "Fe" || x === "Co/Ni");
              return (
                <g key={`${r}-${x}`}>
                  <rect
                    class={`pt-slot${broken ? " is-broken" : ""}${s.showBreaks && isDouble ? " is-double" : ""}${isKin ? " is-kin" : ""}`}
                    x={LEFT + COL * c + 3}
                    y={HEAD + ROW * r + 2}
                    width={COL - 6}
                    height={ROW - 4}
                    rx={5}
                  />
                  <text
                    class={x.includes("/") ? "pt-slot-text is-small" : "pt-slot-text"}
                    x={cx(c)}
                    y={cy(r) + 4}
                    text-anchor="middle"
                  >
                    {x.replace("/", ", ")}
                  </text>
                </g>
              );
            }),
          )}
        </g>
        {s.showBreaks && (
          <g data-part={OctavePart.Breaks}>
            <text class="pt-far-text" x={W / 2} y={H - 9} text-anchor="middle">
              {`Fe · Co, Ni: ${say(locale, WORDS.far)}`}
            </text>
          </g>
        )}
      </Frame>
      <p class="pt-caption">
        {s.note === null
          ? say(locale, WORDS.tap)
          : `${say(locale, WORDS.column)} ${columnOf(s.note)
              .map((x) => slotText(x, locale))
              .join(", ")}`}
        {s.showBreaks && <span class="pt-caption-warn">{` ${say(locale, WORDS.pastCa)}`}</span>}
      </p>
      {(s.canPick || s.canShowBreaks) && (
        <Controls>
          {s.canShowBreaks && (
            <span data-part={OctavePart.Toggle}>
              <Button
                label={say(locale, s.showBreaks ? WORDS.hide : WORDS.breaks)}
                isOn={s.showBreaks}
                onClick={() => call(OctaveAction.ShowBreaks, { isOn: !s.showBreaks })}
              />
            </span>
          )}
        </Controls>
      )}
    </div>
  );
}
