import { readFileSync } from "node:fs";
import type { Spoken } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { audioKey, compileReadings, spokenText, toSpoken, unspeakable } from "./audio";

const readings = compileReadings(
  JSON.parse(
    readFileSync(new URL("../../../../content/pronunciations.json", import.meta.url), "utf8"),
  ),
);
const en = (text: string) => toSpoken(text, "en", readings);
const hi = (text: string) => toSpoken(text, "hi", readings);

const line: Spoken = {
  say: { en: "1.4² = 1.96", hi: "1.4² = 1.96" },
  speak: { en: "one point four squared", hi: "एक दशमलव चार का वर्ग" },
  speaker: "maya",
};

describe("spoken lines", () => {
  it("speaks the author's own words when there are some", () => {
    expect(spokenText(line, "en", readings)).toBe("one point four squared");
  });
  it("otherwise reads the screen text through the rules", () => {
    expect(
      spokenText({ say: { en: "Where does √2 live?", hi: "√2 कहाँ रहता है?" } }, "hi", readings),
    ).toBe("2 का वर्गमूल कहाँ रहता है?");
  });
  it("keys audio by board, address and language", () => {
    expect(audioKey("aaaaaaaaaaaaaaaa", "maya", "hi")).toBe("aaaaaaaaaaaaaaaa.maya.hi");
  });
});

describe("pronunciation rules", () => {
  it("read maths", () => {
    expect(en("Where does √2 live?")).toBe("Where does square root of 2 live?");
    expect(en("1.4² = 1.96 and 1.5² = 2.25.")).toBe(
      "1.4 squared equals 1.96 and 1.5 squared equals 2.25.",
    );
    expect(en("√(1² + 1²)")).toBe("square root of 1 squared plus 1 squared");
    expect(en("π ≈ 3.14")).toBe("pi is about 3.14");
    expect(hi("1.4² = 1.96")).toBe("1.4 का वर्ग बराबर 1.96");
  });
  it("read units, chemistry and short forms, not just maths", () => {
    expect(en("Water boils at 100°C.")).toBe("Water boils at 100 degrees Celsius.");
    expect(en("A car at 60 km/h")).toBe("A car at 60 kilometres per hour");
    expect(en("H₂O and CO₂")).toBe("H 2 O and CO 2");
    expect(hi("H₂O")).toBe("H 2 O");
    expect(en("e.g. NCERT, Fig. 3")).toBe("for example N C E R T, figure 3");
    expect(en("50% done")).toBe("50 percent done");
  });
  it("refuse a bad pattern loudly", () => {
    expect(() =>
      compileReadings({ groups: [{ name: "x", rules: [{ match: "(", en: "", hi: "" }] }] }),
    ).toThrow(/bad pattern/);
  });
});

describe("unspeakable", () => {
  it("lets plain words, digits and punctuation through, in both scripts", () => {
    expect(unspeakable(en("1.41² = 1.9881, and 1.42² = 2.0164!"))).toEqual([]);
    expect(unspeakable(hi("1.41² = 1.9881 और 1.42² = 2.0164।"))).toEqual([]);
  });
  it("catches anything nobody wrote a rule for", () => {
    expect(unspeakable(en("∜16 → λ ★"))).toEqual(["∜", "→", "λ", "★"]);
    expect(unspeakable("x₁₀")).toEqual(["₁", "₀"]);
  });
});
