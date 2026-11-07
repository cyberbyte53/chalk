# Reading a book's pages

You are reading one chapter of a school textbook, in one language, as step 2 of extract-chapter
(`.agents/skills/extract-chapter/SKILL.md`). For each page there are two files in
`.chalk-source-pages/<book>/<chapter>/<lang>/`:

- `page-NN.png`: the page as printed (144 dpi: a point is 2 pixels).
- `page-NN.words.txt`: every word the PDF holds for that page, in lines, each numbered. `L12` is a line;
  `L12 [x0,y0,x1,y1]` is its box in points from the page's top left; `3:word` is its third word, which
  you cite as `L12.3`. A word marked `*` looks broken in the PDF (a hint only: others may be broken too).

The PDF's lines are only a convenience: one PDF line can run across two regions of the page (a side
column and the body, a caption and a paragraph). Cite word ranges, not lines.

Read the pages **in order**, so you know when a block from one page runs onto the next. For each page
write `source/<lang>/pages/page-NN.yaml`. You never type a word the PDF has right: words come from the
PDF. You write words only in `read` (below).

## The file

```yaml
page: 3
furniture: "L1, L40-L41"     # the running head, page number, footer, decoration, "Next Level Up" tags
blocks:                      # in reading order: the body first, then a side column's boxes in their order
  - kind: section            # one of the kinds below
    number: "7.1"            # as printed, when the block has one
    words: "L5"
  - kind: text
    words: "L6-L14, L16.1-8" # ranges, in reading order; a range of whole lines, or L16.1-8, or L16.9-L18
    continued: true          # its start is on the page before
  - kind: box
    title: "Think It Over"   # the box's printed heading (its words are in `words` too)
    words: "L20-L31"
  - kind: figure
    number: "Fig. 7.4"
    words: "L33-L36"         # its caption and the words drawn inside it (axis labels)
    box: [120, 330, 410, 520]  # the drawing and its caption, points from the top left
  - kind: question
    number: "1."
    words: "L37-L39"
    continues: true          # it runs onto the next page
    read:                    # only for spans the PDF has wrong, or maths it flattened
      "L38.4": "विस्थापन"
      "L39.2-3": "1 kg m² s⁻²"
    answer: "(i) one; (ii) one"   # a question's answer, only from the book's answers pages
terms:                        # what the page defines: a bold or italic term in a defining sentence
  - "L7.3-4"
```

Every word on the page is in exactly one place: `furniture`, or one block's `words`. A figure's or
table's words are its caption and any words inside its box.

## Kinds

A block is **one printed paragraph** (or one heading, figure, question…): a new block starts wherever
the page starts a new paragraph (an indent, a gap). A line that introduces a list ("As in (i) above :",
"Find:") and the list's items are one block, as a question and its parts (i), (ii) are. A block that
continues from the page before takes its number from where it starts: give it none.

- `section`: a numbered heading (`3.2 Cartesian System`, `7.1 Work Done by a Constant Force`).
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

A mention of a number in a sentence ("see Fig. 7.2", "from (7.1)") is part of that sentence, not a
figure or an equation. `number` is the label the book prints with its word, as it prints it ("Fig.
7.4", "प्रश्नावली 3.1", "Example 2", "1."). A heading with no number ("Revise, Reflect, Refine", "अभ्यास
प्रश्न") has no `number`: put it in `title`.

## Reading words (`read`)

Some PDFs hold broken text. The 2026 Hindi books double letters and signs (विस््थथापन for विस्थापन,
मेें for में), split a word with a space (सफे द for सफेद), move a sign (सबं धं ित for संबंधित), write ॠ for
ऋ, or put a � in a word. For every such span, read it **from the image** and give the words as printed.
Your reading must have the PDF's letters: the same consonants and full vowels in the same order, and the
same signs; you may only take out doubles, spaces and �, and put a sign where the image shows it.
Always write what the image shows. If the PDF is missing letters the page prints (इधन where the page
shows ईंधन), still write ईंधन: the machine will raise it, and you answer it (below).

Also read maths the PDF flattened (a superscript as a plain digit: write `m²`, `s⁻²`), and write a
minus as `−`.

Check every word marked `*`, and look for broken words the marks missed.

## The machine's issues

After you write your files, the machine checks them and may send you issues, each with an id ("read
L36", "unused L12.4", "twice L3.2") and a question: a mistake, or meant? For each, look at the page
image again. Either fix the file, or, if it is right, answer it in the page's file with a short reason:

```yaml
answers:
  "read L36": "the PDF lacks ई and ं (इधन); the image shows ईंधन"
```

An answer is read by a person checking the chapter, so give the real reason.
