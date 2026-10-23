# Making art

Every book, chapter and concept may have art: a small picture on its card in the app. Art is made by code, drawn with the same `@chalk/draw` pieces as the props, so it looks like the lessons and follows the theme. People or agents write it; you judge it by eye.

## Where it goes

An `art.tsx` next to the folder's `build.yaml`:

```text
content/class9-maths/art.tsx                                        the book
content/class9-maths/number-systems/art.tsx                         the chapter
content/class9-maths/number-systems/rational-numbers/art.tsx        a concept
```

It exports `art`, made with `defineArt`:

```tsx
import { ArtFrame, Axis, Dot, Stage, defineArt } from "@chalk/draw";
import { Color } from "@chalk/prop";

const ROUNDS = [[1 / 2], [1 / 4, 3 / 4], [1 / 8, 3 / 8, 5 / 8, 7 / 8]];

export const art = defineArt(ArtFrame.Card, ({ width, height }) => (
  <Stage label="Dots between 0 and 1, each round half the size of the last" x={[0, 1]}
    width={width} height={height} inset={{ left: 28, right: 28 }}>
    <Axis y={78} ticks={[{ value: 0, label: "0" }, { value: 1, label: "1" }]} />
    {ROUNDS.flatMap((round, i) => round.map((at) => (
      <Dot key={at} at={at} y={78} r={10 - i * 3} color={i === 0 ? Color.Secondary : Color.Primary} />
    )))}
  </Stage>
));
```

Frames: `ArtFrame.Card` (320 × 140, wide: books and concepts) and `ArtFrame.Tile` (160 × 160, square: chapters). Draw at the size you are given; the app scales it.

## Making it look right

- **One idea.** The concept's idea, not its topic: "there is always another number between" (dots filling a line), not "numbers" (a row of digits).
- **Draw with pieces** (`Axis`, `Line`, `Dot`, `Dots`, `Mark`, `Curve`, `Label`, `Range`; see [drawing.md](./drawing.md)). Plain SVG shapes are fine for what no piece covers (a lens, nested boxes), coloured with the look's variables (`var(--color-primary)`).
- **Calm.** Ink on the grey card, one accent (`Color.Primary`), at most a second (`Color.Secondary`) for the one thing to look at. No text beyond a glyph or two (`0`, `1`, `ℕ`). Leave space around it.
- **Exact.** Place things by their numbers (`at={1 / 4}`), never by eye: the picture should be true.
- **A label for screen readers** on the `Stage`, saying what the picture shows.

## Checking it

- `pnpm art` builds everything and writes `build/art.html`: every piece of art on its card, as the app shows it. Open it, look, fix, run again.
- The build refuses art that: has no `art` export or fails to draw; uses a raw colour (use a look role, or give the colour to a piece); has a script, a link, an event handler, or an element outside the allowed shapes; weighs more than 16 KB.
- Art in a crowd (`Dots` with more than 200) isn't drawn: the build has no screen to paint a crowd on. Keep art to a few things.
