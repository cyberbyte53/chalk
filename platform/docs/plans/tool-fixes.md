# Tool fixes from the chemistry extractions

Fourteen books (seven chemistry chapters, English and Hindi) were proofread by agents; their reports
and page files show where the tools left the agents hand work. Each fix below makes a tool suggest more,
or keeps content we lose today; none changes how words are numbered, since every page file cites words
by number. Each is proved on the proofread page files themselves: what the agents decided is the key.

## How each fix is proved

The proofread page files are the ground truth, read **block by block, not reading by reading**: each
book is built twice, once from the tools alone (the draft and every suggestion, no agent decision) and
once as decided. The measure is how many blocks' text the tools alone get exactly right, before and
after a fix, and which blocks a fix makes newly wrong (each looked at against the page image). Rebuilding
also lists, as today, the agents' readings a fix makes redundant ("now matches the tool, drop it") and
the checked pieces it changes ("changed"). The agents' recorded overrides (`pnpm source feedback`) count
what the tools got wrong in use: the Hindi repair already has 32, so "0 wrong on the proof" is not "0
wrong".

Each fix is **developed on class 10's four chapters and measured on class 9's three**, a different
typesetting it never saw (with fix 4, class 9 measured using class 10's answered words only). Its unit
tests stay in the repo; the existing proofs hold.

## The fixes, most valuable first

1. **The page 1 sheet without its image** (seen twice): found and fixed. Cheap; first.

2. **Words the agents answered as real are known, and true doubles aren't collapsed.** The repair's
   most common wrong suggestion (अपररूप → अपरूप five times, प्लेटलेट before it) is a real double
   collapsed as the PDF's. An agent's "a real word, as printed" answer, in any book, joins a shared list
   beside the Hindi word list, with where it was answered; with अपररूप known, its two readings are both
   real and the span is left to the agent: never again a wrong suggestion. Before fix 4 below, which
   reads the list.

3. **Hindi words split by a real space** (के वल, कै से, रे खा, इले क्ट्रॉन). The word list can't tell
   (कै, से, वल, रे, खा are all real), but the page can: in a justified line the gaps between words are
   equal (3.0, 3.0, 3.0) and a false gap is narrower than its own line's (के|वल 2.3 against 3.0). Two
   neighbouring spans join when the gap between them is well below their line's usual gap and together
   they are exactly one real word. A line with no stretch (a paragraph's last) is left to the agent.

4. **A drawing with no words is kept.** Today a block needs words, so a figure or equation the PDF draws
   as a picture is lost (three in carbon, Hindi; an uncaptioned photo in acids). A figure or equation
   may have a box and no words: cropped like any figure; an equation's text is the agent's reading of
   it (made by the agent, so planning reads it).

5. **Subscripts and charges** (H₂O, Fe₃O₄(s), SO₄²⁻, ¹²₆C), a new tool. Nothing out of the box does
   this openly: MinerU and Marker recognise formulas with models (slow; dropped for that and their
   licences), Aspose flags scripts but is commercial. The PDF says it: pdf.js (already ours) gives each
   piece's font size and baseline ("HNO" size 9.5, its "3" size 5.5 and 3.1 points lower). The tool
   suggests **one reading per touching run**, as the agents read them ("Fe₃O₄(s)", "(H₃O⁺)."), with each
   smaller, lowered or raised piece written in Unicode script inside it: digits, +, and − (the PDF's en
   dash as minus); a piece holding both, as "3–" in NO₃⁻, split by its glyphs' own baselines; stacked
   scripts (SO₄²⁻, the 4 numbered lines away from the 2–) ordered subscript first; scripts before their
   base (¹²₆C) kept before it. A run's words may come from numbered lines far apart: the suggestion
   takes them by id, not as a range.

6. **A number glued to its first word by a tab** ("2.4\tलवण"). The build takes a block's number from
   the text before the tab and gives the rest to its title or text; tabs inside a line become spaces.
   No word is split, so no numbering changes.

7. **The reader chosen by the body text.** One Chanakya font anywhere (five figure labels) made a whole
   book Chanakya. The text reader is kept unless most of the page text it gives is not Unicode
   Devanagari. For books to come (the carbon book already records its reader).

8. **Bullets.** pdf.js gives each piece's font, so a symbol font's bullet that pdftotext gives as a
   letter ("n") at a line's start is known, not guessed: the draft's furniture. Last; dropped if the
   font can't be tied to the word reliably.

Left out: joining an English word hyphenated at a line's end (two cases, and with no English word list
"non-" + "metals" can't be told from "sepa-" + "ration").

## Kept only if it earns its place

The agent exists for what tools can't do well, and each chapter is extracted once: a fix that saves a
few cases isn't worth a rule that can go wrong elsewhere. A fix is kept only when, on the class 9 books
it never saw, it **makes no block newly wrong** and saves real work (dozens of readings or blocks, not a
handful); otherwise it is dropped, whatever it cost to build, and the case stays the agent's. Fixes 6 to
8 are the likeliest to go.

## Done when

Each fix: its unit tests; its numbers on the fourteen books (saved, changed and judged, the class 9
three apart); `pnpm check` exits 0; the page files that now repeat the tool are cleaned of it; the
agents' skill says what changed.
