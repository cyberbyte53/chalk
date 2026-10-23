# Content principles

The taste. Every chapter is planned against these principles, self-reviewed against them before review, then reviewed on the real screens. When a review comment reveals a pattern, the rule is added here at once and the chapter swept for it.

Learned building:
- Class 10 Maths Ch 1 (Real Numbers) and Ch 2 (Polynomials);
- Science Ch 10 (Light);
- Science Ch 1 (Chemical Reactions) and Ch 9 (Heredity & Evolution), built on this structure;
- 12 more Class 10 chapters, built the same way.

Words: a **book** holds **chapters**; a chapter holds **lessons** (the code still calls a lesson a *concept*: `concepts:` in `build.yaml`, `Concept.X`); a lesson is its **overview** pages plus the chapter's **question bank** entries that test it. The source a chapter is built from (a textbook chapter, notes, anything) is whatever is in its `source/`; nothing here assumes one publisher.

## Lesson structure (theory first)
A first-time reader needs the idea before the story uses it. So every lesson runs in four parts:
1. **Hook.** One or two story panels.
   - Lesson 1 gets a full opener: who the family is, the situation, the mission ("why this chapter"), and a roadmap of stops.
   - Later lessons recap where the mission stands and pose the question this lesson answers.
   - Never abrupt: say who and where before the problem.
2. **Learn.** The theory in the source's order, built from basics, every term defined before use, with props, diagrams and animations on every concept. No story inside this part.
3. **See it in life.** Back to the story, now explained, with an applied question. This is where the hook's puzzle is answered.
4. **Practice.** Worked examples with figures, the source's in-text questions and exercises, then your-turn, ending on the mission log.

Sensitive topics (human reproduction, reproductive health) use the source's level and tone, a neutral health-class frame and no family story.

## Story (why are we doing this?)
- **One mission for the whole chapter.** Correct but disconnected pages read as bland. Give the chapter a goal a student cares about, stated up front, with the chapter's lessons as numbered stops on a roadmap. Examples:
  - Light: build a phone projector for movie night.
  - Chemistry: get the house ready for Diwali.
  - Heredity: Grandpa's pea mystery in his terrace garden.
- **Chapters in a subject share one family and continue each other's story.** For example, the maths mela runs from Ch3 into Ch4.
- **Each lesson's hook ends in a puzzle** that the lesson answers in "See it in life".
- **Clarify the basics up front.** Never assume the everyday words (light, ray, mirror, surface, substance, atom, trait, gene). Recap the previous class's basics briefly before the first use.
- **Failures move the story.** Let the characters try what doesn't work (a flat mirror can't project); that's what motivates the next idea.
- **End every lesson with a mission log:** what works now, what doesn't, what's next, and which stop is done.
- **Characters, sentences, humour:** recurring characters, short sentences, a little humour.
- **Ground it in the student's world:** home, school bus, family, festivals.
- **Stay consistent:** keep the timeline and facts consistent across lessons (no two lessons on the same "Thursday morning"); kids notice.
- **Illustrations for scenes, interactive props for mechanisms.** Scenes are drawn with the look's tokens. Pictures must be physically right and must not spoil a reveal.
- **Source events become story events.** Use the source's own activities and examples as the story's events (a textbook example about a bus's rear-view mirror: put it on the school bus).

## Teaching
- **Define a word before you use it.** This includes words drawn in pictures (F, 2F): hide marks a prop draws before they're defined.
- **Results are found, then stated.** Something true that the student can discover keeps explore-then-state.
- **No undefined words.** Sweep every lesson for terms used but never introduced. Introduce once, then use that one name everywhere, including labels drawn in props.
- **Concrete, then general, with the same steps.**
- **Numbers before letters.** Open with a worked numeric example (12 and 144), ask about it, and only then write the general statement in symbols. A page that opens with $p$ and $a^2$ loses the student.
- **Reason before it's used, and the reason must be true.** Every rule gets its why (e.g. the radius meets the circle at right angles, so the line from C is the normal).
- **A proof uses the standard tools, not the picture.** A picture (prime towers) can show the idea; the argument itself uses the textbook's notation and the theorem it rests on (write $a = p_1^{k_1} \cdots p_n^{k_n}$ by the Fundamental Theorem).
- **Open each page from where the last one left off.** A page starts with the question the previous page raised ("7/30 never ends. Do its digits follow a pattern?"), not with a formula.
- **One idea, reused.** Prefer one model that carries through the chapter.
- **Let them do it, not just watch.** Where the source asks the student to draw or balance, give them an interactive way to do it themselves: draw-it-yourself ray diagrams, the equation balancer, the cross simulator.
- **Motivate by understanding, never by speed.**
- **Proofs:** state the goal first, one step per line, no skipped steps, finish the arithmetic.
- **Stay simple for the class.** When in doubt, cut. No more than 3–4 new terms per definition card.
- **Keep the whole source chapter**, even sections a later syllabus removed, and stay within what the source says.

## Questions
- **No give-aways.** The right answer must not stand out: not first, not the longest, not the only specific one.
  - Options are shuffled by default (fixed per build). Use `keepOrder` only for options that read as a sequence.
  - Wrong options are real misconceptions in the same grammatical shape and length as the right one.
  - Trim padding from right answers instead of padding wrong ones.
  - The content build warns when a chapter's right answer is the longest option in more than 40% of questions.
- **No duplicate options**, and no distractor equal to the answer. This matters most in generated families.
- **Wrong options get feedback** that names the slip.
- **A question names its object.** "What will the next digit of 1/7 be?", not "What will the next digit be?". Read the prompt alone, without the page around it.
- **A caveat is a question too.** Turn "it needs p to be prime" into "4 divides 36 = 6². Does 4 divide 6?", then explain.

## Writing
- **Sentence, then maths on its own line.** No equations inside sentences; single symbols are fine inline. Long working goes in aligned multi-line blocks, because phones are narrow.
- **Labels start their own paragraph.** **Q.**, **A.** and bold result labels begin a new text piece, never mid-paragraph.
- **Plain teacher language.** No clipped labels, no ⇒ in prose.
- **Pick a word; switch once, out loud.** Don't reuse a word in two senses.
- **Text and props use the same names.**
- **Headings name the result or ask the real question**, never a teaser.
- **No textbook baggage:** no theorem numbers, no "from the textbook" asides.
- **Hindi with every string.**
- **Read every sentence literally**, as a student of that class would.

## Props
- **When to use one:** only where it shows the mechanism text can't, and the student does the step themselves.
- **One visual per idea.** Fewer modes and buttons is clearer. Every control is labelled in words; every drag handle is explained once.
- **Big enough to see:** what the text talks about must be big enough to see, and labelled.
- **Their own numbers:** after the guided case, let them try their own numbers.
- **Fixed scale for change:** a prop that teaches change must keep its scale fixed while the value changes.
- **Nothing draws outside its stage.** Tables wider than a phone become rows.
- **Styles stay inside the prop.** Every CSS rule is scoped to the prop's own class prefix; no bare state classes (`.is-selected`) and no `!important`. Two props once broke each other this way.
- **Load on demand.** Each prop package has `defs.ts` (loaded up front) and views (loaded with the chapter); a new package is registered in `library/registry/src/index.ts` with both.
- **Few props per chapter, reused heavily**, rather than many one-offs. Check the library before writing a new one.

## Process
1. **Read and propose.** Read the whole source chapter, including its learning objectives, examples and activities. Propose the plan (mission, lessons, props, order) in the chapter's `plan.md` before building; nothing is built until the plan is approved.
2. **Build and self-review.** Build the props first, then the first lesson alone (it calibrates the rest), then the remaining lessons. Self-review every screen as a student of that class against this list. A fresh reviewer who didn't build it reads it as a kid.
3. **Review on the real screens.** Use `?dev&review` in the learner app, with comments pinned to pieces. Claude proposes, you approve, Claude applies.
4. **Capture patterns.** When a review comment reveals a pattern, add the rule here immediately and sweep the chapter for it.
