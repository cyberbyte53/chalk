# A question written once on a board

Status: build plan, for review. Item 2+5 of `simpler-boards.md`.

## Today

A question is written three times (`two-numbers-for-a-place/overview.ts:18, 115, 133`):

```ts
const side = choice({ name: "side", prompt, options, answer: "left" });   // made, with a name
scene({ pieces: { side: hidden(side.piece) },                               // placed, the name again
        uses: [side.use] })                                                 // listed, or it loses its checks
```

`choice` and `check` (`library/patterns/questions.ts`) return `{ piece, use }`. `use` (a `SceneUse`,
`platform/packages/author/src/scene.ts:293`) carries what the question adds to the board, all keyed by
its name: `give` (a check's `isMet`, `answer`), `hear` (`<name>.wrong` → a note), `cues` (a choice's
notes), `witness` (`tap(name, …)`), `noteChecks`. The name also seeds the option shuffle
(`questions.ts:112`). `uses` is made only by `questions.ts`. Forget `uses`, or let the key differ from
`name`, and the board silently loses its checks, or its rules point at nothing.

## The shape

The question goes in `pieces` once; its name is its key.

```ts
scene({ pieces: { side: hidden(choice({ prompt, options, answer: "left" })) } })
```

- `choice(spec)` and `check(spec)` return a **question**: a `Placed` of its prop (so `hidden()`, the
  scene's typing by `P[K]["def"]`, and `t.to.side…` all work as for any piece), carrying one more thing,
  `ask(name) → { given, use }`: what it is given and what it adds to the board, once it knows its name.
- `buildScene` (`scene.ts:304`), for each piece that is a question, calls `ask(key)`: the piece's `given`
  is replaced (the options shuffled with the key as today's name), and its `use` joins the board's, where
  `spec.uses` joins today (`scene.ts:340, 515, 547, 715, 721`).
- `name` leaves `choice`/`check`'s spec; `uses` leaves `SceneSpec`.
- A board placing a question's steps itself (out of order) keeps doing so with `tap(key, …)`; the scene
  still adds a question's own witness only when the board's doesn't already take every step of it
  (`scene.ts:713-718`, unchanged).

## The witness taps boards repeat by hand

`coordinates-of-a-point/overview.ts:508, 777, 946, 1249` type a question's answer taps the scene adds
anyway, at the same place (the end): deleted. `the-cartesian-plane/overview.ts:297` puts them before
Riya's walk: kept.

## Proof

- Every board's witness steps, listed before and after: the same steps, in the same order.
- `pnpm snapshot`: 0 differences. Option order is in the drawn markup, so a key that isn't today's name
  shows as a difference.
- `pnpm check`.

## Questions for the review

1. Every place a question is made (lessons, families, `library/patterns/plane.ts`): is its piece key
   today's `name` (default `"ask"`)? Any board that places the same question twice, or reads `.piece` /
   `.use` elsewhere?
2. Does anything else read `uses` or `SceneUse` (tests, the catalogue, the content build, `scriptOf`)?
3. Typing: does a `Placed` with an extra `ask` keep `SceneMe`, `HeardPaths` and `t.to` exact?
4. Simpler?
