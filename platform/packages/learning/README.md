# @chalk/learning

What a child's record says about them, worked out step by step, each a pure function of the step
before (platform/docs/plans/learner-contracts.md):

    events ─► attempts (with the catalogue) ─► mastery
          └─► passes ─┴──────────────────────► progress (with the course's plans)

- `catalogue.ts`: each question version's concepts and level.
- `attempts.ts`: every check of a question, with the learner's nth try ever, the mode, and whether Jugnu had helped.
- `mastery.ts`: how well they understand each concept (the models).
- `progress.ts`: pages passed and practice done, by concept.

The phone and the server run the same code. No database, HTTP or screens here.

May import: `@chalk/content`, `zod`.
