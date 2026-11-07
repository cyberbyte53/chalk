---
name: extract-chapter
description: Turn one PDF of a chapter's book (one language) into data - every block of the book with its kind, number and exact words, figures cropped, its terms; for a language other than English, matched to the English book by numbers. The machine prepares and checks; you read the pages. Use when a chapter has no source in a language, when a new edition comes, or when the source check fails. Writes authoring/books/<book>/<chapter>/source/<lang>/. For both languages, run it once per PDF (in parallel if you like).
---

# Extract one PDF of a chapter

The plan is `platform/docs/plans/sources.md`. One run is one PDF in one language. The machine
prepares the pages and checks; you read them, keeping the whole chapter in view.

## 1. Prepare

```
npx pnpm@10.28.0 source <book>/<chapter> <lang> <pdf file or address> --address <where it came from>
```

It records exactly which book (`source/<lang>/book.yaml`: its sha256, the edition the pages print) and
writes each page's image and numbered words to `.chalk-source-pages/<book>/<chapter>/<lang>/`. Check
`book.yaml`'s title and edition against page 1.

## 2. Read the pages, in order

Follow `.agents/skills/extract-chapter/reading.md`: for each page, its image and words, write
`authoring/books/<book>/<chapter>/source/<lang>/pages/page-NN.yaml`. Read in order, so you know what
a page leaves open. Never open another language's source while you read.

## 3. Build and check, until every issue is fixed or answered

```
npx pnpm@10.28.0 source <book>/<chapter> <lang>
```

It builds `items.yaml`, `terms.yaml` and `figures/` from the page files and lists issues, each with its
id and question ("a mistake, or meant?"). For each, look at the page image again: fix the page file,
or answer the issue in it with the real reason. Run again until nothing is unanswered.

Then look over the whole:
- **Every crop** in `figures/`: the whole drawing, its caption, nothing of the text beside it.
- **Every answer** the command lists: still true on the page image?
- **The chapter:** sections in order, every number once, blocks joined across pages.

**A language other than English** is also checked against the English items by kind and number, once
English is extracted (until then the command says so). Each difference is an issue, answered in this
language's `book.yaml` under `unmatched` with why ("the Hindi book draws Fig. 3.6 (a)–(c) as three
figures").

## 4. Hand over

Run `npx pnpm@10.28.0 check` (exit 0). Commit the source folder alone, naming its files. Tell the person
in a sentence or two: the book and edition, how many blocks and figures, how many issues you answered
and the kinds of reasons. Never show him ids. The chapter is ready for plan-chapter.

## Rules

- Never type a word the PDF has right: words come from the PDF; readings only where it broke them or
  flattened maths.
- Never change a check to make it pass: answer the issue, or fix the reading.
- Once anything cites an item (`boards.md`, a comment), its id never changes: a later split keeps the id
  on its first part.
