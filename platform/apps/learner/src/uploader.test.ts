import { Actor, type ChalkEvent } from "@chalk/content";
import { createEventBus } from "@chalk/events";
import { describe, expect, it } from "vitest";
import { memoryStore, startUploader } from "./uploader";

function opens(bus: ReturnType<typeof createEventBus>, count: number) {
  for (let i = 0; i < count; i++)
    bus.record({
      actor: Actor.App,
      opening: null,
      board: null,
      version: "v",
      node: "c1",
      kind: "open",
      payload: {},
    });
}

describe("uploader", () => {
  it("keeps events until the server has them, in batches", async () => {
    const bus = createEventBus({ commit: "abc" });
    const store = memoryStore();
    const sent: ChalkEvent[][] = [];
    let isOnline = false;
    const uploader = startUploader({
      bus,
      store,
      isAutomatic: false,
      send: async (events) => {
        if (!isOnline) throw new Error("offline");
        sent.push([...events]);
        return { saved: events.length, rejected: [] };
      },
    });

    opens(bus, 250);
    await uploader.flush();
    expect(sent).toHaveLength(0);
    expect(await store.take(1000)).toHaveLength(250);

    isOnline = true;
    await uploader.flush();
    expect(sent.map((batch) => batch.length)).toEqual([200, 50]);
    expect(sent.flat().map((e) => e.seq)).toEqual([...Array(250).keys()]);
    expect(await store.take(1000)).toHaveLength(0);
    uploader.stop();
  });
});
