import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { type Words, say } from "./draw";
import {
  COIL_DAYS,
  MAX_DAYS,
  PlantAction,
  PlantKind,
  PlantPart,
  type PlantState,
  Side,
  TUBE_DAYS,
  describePlant,
  plantCaption,
  shadySide,
} from "./plants";

const W = 320;
const H = 200;

const WORDS = {
  grow: { en: "Grow one day", hi: "एक दिन बढ़ाओ" },
  day: { en: "day", hi: "दिन" },
  lightLeft: { en: "Light from left", hi: "प्रकाश बाएँ से" },
  lightRight: { en: "Light from right", hi: "प्रकाश दाएँ से" },
  waterLeft: { en: "Water on left", hi: "पानी बाएँ" },
  waterRight: { en: "Water on right", hi: "पानी दाएँ" },
  turn: { en: "Lay the pot on its side", hi: "गमले को करवट लिटाओ" },
  touch: { en: "Touch a leaf", hi: "पत्ती को छुओ" },
  recover: { en: "Wait a while", hi: "थोड़ी देर रुको" },
  again: { en: "Start again", hi: "फिर से शुरू" },
  shoot: { en: "shoot", hi: "प्ररोह" },
  root: { en: "root", hi: "जड़" },
  light: { en: "light", hi: "प्रकाश" },
  water: { en: "water", hi: "पानी" },
  auxin: { en: "auxin (shady side)", hi: "ऑक्सिन (छाया वाली ओर)" },
  box: { en: "box, open on one side", hi: "एक ओर से खुला डिब्बा" },
  gravity: { en: "gravity ↓", hi: "गुरुत्व ↓" },
  stick: { en: "stick", hi: "डंडी" },
  tendril: { en: "tendril", hi: "प्रतान" },
  pollen: { en: "pollen grain", hi: "परागकण" },
  stigma: { en: "stigma", hi: "वर्तिकाग्र" },
  tube: { en: "pollen tube", hi: "पराग नलिका" },
  ovule: { en: "ovule", hi: "बीजांड" },
  ovary: { en: "ovary", hi: "अंडाशय" },
  message: { en: "message spreads", hi: "संदेश फैलता है" },
} as const satisfies Record<string, Words>;

type Pt = [number, number];

/** Points of a stem grown piece by piece: angles clockwise from up, the first piece short. */
function grown(from: Pt, angles: readonly number[], first: number, each: number): Pt[] {
  const pts: Pt[] = [from];
  let [x, y] = from;
  angles.forEach((a, i) => {
    const len = i === 0 ? first : each;
    const r = (a * Math.PI) / 180;
    x += Math.sin(r) * len;
    y -= Math.cos(r) * len;
    pts.push([x, y]);
  });
  return pts;
}
/** A smooth path through the points (quadratic curves through the midpoints). */
function smooth(pts: readonly Pt[]): string {
  if (pts.length < 2) return "";
  const [first, ...rest] = pts;
  if (first === undefined) return "";
  let d = `M${first[0].toFixed(1)} ${first[1].toFixed(1)}`;
  for (let i = 0; i < rest.length - 1; i++) {
    const p = rest[i] as Pt;
    const q = rest[i + 1] as Pt;
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`;
  }
  const end = rest[rest.length - 1] as Pt;
  d += ` L${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  return d;
}
const tipOf = (pts: readonly Pt[]): Pt => pts[pts.length - 1] ?? [0, 0];

function Leaf({ at, angle }: { at: Pt; angle: number }): JSX.Element {
  return (
    <ellipse
      class="cp-leaf"
      cx={at[0]}
      cy={at[1]}
      rx={7}
      ry={3.2}
      transform={`rotate(${angle} ${at[0]} ${at[1]})`}
    />
  );
}

function Sun({ x, y }: { x: number; y: number }): JSX.Element {
  return (
    <g class="cp-sun">
      <circle cx={x} cy={y} r={11} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={x + Math.cos(r) * 14}
            y1={y + Math.sin(r) * 14}
            x2={x + Math.cos(r) * 19}
            y2={y + Math.sin(r) * 19}
          />
        );
      })}
    </g>
  );
}

/** Shoot and root drawn from a seed, with a pair of leaves at the shoot's tip. */
function Seedling({
  seed,
  s,
  rootEach,
}: {
  seed: Pt;
  s: PlantState;
  rootEach: number;
}): JSX.Element {
  const shoot = grown([seed[0], seed[1] - 3], s.shoot, 10, 16);
  const root = grown([seed[0], seed[1] + 3], s.root, 8, rootEach);
  const tip = tipOf(shoot);
  const lastA = s.shoot[s.shoot.length - 1] ?? 0;
  return (
    <g data-part={PlantPart.Plant}>
      <path class="cp-root" d={smooth(root)} />
      <path class="cp-shoot" d={smooth(shoot)} />
      <Leaf at={[tip[0] - 6, tip[1]]} angle={lastA - 30} />
      <Leaf at={[tip[0] + 6, tip[1]]} angle={lastA + 30} />
      <ellipse class="cp-seed" cx={seed[0]} cy={seed[1]} rx={7} ry={5} />
    </g>
  );
}

function Phototropism({ s, locale }: { s: PlantState; locale: string }): JSX.Element {
  const left = s.side === Side.Left;
  const seed: Pt = [160, 112];
  const shoot = grown([seed[0], seed[1] - 3], s.shoot, 10, 16);
  const tip = tipOf(shoot);
  const prev = shoot[shoot.length - 2] ?? seed;
  const len = Math.hypot(tip[0] - prev[0], tip[1] - prev[1]) || 1;
  // Unit vector along the tip, and the normal pointing to the shady side.
  const ux = (tip[0] - prev[0]) / len;
  const uy = (tip[1] - prev[1]) / len;
  const shadyRight = shadySide(s.side) === Side.Right;
  // The normal to the tip that points to the shady side.
  const flip = -uy > 0 === shadyRight ? 1 : -1;
  const nx = -uy * flip;
  const ny = ux * flip;
  return (
    <g>
      <rect class="cp-room" x={0} y={0} width={W} height={H} />
      {/* the window and the light coming in */}
      <rect class="cp-window" x={left ? 6 : W - 36} y={30} width={30} height={60} rx={3} />
      <Sun x={left ? 21 : W - 21} y={60} />
      <g class="cp-rays" data-part={PlantPart.Stimulus}>
        {[50, 75, 100].map((y) => (
          <line key={y} x1={left ? 40 : W - 40} y1={y - 16} x2={left ? 96 : W - 96} y2={y} />
        ))}
      </g>
      {/* the box, open on the light's side */}
      <path
        class="cp-box"
        d={
          left
            ? "M74 18 L 246 18 L 246 192 L 74 192 M74 18 L74 46 M74 150 L 74 192"
            : "M246 18 L 74 18 L 74 192 L 246 192 M246 18 L246 46 M246 150 L 246 192"
        }
      />
      {/* the flask with water and wire mesh */}
      <path class="cp-flask" d="M150 112 L150 130 L122 186 L198 186 L170 130 L170 112" />
      <path class="cp-water" d="M144 142 L176 142 L196 182 L124 182 Z" />
      <line class="cp-mesh" x1={146} y1={112} x2={174} y2={112} />
      <Seedling seed={seed} s={s} rootEach={9} />
      {s.showAuxin && s.days > 0 && (
        <g class="cp-auxin">
          {[0, 5, 10].map((back) => (
            <circle
              key={back}
              cx={tip[0] - ux * back + nx * 4.5}
              cy={tip[1] - uy * back + ny * 4.5}
              r={2}
            />
          ))}
        </g>
      )}
      {s.showNames && (
        <g class="cp-names">
          <text x={left ? 30 : W - 30} y={110} text-anchor="middle">
            {say(locale, WORDS.light)}
          </text>
          <text x={160} y={32} text-anchor="middle">
            {say(locale, WORDS.box)}
          </text>
          <text x={left ? 186 : 134} y={168} text-anchor={left ? "start" : "end"}>
            {say(locale, WORDS.root)}
          </text>
          {s.showAuxin && s.days > 0 ? (
            <text
              x={tip[0] + (shadyRight ? 10 : -10)}
              y={tip[1] + 14}
              text-anchor={shadyRight ? "start" : "end"}
              class="cp-name-auxin"
            >
              {say(locale, WORDS.auxin)}
            </text>
          ) : (
            <text
              x={tip[0] + (left ? 12 : -12)}
              y={tip[1] + 4}
              text-anchor={left ? "start" : "end"}
            >
              {say(locale, WORDS.shoot)}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

function Geotropism({ s, locale }: { s: PlantState; locale: string }): JSX.Element {
  const seed: Pt = [160, 104];
  return (
    <g>
      <rect class="cp-room" x={0} y={0} width={W} height={H} />
      <rect class="cp-table" x={0} y={186} width={W} height={14} />
      <g transform={`rotate(${s.potAngle} ${seed[0]} ${seed[1]})`}>
        <path class="cp-pot" d="M118 100 L 202 100 L 192 168 L 128 168 Z" />
        <rect class="cp-soil" x={120} y={100} width={80} height={8} rx={2} />
        <path class="cp-soil-in" d="M121 108 L 199 108 L 191 164 L 129 164 Z" />
      </g>
      <Seedling seed={seed} s={s} rootEach={6} />
      {s.showNames && (
        <g class="cp-names">
          <text x={W - 10} y={30} text-anchor="end">
            {say(locale, WORDS.gravity)}
          </text>
        </g>
      )}
    </g>
  );
}

function Hydrotropism({ s, locale }: { s: PlantState; locale: string }): JSX.Element {
  const left = s.side === Side.Left;
  const seed: Pt = [160, 96];
  return (
    <g>
      <rect class="cp-room" x={0} y={0} width={W} height={H} />
      <rect class="cp-ground" x={0} y={92} width={W} height={H - 92} />
      <g data-part={PlantPart.Stimulus}>
        <ellipse class="cp-wet" cx={left ? 60 : W - 60} cy={160} rx={56} ry={30} />
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            class="cp-drop"
            d={`M${(left ? 44 : W - 76) + i * 16} ${150 + (i % 2) * 10} q 4 6 0 9 q -4 -3 0 -9 z`}
          />
        ))}
      </g>
      <Seedling seed={seed} s={s} rootEach={11} />
      {s.showNames && (
        <g class="cp-names">
          <text x={left ? 60 : W - 60} y={128} text-anchor="middle">
            {say(locale, WORDS.water)}
          </text>
        </g>
      )}
    </g>
  );
}

function Tendril({ s, locale }: { s: PlantState; locale: string }): JSX.Element {
  const stick = 196;
  const coils = Math.min(s.days, COIL_DAYS);
  const y0 = 120;
  let coilPath = `M${stick - 4} ${y0}`;
  for (let i = 0; i < coils; i++) {
    const y = y0 - i * 14;
    coilPath += ` C ${stick + 14} ${y - 2}, ${stick + 14} ${y - 10}, ${stick} ${y - 9} C ${stick - 14} ${y - 8}, ${stick - 12} ${y - 14}, ${stick - 4} ${y - 14}`;
  }
  return (
    <g>
      <rect class="cp-room" x={0} y={0} width={W} height={H} />
      <rect class="cp-ground" x={0} y={182} width={W} height={18} />
      <rect class="cp-stick" x={stick - 3} y={16} width={6} height={170} rx={2} />
      <g data-part={PlantPart.Plant}>
        <path class="cp-shoot" d="M70 186 C 72 150, 88 120, 110 104" />
        <Leaf at={[96, 120]} angle={-30} />
        <Leaf at={[84, 146]} angle={20} />
        <path class="cp-tendril" d={`M110 104 C 140 92, 170 ${y0 + 6}, ${stick - 4} ${y0}`} />
        {coils > 0 && <path class="cp-tendril" d={coilPath} />}
      </g>
      {s.showNames && (
        <g class="cp-names">
          <text x={stick + 10} y={30}>
            {say(locale, WORDS.stick)}
          </text>
          <text x={136} y={92} text-anchor="middle">
            {say(locale, WORDS.tendril)}
          </text>
        </g>
      )}
    </g>
  );
}

/** One leaf stalk of the touch-me-not with its pairs of leaflets, open or folded. */
function Frond({
  from,
  angle,
  isFolded,
}: {
  from: Pt;
  angle: number;
  isFolded: boolean;
}): JSX.Element {
  const droop = isFolded ? 28 : 0;
  const a = angle + (angle < 0 ? -droop : droop);
  return (
    <g transform={`rotate(${a} ${from[0]} ${from[1]})`}>
      <line class="cp-stalk" x1={from[0]} y1={from[1]} x2={from[0]} y2={from[1] - 60} />
      {[14, 24, 34, 44, 54].map((d) => (
        <g key={d}>
          <ellipse
            class="cp-leaflet"
            cx={from[0] - (isFolded ? 2 : 7)}
            cy={from[1] - d}
            rx={isFolded ? 2 : 7}
            ry={2.6}
            transform={isFolded ? `rotate(-35 ${from[0] - 2} ${from[1] - d})` : undefined}
          />
          <ellipse
            class="cp-leaflet"
            cx={from[0] + (isFolded ? 2 : 7)}
            cy={from[1] - d}
            rx={isFolded ? 2 : 7}
            ry={2.6}
            transform={isFolded ? `rotate(35 ${from[0] + 2} ${from[1] - d})` : undefined}
          />
        </g>
      ))}
    </g>
  );
}

function TouchMeNot({
  s,
  locale,
  onTouch,
}: {
  s: PlantState;
  locale: string;
  onTouch: () => void;
}): JSX.Element {
  const base: Pt = [160, 150];
  return (
    <g>
      <rect class="cp-room" x={0} y={0} width={W} height={H} />
      <path class="cp-pot" d="M124 150 L 196 150 L 188 196 L 132 196 Z" />
      <rect class="cp-soil" x={126} y={148} width={68} height={6} rx={2} />
      <g
        data-part={PlantPart.Plant}
        class="cp-tap"
        // biome-ignore lint/a11y/useSemanticElements: a <button> can't live inside SVG
        role="button"
        tabIndex={s.canTouch ? 0 : -1}
        aria-label={say(locale, WORDS.touch)}
        onClick={onTouch}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onTouch();
          }
        }}
      >
        <rect class="cp-hit" x={70} y={10} width={180} height={150} />
        <line class="cp-stalk" x1={base[0]} y1={base[1]} x2={base[0]} y2={92} />
        <Frond from={[160, 110]} angle={-50} isFolded={s.isFolded} />
        <Frond from={[160, 98]} angle={45} isFolded={s.isFolded} />
        <Frond from={[160, 92]} angle={-8} isFolded={s.isFolded} />
      </g>
      {s.isFolded && (
        <g class="cp-message">
          <path d="M112 52 L 160 108 L 160 94 L 206 54" />
          {s.showNames && (
            <text x={W - 10} y={20} text-anchor="end">
              {say(locale, WORDS.message)}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

function PollenTube({ s, locale }: { s: PlantState; locale: string }): JSX.Element {
  const grown = Math.min(s.days, TUBE_DAYS) / TUBE_DAYS;
  const top = 34;
  const bottom = 150;
  const end = top + (bottom - top) * grown;
  const reached = s.days >= TUBE_DAYS;
  return (
    <g>
      <rect class="cp-room" x={0} y={0} width={W} height={H} />
      <path class="cp-petal" d="M150 170 C 90 160, 60 120, 70 90 C 110 110, 130 140, 150 170 Z" />
      <path
        class="cp-petal"
        d="M170 170 C 230 160, 260 120, 250 90 C 210 110, 190 140, 170 170 Z"
      />
      <path
        class="cp-pistil"
        d="M146 28 C 146 22, 174 22, 174 28 L 168 34 L 166 128 C 196 134, 196 186, 160 188 C 124 186, 124 134, 154 128 L 152 34 Z"
      />
      <circle class={reached ? "cp-ovule is-reached" : "cp-ovule"} cx={160} cy={158} r={9} />
      {s.days > 0 && <path class="cp-tube" d={`M160 ${top - 4} L 160 ${Math.min(end, 150)}`} />}
      <g class="cp-grain">
        <circle cx={160} cy={top - 8} r={6} />
        <circle class="cp-grain-dot" cx={158} cy={top - 10} r={1.2} />
        <circle class="cp-grain-dot" cx={162} cy={top - 7} r={1.2} />
      </g>
      {s.showNames && (
        <g class="cp-names">
          <text x={170} y={top - 12}>
            {say(locale, WORDS.pollen)}
          </text>
          <text x={140} y={top + 2} text-anchor="end">
            {say(locale, WORDS.stigma)}
          </text>
          {s.days > 0 && (
            <text x={176} y={90}>
              {say(locale, WORDS.tube)}
            </text>
          )}
          <text x={184} y={170}>
            {say(locale, WORDS.ovule)}
          </text>
          <text x={136} y={146} text-anchor="end">
            {say(locale, WORDS.ovary)}
          </text>
        </g>
      )}
    </g>
  );
}

export function PlantMovementView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PlantState;
  const k = width / W;
  const height = Math.round(H * k);
  const clip = `cp-frame-${useId()}`;
  const isTouch = s.kind === PlantKind.TouchMeNot;
  const hasSide = s.kind === PlantKind.Phototropism || s.kind === PlantKind.Hydrotropism;
  const touch = () => {
    if (s.canTouch) call(PlantAction.Touch, {});
  };
  const scene = ((): JSX.Element => {
    switch (s.kind) {
      case PlantKind.TouchMeNot:
        return <TouchMeNot s={s} locale={locale} onTouch={touch} />;
      case PlantKind.Tendril:
        return <Tendril s={s} locale={locale} />;
      case PlantKind.Phototropism:
        return <Phototropism s={s} locale={locale} />;
      case PlantKind.Geotropism:
        return <Geotropism s={s} locale={locale} />;
      case PlantKind.Hydrotropism:
        return <Hydrotropism s={s} locale={locale} />;
      case PlantKind.PollenTube:
        return <PollenTube s={s} locale={locale} />;
    }
  })();
  const sideWords =
    s.kind === PlantKind.Phototropism
      ? { left: WORDS.lightLeft, right: WORDS.lightRight }
      : { left: WORDS.waterLeft, right: WORDS.waterRight };
  return (
    <div class="cp">
      <Stage
        label={describePlant(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "cp-svg" }}
      >
        <g transform={`scale(${k})`}>
          <clipPath id={clip}>
            <rect x={0} y={0} width={W} height={H} rx={10} />
          </clipPath>
          <g clip-path={`url(#${clip})`}>
            {scene}
            {!isTouch && (
              <text class="cp-day" x={10} y={18}>
                {`${say(locale, WORDS.day)} ${s.days}`}
              </text>
            )}
          </g>
        </g>
      </Stage>
      <p class="ctc-caption">{say(locale, plantCaption(s))}</p>
      <div class="ctc-controls">
        {isTouch && s.canTouch && (
          <button
            type="button"
            class="ctc-button is-main"
            data-part={PlantPart.Touch}
            disabled={s.isFolded}
            onClick={touch}
          >
            {say(locale, WORDS.touch)}
          </button>
        )}
        {isTouch && s.isFolded && (
          <button type="button" class="ctc-button" onClick={() => call(PlantAction.Recover, {})}>
            {say(locale, WORDS.recover)}
          </button>
        )}
        {hasSide && s.canSetSide && (
          <div class="ctc-toggle" data-part={PlantPart.Side}>
            {[Side.Left, Side.Right].map((side) => (
              <button
                key={side}
                type="button"
                class={s.side === side ? "ctc-button is-chip is-on" : "ctc-button is-chip"}
                aria-pressed={s.side === side}
                onClick={() => call(PlantAction.SetSide, { side })}
              >
                {say(locale, side === Side.Left ? sideWords.left : sideWords.right)}
              </button>
            ))}
          </div>
        )}
        {s.kind === PlantKind.Geotropism && s.canTurn && s.potAngle === 0 && (
          <button
            type="button"
            class="ctc-button"
            data-part={PlantPart.Turn}
            onClick={() => call(PlantAction.Turn, {})}
          >
            {say(locale, WORDS.turn)}
          </button>
        )}
        {!isTouch && s.canGrow && (
          <button
            type="button"
            class="ctc-button is-main"
            data-part={PlantPart.Grow}
            disabled={s.days >= MAX_DAYS}
            onClick={() => call(PlantAction.Grow, {})}
          >
            {say(locale, WORDS.grow)}
          </button>
        )}
        {!isTouch && s.days > 0 && (
          <button type="button" class="ctc-button" onClick={() => call(PlantAction.Reset, {})}>
            {say(locale, WORDS.again)}
          </button>
        )}
      </div>
    </div>
  );
}
