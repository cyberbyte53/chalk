import { describe, expect, it } from "vitest";
import { type SoundList, clipsOf } from "./clips";
import { blanksOf, fixedParts, numberPieces, phrasesOf } from "./spoken";

describe("a chapter's sound list", () => {
  it("finds a line's clips by its speaker's voice and its phrases, or says one is missing", () => {
    const list: SoundList = {
      speakers: { riya: { en: "piper:amy", hi: "piper:priyamvada" } },
      clips: [
        { file: "a.m4a", voice: "piper:amy", locale: "en", words: "You're at street", seconds: 1 },
        { file: "b.m4a", voice: "piper:amy", locale: "en", words: "4", seconds: 0.4 },
      ],
    };
    expect(clipsOf(list, "riya", "en", ["You're at street", "4"])).toHaveLength(2);
    expect(clipsOf(list, "riya", "en", ["You're at street", "5"])).toBeUndefined();
    expect(clipsOf(list, "aman", "en", ["4"])).toBeUndefined();
    // Another voice for Riya: her old clips are no longer hers.
    expect(
      clipsOf({ ...list, speakers: { riya: { en: "piper:kristin", hi: "x" } } }, "riya", "en", [
        "4",
      ]),
    ).toBeUndefined();
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
    expect(numberPieces(0.1 + 0.2, "en")).toEqual(["0", "point", "3"]);
    expect(numberPieces(12_305, "hi")).toEqual(["12", "हज़ार", "3", "सौ", "5"]);
    expect(numberPieces(-0, "en")).toEqual(["0"]);
    expect(numberPieces(123_456, "en")).toBeUndefined();
  });

  it("finds blanks in words only: braces in maths are maths", () => {
    expect(blanksOf("Is $x^{2}$ at {x}?")).toEqual(["x"]);
    expect(fixedParts("Is $x^{2}$ at {x}?")).toEqual(["Is $x^{2}$ at"]);
    // A number it doesn't say is written in full, for a voice that reads any words.
    expect(phrasesOf("Stop {x}.", { x: 123_456 }, "en")).toEqual(["Stop", "1,23,456"]);
  });
});
