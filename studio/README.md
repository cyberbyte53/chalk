# @chalk/studio

Chalk Studio, for now as code: the validator that every lesson must pass before it can be published.
A GUI comes later; any AI coding assistant can author against [docs/board-model.md](../docs/board-model.md) plus this validator.

- `pnpm validate` (from the repo root) checks every `content/**/lessons/*.json`.
- `pnpm publish-lesson <file>`: checks the lesson, hands out permanent ids to new boards and pieces, retires ids of deleted ones (compared with `published/<file>`), bumps the version if anything changed, and writes both files, plus a copy of each version in `published/versions/<lesson>/<version>.json` that is never overwritten. Add `--voice macos` (or `tone` for a test stand-in) to speak every line a script tells a prop to `say` into `published/audio/`; voices per speaker and language come from `content/voices.json` (a `default` entry speaks for anyone without their own). Providers are plug and play: `macos` (built-in voices), `parler` (self-hosted Indic Parler-TTS, see `voice-parler/README.md`), `tone` (test stand-in). Swapping one changes nothing in lessons.
- `pnpm build-content` / `pnpm preview` / `pnpm publish-content`: build the content tree into `build/` (see [docs/writing-content.md](../docs/writing-content.md)). `src/content/build.ts` checks and builds every level; `concepts.ts` writes each chapter's `concepts.gen.ts`; `witness.ts` plays witnesses and note checks on the real runtime; `cli.ts` runs the three commands.
- `src/file-names.test.ts`: no two files in a folder differ only in case or code extension.
- `src/pronunciations.ts`: loads `content/pronunciations.json` (how screen text is said aloud).
- `src/voice/`: voice providers (`macos.ts`, `tone.ts`); a new provider (self-hosted model, cloud) is one file plus one line in `src/voice/index.ts`.
- `src/validate.ts`: checks a lesson against the content formats, each prop's contract (starting state, actions, arguments, signals) and the wiring (IS inputs, one writer, no loops; WHEN signals and conditions; no answer-revealing actions on a board with a question; something calls `board.pass`; lines that are said read cleanly).

May import: `@chalk/author`, `@chalk/content`, `@chalk/jugnu`, `@chalk/library`, `@chalk/player` (`richProblems`), `@chalk/prop`, `yaml`, `zod`, Node built-ins.
