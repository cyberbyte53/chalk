# Languages: English is written, every other language is a reviewed file

Status: plan, reviewed once (its changes folded in). Nothing built. Comes after `said-once.md` and the
question-written-once item of `simpler-boards.md` (both change how text is written), before the next
chapter. Grounding a language in its own NCERT book (its term list) is content creation, made when a
chapter is planned: this plan only takes the term list.

## Why

Today every text holds every language where it is written: `t("Find Aman's house", "अमन का घर ढूँढो")`
(`platform/packages/author/src/text.ts:4`): 427 `t()` calls in the one chapter, 9 slip tables written as
`{ en, hi, enSays, hiSays }`, word fragments (`lr = ["left", "बाईं"]`), props' words (`words.ts`), the
player's (`player/src/ui-text.ts`, 47) and the app's (`app-text.ts`, 117). A third language means editing
all of them, and every edit after that in three places.

## What is particular to us

1. The translator is an agent with the whole lesson in view, not a person shown one sentence.
2. Quality is teaching: a student meets her own NCERT book's words.
3. Content changes daily: "what changed in English, so what must change in Bangla" must be exact and cheap.
4. Each language has its own reviewer, who sees only what changed.
5. Speech is the same lines (`said-once.md`), clips per language.

## The design

### 1. Lessons are written in English; each language is a table per lesson file

- A lesson is written with English only: `t("Find Aman's house")`.
- Beside each lesson file, one table per language: `overview.hi.yaml` (and `family.hi.yaml`), **keyed by the
  English text itself**, scoped to that file:

  ```yaml
  "Find Aman's house": "अमन का घर ढूँढो"
  "Not there. x first: along the x-axis; then y …": "वहाँ नहीं। पहले [[x|एक्स]]: …"
  ```

- **Why the English is the key** (not a place, not an id): it changes exactly when a re-translation is
  needed, so a missing line and a stale line are the same thing (no fingerprints to keep); git shows before
  | after; nobody invents or maintains ids. Scoped to one lesson file, the same English translating the
  same is what we want; the rare clash takes a context: `t("left", { context: "side" })`. (A place key
  doesn't work: a board record holds ~430 texts as 2,223 copies, options sit by index after the shuffle,
  and fragments like `lr` have no place.)
- **Texts built from values stay as they are.** `` t(`… ${x} …`) `` expands, as the lesson is built, to one
  English string per value, each its own row (~150-250 rows in chapter 1's families): an agent translates
  each with the right grammar (बाईं ओर, जूस का), which blanks with word forms couldn't. No template rules for
  lessons.
- **Same in every language:** a text that is only numbers or maths (`t(right, right)`, a pair's label)
  says so and needs no row.

### 2. The join is inside `t()`

While the build imports a lesson (`platform/studio/src/content/build.ts:501`; a family per row, 702), `t(en)`
looks its translation up in the file's tables and returns a full `Localized`. Everything downstream (board
records, the player, voice, `show`, Jugnu, checks) is unchanged. The tables are added to the chapter's
cache key (it records only imports today: `build.ts:1144-1160`).

What reads text before that must read English only:
- the option-order seed hashes every language (`library/patterns/choice-question.ts:20`, used at
  `questions.ts:112`): it reads English, which reshuffles every question's options **once**, accepted;
- the duplicate-label check (`questions.ts:104`) and `isTemplate` (`author/src/scene.ts:399`) go per
  `LOCALES`, not en and hi by name.

### 3. Shared texts: a table each

Patterns (`library/patterns/plane.ts:52-82`, shared axis names), each prop package, the player and the
app each keep English in code and a table per language beside it, read the same way.

**Texts a prop makes while it runs** (the walker's sentences with Hindi word order, `walker-view.tsx:29,56`;
the dice's "की बारी", `dice-view.tsx:58`; `partWords`, `plane-view.tsx:55`; clues, `clues-view.tsx:17`;
`practice-screens.tsx:22`) are in the app bundle, not in records. They become **templates in the prop's
`words.ts`, with word forms** (`"{name} reached {place}"`, per language, the verb's gender a form), and the
language tables are generated into a words module the bundle imports. Only here do templates exist.

### 4. A language is one data file

`platform/packages/content/src/languages/<code>.ts`: its code, name, script (for `SPEAKABLE`,
`said.ts:52`), number words (`spoken.ts:40`'s `NUMBER_WORDS`), digit style. Voices stay where they are,
in `authoring/taste/voices.json` (each speaker's voice per language, read by `cast.ts`); a language adds its column
there. `LOCALES` is the list of these; `localizedSchema` (`localized.ts:14`), the MCP's language
lists (`tools.ts:815`, `look.ts:38,96,551`, `stress.ts:163`, `app-driver.ts:526`) and every per-language
check derive from it. Adding a language: this file, its tables, a reviewer.

**Decided per language in that file:** digits (Hindi uses 0-9 today; Bangla may want ০-৯ in text, ticks,
dice and speech). **Fonts:** the app relies on the phone's (no `@font-face`); a new script is checked on
phones before it's offered.

### 5. Offered per lesson; missing shows English in dev

A lesson is offered in a language when every line it uses has a row there. In dev a missing line shows
the English, marked, so work isn't blocked. Speech marks (`said-once.md`) are each language's own; its
"no Latin letters in a Hindi line" becomes "nothing outside the language's script, maths and marks".

### 5b. A language is attached, grounded in its own book

A language's book and its terms are facts, kept with the chapter's source:
`authoring/books/<book>/<chapter>/source/<language>/` holds `book.pdf`, its `outline.yaml` (made by the
same extraction as English, with the same ids: each item as that book writes it) and `terms.yaml`: every
key term as that book writes it, with its page (abscissa → भुज, p. 54), and how its letters and notation
are read aloud. Extracted once, from the book, never from memory. The translator gets, for each line, the
passages of that book its board cites (by outline id), so definitions, examples and exercises keep the
book's own words. Machine checks: a mapped term in a line has its mapped term in the translation; a line
quoting the book matches the book's wording; every English item has its aligned item, or a reason.

### 6. Translating: one lesson at a time, by an agent

`pnpm translate <lesson> <language>`: every missing row of the lesson's tables, translated with the
lesson's boards in view, following the chapter's `source/<language>/terms.yaml` and writing its speech marks. It never touches English.

### 7. Reviewing per language (medium)

`reviewed.yaml` keeps one record, one code digest and one `by` per board today (`reviewed.ts:28,
224-255`). It becomes a pass per board and language, over the record cut down to that language's text;
`changesBetween` works unchanged, and "its Hindi too" (`reviewed.ts:299`) goes. To decide: an English
edit or a code change reopens every language (lesson lines are nodes in the code graph); who reviews a
code change in a language whose words didn't change.

## Steps

1. **The mechanism, Hindi moved out.** `t(en)` with tables; every `t(en, hi)`, slip table and fragment
   becomes English plus rows in `hi.yaml` (generated from today's text, so every row is today's Hindi). The
   seed reads English: one reshuffle of options, listed. Proof: every board record identical except option
   order; the board snapshot and voice script identical apart from that.
2. **Shared tables:** patterns, props, player, app.
3. **Props' runtime text as templates with word forms**, generated words module. Proof: snapshot identical.
4. **A language as a data file;** every hard-coded en/hi list derives from `LOCALES`.
5. **Per-language review.**
6. **The translate agent,** with a term list.
7. **A third language when one is wanted:** its data file, `pnpm translate`, a reviewer.
