---
name: extract-chapter
description: Turn one PDF of a chapter's book (one language) into data - every block with its kind, number and exact words, figures cropped, its terms. The tools pre-fill each page; you proofread it all on a side-by-side sheet. Use when a chapter has no source in a language, when a new edition comes, or when the source check fails. Writes authoring/books/<book>/<chapter>/source/<lang>/. For both languages, run it once per PDF (in parallel if you like), then match them.
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

## 4. Match, once both languages are extracted

```
npx pnpm@10.28.0 source match <book>/<chapter>
```

The machine pairs every numbered thing by kind and digits into `source/match.yaml`. Each thing only one
book has is an issue: answer it there, under `answers`, with why ("the Hindi book draws Fig. 3.6 (a)–(c)
as three figures").

## 5. Hand over

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
