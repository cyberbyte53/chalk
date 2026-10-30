# The voice

Every line a board shows is also said aloud. This module makes the clips; the player plays them.

## Two halves, one contract

- **Making** (here, when content is built, on a laptop): a chapter's lines become clips.
- **Playing** (`@chalk/player`, on the phone): a board says a line by playing its clip, and waits as long as the clip plays (a "later" on the board's clock). Muted, or with no clip, it still waits that long (from the clip's length, or the words).
- **The contract** (`@chalk/content`): a line's key (`<board id>.<piece>.<language>`, `audioKey`) and the chapter's `manifest.json` (key → clip, and its length in seconds).

## Making, in four steps

| Step | File | What it does | Swap it by |
|---|---|---|---|
| Collect | `lines.ts` | every board of the chapter, made from build/ as the app makes it, read for its script (`scriptOf` in `@chalk/player`): each line, its piece, its speaker | — |
| Cast | `cast.ts` | who says it → which voice: `authoring/voices.json`, per character and language, `provider:voice` | editing the cast |
| Speak | `providers/` | words + voice → a clip file. Piper (on this machine), the Mac's voices, Indic Parler, a test tone | adding a file here and a line in `index.ts` |
| Keep | `clips.ts` | each clip named by its words and voice, so it is made once; its length measured | — |

`make.ts` runs them for a chapter; `pnpm voice <book>/<chapter>` (`../voice-cli.ts`) writes the clips, one folder per lesson, into the learner app's `public/voice/<book>/<chapter>/` (made from the content: not kept in git).

## What is said

A line's spoken words (`speak`), written with it when the lesson is written; else its screen words, bold marks dropped. A voice gets only words (`unspeakable` refuses anything else), so a line with a symbol and no spoken words stops here, naming the line.
