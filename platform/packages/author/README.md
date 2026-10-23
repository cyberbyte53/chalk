# @chalk/author

How content is written. Content is TypeScript that builds boards, so params, rules and witnesses are typed; the build (studio) runs it once and writes plain JSON. Nothing here ships to the app.

- `board.ts`: `BoardKit` (`b.prop`, `b.is`, `b.when`, `b.studentOnly`, `b.witness`, `b.noteCheck`), `Placed` (fields, derived fields, signals and actions typed from the prop's definition), layout (`column`, `row`, `overlay`, `space`), scripts (`inOrder`, `together`, `wait`), `theBoard`.
- `expr.ts`: `Expr`, typed rule expressions written out as the expression language (`isAt` compares a learner's number with an exact `Dec`).
- `page.ts`: `page(key, build, { passOn })`, a theory page; a concept's `overview.ts` exports `overview`, its pages in order.
- `family.ts`: `family({ level, tests, params, build })`, a question template in a chapter's bank, built once per row of its `params.yaml`; `tests` takes the chapter's generated `Concept` enum.
- `params.ts`: `decimal` (text → exact `Dec`), `noParams`.
- `manifest.ts`: the `build.yaml` schemas (root, book, chapter, concept), `params.yaml` rows, `graph.yaml`; the file names the build looks for.
- `id.ts`: `idOf(path, params?)`, `versionOf(item)`, `canonical`, `hashOf`.

The built formats (`BuiltConcept`, `BuiltQuestion`, …) live in `@chalk/content`, since the app and the server read them.

May import: `@chalk/content`, `@chalk/prop`, `@chalk/exact`, `zod`, `node:crypto`. Never a specific prop (content imports those itself).
