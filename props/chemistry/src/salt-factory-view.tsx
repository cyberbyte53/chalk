import { Stage } from "@chalk/draw";
import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import { useId } from "preact/hooks";
import { subscripted } from "./acid-data";
import { Bubbles } from "./acid-draw";
import {
  PRODUCTS,
  Product,
  Route,
  SaltFactoryAction,
  type SaltFactoryState,
  describeSaltFactory,
  shownProducts,
} from "./salt-factory";
import { type Words, say } from "./words";

const W = 320;
const H = 214;

const WORDS = {
  salt: { en: "common salt", hi: "साधारण नमक" },
  electricity: { en: "brine + electricity", hi: "लवणजल + विद्युत" },
  lime: { en: "+ slaked lime", hi: "+ बुझा चूना" },
  together: { en: "H₂ + Cl₂", hi: "H₂ + Cl₂" },
  ammonia: { en: "+ H₂O, CO₂, NH₃", hi: "+ H₂O, CO₂, NH₃" },
  heat: { en: "heat", hi: "गर्म करो" },
  water: { en: "+ 10 H₂O", hi: "+ 10 H₂O" },
  madeBy: { en: "Made by", hi: "कैसे बनता है" },
  uses: { en: "Uses", hi: "उपयोग" },
  close: { en: "Close", hi: "बंद करो" },
  tap: {
    en: "Tap a chemical to see how it is made and used",
    hi: "कोई रसायन टैप करो: कैसे बनता है, किस काम आता है",
  },
  anode: { en: "anode (+)", hi: "ऐनोड (+)" },
  cathode: { en: "cathode (−)", hi: "कैथोड (−)" },
  brine: { en: "brine", hi: "लवणजल" },
} as const satisfies Record<string, Words>;

type Node = { x: number; y: number; w: number };
const NODES: Record<Product, Node> = {
  sodiumHydroxide: { x: 36, y: 100, w: 60 },
  chlorine: { x: 100, y: 100, w: 56 },
  hydrogen: { x: 160, y: 100, w: 56 },
  bleachingPowder: { x: 56, y: 170, w: 84 },
  hydrochloricAcid: { x: 148, y: 170, w: 80 },
  bakingSoda: { x: 262, y: 74, w: 90 },
  sodiumCarbonate: { x: 262, y: 128, w: 90 },
  washingSoda: { x: 262, y: 186, w: 90 },
};
const BOX_H = 34;

/** Split a name over two lines at its middle space. */
function twoLines(text: string): [string, string] {
  const parts = text.split(" ");
  if (parts.length < 2) return [text, ""];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}

function Arrow({
  from,
  to,
  words,
  locale,
  side = "right",
  head,
}: {
  from: [number, number];
  to: [number, number];
  words?: Words;
  locale: string;
  side?: "left" | "right";
  head: string;
}) {
  const mx = (from[0] + to[0]) / 2;
  const my = (from[1] + to[1]) / 2;
  return (
    <g class="sx-arrow">
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} marker-end={`url(#${head})`} />
      {words !== undefined && (
        <text
          x={side === "right" ? mx + 5 : mx - 5}
          y={my + 3}
          text-anchor={side === "right" ? "start" : "end"}
        >
          {say(locale, words)}
        </text>
      )}
    </g>
  );
}

/** The chlor-alkali cell: brine with an anode giving chlorine and a cathode giving hydrogen. */
function Cell({ picked, locale }: { picked: Product; locale: string }): JSX.Element {
  return (
    <svg
      class="sx-cell"
      viewBox="0 0 220 110"
      data-part="cell"
      role="img"
      aria-label="chlor-alkali cell"
    >
      <path class="ac-water" d="M24 40 V100 H196 V40 Z" />
      <path class="ac-glass" d="M20 30 V104 H200 V30" />
      <rect
        class={picked === Product.Chlorine ? "sx-electrode is-lit" : "sx-electrode"}
        x={60}
        y={20}
        width={8}
        height={70}
      />
      <rect
        class={picked !== Product.Chlorine ? "sx-electrode is-lit" : "sx-electrode"}
        x={152}
        y={20}
        width={8}
        height={70}
      />
      <Bubbles x={64} y={86} height={44} n={5} spread={4} cls="ac-bubble sx-cl2" />
      <Bubbles x={156} y={86} height={44} n={5} spread={4} />
      {picked === Product.SodiumHydroxide && (
        <rect class="sx-naoh" x={130} y={60} width={52} height={38} rx={6} />
      )}
      <text class="ac-label" x={64} y={14} text-anchor="middle">
        {say(locale, WORDS.anode)} → Cl₂
      </text>
      <text class="ac-label" x={156} y={14} text-anchor="middle">
        {say(locale, WORDS.cathode)} → H₂
      </text>
      <text class="ac-label" x={110} y={56} text-anchor="middle">
        {say(locale, WORDS.brine)}
      </text>
      {picked === Product.SodiumHydroxide && (
        <text class="ac-label sx-naoh-label" x={156} y={108} text-anchor="middle">
          NaOH
        </text>
      )}
    </svg>
  );
}

/** The map of chemicals from common salt, and a card for the one tapped. */
export function SaltFactoryView({ view, width, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as SaltFactoryState;
  const k = width / W;
  const height = Math.round(H * k);
  const shown = new Set(shownProducts(s));
  const has = (r: Route) => s.routes.includes(r);
  const top = (p: Product): [number, number] => [NODES[p].x, NODES[p].y - BOX_H / 2];
  const bottom = (p: Product): [number, number] => [NODES[p].x, NODES[p].y + BOX_H / 2];
  const picked = s.picked;
  const head = `sx-head-${useId()}`;
  return (
    <div class="sx ac">
      <Stage
        label={describeSaltFactory(s)}
        x={[0, W]}
        width={width}
        height={height}
        svg={{ class: "sx-svg" }}
      >
        <defs>
          <marker
            id={head}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={7}
            markerHeight={7}
            orient="auto-start-reverse"
          >
            <path class="sx-head" d="M0 0 L10 5 L0 10 z" />
          </marker>
        </defs>
        <g transform={`scale(${k})`} data-part="map">
          <rect class="ac-bg" x={0} y={0} width={W} height={H} rx={12} />
          {/* common salt */}
          <g class="sx-salt">
            <rect x={110} y={8} width={100} height={30} rx={8} />
            <text class="sx-formula" x={160} y={22} text-anchor="middle">
              NaCl
            </text>
            <text class="sx-name" x={160} y={33} text-anchor="middle">
              {say(locale, WORDS.salt)}
            </text>
          </g>
          {has(Route.ChlorAlkali) && (
            <g>
              <Arrow
                from={[130, 38]}
                to={[100, 80]}
                words={WORDS.electricity}
                locale={locale}
                side="left"
                head={head}
              />
              <line class="sx-split" x1={36} y1={80} x2={160} y2={80} />
              {[36, 160].map((x) => (
                <line key={x} class="sx-split" x1={x} y1={80} x2={x} y2={83} />
              ))}
            </g>
          )}
          {has(Route.Bleaching) && (
            <Arrow
              from={bottom(Product.Chlorine)}
              to={[64, 153]}
              words={WORDS.lime}
              locale={locale}
              side="left"
              head={head}
            />
          )}
          {has(Route.Acid) && (
            <g>
              <Arrow from={bottom(Product.Hydrogen)} to={[156, 153]} locale={locale} head={head} />
              <Arrow from={bottom(Product.Chlorine)} to={[136, 153]} locale={locale} head={head} />
            </g>
          )}
          {has(Route.BakingSoda) && (
            <Arrow
              from={[200, 30]}
              to={[248, 57]}
              words={WORDS.ammonia}
              locale={locale}
              head={head}
            />
          )}
          {has(Route.WashingSoda) && (
            <g>
              <Arrow
                from={bottom(Product.BakingSoda)}
                to={top(Product.SodiumCarbonate)}
                words={WORDS.heat}
                locale={locale}
                side="left"
                head={head}
              />
              <Arrow
                from={bottom(Product.SodiumCarbonate)}
                to={top(Product.WashingSoda)}
                words={WORDS.water}
                locale={locale}
                side="left"
                head={head}
              />
            </g>
          )}
          {(Object.keys(NODES) as Product[])
            .filter((p) => shown.has(p))
            .map((p) => {
              const n = NODES[p];
              const [a, b] = twoLines(say(locale, PRODUCTS[p].name));
              const pick = () => s.canPick && call(SaltFactoryAction.Pick, { product: p });
              return (
                <g
                  key={p}
                  class={[
                    s.canPick ? "sx-node is-tappable" : "sx-node",
                    picked === p ? "is-picked" : "",
                  ].join(" ")}
                  role={s.canPick ? "button" : undefined}
                  tabIndex={s.canPick ? 0 : undefined}
                  aria-label={say(locale, PRODUCTS[p].name)}
                  onClick={pick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pick();
                    }
                  }}
                >
                  <rect x={n.x - n.w / 2} y={n.y - BOX_H / 2} width={n.w} height={BOX_H} rx={7} />
                  <text class="sx-formula" x={n.x} y={n.y - 4} text-anchor="middle">
                    {subscripted(PRODUCTS[p].formula.replace(".10H2O", "·10H2O"))}
                  </text>
                  <text class="sx-name" x={n.x} y={n.y + 6} text-anchor="middle">
                    {a}
                  </text>
                  {b !== "" && (
                    <text class="sx-name" x={n.x} y={n.y + 14} text-anchor="middle">
                      {b}
                    </text>
                  )}
                </g>
              );
            })}
        </g>
      </Stage>
      {s.canPick && picked === null && <p class="ac-hint">{say(locale, WORDS.tap)}</p>}
      {picked !== null && (
        <div class="sx-card" data-part="card">
          <p class="sx-card-title">
            <strong>{subscripted(PRODUCTS[picked].formula.replace(".10H2O", "·10H2O"))}</strong>{" "}
            {say(locale, PRODUCTS[picked].name)}
          </p>
          <p>
            <span class="sx-key">{say(locale, WORDS.madeBy)}:</span>{" "}
            {say(locale, PRODUCTS[picked].how)}
          </p>
          {s.showEquation && (
            <p class="ac-equation">
              {subscripted(PRODUCTS[picked].equation.split(".10H2O").join("·10H2O"))}
            </p>
          )}
          {s.showCell && PRODUCTS[picked].route === Route.ChlorAlkali && (
            <Cell picked={picked} locale={locale} />
          )}
          {s.showUses && (
            <div>
              <span class="sx-key">{say(locale, WORDS.uses)}:</span>
              <ul class="sx-uses">
                {PRODUCTS[picked].uses.map((u) => (
                  <li key={u.en}>{say(locale, u)}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="button"
            class="ac-button is-quiet"
            onClick={() => call(SaltFactoryAction.Close, {})}
          >
            {say(locale, WORDS.close)}
          </button>
        </div>
      )}
    </div>
  );
}
