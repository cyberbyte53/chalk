import { viewOf } from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import { Source } from "./field";
import { Rings } from "./generator";
import { magnetismProps } from "./index";
import { InductionMode } from "./induction";
import { Rule } from "./rule";
import { Fault } from "./wiring";

const extras: Record<string, Record<string, unknown>[]> = {
  magneticField: [
    {
      source: Source.StraightWire,
      current: -2,
      compass: { x: 2, y: 1 },
      showFilings: true,
      showStrength: true,
    },
    { source: Source.Loop, current: 1, turns: 3, canSetTurns: true, canSetCurrent: true },
    { source: Source.Solenoid, current: -1, compass: { x: 6, y: 0 } },
    { source: Source.StraightWire, current: 0, compass: { x: 2, y: 0 } },
  ],
  handRule: [
    { rule: Rule.ThumbRule },
    { rule: Rule.FlemingRight, isRevealed: false, canReveal: true },
  ],
  forceOnRod: [{ isKeyClosed: true, canSetMagnet: true, canSetLength: true, isLongRod: true }],
  motor: [
    { angle: 90 },
    { angle: 225, hasSplitRing: false, canSwapRings: true },
    { isRunning: true },
  ],
  induction: [
    { kick: 1, flicks: 1, at: "inside" },
    { mode: InductionMode.TwoCoils, isClosed: true, kick: 1 },
  ],
  generator: [{ angle: 135, rings: Rings.Split, canSetRings: true }, { isRunning: true }],
  homeWiring: [
    { oven: "five", isBlownFive: true, canPlugOven: true },
    { fault: Fault.Leak, hasEarth: false, isTouching: true, canFault: true, canEarth: true },
  ],
};

describe("every view draws", () => {
  for (const m of magnetismProps) {
    const states = [
      m.def.defaults,
      ...(extras[m.def.type] ?? []).map((e) => ({ ...m.def.defaults, ...e })),
    ];
    states.forEach((state, n) => {
      for (const locale of ["en", "hi"] as const) {
        for (const width of [300, 340, 420]) {
          it(`${m.def.type} #${n} (${locale}, ${width}px)`, () => {
            const html = renderToString(
              <m.View
                view={viewOf(m.def, state)}
                locale={locale}
                width={width}
                call={() => undefined}
                signal={() => undefined}
              />,
            );
            expect(html.length).toBeGreaterThan(100);
            expect(html).not.toMatch(/NaN|undefined|Infinity/);
          });
        }
      }
    });
  }
});
