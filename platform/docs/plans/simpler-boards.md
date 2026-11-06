# Simpler boards and props

Status: plan, reviewed once (the review's changes folded in). Nothing built. For discussion item by item.

## The goal

Writing a board or a prop should ask for each fact once, in one place, and a mistake should be
caught before a student meets it. A survey found places where it asks for more. Each is below: the
problem, a simpler shape, the cost, the risks, and how we prove students see and hear the same
thing afterwards (or exactly what changes, on purpose).

Rules that hold for every item:

- **No migrations, no back-compat.** No real learners yet: change the shape, rewrite every board, wipe and re-seed.
- **Closed sets are const-object enums** (the `LabelSize` pattern), never string unions.
- **Plan, then an independent review, then build.** Each item gets its own short plan, reviewed, before code.
- **One item at a time**, each its own commit, each proved on its own.

## How we prove nothing changed (every item)

1. `pnpm build-content`, then play every board's witness and note checks, in English and Hindi, and
   record what every piece draws at every step (`platform/studio/src/tmp-snapshot.ts`, uncommitted today).
2. Make the change. `pnpm build-content` again, then play again and compare. Any difference is either
   listed in the item as intended, or a bug.
3. `pnpm check` passes and the dev server starts.

Two limits:

- The snapshot only sees states the witness and note checks reach. A board state no step reaches is not proved.
- It records what is **drawn**, not what is **said**. For speech, compare
  `content/<book>/<chapter>/sound/sound.json` before and after (its lines and their words). No new tool.

---

## Item 4. Show and hide by plain strings

**Problem.** `t.self.show({ name: "found" })` takes any string (`platform/packages/author/src/scene.ts:168-169`, `427`).
A typo shows nothing and nothing complains. `me.hidden.includes("atThree")`
(`two-numbers-for-a-place/overview.ts:129`) is the same.

**Simpler shape.** The type can't do it everywhere: `plotting-points/overview.ts:83-100` builds names
while the board runs (`` `${hint}Swap` ``), so its hand-written `Hints` type stays. Instead the scene
checks names when it is built: `show` and `hide` accept only the board's piece names (a `z.enum` of
them), so a wrong name throws during the witness run.

```ts
t.self.show({ name: "fuond" })   // before: runs, shows nothing
t.self.show({ name: "fuond" })   // after: the witness run fails: "fuond" is not a piece of this board
```

**Cost.** Small. `scene.ts` only. Boards change only where a typo is found.

**Risks.** A name used only on a path no witness or note check takes is still unchecked.

**Proof.** Snapshot identical; `pnpm check`.

## Item 6. Unused shapes and words with two meanings

**Problem.**
- `platform/packages/content/src/piece.ts:7-21`: Row, Overlay and Pin are never written by any board (only
  drawn by `player/src/layout.tsx`). Space is used: `scene.ts:676` puts one at the foot of every board. It stays.
- `platform/packages/prop/src/layout.ts:25`: a prop's `column` and `row` layouts: no prop uses them (only
  `frame`, in `coordinate-plane.ts`). It is also a string union, against the enums rule.
- `platform/docs/glossary.md`: **Piece** means a layout node (line 10) and a drawing part (67), and the
  in-progress work adds a third (a piece on the plane). **Part** means a view's named thing (22) and a held
  prop (27). **Question** means a prop (32) and a built board (58). **Role** is written twice, the same (24, 88).

**Simpler shape.** Delete Row, Overlay, Pin and the unused prop layouts. Give each glossary word one
meaning; rename the losers (e.g. "Shape" for `@chalk/draw` pieces); drop the second Role.

**Cost.** Small for deletions. Renames are medium (code names follow the glossary).

**Risks.** None for students. Renames clash with the in-progress pieces change: rename after it lands.

**Proof.** `pnpm check`; snapshot identical.

## Items 2 and 5. A question written once on a board

**Problem.** Three places for one question. `two-numbers-for-a-place/overview.ts`: `choice({ name: "side", … })`
(line 18), then `side: hidden(side.piece)` (115), then `uses: [side.use]` (133). Forget the third and the
board loses its witness and notes, silently.

Boards also retype a question's answer taps in their witness. On 4 of 5 boards this is redundant: the scene
already adds a question's steps (`scene.ts:681-688`) and drops them again when the board took them all
(`isSameStep`, line 693). The redundant ones: `coordinates-of-a-point/overview.ts:508, 777, 946, 1249`. Only
`the-cartesian-plane/overview.ts:297` needs them, because the question must be answered before Riya walks.

**Simpler shape.** The question goes into `pieces` once; the scene finds its rules, witness and notes there.
Its name is its key.

```ts
// before
const side = choice({ name: "side", prompt, options, answer: "left" });
scene({ pieces: { side: hidden(side.piece) }, uses: [side.use] })
// after
scene({ pieces: { side: hidden(choice({ prompt, options, answer: "left" })) } })
```

Witness: keep adding a question's steps automatically. Delete the redundant retyping. A board places a
question's steps itself only when they must come out of order (`...side.answer` in its witness), and then
the scene doesn't add them again. Typed tap paths (`tap("sheet.reading", …)` is unchecked, against
`making-a-prop.md:76`) come later, after the pieces change settles the plane's names.

**Three things to solve in the build plan.**
- The option shuffle is seeded with the name (`library/patterns/questions.ts:105`). With no name until the
  scene sees the key, the shuffle moves into the scene's build. Keep key = today's name so order stays.
- `check()` names its prop as a string (`about: "room"`, `tap-the-desk/family.ts:20`). The scene must find
  which key holds the placed prop and fill it in.
- Readers like `isChosen("room", …)` (`library/patterns/plane.ts:110`) still take a string. Leave them for now.

**Cost.** Medium. `questions.ts`, `scene.ts` (`uses` goes: only `questions.ts` makes one), every board with
a question (all lessons, all 12 families).

**Risks.** Option order changing (above). A witness that loses an ordering step.

**Proof.** Witness steps of every board listed before and after: same steps, same order. Snapshot
identical, option order included.

## Item 3. Two ways to give a wrong-answer note

**Problem.** A choice's note is spoken through a board cue made for it (`questions.ts:124-131`). A check's
note goes through a `hear` rule calling `giveFeedback` (`questions.ts:63-71`), which only sets a variable
(`library/props/basics/src/props.ts:101`): **it is shown but never spoken**. Tap-the-desk's note is not in
`sound.json`. The cue machinery in `scene.ts:310-360` exists for this; no lesson writes a cue directly.

**Simpler shape.** A question holds its own notes, both kinds the same way: the prop shows and says the
note when it is checked wrong. Board cues are then only sounds, or go.

**What students will notice (intended).** Check notes become spoken. That needs new voice clips in English
and Hindi, and their words need checking: "cm" in a note would be read as "cm".

**Cost.** Medium. The `choice` and `goal` props (`library/props/basics`), `questions.ts`, `scene.ts`; new clips.

**Risks.** The spoken note must still come after the wrong-answer sound (`basics/src/sound.ts:15`).

**Proof.** Snapshot identical (drawn). `sound.json`: choice notes unchanged; the new check-note lines are
the only additions, listed and listened to. Do after items 2 and 5.

## Item 1. Spoken words written twice — last, in steps

**Problem.** 85 `says: t(…)` and 21 `feedbackSays`. Most repeat the shown words with symbols spelled out:
"−2" → "minus 2" (`two-numbers-for-a-place/overview.ts:21`), "X′" → "X dash"
(`the-cartesian-plane/overview.ts:324`). Families build helpers: `read-a-point/family.ts:37`
(`said(n, "minus")`), `fig-3-14/family.ts:71` (`.replace("y-अक्ष", "वाई-अक्ष")`).

This is a rule, not an oversight: `platform/studio/src/sound/voice/said.ts:4`, "words a person wrote,
never rewritten". A line with "−" or "′" is refused until a person writes its words. A maths reader exists
(`sound/voice/maths.ts`) but only suggests words.

**Step 1: no rule change.**
- Let `says` give only the language that differs. `plotting-points/overview.ts:41-48`: the English `says` is
  the shown text, word for word; only Hindi differs.
- Delete `says` that differ from the shown text only by `**` bold: the speech reader already reads bold as
  its words (`player/src/rich-text-speech.ts`).

```ts
// before
says: t("Not there. x first: …", "वहाँ नहीं। पहले एक्स: …")
// after
says: { hi: "वहाँ नहीं। पहले एक्स: …" }
```

**Step 2: a short Hindi word list.** A lone x or y in a Hindi line is said "एक्स", "वाई". That removes the
rebuilt lines (`x === "x" ? "एक्स" : x`, the `.replace` in fig-3-14). Small, fixed, readable.

**Step 3: a full reader, only with the person's yes.** Our own list for the classroom's way ("X dash", not
the engine's "X prime"; "minus 2"), so `says` stays only for real rewording (the NCERT exercise,
`cross-street-count/family.ts:18`).

**Cost.** Step 1 small (content plus one type). Step 2 small. Step 3 large.

**Risks.** Steps 2 and 3 put words in students' ears that nobody wrote out. The list handles only its own
entries; anything else is still refused, as today.

**Proof.** `sound.json` before and after: every line's spoken words identical (same words = same clip).
Any line that differs is kept as written or goes to the person.

---

## Dropped

- **New prop package touches ~8 places** (registry `index.ts`, `modules.ts`, `styles.css`, `package.json`).
  Rare, and it would save about four lines. Dropped. Kept as its own small task: the READMEs copy the
  definition table by hand (`library/props/coordinates/README.md`, "Its parts") while `library/catalogue.md`
  is generated from the code. Trim the tables to prose plus a pointer to the catalogue.
- **The plane forwards eleven fields as facts** (`coordinate-plane.ts:76-89`): the pieces change keeps this on purpose. Look again after it lands.

## Order

| # | Item | Value | Cost | Waits for |
|---|---|---|---|---|
| 1 | 4. Show/hide names checked | Typos caught | Small | nothing |
| 2 | 6. Delete unused shapes, one meaning per word | Less to read | Small | renames: pieces change |
| 3 | 2+5. Question written once | Every board shorter | Medium | nothing |
| 4 | 3. One way for notes | Cue machinery shrinks; check notes spoken | Medium | 2+5; the person's answer below |
| 5 | 1. Spoken words | ~100 lines gone | Small → large, in steps | step 3: the person's yes |

## How they depend on each other

- 2+5 before 3: notes live in the question, so the question must live in the board's pieces first.
- 3 before 1: `feedbackSays` changes shape with 3, so 1 has less to touch after it.
- Glossary renames (6) and typed tap paths (5, later) wait for `adding-pieces.md` to land.

## Questions for the person

1. Should check notes be spoken? (They aren't today; choice notes are.)
2. Item 1, step 3: are you happy for a reader to speak lines nobody wrote out, if it only handles a fixed list?
3. Item 6: which meaning keeps the word "piece"?
4. Start with item 4?
