# Lesson 1: two-numbers-for-a-place

The chapter's first lesson, built alone for review. `content/class9-maths/coordinate-geometry/` is new (its `build.yaml`, `concepts.gen.ts`), listed in class9-maths' `chapters`. `@chalk/prop-coordinates` added to the root package.json so content can import it.

## Pages (flow order, discover → state)

1. **street-and-house** (coordinatePlane: the town of Fig. 3.1, streets 1–8, houses 1–5, Aman's house at Street 4, House 5): the student sets → and ↑ and walks Riya there; on arrival, "two numbers, in order" and a question on the swapped walk (Street 5, House 4); then any house can be made Aman's, and tapping Street 4's number lights its five houses.
2. **dot-on-paper** (coordinatePlane: a sheet, the dot hidden at 5 cm from the left edge, 9 cm above the bottom): four clues narrow it to a region, a line, a point; then a question on Riya's stall message (two distances from two fences); then the student hides a dot of their own.
3. **seating-plan** (coordinatePlane: 10 columns × 7 rows of desks, Sonia's at (4, 1) labelled): tap (5, 3) and (3, 5); a question: are they the same desk?
4. **cross-streets** (coordinatePlane: Ex 3.1 Q2's city): Riya walks to (2, 5), (4, 3), (3, 4), each crossing marked as she arrives; a question after (4, 3) and after (3, 4).
5. **two-lines**: the three places, each found with two perpendicular lines; summary point 1; Descartes. Words only for now (thread cmvt767mgcu9).

## Question bank (questions/, all testing TwoNumbersForAPlace)

- `two-steps` (5): which walk reaches Street s, House h (swapped and added sums as the wrong options).
- `desk-pair` (4): Activity 1, (column, row) with the row said first.
- `cross-street-count` (4): Ex 3.1 Q2 (i) and (ii), then other crossings.
- `table-lamp` (1): Ex 3.1 Q1.
14 questions. Ex 3.1 Q1 and Q2 and Activity 1 are covered.

## Looked at and played

- `look` at the lesson: 5 boards, no problems. Each board played as a student (right and wrong answers, every prop used); all pass. street-and-house checked in Hindi.
- Fixed after looking: the town showed a Street 9 and a House 6, and the classroom a column 11 and a row 8 (windows now end half a unit past the last street, house, column and row). The prop's view now draws a place's label (Sonia's desk).
- `pnpm build-content` and `pnpm check` pass (catalogue regenerated: coordinatePlane is used in this chapter).

## Left for the person

- Thread cmvt761awv96 (on the prop): the plane offers a Next point button whenever a figure has hidden points, so on cross-streets a student can reveal the crossings before walking. Recommended: a `canShowPoints` field, off by default. It would also let the seating plan keep (5, 3) and (3, 5) marked together, as the flow asks (today only one desk is marked at a time).
- Thread cmvt767mgcu9 (on props.md): there is no picture piece, so two-lines is words only. Recommended: three small coordinatePlanes side by side (town, sheet, classroom), Descartes' portrait left as words.
- self-review hasn't run yet.
