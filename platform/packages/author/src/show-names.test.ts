import { PropRole, action, prop } from "@chalk/prop";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { hidden, place, scene } from "./scene";

const dial = prop({
  type: "dial",
  role: PropRole.Explainer,
  describe: "A dial",
  variables: z.object({ at: z.number() }).strict(),
  start: { at: 0 },
  actions: { turn: action({ to: z.number() }, { from: "screen", describe: "Turn it" }) },
  on: { turn: (_, { to }, t) => t.set({ at: to }) },
});

describe("a board shows and hides only its own pieces", () => {
  const board = scene({
    pieces: { d: place(dial), found: hidden(place(dial)) },
    onSaid: {
      d: (me, t) => {
        // @ts-expect-error: no piece "fuond" on this board, refused as it is written
        if (me.hidden.includes("fuond")) return [];
        // @ts-expect-error: the same for showing it
        t.self.show({ name: "fuond" });
        return me.hidden.includes("found") ? [t.self.show({ name: "found" })] : [];
      },
    },
  });

  it("refuses a name that isn't a piece, as the board runs", () => {
    const actions = board.build("names").board.model.scene.actions as Record<
      string,
      { payload: z.ZodTypeAny }
    >;
    expect(actions.show?.payload.safeParse({ name: "found" }).success).toBe(true);
    expect(actions.show?.payload.safeParse({ name: "fuond" }).success).toBe(false);
    expect(actions.hide?.payload.safeParse({ name: "fuond" }).success).toBe(false);
  });
});
