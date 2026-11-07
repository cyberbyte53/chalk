# A chapter's sources: the book, as data, made by the machine

Status: plan, rewritten from first principles and reviewed 7 Nov 2026 (replaces this file's earlier
versions; the decisions that held are kept).

**In short.** `pnpm source <book>/<chapter> <lang> <pdf>` turns a chapter's PDF into data with no typing:
its words, its blocks (sections, paragraphs, figures, examples, exercises, questions), its figures
cropped, its terms, and, for a second language, its pairing with the English book. A model then looks
once at a sheet of each page with the blocks drawn on it and fixes only what is wrong. Every chapter of
every book starts here.

## What it is for

1. **Coverage:** the lessons miss nothing the book has (each block cited in `boards.md` or skipped).
2. **Grounding:** the book's own words, examples and exercises.
3. **Language:** each language's terms as its book defines them.
4. **Figures:** what the book drew.

## First principles

- **The PDF's text layer is the book.** It is what the publisher typeset, letter for letter. Words are
  taken from it, never typed and never recognised from a picture when the PDF has them.
- **Generic: geometry and repetition, never one book's words.** Books differ (maths 2020: "आकृति 3.1"
  under a figure, "EXERCISE 3.1"; science 2026: a side column of "Think It Over", "Fig. 7.2: Lifting
  bags…" inline, "Eq. 7.2", Hindi "चित्र 7.2 (क)"). What every book has is a page's geometry (lines,
  columns, gaps, indents, bold and size) and its own repetition (a running head on every page, the same
  word before many numbers). Rules use only those. The words a book numbers things with are found in
  the book, not written in code.
- **A figure is the drawing between its caption and the block above it.** Its box is found on the page
  image: the ink that isn't the text layer's words, the watermark, a frame or a long rule.
- **A model only reviews.** It looks at what the machine made, drawn over each page, and fixes the few
  blocks the rules got wrong, and picks the terms. It types no words.
- **Rules are NCERT's, not one chapter's.** A fix stays in that chapter's `items.yaml`; it becomes a rule
  only when the same fix is needed in a second book.
- **Each language alone, then matched by numbers.** A book's extraction knows nothing of another
  language's. Languages are paired only by what both number (`figure 3.11`), never assumed one to one;
  what one has and the other doesn't is listed with why.
- **Record exactly which book:** the edition its pages print, the address, the sha256. An address can
  start serving another book (NCERT's class 9 maths did).

## The stages

One command runs them in order; each has one input and one output.

1. **Read** the PDF into pages of words: each word, its place, bold or italic; and each page's image.
   One *reader* per kind of book, found from its fonts and recorded in `book.yaml`: `text` (a Unicode text
   layer, with the repairs some fonts need: the 2026 Hindi science books' Kokila doubles letters,
   "विस््थथापन" for विस्थापन) or `chanakya` (the old Hindi font, converted by its table). Each is proven
   once on a book's pages, its cases kept as tests. A scanned book would be one more reader (`ocr`, Docling or Tesseract, its words then
   confirmed by the model) when one comes; nothing after this stage changes.
2. **Lay out** the words into blocks, by rules:
      - lines: words that overlap vertically, split at a column gap (a figure's labels beside a paragraph);
   - the running head and footer: lines repeated on three or more pages, digits aside (even and odd
     pages have different heads);
   - columns: a page's text in columns by the gaps between them (a side column is its own run of
     blocks, kept in its place);
   - headings: a line set larger or bolder than the body, starting with the chapter's number and more
     (`3.2`, `7.1.2`), in order;
   - blocks: a new one at a wider gap, a first-line indent, or a numbering word; a block runs on across
     pages;
   - **the book's numbering words, found:** the words that come before the chapter's numbers again and
     again ("Fig." 100 times, "Example" 14, "Eq." 7 in a science chapter; "आकृति", "प्रश्नावली" in a maths
     one) are listed with their counts; the model says once per book what kind each is (`figure`,
     `example`, `equation`, …, or none for "of 7.2"), kept in the book's `numbering.yaml`, and every
     chapter of that book uses it. A frequent word with no kind fails the check;
   - figures and tables: each caption (its numbering word, its number, any words after it) and the
     drawing next to it, all its parts together; a word is a label only inside one part's own box;
   - maths written as the lessons write it, by fixed rules: `−`, a stacked fraction `2/3`.
3. **Review**: the machine draws a sheet per page (the page image, each block outlined and labelled
   with its id, kind and number), the pages a check flagged first, and lists the crops and the term
   candidates (the Hindi book's bracketed English, e.g. **मूलबिन्दु (origin)**, serves both languages;
   bold and italic phrases). The model makes only these fixes in `items.yaml`: split, join, kind, box;
   and picks the terms by choosing words from their block.
4. **Check** (also in `pnpm check`), below, including the languages' match by numbers.

`items.yaml` is made once; after the review it is the record (a later run checks it, never remakes it).
Ids are positions (`2.4`: section 2's fourth block) until anything cites them (`boards.md`, a comment, a
review stamp); from then they never change: a later split keeps the id on its first part and gives the
rest `2.4b`, a join keeps the first id.

## Files

```
authoring/books/<book>/<chapter>/source/<lang>/
  book.yaml       title, reader, edition as printed, address, sha256, pages, the book's page numbers;
                  unmatched (not English: numbered things only one book has, with why)
  book.pdf        the chapter, as downloaded
  answers.pdf     the book's answers pages for the chapter, when it has them (optional)
  items.yaml      every block: { id, kind, page, number?, text, crop?, answer? } (answer: from the
                  answers pages, read in the review)
  figures/<id>.png
  terms.yaml      { term, item, english? } (english: a Hindi term's bracketed English)
```

Kinds: section, text, figure, table, equation, example, activity, exercise, question (a closed list, in
code; a book's words map onto it). `authoring/books/<book>/numbering.yaml`: the book's numbering words
and their kinds, per language. Page images and review
sheets are in `.chalk-source-pages/` (not in git).

## Checks

- **The blocks are the book:** each page's words, compared letters only, are used by the blocks exactly
  once and in order (the running head, footer and chapter heading aside). A dropped, repeated or invented
  word fails.
- **Nothing numbered is missed:** each number the pages print after a number word is a block's, of
  that kind, in order.
- **Figures** each have a box, a crop, and their caption beside the box.
- **Terms** are in the words of their block.
- **Languages match**, or the difference is in `unmatched` with why.
- **The plan:** `plan.md` has no ids (the person reads it); every English block is cited in `boards.md` or
  skipped there with why; every cite exists. `plan.md` is to check again when a block's letters change or
  a block is added or removed.
- **The lessons use the book's terms:** a lesson line whose English has a term and whose Hindi lacks its
  pair is a "must" on that line; the pair spelt another way the book also uses is a "consider".

## The code

`platform/studio/src/source/`, self-contained (it imports only libraries and `@chalk/content`'s
`Locale`; the rest of Chalk only reads its files): `pipeline.ts` (the stages in order), `read/` (a file
per reader, and what readers share), `layout.ts`, `review.ts` (the sheets and term candidates),
`check.ts`, `files.ts`, `schema.ts`. `platform/studio/src/source-cli.ts` only parses its arguments
(`node:util` `parseArgs`). No Python: Docling was tried on chapter 1 (7 minutes for 15 pages; 8 of 17
captions, a section heading missed) and is kept in mind only as a future `ocr` reader.

What goes from today's code: the model typing items, matching typed words against the page, the
caption-snapping and box guesses (`boxes.ts`), the head and foot bands.

## Proof

Chapter 1 shaped the rules, so it can't prove them. The rules are frozen, then one unseen chapter is
run in both languages: class 9 science's "Work, Energy, and Simple Machines" (2026: a side column,
inline captions, equations, Hindi's Kokila text layer and चित्र (क)): every check holding, no word typed, and at most 10 review fixes per language, written down
before the run. Chapter 1 stays as a regression test: the machine's output made into a scratch folder
matches today's reviewed `items.yaml` (the same blocks, so the same ids; words letter for letter except
maths written by the rules; figure boxes within a few points). Drawn labels leave chapter 1's figures'
`text`.

## Order

1. Done: English and Hindi extracted by hand-checked reading; Hindi matched (36 of 36 numbers).
2. The machine's stages (read, lay out, review sheets, check) and the one blocks check; chapter 1 as a
   regression test; today's code removed as it is replaced.
3. The proof on an unseen science chapter, both languages.
4. The terms check on the lessons; chapter 1's threads filed.
5. `pnpm new chapter` runs it; docs and skills say it (full paths).
