# Lesson: the-cartesian-plane

Built `content/class9-maths/coordinate-geometry/the-cartesian-plane/` from flow.md (approved 0998c84) and props.md (approved f4ed1ac).

## Pages (5)

- **number-line**: a number line −5 to 5 with 0 (not O: the letter is named a page on); the point at 2 is dragged to −3, which shows the rule "r on the positive side, −r on the negative".
- **town-grows**: lesson 1's town, grown 3 streets west and 3 houses south; the signed numbering stated; Riya walks to Aman's aunt's house at Street −2, House −3, then any house can be tapped for its address.
- **two-number-lines**: perpendicular lines can face any way, we take horizontal and vertical; X′X and Y′Y start with their zeroes apart and are brought together; the x-axis, y-axis and O are defined, then tied to the town (main road, Riya's street, her corner).
- **axes-and-directions**: OX, OY positive, OX′, OY′ negative; tap each half and O for its name.
- **quadrants**: a button numbers I to IV anticlockwise from OX; then the town's quadrants (Aman's house in I, his aunt's in III), the Cartesian plane defined, and the lesson's summary.

## Questions

- `name-the-lines` (3): Ex 3.2 Q1 in the book's words, its three parts as choices; each wrong option says what that name means.
- `tap-the-part` (5): tap OY′, OX′, quadrant II, quadrant IV, the origin; a note for the opposite half of an axis, and for the quadrant reached by counting clockwise.

## Props

- `coordinatePlane` gains `plane.canNumberQuadrants` (default off): the "Name the quadrants" button showed on every plane with X/X′/Y/Y′ shown, including two boards before quadrants are taught. Only the quadrants board turns it on. Needs the person's approval (thread on the prop).
- While the lines are apart, a number of the vertical line that falls on the horizontal line's row isn't written (its mark stays): before, its −2 sat on the x-axis and its −3 on the x-axis's 3.
- The walker in a town says her place in street words, with true minus signs ("Street number −2, House number −1"), not "(−2, −1)", and addresses use true minus signs.
- `plane.isNamed` added to the patterns, for checking a tapped part.

## Fixed after looking

- The moving line's numbers overlapping the x-axis's (above). The text claimed Y′Y runs −4 to 4 while apart; it shows a shifted range, so the claim went.
- Houses stood on Riya's own street, over the house numbers: that street is now clear.
- The Hindi voice said "r" as the letter's English name in a Hindi sentence: now "आर".
- A build test pinned the chapter to one lesson: it now asks only that it has lessons.

## Left for the person

- **two-number-lines** — the flow asks for "tilted perpendicular pairs" and "the town map fading in behind and out again". No prop does either, so the board says it in words. A picture (art) or a plane field would be a props.md change.
- **quadrants** — the flow asks for "the town's four parts shaded to match". It's said in words; tapping a quadrant shades it.
- **The −1 labels next to O** — hidden where a unit is too short for both (decided in e387228).
- **A pool page showed the wrong board** — while the prop was rebuilding, `show` timed out with lesson 2's text on a lesson 1 address. Seen once; a retry drew correctly.
