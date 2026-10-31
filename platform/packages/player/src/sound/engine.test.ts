import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// The engine against a stand-in for the browser's Web Audio: what it starts and stops, what it
// fetches and decodes. A page starts unable to sound, as a browser's does, until its first touch.

type Source = { url: string; loop: boolean; onended: (() => void) | null; isStopped: boolean };
const started: Source[] = [];
/** The channels' volumes, in the order the engine makes them (the voice's first, here). */
const channelGains: { gain: { value: number } }[] = [];
const volume = (channel: "voice" | "sounds") =>
  channelGains[channel === "voice" ? 0 : 1]?.gain.value;
let decoded = 0;
let fetched: string[] = [];
/** How each address answers: a recording, a missing file, or a network failure. */
const answers = new Map<string, "audio" | "missing" | "offline">();

class FakeAudioContext {
  state: "suspended" | "running" = "suspended";
  currentTime = 0;
  destination = {};
  private readonly listeners: (() => void)[] = [];
  addEventListener(_: string, listener: () => void): void {
    this.listeners.push(listener);
  }
  resume(): Promise<void> {
    this.state = "running";
    for (const listener of this.listeners) listener();
    return Promise.resolve();
  }
  createGain() {
    const node = {
      gain: { value: 1, setValueAtTime: () => undefined, linearRampToValueAtTime: () => undefined },
      connect: (to: unknown) => {
        if (to === this.destination) channelGains.push(node);
      },
    };
    return node;
  }
  createBufferSource() {
    const source: Source & Record<string, unknown> = {
      url: "",
      loop: false,
      onended: null,
      isStopped: false,
      buffer: null as { url: string } | null,
      connect: () => undefined,
      start() {
        source.url = (source.buffer as { url: string }).url;
        started.push(source);
      },
      stop() {
        source.isStopped = true;
        source.onended?.();
      },
    };
    return source;
  }
  decodeAudioData(bytes: ArrayBuffer): Promise<{ url: string }> {
    decoded++;
    return Promise.resolve({ url: new TextDecoder().decode(bytes) });
  }
}

const page = Object.assign(new EventTarget(), { AudioContext: FakeAudioContext });
let engine: typeof import("./engine");

const touch = async () => {
  page.dispatchEvent(new Event("pointerdown"));
  await settle();
};
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const ends = (url: string) => {
  for (const source of started) if (source.url === url && !source.isStopped) source.onended?.();
};

beforeAll(async () => {
  vi.stubGlobal("window", page);
  vi.stubGlobal("fetch", async (url: string) => {
    fetched.push(url);
    const answer = answers.get(url) ?? "audio";
    if (answer === "offline") throw new TypeError("offline");
    return answer === "missing"
      ? new Response(null, { status: 404 })
      : new Response(new TextEncoder().encode(url));
  });
  engine = await import("./engine");
});

beforeEach(() => {
  started.length = 0;
  fetched = [];
  decoded = 0;
});

describe("the sound engine", () => {
  it("can't sound before the page's first touch; then whatever waited goes on", async () => {
    expect(await engine.playClip("/a.m4a", "voice").done).toBe("blocked");
    let isAudible = false;
    void engine.whenAudible().then(() => {
      isAudible = true;
    });
    await settle();
    expect(isAudible).toBe(false);
    await touch();
    expect(isAudible).toBe(true);
  });

  it("plays a clip to its end, fetched once and decoded each time it plays", async () => {
    const first = engine.playClip("/b.m4a", "voice");
    await settle();
    expect(started.map((s) => s.url)).toEqual(["/b.m4a"]);
    ends("/b.m4a");
    expect(await first.done).toBe("heard");
    const again = engine.playClip("/b.m4a", "voice");
    await settle();
    ends("/b.m4a");
    expect(await again.done).toBe("heard");
    expect(fetched).toEqual(["/b.m4a"]);
    expect(decoded).toBe(2);
  });

  it("a clip that isn't there is broken, and isn't asked for again; one offline is", async () => {
    answers.set("/missing.m4a", "missing");
    expect(await engine.playClip("/missing.m4a", "voice").done).toBe("broken");
    expect(await engine.playClip("/missing.m4a", "voice").done).toBe("broken");
    expect(fetched).toEqual(["/missing.m4a"]);
    answers.set("/offline.m4a", "offline");
    expect(await engine.playClip("/offline.m4a", "voice").done).toBe("broken");
    expect(await engine.playClip("/offline.m4a", "voice").done).toBe("broken");
    expect(fetched.filter((u) => u === "/offline.m4a")).toHaveLength(2);
  });

  it("stopped before it loads, a clip is over at once and never starts", async () => {
    const playing = engine.playClip("/c.m4a", "voice");
    playing.stop();
    expect(await playing.done).toBe("heard");
    await settle();
    expect(started).toEqual([]);
  });

  it("a sound plays alongside, a repeat replacing it", async () => {
    engine.playSound({ name: "step", url: "/step.mp3" });
    await settle();
    engine.playSound({ name: "step", url: "/step.mp3" });
    await settle();
    expect(started.map((s) => [s.url, s.isStopped])).toEqual([
      ["/step.mp3", true],
      ["/step.mp3", false],
    ]);
  });

  it("muting a channel turns its volume to nothing: what plays still plays, unheard", async () => {
    const playing = engine.playClip("/d.m4a", "voice");
    await settle();
    expect(volume("voice")).toBe(1);
    engine.setMuted("voice", true);
    expect(volume("voice")).toBe(0);
    expect(started.map((s) => [s.url, s.isStopped])).toEqual([["/d.m4a", false]]);
    ends("/d.m4a");
    expect(await playing.done).toBe("heard");
    engine.setMuted("voice", false);
    expect(volume("voice")).toBe(1);
  });

  it("a lasting sound loops until its cue stops it", async () => {
    const { stop } = engine.playSound({ name: "rain", url: "/rain.mp3" }, true);
    await settle();
    expect(started.map((s) => [s.url, s.loop, s.isStopped])).toEqual([["/rain.mp3", true, false]]);
    stop();
    expect(started[0]?.isStopped).toBe(true);
  });
});
