# @chalk/content

The content formats, as Zod schemas (types are inferred from them): lesson → board (its scene, and a layout tree of its pieces), sound cues, and events.

- `lesson.ts`, `board.ts`, `piece.ts`: what authors write ([docs/board-model.md](../../docs/board-model.md)).
- `event.ts`: events as an envelope (same on every event) plus one exactly-typed payload per kind, all `.strict()`. Bump `EVENT_SCHEMA_VERSION` when a payload changes shape.
- `sound/`: the contract for what is heard (platform/docs/sound.md): `clips.ts` (a sound, a chapter's clips and their list `sound.json`, keyed by voice and words), `cue.ts` (a cue as built: words or a sound, and `carries`), `spoken.ts` (a line's words → phrases). `localized.ts`: `{ en, hi }` text.
- `walk.ts`: walk a piece tree.

May import: `@chalk/prop` (types), `zod`. No UI.
