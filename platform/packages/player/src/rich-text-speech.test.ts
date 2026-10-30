import { describe, expect, it } from "vitest";
import { richSpeech } from "./rich-text-speech";

describe("rich text, said aloud", () => {
  it("says words, bold and emphasis as their words, as written", () => {
    expect(richSpeech("Street **4** rises, *up*", "en").pieces).toEqual([
      { kind: "words", text: "Street " },
      { kind: "words", text: "4" },
      { kind: "words", text: " rises, " },
      { kind: "words", text: "up" },
    ]);
  });
  it("never turns maths into words itself: a reader may draft it", () => {
    const read = (latex: string) => (latex === "x^2" ? "x squared" : undefined);
    expect(richSpeech("Is $x^2$, even?", "en", read).pieces).toEqual([
      { kind: "words", text: "Is " },
      { kind: "maths", latex: "x^2", draft: "x squared" },
      { kind: "words", text: "," },
      { kind: "words", text: " even?" },
    ]);
    expect(richSpeech("Is $x^2$ even?", "en").pieces[1]).toEqual({
      kind: "maths",
      latex: "x^2",
      draft: undefined,
    });
  });
  it("says when the text doesn't read cleanly", () => {
    expect(richSpeech("an $unclosed formula", "en").problems).toHaveLength(1);
  });
});
