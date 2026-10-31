# The move to the event model

Status: **done (2026-11-01).** Kept as the record of the move; [board-model.md](board-model.md) is the model now. One board system, the event model (event-model.md), everywhere: nothing runs two ways. Each step leaves `pnpm check` green and is committed on its own.

## Decided

- **Real Numbers is parked**, with what only it uses: to be remade on the event model later, like the other chapters to come.
- **Jugnu is parked** (the package, the app's chat and buttons, hold-to-ask, the server's turns and flags, the evals): rebuilt on the event model as its own task. Until then no board has him.
- **The prop panel is ported**: a prop's own page sets any field live and runs any action, for event-model props.
- Parked means moved out of the build into `parked/`, kept in git: nothing is deleted that a remake would want to read.

## The steps

1. **Park.** `content/class10-maths`, the props only it uses (primes, decimal, basics' multiChoice and orderSteps), the old question patterns (choice, check, multi-choice, order, words) and `library/registry/test-lesson.ts` move to `parked/`. The registry lists event-model props only.
2. **Park Jugnu.** `platform/packages/jugnu`, `player/jugnu-panel.tsx`, `ask-about.ts`, the app's Jugnu wiring, the server's `/JugnuTurn` route and flags, `studio/jugnu-eval`. The recorder's `jugnu` event goes.
3. **The player draws event-model props natively.** `PropViewProps` (what a view reads, how it calls an action) and `PropModule.def` are typed by event-model definitions; `group-view`, `prop-pages`, `lazy-views`, `snapshot` follow. `runtime.ts` (BoardRuntime), `headless.ts`, `check-prop.ts` and the old switch in `use-board-runtime.ts` go; `scene-runtime.ts` keeps what it imported from `runtime.ts`.
4. **One prop package.** What event-model props use from the old files (`PropRole`, frame kinds and pixels, note names, group layout, `withShown`, `AnswerStatus`, `BOARD`) moves into `next/`; `define.ts`, `group.ts`, `state.ts`, `steps.ts`, `question.ts`, `board.ts` go; `next/` becomes the package.
5. **The props.** coordinates: one definition (the event-model layers), its drawings typed to it, the shared schemas and helpers kept; the old layers, `coordinate-plane.ts`, `view.tsx`, `test-door.ts` and the old-runtime tests go (tests of shared logic move onto the event-model layers). basics: the old text, choice, goal go. patterns: `scene-*` stop borrowing from the old files.
6. **Authoring.** `page()` takes event-model boards only; `family()` builds them directly; the old board builder (`board.ts`: BoardKit, `buildBoard`) goes, `scene.ts` keeping its own `Step`, `NoteCheck`.
7. **Studio and apps.** The old validator (`validate.ts`), the old reach walk and witness path in the build, the old prop page in the preview go; the prop panel is ported.
8. **Names.** The migration's labels go: `sceneText` → `text`, `sceneChoice` → `choice`, `sceneGoal` → `goal`, `sceneCoordinatePlane` → `coordinatePlane` (and its layers), `SceneRuntime` → `BoardRuntime`, `prop/next` → `prop`. event-model.md becomes the board model's doc; board-model.md, making-a-prop.md, writing-content.md, glossary.md, architecture.md, how-it-works.md, AGENTS.md and the build-props skill are rewritten for it.
9. **Re-review** lesson 1 (its boards change by name only) and pass it.

## Lost until rebuilt

Jugnu (and with him: saving and resuming a board, `studentOnly`, the `purpose` / `standsFor` notes), the props only Real Numbers used, and the old validator's checks on `is` / `when` wiring (the event model's own build checks stand instead).
