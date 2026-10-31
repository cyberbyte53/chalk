# @chalk/studio

Chalk Studio, for now as code: the content build and its checks, the tools agents look at boards with, and Jugnu's evals.

- `pnpm build-content` / `pnpm preview` / `pnpm publish-content`: build the content tree into `build/` (see [docs/writing-content.md](../docs/writing-content.md)). `src/content/build.ts` checks and builds every level; `concepts.ts` writes each chapter's `concepts.gen.ts`; `witness.ts` plays witnesses and note checks on the real runtime; `cli.ts` runs the three commands.
- `src/file-names.test.ts`: no two files in a folder differ only in case or code extension.
- `src/pronunciations.ts`: loads `authoring/pronunciations.json` (how screen text is said aloud).
- `src/sound/`: the build's side of sound (platform/docs/sound.md): `voice/` voices each chapter's clips as content is built (providers: Piper, a test tone; a new one, self-hosted or cloud, is one file plus one line in `voice/index.ts`); `cli.ts` is `pnpm sound`, the sound library.
- `src/validate.ts`: checks a board against the content formats, each prop's contract (starting state, actions, arguments, signals) and the wiring (IS inputs, one writer, no loops; WHEN signals and conditions; no answer-revealing actions on a board with a question; something calls `board.pass`; lines that are said read cleanly).

May import: `@chalk/author`, `@chalk/content`, `@chalk/jugnu`, `@chalk/library`, `@chalk/player` (`richProblems`), `@chalk/prop`, `yaml`, `zod`, Node built-ins.
