import { describe, expect, it } from "vitest";
import { EVENT_SCHEMA_VERSION, MachineType, eventSchema, isEventFor } from "./event";

const envelope = {
  id: "e1",
  schemaVersion: EVENT_SCHEMA_VERSION,
  sessionId: "s1",
  seq: 3,
  producedAt: 1791692957412,
  actor: "learner",
  lessonId: "concept/975e4c05ea34e125",
  item: { id: "aaaaaaaaaaaaaaaa", path: "b/c/d/overview/guess.json", version: "0123456789abcdef" },
};

const check = {
  envelope,
  machine: { type: "question", id: "aaaaaaaaaaaaaaaa#guessRoot" },
  input: {
    type: "check",
    submitted: { kind: "prop", node: "line", facts: { from: 1, to: 2, marker: 1.41 } },
    saw: [{ path: "line/marker", value: 1.41, words: "1.41" }],
  },
  state: { status: "correct", attempts: 2, isGraded: true },
};

describe("eventSchema", () => {
  it("accepts a question check", () => {
    const parsed = eventSchema.parse(check);
    expect(isEventFor(parsed, MachineType.Question) && parsed.state.attempts).toBe(2);
  });
  it("refuses an input the machine does not accept", () => {
    expect(
      eventSchema.safeParse({ ...check, input: { type: "continue", props: {} } }).success,
    ).toBe(false);
  });
  it("refuses state fields that do not belong", () => {
    expect(
      eventSchema.safeParse({
        ...check,
        state: { status: "correct", attempts: 2, isGraded: true, extra: 1 },
      }).success,
    ).toBe(false);
  });
  it("refuses a time that is not Unix ms", () => {
    const bad = { ...check, envelope: { ...envelope, producedAt: "2026-10-11T10:00:00Z" } };
    expect(eventSchema.safeParse(bad).success).toBe(false);
  });
  it("accepts lesson and board events", () => {
    const lessonStart = {
      envelope: { ...envelope, actor: "app", item: null },
      machine: { type: "lesson", id: "class9-maths/ch1/where-is-root-2" },
      input: { type: "start" },
      state: { status: "playing", boardIndex: 0 },
    };
    const boardContinue = {
      envelope,
      machine: { type: "board", id: "aaaaaaaaaaaaaaaa" },
      input: {
        type: "continue",
        nodes: {
          line: { type: "numberLine@0a1b2c3d", isTouched: true, facts: { marker: 1.41 } },
        },
        actions: [{ node: "line", action: "moveMarker", args: { to: 1.41 }, t: 3.2 }],
      },
      state: { phase: "passed" },
    };
    expect(eventSchema.safeParse(lessonStart).success).toBe(true);
    expect(eventSchema.safeParse(boardContinue).success).toBe(true);
    const lessonBack = {
      ...lessonStart,
      envelope: { ...envelope, actor: "learner" },
      input: { type: "back" },
    };
    expect(eventSchema.safeParse(lessonBack).success).toBe(true);
  });
});
