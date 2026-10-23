import type { BoardKit, PlacedOf } from "@chalk/author";
import { type CircuitState, circuitDef } from "@chalk/prop-circuit";
import { type ElectricityScene, electricitySceneDef } from "@chalk/prop-electricity";

/** A story picture, never interactive. */
export function sceneOn(
  b: BoardKit,
  name: string,
  scene: ElectricityScene,
  standsFor: string,
): PlacedOf<typeof electricitySceneDef> {
  const s = b.prop(electricitySceneDef, name, { scene });
  b.standsFor(s, standsFor);
  return s;
}

/**
 * NCERT Fig 12.1: a cell, a bulb, an ammeter and a plug key in one loop. The learner can open and
 * close the key (tap it) and take the bulb out of its socket.
 */
export function figure121(
  b: BoardKit,
  name: string,
  options: { isClosed?: boolean; withVoltmeter?: boolean; canTouch?: boolean } = {},
): PlacedOf<typeof circuitDef> {
  const v = options.withVoltmeter === true;
  // With a voltmeter, the loop drops two rows so the voltmeter can sit above the bulb.
  const top = v ? 3 : 1;
  const state: CircuitState = {
    nodes: [
      { id: "a", x: 1, y: 7 },
      { id: "b", x: 1, y: top },
      { id: "c", x: 5, y: top },
      { id: "d", x: 9, y: top },
      { id: "e", x: 9, y: 7 },
      { id: "f", x: 5, y: 7 },
      ...(v
        ? [
            { id: "g", x: 1, y: 1 },
            { id: "h", x: 5, y: 1 },
          ]
        : []),
    ],
    components: [
      { id: "cell", kind: "cell", from: "a", to: "b", volts: 1.5 },
      {
        id: "bulb",
        kind: "bulb",
        from: "b",
        to: "c",
        ohms: 5,
        ratedVolts: 1.5,
        isInSocket: true,
      },
      { id: "ammeter", kind: "ammeter", from: "c", to: "d" },
      { id: "right", kind: "wire", from: "d", to: "e" },
      { id: "key", kind: "switch", from: "e", to: "f", isClosed: options.isClosed ?? false },
      { id: "bottom", kind: "wire", from: "f", to: "a" },
      ...(v
        ? [
            { id: "up", kind: "wire", from: "b", to: "g" },
            { id: "voltmeter", kind: "voltmeter", from: "g", to: "h" },
            { id: "down", kind: "wire", from: "h", to: "c" },
          ]
        : []),
    ],
  } as CircuitState;
  const c = b.prop(circuitDef, name, state);
  if (options.canTouch !== false) {
    b.studentOnly(c.action("toggleSwitch"));
    b.studentOnly(c.action("takeOutBulb"));
    b.studentOnly(c.action("putBackBulb"));
  }
  return c;
}
