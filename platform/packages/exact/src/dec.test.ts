import { describe, expect, it } from "vitest";
import { Dec, dec } from "./dec";

describe("Dec", () => {
  it("keeps what was written", () => {
    expect(dec("7.384").toString()).toBe("7.384");
    expect(dec("2.50").toString()).toBe("2.50");
    expect(dec("-0.05").toString()).toBe("-0.05");
    expect(dec("12").toString()).toBe("12");
    expect(JSON.stringify({ x: dec("0.10") })).toBe('{"x":"0.10"}');
  });

  it("refuses what isn't a decimal", () => {
    expect(() => dec("1e3")).toThrow();
    expect(() => dec(".5")).toThrow();
    expect(() => dec("1,000")).toThrow();
  });

  it("compares by value, exactly", () => {
    expect(dec("2.5").eq(dec("2.50"))).toBe(true);
    expect(dec("0.1").plus(dec("0.2")).eq(dec("0.3"))).toBe(true);
    expect(dec("7.384").compare(dec("7.38"))).toBe(1);
    expect(dec("-1.5").compare(dec("-1.4"))).toBe(-1);
  });

  it("rounds half away from zero, without float drift", () => {
    expect(dec("7.384").round(2).toString()).toBe("7.38");
    expect(dec("7.385").round(2).toString()).toBe("7.39");
    expect(dec("-7.385").round(2).toString()).toBe("-7.39");
    expect(dec("2.5").round(3).toString()).toBe("2.500");
    expect(dec("1.005").round(2).toString()).toBe("1.01"); // 1.005.toFixed(2) is "1.00"
  });

  it("does digit work", () => {
    expect(dec("2.665").digits()).toEqual(["6", "6", "5"]);
    expect(dec("7.384").swapLastTwo().toString()).toBe("7.348");
    expect(() => dec("7.3").swapLastTwo()).toThrow();
    expect(dec("7.384").floor().toString()).toBe("7");
    expect(dec("-7.384").floor().toString()).toBe("-8");
    expect(Dec.of(7384n, 3).toNumber()).toBe(7.384);
  });
});
