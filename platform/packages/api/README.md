# @chalk/api

What the app and the server say to each other: paths, request and reply schemas (Zod), roles, error codes, and the codes people type (a group's join code, a school's code). Both sides parse with these schemas, so they can't drift apart.

How anything is worked out from a learner's record is `@chalk/learning`'s; this holds only the shapes on the wire.

May import: `@chalk/content` (event types), `@chalk/learning` (row shapes), `zod`.
