---
name: build-props
description: Build or extend the props an approved chapter plan needs, before any lesson is written. Use after plan.md is approved. Follows the prop contract (platform/docs/making-a-prop.md), registers the prop, regenerates the catalogue, and leaves pnpm check green.
---

# Build the props for a chapter

Props come first: lessons are written against their actions and fields.

## Read first

`authoring/taste/constitution.md`, `authoring/taste/guides/props.md`, `platform/docs/making-a-prop.md`, and one prop from `authoring/taste/exemplars.md`.

## Pre-conditions

`plan.md` has `status: approved` (otherwise stop and say so).

## Steps

For each prop in the plan's `## Props`:

1. **Reused**: nothing to build.
2. **Extended**: read its `README.md` and `model.ts`. First ask `affected` what your change reaches (the prop type, or the file and declaration you'll change): those are the boards it can break. If it is a host (`defineHost`), the new feature is a new layer; otherwise add the field or action. Write a law test, then `look` at each affected chapter (it checks every board in both languages at two widths) and at the boards it lists, and keep every lesson passing.
3. **New**: first see `making-a-prop.md` § 0: a layer on an existing host, or a composite of existing props and blocks, before a prop of its own. For one of its own, follow `making-a-prop.md` in order: README (contract) → `model.test.ts` (laws) → `model.ts` → view and styles → `defs.ts`/`index.ts` → one line in `library/registry/src/index.ts`. It goes in `library/props/`, never in a chapter.
4. **Look at it and play it.** Place it on a scratch page or the first lesson's page and `look` at it (chalk MCP tool): the board, then the piece (`<board>#<piece>`) for everything about it. Every part drawn where it says, setup and state as you expect, and no problems listed (drawn but not described, or the reverse). Fix overflow, unreadable labels, and parts that look alike but differ. Then use it as a student would with `play` (tap its parts, drag, try wrong things; `continue: true` to go on from where you left it) and read what each step changed. Fix what doesn't respond or doesn't make sense.
5. `pnpm catalogue`, then `pnpm check`. It must pass.
6. Append `runs/<YYYY-MM-DD-HHMM>-props.md`: reused, extended, built, the tests, and anything changed from the plan and why.

Rules that bite: every state change is an action through the one door; no `Math.random`; draw with `@chalk/draw` and the look's tokens; styles scoped to the prop's prefix; `observe` says what the student sees.
