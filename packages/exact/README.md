# @chalk/exact

Exact numbers for content: a decimal stays `"7.384"` (never `7.383999…`), keeps its written places (`"2.50"` stays 2 places), and does digit work (`round`, `swapLastTwo`, `digits`) without floats. Used when content is built; props on the phone still draw with ordinary numbers.

- `dec.ts`: `Dec`, `dec("7.384")`.

May import: nothing.
