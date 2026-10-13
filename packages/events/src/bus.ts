import {
  type Actor,
  type ChalkEvent,
  EVENT_SCHEMA_VERSION,
  type EventFor,
  type EventPlace,
  type MachineEvent,
  type MachineType,
  eventSchema,
} from "@chalk/content";
import { makeId } from "./id";

/** How a widget records a commit: who did it, which machine, the input, and the state after. */
export type Raise = (actor: Actor, event: MachineEvent) => void;

/** `raiseEvent` bound to one machine: the widget passes only the input and the state after. */
export type RaiseEvent<T extends MachineType> = (
  actor: Actor,
  input: EventFor<T>["input"],
  state: EventFor<T>["state"],
) => void;

/** Binds a raiser to one machine, so a widget can't raise events for another one. */
export function bindRaise<T extends MachineType>(
  raise: Raise,
  machine: EventFor<T>["machine"],
): RaiseEvent<T> {
  // The compiler can't see that machine, input and state belong to the same machine type,
  // but the generic signature guarantees it, and the backbone checks the shape anyway.
  return (actor, input, state) => raise(actor, { machine, input, state } as MachineEvent);
}

export type Subscriber = (event: ChalkEvent) => void;

export type EventBus = {
  readonly sessionId: string;
  /** A raiser for one place (lesson and board). Producers only ever see this. */
  raiserFor: (place: EventPlace) => Raise;
  /** Listen to every event. Returns a function that stops listening. */
  subscribe: (subscriber: Subscriber) => () => void;
};

export type EventBusOptions = {
  sessionId?: string;
  now?: () => number;
  /** Called when a producer emits something that breaks its schema. Defaults to throwing. */
  onInvalid?: (problem: string, event: unknown) => void;
};

/**
 * The event backbone on the phone. It adds the envelope (id, session, order, time),
 * checks every event against its schema, and hands it to every subscriber.
 */
export function createEventBus(options: EventBusOptions = {}): EventBus {
  const sessionId = options.sessionId ?? makeId();
  const now = options.now ?? Date.now;
  const onInvalid =
    options.onInvalid ??
    ((problem: string) => {
      throw new Error(`Invalid event: ${problem}`);
    });
  const subscribers = new Set<Subscriber>();
  let seq = 0;

  const publish = (place: EventPlace, actor: Actor, raised: MachineEvent) => {
    const event = {
      envelope: {
        id: makeId(),
        schemaVersion: EVENT_SCHEMA_VERSION,
        sessionId,
        seq,
        producedAt: now(),
        actor,
        ...place,
      },
      ...raised,
    };
    const checked = eventSchema.safeParse(event);
    if (!checked.success) {
      onInvalid(
        checked.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
        event,
      );
      return;
    }
    seq++;
    for (const subscriber of subscribers) subscriber(checked.data);
  };

  return {
    sessionId,
    raiserFor: (place) => (actor, raised) => publish(place, actor, raised),
    subscribe: (subscriber) => {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}
