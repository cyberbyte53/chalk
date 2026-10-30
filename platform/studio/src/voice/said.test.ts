import { describe, expect, it } from "vitest";
import { said, unspeakable } from "./said";

const line = (en: string, speak?: string) => ({
  say: { en, hi: en },
  ...(speak === undefined ? {} : { speak: { en: speak, hi: speak } }),
});

describe("what a voice says: words a person wrote, never rewritten", () => {
  it("the line's own spoken words, as written", () => {
    expect(
      said(line("$\\sqrt{2} \\approx 1.41$", "the square root of 2 is about 1.41"), "en"),
    ).toEqual({
      words: "the square root of 2 is about 1.41",
    });
  });
  it("the screen words, formatting left out by the parser, the words untouched", () => {
    expect(said(line("Street **4** rises, *up*"), "en")).toEqual({ words: "Street 4 rises, up" });
  });
  it("never turns maths or a sign into words: that line needs its spoken words", () => {
    expect(said(line("Is $x^2$ even?"), "en")).toEqual({ needs: "it has maths" });
    expect(said(line("stop −2, ← →"), "en")).toEqual({ needs: 'it has "− ← →"' });
  });
});

describe("what a voice can be given", () => {
  it("plain words, digits and punctuation, in both scripts", () => {
    expect(unspeakable("Street 4, House 5. गली 4, मकान 5।")).toEqual([]);
  });
});
