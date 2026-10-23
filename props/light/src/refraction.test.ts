import {
  EffectKind,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { describe, expect, it } from "vitest";
import {
  MEDIA,
  MEDIA_ORDER,
  Medium,
  RefractionAction,
  RefractionMode,
  RefractionPart,
  RefractionSignal,
  type RefractionState,
  coinPath,
  incidenceAt,
  refraction,
  refractionAngle,
  speedText,
} from "./refraction";

const def = asAnyProp(refraction);
const RAD = Math.PI / 180;
const start: RefractionState = { ...refraction.defaults };
const slab: RefractionState = { ...start, mode: RefractionMode.Slab };
const coin: RefractionState = { ...start, mode: RefractionMode.Coin, bottom: Medium.Water };

type View = ReturnType<typeof viewOf> & RefractionState;
const v = (s: RefractionState) => viewOf(def, s) as View & Record<string, unknown>;

function run(state: RefractionState, name: string, args: Record<string, unknown> = {}) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return next.state as RefractionState;
}

describe("refraction: Snell's law", () => {
  it("bends air → crown glass by n₁ sin i = n₂ sin r", () => {
    const view = v(start);
    const r = view.refraction as number;
    expect(1.0003 * Math.sin(40 * RAD)).toBeCloseTo(1.52 * Math.sin(r * RAD), 9);
    expect(r).toBeCloseTo(25.03, 1);
  });

  it("keeps sin i / sin r the same for every angle: n₂ / n₁", () => {
    for (const bottom of [Medium.Water, Medium.CrownGlass, Medium.Diamond]) {
      for (let i = 1; i <= 80; i += 7) {
        const view = v({ ...start, bottom, incidence: i });
        expect(view.sinRatio as number).toBeCloseTo(MEDIA[bottom].n / MEDIA.air.n, 9);
        expect(view.index as number).toBeCloseTo(MEDIA[bottom].n / MEDIA.air.n, 12);
      }
    }
    expect(v({ ...start, incidence: 0 }).sinRatio).toBeNull();
  });

  it("bends towards the normal exactly when the second medium is denser", () => {
    for (const top of MEDIA_ORDER) {
      for (const bottom of [Medium.Air, Medium.Water, Medium.Diamond]) {
        const view = v({ ...start, top, bottom, incidence: 30 });
        expect(view.towardsNormal).toBe(MEDIA[bottom].n > MEDIA[top].n);
        if (view.refraction !== null) {
          const r = view.refraction as number;
          if (MEDIA[bottom].n > MEDIA[top].n) expect(r).toBeLessThan(30);
          if (MEDIA[bottom].n < MEDIA[top].n) expect(r).toBeGreaterThan(30);
        }
      }
    }
  });

  it("goes straight on along the normal", () => {
    expect(v({ ...start, incidence: 0 }).refraction).toBe(0);
  });

  it("gives no refracted ray when sin r would pass 1 (denser → rarer, steep)", () => {
    expect(refractionAngle(2.42, 1.0003, 60)).toBeNull();
    expect(
      v({ ...start, top: Medium.Diamond, bottom: Medium.Air, incidence: 60 }).refraction,
    ).toBeNull();
    expect(
      v({ ...start, top: Medium.Water, bottom: Medium.Air, incidence: 20 }).refraction,
    ).not.toBeNull();
  });

  it("knows the speed in each medium: c / n", () => {
    const view = v(start);
    expect(view.speedBottom as number).toBeCloseTo(3e8 / 1.52, 0);
    expect(speedText(Medium.CrownGlass)).toBe("1.97 × 10⁸ m/s");
    expect(speedText(Medium.Water)).toBe("2.26 × 10⁸ m/s");
  });

  it("uses NCERT Table 10.3's indices", () => {
    expect(MEDIA_ORDER).toHaveLength(16);
    expect(MEDIA.kerosene.n).toBe(1.44);
    expect(MEDIA.diamond.n).toBe(2.42);
    expect(MEDIA.water.hi).toBe("जल");
  });
});

describe("refraction: the glass slab", () => {
  it("sends the emergent ray out at the angle the incident ray came in", () => {
    for (const i of [10, 30, 60]) expect(v({ ...slab, incidence: i }).emergent).toBe(i);
  });

  it("shifts the ray sideways, more for a steeper ray, and not at all along the normal", () => {
    const at = (i: number) => v({ ...slab, incidence: i }).shift as number;
    expect(at(0)).toBe(0);
    expect(at(20)).toBeGreaterThan(0);
    expect(at(50)).toBeGreaterThan(at(20));
    // t sin(i − r) / cos r with t = 6 cm, i = 40°, r ≈ 25.03°.
    const r = 25.03 * RAD;
    expect(at(40)).toBeCloseTo((6 * Math.sin(40 * RAD - r)) / Math.cos(r), 2);
  });

  it("has no emergent angle or shift outside slab mode", () => {
    expect(v(start).emergent).toBeNull();
    expect(v(start).shift).toBeNull();
  });
});

describe("refraction: the coin in the bowl", () => {
  it("is hidden behind the rim when the bowl is empty", () => {
    expect(v(coin).coinSeen).toBe(false);
    expect(coinPath(coin)).toBeNull();
  });

  it("is seen once the bowl is full, and looks raised", () => {
    const full = { ...coin, water: 1 };
    expect(v(full).coinSeen).toBe(true);
    const path = coinPath(full);
    expect(path).not.toBeNull();
    expect(path?.apparent[1]).toBeGreaterThan(2);
  });

  it("only answers coinSeen in coin mode", () => {
    expect(v(start).coinSeen).toBeNull();
    expect(v(coin).incidence).toBeNull();
  });
});

describe("refraction: actions", () => {
  it("setIncidence, setMedium and setWater set one field each", () => {
    expect(run(start, RefractionAction.SetIncidence, { deg: 25 }).incidence).toBe(25);
    expect(
      run(start, RefractionAction.SetMedium, { which: "bottom", medium: "water" }).bottom,
    ).toBe("water");
    expect(run(start, RefractionAction.SetMedium, { which: "top", medium: "water" }).top).toBe(
      "water",
    );
    expect(run(coin, RefractionAction.SetWater, { level: 0.5 }).water).toBe(0.5);
  });

  it("keeps air on top in slab mode", () => {
    expect(run(slab, RefractionAction.SetMedium, { which: "top", medium: "water" }).top).toBe(
      "air",
    );
  });

  it("refuses an angle past 80°, an unknown medium and a bowl over full", () => {
    expect(prepareAction(def, start, RefractionAction.SetIncidence, { deg: 85 }).isOk).toBe(false);
    expect(
      prepareAction(def, start, RefractionAction.SetMedium, { which: "bottom", medium: "glass" })
        .isOk,
    ).toBe(false);
    expect(prepareAction(def, coin, RefractionAction.SetWater, { level: 1.2 }).isOk).toBe(false);
  });

  it("marks the three as the learner's and declares the release signal", () => {
    for (const a of Object.values(RefractionAction))
      expect(refraction.actions[a].byLearner).toBe(true);
    expect(refraction.signals?.[RefractionSignal.Released]).toBeDefined();
  });

  it("turns a pointer position into whole degrees from the normal", () => {
    // Straight above O is 0°; 45° up-left is 45°; anything to the right is 0.
    expect(incidenceAt(start, 12.5, 12)).toBe(0);
    expect(incidenceAt(start, 8.5, 11.5)).toBe(45);
    expect(incidenceAt(start, 15, 12)).toBe(0);
  });
});

describe("refraction: defaults", () => {
  it("hides n = … on the medium chooser unless asked", () => {
    expect(refraction.defaults.showIndex).toBe(false);
    expect(refraction.defaults.canChooseMedium).toBe(false);
    expect(refraction.inputs).toContain("showIndex");
  });
});

describe("refraction: observation", () => {
  it("names the media, the bend and the angles while shown", () => {
    const o = observationOf(def, v(start));
    expect(o.summary).toContain("bends towards the normal");
    expect(o.summary).toContain("crown glass");
    expect(o.elements.find((e) => e.id === RefractionPart.AngleR)?.value).toBe("r = 25°");
    expect(o.hidden).toBeUndefined();
    const bare = observationOf(def, v({ ...start, showAngles: false }));
    expect(bare.hidden).toEqual({ incidence: 40, refraction: 25 });
  });

  it("reads out sin i / sin r when asked", () => {
    const o = observationOf(def, v({ ...start, showSines: true }));
    expect(o.elements.find((e) => e.id === RefractionPart.Readout)?.value).toContain(
      "sin i / sin r = 1.52",
    );
  });

  it("reads out i / r beside sin i / sin r, with / and never ÷", () => {
    const value = observationOf(def, v({ ...start, showSines: true })).elements.find(
      (e) => e.id === RefractionPart.Readout,
    )?.value;
    expect(value).toContain("i / r = 1.60");
    expect(value).not.toContain("÷");
  });

  it("names the angle of emergence in slab mode", () => {
    const o = observationOf(def, v(slab));
    expect(o.elements.find((e) => e.id === RefractionPart.Emergent)?.value).toContain(
      "angle of emergence e = 40°",
    );
  });

  it("describes the slab's emergent ray and the coin", () => {
    expect(observationOf(def, v(slab)).summary).toContain("parallel");
    expect(observationOf(def, v(coin)).summary).toContain("hides the coin");
    expect(observationOf(def, v({ ...coin, water: 1 })).summary).toContain("the coin is seen");
  });

  it("locates its parts with tap targets at least 44 px", () => {
    for (const s of [start, slab, coin]) {
      const view = v(s);
      for (const part of refraction.parts?.(view) ?? []) {
        const box = refraction.locate?.(view, part, 340);
        expect(box, `${s.mode} ${part}`).toBeDefined();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    }
    expect(refraction.locate?.(v(start), "nothing", 340)).toBeUndefined();
  });
});
