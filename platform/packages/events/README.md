# @chalk/events

The event backbone on the phone (see `docs/events.md`). Producers get an `Emit` for their place and call `emit(actor, payload)`; the bus adds the envelope (id, session, sequence number, Unix ms time), checks the event against its schema, and hands it to every subscriber (dev log, uploader, …).

- `bus.ts`: `createEventBus`, `emitterFor`, `subscribe`.
- `id.ts`: ids that work on insecure pages too.

May import: `@chalk/content`. No UI.
