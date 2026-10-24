# Taste, in layers (draft)

First pass at splitting `content/principles.md` (1,539 words, read in full by every step) into layers that each agent loads only when it needs them. `principles.md` is untouched until this is agreed.

| Layer | File | Who reads it | Size |
|---|---|---|---|
| Constitution | `constitution.md` | every content step, always | 12 principles, ~550 words |
| Stage guide | `guides/plan.md`, `guides/pages.md`, `guides/questions.md`, `guides/props.md` | the one step doing that work | ~250–400 words each |
| Exemplars | `exemplars.md` | builders, before writing | pointers to golden files, not text |
| Checks | `checks.md` | nobody reads it to write; `pnpm build-content` enforces it | — |
| Reviewer | `reviewer.md` | only the fresh-context reviewer | the full list, as questions |

Where each old line went: every rule in `principles.md` lands in exactly one place. Anything a machine can check moved to `checks.md` and left the prose; anything only a judge needs moved to `reviewer.md`. The constitution keeps the *why*, so agents can handle cases no rule covers.

How it changes: the `wrap-up` skill, at the end of a chat, finds the corrections that could happen again. The line rule keeps this small: a correction never adds a line by default. It becomes, in order of preference: a fix only → a check → a sharper exemplar → an edit to an existing line → a new line in a stage guide. A new constitution line needs your sign-off and must replace or merge one; the constitution stays at 12.

## Settled (24 Oct)

1. **Order depends on the idea.** Intuitive results: discover → state. Laws best said plainly (laws of reflection): state → hand over the prop to see it hold. The plan names the order per lesson. Either way the student touches it.
2. **Characters: yes.** Recurring characters the student learns with, shared across a subject's chapters.
3. **No per-option comments.** Right answer with its reasoning; Jugnu diagnoses. Revisit after the pilot.
4. **Worked examples never pose as a quiz.**
