# A chapter's sources: the book, as data

Status: the first build is done (`01f6e99d`) and proved on an unseen chapter in both languages (below).
This revision, round 2, folds in what the proof showed: tools that take the repetitive work off the
reader, an ideas list per book, and matching as its own step. Reviewed with experiments on the proof's
pages (folded in); to be built. Earlier
versions of this file are in git.

**In short.** Extraction takes one PDF in one language. `pnpm source` turns it into page images with
their lines numbered on them, and numbered words, with what the machine can work out already done (broken
Hindi repaired where only one real word fits, maths written from where its pieces sit, running heads
proposed). The session running the `extract-chapter` skill reads the pages in order: which words make
which block, which drawing is each figure, the words the machine couldn't repair; and at the end the
book's ideas, each with its terms and where it is introduced. The machine builds the items, snaps each
figure to its drawing, lays tables into rows, draws a review sheet of each page, and raises issues to fix
or answer. Matching two languages is a separate step: numbered things pair by number, ideas pair by an
agent, into one small file. This is document anchoring (as olmOCR does it), with our agents as the model,
the machine doing everything that can be computed, and checks around both.

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
- **Checks raise issues; the agent decides.** Every check names its place and words and asks: a
  mistake, or meant? The agent rechecks against the image and either fixes it or answers it with a
  reason, kept beside the item ("the PDF lacks ई and ं; the image shows ईंधन"). An answered issue passes
  and stays listed; the orchestrator reads every answer. Only what can't be meant can't be answered: a
  file that doesn't parse, a range not on the page.
- **The machine computes what can be computed; the reader judges the rest.** Every tool proposes or
  checks; none decides what only reading the page can.
- **Each language alone; matching is its own step.** Extracting a book never looks at another
  language's. Matching pairs what both books number, and their ideas (never assumed one to one; what
  one book has and the other doesn't is listed with why).
- **Record exactly which book:** the edition its pages print, the address, the sha256.

## The stages

**Extract** (one PDF; the `extract-chapter` skill):

1. **Prepare** (`pnpm source <book>/<chapter> <lang> <pdf> --address <url>`, the machine): the PDF copied
   in and recorded in `book.yaml` (its sha256, address, reader; its title and edition are the
   session's to set from page 1, since the PDF's text can't be trusted for them and some books print
   no edition). For each page, into `.chalk-source-pages/<book>/<chapter>/<lang>/`:
   - its image, and the same image with each line's number drawn at its start (`L14`);
   - its words, numbered (`L14.3`), a PDF line split where a column-sized gap runs through it (a side
     box beside the body);
   - the machine's proposals, each marked in the words file and each a reading the session may keep or
     change:
     - **Hindi repaired**, every Hindi word, not only those that look broken (94 unmarked words were
       broken in the proof, सूक्षष्मदर्शी 26 times): from a PDF span the machine makes its candidates
       (pieces joined, doubles collapsed, ॠ→ऋ, ा+ॅ→ॉ, a mark standing alone tried in each place it can
       go); if exactly one candidate is in the Hindi word list it is the repair; with several or none,
       the span stays marked for the session. On the proof's 2,356 readings this repairs 2,095 with
       none wrong, and leaves about 260 to read (30 with several real candidates, 157 technical words
       the list lacks, 22 in a non-Unicode encoding).
     - Later, with a maths chapter (nothing to show on science chapter 2): maths written from position
       (a smaller, raised piece a superscript, stacked digits a fraction) and furniture proposed from
       repetition.
2. **Read** (the session, the pages in order, so it knows what a page leaves open): for each page a
   page file, `source/<lang>/pages/page-NN.yaml`: blocks in reading order (their words, kind, number as
   printed, title, whether they continue), each figure's and table's rough box, the furniture, readings
   for what the machine couldn't repair (a reading must be one of the span's candidates; an unreachable
   span, such as a non-Unicode glyph, is answered with why), and answers to issues. Then, having read the whole chapter,
   `source/<lang>/ideas.yaml`: the chapter's key ideas (about 15 to 30), each one line in the book's
   language, its terms exactly as printed, and the items it is introduced in.
3. **Build and check** (`pnpm source` again, the machine): items built from the page files; a block
   that continues joined with the next page's continued block (taking its number from where it starts);
   ids positional, an exercise holding everything up to the next section or exercise; each figure's
   box snapped to the PDF's own image and vector objects inside the rough box (the objects at the same
   place on every page, the watermark, background and logo, left out; the PDF's object frame and its
   text frame made one), its crop those objects with its label words; each table's cells taken from
   its drawn rules and its words placed in them by position (a table without rules: the session marks
   its rows); figures cropped; a review sheet per page (the image with each block outlined and labelled with its id, kind
   and number); then the checks, each raising issues to fix or answer. The session looks at every crop,
   every review sheet and every answer.

**Match** (once both books are extracted; `pnpm source match <book>/<chapter>`): the machine pairs every
numbered thing by kind and digits (a question by its number and which exercise it is in, counted in
order); an agent pairs the two ideas lists and their terms. Both go into `source/match.yaml`: the pairs,
and what one book has and the other doesn't, each with why. The check: every numbered thing and every
idea on both sides is paired or answered; each term pair's terms belong to their paired ideas.

**The record** is the page files, `ideas.yaml` and `match.yaml` (in git): every judgment, with every
reading and every answer. `items.yaml` is built from them and the PDF, so `pnpm check` builds it again
and checks the two agree. Ids are positions (`2.4`: section 2's fourth block) until anything cites them;
then they never change (a later split keeps the id on its first part and gives the rest `2.4b`): the
check fails when a cited id would change.

## Checks

Every check raises issues the session fixes or answers; none silently passes.

- **Every word is used once:** in exactly one block, figure, table or the page's furniture.
- **Pages join:** a block that continues is followed by a continued block on the next page.
- **Readings are the page's:** a Hindi reading must be one of its span's candidates (exact: nothing can
  be invented, and the true reading is always reachable unless the PDF dropped letters, as इधन for
  ईंधन, answered with why); each word of it in the Hindi word list, else an issue, raised once per
  distinct word for the whole book (a technical word the list lacks is answered once, "a real word,
  as printed", and joins the book's list). A reading of maths keeps the PDF's letters and digits.
- **Numbers:** each kind's numbers in order, none twice; each number in its block's words.
- **Figures and tables** each have a box inside the page with its caption, and a crop; an object
  crossing the rough box's edge is an issue (a figure cut off: it found the two crops the proof fixed
  by eye).
- **Ideas:** each term printed in the items its idea cites (trailing punctuation aside); every bold
  phrase inside a text block (the PDF's font says bold: activity verbs, box titles and page numbers are
  outside text blocks) in some idea, or answered.
- **Match** (its own step), above.

The checks on the plan (every block cited or skipped, cites exist, `plan.md` has no ids) are the
pipeline's, run by plan-chapter; the check that lessons use the book's terms is self-review's, reading
`match.yaml`'s term pairs.

## Files

```
authoring/books/<book>/<chapter>/source/
  <lang>/                one folder per language, the same shape
    book.yaml            title, reader, edition (as printed, or none), address, sha256, pages;
                         answers (the answers pages' PDF, when the book has one)
    book.pdf             the PDF, as downloaded
    pages/page-NN.yaml   the session's reading of each page
    ideas.yaml           the chapter's key ideas: { idea, terms, items } (replaces the first build's
                         terms.yaml)
    words.yaml           Hindi: the words this book prints that the list lacks, each answered once
    items.yaml           built: every block { id, kind, page, number?, title?, text, rows?, crop?, answer? }
    figures/<id>.png     built
  match.yaml             the two languages paired: numbered things, ideas, terms; and what only one has
platform/studio/src/source/hindi/   the Hindi word list (LibreOffice hi_IN, GPL, with its licence;
                                    used only by this authoring tool, never in the app)
.chalk-source-pages/<book>/<chapter>/<lang>/  not in git: images, numbered images, words, review sheets
```

Kinds (closed): section, heading (a heading without a number: "Mitosis"), text, box (with its printed
`title`), figure, table (with `rows`), equation, example, activity, exercise, question.

**The Hindi word list** is the LibreOffice `hi_IN` dictionary (207k stems with affix rules, expanded once
to a flat list), kept as its own folder with its GPL licence and used only by this authoring tool, plus
every book's `words.yaml`. It has some junk (सेे, जंतुओ), so it decides only between candidates; the
candidates make sure nothing is invented.

## The code

`platform/studio/src/source/`, self-contained (libraries and `@chalk/content`'s `Locale` only; the rest
of Chalk only reads its files): `pipeline.ts` (prepare; build and check; match), `read/` (a file per
reader; lines with column splits; the proposals: Hindi repair, maths, furniture), `build.ts` (blocks,
joins, ids, figure snapping, table rows), `sheets.ts` (numbered images and review sheets), `check.ts`,
`match.ts`, `files.ts`, `schema.ts`. `platform/studio/src/source-cli.ts` only parses arguments. The
skill `.agents/skills/extract-chapter/` (one PDF), with `reading.md` for reading the pages and writing
the ideas; matching is a section of the same skill, run once both books are extracted. The PDF's
image and vector objects are read with pdf.js (Apache-2.0; PyMuPDF does the same but is AGPL).

**Tools considered and not used:** Docling (tested: 8 of 17 captions, a section missed, 7 minutes a
chapter), MinerU and Marker (layout drafts: structure was never the cost, and a weak draft costs more to
correct than to write), PyMuPDF (AGPL; and it reads the Kokila Hindi worse than poppler), pdffigures2
(papers only, unmaintained), Camelot (tables from rules is a few lines here).

## Trial (7 Nov 2026)

Three pages each of maths English, maths Hindi (Chanakya), science English and science Hindi (Kokila,
broken text), chosen for what is hard (the side column, an exercise across a page break, labelled
figures); answers made by hand first; an agent per book, from written instructions only, 13 runs.
- **Letters:** 100% in every book once issues are answered (the Hindi science PDF alone: 90.5%); no
  misreading in any run. The one place the PDF lacks letters the page prints (इधन for ईंधन) was raised and
  answered with its reason.
- **Figure boxes:** 32 of 34 within overlap 0.9, the rest at 0.88–0.90.
- **Blocks:** science 94–97% strict; every remaining difference was an unclear instruction (how a list
  groups) or the key's own mistake, now settled in the skill: a line that introduces a list and its items
  are one block; a continued block takes its number from where it starts; a heading without a number is a
  `title`; a frame without a heading is still a box.
- **Agents agree** with each other run to run; about 1–3 minutes and 50–80k tokens per 3 pages.

## Proof (7 Nov 2026), and what it changed

Science chapter 2, "Cell: The Building Block of Life" (2026), 20 pages in each language, read with the
first build's skill unchanged:
- **English:** 158 blocks, 26 figures and tables, 1 issue answered, 9 minutes; 3 crops fixed by eye.
- **Hindi (Kokila):** 158 blocks, 28 issues answered, 21 minutes; **2,356 spans read from the image**.
- **Found:** questions after a figure fell out of their exercise (ids); headings without a number had
  no kind (English made them text, Hindi sections); matching sat inside a language's check; titles were
  cut and no edition is printed. And the letters check was both too loose (wrong collapses passed:
  अध्यन, प्रूपी, त्व) and too strict (30 true readings answered: split conjuncts, vowels in two parts,
  real doubles). Round 2 above answers each: the word list, the Hindi repair, the `heading` kind, the
  exercise rule, matching as its own step, the session setting title and edition.

**Measure for round 2:** first, the proof's 2,356 Hindi readings become a test of the repair (target:
none wrong). Then both books of this chapter redone, compared with the first proof: spans the session
reads (from 2,356), minutes, wrong machine repairs (0), the edge-crossing issue against the crops fixed
by eye, issues answered, and a hand sample of blocks checked. Then chapter 1, converted with its cited
ids kept, as the regression test.

## Order

1. Done: the first build; the trial; the proof.
2. Round 2: the fixes (ids, `heading`, matching out of extraction, title and edition); the repair's
   test from the proof's readings; then, in the order they save most: the Hindi repair and the word
   list; numbered page images and column splits; figure snapping and table cells; review sheets; then
   `ideas.yaml` and the match step. Maths from position and furniture proposals with a maths chapter.
3. The measure above, on science chapter 2; then chapter 1 converted.
4. The lessons' terms check (self-review, from `match.yaml`); chapter 1's threads filed.
5. `pnpm new chapter` runs it; docs and skills say it (full paths).
