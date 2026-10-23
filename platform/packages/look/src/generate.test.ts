import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateCss, generateTs } from "./generate";
import { COLOR_ROLES, Color, cssColor, isColorRole } from "./index";

const read = (file: string): string => readFileSync(new URL(file, import.meta.url), "utf8");
const tokens: unknown = JSON.parse(read("./tokens.json"));

describe("look", () => {
  it("tokens.gen.css and color.gen.ts match tokens.json (run `pnpm --filter @chalk/look generate`)", () => {
    expect(read("./tokens.gen.css")).toBe(generateCss(tokens));
    expect(read("./color.gen.ts")).toBe(generateTs(tokens));
  });

  it("writes one variable per token, references as var(), fonts quoted", () => {
    const css = generateCss({
      color: { primary: { $value: "#2459d6" }, accent: { $value: "{color.primary}" } },
      font: { body: { $value: ["Atkinson Hyperlegible", "sans-serif"] } },
      text: { "body-leading": { $value: 1.45 } },
    });
    expect(css).toContain("--color-primary: #2459d6;");
    expect(css).toContain("--color-accent: var(--color-primary);");
    expect(css).toContain('--font-body: "Atkinson Hyperlegible", sans-serif;');
    expect(css).toContain("--text-body-leading: 1.45;");
  });

  it("refuses a reference to a missing token", () => {
    expect(() => generateCss({ color: { a: { $value: "{color.b}" } } })).toThrow(/color\.b/);
  });

  it("names content's colours from the colour group only", () => {
    expect(Color.Primary).toBe("primary");
    expect(Color.OnSurfaceVariant).toBe("on-surface-variant");
    expect(COLOR_ROLES).not.toContain("jugnu");
  });

  it("turns a role into its variable and leaves a hex alone", () => {
    expect(cssColor(Color.Primary)).toBe("var(--color-primary)");
    expect(cssColor("#2b4cd3")).toBe("#2b4cd3");
    expect(isColorRole("primary")).toBe(true);
    expect(isColorRole("#2b4cd3")).toBe(false);
  });
});
