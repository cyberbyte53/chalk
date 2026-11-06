# What's next, in order

One list, worked top to bottom. Each item: its plan (if it has one), reviewed before code, one commit,
proved by playing every board before and after (`pnpm snapshot`). Tick it off here when it lands.

**How the order is decided.** Keep the check honest first (everything else is proved by it). Then names,
before more code is built on them. Then finish simplifying boards and props, each building on the last,
before anything new. Approval comes after, so boards are re-approved once, not after each change. New
work (languages, the authoring and learning loops) comes last, on clean ground, before the next chapter
and before real learners.

## 1. Ground: the check runs to the end, the proof is a tool

- [x] `pnpm snapshot`: the before/after board snapshot, a real tool (it proved the plane work).
- [ ] The 3 lint suppressions that stop `pnpm check` early (jugnu-preview.tsx, jugnu-chat.tsx, layout.tsx).
- [ ] Wipe the local database (tries now record the answer); restart Studio on the new code.

## 2. One word per meaning (glossary)

- [ ] The plane's walker, places, clues… are **parts** (as the glossary already said), not "pieces".
- [ ] A drawing kit's axis, dot, mark… are **shapes**.
- [ ] What a view draws for the student (a button, a readout) is an **element**.
- [ ] Glossary: one entry per word.

## 3. Finish simplifying boards and props (each builds on the last)

- [ ] **A question written once** on a board; the answer taps boards repeat by hand go
  (`simpler-boards.md`, items 2 and 5). Its own short build plan first.
- [ ] **One way for wrong-answer notes**: a question holds its notes and says them; check notes become
  spoken (new clips, en and hi) (`simpler-boards.md`, item 3).
- [ ] **Speech marks**: `[[shown|said]]`, `says` only for rephrasing (`said-once.md`).

## 4. Approval follows what the student gets

- [ ] **Kept by replay**: a board whose code changed but which plays and draws the same in every language
  keeps its approval on its own (`adding-pieces.md`, steps 6-7).
- [ ] **Re-approve chapter 1 once**, after section 3: only boards that really changed come to review.

## 5. New: languages, and the loops (before the next chapter)

- [ ] **Languages**: English written, every other language a table per lesson file (`languages.md`).
- [ ] **Authoring loop**: a one-page plan gate (lessons, each one's idea, props to build or reuse), pinned
  comments closed by whoever opened them, taste questions to the person, recorded plays as tests,
  reviewer findings weighted (must fix, consider, taste).
- [ ] **Content pipeline**: each chapter's sources in both languages; the term list made from them
  (memory: Hindi grounded in NCERT).
- [ ] **Learning loop** (before real learners): everything worked out from events; fewer tables; Jugnu in
  its own package; a learner's record versioned by what the board uses.

## Later, only when needed

- A check that a part's styles touch only its own classes (when parts are added often).
- READMEs' tables replaced by a pointer to the generated catalogue.

## Done

- [x] Adding a part to the coordinate plane leaves every board that doesn't use it as it was.
- [x] A board shows and hides only its own pieces.
- [x] Only the layouts boards use.
- [x] One working branch, `props-foundation`; the promo work kept as tag `promo-video`.
