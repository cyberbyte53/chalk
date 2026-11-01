# Checks: rules a machine enforces

These left the prose because `pnpm build-content` / `pnpm check` can catch them. Agents don't need to remember them; the build tells them.

**Already enforced**
- Right answer is the longest option in > 40% of a chapter's questions → notice
- Duplicate options; distractor equal to the answer
- Options shuffled per build unless `keepOrder`
- Every question has a witness and `tests: [Concept.X]`
- Every string has Hindi
- Prop CSS scoped to its prefix; no `!important`, no bare state classes
- Prop packages register `defs.ts` + views
- Layer boundaries (`pnpm boundaries`); catalogue up to date (`pnpm catalogue --check`)

**Proposed (from the 44 comments)**
| Check | Catches | Comments it would have caught |
|---|---|---|
| Visual: render every board at phone width, flag maths past the edge, text spilling out of buttons, overlapping buttons, pieces outside the phone. **`show` reports these now**, for a board or, pointed at a chapter, for every board in both languages at two widths | Nothing draws outside its stage | "equations not contained in the button", rendering issues ×6 |
| Visual: frame-diff a static board twice; flag pixels that move | Jitter | the shaking axis numbers |
| `Q.` / `A.` / bold label not at the start of a text piece | Labels start their own paragraph | "Q should be on new line" |
| Inline maths longer than N tokens inside a sentence | Maths on its own line | "why use words to describe maths" (partly) |
| Regex: theorem numbers, "from the textbook", ⇒ in prose | No textbook baggage | — |
| Distinct colours for distinct labelled parts in a prop | Things that differ look different | incidence/reflection same colour |
| Term used in a lesson before the lesson (or an earlier one) defines it, from a per-chapter glossary in `plan.md` | Define before use | "introduce what a polynomial is first", undefined a,b,c,d |
| Question prompt with a bare "the next/that/it" and no object | Names its object | "next digit of what?" |
