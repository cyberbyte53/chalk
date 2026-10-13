# Class 9 Maths · Chapter 1: Number Systems

NCERT order (full pre-2022 edition; 1.4 was cut in 2022 and is kept as a short interactive). Lessons are JSON in `lessons/`, numbered so they list in order; `pnpm publish-lesson lessons/<file>` checks one, hands out permanent ids and keeps the last published copy in `published/`. `library/src/ch1.test.ts` plays every board as a student would.

| # | Lesson | NCERT | Props | Book items |
|---|---|---|---|---|
| 1 | Families of numbers | 1.1 | `numberSorter` | Example 1; Ex 1.1 Q1, Q4 |
| 2 | Always one more in between | 1.1 | `numberLine` (marks, split) | Example 2; Ex 1.1 Q2, Q3 |
| 3 | A length no fraction can name | 1.2 | `numberLine`, `rootBuilder`, `rootSpiral`, `numberSorter` | Examples 3–4, Fig 1.6–1.9; Ex 1.2 Q1–Q4 |
| 4 | Why fraction decimals repeat | 1.3 | `decimalExpansion` (long division, remainder clock, digit pad) | Example 5; Ex 1.3 Q1, Q2, Q5, Q6 |
| 5 | Repeating decimals are fractions | 1.3 | `decimalShift` | Examples 7–9; Ex 1.3 Q3, Q4 |
| 6 | Decimals that never stop or repeat | 1.3 | `numberLine`, `numberSorter` | Example 10; Ex 1.3 Q7–Q9 |
| 7 | A decimal is an address | 1.4 | `numberLine` (successive magnification) | Fig 1.11–1.14; Ex 1.4 |
| 8 | Adding and multiplying irrationals | 1.5 | `numberLine`, `numberSorter` | Examples 12–15; Ex 1.5 Q1 |
| 9 | The square root of any number | 1.5 | `rootSemicircle` | Fig 1.15–1.17; Ex 1.5 Q4 |
| 10 | Rationalising with tiles | 1.5 | `surdTiles` | Examples 16–20; Ex 1.5 Q2, Q5 |
| 11 | Exponents that are fractions | 1.6 | `exponentRoutes` | Example 21; Ex 1.6 |

Questions follow the teaching map's quiz items (Q1.1-a … Q1.6-c): every wrong option has the misconception it reveals and a nudge that asks, never tells. Concept ids: `number-families`, `rational-numbers`, `density-of-rationals`, `irrational-numbers`, `root-construction`, `decimal-expansions`, `remainder-argument`, `recurring-to-fraction`, `irrational-decimals`, `successive-magnification`, `irrational-operations`, `root-of-any-number`, `surd-identities`, `rationalising`, `exponent-laws`, `rational-exponents`.

The first Chapter 1 lessons (`does-it-end`, `numbers-between`, `where-is-root-2`) are now Jugnu test boards in `studio/evals/boards/`, since the Jugnu cases and simulated students are built on them.
