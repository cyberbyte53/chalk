import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { Arrow, Frame, Person, type Words, range, say } from "./draw";
import {
  PeriodicScene,
  PeriodicScenePart,
  type PeriodicSceneState,
  describePeriodicScene,
} from "./scene";

const W = 320;
const H = 180;

const WORDS = {
  quiz: { en: "ELEMENT QUIZ NIGHT", hi: "तत्व क्विज़ नाइट" },
  bath: { en: "bathing soap", hi: "नहाने का साबुन" },
  wash: { en: "washing soap", hi: "कपड़े का साबुन" },
  biscuits: { en: "biscuits", hi: "बिस्कुट" },
  notes: { en: "sa re ga ma pa da ni sa", hi: "सा रे ग म प ध नि सां" },
  mendeleev: { en: "like Mendeléev!", hi: "मेंडेलीफ़ की तरह!" },
} as const satisfies Record<string, Words>;

function Room({ floor = 150 }: { floor?: number }) {
  return (
    <g>
      <rect class="pts-wall" x={0} y={0} width={W} height={H} />
      <rect class="pts-floor" x={0} y={floor} width={W} height={H - floor} />
    </g>
  );
}

/** One element card: a small white card with a symbol (and an optional big number). */
function Card({
  x,
  y,
  sym,
  rot = 0,
  s = 1,
  cls = "",
  num,
}: {
  x: number;
  y: number;
  sym: string;
  rot?: number;
  s?: number;
  cls?: string;
  num?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect class={`pts-card ${cls}`} x={-9} y={-11} width={18} height={22} rx={2} />
      {num !== undefined && (
        <text class="pts-card-num" x={-6.5} y={-4.5}>
          {num}
        </text>
      )}
      <text class="pts-card-sym" x={0} y={num === undefined ? 3.5 : 6} text-anchor="middle">
        {sym}
      </text>
    </g>
  );
}

const HEAP = [
  ["Na", -14, 0, 0],
  ["O", 22, -6, 3],
  ["Fe", -40, 12, 6],
  ["Cl", 6, 14, -4],
  ["K", 40, 10, 8],
  ["C", -24, -14, -6],
  ["He", 30, -18, 0],
  ["Mg", -6, -22, 5],
  ["Ca", 54, -4, -2],
  ["Br", -52, -6, 4],
] as const;

function Picture({ scene, locale }: { scene: PeriodicScene; locale: string }): JSX.Element {
  switch (scene) {
    case PeriodicScene.CardHeap:
      return (
        <g>
          <Room />
          <rect class="pts-poster" x={190} y={18} width={112} height={56} rx={4} />
          <text class="pts-poster-text" x={246} y={42} text-anchor="middle">
            {say(locale, WORDS.quiz).split(" ").slice(0, 2).join(" ")}
          </text>
          <text class="pts-poster-text" x={246} y={60} text-anchor="middle">
            {say(locale, WORDS.quiz).split(" ").slice(2).join(" ")}
          </text>
          <g transform="translate(150 150)">
            {HEAP.map(([sym, dx, dy, rot]) => (
              <Card key={sym} x={dx} y={dy - 6} sym={sym} rot={rot * 6} />
            ))}
          </g>
          <rect
            class="pts-box"
            x={70}
            y={92}
            width={30}
            height={20}
            rx={2}
            transform="rotate(-30 85 102)"
          />
          <Person who="kabir" x={70} y={160} s={1.2} point={[16, -10]} />
          <Person who="riya" x={250} y={162} s={1.25} />
        </g>
      );
    case PeriodicScene.ShopShelves:
      return (
        <g>
          <Room />
          {[46, 92].map((y) => (
            <rect key={y} class="pts-shelf" x={20} y={y} width={190} height={6} rx={2} />
          ))}
          {range(5).map((i) => (
            <rect
              key={`b${i}`}
              class="pts-soap is-bath"
              x={26 + i * 18}
              y={32}
              width={14}
              height={14}
              rx={4}
            />
          ))}
          {range(4).map((i) => (
            <rect
              key={`w${i}`}
              class="pts-soap is-wash"
              x={124 + i * 20}
              y={30}
              width={16}
              height={16}
              rx={2}
            />
          ))}
          <text class="pts-tag" x={62} y={26} text-anchor="middle">
            {say(locale, WORDS.bath)}
          </text>
          <text class="pts-tag" x={160} y={26} text-anchor="middle">
            {say(locale, WORDS.wash)}
          </text>
          {range(7).map((i) => (
            <rect
              key={`k${i}`}
              class="pts-biscuit"
              x={26 + i * 26}
              y={68}
              width={20}
              height={24}
              rx={3}
            />
          ))}
          <text class="pts-tag" x={115} y={110} text-anchor="middle">
            {say(locale, WORDS.biscuits)}
          </text>
          <Person who="riya" x={252} y={160} s={1.25} point={[-22, -26]} />
          <Person who="kabir" x={286} y={160} s={1.1} />
        </g>
      );
    case PeriodicScene.CardTriads:
      return (
        <g>
          <Room floor={110} />
          {[
            ["Li", "Na", "K"],
            ["Ca", "Sr", "Ba"],
            ["Cl", "Br", "I"],
          ].map((pile, i) =>
            pile.map((sym, k) => (
              <Card key={sym} x={30 + i * 70 + k * 21} y={142 - k * 5} sym={sym} s={1.15} />
            )),
          )}
          <Person who="kabir" x={268} y={160} s={1.2} point={[-8, -30]} />
          {["N", "P", "As"].map((sym, k) => (
            <Card key={sym} x={244 + k * 22} y={84} sym={sym} rot={-8 + k * 8} cls="is-odd" />
          ))}
          <Person who="riya" x={232} y={162} s={1.25} />
        </g>
      );
    case PeriodicScene.MusicClass:
      return (
        <g>
          <Room />
          <rect class="pts-board" x={40} y={14} width={240} height={46} rx={4} />
          <text class="pts-board-text" x={160} y={43} text-anchor="middle">
            {say(locale, WORDS.notes)}
          </text>
          <rect class="pts-harmonium" x={100} y={108} width={130} height={30} rx={3} />
          {range(8).map((i) => (
            <rect
              key={i}
              class={i === 7 ? "pts-key is-glow" : i === 0 ? "pts-key is-first" : "pts-key"}
              x={106 + i * 15}
              y={112}
              width={13}
              height={22}
              rx={1.5}
            />
          ))}
          <Person who="riya" x={80} y={162} s={1.3} point={[24, -8]} />
          <Person who="kabir" x={264} y={162} s={1.15} />
        </g>
      );
    case PeriodicScene.CardWall:
      return (
        <g>
          <Room />
          <rect class="pts-board is-cork" x={100} y={10} width={200} height={104} rx={4} />
          {range(4).map((r) =>
            range(8).map((c) => {
              const isGap = (r === 2 && c === 2) || (r === 3 && (c === 2 || c === 3));
              return (
                <rect
                  key={`${r}-${c}`}
                  class={isGap ? "pts-card is-gap" : "pts-card"}
                  x={110 + c * 23}
                  y={18 + r * 24}
                  width={17}
                  height={20}
                  rx={2}
                />
              );
            }),
          )}
          {[
            [2, 2],
            [3, 2],
            [3, 3],
          ].map(([r, c]) => (
            <text
              key={`${r}${c}`}
              class="pts-gap-text"
              x={118.5 + (c as number) * 23}
              y={32 + (r as number) * 24}
              text-anchor="middle"
            >
              ?
            </text>
          ))}
          <Person who="grandpa" x={40} y={160} s={1.3} point={[30, -30]} />
          <text class="pts-speech" x={8} y={98}>
            {say(locale, WORDS.mendeleev)}
          </text>
          <Person who="riya" x={210} y={162} s={1.25} back />
          <Person who="kabir" x={250} y={160} s={1.15} back />
        </g>
      );
    case PeriodicScene.HydrogenCard:
      return (
        <g>
          <Room />
          <rect class="pts-col" x={22} y={24} width={56} height={92} rx={6} />
          {["Li", "Na", "K"].map((sym, i) => (
            <Card key={sym} x={50} y={46 + i * 28} sym={sym} s={1.1} />
          ))}
          <rect class="pts-col" x={242} y={24} width={56} height={92} rx={6} />
          {["F", "Cl", "Br"].map((sym, i) => (
            <Card key={sym} x={270} y={46 + i * 28} sym={sym} s={1.1} />
          ))}
          <Card x={160} y={40} sym="H" s={1.6} cls="is-hot" />
          <Arrow x1={138} y1={48} x2={86} y2={62} cls="pts-arrow" />
          <Arrow x1={182} y1={48} x2={234} y2={62} cls="pts-arrow" />
          <text class="pts-gap-text" x={110} y={44} text-anchor="middle">
            ?
          </text>
          <text class="pts-gap-text" x={210} y={44} text-anchor="middle">
            ?
          </text>
          <Person who="kabir" x={160} y={162} s={1.3} point={[0, -36]} />
        </g>
      );
    case PeriodicScene.MoseleyNumbers:
      return (
        <g>
          <Room />
          <rect class="pts-board is-cork" x={30} y={14} width={260} height={92} rx={4} />
          {[
            ["Fe", 26],
            ["Co", 27],
            ["Ni", 28],
            ["Cu", 29],
            ["Zn", 30],
          ].map(([sym, n], i) => (
            <Card
              key={sym}
              x={70 + i * 45}
              y={60}
              sym={sym as string}
              num={n as number}
              s={2}
              cls={sym === "Co" || sym === "Ni" ? "is-hot" : ""}
            />
          ))}
          <Person who="riya" x={70} y={162} s={1.25} point={[16, -30]} />
          <Person who="grandpa" x={250} y={160} s={1.3} />
        </g>
      );
    case PeriodicScene.QuizNight:
      return (
        <g>
          <rect class="pts-hall" x={0} y={0} width={W} height={H} />
          <rect class="pts-stage" x={0} y={112} width={W} height={20} />
          <rect class="pts-board is-cork" x={150} y={14} width={150} height={78} rx={4} />
          {range(3).map((r) =>
            range(8).map((c) => (
              <rect
                key={`${r}-${c}`}
                class="pts-card"
                x={157 + c * 17.5}
                y={22 + r * 23}
                width={13}
                height={18}
                rx={1.5}
              />
            )),
          )}
          <rect class="pts-mic" x={58} y={84} width={3} height={28} />
          <circle class="pts-mic" cx={59.5} cy={82} r={4} />
          <Person who="riya" x={80} y={114} s={1.2} />
          <Person who="kabir" x={136} y={114} s={1.05} point={[14, -26]} />
          <Person who="mom" x={96} y={180} s={1.2} back />
          <Person who="grandpa" x={140} y={180} s={1.25} back />
          <text class="pts-poster-text is-light" x={225} y={108} text-anchor="middle">
            {say(locale, WORDS.quiz)}
          </text>
        </g>
      );
  }
}

export function PeriodicSceneView({ view, width, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as PeriodicSceneState;
  return (
    <div class="pt pts" data-part={PeriodicScenePart.Picture}>
      <Frame w={W} h={H} width={width} label={describePeriodicScene(s)} cls="pts-svg">
        <Picture scene={s.scene} locale={locale} />
      </Frame>
    </div>
  );
}
