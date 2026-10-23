import type { JSX } from "preact";
import { BulbSymbol } from "./draw";
import type { Words } from "./words";

/** Household appliances, with their power when run on the 220 V mains. */
export const Appliance = {
  Bulb: "bulb",
  Led: "led",
  TubeLight: "tubeLight",
  Fan: "fan",
  Tv: "tv",
  Fridge: "fridge",
  Iron: "iron",
  Toaster: "toaster",
  Heater: "heater",
  Geyser: "geyser",
  Pump: "pump",
  Charger: "charger",
} as const;
export type Appliance = (typeof Appliance)[keyof typeof Appliance];

export const APPLIANCE_ORDER = Object.values(Appliance) as readonly Appliance[];

/** Watts each appliance uses (NCERT's examples where it gives them: a 400 W fridge, a 250 W TV, a 1000 W iron, a 1200 W toaster, a 5 A motor). */
export const WATTS: Readonly<Record<Appliance, number>> = {
  bulb: 100,
  led: 9,
  tubeLight: 40,
  fan: 75,
  tv: 250,
  fridge: 400,
  iron: 1000,
  toaster: 1200,
  heater: 2000,
  geyser: 2000,
  pump: 1100,
  charger: 5,
};

export const APPLIANCE_WORDS: Readonly<Record<Appliance, Words>> = {
  bulb: { en: "100 W bulb", hi: "100 W बल्ब" },
  led: { en: "LED bulb", hi: "LED बल्ब" },
  tubeLight: { en: "Tube light", hi: "ट्यूबलाइट" },
  fan: { en: "Ceiling fan", hi: "छत का पंखा" },
  tv: { en: "TV", hi: "टीवी" },
  fridge: { en: "Fridge", hi: "फ़्रिज" },
  iron: { en: "Iron", hi: "इस्त्री" },
  toaster: { en: "Toaster", hi: "टोस्टर" },
  heater: { en: "Room heater", hi: "रूम हीटर" },
  geyser: { en: "Geyser", hi: "गीज़र" },
  pump: { en: "Water pump", hi: "पानी की मोटर" },
  charger: { en: "Phone charger", hi: "फ़ोन चार्जर" },
};

export const APPLIANCE_EN: Readonly<Record<Appliance, string>> = Object.fromEntries(
  APPLIANCE_ORDER.map((a) => [a, APPLIANCE_WORDS[a].en]),
) as Record<Appliance, string>;

/** A small picture of the appliance, about 28 × 28, centred at (0, 0); `on` lights or warms it. */
export function ApplianceIcon({
  appliance,
  on,
}: { appliance: Appliance; on: boolean }): JSX.Element {
  const hot = on ? " is-on" : "";
  switch (appliance) {
    case Appliance.Bulb:
      return <BulbSymbol r={11} glow={on ? 0.9 : 0} />;
    case Appliance.Led:
      return (
        <g>
          {on && <circle class="el-glow" r={18} opacity={0.4} />}
          <path class={`el-icon-body${hot}`} d="M-9 -2 A 9 9 0 1 1 9 -2 L 6 6 H -6 Z" />
          <rect class="el-icon-dark" x={-5} y={7} width={10} height={6} rx={1.5} />
        </g>
      );
    case Appliance.TubeLight:
      return (
        <g>
          {on && (
            <rect class="el-glow" x={-16} y={-8} width={32} height={16} rx={8} opacity={0.4} />
          )}
          <rect class={`el-icon-body${hot}`} x={-14} y={-3} width={28} height={6} rx={3} />
          <rect class="el-icon-dark" x={-16} y={-4} width={3} height={8} rx={1} />
          <rect class="el-icon-dark" x={13} y={-4} width={3} height={8} rx={1} />
        </g>
      );
    case Appliance.Fan:
      return (
        <g class={on ? "el-fan is-on" : "el-fan"}>
          <g class="el-fan-blades">
            {[0, 120, 240].map((a) => (
              <ellipse
                key={a}
                class="el-icon-body"
                cx={0}
                cy={-8}
                rx={3.5}
                ry={8}
                transform={`rotate(${a})`}
              />
            ))}
          </g>
          <circle class="el-icon-dark" r={3.5} />
        </g>
      );
    case Appliance.Tv:
      return (
        <g>
          <rect class="el-icon-dark" x={-14} y={-10} width={28} height={18} rx={2} />
          <rect
            class={on ? "el-screen is-on" : "el-screen"}
            x={-12}
            y={-8}
            width={24}
            height={14}
            rx={1}
          />
          <line class="el-icon-line" x1={-5} y1={11} x2={5} y2={11} />
        </g>
      );
    case Appliance.Fridge:
      return (
        <g>
          <rect class="el-icon-body" x={-9} y={-14} width={18} height={28} rx={3} />
          <line class="el-icon-line" x1={-9} y1={-3} x2={9} y2={-3} />
          <line class="el-icon-line" x1={5} y1={-10} x2={5} y2={-6} />
          <line class="el-icon-line" x1={5} y1={1} x2={5} y2={7} />
        </g>
      );
    case Appliance.Iron:
      return (
        <g>
          <path class={`el-icon-hot${hot}`} d="M-14 8 Q -12 -2 2 -4 H 14 V 8 Z" />
          <path class="el-icon-line" d="M-2 -4 Q 0 -12 12 -12 V -4" fill="none" />
        </g>
      );
    case Appliance.Toaster:
      return (
        <g>
          <rect class="el-icon-body" x={-14} y={-6} width={28} height={16} rx={5} />
          <rect class={`el-icon-hot${hot}`} x={-8} y={-9} width={5} height={6} rx={1} />
          <rect class={`el-icon-hot${hot}`} x={3} y={-9} width={5} height={6} rx={1} />
        </g>
      );
    case Appliance.Heater:
      return (
        <g>
          <rect class="el-icon-dark" x={-14} y={-12} width={28} height={22} rx={3} />
          {[-7, 0, 7].map((y) => (
            <line key={y} class={`el-icon-coil${hot}`} x1={-10} y1={y - 1} x2={10} y2={y - 1} />
          ))}
          <line class="el-icon-line" x1={-10} y1={12} x2={-10} y2={14} />
          <line class="el-icon-line" x1={10} y1={12} x2={10} y2={14} />
        </g>
      );
    case Appliance.Geyser:
      return (
        <g>
          <rect class="el-icon-body" x={-9} y={-14} width={18} height={24} rx={8} />
          <circle class={on ? "el-lamp is-on" : "el-lamp"} cx={0} cy={4} r={2.2} />
          <line class="el-icon-line" x1={-4} y1={10} x2={-4} y2={15} />
          <line class="el-icon-line" x1={4} y1={10} x2={4} y2={15} />
        </g>
      );
    case Appliance.Pump:
      return (
        <g>
          <circle class="el-icon-body" cx={-3} cy={0} r={9} />
          <rect class="el-icon-dark" x={5} y={-4} width={10} height={8} rx={1.5} />
          <circle class={on ? "el-lamp is-on" : "el-lamp"} cx={-3} cy={0} r={2.5} />
        </g>
      );
    case Appliance.Charger:
      return (
        <g>
          <rect class="el-icon-body" x={-6} y={-8} width={12} height={12} rx={2} />
          <path class="el-icon-line" d="M0 4 Q 0 12 10 12" fill="none" />
          <rect class="el-icon-dark" x={8} y={6} width={6} height={10} rx={1.5} />
        </g>
      );
  }
}
