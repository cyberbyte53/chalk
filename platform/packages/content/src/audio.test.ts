import { describe, expect, it } from "vitest";
import { type AudioManifest, clipsOf, phraseKey } from "./audio";
import { fixedParts, numberPieces, phrasesOf } from "./spoken";

describe("the voice's contract", () => {
  it("finds a line's clips by its phrases, or says one is missing", () => {
    const manifest: AudioManifest = {
      provider: "test",
      phrases: {
        [phraseKey("riya", "en", "You're at street")]: { file: "a.wav", seconds: 1 },
        [phraseKey("riya", "en", "4")]: { file: "b.wav", seconds: 0.4 },
      },
    };
    expect(clipsOf(manifest, "riya", "en", ["You're at street", "4"])).toHaveLength(2);
    expect(clipsOf(manifest, "riya", "en", ["You're at street", "5"])).toBeUndefined();
    expect(clipsOf(manifest, "aman", "en", ["4"])).toBeUndefined();
  });
});

describe("a line said in phrases", () => {
  it("fills a template's blanks with its values' pieces, between its fixed parts", () => {
    const template = "You're at street {x}, house {y}.";
    expect(fixedParts(template)).toEqual(["You're at street", "house"]);
    expect(phrasesOf(template, { x: -2, y: 5 }, "en")).toEqual([
      "You're at street",
      "minus",
      "2",
      "house",
      "5",
    ]);
    expect(phrasesOf("तुम गली {x} पर हो।", { x: 4 }, "hi")).toEqual(["तुम गली", "4", "पर हो।"]);
    expect(phrasesOf(template, { x: 4 }, "en")).toBeUndefined();
  });

  it("says a number by its pieces: the sign and the point in words, digits as digits", () => {
    expect(numberPieces(0.375, "en")).toEqual(["0", "point", "3", "7", "5"]);
    expect(numberPieces(-12, "hi")).toEqual(["माइनस", "12"]);
  });
});
