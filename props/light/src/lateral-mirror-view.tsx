import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import {
  Hand,
  LM_LAYOUT,
  LM_PICTURE,
  LateralMirrorAction,
  type LateralMirrorState,
  LateralWord,
  Writing,
  printed,
  reflectionRaises,
  reflectionReads,
} from "./lateral-mirror";

const W = LM_PICTURE.width;
const H = LM_PICTURE.height;

type Words = { en: string; hi: string };
const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

const LABELS = {
  word: { en: "On the T-shirt", hi: "टी-शर्ट पर" },
  hand: { en: "Riya's hands", hi: "रिया के हाथ" },
  print: { en: "Print the word", hi: "शब्द छापो" },
  right: { en: "Raise right hand", hi: "दायाँ हाथ उठाओ" },
  left: { en: "Raise left hand", hi: "बायाँ हाथ उठाओ" },
  none: { en: "Hands down", hi: "हाथ नीचे" },
  normal: { en: "Normally", hi: "सीधा" },
  mirrored: { en: "Back to front", hi: "उल्टा" },
} as const;

/**
 * Riya from the front, feet at the origin. Her own right is the viewer's left (−x). A clip in her
 * hair on her left side makes the flip easy to see.
 */
function Figure({ s }: { s: LateralMirrorState }): JSX.Element {
  const shoulderY = -102;
  const arm = (side: -1 | 1, up: boolean) => {
    const sx = side * 24;
    const hand: [number, number] = up ? [side * 34, -150] : [side * 33, -58];
    return (
      <g class={up ? "lm-arm is-up" : "lm-arm"}>
        <line x1={sx} y1={shoulderY + 4} x2={hand[0]} y2={hand[1]} />
        <circle class="lm-hand" cx={hand[0]} cy={hand[1]} r={5} />
      </g>
    );
  };
  const size = s.word === LateralWord.Ambulance ? 7.2 : 15;
  return (
    <g>
      {/* legs */}
      <rect class="lm-legs" x={-17} y={-50} width={14} height={50} rx={4} />
      <rect class="lm-legs" x={3} y={-50} width={14} height={50} rx={4} />
      {/* her right arm (viewer's left) and left arm */}
      {arm(-1, s.raised === Hand.Right)}
      {arm(1, s.raised === Hand.Left)}
      {/* T-shirt */}
      <rect class="lm-shirt" x={-29} y={shoulderY} width={58} height={56} rx={12} />
      <g transform={s.writing === Writing.Mirrored ? "scale(-1 1)" : undefined}>
        <text class="lm-word" x={0} y={-68} text-anchor="middle" font-size={size}>
          {s.word}
        </text>
      </g>
      {/* head, hair, ponytail on her right, a clip on her left */}
      <rect class="lm-skin" x={-5} y={-112} width={10} height={12} />
      <path class="lm-hair-line" d="M-14 -138 q -14 10 -12 30" />
      <circle class="lm-skin" cx={0} cy={-126} r={16} />
      <path class="lm-hair" d="M-16 -128 a 16 16 0 0 1 32 0 q -8 -8 -16 -6 q -8 -2 -16 6 z" />
      <path class="lm-clip" d="M10 -139 l 3 -4 l 3 4 l -3 4 z" />
      <circle class="lm-eye" cx={-5.5} cy={-125} r={1.8} />
      <circle class="lm-eye" cx={5.5} cy={-125} r={1.8} />
      <path class="lm-smile" d="M-5 -118 q 5 4 10 0" />
    </g>
  );
}

/** Riya, a big mirror, and her flipped image in it; buttons below to change things. */
export function LateralMirrorView({ view, width, call, locale }: PropViewProps): JSX.Element {
  // The player hands each view its own prop's state, already checked against its schema.
  const s = view as unknown as LateralMirrorState;
  const id = useId();
  const clip = `lm-clip-${id}`;
  const k = width / W;
  const height = Math.round(H * k);
  const m = LM_LAYOUT.mirror;
  const image = reflectionRaises(s);
  const label = `Riya in front of a mirror; her T-shirt says ${printed(s)}. In the mirror the word reads ${reflectionReads(s)}${image === Hand.None ? "" : `, and her image raises its ${image} hand`}.`;
  const button = (pressed: boolean, words: Words, onClick: () => void, part: string) => (
    <button
      type="button"
      class={pressed ? "lm-button is-on" : "lm-button"}
      aria-pressed={pressed}
      data-part={part}
      onClick={onClick}
    >
      {say(locale, words)}
    </button>
  );
  return (
    <div class="lm">
      <Stage label={label} x={[0, W]} width={width} height={height} svg={{ class: "lm-svg" }}>
        <g transform={`scale(${k})`}>
          <rect class="lm-room" x={0} y={0} width={W} height={H} />
          <rect
            class="lm-floor"
            x={0}
            y={LM_LAYOUT.feetY - 4}
            width={W}
            height={H - LM_LAYOUT.feetY + 4}
          />
          {/* the mirror and, in it, Riya flipped left to right */}
          <rect
            class="lm-frame"
            x={m.x - 5}
            y={m.y - 5}
            width={m.width + 10}
            height={m.height + 10}
            rx={8}
          />
          <rect class="lm-glass" x={m.x} y={m.y} width={m.width} height={m.height} rx={4} />
          <clipPath id={clip}>
            <rect x={m.x} y={m.y} width={m.width} height={m.height} rx={4} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            <rect class="lm-floor-in" x={m.x} y={LM_LAYOUT.feetY - 4} width={m.width} height={H} />
            <g
              class="lm-image"
              transform={`translate(${LM_LAYOUT.imageX} ${LM_LAYOUT.feetY}) scale(-1 1)`}
            >
              <Figure s={s} />
            </g>
            <path
              class="lm-shine"
              d={`M${m.x + 12} ${m.y + 26} l 18 -16 M${m.x + 12} ${m.y + 44} l 34 -30`}
            />
          </g>
          {/* Riya */}
          <g data-part="riya" transform={`translate(${LM_LAYOUT.riyaX} ${LM_LAYOUT.feetY})`}>
            <Figure s={s} />
          </g>
        </g>
      </Stage>
      <div class="lm-controls" data-part="controls">
        <div class="lm-row">
          <span class="lm-label">{say(locale, LABELS.word)}</span>
          {button(
            s.word === LateralWord.Riya,
            { en: "RIYA", hi: "RIYA" },
            () => call(LateralMirrorAction.SetWord, { word: LateralWord.Riya }),
            "word-riya",
          )}
          {button(
            s.word === LateralWord.Ambulance,
            { en: "AMBULANCE", hi: "AMBULANCE" },
            () => call(LateralMirrorAction.SetWord, { word: LateralWord.Ambulance }),
            "word-ambulance",
          )}
        </div>
        <div class="lm-row">
          <span class="lm-label">{say(locale, LABELS.hand)}</span>
          {button(
            s.raised === Hand.Right,
            LABELS.right,
            () => call(LateralMirrorAction.Raise, { hand: Hand.Right }),
            "raise-right",
          )}
          {button(
            s.raised === Hand.Left,
            LABELS.left,
            () => call(LateralMirrorAction.Raise, { hand: Hand.Left }),
            "raise-left",
          )}
          {button(
            s.raised === Hand.None,
            LABELS.none,
            () => call(LateralMirrorAction.Raise, { hand: Hand.None }),
            "raise-none",
          )}
        </div>
        <div class="lm-row">
          <span class="lm-label">{say(locale, LABELS.print)}</span>
          {button(
            s.writing === Writing.Normal,
            LABELS.normal,
            () => call(LateralMirrorAction.SetWriting, { writing: Writing.Normal }),
            "print-normal",
          )}
          {button(
            s.writing === Writing.Mirrored,
            LABELS.mirrored,
            () => call(LateralMirrorAction.SetWriting, { writing: Writing.Mirrored }),
            "print-mirrored",
          )}
        </div>
      </div>
    </div>
  );
}
