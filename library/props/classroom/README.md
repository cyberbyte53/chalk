# @chalk/prop-classroom

A classroom, drawn in chalk: a teacher at the blackboard and the children he teaches. Imports `@chalk/prop`, `@chalk/player`, `@chalk/draw`, `@chalk/content`, `@chalk/sounds`. Exports `classroomProp` (and `classroomProps`); `./defs` the definitions and sounds alone.

## `classroom`: a class, seen from the back

**World.** A classroom seen from the back: a blackboard at the front with the teacher (a young man) beside it, and rows of children at benches (four to a row, two to a bench), each a little different (the seed draws them). Each child is **following** (head up), **lost** (head dropped, some with a "?"), or **asking** (a hand up, waiting). The teacher chalks lines on the board one at a time, his back to the class while he writes. The after: every child **lit up**, head up over a glowing slate of their own. There the teacher can see where each child **stands** (needs help, on track, curious, in the lesson's words): one who needs help sits **stuck**, head down over their slate, until he walks down and crouches beside them; the **curious** spark, head up and a hand up with a "!" (not the opening's "?").

**Variables**

| | | start |
|---|---|---|
| `count` | how many children (1–12, rows of four) | 12 |
| `seed` | draws the children's looks and the order things happen to them | 3 |
| `lines` | the lines on the board (`{ en, hi }`, at most 4), the last perhaps still being written | [] |
| `writing` | 0 to 1, how far the last line is written (moving: the teacher walks up, writes left to right, steps back) | 1 |
| `wiping` | 0 to 1, how far the duster has gone (moving) | 0 |
| `lost` | how many have lost the thread, in the seed's order (moving: a fraction is a head dropping) | 0 |
| `asking` | who has a hand up | [] |
| `rising`, `raised` | whose hands are going up now, and how far (moving) | [], 0 |
| `helped` | who has been turned to: they look up, a hand up is answered | [] |
| `lifting`, `lift` | the one being helped now, and how far they have looked up (moving) | null, 0 |
| `lit` | how many have lit up, in the seed's order (moving) | 0 |
| `standing` | where each child stands (by child): `{ kind: needsHelp \| onTrack \| curious, words: { en, hi } \| null }`, or null | [] |
| `revealed` | how many standings show: the on-track, then the curious, then who needs help, each in the seed's order (moving) | 0 |
| `visiting`, `visit` | the child the teacher is walking to, and how far (moving: walks to 72%, crouches, the child looks up from 80%) | null, 0 |
| `visited` | the child he is crouched beside, or null (he is by the board; `write` brings him back) | null |
| `sparked` | how many of the curious have sparked, in the seed's order (moving) | 0 |

**Facts**: `children` (each child now: `attention` (following, lost, asking, litUp, stuck, curious), and how far `drop`, `hand`, `glow`, `tag`, `spark` have gone, `hasQuestion`), `isWriting`. A raised hand lifts the head (asking is not lost); being helped or lit up overrides both; lit, a child who needs help is stuck until helped or visited; sparked overrides all.

**Actions**

| action | from | does | refuses |
|---|---|---|---|
| `loseThem { seconds, howMany? }` | board | heads drop one after another in the seed's order, over `seconds` (all, or `howMany`); `lost` at the end | if that many are lost already |
| `raiseHands { who? }` | board | these children (else two the seed picks, from the back rows first) raise a hand over 0.8 s and keep it up; `raised` | while hands are going up; if no one is free to |
| `write { line, seconds }` | board | the teacher chalks `line` as the next line, over `seconds`; `written { line }` (its index) | while a line is being written or wiped; a full board |
| `wipe {}` | board | the duster clears the board (1.2 s); `wiped` | a clean board; while writing |
| `lightUp { seconds }` | board | the after: one by one over `seconds`, each head comes up over a slate that glows; `lit` | if all are lit |
| `revealStanding { seconds }` | board | the standings show one after another over `seconds`: words over who needs help and the curious, a tick over the on-track; `revealed` | no standings; all showing |
| `visit { child, seconds }` | board | the teacher walks from where he is, along the front and down the aisle (or the wall), and crouches beside the child; they look up as he arrives; `visited { child }` | while he is on his way; the child he is beside; while writing |
| `spark { seconds }` | board | the curious spark one after another: head up, hand up with a "!", slate aglow; `sparked { count }` | no curious children; all sparked |
| `settle {}` | board | everyone following again: no one lost, no hands, no slates (the board's lines stay) | |
| `help { child }` | screen | the student turns to one child: a lost child looks up, a raised hand is answered and comes down (0.7 s); `helped { child, wasAsking }` | a child who is following, lit or curious (a stuck one can be helped); while helping another |

**Signals**: `lost { count }`, `raised { who }`, `written { line }`, `wiped {}`, `lit { count }`, `helped { child, wasAsking }`, `revealed { count }`, `visited { child }`, `sparked { count }`.

**What the student sees**: each child (`child:0`…`child:11`, front row first, left to right): their attention (`"following"`, `"lost"`, `"asking"`, `"litUp"`, `"stuck"`, `"curious"`), and a tap that does `help` while they are lost, asking or stuck; each standing shown (`standing:<i>`: its kind, its words); the board (`board`: its lines, in the locale); the teacher (`teacher`: `"writing"`, `"facing the class"`, `"walking to a child"`, `"beside a child"`). `seed` is off screen.
