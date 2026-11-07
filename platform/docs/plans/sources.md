# A chapter's sources: each language's book extracted alone, then matched by its numbers

Status: plan, agreed with the person and reviewed (6 Nov 2026); "The words come from the book" added and
reviewed 7 Nov 2026. Replaces the source parts of
`platform/docs/plans/authoring.md` (step 5's `attach`, step 7's Hindi) and of
`platform/docs/plans/languages.md` (attaching a language by aligned extraction).

**In short.** Each language's book is extracted on its own, the same way: the book's exact words, item by
item, its figures cropped, its terms as it defines them, every reading checked by the machine against the
book's own text. Ids are ours, positional (`2.4`: section 2's fourth block); languages are matched only by what both books number (sections, figures, tables,
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
- **The machine does what can be checked; a model does only the structure** (and the crop boxes).
- **Record exactly which book:** the edition the file says (this Hindi file's footer: 2021-22), the address
  it came from, its sha256. An address can start serving another book (NCERT's class 9 maths did).

## The stages

Extraction is four stages, each with one input and one output, so a part can be swapped without touching
the rest:

1. **Read:** the PDF → each page's image and its words, with where each word is and which are bold. One
   *reader* per kind of book, named in `book.yaml` (`reader:`): `text` (a PDF with a Unicode text layer),
   `chanakya` (an old Hindi font, its text layer converted by the font's table), and later `ocr` (a scan,
   no text layer: the words recognised from the image). Everything after this stage sees only words.
2. **Draft:** the words → `items.yaml`, once (below).
3. **Structure:** the model fixes the draft's blocks, kinds, numbers and boxes, and writes the terms.
4. **Check:** the items against the words (below), the figures cropped, the languages matched.

**Trust depends on the reader.** `text` and `chanakya` words are what the publisher typeset, so items
checked against them are the book. `ocr` words are a recognition, which can be wrong: an `ocr` book also
needs the model to read each page image against its words and confirm them, and is built only when a
scanned book comes.

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

**An item** is one of the book's own blocks: `{ id, kind, page, number?, text }`, where `text` is the book's exact
words (maths written as in the lessons: `(x, y)`, `−3`, `½`; a figure's or table's text is its caption
and labels), plus `answer` on a question (from the answers pages) and `crop` on a figure or table.

**Kinds**, a const enum, only what the book itself marks: section, text, figure, table, example, activity,
exercise, question. A figure's parts (a), (b), (c) are one figure.

**Ids are ours, purely positional, one scheme for every book and language**, made by the machine: the
chapter's sections in order are `1`, `2`, …; a section's blocks in order are `1.1`, `1.2`, …; a subsection
nests a level (`2.3`, its blocks `2.3.1`, …). Every kind is numbered the same way; nothing depends on how
the book numbers things.

**The book's own number is a fact about the item**, as printed: `number: "Fig. 3.11"`, `"आकृति 3.11"`,
`"Example 2"`, `"Exercise 3.2"`, `"Q1"` (a question's, under its exercise). It is checked against the page
like the rest of its words, and it is what languages are matched by (the publisher keeps it the same
across languages): its kind and digits (`figure 3.11`), not its words.

**Terms** are what the book defines: a bold word or phrase followed by its English in brackets in the
Hindi book (**मूल-बिन्दु (origin)**); in the English book, a bold term in a sentence that defines it. Each
term records the item it is defined in. Bold is read from the font (the Hindi book's bold is its own font).
The spelling where a term is defined is the book's spelling.

**Unmatched:** in a language other than English, `book.yaml` lists each numbered thing found in one book
and not the other, by its number, with why (`"figure 3.6": "the Hindi book draws (a)-(c) as three
figures"`).

## The command

`pnpm source <book>/<chapter> <lang> <pdf file or address> [answers pdf]`; run again, it redoes only the
pages whose image changed.
1. **Machine:** copies the PDF in, writes `book.yaml` (refusing a fingerprint that differs from the one
   recorded unless told the edition changed), renders each page to an image, and reads its text layer
   (an old Hindi font, Chanakya or Kruti Dev, converted to Unicode by its fixed table).
2. **Machine:** drafts `items.yaml` from the text layer (below): the words are the book's, never typed.
3. **Model:** looks at each page image beside the draft and fixes only its structure: where a block
   starts and ends, its kind, its number, each figure's and table's box; then writes the terms.
4. **Machine:** crops the figures (the watermark and the running text in a box masked) and the model looks
   at every crop; then the checks below.

`pnpm new chapter` runs it for English. Nothing else adds a source.

## The words come from the book (revised 7 Nov 2026, reviewed)

**Why.** The PDF's text layer is what the publisher typeset, letter for letter: it is the book's
content. Retyping it from page images and then proving the copy against it was backwards. Only the
structure needs judgment; the words need none.

**The draft, once.** When a language has no `items.yaml`, the machine drafts it: split at paragraph
breaks and at printed numbers, the words as the text layer has them. (Lines are grouped by overlap,
since numbers and Latin sit off the Hindi baseline, and split at column gaps; a block starts at a wider
gap, a first-line indent, or a number word from `platform/studio/src/source/numbers.ts`, including
questions' "1." and exercises' headings; blocks run across pages.) After that the file is the record:
never redrafted, and the checks prove it.

**What the model may change:** where blocks split and join, kinds, numbers, crops, and anything that is
not a letter (maths notation: `−`, `x-axis`, a fraction as `2/3`, the brackets the text layer gives as
odd glyphs). Never a letter: the check below compares letters. A figure's or table's `text` is its
caption and the labels set as text; labels drawn in the picture are in its crop, not typed.

**A font's table** is proven once, against page images, its cases kept as tests
(`platform/studio/src/source/chanakya.test.ts`).

**Ids.** They are positions, so a split or join moves the ids after it. `pnpm source`, when it
renumbers, rewrites `boards.md`'s cites by finding each old item's words among the new ones; an old item
it can't find fails the command. `plan.md` is to check again when any item's letters change or an item
is added or removed.

## Checks (in `pnpm check`)

- **The items are the book, nothing dropped or added:** each page's words, compared letters only, are
  used by the items exactly once and in order within a block. Allowed unused: the running head and
  footer, the chapter's heading ("CHAPTER 3", "अध्याय 3") with its title, and the bracket and fraction
  glyphs of maths. A dropped line fails, and so does a word read twice or a word not on the page.
- **Nothing numbered is missed:** every number the pages print after the language's own words, and each
  is an item's `number` (Fig./
  आकृति, Table/सारणी, Example/उदाहरण, Activity/क्रियाकलाप, Exercise/प्रश्नावली) has its item, in order.
- **Languages match:** every number of one language (its kind and digits) is in the other, or in
  `unmatched` with why.
- **Terms are real:** each term's words are in the item it names.
- **Figures exist** for every figure and table.
- **`plan.md` has no ids:** the person reads it, so it is plain words (its "Skipped" list names items as
  the book does: "Activity 2, the dice game"). Every citation is in `boards.md`: each board and question
  family cites the items it uses, and each skipped item is listed there with its id and why.
- **Coverage:** every English item is cited in `boards.md` or skipped there with why.
- **Cites hold:** `boards.md` cites English items that exist. When `items.yaml` changes after
  `plan.md` was approved, `plan.md` is to check again (as today when the source changes).
- **The lessons use the book's terms:** a lesson line whose English has a term but whose other language
  doesn't have that term's counterpart is a problem on its line ("must"); the counterpart spelt another
  way the book also uses (its figure's मूलबिंदु) is a "consider". It reads each language's lines wherever
  the lessons keep them.

## Chapter 1

1. English re-extracted with `pnpm source` (the same PDF; answers from today's outline checked against the
   book's answers pages). `boards.md` and the 9 threads that cite old ids re-cited to the new ones (a
   reading pass by the agent: the old ids were summaries that merged or split paragraphs; the person
   isn't shown it); `plan.md` loses its id brackets, its Skipped list in the book's words, and is approved
   again.
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
3. Hindi: the legacy-font conversion (`platform/studio/src/source/chanakya.ts`), extraction proved on the
   Hindi book; matching and its check. Done 7 Nov 2026: 86 items, 19 terms; all 36 numbered things
   match, none unmatched.
4. The draft and the one check above. Chapter 1 is not re-extracted: the drafter is run into a scratch
   file and compared with today's items (the words should agree letter for letter; each difference is a
   rule to fix); drawn labels leave the figures' `text`; the check holds on English and Hindi; the cites'
   rewrite is tested.
5. The terms check on the lessons; chapter 1's threads filed.
6. `pnpm new chapter` uses it; docs and skills say it (full paths).
