import { describe, expect, it } from "vitest";
import { spokenText, unspeakable } from "./said";

const line = (en: string, speak?: string) => ({
  say: { en, hi: en },
  ...(speak === undefined ? {} : { speak: { en: speak, hi: speak } }),
});

describe("what a voice says", () => {
  it("the line's own spoken words, when it has them", () => {
    expect(spokenText(line("√2 ≈ 1.41", "the square root of 2 is about 1.41"), "en")).toBe(
      "the square root of 2 is about 1.41",
    );
  });
  it("else the words of its rich text, as the screen's parser reads them", () => {
    expect(spokenText(line("Street **4** rises"), "en")).toBe("Street 4 rises");
  });
});

describe("what a voice can be given", () => {
  it("plain words, digits and punctuation, in both scripts", () => {
    expect(unspeakable("Street 4, House 5. गली 4, मकान 5।")).toEqual([]);
  });
  it("not a symbol: that line needs its spoken words", () => {
    expect(unspeakable("stop −2, ← →")).toEqual(["−", "←", "→"]);
  });
});
