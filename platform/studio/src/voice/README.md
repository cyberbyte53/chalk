# The voice

Every line a board shows is also said aloud. This module makes the clips; the player plays them.

## Two halves, one contract

- **Making** (here, when content is built, on a laptop): a chapter's lines become clips.
- **Playing** (`@chalk/player`, on the phone): a line is said as phrases (its words, and each value's pieces), from the first source that can: its clips glued, a live voice (not yet), the phone's own voice (platform/docs/sound.md).
- **The contract** (`@chalk/content`): a phrase's key (who says it, the language, the words: `phraseKey`), how a line becomes phrases (`spoken.ts`; split in one place for both halves, `spoken-line.ts` in the player), and the chapter's `manifest.json` (phrase → clip, and its length in seconds).

## Making, in four steps

| Step | File | What it does | Swap it by |
|---|---|---|---|
| Collect | `lines.ts` | every board of the chapter, made from build/ as the app makes it, read for its script (`scriptOf` in `@chalk/player`): each line, its piece, its speaker | — |
| Cast | `cast.ts` | who says it → which voice: `authoring/voices.json`, per character and language, `provider:voice` | editing the cast |
| Speak | `providers/` | words + voice → a clip file. Piper (on this machine), the Mac's voices, Indic Parler, a test tone | adding a file here and a line in `index.ts` |
| Keep | `clips.ts` | each clip named by its words and voice, so it is made once; its length measured | — |

`make.ts` runs them for a chapter: every fixed line's words, each template's own words, and each voice's number pieces (no clip per value). `pnpm voice <book>/<chapter>` (`../voice-cli.ts`) writes the clips, in one folder, into the learner app's `public/voice/<book>/<chapter>/` (made from the content: not kept in git).

## What is said

Exactly words a person wrote, never rewritten (`said.ts`): a line's spoken words (`speak`), written with it when the lesson is written (guides/pages.md); else its screen words when they are words already, formatting left out by the rich-text parser (structure, not patterns on the words). Nothing turns maths or a sign into words: such a line stops here, every one listed at once, until it has its spoken words.
