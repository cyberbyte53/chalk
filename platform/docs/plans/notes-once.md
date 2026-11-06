# A wrong answer's note: shown and said, the same way for every question

Status: build plan, reviewed once (its simpler route taken). Item 3 of `simpler-boards.md`. After speech marks (`said-once.md`):
a note's spoken words are marks in its own text.

## Today: two ways, and one of them is silent

- **A choice's note** (`library/patterns/questions.ts:132-145`): the option's `feedback` is set on the
  choice when it is checked wrong (`library/props/basics/src/props.ts:169`), and shown; it is **said** by a
  board cue the pattern makes per wrong option (`cue(o.feedbackSays ?? o.feedback, { when:
  "<name>.checked", where: { optionId, status: wrong } })`), joined through `SceneUse.cues`.
- **A check's note** (`questions.ts:63-71`): the board hears `<name>.wrong`, finds the first note whose
  `when` holds, and asks the goal to `giveFeedback({ text })` (`props.ts:102`), which only sets `feedback`.
  **Shown, never said.** Tap-the-desk's "The column comes first…" isn't in the chapter's script.

So the same idea (a wrong answer gets a note) is written two ways, and the student hears one kind and
not the other.

## The shape: both kinds of question say their note the way a choice already does

The first draft had props hold their notes and say them (a new line kind across the runtime, the
props, the script and the voice build). The review found a much smaller route with the same result:

- **`check()` makes one line per note**, named `<name>-note<i>` (a free line said by a rule, as a
  choice's notes are cues), `about: <name>` so the question glows while it's said.
- **The rule that picks the note** (`<name>.wrong`: the first note whose `when` holds) now does both:
  `giveFeedback({ text: note.say })` and `t.self.say({ line })`. Shown and said come from the same
  `note.say`, so they can't drift.
- Timing is already right: a line said in the student's own step cuts in and waits for the wrong
  sound (`runtime.ts:183, 341`; `checked` is in turn in `basics/src/sound.ts`), as choice notes do.
- Nothing changes in the runtime, the props, `scriptOf` or the voice build; choice notes keep their
  names (so review records don't churn). `SceneUse.cues` stays (both question kinds make lines);
  `feedbackSays` goes with the speech marks.

## What students will notice (intended)

A check's note is said, in English and Hindi: **42 new lines per language (84 clips)**, all from 6
families (bus-to-stop 4, place-the-dot 4, plot-the-point 23, tap-the-desk 4, tap-the-part 4,
walk-to-address 3); pages have no checks. About 27 have `−`, `′` or `=` and need speech marks first,
so this lands after the marks conversion. The clip count and cost go to the person before any is made.

## Proof

- `pnpm snapshot`: every board draws the same (a note shown is the same text).
- `pnpm said-compare`: every line said as before, plus exactly the 42 new note lines; nothing renamed.
- A scene test: a check's note is heard after the wrong sound, and the student's next tap cuts it.
- `pnpm check`.
