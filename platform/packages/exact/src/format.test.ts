import { describe, expect, it } from "vitest";
import { decimal, exact, formula, fraction, quantity, surd } from "./format";

describe("writing numbers one way", () => {
  it("writes integers and simple fractions exactly, with a real minus", () => {
    expect(exact(4)).toMatchObject({ text: "4", tex: "4", isExact: true });
    expect(exact(-1.5)).toMatchObject({ text: "−3/2", tex: "-\\frac{3}{2}", isExact: true });
    expect(exact(1 / 3)).toMatchObject({ text: "1/3", tex: "\\frac{1}{3}" });
    expect(fraction(0.123456)).toBeUndefined();
  });

  it("writes surds in simplest form", () => {
    expect(exact(Math.sqrt(8))).toMatchObject({ text: "2√2", tex: "2\\sqrt{2}" });
    expect(exact(58 * Math.sqrt(3))).toMatchObject({ text: "58√3" });
    expect(exact(Math.sqrt(15.25))).toMatchObject({ text: "√61/2", tex: "\\frac{\\sqrt{61}}{2}" });
    expect(exact(-Math.sqrt(2))).toMatchObject({ text: "−√2" });
    expect(surd(3)).toBeUndefined();
  });

  it("falls back to a rounded decimal, marked not exact", () => {
    expect(exact(Math.PI)).toMatchObject({ text: "3.14", isExact: false });
    expect(decimal(2.5, 2)).toMatchObject({ text: "2.5", isExact: true });
    expect(decimal(2.5, 2, true)).toMatchObject({ text: "2.50" });
    expect(decimal(-0.001, 2).text).toBe("0");
  });

  it("adds units and writes formulas", () => {
    expect(quantity(exact(58 * Math.sqrt(3)), "m")).toMatchObject({
      text: "58√3 m",
      tex: "58\\sqrt{3}\\,\\mathrm{m}",
    });
    expect(quantity(exact(60), "°")).toMatchObject({ text: "60°", tex: "60^\\circ" });
    expect(quantity(exact(2.5), "cm²").tex).toBe("\\frac{5}{2}\\,\\mathrm{cm^2}");
    expect(formula("H2SO4")).toEqual({ text: "H₂SO₄", tex: "\\mathrm{H_{2}SO_{4}}" });
    expect(formula("SO4^2-").text).toBe("SO₄²⁻");
    expect(formula("Ca(OH)2").text).toBe("Ca(OH)₂");
  });
});
