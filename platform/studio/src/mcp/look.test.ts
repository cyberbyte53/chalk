import { describe, expect, it } from "vitest";
import { eventLines } from "./look";

const cause = (action: string, args: Record<string, unknown>) =>
  `cause learner ${JSON.stringify({ action, args })}`;
const signal = (name: string, payload: Record<string, unknown>) =>
  `signal learner ${JSON.stringify({ signal: name, payload })}`;

describe("a step's events in words", () => {
  it("folds a drag's run of moves into one line, first to last, the signals beside it", () => {
    const events = [1, 2, 3].flatMap((k) => [
      cause("movePoint", { x: 4 - 2 * k, y: 3 }),
      signal("moved", { x: 4 - 2 * k, y: 3 }),
    ]);
    expect(eventLines(events, "en")).toEqual([
      "movePoint ×3: {x: 2, y: 3} → {x: -2, y: 3}",
      "signal moved ×3: {x: 2, y: 3} → {x: -2, y: 3}",
    ]);
  });

  it("leaves different events as they came", () => {
    expect(
      eventLines(
        [cause("giveRound", {}), signal("round", { rounds: 1 }), cause("startAgain", {})],
        "en",
      ),
    ).toEqual(["giveRound", "signal round {rounds: 1}", "startAgain"]);
  });
});
