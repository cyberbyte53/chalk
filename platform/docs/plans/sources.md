# A chapter's sources: each language's book extracted alone, then matched by its numbers

Status: plan, agreed with the person and reviewed (6 Nov 2026). Replaces the source parts of
`platform/docs/plans/authoring.md` (step 5's `attach`, step 7's Hindi) and of
`platform/docs/plans/languages.md` (attaching a language by aligned extraction).

**In short.** Each language's book is extracted on its own, the same way: the book's exact words, item by
item, its figures cropped, its terms as it defines them, every reading checked by the machine against the
book's own text. Languages are matched only by what both books number (sections, figures, tables,
examples, exercises, questions). The plan cites the English items; a lesson's words in any language are
checked against that language's terms.

## What the source is for

1. **Coverage:** the lessons miss nothing the book has (each item covered by an objective or skipped).
2. **Grounding:** the book's text, examples, exercises and answers, in its own words.
3. **Language:** each language's terms exactly as its book defines them.
4. **Figures:** what the book drew, to build from and to compare against.

## Principles

- **The PDF is the truth; everything else is an index into it.** An item holds the book's own words, never
  a paraphrase (today's `says:` summaries go), and the machine checks every item against the book.
- **One process for every language.** Extracting a book knows nothing of another language's book.
- **Matching never assumes one-to-one.** Only what both books number is paired, by its number; anything
  numbered in one and not the other is flagged with a reason.
- **The machine does what can be checked; a model does only the reading** (and the crop boxes).
- **Record exactly which book:** the edition the file says (this Hindi file's footer: 2021-22), the address
  it came from, its sha256. An address can start serving another book (NCERT's class 9 maths did).

## Files

```
authoring/books/<book>/<chapter>/source/
  en/                      one folder per language, the same shape
    book.yaml              title, edition as printed, address, sha256, pages, the book's page numbers;
                           the answers' PDF the same way, when the book has one; unmatched (below)
    book.pdf               the chapter, as downloaded
    answers.pdf            the book's answers pages for this chapter, when separate
    items.yaml             every item in reading order (below)
    figures/<id>.png       each figure and table, cropped from its page
    terms.yaml             the book's terms, as it defines them (below)
  hi/
    …the same…
```

**An item** is one of the book's own blocks: `{ id, kind, page, text }`, where `text` is the book's exact
words (maths written as in the lessons: `(x, y)`, `−3`, `½`; a figure's or table's text is its caption
and labels), plus `answer` on a question (from the answers pages) and `crop` on a figure or table.

**Kinds**, a const enum, only what the book itself marks: section, text, figure, table, example, activity,
exercise, question. A figure's parts (a), (b), (c) are one figure.

**Ids are positions in that language's book**, made by the machine: a section by its number (`3.2`,
`9.2.1`); an unnumbered block by its section and place (`3.2p1`, `3.2p2`); what the book numbers by its
number (`fig3.11`, `table3.1`, `example2`, `activity1`, `ex3.2`, `ex3.2q1`); an unnumbered table, box or
"Questions" panel by its section and place too (`3.2p5`). Science books' end-of-chapter exercises are
`exercises` and `exercisesq1` …

**Terms** are what the book defines: a bold word or phrase followed by its English in brackets in the
Hindi book (**मूल-बिन्दु (origin)**); in the English book, a bold term in a sentence that defines it. Each
term records the item it is defined in. Bold is read from the font (the Hindi book's bold is its own font).
The spelling where a term is defined is the book's spelling.

**Unmatched:** in a language other than English, `book.yaml` lists each numbered thing found in one book
and not the other, with why (`fig3.6: "the Hindi book draws (a)-(c) as three figures"`).

## The command

`pnpm source <book>/<chapter> <lang> <pdf file or address> [answers pdf]`; run again, it redoes only the
pages whose image changed.
1. **Machine:** copies the PDF in, writes `book.yaml` (refusing a fingerprint that differs from the one
   recorded unless told the edition changed), renders each page to an image, and reads its text layer
   (a legacy Hindi font, Chanakya or Kruti Dev, converted to Unicode by its fixed table).
2. **Model:** reads each page image and writes the items (exact words, kinds, crop boxes) and the terms.
3. **Machine:** crops the figures (each box snapped to its caption's place in the text layer, the
   watermark masked) and the model looks at every crop; then the checks below.

`pnpm new chapter` runs it for English. Nothing else adds a source.

## Checks (in `pnpm check`)

- **The reading agrees with the book:** every item's text is found in its page's text layer, comparing
  letters only (spaces, hyphens, dashes and minus signs, line breaks and stacked fractions ignored).
- **Nothing numbered is missed:** every number the pages print after the language's own words (Fig./
  आकृति, Table/सारणी, Example/उदाहरण, Activity/क्रियाकलाप, Exercise/प्रश्नावली) has its item, in order.
- **Languages match:** every numbered id of one language is in the other, or in `unmatched` with why.
- **Terms are real:** each term's words are in the item it names.
- **Figures exist** for every figure and table.
- **Cites hold:** `plan.md` and `boards.md` cite English items that exist. When `items.yaml` changes after
  `plan.md` was approved, `plan.md` is to check again (as today when the source changes).
- **The lessons use the book's terms:** a lesson line whose English has a term but whose other language
  doesn't have that term's counterpart is a problem on its line ("must"); the counterpart spelt another
  way the book also uses (its figure's मूलबिंदु) is a "consider". It reads each language's lines wherever
  the lessons keep them.

## Chapter 1

1. English re-extracted with `pnpm source` (the same PDF; answers from today's outline checked against the
   book's answers pages). `plan.md`, `boards.md` and the 9 threads that cite old ids re-cited to the new
   ones: a reading pass (the old ids were summaries that merged or split paragraphs), the old→new list
   shown to the person; `plan.md` approved again.
2. Hindi: NCERT's own 2021-22 Hindi chapter 3 (the Wayback Machine's copy of 18 Oct 2021; address and
   sha256 in `book.yaml`), extracted and matched.
3. The terms check on the lessons; each difference a thread on its board.

## Order

1. Extraction and its checks, proved on chapter 1's English (every item found in the text layer, every
   number found, the crops looked at).
2. Chapter 1's cites moved; `outline.yaml`, its checks and every reader of it removed or moved to
   `items.yaml` (`platform/studio/src/pipeline.ts`, `platform/studio/src/mcp/look.ts`,
   `platform/studio/src/mcp/tools.ts`, `picture.ts`, `platform/editor/src/planning.ts`,
   `platform/editor/src/threads.ts`, `platform/editor/src/extension.ts`, the plan-chapter skill).
3. Hindi: the legacy-font conversion, extraction proved on the Hindi book; matching and its check.
4. The terms check on the lessons; chapter 1's threads filed.
5. `pnpm new chapter` uses it; docs and skills say it (full paths).
