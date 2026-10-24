---
name: build-props
description: Build or extend the props an approved chapter plan needs, before any lesson is written. Use after plan.md is approved. Follows the prop contract (platform/docs/making-a-prop.md), registers the prop, regenerates the catalogue, and leaves pnpm check green.
---

# Build the props for a chapter

Props come first: lessons are written against their actions and fields.

## Read first

`content/taste/constitution.md`, `content/taste/guides/props.md`, `platform/docs/making-a-prop.md`, and one prop from `content/taste/exemplars.md`.

## Pre-conditions

`plan.md` has `status: approved` (otherwise stop and say so).

## Steps

For each prop in the plan's `## Props`:

1. **Reused**: nothing to build.
2. **Extended**: read its `README.md` and `model.ts`. First ask the `affected` tool which chapters use it: those are the boards your change can break. Add the field or action with a law test, then `render_board` a board from each affected chapter, and keep every lesson passing.
3. **New**: follow `making-a-prop.md` in order: README (contract) → `model.test.ts` (laws) → `model.ts` → view and styles → `defs.ts`/`index.ts` → one line in `library/registry/src/index.ts`. It goes in `library/props/`, never in a chapter.
4. **Look at it and play it.** Place it on a scratch page or the first lesson's page and run `render_board` (chalk MCP tool) at phone width. Fix overflow, unreadable labels, and parts that look alike but differ. Then open its preview URL with `&play` in your browser (Cursor's browser, or a browser MCP) and use it as a student would: tap, drag, try wrong things. Fix what doesn't respond or doesn't make sense.
5. `pnpm catalogue`, then `pnpm check` (or the `check` tool with `full: true`). It must pass.
6. Append `runs/<YYYY-MM-DD-HHMM>-props.md`: reused, extended, built, the tests, and anything changed from the plan and why.

Rules that bite: every state change is an action through the one door; no `Math.random`; draw with `@chalk/draw` and the look's tokens; styles scoped to the prop's prefix; `observe` says what the student sees.
