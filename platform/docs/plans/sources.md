# A chapter's sources: the book, as data

Status: plan, rewritten 7 Nov 2026 after looking at how document parsing is done and testing rules on
NCERT maths and science; reviewed (its tests on the science book folded in); to be trialled, then built. Earlier versions of this file are in
git; the decisions that held are kept.

**In short.** `pnpm source` turns a chapter's PDF into numbered words, in lines, and page images. An agent per
language reads the pages in order and says which lines make which block (a paragraph, a box, a caption,
a question) and where each figure is; where the PDF's text is broken, it reads the words, held to the
PDF's own letters. The machine builds the items from the lines, crops the figures and checks everything;
then the languages are matched by their numbers. No layout rules, no word lists per book. This is
document anchoring, as olmOCR does it, with our agents as the model and our checks around them.

## What it is for

1. **Coverage:** the lessons miss nothing the book has (each block cited in `boards.md` or skipped).
2. **Grounding:** the book's own words, examples and exercises.
3. **Language:** each language's terms as its book defines them.
4. **Figures:** what the book drew.

## How it is done elsewhere, and what fits here

Document parsing is done four ways: rules on a PDF's text (exact, but each layout needs new rules);
layout-detection pipelines (Docling, MinerU, Marker: generic, middling: Docling found 8 of 17 captions
in chapter 1); vision-language models reading page images (leading the 2026 benchmarks, but they can
invent or alter words); and the hybrid, *document anchoring* (olmOCR: the model gets the page image and
the PDF's own text with positions, and invents far less).

Here the PDFs are born digital, the volume is small (chapters of about 20 pages), the structure we need
is semantic (an example, an activity, a "Pause and Ponder" box), and exact letters matter. Rules were
tried and don't stay generic: the 2026 science book's side column switches sides by page and is a stack
of different boxes; most "Fig. 7.2" in its text are references, its equations are a bare "(7.1)". And
its Hindi (Kokila) text layer has about 30% of distinct words corrupt (विस््थथापन, मेें, stray spaces,
U+FFFD), not all repairable from the text alone. So: anchoring, with agents as the model, and the words
taken from the PDF wherever its text is sound.

## Principles

- **Structure is judgment; letters are not.** Agents decide structure from the page image and its
  words. Words come from the PDF. Where it has broken them (or where maths needs writing: a superscript
  the text layer flattens), an agent reads the span from the image, and the reading must have the PDF's
  own letters (below), so nothing can be invented.
- **Nothing is tied to one book.** No layout rules, no numbering words in code; a new layout needs
  nothing new. The kinds are one closed list.
- **The machine checks everything an agent says.**
- **Each language alone, then matched by numbers** (never assumed one to one; what one book has and the
  other doesn't is listed with why).
- **Record exactly which book:** the edition its pages print, the address, the sha256.

## The stages

1. **Prepare** (`pnpm source <book>/<chapter> <lang> <pdf>`, the machine): the PDF copied in and recorded;
   each page rendered; its text read by the book's reader (`text`, or `chanakya`: the old Hindi font
   converted by its table) into numbered words (`L12.3`: line 12's third word), in the PDF's lines, each
   with its box, bold and italic; words that look broken marked as hints (a doubled sign or consonant,
   U+FFFD, a joiner, a mark standing alone). One file per page: its image and its words. Lines are only
   a convenience: the PDF's lines can run across a side column and the body, so a block cites word
   ranges (`L12.1-6`, `L12.7-L14`).
2. **Read** (an agent per language, the pages in order, so it knows what an earlier page left open):
   for each page, from its image and lines, a structure file: the blocks in reading order, each its
   word ranges, kind and number (as printed), and whether it continues from the page before or onto
   the next; each figure's and table's box and caption; the words that are the page's running head,
   footer or decoration; a reading for any span it reads from the image (Hindi whose letters the PDF
   broke, marked or not; maths); the terms the page defines (a span). Words inside a figure (axis labels)
   are the figure's; a reference ("Fig. 7.2", "(7.1)" in a sentence) is text, not a figure or an
   equation. A book too long for one agent is split into page ranges, one agent each, and the seams
   checked.
3. **Build and check** (`pnpm source` again, the machine): `items.yaml` built from the words (a
   block that continues joined with the next page's continued block; maths written as the
   lessons do: `−`, `2/3`), ids positional; figures cropped; terms listed; then the checks. A page that
   fails goes back to its agent with the failure. The agent then looks at every crop.
4. **Match** (once both languages hold): the machine pairs them by their numbers.

**Who does what.** The orchestrator (the session running the `extract-chapter` skill) runs the machine
steps, starts the two language agents in parallel (neither sees the other's book), sends failures back,
looks at the whole chapter (sections in order, every number once, pages joined) and runs the match.

`items.yaml` is built once; after its checks hold it is the record (a later run checks it, never
rebuilds it). Ids are positions (`2.4`: section 2's fourth block) until anything cites them; then they
never change (a later split keeps the id on its first part and gives the rest `2.4b`).

## Checks

- **Every word is used once:** each word is in exactly one block, figure, table or the page's
  furniture.
- **Pages join:** a block that continues is followed by a continued block on the next page, and a
  continued block follows one that continues.
- **Readings hold to the PDF's letters:** a reading and the PDF's span have the same consonants and
  full vowels in the same order, and the same marks (vowel signs, ं, ँ, ्) as a set within each word,
  after taking out spaces, joiners and U+FFFD, collapsing doubles, and reading ॠ as ऋ; a reading that
  itself has a doubled sign fails. (Tested on 26 broken words of the science book: all true readings
  pass.) Where a mark sits within the word is the agent's call from the image; the machine can't
  check it.
- **Numbers:** each kind's numbers are in order, none twice; each number is printed on its page.
- **Figures** each have a box inside the page, their caption beside it, and a crop.
- **Terms** are in the words of their block.
- **Languages match** by kind and number, or the difference is in `unmatched` with why.

The checks on the plan (every block cited or skipped, cites exist, `plan.md` has no ids) are the
pipeline's, run by plan-chapter; the check that lessons use the book's terms is self-review's.

## Files

```
authoring/books/<book>/<chapter>/source/<lang>/
  book.yaml       title, reader, edition as printed, address, sha256, pages, the book's page numbers;
                  unmatched (not English); answers (the answers pages' PDF, when the book has one)
  book.pdf        the chapter, as downloaded
  items.yaml      every block: { id, kind, page, number?, title?, text, crop?, answer? }
  figures/<id>.png
  terms.yaml      { term, item }
.chalk-source-pages/<book>/<chapter>/<lang>/    not in git: page images, lines, the agents' structure files
```

Kinds (closed): section, text, box (with its printed `title`: "Pause and Ponder", "Think It Over"),
figure, table, equation, example, activity, exercise, question. A Hindi term's English pair comes from
its brackets (**मूलबिन्दु (origin)**) when the book prints them.

## The code

`platform/studio/src/source/`, self-contained (libraries and `@chalk/content`'s `Locale` only; the rest
of Chalk only reads its files): `pipeline.ts` (prepare; build and check), `read/` (a file per reader and
what they share: lines, marked words), `build.ts`, `check.ts`, `files.ts`, `schema.ts` (also the
structure file's). `platform/studio/src/source-cli.ts` only parses arguments (`node:util`
`parseArgs`). The skill `.agents/skills/extract-chapter/` runs it and holds what the agents need: the
structure file's shape with a worked example of each kind; that Hindi is read from the image and the
text layer only constrains its letters; side columns (a margin note such as टिप्पणी or "Think It Over" is
a `box` with its title; the "Next Level Up" / "सोपान ऊपर" tags are furniture); and a failed check sent
back with its exact words.

Goes from today's code: the agent typing items, matching typed words against the page, the box guesses
(`boxes.ts`), the head and foot bands, the fraction heuristics.

## Trial, before building

Pages chosen for what is hard: the science side column (ch7 p3), an exercise page, a figure with labels
inside, a page break inside a block; three pages each of maths English, maths Hindi (Chanakya),
science English and science Hindi (Kokila). The answers are made by hand first. The words by a scratch
script; an agent per book does stage 2 from the written instructions alone, twice (to see how much agents
vary). Scored per book: blocks whose words, kind and number are exactly right; furniture; figure boxes
(overlap 0.9 or more); every word used once on the first try; Hindi words right over all words; how
many true readings the letters check rejects and wrong ones it accepts; fixes needed after the first try.
Go only if blocks are right on at least 95% and Hindi words on at least 99%.

## Proof, after building

Run frozen on an unseen chapter in both languages (science chapter 2), with no change to code or skill
during the run: every check holding; fixes needed after the first read counted and reported. Chapter 1
stays as a regression test: built into a scratch folder, it matches today's `items.yaml` (the same blocks
and ids, the same words but for maths written by the rules and drawn figure labels, which leave the
figures' text).

## Order

1. Done: chapter 1 English and Hindi extracted and checked; Hindi matched (36 of 36 numbers).
2. The trial.
3. Build: prepare, the skill, build and check; today's code removed as it is replaced.
4. The proof on science chapter 2.
5. The terms check on the lessons; chapter 1's threads filed.
6. `pnpm new chapter` runs it; docs and skills say it (full paths).
