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
  /** Up to `limit` waiting events, in order: by session, then seq. */
  take: (limit: number) => Promise<ChalkEvent[]>;
  remove: (ids: readonly string[]) => Promise<void>;
};

/** The order events are sent in: by session, then seq (the phone's clock can't order them). */
const inOrder = (a: ChalkEvent, b: ChalkEvent) =>
  a.session < b.session ? -1 : a.session > b.session ? 1 : a.seq - b.seq;

export function memoryStore(): EventStore {
  const waiting = new Map<string, ChalkEvent>();
  return {
    add: async (event) => {
      waiting.set(event.id, event);
    },
    take: async (limit) => [...waiting.values()].sort(inOrder).slice(0, limit),
    remove: async (ids) => {
      for (const id of ids) waiting.delete(id);
    },
  };
}

const DB = "chalk";
const STORE = "events";
/** 2: entries in the shape of event.ts v2, ordered by (session, seq). */
const DB_VERSION = 2;

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
    const open = indexedDB.open(DB, DB_VERSION);
    open.onupgradeneeded = () => {
      // Entries of an older shape can't be read by the server any more: they go.
      if (open.result.objectStoreNames.contains(STORE)) open.result.deleteObjectStore(STORE);
      const store = open.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("order", ["session", "seq"]);
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
            .index("order")
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
        await store.remove(batch.map((event) => event.id));
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
