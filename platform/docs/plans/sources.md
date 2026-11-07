# A chapter's sources: the book, as data

Status (transparency section reviewed 7 Nov 2026 and folded in): the first build is done (`01f6e99d`) and proved on an unseen chapter in both languages (below).
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

## Tools suggest, the agent decides, every correction is feedback

**The loop, for every piece in every language:**
1. **The tools suggest everything** a tool can: words and repairs, figure boxes, table cells, running
   heads, maths, and a draft of the structure (which words make each block, from signals any PDF has:
   gaps, indents, font size and bold, numbering; kinds only where numbering or font says so: section,
   question, exercise, caption; box, activity and equation are the agent's call). A suggestion is
   never final. The structure draft is written as a pre-filled page file.
2. **The agent decides**, on one side-by-side sheet per page (below): it accepts, or corrects, or adds
   what the tools missed. **A correction is a replacement**: at this place, instead of what was
   suggested, this goes there: a word (`L17.4: वस्तु`), a box, a kind, or blocks (blocks 4 and 5 replaced
   by one; block 7 replaced by two, split at L12.3). Corrections are short edits applied to the page
   file; a page with nothing to correct is `accept`.
   The page file holds the decided structure whole: a later change to the structure tool can't move a
   block the agent accepted.
3. **Every override is feedback.** The build works out each edit (merge, split, move words, change
   kind, a reading over a suggested one, a box moved, an addition the tools didn't flag); the agent gives
   its cause from a closed list (`LinesRunTogether`, `SideColumn`, `CaptionAway`, `BrokenAcrossLines`,
   …, an enum), with an optional note, once per cause per page; a whole page can be "draft discarded:
   why". Filling a gap a tool flagged needs no reason (the tool's own "why left" is the record). The
   overrides and causes live in the page files; `pnpm source feedback` gathers them across chapters
   (tool, version, page, range, edit, suggested, decided, cause). When a tool changes and an override
   now equals the new suggestion, it is an issue: "now matches the tool, drop it". That is the measure
   of a fix (see "How a tool is proved").

**The side-by-side sheet.** One image per page, everything the agent needs: on the left the PDF page as
printed, each block outlined and numbered and each figure's and table's box drawn; on the right our
version of the page, rebuilt from the suggestions or decisions, block by block with the same numbers,
its kind, its text, figures as their crops, tables as their grids; where a tool made no suggestion, an
empty place marked as such. Before deciding it shows the suggestions; after the build, the decisions coloured by
who made them. Drawn as HTML and photographed by headless Chrome (ImageMagick can't shape Hindi); as
HTML it is also the person's view, a block lit on both sides when hovered.

**Every suggestion is shown the same.** A tool can't know where it went wrong, so it never marks a
suggestion as sure or doubtful: that would only steer the agent away from where it should look. The
agent proofreads all of it. The one thing set apart is a fact, not a judgment: where a tool made no
suggestion at all (a broken word it couldn't repair, a caption with no drawing found), since there is
nothing there to proofread. A page whose PDF and tools haven't changed keeps its decisions; after a tool
change only what changed comes back.

**From first principles.** What we keep is only as good as what we can trace. For every word, block,
box and cell, three questions must have one answer, readable by the agent, the person and the machine:
*where in the PDF did it come from*, *what changed it*, and *who or what made the change*. Then nothing
is ambiguous, a wrong piece leads straight to the tool or the reading that made it, and a better tool
shows exactly what it would change.

**Two kinds of making.** *Structure* (which words make a piece, and what kind of piece it is) is
suggested by the structure tool and decided by the agent. *Content* (a piece's letters, a figure's
edges, a table's cells) is the PDF's as it is, a tool's, or the agent's. So a snapped figure is "chosen by the agent, edges by figure-snap"; a block's
words are the PDF's except the spans a tool or the agent changed.

**Where it is recorded.** The tools are deterministic (the PDF in, and for snapping the agent's rough
box), so their proposals are not stored: they are made again at every build. Each built item in
`items.yaml` (committed, and rebuilt and compared by `pnpm check`) lists only what didn't come from the
PDF as it is: `made: [{ words: L17.16, by: hindi-repair }, { words: L56.5-L57.3, by: agent }, { box,
by: figure-snap }]`. `book.yaml` records the tools' versions the chapter was built with, the reader's
among them. The agent's page file, `pages/page-NN.yaml`, holds the structure and, against the tools,
only where it differs, each difference with its one line of why: a reading over a word range (it replaces every proposal the range touches, and
must cover each one whole; a partial overlap is an issue), an addition, an answer. A proposal the
agent doesn't override is accepted: the page file is the agent's word that it checked every repair,
box and grid on that page against the image. A block's `number` and `title` are word ranges of the
page, not typed, so they too come from the PDF or a reading.

**The words' numbering is a tool's output too** (lines, columns): the reader's version is fixed per
chapter in `book.yaml`, and the build fails when a cited range's words are no longer what they were.

**Seeing it.**
- *Before reading*, the agent gets each page marked up: line numbers on the image; the tools' work
  drawn on it (the PDF's drawn objects outlined, table grids, repaired words, furniture); and beside it
  what is open (broken spans left with their candidates, a caption with no figure, a table without
  rules). The proposals for this view live only in `.chalk-source-pages/`. Figures: objects outlined
  before reading, snapped from the agent's rough box at the build, crop looked at after.
- *After the build*, the review sheet colours each piece by its maker (the PDF, a tool, the agent; red
  for open), and each chapter has a tally by maker and tool ("Hindi words: 400 by hindi-repair, 76 by
  the agent; figures: 22 snapped, 1 drawn by the agent"). (A `trace` command printing an item word by
  word is easy to add if wanted; not built now.)

**The agent's instructions say:** the page file is your word that you checked every repair, box and
grid on the page; override by a word range covering whole proposals; a word broken across two PDF lines
is one range spanning both; a "nearest" suggestion is a hint, and a reading taken from it is yours;
never repeat a repair you agree with.

**When a tool changes**, the chapter is rebuilt and every piece whose content changes is an issue on
its page, whether the agent had overridden it or accepted it: output the agent never saw is never kept
silently. What the agent keeps doing across chapters and a tool could easily do becomes a tool rule
(as words broken across two PDF lines, which the proof of concept showed), proved like the others.

**Proved on three Hindi pages (7 Nov 2026):** with the machine first, the tools fixed 400 broken words
and the agent 76; the final letters were all right; the agent caught every machine mistake that
mattered (2 wrong, 4 incomplete, 1 missed: all words broken across two PDF lines). Time and tokens were
about the same as reading everything, since looking at each page and writing its structure dominates:
the gain is in retyping and mistakes, and structure proposals are what would save time, to be tested.

## How a tool is proved

A later agent reads the overrides and their causes across chapters (`pnpm source feedback`), finds
where a tool keeps falling short, and proposes the fix; the fix is a tool change, proved as below, and
measured by the overrides it makes unnecessary.

Each tool's claim is a test kept in the repo: it is shaped on development books (science chapter 2,
maths chapter 1), then run on a book none of it was shaped on, and only then used. Once a fix is made
from a book, that book is no longer unseen: the next check takes a fresh one. Held-out so far (7 Nov
2026): the Hindi repair on science chapter 7's Kokila pages, 0 wrong (16 → 100 of 118 lines right), with
pieces grouped by where they sit (pieces that touch on the page are one word); the table cells on
geography chapter 2 (a ruled grid exact, unruled tables raised for the reader, never guessed); the
figure snapping failed there (a photo filling its box was taken for a panel) and is being fixed.

## Checks

Every check raises issues the session fixes or answers; none silently passes.

- **Every word is used once, with one maker:** in exactly one block, figure, table or the page's
  furniture; its content the PDF's, a tool's or the agent's, never two.
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
    book.yaml            title, reader, edition (as printed, or none), address, sha256, pages, the
                         tools' versions it was built with;
                         answers (the answers pages' PDF, when the book has one)
    book.pdf             the PDF, as downloaded
    pages/page-NN.yaml   the agent's reading of each page (structure; where it differs from the tools;
                         answers)
    ideas.yaml           the chapter's key ideas: { idea, terms, items } (replaces the first build's
                         terms.yaml)
    words.yaml           Hindi: the words this book prints that the list lacks, each answered once
    items.yaml           built: every block { id, kind, page, number?, title?, text, rows?, crop?, answer?,
                         made? (what didn't come from the PDF as it is, and by whom) }
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
chapter), MinerU and Marker (heavy general layout models, weak on these books; our structure draft uses only
the PDF's own signals and is a suggestion the agent proofreads), PyMuPDF (AGPL; and it reads the Kokila Hindi worse than poppler), pdffigures2
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
   Then the reader's column split (a line running across two columns is two lines); then the structure
   draft, the side-by-side sheet, short edits and `pnpm source feedback`, proved first by a proof of
   concept on a few pages (agent time and tokens, accuracy, pages accepted at a glance), then on
   development and unseen books.
3. The measure above, on science chapter 2; then chapter 1 converted.
4. The lessons' terms check (self-review, from `match.yaml`); chapter 1's threads filed.
5. `pnpm new chapter` runs it; docs and skills say it (full paths).
