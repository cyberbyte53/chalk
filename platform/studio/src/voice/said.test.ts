import { describe, expect, it } from "vitest";
import { mathsReader } from "./maths";
import { said, unspeakable } from "./said";

const line = (en: string, speak?: string) => ({
  say: { en, hi: en },
  ...(speak === undefined ? {} : { speak: { en: speak, hi: speak } }),
});

describe("what a voice says: words a person wrote, never rewritten", () => {
  it("the line's own spoken words, as written", () => {
    expect(
      said(line("$\\sqrt{2} \\approx 1.41$", "the square root of 2 is about 1.41"), "en"),
    ).toEqual({ words: "the square root of 2 is about 1.41", from: "written" });
  });
  it("the screen words, formatting left out by the parser, the words untouched", () => {
    expect(said(line("Street **4** rises, *up*"), "en")).toEqual({
      words: "Street 4 rises, up",
      from: "screen",
    });
  });
  it("never says maths itself: it drafts the words, for the line's spoken words", async () => {
    const read = await mathsReader();
    expect(said(line("Is $x^2 + 1$ even?"), "en", read)).toEqual({
      needs: "it has maths",
      suggested: "Is x squared plus 1 even?",
    });
    expect(said(line("Is $x^2$ even?"), "en")).toEqual({ needs: "it has maths" });
  });
  it("never says a sign outside maths: write it as maths, or its words", () => {
    expect(said(line("stop −2, ← →"), "en")).toMatchObject({
      needs: expect.stringMatching(/"− ← →" outside maths/),
    });
  });
});

describe("what a voice can be given", () => {
  it("plain words, digits and punctuation, in both scripts", () => {
    expect(unspeakable("Street 4, House 5. गली 4, मकान 5।")).toEqual([]);
  });
});
