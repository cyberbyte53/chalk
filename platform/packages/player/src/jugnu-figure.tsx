import type { JSX } from "preact";

/**
 * Jugnu himself, drawn in the look's colours. His mood says what he is doing: the app sets the
 * moods for what it knows (thinking, listening, reading, sleepy, celebrate), his replies set the
 * rest (hint, curious, gentle, proud).
 */
export const JugnuMood = {
  Neutral: "neutral",
  Listening: "listening",
  Reading: "reading",
  Thinking: "thinking",
  Hint: "hint",
  Curious: "curious",
  Gentle: "gentle",
  Proud: "proud",
  Celebrate: "celebrate",
  Sleepy: "sleepy",
} as const;
export type JugnuMood = (typeof JugnuMood)[keyof typeof JugnuMood];

type Face = {
  /** Where his pupils look, from centre. */
  look?: [number, number];
  eyes?: "round" | "happy" | "closed";
  browL: string;
  browR: string;
  mouth: string;
  isMouthFilled?: boolean;
  arms: [string, string];
  /** How high he bobs (px) and how long one bob takes (s). */
  bob: number;
  bobSeconds: number;
  tilt?: number;
  cheek?: number;
  isCurlFaded?: boolean;
};

const REST: [string, string] = ["M36 144 Q26 158 34 170", "M164 144 Q174 158 166 170"];

const FACES: Record<JugnuMood, Face> = {
  neutral: {
    look: [2, 2],
    browL: "M62 100 L90 102",
    browR: "M110 98 Q123 89 138 96",
    mouth: "M88 158 Q100 168 112 158",
    arms: REST,
    bob: -3,
    bobSeconds: 3,
  },
  thinking: {
    look: [5, -6],
    browL: "M62 98 Q76 91 90 97",
    browR: "M110 97 Q124 90 138 96",
    mouth: "M95 160 Q100 155 105 160 Q100 165 95 160 Z",
    isMouthFilled: true,
    arms: [REST[0], "M162 148 Q150 170 128 172"],
    bob: -5,
    bobSeconds: 1.8,
  },
  hint: {
    browL: "M62 99 Q76 90 90 98",
    browR: "M110 98 Q124 90 138 99",
    mouth: "M86 155 Q100 172 114 155",
    arms: [REST[0], "M162 136 Q182 114 176 96"],
    bob: -4,
    bobSeconds: 1.4,
  },
  celebrate: {
    eyes: "happy",
    browL: "M62 96 Q76 88 90 95",
    browR: "M110 95 Q124 88 138 96",
    mouth: "M84 152 Q100 180 116 152 Z",
    isMouthFilled: true,
    arms: ["M40 118 Q22 94 30 76", "M160 118 Q178 94 170 76"],
    bob: -14,
    bobSeconds: 0.7,
    cheek: 0.45,
  },
  curious: {
    look: [0, -2],
    browL: "M60 94 Q75 85 90 93",
    browR: "M110 93 Q125 85 140 94",
    mouth: "M90 157 Q100 167 110 157",
    arms: REST,
    bob: -3,
    bobSeconds: 2.2,
    tilt: 8,
  },
  sleepy: {
    eyes: "closed",
    browL: "M64 108 L90 110",
    browR: "M110 110 L136 108",
    mouth: "M94 162 Q100 166 106 162",
    arms: REST,
    bob: 3,
    bobSeconds: 4,
    isCurlFaded: true,
    cheek: 0.15,
    tilt: -5,
  },
  proud: {
    eyes: "happy",
    browL: "M62 98 Q76 92 90 98",
    browR: "M110 98 Q124 92 138 98",
    mouth: "M84 154 Q100 172 116 154",
    arms: ["M38 152 Q18 140 42 128", "M162 152 Q182 140 158 128"],
    bob: -3,
    bobSeconds: 2,
    cheek: 0.45,
  },
  listening: {
    look: [-5, 0],
    browL: "M62 98 Q76 92 90 98",
    browR: "M110 98 Q124 92 138 98",
    mouth: "M90 158 Q100 165 110 158",
    arms: REST,
    bob: -2,
    bobSeconds: 2.6,
    tilt: -8,
  },
  gentle: {
    look: [0, 4],
    browL: "M62 104 Q76 101 90 95",
    browR: "M110 95 Q124 101 138 104",
    mouth: "M90 163 Q100 158 110 163",
    arms: [REST[0], "M162 146 Q184 152 188 138"],
    bob: -2,
    bobSeconds: 3.2,
  },
  reading: {
    look: [0, 7],
    browL: "M62 102 L90 100",
    browR: "M110 100 L138 102",
    mouth: "M94 160 L106 160",
    arms: ["M36 150 Q40 174 70 174", "M164 150 Q160 174 130 174"],
    bob: -2,
    bobSeconds: 2.4,
  },
};

const INK = "var(--color-on-surface)";
const BODY = "var(--brand-jugnu-body)";
const CURL = "var(--brand-jugnu-curl)";
const WHITE = "var(--color-surface)";
const SOFT = "var(--color-on-surface-variant)";

function Eyes({ face }: { face: Face }): JSX.Element {
  if (face.eyes === "happy") {
    return (
      <path
        d="M62 128 Q78 110 94 128 M106 128 Q122 110 138 128"
        fill="none"
        stroke={INK}
        stroke-width={5}
        stroke-linecap="round"
      />
    );
  }
  if (face.eyes === "closed") {
    return (
      <path
        d="M62 124 Q78 134 94 124 M106 124 Q122 134 138 124"
        fill="none"
        stroke={INK}
        stroke-width={5}
        stroke-linecap="round"
      />
    );
  }
  const [dx, dy] = face.look ?? [0, 0];
  const blink = "18;18;1;18;18";
  return (
    <g>
      {[78, 122].map((cx) => (
        <ellipse
          key={cx}
          cx={cx}
          cy={124}
          rx={18}
          ry={18}
          fill={WHITE}
          stroke={INK}
          stroke-width={3.5}
        >
          <animate
            attributeName="ry"
            values={blink}
            keyTimes="0;0.9;0.94;0.98;1"
            dur="4.2s"
            repeatCount="indefinite"
          />
        </ellipse>
      ))}
      <g>
        <animate
          attributeName="opacity"
          values="1;1;0;1;1"
          keyTimes="0;0.9;0.94;0.98;1"
          dur="4.2s"
          repeatCount="indefinite"
        />
        <circle cx={78 + dx} cy={124 + dy} r={8.5} fill={INK} />
        <circle cx={122 + dx} cy={124 + dy} r={8.5} fill={INK} />
        <circle cx={75 + dx} cy={121 + dy} r={2.8} fill={WHITE} />
        <circle cx={119 + dx} cy={121 + dy} r={2.8} fill={WHITE} />
      </g>
    </g>
  );
}

/** Things around him that belong to a mood: a light bulb glow, a question mark, confetti, z's. */
function Extras({ mood }: { mood: JugnuMood }): JSX.Element | null {
  switch (mood) {
    case JugnuMood.Hint:
      return (
        <path
          d="M146 20 l9 -8 M150 38 l12 0 M124 12 l1 -10"
          stroke={CURL}
          stroke-width={4}
          stroke-linecap="round"
        >
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.4s" repeatCount="indefinite" />
        </path>
      );
    case JugnuMood.Curious:
      return (
        <text
          x={166}
          y={70}
          font-family="var(--font-display)"
          font-size={34}
          font-weight={800}
          fill="var(--color-primary)"
        >
          ?
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.2;0.8;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </text>
      );
    case JugnuMood.Celebrate:
      return (
        <g>
          <circle cx={26} cy={54} r={5} fill={CURL}>
            <animate attributeName="cy" values="54;40;54" dur="0.7s" repeatCount="indefinite" />
          </circle>
          <circle cx={176} cy={46} r={5} fill="var(--color-primary)">
            <animate attributeName="cy" values="46;30;46" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    case JugnuMood.Sleepy:
      return (
        <text
          x={150}
          y={64}
          font-family="var(--font-display)"
          font-size={24}
          font-weight={800}
          fill={SOFT}
        >
          z
          <animate attributeName="y" values="70;44" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" />
        </text>
      );
    case JugnuMood.Proud:
      return (
        <path
          d="M34 50 C35 58 38 61 46 62 C38 63 35 66 34 74 C33 66 30 63 22 62 C30 61 33 58 34 50 Z"
          fill={CURL}
        >
          <animate attributeName="opacity" values="0.2;1;0.2" dur="1.6s" repeatCount="indefinite" />
        </path>
      );
    case JugnuMood.Listening:
      return (
        <g>
          <rect
            x={10}
            y={40}
            width={58}
            height={30}
            rx={15}
            fill={WHITE}
            stroke={INK}
            stroke-width={3.5}
          />
          {[26, 39, 52].map((cx, i) => (
            <circle key={cx} cx={cx} cy={55} r={4} fill={INK}>
              <animate
                attributeName="opacity"
                values="0.2;1;0.2"
                dur="1.2s"
                begin={`${i * 0.2}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
      );
    default:
      return null;
  }
}

/** Jugnu at `size` px tall, in a mood. Decorative: the button or panel around him says who he is. */
export function JugnuFigure({
  mood = JugnuMood.Neutral,
  size,
}: { mood?: JugnuMood; size: number }): JSX.Element {
  const face = FACES[mood];
  const cheek = face.cheek ?? 0.28;
  return (
    <svg
      class={`jugnu-figure is-${mood}`}
      viewBox="0 0 200 220"
      width={(size * 200) / 220}
      height={size}
      aria-hidden="true"
    >
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values={`0 0;0 ${face.bob};0 0`}
          dur={`${face.bobSeconds}s`}
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          keyTimes="0;0.5;1"
        />
        <g transform={`rotate(${face.tilt ?? 0} 100 140)`}>
          <ellipse cx={80} cy={204} rx={15} ry={7} fill={BODY} stroke={INK} stroke-width={4} />
          <ellipse cx={120} cy={204} rx={15} ry={7} fill={BODY} stroke={INK} stroke-width={4} />
          <path d={face.arms[0]} fill="none" stroke={INK} stroke-width={6} stroke-linecap="round" />
          <path d={face.arms[1]} fill="none" stroke={INK} stroke-width={6} stroke-linecap="round" />
          {mood === JugnuMood.Hint && (
            <circle cx={120} cy={42} r={30} fill="var(--brand-jugnu)" opacity={0.35}>
              <animate
                attributeName="opacity"
                values="0.15;0.55;0.15"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          <ellipse cx={100} cy={136} rx={66} ry={68} fill={BODY} stroke={INK} stroke-width={4.5} />
          <path
            d="M100 70 C96 48 104 28 122 28 C136 28 140 44 130 50 C122 55 114 48 118 41"
            fill="none"
            stroke={CURL}
            stroke-width={9}
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity={face.isCurlFaded === true ? 0.45 : 1}
          />
          <circle cx={62} cy={150} r={9} fill={CURL} opacity={cheek} />
          <circle cx={138} cy={150} r={9} fill={CURL} opacity={cheek} />
          <path d={face.browL} fill="none" stroke={INK} stroke-width={4.5} stroke-linecap="round" />
          <path d={face.browR} fill="none" stroke={INK} stroke-width={4.5} stroke-linecap="round" />
          <Eyes face={face} />
          <path
            d={face.mouth}
            fill={face.isMouthFilled === true ? INK : "none"}
            stroke={INK}
            stroke-width={4}
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          {mood === JugnuMood.Reading && (
            <g>
              <rect
                x={66}
                y={150}
                width={68}
                height={48}
                rx={4}
                fill={WHITE}
                stroke={INK}
                stroke-width={3.5}
                transform="rotate(-4 100 174)"
              />
              <path
                d="M76 162 l40 -2 M76 172 l46 -2 M76 182 l30 -1"
                stroke={SOFT}
                stroke-width={3}
                stroke-linecap="round"
              />
            </g>
          )}
        </g>
      </g>
      <Extras mood={mood} />
    </svg>
  );
}
