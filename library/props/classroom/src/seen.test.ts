import { type PropView, checkProp, describeView } from "@chalk/player";
import { Board } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { classroomProp } from "./index";

const LINES = [
  { en: "1. The lessons weren't interesting enough", hi: "1. पाठ काफ़ी रोचक नहीं थे" },
  { en: "2. I couldn't help every child", hi: "2. मैं हर बच्चे की मदद नहीं कर पाया" },
];

/** The class placed with these fields, after these board actions, as the student sees it. */
function seen(
  given: Readonly<Record<string, unknown>> = {},
  sends: [string, Record<string, unknown>][] = [],
  locale: "en" | "hi" = "en",
) {
  const board = new Board(classroomProp.def, given as never);
  for (const [action, payload] of sends) {
    board.send("", action, payload);
    board.runUntilIdle();
  }
  const d = describeView(classroomProp, board.read() as unknown as PropView, locale);
  return {
    ...d,
    ids: d.elements.map((e) => e.id),
    at: (id: string) => d.elements.find((e) => e.id === id),
  };
}

describe("what the student sees", () => {
  it("every input says what it does, and every student action is offered", () => {
    expect(
      checkProp(classroomProp, [{}, { lost: 12 }, { lost: 12, asking: [5, 9] }, { lit: 12 }]),
    ).toEqual([]);
  });

  it("at the start: twelve children following, none to tap; a clean board; the teacher facing", () => {
    const s = seen();
    expect(s.at("child:0")).toMatchObject({ value: "following", words: "following" });
    expect(s.ids.filter((id) => id.startsWith("child:"))).toHaveLength(12);
    expect(s.ids.some((id) => id.startsWith("help"))).toBe(false);
    expect(s.at("board")).toMatchObject({ value: [], words: "a clean board" });
    expect(s.at("teacher")?.value).toBe("facing the class");
    expect(s.summary).toContain("12 following");
  });

  it("lost, with two hands up: each lost or asking child can be tapped", () => {
    const s = seen({}, [
      ["loseThem", { seconds: 2 }],
      ["raiseHands", { who: [5, 9] }],
    ]);
    expect(s.at("child:5")).toMatchObject({ value: "asking", words: "hand up, waiting" });
    expect(s.at("child:2")?.value).toBe("lost");
    expect(s.ids.filter((id) => id.startsWith("help:"))).toHaveLength(12);
    expect(s.summary).toContain("10 lost, 2 with a hand up");
  });

  it("the board's lines, in English and Hindi", () => {
    expect(seen({ lines: LINES }).at("board")?.value).toEqual(LINES.map((l) => l.en));
    expect(seen({ lines: LINES }, [], "hi").at("board")?.value).toEqual(LINES.map((l) => l.hi));
  });

  it("the closing: standings over the children, the stuck one tappable, the teacher beside them", () => {
    const standing = Array.from({ length: 12 }, (_, i) =>
      i === 6
        ? { kind: "needsHelp", words: { en: "swaps the numbers", hi: "संख्याएँ उलट देता है" } }
        : i === 2
          ? { kind: "curious", words: { en: "curious about mirrors", hi: "दर्पण के बारे में जिज्ञासु" } }
          : { kind: "onTrack", words: null },
    );
    const lit = seen({ standing }, [
      ["lightUp", { seconds: 2 }],
      ["revealStanding", { seconds: 2 }],
    ]);
    expect(lit.at("child:6")?.value).toBe("stuck");
    expect(lit.ids).toContain("help:6");
    expect(lit.at("standing:6")).toMatchObject({ value: "needsHelp", words: "swaps the numbers" });
    expect(lit.at("standing:0")).toMatchObject({ value: "onTrack", words: "on track" });
    const after = seen({ standing }, [
      ["lightUp", { seconds: 2 }],
      ["visit", { child: 6, seconds: 2 }],
      ["spark", { seconds: 1 }],
    ]);
    expect(after.at("teacher")?.value).toBe("beside a child");
    expect(after.at("child:6")?.value).toBe("litUp");
    expect(after.at("child:2")).toMatchObject({
      value: "curious",
      words: "curious, a hand up to ask",
    });
    expect(after.ids).not.toContain("standing:6");
  });

  it("the after: all lit up, none to tap", () => {
    const s = seen({}, [["lightUp", { seconds: 3 }]]);
    expect(s.at("child:11")?.value).toBe("litUp");
    expect(s.ids.some((id) => id.startsWith("help"))).toBe(false);
  });
});
