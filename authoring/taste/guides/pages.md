# Guide: writing overview pages

Read by `build-lesson` when writing `overview.ts`. Look at the exemplars before writing.

**Shape of a lesson.** First page is titled with the idea's name and opens from where the last lesson left off, with the characters. Then pick one of two orders and say which in the plan:
- **Discover → state** (the idea is intuitive to find; division lemma): one short story page poses the question *before* the prop, the student plays and finds it, the story wraps up; the formal statement with its why on the next page.
- **State → see it hold** (a law best said plainly; laws of reflection): basics first, the law stated with its why, then the prop handed over so the student checks it themselves; the story shows where it matters.

Then:
- **Worked examples:** plain methods, no props. They read straight through and give the answer, each step with its reason; never posed as a quiz. Figures where the source has them.
- **Applications** of the idea come as worked examples, not a new build-up.

**Writing on the page**
- One sentence, then the maths on its own line. Single symbols inline are fine. Long working: aligned multi-line block (phones are narrow).
- **Q.**, **A.** and bold result labels start their own text piece.
- No ⇒ in prose, no clipped labels, no theorem numbers, no "from the textbook" asides.
- Pick one word for a thing; if you must switch, say so once.
- Proofs: goal first, one step per line, no skipped steps, arithmetic finished. Use the class's notation and the theorem it rests on (write $a = p_1^{k_1}\cdots p_n^{k_n}$ by the Fundamental Theorem), not a picture alone. If a proof won't go easy for the class, find the intuitive route the source allows.
- Where the source asks the student to draw or balance, give them a way to do it.
- Motivate by understanding, never speed.
- Every string has its Hindi.

**Writing for the voice.** Every line on a board is also said aloud (platform/docs/sound.md). Give a piece its own words to say whenever its screen words aren't how a teacher would say them (`words.body(t(…), { says: t(…) })`), in both languages. They can be anything, not only the screen words read out: a shorter version, a question to the student. Anything else the board says or plays is a cue (`cues: { …: cue(…) }`): narration with nothing on screen (`watch: cue(t(…))`, said by a rule, `t.self.say({ line: "watch" })`, or at a moment, `{ when: "town.walker.arrived", where: { x: 4, y: 5 } }`), or a sound (`cue(tap, { when: "line.walker.stepped" })`, replacing the prop's own there; `cue(null, { when })` silences it; `until` makes it last). Nothing turns maths or symbols into words for you, so nothing can change their meaning: a line whose screen words have maths or a sign and no spoken words stops the voice, naming the line.
- Maths is said in words: "√2 ≈ 1.41" → "the square root of 2 is about 1.41"; "x²" → "x squared"; "3/4" → "three quarters"; "(4, 5)" → "4 comma 5" or "the point 4, 5".
- Units and signs in full: "25°C" → "25 degrees Celsius"; "5 cm" → "5 centimetres"; "−2" → "minus 2"; "≥" → "is at least".
- Say a name or term the way the class says it, in Hindi too ("H₂O" → "H 2 O"; "देकार्त", not the spelling).
- Something the student moves (a bus, a walker, a point) sounds its move with an effect; where it is now stays on the screen, not said each step. Say what is worth hearing: a question, a reveal, the line when it arrives.
- A question's notes are said too, when a student picks that option: a note with a sign or maths gives its spoken words (`feedbackSays`), like any line.
- A line someone in the story says names them (`{ speaker: "aman" }`): the cast gives each character a voice. Everything else is the narrator's.
- Short sentences sound better than long ones.

**Pictures:** scenes drawn with the look's tokens; physically right; never spoil a reveal; marks not yet defined are hidden.
