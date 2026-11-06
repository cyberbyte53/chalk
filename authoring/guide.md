# How we make lessons

For every subject and class. A book's or chapter's guide (`authoring/books/<book>/guide.md`, `authoring/books/<book>/<chapter>/guide.md`) adds to this, and says where it changes it.
The student is in the book's class, on a phone, often in their second language; their attention is the
scarcest thing on the screen.

## Principles

1. **Explain before you use.** Every word, symbol, label and button a student meets is explained before
   anything depends on it, and every step gives its real reason. One unexplained thing and the student
   stops following, usually without saying so.
   *Ask:* reading it literally, where would a student of this class get stuck?

2. **Make them need it first.** Set up the question before giving the idea, so the idea arrives as an
   answer they wanted. Nothing on screen gives the answer away before they try.
   *Ask:* at this moment, does the student want what we're about to give?

3. **Cut what isn't needed.** A word, picture, character, example or button stays only if this board's
   idea needs it. Everything extra takes attention from the idea. When in doubt, cut.
   *Ask:* if this were gone, would the student miss it?

4. **Let them do it, and let the prop tell the truth.** Show the idea, don't describe it, and let the
   student act on it. Whatever they try, the prop responds truthfully and directly, and nothing they do
   undoes what the board was teaching.
   *Ask:* can the student try anything here and get a true answer?

5. **Test what the lesson taught, the way it taught it.** A question uses the same props and actions as
   its lesson, says plainly what it asks about, and offers wrong options that are mistakes students really
   make, so the right one never stands out. Each wrong answer gets a note that names the mistake it shows
   ("you swapped the two numbers"), not just "wrong".
   *Ask:* could only a student who learned the lesson get this right?

6. **Keep the world consistent.** Names, places, numbers and characters stay the same across boards and
   lessons: a stall doesn't move, a character doesn't change, a term doesn't get a new name. Students
   notice every contradiction, and it breaks their trust in everything else.
   *Ask:* does anything here contradict an earlier board?

When two pull apart: if something needs explaining but the board doesn't need it, cut it rather than
explain it.

## How the person judges

Cut over add. "Why is this here?" "Does it follow naturally?" (a need comes out of the story, not the
title). A prop should feel direct: tap where you mean, drag from where it starts. Parallel cases alike: if
one axis gets a step, so does the other. Plain, calm, short.

## Lessons to copy

Their idea, not their subject:
- the `street-and-house` board in [content/class9-maths/coordinate-geometry/two-numbers-for-a-place/overview.ts](../content/class9-maths/coordinate-geometry/two-numbers-for-a-place/overview.ts): the need for a second
  number is felt before it is named; the prop does the teaching.
- the `dot-on-paper` board in [content/class9-maths/coordinate-geometry/two-numbers-for-a-place/overview.ts](../content/class9-maths/coordinate-geometry/two-numbers-for-a-place/overview.ts): each clue narrows what is
  possible, shown, until one answer is left.

## Working with the person

Concise: one sentence where one does. Stuck, or at a decision that is his: ask with the `ask` tool, never
in prose. Name a file by its full path from the repo's root, as a link in markdown
([authoring/books/class9-maths/coordinate-geometry/boards.md](books/class9-maths/coordinate-geometry/boards.md),
not `boards.md`), so he can open it. Comments are pinned where they apply; whoever opened one closes it.

## Settings

Exact values code reads (`pnpm guide <book>/<chapter>` shows what applies, and from where). A book's or
chapter's guide may set any of them again: the nearest wins, key by key. `voices`: who speaks in
which voice, per language (a line that names no one is the narrator's).

```yaml
voices:
  narrator: { en: piper:en_US-lessac-high, hi: piper:hi_IN-rohan-medium }
  riya: { en: piper:en_US-amy-medium, hi: piper:hi_IN-priyamvada-medium }
  aman: { en: piper:en_US-ryan-high, hi: piper:hi_IN-pratham-medium }
```

## For details

- Examples for each principle, from several subjects: [authoring/guide/examples.md](guide/examples.md)
- Writing Hindi: [authoring/guide/hi.md](guide/hi.md)
- How a chapter is made: the skills in `.agents/skills/`; [platform/docs/authoring-pipeline.md](../platform/docs/authoring-pipeline.md)
- Layout, one name per thing, give-aways: machine checks, not this guide
