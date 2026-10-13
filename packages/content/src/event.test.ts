import { describe, expect, it } from "vitest";
import { EVENT_SCHEMA_VERSION, MachineType, eventSchema, isEventFor } from "./event";

const envelope = {
  id: "e1",
  schemaVersion: EVENT_SCHEMA_VERSION,
  sessionId: "s1",
  seq: 3,
  producedAt: 1791692957412,
  actor: "learner",
  lessonId: "class9-maths/ch1/where-is-root-2",
  contentVersion: "0.1.1",
  boardId: 2,
};

const check = {
  envelope,
  machine: { type: "question", id: 4 },
  input: {
    type: "check",
    submitted: { kind: "prop", propId: 3, state: { from: 1, to: 2, marker: 1.41 } },
  },
  state: { status: "correct", attempts: 2 },
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
      eventSchema.safeParse({ ...check, state: { status: "correct", attempts: 2, extra: 1 } })
        .success,
    ).toBe(false);
  });
  it("refuses a time that is not Unix ms", () => {
    const bad = { ...check, envelope: { ...envelope, producedAt: "2026-10-11T10:00:00Z" } };
    expect(eventSchema.safeParse(bad).success).toBe(false);
  });
  it("accepts lesson and board events", () => {
    const lessonStart = {
      envelope: { ...envelope, actor: "app", boardId: null },
      machine: { type: "lesson", id: "class9-maths/ch1/where-is-root-2" },
      input: { type: "start" },
      state: { status: "playing", boardIndex: 0 },
    };
    const boardContinue = {
      envelope,
      machine: { type: "board", id: 2 },
      input: {
        type: "continue",
        props: { "3": { isTouched: true, state: { from: 1, to: 2, marker: 1.41 } } },
      },
      state: { phase: "passed" },
    };
    expect(eventSchema.safeParse(lessonStart).success).toBe(true);
    expect(eventSchema.safeParse(boardContinue).success).toBe(true);
  });
});
