# The voice

Every line a board shows is also said aloud. This module makes the clips; the player plays them.

## Two halves, one contract

- **Making** (here, when content is built, on a laptop): a chapter's lines become clips.
- **Playing** (`@chalk/player`, on the phone): a line is said as phrases (its words, and each value's pieces), from the first source that can: its clips glued, a live voice (not yet), the phone's own voice (platform/docs/sound.md).
- **The contract** (`@chalk/content`, `src/sound/`): a clip's key (the voice and the words: `clipKey`), how a line becomes phrases (`spoken.ts`; split in one place for both halves, `sound/spoken-line.ts` in the player), and the chapter's list `sound.json` (each clip: its file, voice, language, words, length).

## Making, in four steps

| Step | File | What it does | Swap it by |
|---|---|---|---|
| Collect | the content build (`content/build.ts`) | every board of the chapter, as built, read for its script (`scriptOf` in `@chalk/player`): each line, its piece, its speaker | — |
| Cast | `cast.ts` | who says it → which voice: `authoring/voices.json`, per character and language, `provider:voice` | editing the cast |
| Speak | `providers/` | words + voice → a clip file. Piper (on this machine), a test tone | adding a file here and a line in `index.ts` |
| Keep | `clips.ts` | each clip named by its words and voice, so it is made once; its length measured | — |

`make.ts` voices a chapter: every fixed line's words, each template's own words, and each voice's number pieces (no clip per value). The content build runs it for each chapter it builds (`pnpm build-content`, and `pnpm check`), into the chapter's own `content/<book>/<chapter>/sound/`, with its list `sound.json`: committed, and shipped with the chapter.

## What is said

Exactly words a person wrote, never rewritten (`said.ts`): a line's spoken words (`speak`), written with it when the lesson is written (guides/pages.md); else its screen words when they are words already, formatting left out by the rich-text parser (structure, not patterns on the words). Nothing turns maths or a sign into words: such a line stops here, every one listed at once, until it has its spoken words.
