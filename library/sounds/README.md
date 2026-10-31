# Sounds

Short recordings any prop or lesson uses: a prop's sound view (`import { step } from "@chalk/sounds"`), or a lesson replacing one (`effects: { "line.walker.stepped": tap }`). One sound serves every place that needs it.

- **Each sound** is a file in `sounds/`, a line in `sounds.json` (what it is for, where it came from, its author and licence) and an export in `index.ts`. A library test keeps the three in step and every licence CC0.
- **Adding one:** `pnpm sound add <name> freesound:<id>` fetches it, brings it to the same loudness as the rest and trims its shrill top, and writes all three. Candidates are offered to the person as options to choose from, by ear; their votes are kept in `authoring/sounds/votes.json`.
- **Shipping:** a recording is fetched only when something that uses it plays it, then kept.
