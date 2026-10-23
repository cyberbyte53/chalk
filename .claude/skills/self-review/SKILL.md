---
name: self-review
description: Review a built lesson or chapter against content/principles.md and as a student of that class, before a person sees it. Fixes what it can, lists the rest, writes a run note. Use after build-lesson, and before asking for screen review.
---

# Self-review

The person's screen review is expensive; this pass catches what a checklist and a careful read can.

Arguments: a chapter, or one lesson in it.

## Steps

1. `pnpm build-content` and `pnpm check` must be green; if not, fix that first.
2. **Checklist.** Read each built page (`build/<book>/<chapter>/<lesson>/overview/*.json` is the truth of what the student sees) against `content/principles.md`, section by section: structure (four parts, hook ends in a puzzle, mission log), story (consistent with the book's other plans), teaching (every term defined before use; numbers before letters; results found then stated; no undefined word), questions (no give-aways, no duplicate options, feedback names the slip, the prompt names its object), writing (sentence then maths; labels start paragraphs; Hindi with every string), props (used only where the student does the step).
3. **Roleplay.** Read the lesson once more as a student of that class, literally, page by page: what would confuse, what is assumed, what is boring, what a child would tap and get nothing from. Note each with the page name.
4. Fix everything mechanical (a missing definition, a give-away option, maths inside a sentence, an undefined term). Leave taste decisions for the person, stated as questions.
5. Append `runs/<YYYY-MM-DD-HHMM>-self-review.md`: what was checked, what was fixed, what is open (with page names), and whether the lesson is ready for screen review.
6. Reply with the open items only.
