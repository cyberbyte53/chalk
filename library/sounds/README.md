# Sounds

Short recordings any prop or lesson uses: a prop's sound view (`import { step } from "@chalk/sounds"`), or a lesson's cue replacing one (`cues: { tap: cue(tap, { when: "line.walker.stepped" }) }`). One sound serves every place that needs it.

- **Each sound is a role** (right, wrong, step, blocked, appear, win, tap), named for what it means, not for the recording: props and lessons use the role, so changing the recording behind one changes it everywhere, and nothing else changes.
- **Defined in one place,** `sounds.json`: what it is for, where its recording came from, its author and licence (CC0 only). `index.ts` is written from it, and a test keeps the two and the files in step.
- **Changing or adding one:** `pnpm sound add <name> freesound:<id>` (with `--for "…"` for a new one) fetches it, makes it mono and as loud as the rest with its shrill top trimmed, and writes the file, the list and the index. `pnpm sound remove <name>` takes one out. Recordings are chosen by ear from options; votes are kept in `authoring/sounds/votes.json`.
- **Where each plays by default** is the props' sound views (a question: right and wrong; the coordinate plane: step, blocked, appear, win). A lesson's cue replaces or silences any of them on its board. `tap` is in the library but plays nowhere by default.
- **Shipping:** a recording is fetched only when something that uses it plays it, then kept.
