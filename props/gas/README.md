# @chalk/prop-gas

**An experiment**: how far the board model goes with many moving things. An ideal gas in a box: up to 5,000 particles bounce off the walls, faster when it is hotter. Keep it out of lessons until we decide.

- State: `count`, `temperature`, `travel` (how far the gas has moved), `isRunning`, `seed`. Where each particle is follows from `travel` and the seed (`positions`), so only `travel` changes as it runs: one call through the one door per frame.
- Actions: `start` (a task that advances `travel` every 1/60 s on the board's clock), `stop`, `heat`, `cool`, `setCount`.
- Drawn with `@chalk/draw`: the particles are one `Dots`, which stays SVG up to 200 and paints a WebGL crowd above that; the one to follow is its own `Dot`. The view shows frames per second, to check on a real phone.
- Styles live in `src/styles.css`, drawn with the look's tokens.
