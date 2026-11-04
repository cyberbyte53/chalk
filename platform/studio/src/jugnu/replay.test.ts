import type { EventEntry } from "@chalk/content";
import { recordBoard, replay } from "@chalk/player";
import { describe, expect, it } from "vitest";
import { played, readCases } from "./cases";

// A board's events, played again on a fresh board, bring it to exactly where it was
// (platform/docs/plans/jugnu-timeline.md): the one replay the run viewer stands on.
describe("replay", () => {
  for (const one of readCases().filter((c) => c.steps.length > 0)) {
    it(`brings ${one.name}'s board back to where it was`, async () => {
      const events: EventEntry[] = [];
      const live = await played(one.board, one.steps, (runtime) => {
        recordBoard(runtime, (e) => events.push(e) - 1, "test");
      });
      const again = await played(one.board, []);
      await replay(again, events);
      expect(JSON.parse(JSON.stringify(again.state()))).toEqual(
        JSON.parse(JSON.stringify(live.state())),
      );
      expect(events.some((e) => e.kind === "cause")).toBe(true);
      live.dispose();
      again.dispose();
    });
  }
});
