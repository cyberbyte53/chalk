import { Actor, type ChalkEvent, MachineType } from "@chalk/content";
import { createEventBus } from "@chalk/events";
import { describe, expect, it } from "vitest";
import { memoryStore, startUploader } from "./uploader";

function raiseStarts(bus: ReturnType<typeof createEventBus>, count: number) {
  const raise = bus.raiserFor({ lessonId: "concept/c1", contentVersion: null, boardId: null });
  for (let i = 0; i < count; i++)
    raise(Actor.App, {
      machine: { type: MachineType.Lesson, id: "concept/c1" },
      input: { type: "start" },
      state: { status: "playing", boardIndex: 0 },
    });
}

describe("uploader", () => {
  it("keeps events until the server has them, in batches", async () => {
    const bus = createEventBus();
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

    raiseStarts(bus, 250);
    await uploader.flush();
    expect(sent).toHaveLength(0);
    expect(await store.take(1000)).toHaveLength(250);

    isOnline = true;
    await uploader.flush();
    expect(sent.map((batch) => batch.length)).toEqual([200, 50]);
    expect(await store.take(1000)).toHaveLength(0);
    uploader.stop();
  });
});
