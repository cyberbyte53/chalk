# @chalk/author

How content is written. Content is TypeScript that builds boards, so params, rules and witnesses are typed; the build (studio) runs it once and writes plain JSON naming the module that makes each board.

- `scene.ts`: `scene({ pieces, hear, onSaid, give, cues, uses, passBy, witness, noteChecks })`, a board ([board-model.md](../../docs/board-model.md#a-board-its-scene)); `place(def, given, options)`, `hidden(…)`; `tap(piece, action, args)`, a witness step.
- `steps.ts`: a witness (`Step`: taps and waits), `NoteCheck`, `BuiltBoard`.
- `sound.ts`: cues (`cue(…)`): what is heard at a moment, words or a sound; the two rules a line is said by.
- `page.ts`: `page(key, scene)`, a theory page; a concept's `overview.ts` exports `overview`, its pages in order.
- `family.ts`: `family({ level, tests, params, build })`, a question template in a chapter's bank, built once per row of its `params.yaml`; `tests` takes the chapter's generated `Concept` enum.
- `item.ts`: a built item's board, made from its module (`boardOf`), the one way any copy of it is made.
- `params.ts`: `decimal` (text → exact `Dec`), `noParams`.
- `manifest.ts`: the `build.yaml` schemas (root, book, chapter, concept), `params.yaml` rows, `graph.yaml`; the file names the build looks for.
- `id.ts`: `idOf(path, params?)`, `versionOf(item)`, `canonical`, `hashOf`. `site.ts`: where a page or piece was written (file:line).

The built formats (`BuiltConcept`, `BuiltQuestion`, …) live in `@chalk/content`, since the app and the server read them.

May import: `@chalk/content`, `@chalk/prop`, `@chalk/exact`, `zod`, `node:crypto`. Never a specific prop (content imports those itself).
