# An approval follows what the student gets

Status: build plan, reviewed once (its changes folded in). Deferred in `authoring.md` (after, when needed); replaces `adding-pieces.md` steps 6-7.

## Today

A board passed by a reviewer is kept in `authoring/books/<book>/<chapter>/reviewed.yaml` with its
content (its built record) and one fingerprint of all the code it runs (`platform/studio/src/reviewed.ts`
`Passed`, `changesUnder`). It stays passed only while both are the same. So any change to its content
or code, even one the student can't tell from before (today's: a question written once, speech marks,
the plane's parts), sends it back to review. Chapter 1's boards are all "changed" now, though they draw
and say the same.

## The shape

What a student gets from a board is now measured exactly, deterministically, in every language:

- **what is drawn and its state** at every step of its witness and note checks: `pnpm snapshot`'s record
  (`platform/studio/src/snapshot-cli.ts`, each piece's markup and state, text as shown);
- **what is said**: each of its lines, shown and said, and its phrases (the chapter's `script.json`, as
  `pnpm said-compare` reads it);
- **how it is styled**: the stylesheets it is drawn with (the same markup can look different).

One more fingerprint is kept with each approval: **`gets`**, a hash of those three for that board. A board
whose content or code changed stays passed when its `gets` is the same as at its pass; `changes` says so
("plays, draws and says the same") and lists what changed underneath, for anyone curious. Only a board
whose `gets` differs goes back to review, with what differs.

- Built where the snapshot is: the content build plays every board anyway (witness, note checks);
  `gets` is written into each board's built record (`build/…`), so `changes` reads it without playing.
- Sound before precise: an approval without `gets` (older) counts as changed, as today.
- What it can't see, said where it's shown: states no witness or note check reaches; motion between
  steps (the clock jumps); pixels the CSS and markup don't decide (fonts, the phone).

## Folded in from the review

What a student gets also includes, so `gets` hashes them too:

- **the whole board drawn**, not each piece alone: the layout and the player around the pieces
  (Continue, the board's own view), at each step;
- **every script line whole**: when it's said and by whom (`moment`, `cue`, `speaker`), not only its
  words; and what is heard at each step (`runtime.heard()`);
- **the voice**: each speaker's merged voice (the guides' `voices` setting) and the clip of each line
  (`sound.json`), so a new voice or provider is a change;
- **sounds**: what each step plays (heard), so a prop's sound cues are in it;
- **`wait` steps** are played as the build plays them.

Where: inside the build's own play (`content/witness.ts`, which already plays every witness and note
check in every language), not the snapshot tool. Stylesheets are hashed when `changes` runs (the
chapter cache doesn't see app or player CSS), so `gets` = hash(the build's play hash, the CSS now).

A kept approval moves forward (its `gets` and code fingerprint updated, as a pass would), recorded as kept,
so the list of what changed underneath doesn't grow. `.chalk-seen/` stays: it is still the before |
after for a board whose `gets` differs. The self-review skill's "drawn the same, pass it" step goes:
the build decides that now. The reviewer's own extra plays (wrong paths, acting during a line) are
replayed too, where kept: a board stays passed only if they answer the same.

## Then

Chapter 1's approvals predate `gets`, so every board comes back to review once (backfilling by
building each old pass's commit isn't worth it). From then on, only boards that really change for
students do.

## Proof

- A board passed, then a code change that leaves it the same: still passed. Changed, each: a word, a
  line's moment, a voice, a stylesheet it uses (app CSS behind a cached chapter), a `wait` step.
  Tests in `reviewed.test.ts`.
- `pnpm check`.
