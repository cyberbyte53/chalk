---
name: extract-chapter
description: Turn one PDF of a chapter's book (one language) into data - every block with its kind, number and exact words, figures cropped, its terms. The tools pre-fill each page; you proofread it all on a side-by-side sheet. Use when a chapter has no source in a language, when a new edition comes, or when the source check fails. Writes authoring/books/<book>/<chapter>/source/<lang>/. For both languages, run it once per PDF (in parallel if you like), then write the concepts and attach the other languages to them.
---

# Extract one PDF of a chapter

The plan is `platform/docs/plans/sources.md`. One run is one PDF in one language. The tools suggest; you
decide; every correction is feedback.

## 1. Prepare

```
npx pnpm@10.28.0 source <book>/<chapter> <lang> <pdf file or address> --address <where it came from>
```

It records exactly which book in `source/<lang>/book.yaml`, pre-fills each page's file in
`source/<lang>/pages/page-NN.yaml` from the structure draft, and writes each page's image, numbered
words and side-by-side sheet to `.chalk-source-pages/<book>/<chapter>/<lang>/`. Set the title and edition
from page 1, as printed, with `--title` and `--edition` (`none` if no edition is printed).

## 2. Proofread the pages, in order

Follow `.agents/skills/extract-chapter/reading.md`. For each page, look at its sheet: the page as printed
beside our version of it. Proofread all of it, since no suggestion is marked sure or doubtful. Correct
the page file by replacing what is wrong; add what the tools missed; give the cause of each replacement;
then set `proofread: true`, corrected or not. Read in order, so you know what a page leaves open. Never
open another language's source.

## 3. Build and check, until every issue is fixed or answered

```
npx pnpm@10.28.0 source <book>/<chapter> <lang>
```

It builds `items.yaml`, `terms.yaml` and `figures/` from the page files, draws each proofread page's
decisions sheet (`page-NN.decisions.png`) and lists issues, each with its id and question
("a mistake, or meant?"). For each, look at the page again: fix the page file, or answer the issue in it
with the real reason. Run again until nothing is unanswered.

Then look over the whole:
- **The decisions sheets**, each piece coloured by who made it (the PDF, a tool, you), and every figure's
  crop: the whole drawing, its caption, nothing of the text beside it.
- **Every answer** the command lists: still true on the page?
- **The chapter:** sections in order, every number once, blocks joined across pages.

## 4. Concepts: the main book's (English) summary

Once every page is proofread and the build holds, read your built `items.yaml` whole and write
`source/en/concepts.yaml`: what the book teaches, one concept per thing, in the book's order.

```yaml
concepts:
  - key: solution-is-homogeneous        # short, kebab-case, English: attached books name it by this
    concept: A solution is a homogeneous mixture of a solute dissolved in a solvent.
    terms: [solution, solute, solvent]  # exactly as printed (the check finds each in its items)
    items: ["2.1"]                      # where the book introduces it
answers:
  sets-apart term: why it is in no concept   # only when one isn't
```

A concept is what a student should come away knowing, in one plain line: not a paragraph's summary,
not an activity's steps. A concept may set apart no term (`terms: []`); a term is written as printed, plural
if the book prints it so. What a box teaches is a concept like any other; a box that only adds colour
(a story, a scientist's life) isn't. Every term the book sets apart (`terms.yaml`) belongs to some concept, or is
answered. Then `npx pnpm@10.28.0 source attach <book>/<chapter>` checks it.

## 5. Attach (an attached language, once its book and the main book's concepts are done)

```
npx pnpm@10.28.0 source match <book>/<chapter>     # numbered things paired; answer what only one book has
npx pnpm@10.28.0 source attach <book>/<chapter>
```

`attach` writes the sheet `.chalk-source-pages/<book>/<chapter>/<lang>/attach.md`: each main concept, its
items' words, and where the tool suggests this book has it (paired items, sections to look in, terms
with the main language printed beside them). The suggestion is a start, never marked sure; proofread
each against this book's `items.yaml` and write `source/<lang>/concepts.yaml`, every main concept once:

```yaml
concepts:
  - key: solution-is-homogeneous
    concept: विलयन दो या अधिक पदार्थों का समांगी मिश्रण है।   # this book's own line, its words
    terms: [विलयन, विलेय, विलायक]                            # as this book prints them
    items: ["2.1"]                                           # where this book introduces it
  - key: some-key
    absent: why this book doesn't teach it
answers:
  set-apart term: why it is in no concept   # what only this book teaches, said
```

Leaving out an item or term the tool suggested takes a `cause` (`wrong-place`: it isn't where this
book has the concept; else `other`) and a `note` saying what was wrong. Quote a line that holds a colon
(`concept: "…: …"`): YAML reads a bare one as a key. Run `attach` again until it holds. Never translate: every line and term is this book's own.
`npx pnpm@10.28.0 source term <book>/<chapter> <term>` then answers "what does the other book call it,
and where".

## 6. Hand over

Run `npx pnpm@10.28.0 check` (exit 0). Commit the source folder alone, naming its files. Tell the person
in a sentence or two: the book and edition, how many blocks and figures, how much you corrected and why,
how many issues you answered. Never show him ids. The chapter is ready for plan-chapter.

## Rules

- Never type a word the PDF has right; never repeat a suggestion you agree with. The page file holds the
  decided structure and, against the tools, only where it differs.
- `proofread: true` is your word that you checked every word, box and cell on that page against the image.
  It is the only way past "not proofread yet": that issue can't be answered.
- Never change a check to make it pass: answer the issue, or fix the reading.
- Once anything cites an item (`boards.md`, a comment), its id never changes: a later split keeps the id
  on its first part.
