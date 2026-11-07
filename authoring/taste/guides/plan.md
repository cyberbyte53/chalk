# Guide: planning a chapter

Read by `plan-chapter` and `build-props` (for **Props**). Output: `plan.md` (approved by the person) and `boards.md` (the detail, never approved), in `authoring/books/<book>/<chapter>/`. Nothing is built until `plan.md` is approved.

**Read the whole source first** — objectives, examples, activities, in-text questions, exercises, and any section a later syllabus removed.

**Lessons.** Split the chapter into as many lessons as it has ideas (Euclid's lemma and HCF by Euclid's algorithm are two). A direct application of an idea (the forms 3q, 3q+1, 3q+2) is pages inside that lesson, not a lesson; list it as a skill sub-tag so the learner model can track it. Keep the source's order unless there is a reason, and say it.

**Mission and characters** (the plan's `Story`). One goal for the chapter, from the student's world (Light: a phone projector for movie night), pursued by recurring characters the student learns with; a subject's chapters share them and can continue each other's story. Lessons are stops on it. For each lesson, name its order: discover → state, or state → see it hold (see `pages.md`). Use the source's own examples as its events (a rear-view mirror example happens on the school bus). Failures move it forward (a flat mirror can't project). Sensitive topics (reproduction, reproductive health): no mission, neutral health-class frame, the source's tone.

**Props** (the plan's `Props`: reuse, extend or new, each sketched, with why). `show` `library/props/` first (or read `library/catalogue.md`). Propose the fewest props that carry the chapter; for each, the mechanism it shows that text can't and the step the student does. Extending an existing prop beats a new one.

**Per lesson in `boards.md`:** its slug as its heading, then its boards and question families: each with the objectives it serves and the book's items it covers (`source/en/items.yaml`), what it is for, its beat in the story, and what the student sees or does (in words, not prop names). New terms: 3–4 at most per lesson.

**Leaving something out** of the source is a decision: `plan.md`'s `Skipped`, in the book's words, and `boards.md`'s, by id, each with why.

**Everything the book teaches is covered**, whether or not the syllabus or NCERT's rationalisation keeps it: "not in the syllabus" is never a reason to leave something out.

**The book fixes what is covered, not the order.** Choose the order that teaches best (start from the story's real problem, bring a later idea forward where it helps); where it differs from the book's, say why in the plan.

**Questions for the person.** The decisions only they can make, each an `ask` on the words it is about, with your recommendation first. Few, and real.
