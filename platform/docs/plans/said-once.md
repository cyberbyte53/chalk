# Each line written once; only the odd bit says how it's said

Status: plan, reviewed once (its changes folded in). Nothing built. Replaces item 1 of simpler-boards.md.

## The goal

A line is written once, in each language. Most of it is said exactly as written. Where a bit is
said differently from how it's shown (a point, a sign, a letter in Hindi, later a chemical formula),
that bit carries its spoken words, right where it is:

```text
Now plot [[R(−4, 2)|R, the point minus 4, 2]] yourself: drag the dot from O …
अब [[R(−4, 2)|R, बिंदु माइनस 4, 2]] खुद आलेखित करो …
पहले [[x|एक्स]], फिर [[y|वाई]]
```

On screen: "Now plot R(−4, 2) yourself …". Said: "Now plot R, the point minus 4, 2, yourself …".
The same idea as SSML's `<sub alias="…">` (voice assistants) and as speaking maths from its meaning
(MathML, ClearSpeak): mark the exception where it is, never guess from text, never keep a second copy.

Why: today a line said differently is written twice (`says`, `feedbackSays`): 85 + 21 lines, four
copies each with Hindi, which drift apart when one is edited (the person's "pepper" bug).

## Where we are

- **Rich text** (`platform/packages/player/src/rich-text.ts`, `parseRich`): `**bold**`, `*emphasis*`,
  `$maths$`, `$$display maths$$` (LaTeX, drawn by KaTeX with mhchem's `\ce{}`), `\$` a literal dollar.
  Drawn by `rich-text-view.tsx`; said by `rich-text-speech.ts` (`richSpeech`): words as written, maths
  never turned into words there.
- **What a line says** (`platform/studio/src/sound/voice/said.ts`, `said`): the lesson's `says` if it
  has one, else the piece's own text; "words a person wrote, never rewritten". Maths is refused
  (`needs: "it has maths"`, with a draft from `maths.ts`, the Speech Rule Engine, as a suggestion), and
  so is any character outside `SPEAKABLE` ("−", "′", "²"…): `needs: write it as maths, or write its words`.
- **Blanks** (`platform/packages/content/src/sound/spoken.ts`): `{x}` in a line's words is filled from
  the moment's values, each said by a sayer (`numberPieces`: −2 → "minus", "2"). Braces inside `$…$`
  are maths, never a blank.
- Not used anywhere in lesson text: `[[`.

## The design

### 1. The mark

`[[shown|said]]`.

- **Why this shape:** `{…}` is taken (blanks, and LaTeX inside maths), `$` is maths, `*` is bold;
  a markdown-style `[shown](said)` would catch half-open intervals like `[0, 1)`. Content today has
  no `[[`, no `]]` and no `|` in any lesson string.
- **`shown`** is rich text: words, `$maths$`, `**bold**`. `[[$\frac{1}{2}$|one half]]`.
- **`said`** is plain words, and may hold blanks (`{x}`, said by its sayer). Blanks only in `said`:
  a blank can never be drawn (scene.ts:371-375 refuses a piece's line with blanks).
- **Finding its ends:** the `]]` that closes it is found outside any `$…$` or `$$…$$` (so `$[A,[B,C]]$`
  can't close it); `said` is what follows the **last** `|` before it (`said` can't hold `|`: it isn't
  speakable), so `shown` may hold `|` freely (`$|x|$`).
- **Escape:** `\[[` is a literal `[[`, `\]]` a literal `]]` inside a mark's `shown`, as `\$` is a literal
  dollar. `|` and anything inside `$…$` never need one. **Not nested.**

### 2. Resolve first: one scanner, two plain strings

No new span kind (a nested span would break `glueTrailing`, rich-text.ts:106; `joinsNext`,
rich-text-view.tsx:83; and bold's re-parse, rich-text.ts:85). Instead one scanner gives two ordinary
rich strings, and everything downstream stays as it is:

- `shownOf(text)`: every mark replaced by its `shown`. The screen draws `parseRich(shownOf(t))`.
- `saidOf(text)`: every mark replaced by its `said`. Speech reads `richSpeech(saidOf(t))`.

**Every reader of raw lesson text goes through `shownOf`** (most read the raw string, not `parseRich`):
`shows(...)` tags in basics/views.tsx:32, 69, 82 (feeding `describeView`, the snapshot, `look`, Jugnu's
`seen`); the `summary` in basics/props.ts:49 (Jugnu's `lessonOf`, sees.ts:162); Jugnu's `checkFound`
(sees.ts:45) and `questionsSeen` (cases.ts:109); the answer-length check (build.ts:1066); the choice
pattern's duplicate-label check and option-order seed (questions.ts:97-104). And `blanksOf` runs on
`saidOf` (make.ts:112, spoken-line.ts:38). The build plan must decide whether to resolve at each reader
or once, at the one boundary where lesson text enters a board (so props never see a mark): the review
of the build plan picks.

### 3. What a line says

`said()` reads `saidOf(text)` and applies today's checks to it: a `$maths$` outside any mark is still
refused, and so is a character outside `SPEAKABLE`. Nothing is guessed.

- **The maths reader** (`sound/voice/maths.ts`, the Speech Rule Engine) stays the suggester: for an
  unmarked formula the build proposes the mark (`[[$-2$|minus 2]]`); a person or agent accepts or fixes
  it ("X dash", not the engine's "X prime"), and it is saved in the line. Words are always stored and
  seen; an engine update can't change what students hear.
- **Hindi lines:** a Latin letter outside maths and marks is refused (a missing `[[x|एक्स]]` passes
  silently today: Latin is speakable).
- `says` stays only for a line rephrased for the ear. A `says` equal to its line's `saidOf` is refused.
- `feedbackSays` goes: a choice's note is its own text with marks (`questions.ts:127`).

### 4. Marks are checked everywhere

A build check over every learner-facing string: no unclosed or nested mark, and every `said` speakable.
(Parse problems are reported nowhere today for text that is only shown: `richProblems` has no caller.)

### 5. Shortcuts, later

A helper may write a mark for a value used often: `point("R", -4, 2)` gives
`[[R(−4, 2)|R, the point minus 4, 2]]`. Only a shortcut; each subject's library brings its own
(chemistry's `formula("H2O")`).

## Steps

1. **The mark in the parser, the view and speech.** `rich-text.ts`, `rich-text-view.tsx`,
   `rich-text-speech.ts`, `said.ts`, the raw readers above, the build check (4); tests for: a plain mark,
   maths inside `shown` with `|` and `]]`, bold around and inside, blanks in `said`, an unclosed mark, a
   nested mark, the escape. No lesson changes. Proof: script.json and every board's drawing identical.
2. **Each lesson's lines, one lesson at a time** (plotting-points first: the most `says`). Each `says`
   becomes marks in the line's own text where the two differ only in bits; the rest stay `says`.
   Then families' helpers that rebuild spoken words (`read-a-point/family.ts:37`,
   `fig-3-14/family.ts:71`, the `x === "x" ? "एक्स" : x` in plotting-points) go.
3. **The build refuses a `says` equal to its line's `saidOf`**, and Latin letters in Hindi lines outside
   maths and marks. (Convert plotting-points' English `says`, equal to the shown text minus `**`, first.)

Note: a mark added to a choice's prompt changes its option-order seed (questions.ts:104) unless the
seed reads `shownOf(prompt)`.

## How we prove it

- **Speech:** each line's spoken words and phrases in the built `script.json` (voice/make.ts) before and
  after, word for word, and the set of clip words unchanged, so no clip is made again. (`sound.json` lists
  clips, not lines.) A line's `from` changes from written to screen: expected.
- **Screen:** the board snapshot (every board's witness and note checks, en and hi, every piece's
  drawn markup) identical: `shown` draws what the line drew before.
- `pnpm check`; the dev server starts and a converted board plays.

## Decided with the person

- An option's aria-label (the phone's own screen reader, basics/views.tsx:78) reads `saidOf`: not a
  focus now (we don't target accessibility yet), so the simplest consistent choice.
- The maths reader (Speech Rule Engine) is our build-time tool for drafting marks, nothing else.
