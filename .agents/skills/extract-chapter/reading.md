# Proofreading a book's pages

You are proofreading one chapter of a school textbook, in one language, as step 2 of extract-chapter
(`.agents/skills/extract-chapter/SKILL.md`). The tools have already suggested everything they can. You
decide. For each page, in `.chalk-source-pages/<book>/<chapter>/<lang>/`:

- `page-NN.sheet.png`: the side-by-side sheet, your main view. On the left, the page as printed, each block
  outlined and numbered, each figure's and table's box dashed. On the right, our version of the page,
  block by block with the same numbers: its kind, its number and title, its text with the suggested
  readings in place, figures as their crops, tables as their grids.
- `page-NN.png`: the page alone (144 dpi: a point is 2 pixels), for a close look.
- `page-NN.words.txt`: every word the PDF holds, in lines, each numbered. `L12` is a line; `L12 [x0,y0,x1,y1]`
  is its box in points from the page's top left; `3:word` is its third word, cited as `L12.3`. Its closing
  part lists the tools' readings, and where they made none, with why.

and `source/<lang>/pages/page-NN.yaml`: the page file, pre-filled from the structure draft.

Read the pages **in order**, so you know when a block runs onto the next page.

## Proofread everything

**No suggestion is marked sure or doubtful, because a tool can't know where it went wrong.** So compare
the two sides of the sheet all the way down: every block's edges, kind, number and title; every word;
every box; every cell. The one thing set apart is a fact: a dashed empty place ("no reading", "no drawing
found", "no box", "no grid") is where a tool made no suggestion, so nothing is there to proofread and it
is yours to fill. A "nearest" reading in the words file is only a hint, and a reading you take from it is
yours.

## The page file

Every field there is:

```yaml
page: 3
proofread: false             # set it true once you have checked the page, corrected or not
cause: wrong-reading         # optional: the cause of every override below that names none
notes:                       # optional, once per cause: what happened, if the cause alone doesn't say
  wrong-reading: "the repair took the wrong one of two real words"
furniture: "L1, L40-L41"     # the running head, page number, footer, decoration, "Next Level Up" tags
terms:                       # the terms the page defines, by range, each within one block's words
  - "L7.3-4"
answers:                     # answers to the machine's issues, by issue id, with why
  "read L36.1": "the PDF lacks ई and ं (इधन); the image shows ईंधन"
blocks:                      # in reading order: the body first, then a side column's boxes in their order
  - kind: section            # one of the kinds below
    number: "L5.1"           # the words of its number: a range, never typed
    title: "L20.1-3"         # the words of its printed heading: a range (they are in `words` too)
    words: "L6-L14, L16.1-8" # ranges, in reading order: whole lines, or L16.1-8, or L16.9-L18
    continued: true          # its start is on the page before
    continues: true          # it runs onto the next page
    box: [120, 330, 410, 520]  # a figure's or table's rough box, in points: the build snaps it
    answer: "(i) one; (ii) one"  # a question's answer, only from the book's answers pages
    read: {}                 # overrides of words (below)
    crop: {}                 # an override of a box (below)
    cells: {}                # an override of a table's cells (below)
```

Every word on the page is in exactly one place: `furniture`, or one block's `words`.

## A correction is a replacement

At this place, instead of what was suggested, this goes there. Edit the page file; never repeat what you
agree with.

- **Blocks:** blocks 4 and 5 should be one: replace them by one with both ranges. Block 7 should be two:
  replace it by two, split at the word. Words in the wrong block: move the range.
- **A kind, a number, a title:** change it.
- **What the tools missed:** add it: a block, a figure with its rough box, a table.

The other corrections are overrides of a tool, one worked example each:

**A word over the tool's reading.** It replaces every suggestion its range touches, and must cover each
whole. A word broken across two PDF lines is one range spanning both.

```yaml
read:
  "L54.4": { text: "विस्थापन", cause: wrong-reading }
  "L8.12-L9.1": { text: "कोशिका", cause: broken-across-lines }
```

**A word where the tools flagged nothing** (maths the PDF flattened). The same shape, keeping the PDF's
letters and digits:

```yaml
read:
  "L55.2-3": { text: "s⁻²", cause: other }
```

**A box over the snapped one:**

```yaml
- kind: figure
  words: "L33-L36"
  box: [120, 330, 410, 520]
  crop: { box: [118, 328, 412, 522], cause: wrong-box }
```

**Cells over the table's grid,** by ranges, row by row, `""` for an empty cell:

```yaml
- kind: table
  words: "L37-L39"
  box: [60, 500, 540, 700]
  cells: { rows: [["L38.1", "L38.2"], ["L39.1", ""]], cause: wrong-cells }
```

**Filling a gap a tool left needs no cause:** the tool's own why is the record. A reading is then its
words alone, and `crop` or `cells` leave out `cause`:

```yaml
read:
  "L12.3": "तत्व"
```

## The cause

Each is feedback a later fix to the tool is measured by (`pnpm source feedback`). Give the one that says
why the tool went wrong:

| Cause | When |
|---|---|
| `lines-run-together` | One PDF line, or two paragraphs, read as one |
| `side-column` | A side column's or a frame's words mixed with the body's |
| `caption-away` | A caption apart from its figure, or taken for text |
| `broken-across-lines` | A word or a sentence cut by a line's end |
| `wrong-reading` | A reading of a word that isn't what the page prints |
| `wrong-box` | A figure's or table's box |
| `wrong-cells` | A table's grid |
| `other` | None of these: say what in `notes` |

If every override on a page has one cause, give it once as the page's `cause:` and leave it off them. An
override with neither is an issue, and only a cause settles it. A cause covers overrides of words, boxes
and cells; changes to the blocks carry none.

## Marking it proofread

When you have checked the page, set `proofread: true`, whether you corrected anything or not. Until then
it raises "not proofread yet", its only issue, and answering doesn't pass it. A later change to a tool
raises every piece it changes, accepted or not.

## Kinds

A block is **one printed paragraph** (or one heading, figure, question…): a new block starts wherever the
page starts a new paragraph (an indent, a gap). A line that introduces a list ("As in (i) above :",
"Find:") and the list's items are one block, as a question and its parts (i), (ii) are. A block that
continues from the page before takes its number from where it starts: give it none.

The draft gives a kind only where numbering or font says so, and `text` to everything else. Box,
activity, example and equation are always yours to call.

- `section`: a numbered heading (`3.2 Cartesian System`, `7.1 Work Done by a Constant Force`).
- `heading`: a heading without a number ("Mitosis").
- `text`: a paragraph, or a list of points that belong together.
- `box`: a set-apart note: in a side column or a frame ("Think It Over", "Pause and Ponder", "Meet a
  Scientist", टिप्पणी). `title` is its printed heading; a frame with no heading is still a box, with no
  `title`.
- `figure`: a picture with its caption ("Fig. 7.4: …", "आकृति 3.1", "चित्र 7.2"), or a labelled picture
  without one.
- `table`: a table, numbered or not.
- `equation`: an equation set on its own line, with its number when it has one ("(7.1)").
- `example`: a worked example's statement ("Example 7.1", "उदाहरण 1"); its solution is the `text` after it.
- `activity`: an activity ("Activity 7.2", "क्रियाकलाप 1") with its steps.
- `exercise`: an exercise's heading ("EXERCISE 3.1", "प्रश्नावली 3.1", "Revise, Reflect, Refine").
- `question`: one numbered question of an exercise ("1.", "2.", with its parts (i), (ii)).

A mention of a number in a sentence ("see Fig. 7.2", "from (7.1)") is part of that sentence, not a figure
or an equation. A heading with no number ("Revise, Reflect, Refine", "अभ्यास प्रश्न") has no `number`: its
words go in `title`.

## Readings are held to the PDF's letters

The 2026 Hindi books double letters and signs (विस््थथापन for विस्थापन, मेें for में), split a word with a
space (सफे द for सफेद), move a sign (सबं धं ित for संबंधित), write ॠ for ऋ, or put a � in a word. The Hindi
repair suggests a reading for every span it can, and leaves empty the spans with several real readings or
none. Read a span **from the image**, and give the words as printed. Your reading must be one the PDF's letters
allow: you may only take out doubles, spaces and �, and put a sign where the image shows it. A word the
Hindi word list lacks is raised once for the book: answer it if it is real, as printed.

Always write what the image shows. If the PDF is missing letters the page prints (इधन where the page shows
ईंधन), still write ईंधन: the machine will raise it, and you answer it (below).

Also read maths the PDF flattened (a superscript as a plain digit: write `m²`, `s⁻²`), and write a minus as
`−`.

## The machine's issues

After you write your files, the machine checks them and may send you issues, each with an id ("read L36",
"unused L12.4", "twice L3.2") and a question: a mistake, or meant? For each, look at the page image again.
Either fix the file, or, if it is right, answer it in the page's file with a short reason:

```yaml
answers:
  "read L36": "the PDF lacks ई and ं (इधन); the image shows ईंधन"
```

An answer is read by a person checking the chapter, so give the real reason. When a reading now equals
what a tool gives, the issue says so: drop your reading.
