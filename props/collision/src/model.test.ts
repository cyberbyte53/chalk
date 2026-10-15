import { describe, expect, it } from "vitest";
import { type CollisionState, afterCollision, contactTime, momentAt } from "./model";

const base: CollisionState = {
  massA: 2,
  massB: 1,
  velocityA: 2,
  velocityB: -1,
  bounce: 1,
  time: 0,
  isRunning: false,
};
const momentum = (s: CollisionState, a: number, b: number): number => s.massA * a + s.massB * b;
const energy = (s: CollisionState, a: number, b: number): number =>
  0.5 * s.massA * a * a + 0.5 * s.massB * b * b;

describe("collision", () => {
  it("keeps momentum, however bouncy", () => {
    for (const bounce of [0, 0.3, 0.5, 1]) {
      const s = { ...base, bounce };
      const after = afterCollision(s);
      expect(momentum(s, after.a, after.b)).toBeCloseTo(momentum(s, s.velocityA, s.velocityB), 10);
    }
  });

  it("keeps kinetic energy only when elastic", () => {
    const after = afterCollision(base);
    expect(energy(base, after.a, after.b)).toBeCloseTo(energy(base, 2, -1), 10);
    const sticky = { ...base, bounce: 0 };
    const stuck = afterCollision(sticky);
    expect(energy(sticky, stuck.a, stuck.b)).toBeLessThan(energy(sticky, 2, -1));
  });

  it("sticky blocks move off together", () => {
    const after = afterCollision({ ...base, bounce: 0 });
    expect(after.a).toBeCloseTo(after.b, 10);
  });

  it("equal masses, elastic: they swap velocities (the textbook case)", () => {
    const after = afterCollision({ ...base, massA: 1, massB: 1, velocityA: 2, velocityB: 0 });
    expect(after.a).toBeCloseTo(0, 10);
    expect(after.b).toBeCloseTo(2, 10);
  });

  it("never meet when B runs away faster", () => {
    expect(contactTime({ ...base, velocityA: 1, velocityB: 2 })).toBeNull();
  });

  it("the blocks just touch at the moment of contact", () => {
    const t = contactTime(base) ?? Number.NaN;
    const m = momentAt(base, t);
    expect(m.positionB - m.positionA).toBeCloseTo((0.8 + 0.4 + 0.8 + 0.2) / 2, 10);
  });
});
