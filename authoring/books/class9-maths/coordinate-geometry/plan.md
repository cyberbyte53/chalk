# Coordinate Geometry (class 9 maths, chapter 3)

For class 9, NCERT Mathematics, Chapter 3 (2020-21); English and Hindi, every string. Each board's
detail is in `boards.md`.

## Goal

A student can say where any point in a plane is with two numbers in an agreed order, read a point's
signed coordinates off the axes in any quadrant or on an axis, and plot a point from its coordinates.

## Objectives

- **o1** Explain why one number fixes a point on a line but not in a plane, and give a position in a plane with two independent pieces of information (street and house, distances from two edges). (s3.1, s3.1-number-line, s3.1-I, fig3.1, s3.1-II, fig3.2, ex3.1, ex3.1-q1)
- **o2** Write a position as a pair in an agreed order (column first, then row) and tell (5, 3) from (3, 5). (activity1, fig3.3, ex3.1-q2)
- **o3** Say that two perpendicular lines can locate any point in a plane, and that this idea, Descartes', is coordinate geometry and the Cartesian system. (s3.1-idea, box-descartes, fig3.4)
- **o4** Build the coordinate axes from two number lines crossing at their zeroes, and name the x-axis, the y-axis, the origin O and the positive and negative directions of each axis. (s3.2, s3.2-number-line, fig3.5, s3.2-perpendicular, fig3.6, fig3.7, def-axes, def-origin, def-directions, fig3.8, ex3.2, ex3.2-q1)
- **o5** Name the four quadrants, numbered I to IV anticlockwise from OX, and the Cartesian (coordinate, xy-) plane and its coordinate axes. (def-quadrants, def-cartesian-plane, fig3.9, ex3.2-q1)
- **o6** Find a point's abscissa and ordinate as its perpendicular distances from the y-axis and the x-axis, with a sign from the direction they are measured in. (s3.2-distances, fig3.10, def-abscissa, def-ordinate)
- **o7** Read the coordinates (x, y) of a marked point, x first, and name the marked point that has given coordinates. (def-coordinates, note-unique, example1, fig3.11, ex3.2-q2, fig3.14)
- **o8** Give the coordinates of points on the axes, (x, 0) and (0, y), and of the origin, (0, 0), and say why. (example2, fig3.12, rule-on-axes, rule-origin)
- **o9** Tell from the signs of its coordinates which quadrant a point is in, or which axis it is on, and say why. (rule-signs, fig3.13, ex3.3, ex3.3-q1)
- **o10** Explain that x first is a convention the whole world agrees on, not a fact, and why one agreed order avoids confusion. (remark-convention, epigraph)
- **o11** Plot a point from its coordinates, including fractions and decimals, by counting along the x-axis and then parallel to the y-axis, on a scale they choose. (s3.3, def-plotting, s3.3-method, fig3.15, example4, fig3.17, ex3.3-q2)
- **o12** Show that (x, y) and (y, x) are different points when x ≠ y and the same point when x = y, and so call (x, y) an ordered pair. (example3, fig3.16, note-ordered-pair)
- **o13** Follow a trail of addresses across all four quadrants, walking to each point from the last, and tell a wrong stop from its address. (s3.3-method, example3)
- **o14** Recognise a time-distance or side-perimeter graph as points plotted on axes with other names. (remark-graphs)

## Skipped

- **activity2** The dice game for two: the treasure trail (o13) takes its place, a game every student finishes, with nothing left to luck.
- **s3.4** The summary's heading: its points are the objectives above.
- **summary** It restates the objectives; each lesson ends with its share of it instead.

## Story

Riya and Aman (the friends of class 10 Real Numbers, a year earlier) are in class 9, and their class
runs a stall fair on the school ground. Their mission: a plan of the fair ground, so that a message
like "the snacks stall goes at (3, 2)" puts every stall in exactly the right spot. Each lesson is a
stop on it: Riya walks to Aman's house by his address, two numbers (1); the town grows past the corner
she started from, and the two roads she walked become the axes (2); they write down where every stall
stands (3); volunteers set the stalls up from the numbers alone, and Aman's swapped pair puts the
snacks in the wrong place (4). One walk carries the chapter: along the first road, then along the
second, on roads only. Where a board departs from the source's figure, it says so.

## Lessons

### two-numbers-for-a-place  (o1, o2, o3)
Goal: one number fixes a place on a line; a plane needs two, in an agreed order. Discover → state.
Does: moves a bus stop by stop; walks Riya along the main road, then up a street, to Aman's house;
narrows where a dot on a page can be, clue by clue, then drags it; taps desks by (column, row).
Card: a road numbered 1 to 6, and a walk along to 4, then up to the third house.

### the-cartesian-plane  (o4, o5)
Goal: two number lines crossing at their zeroes are the axes; their names, directions and quadrants.
Does: numbers the houses of the grown town west and south with signs; brings two number lines
together at O; taps each half of each axis, and each quadrant.
Card: the x- and y-axes crossing at O, with the four quadrants.

### coordinates-of-a-point  (o6, o7, o8, o9, o10)
Goal: a point's coordinates are its signed distances from the axes, x first.
Does: drags a point and watches its distances and their signs; reads and names points of the book's
figures; drags a point onto an axis and through the quadrants; moves and turns the axes under a point
that stays.
Card: a point 5 across and 3 up, its distances to the two axes dashed.

### plotting-points  (o9, o11, o12, o13, o14)
Goal: plot a point from its coordinates; (x, y) is an ordered pair.
Does: walks Riya from O along, then up or down, then places a point and watches her walk to it;
plots a pair and its swap; plots from a table on a scale they choose; follows a treasure trail across the four
quadrants; plots a timed walk on axes named t and d.
Card: five dots plotted on the plane from their pairs.

## Chapter art

The tile: a 6 × 6 grid, a walk 4 along and 5 up, meeting at one dot.

## Props

- **new** `coordinatePlane` (`library/props/coordinates`), a host: two perpendicular lines showing only the marks defined so far (named roads numbered from 1 in lesson 1; then 0 and the negatives, O, x and y, the quadrants), and named points; layers a board turns on: places (houses, desks, stalls), the walker (Riya, along then up, on the lines only), clues (where a dot can still be), reading a point (perpendiculars, signed coordinates) and plotting (a drag from O, from a pair or a table, on a scale). Why: the library had nothing for a plane, and one drawing from the town map to the fair ground makes the town walked in lesson 1 the plane plotted on in lesson 4.
- **extend** `coordinatePlane`: `shift` and `turn`, the axes moved and turned by a learner drag, a fixed point read through them. Why: any-axes shows the point stays and only its numbers depend on the axes.
- **extend** `coordinatePlane`: `backdrop` (the town fading in behind the axes) and `tintsQuadrants`. Why: the axes are the town the student walked, the same picture rather than a sentence about it.

Descartes' story and each lesson's share of the summary are words, with no prop.

## Question families

- **bus-to-stop** take the bus to a numbered stop, either side of the stand: one number on a line. (o1)
- **walk-to-address** walk Riya to a street and house, along then up; the swapped pair has its note. (o1, o2)
- **place-the-dot** put a dot on a notebook page at two distances, from the left edge and the bottom. (o1)
- **table-lamp** Ex 3.1 Q1, in the book's words: a lamp's place takes two distances from two edges. (o1)
- **tap-the-desk** tap a desk by its (column, row), column first. (o2)
- **cross-street-count** Ex 3.1 Q2, in the book's words: (4, 3) and (3, 4) are one crossing each, and different. (o2)
- **name-the-lines** Ex 3.2 Q1: the names of the axes, the quadrants and the origin. (o4, o5)
- **tap-the-part** each half of each axis and each quadrant, found on the plane by its name. (o4, o5)
- **read-a-point** read a marked point's coordinates; the slips: y first, a sign the wrong way. (o6, o7)
- **fig-3-14** Ex 3.2 Q2: Fig. 3.14 read both ways, a point's coordinates and the point at a pair. (o7, o8)
- **quadrant-or-axis** Ex 3.3 Q1: the quadrant, or the axis, from a point's signs. (o8, o9)
- **plot-the-point** drag a dot to a pair, halves between the marks included; the slips: swapped, x's sign. (o11, o12)
