import type { Locale } from "@chalk/content";
import type { PropView } from "@chalk/player";
import { type FramePixels, shows } from "@chalk/prop";
import { Mistake, crowd } from "./crowd";
import { drawing } from "./layer-view";
import { unitOf } from "./plane-view";
import { WORDS, pair, word } from "./words";

type CrowdView = PropView<typeof crowd>;

/** Each mistake's class: its colour, from the look's categories (styles.css). */
const TONE: Record<Mistake, string> = {
  [Mistake.None]: "is-none",
  [Mistake.Swapped]: "is-swapped",
  [Mistake.Sign]: "is-sign",
  [Mistake.OffByOne]: "is-off",
};

const NAME: Record<Mistake, typeof WORDS.right> = {
  [Mistake.None]: WORDS.crowdRight,
  [Mistake.Swapped]: WORDS.crowdSwapped,
  [Mistake.Sign]: WORDS.crowdSign,
  [Mistake.OffByOne]: WORDS.crowdOff,
};

/** How high above its point a person starts falling in, in the plane's units. */
const FALL = 1.6;

/** Everyone, as dots: falling in, where they are now, lit or faded by their mistake. */
function People({ s, px, locale }: { s: CrowdView; px: FramePixels; locale: Locale }) {
  const r = Math.max(4, Math.min(8, unitOf(px) * 0.16));
  const helped = s.helped === null ? undefined : s.people[s.helped];
  const isOne = s.together > 0.98;
  const [gx, gy] = px.toPx(s.gatherAt.x, s.gatherAt.y);
  return (
    <g class="cp-crowd" {...shows("crowd", s.people.length, `${s.people.length} people`)}>
      {s.people.map((p, i) =>
        p.trail.length < 2 ? null : (
          <polyline
            key={`trail${i}`}
            class={`cp-person-trail ${s.isMarked ? TONE[p.mistake] : ""}`}
            points={p.trail.map((q) => px.toPx(q.x, q.y).join(",")).join(" ")}
          />
        ),
      )}
      {s.people.map((p, i) => {
        if (p.landed <= 0) return null;
        const [x, y] = px.toPx(p.at.x, p.at.y + FALL * (1 - p.landed) ** 2);
        const isFaded = s.lit !== null && p.mistake !== s.lit;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={isOne ? r * 1.8 : r}
            opacity={p.landed * (isFaded ? 0.25 : 1)}
            class={`cp-person ${s.isMarked ? TONE[p.mistake] : ""} ${p.isHome ? "is-home" : ""}`}
          />
        );
      })}
      {isOne && s.gatherName !== null && (
        <text class="cp-crowd-name" x={gx} y={gy - r * 3} text-anchor="middle">
          {word(s.gatherName, locale)}
        </text>
      )}
      {helped !== undefined && (
        <g
          class="cp-firefly"
          transform={`translate(${px.toPx(helped.at.x, helped.at.y).join(", ")})`}
          {...shows("helper", pair(helped.at))}
        >
          <circle class="cp-firefly-glow" r={r * 3.2} cx={r * 2.2} cy={-r * 2.2} />
          <circle class="cp-firefly-body" r={r * 0.8} cx={r * 2.2} cy={-r * 2.2} />
        </g>
      )}
    </g>
  );
}

/** Which colour is which mistake, once they are marked. */
function Key({ s, locale }: { s: CrowdView; locale: Locale }) {
  if (!s.isMarked) return null;
  const kinds = [Mistake.None, Mistake.Swapped, Mistake.Sign, Mistake.OffByOne].filter(
    (m) => s.mix[m] > 0,
  );
  return (
    <p class="cp-line cp-crowd-key" {...shows("key", kinds.join(", "))}>
      {kinds.map((m) => (
        <span
          key={m}
          class={`cp-crowd-kind ${TONE[m]} ${s.lit !== null && s.lit !== m ? "is-faded" : ""}`}
        >
          {word(NAME[m], locale)}
        </span>
      ))}
    </p>
  );
}

/** The crowd's drawing: its dots on the plane, and under it what each colour means. */
export const crowdDrawing = drawing(crowd, {
  front: ({ s, px, locale }) => <People s={s} px={px} locale={locale} />,
  below: ({ s, locale }) => <Key s={s} locale={locale} />,
});
