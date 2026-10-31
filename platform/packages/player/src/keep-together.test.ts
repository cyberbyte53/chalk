import { describe, expect, it } from "vitest";
import { joinsNext, keepTogether } from "./keep-together";

const shown = (s: string) => s.replaceAll(" ", "⍽");

describe("keeping things together on screen", () => {
  it("a number with its unit, a word with its number, … with what comes before", () => {
    expect(shown(keepTogether("every spot is 5 cm from the left edge"))).toBe(
      "every spot is⍽5⍽cm from the left edge",
    );
    expect(shown(keepTogether("He replies: Street 4. Then row 3, then −2"))).toBe(
      "He replies: Street⍽4. Then row⍽3, then⍽−2",
    );
    expect(shown(keepTogether("नीचे के किनारे से 9 cm ऊपर, गली 4 में"))).toBe(
      // A short word after a number stays with it: a unit, and in Hindi a postposition (में).
      "नीचे के किनारे से⍽9⍽cm ऊपर, गली⍽4⍽में",
    );
    expect(shown(keepTogether("−1, −2, −3, …।"))).toBe("−1,⍽−2,⍽−3,⍽…।");
    expect(shown(keepTogether("the cross-street (2, 5) and (−4, 3)"))).toBe(
      "the cross-street (2,⍽5) and (−4,⍽3)",
    );
  });

  it("leaves every other space alone: a long word after a number still wraps", () => {
    expect(keepTogether("1 house and 12 streets")).toBe("1 house and 12 streets");
  });

  it("across pieces: a word before a bold number", () => {
    expect(shown(joinsNext("Its stand is at ", "0"))).toBe("Its stand is at⍽");
    expect(joinsNext("the ", "house")).toBe("the ");
  });
});
