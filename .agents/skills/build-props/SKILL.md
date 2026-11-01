---
name: build-props
description: Match a chapter's needs to props and build or extend the props it needs, before any lesson is written - the props match (props.md), each new or changed prop's definition first, then its view. Use after flow.md is approved, or when a review asks for a prop change. Follows platform/docs/making-a-prop.md and leaves pnpm check green.
---

# Match and build the props

Props come first: lessons are written against their actions and fields. A prop's contract is its definition in code (the one writer); everything a person reads about it is generated from that (`look` at its address, `library/catalogue.md`).

## Read first

`authoring/taste/constitution.md`, `authoring/taste/guides/props.md`, `platform/docs/making-a-prop.md`, and one prop from `authoring/taste/exemplars.md`.

## Pre-conditions

`flow.md` is approved and holds (the Chalk tree, or the pipeline step). Otherwise stop and say so.

## 1. The match: `props.md`

1. **Find what exists.** `show` `library/props/` (a line per prop: address, role, what it is for, how many boards use it), then the address of each that might fit: everything about it, every board that uses it, and what no board uses or only one does.
2. **Every need in `flow.md`, grouped, gets one verdict** in a table with `Need`, `Boards` (board ids, comma-separated), `Verdict` and `Why` columns: **reuse** (as it is), **configure** (fields it has), **extend** (a new field or action), **new**, or **no prop** (words or a picture do it better). "One prop or three" is decided here: a prop isn't stretched to a need it wasn't made for because it is close.
3. The pipeline step holds when every board's need has a verdict. Questions go on `props.md` as threads (`quote`). Commit, append `runs/<YYYY-MM-DD-HHMM>-props.md`, and stop for the person's approval in the editor (the Chalk tree).

## 2. The design: each extend or new, its definition first

For each **extend** or **new**, before any view or run body:

1. **Extend:** ask `affected` what the change reaches (`props: ["library/props/<package>/<type>"]`, or the file and declaration): those are the boards it can break. A holder's new feature is a new part (a prop of its own, held by it); otherwise a variable or action.
2. **New:** `making-a-prop.md` § 0 first (a new part in a prop that exists, or a prop holding existing ones, before a prop of its own). It goes in `library/props/`, never in a chapter.
3. Write or change the **definition**: variables (each and what it means) and their start, needs, facts, actions with their payloads (`from: "screen"` for the student's), signals with theirs, invariant, and a `describe` whose first sentence says what it is for. Leave the rules and the view for later; it must type-check.
4. Start **one thread on the prop** (`comment` with `at: "library/props/<package>/<type>"`): what changes and why, its page before and after (`show` its address, before your change and after), and for an extension what `affected` lists and why nothing there changes. The person approves by closing it. Wait.

## 3. The build

1. Rules and the view, to the definition (`making-a-prop.md`): law tests, the view tagging what the student sees, `checkProp`. Register a new package in `library/registry/src/index.ts`.
2. **Look at it and play it, on its own.** `show` its address from its start and from the `state`s the boards will give it (every check screen, both languages): everything about it comes back, as for a piece. Every part drawn where it says, setup and state as you expect, no problems listed. Then `show` it with `steps` as a student would (tap its parts, drag, try wrong things) and as a lesson would (`{ call: "zoomTo", args: { … } }`), with `frames` where it moves. Fix what doesn't respond, jumps or doesn't make sense.
3. `pnpm catalogue`, then `pnpm check`. It must pass.
4. Append to the run note: reused, extended, built, the tests. Tell the person to play with it at `?dev&at=library/props/<package>/<type>` (its panel sets every field and runs every action) before any lesson uses it.

**A prop change later** (a review asking for a walker, a board that wants a scene) is the same: its definition and a thread first, then code. No prop grows one request at a time without a thread showing it.

Rules that bite: a prop's variables change only by its own rules; time is the board's queue (no timers, no timing in CSS anything waits on); no `Math.random`; draw with `@chalk/draw` and the look's tokens; styles scoped to the prop's prefix; the view tags what the student sees (`does`, `says`, `shows`), and `checkProp` passes.
