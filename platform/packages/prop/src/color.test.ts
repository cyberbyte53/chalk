import { describe, expect, it } from "vitest";
import { colorSchema } from "./color";
import { Color, cssColor } from "./index";

describe("colorSchema", () => {
  it("takes a role of the look or any #rrggbb", () => {
    expect(colorSchema.parse(Color.Primary)).toBe("primary");
    expect(colorSchema.parse("#2B4CD3")).toBe("#2B4CD3");
  });

  it("refuses anything else", () => {
    expect(colorSchema.safeParse("blue").success).toBe(false);
    expect(colorSchema.safeParse("#fff").success).toBe(false);
    expect(colorSchema.safeParse("jugnu").success).toBe(false);
  });

  it("draws a role through the theme and a hex as it is", () => {
    expect(cssColor(Color.OnSurface)).toBe("var(--color-on-surface)");
    expect(cssColor("#2B4CD3")).toBe("#2B4CD3");
  });
});
