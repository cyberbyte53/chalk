import { EVENTS_PER_BATCH, type EventsReply } from "@chalk/api";
import type { ChalkEvent } from "@chalk/content";
import type { EventBus } from "@chalk/events";

/**
 * Events wait on the phone until the server has them (docs/events.md): every event goes into a
 * store first, and the store is sent in batches whenever there's a chance (every 30 s, coming back
 * online, the app going to the background). Nothing is lost offline or on a lost reply: the server
 * keeps each event once by its id.
 */
export type EventStore = {
  add: (event: ChalkEvent) => Promise<void>;
  /** Up to `limit` waiting events, oldest first where the store can tell. */
  take: (limit: number) => Promise<ChalkEvent[]>;
  remove: (ids: readonly string[]) => Promise<void>;
};

export function memoryStore(): EventStore {
  const waiting = new Map<string, ChalkEvent>();
  return {
    add: async (event) => {
      waiting.set(event.envelope.id, event);
    },
    take: async (limit) => [...waiting.values()].slice(0, limit),
    remove: async (ids) => {
      for (const id of ids) waiting.delete(id);
    },
  };
}

const DB = "chalk";
const STORE = "events";

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** The phone's own store (IndexedDB), so events survive closing the app; memory if it's missing. */
export async function deviceStore(): Promise<EventStore> {
  if (typeof indexedDB === "undefined") return memoryStore();
  try {
    const open = indexedDB.open(DB, 1);
    open.onupgradeneeded = () => {
      const store = open.result.createObjectStore(STORE, { keyPath: "envelope.id" });
      store.createIndex("producedAt", "envelope.producedAt");
    };
    const db = await request(open);
    const tx = (mode: IDBTransactionMode) => db.transaction(STORE, mode).objectStore(STORE);
    return {
      add: async (event) => {
        await request(tx("readwrite").put(event));
      },
      take: async (limit) =>
        (await request(
          // IndexedDB counts are unsigned 32-bit.
          tx("readonly")
            .index("producedAt")
            .getAll(null, Math.min(limit, 2 ** 32 - 1)),
        )) as ChalkEvent[],
      remove: async (ids) => {
        const store = tx("readwrite");
        await Promise.all(ids.map((id) => request(store.delete(id))));
      },
    };
  } catch (error) {
    // Private browsing or storage blocked: keep events for this visit only.
    console.warn(`Events kept in memory only: ${error instanceof Error ? error.message : error}`);
    return memoryStore();
  }
}

export type Uploader = {
  /** Sends everything waiting, batch by batch; stops at the first failure (to try again later). */
  flush: () => Promise<void>;
  stop: () => void;
};

export const UPLOAD_EVERY_MS = 30_000;

export function startUploader(options: {
  bus: EventBus;
  store: EventStore;
  send: (events: readonly ChalkEvent[]) => Promise<EventsReply>;
  /** Timers and page events; left out in tests. */
  isAutomatic?: boolean;
}): Uploader {
  const { bus, store, send } = options;
  let isFlushing = false;
  let isStopped = false;
  const saving = new Set<Promise<void>>();

  const flush = async () => {
    if (isFlushing || isStopped) return;
    isFlushing = true;
    try {
      await Promise.all(saving);
      for (;;) {
        const batch = await store.take(EVENTS_PER_BATCH);
        if (batch.length === 0) return;
        try {
          await send(batch);
        } catch {
          return; // offline, signed out or the server is down: they wait for the next try
        }
        // Saved, already saved, or refused as unreadable: none of them should be sent again.
        await store.remove(batch.map((event) => event.envelope.id));
        if (batch.length < EVENTS_PER_BATCH) return;
      }
    } finally {
      isFlushing = false;
    }
  };

  const unsubscribe = bus.subscribe((event) => {
    const saved = store.add(event).catch((error) => console.error("event not kept", error));
    saving.add(saved);
    void saved.finally(() => saving.delete(saved));
  });

  const stops: (() => void)[] = [unsubscribe];
  if (options.isAutomatic !== false) {
    const timer = setInterval(() => void flush(), UPLOAD_EVERY_MS);
    const onOnline = () => void flush();
    const onHidden = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onHidden);
    stops.push(
      () => clearInterval(timer),
      () => window.removeEventListener("online", onOnline),
      () => document.removeEventListener("visibilitychange", onHidden),
    );
    void flush();
  }

  return {
    flush,
    stop: () => {
      isStopped = true;
      for (const stop of stops) stop();
    },
  };
}
