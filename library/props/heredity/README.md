# @chalk/prop-heredity

Inheritance: Mendel's crosses, each plant carrying two copies of a gene. Imports `@chalk/prop`, `@chalk/player`, `@chalk/draw`, `@chalk/content`, `@chalk/sounds`. Exports `peaCrossProp` (and `heredityProps`); `./defs` the definitions and sounds alone.

## `peaCross`: Mendel's monohybrid cross

**World.** Pea plants, each carrying two copies of the gene for height: `T` (tall, dominant) or `t` (short, recessive). A plant is tall if it has any `T`, short only when both are `t`. Two parents are crossed: each gives one of its two copies to each child, so the children are the four boxes of a Punnett square (the first parent's copies down the side, the second's along the top). Two of the children can become the parents of the next generation.

**Variables**

| | | start |
|---|---|---|
| `parents` | the two parents' genes, each a pair (`["T","T"]`, `["t","t"]`) | TT × tt |
| `generation` | which generation the parents are: 0 is P, 1 is F1, … | 0 |
| `grown` | how many of the four children have grown, 0 to 4 (moving: a fraction is one growing) | 0 |
| `chosen` | the children picked to be the next parents (0 to 2, by box 0–3) | [] |
| `rising` | 0 to 1: how far the two chosen have risen to the parents' row (moving) | 0 |
| `isGenesShown` | whether each plant's two copies are drawn as beads at its base | true |

**Facts**: `children` (the four boxes' genes, in order: first parent's first copy with the second's first, first with second, second with first, second with second), `isCrossed` (all four grown), `tall` and `short` (how many of the four are tall and short), `parentLooks`.

**Actions**

| action | from | does | refuses |
|---|---|---|---|
| `cross { seconds }` | board | the four children grow up from the soil, one after another, over `seconds`; `sprouted` as each is grown, `crossed` at the end | if any child has grown already |
| `nextGeneration { seconds, children? }` | board | two children (these, else the two chosen, else the first two) rise to be the parents (1.2 s, `risen`), the rest go, and their four children grow over `seconds` (`crossed`) | before the children have grown; while rising |
| `showGenes { isShown }` | board | draws or hides the beads | |
| `crossParents {}` | screen | the student's Cross: as `cross`, in 3 s | as `cross` |
| `choose { child }` | screen | picks a grown child as a next parent, or unpicks it; a third pick replaces the older one | before they have grown; while rising |
| `crossChosen {}` | screen | the two picked become the parents and are crossed (as `nextGeneration`, 3 s) | unless two are picked |
| `startAgain {}` | screen | back to Mendel's start: a pure tall (TT) and a pure short (tt), nothing grown | |

**Signals**: `sprouted { child, isTall }`, `crossed { tall, short, generation }` (the children's generation), `risen { generation }` (the new parents').

**What the student sees**: each parent (`parent1`, `parent2`: its genes `"Tt"`, words "tall Tt"), the copies each parent gives (`gives1`, `gives2`), each grown child as a box to tap (`choose:0`…`choose:3`, its genes and look), the count (`ratio`: `{ tall, short }`, words "3 tall : 1 short" or "all tall"), and the buttons Cross, Cross these two, Start again.
