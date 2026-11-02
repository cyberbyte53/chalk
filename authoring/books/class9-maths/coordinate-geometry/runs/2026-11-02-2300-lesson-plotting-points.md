# Lesson 4: plotting-points

## Pages
- **plot-a-point**: Riya walks P (3, 5) and Q (5, −4) from O; A, P, B and Q are marked as she reaches them. R (−4, 2) is then plotted by a tap on a plane of its own, and her walk checks it. The wrong-tap hint names x and y.
- **swap-the-numbers**: Example 3's eight points, each swapped pair plotted one after the other, then (3, 3). The ordered-pair statement follows.
- **plot-from-a-table**: Example 4's table, with (0, −3.5) between the marks. Then Ex 3.3 Q2's table, where the scale is chosen ("a mark every 2") so that (−2, 8) fits.
- **dice-game**: Activity 2. Red along, green up, first to (10, 10).
- **graphs-you-know**: Riya's walk timed, plotted on axes named t and d. The summary.

## Questions
- **plot-the-point**: 8 boards. The student drags a dot to the pair, halves included. Notes cover a swapped pair and x on the wrong side of the y-axis.

## Fixed after looking and playing
- `show` tapped planes below the fold off the screen. It now scrolls before aiming (`e770e09`).
- A tap on plot-a-point before R was asked for plotted R and ended the plotting. R now has its own plane, shown when it is asked for.
- Red dots stayed and the board passed anyway. Now a redo line is shown, and a board passes only when every dot is right.
- Choosing a scale did nothing. It now sets the plane's scale.
- Dot labels crowded at a small scale, and a label swallowed a tap. Labels are now placed measured, and dots let taps through (`966edbd`).
- The counters at (0, 0) covered the origin's O. The O now moves clear of them.
- Example 3 with swaps drawn showed each point twice. The example's own pairs are now plotted in turn.
- The question family coloured the dot before Check. It now uses a plain draggable dot.

Chapter check: 75 boards, 450 drawings, 0 problems. `pnpm check` passes.

## Left for the person
- **cmvzcv2bq3pa**: the plotting table should take the axes' names (t, d on graphs-you-know). Needs a prop change.
- **cmvzcuyktt3z**: a right-angle mark at A and B (flow.md asks for it). Either add one to the prop, or drop it from flow.md.
- A check's notes are shown, not spoken (a choice's are spoken). This applies to every check family in the chapter.

Self-review is not run yet: it waits on the two decisions above.
