# Guide: writing the question bank

Read by `build-lesson` when writing `questions/` families. Mechanics (`family.ts`, `params.yaml`, `tests: [Concept.X]`, witnesses) are in `platform/docs/writing-content.md`.

- **Exam-style and complete.** Give the full question as an exam would; don't hint the method (don't tell them which b to pick). Plain methods; props only in explanations.
- **Names its object.** "What is the next digit of 1/7?", not "the next digit". Read the prompt with the page hidden.
- **Wrong options are real mistakes**, in the same shape and length as the right one. Trim the right answer rather than pad the wrong ones.
- **The right answer comes with its reasoning.** No per-option feedback notes: we can't cover every slip, and Jugnu asks how the student got theirs. Revisit after the pilot shows real wrong answers.
- **Shuffled by default.** `keepOrder` only for options that read as a sequence.
- **Turn caveats into questions.** "It needs p to be prime" → "4 divides 36 = 6². Does 4 divide 6?", then explain.
- **Generated families:** vary values so the student meets the general case, not one fixed step size we chose. Check no option repeats and no distractor equals the answer (the build checks this; don't rely on it).
- **"Show that" questions** take a text or photo answer; Jugnu checks it. Write the expected reasoning in the witness.
- **Every question has a purpose:** if you can't say which skill it tests, cut it.
- Cover the source's in-text questions and exercises; say which in the run note.
