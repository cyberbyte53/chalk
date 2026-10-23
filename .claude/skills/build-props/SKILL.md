---
name: build-props
description: Build or extend the props an approved chapter plan needs, before any lesson is written. Use after plan.md is approved. Follows the prop contract (platform/docs/making-a-prop.md), registers the prop, regenerates the catalogue, and leaves pnpm check green.
---

# Build the props for a chapter

Props come first because lessons are written against their actions and derived fields: a lesson written before its prop exists is written twice.

## Pre-conditions

- `content/<book>/<chapter>/plan.md` has `status: approved`. If not, stop and say so.
- `library/catalogue.md` is current (`pnpm catalogue --check`).

## Steps

For each prop in the plan's `## Props`:

1. **Reused as is**: nothing to build. Note it in the run.
2. **Extended**: open the prop's `README.md` and `model.ts`; add the field or action the plan names, with a law test for it; keep every existing lesson passing (`pnpm test`, `pnpm build-content`).
3. **New**: follow `platform/docs/making-a-prop.md` exactly, in its order: README (the contract) → `model.test.ts` (the laws, against hand-known cases) → `model.ts` → `view.tsx` + `styles.css` → `defs.ts` and `index.ts` → one line in `library/registry/src/index.ts` (and its styles import). A new prop lives in `library/props/`, never inside a chapter. A story-scene prop (illustrations for the mission) is one prop per chapter, `isExplainer: false`.
4. `pnpm catalogue` and commit the regenerated `library/catalogue.md`.
5. `pnpm check` must pass before the run is written.
6. Append `runs/<YYYY-MM-DD-HHMM>-props.md`: which props were reused, extended, built; what tests cover them; anything the plan asked for that was changed, and why.

## Rules that bite

- Every change to a prop's state is an action through the one door; the view owns no state.
- No `Math.random`; chance is seeded and the seed is state.
- Draw with `@chalk/draw` and the look's tokens only; styles scoped to the prop's prefix.
- Exact formulas over stepped simulation; store the setup, derive the rest.
- The observation (`observe`) says what the student sees; Jugnu sees nothing else.
