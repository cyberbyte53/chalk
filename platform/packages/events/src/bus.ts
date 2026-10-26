import {
  type ChalkEvent,
  EVENT_SCHEMA_VERSION,
  type EventEntry,
  eventSchema,
} from "@chalk/content";
import { makeId } from "./id";

/** Adds one entry to the channel; returns its seq (-1 if it was refused as malformed). */
export type RecordEvent = (entry: EventEntry) => number;

export type Subscriber = (event: ChalkEvent) => void;

export type EventBus = {
  readonly session: string;
  /** The one door into the channel (docs/events.md). */
  record: RecordEvent;
  /** Listen to every entry. Returns a function that stops listening. */
  subscribe: (subscriber: Subscriber) => () => void;
};

export type EventBusOptions = {
  /** The commit the app was built from: on every entry. */
  commit: string;
  session?: string;
  now?: () => number;
  /** Called when a producer records something that breaks its kind's schema. Defaults to throwing. */
  onInvalid?: (problem: string, entry: unknown) => void;
};

/**
 * The event backbone on the phone. It adds the envelope (id, session, order, time, commit), checks
 * the payload against its kind's schema, and hands the entry to every subscriber (the uploader's
 * store, the phone's own progress).
 */
export function createEventBus(options: EventBusOptions): EventBus {
  const session = options.session ?? makeId();
  const now = options.now ?? Date.now;
  const onInvalid =
    options.onInvalid ??
    ((problem: string) => {
      throw new Error(`Invalid event: ${problem}`);
    });
  const subscribers = new Set<Subscriber>();
  let seq = 0;
  return {
    session,
    record: (entry) => {
      const event = {
        id: makeId(),
        schemaVersion: EVENT_SCHEMA_VERSION,
        session,
        seq,
        at: Math.round(now()),
        commit: options.commit,
        ...entry,
      };
      const checked = eventSchema.safeParse(event);
      if (!checked.success) {
        onInvalid(
          checked.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
          event,
        );
        return -1;
      }
      seq++;
      for (const subscriber of subscribers) subscriber(checked.data);
      return checked.data.seq;
    },
    subscribe: (subscriber) => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}
