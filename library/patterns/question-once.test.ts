import { hidden, scene, t, tap } from "@chalk/author";
import { describe, expect, it } from "vitest";
import { check, choice } from "./questions";

/**
 * A question is placed once, in a board's pieces: its key is its name, and it brings its witness
 * and its note checks. Its answer joins the board's witness at the end, unless the board's own
 * witness already takes every step of it (a board that must answer it out of order).
 */
const side = () =>
  choice({
    prompt: t("Which side?", "किस ओर?"),
    options: [
      { id: "left", label: t("Left", "बाएँ") },
      { id: "right", label: t("Right", "दाएँ"), feedback: t("Not that one.", "वह नहीं।") },
    ],
    answer: "left",
  });

describe("a question written once", () => {
  it("is named by its key, and brings its witness and notes", () => {
    const built = scene({ pieces: { side: hidden(side()) } }).build("once");
    expect(built.witness).toEqual([
      { kind: "act", prop: "side", action: "select", args: { option: "left" } },
      { kind: "act", prop: "side", action: "check", args: {} },
    ]);
    expect(built.noteChecks.map((n) => n.steps.map((s) => (s as { prop: string }).prop))).toEqual([
      ["side", "side"],
    ]);
    expect(built.board.model.given.side).toBeDefined();
  });

  it("is answered once: a board that answers it itself isn't given its steps again", () => {
    const answer = [tap("side", "select", { option: "left" }), tap("side", "check")];
    const built = scene({ pieces: { side: side() }, witness: answer }).build("own");
    expect(built.witness).toHaveLength(2);
  });

  it("a check's note is a line of the board's: shown and said from the same words", () => {
    const note = t("The column comes first.", "स्तंभ पहले आता है।");
    const ask = check({
      about: "room",
      prompt: t("Tap the desk.", "डेस्क दबाओ।"),
      isRight: () => false,
      solve: [],
      notes: [{ when: () => true, say: note, reach: [] }],
    });
    const built = scene({ pieces: { ask } }).build("note");
    expect(built.board.model.lines["ask-note1"]).toMatchObject({ says: note });
    expect(built.noteChecks[0]?.feedback).toEqual(note);
  });
});
