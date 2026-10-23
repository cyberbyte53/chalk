---
status: built
source: content/sources/text/ma10-ch03-linear-equations.txt
approved: 2026-10-19
---

# Class 10 Maths, Ch3: Pair of Linear Equations in Two Variables (plan)

Source: NCERT jemh103 (2020-21, the full edition). Keep everything, including cross-multiplication, equations reducible to linear, and Exercise 3.7 as extra practice. Structure: theory-first, like Light L1. Each lesson is Hook (story) → Learn (NCERT order, define before use, props) → See it in life (story, explained) → Practice (worked examples, NCERT exercises, your turn, mission log). Hindi with every string.

## Mission: the mela cash box
Riya and Kabir run their class's stall at the school mela: lemonade and samosas. At closing time the cash box holds a total and they know how many items they sold, but Kabir has lost the tally sheet. How many of each did they sell? Two unknowns, two clues. Every errand of the day is another pair of clues, and each lesson gives them one more way to crack such pairs. The finale: they close the accounts.
- **NCERT's examples become the day's events:**
  - Kabir's giant-wheel rides and hoopla games (Akhila, Ex 1)
  - two stationery bills that say the same thing (Ex 2)
  - the railway lines beside the mela ground (Ex 3)
  - Grandpa's age riddle (Aftab, Ex 8)
  - the cash box's two-digit lock code (Ex 13: 42 or 24)
  - the bus fares home (Ex 14)
  - the boat ride on the river (Ex 19)

## Lessons
1. **pair-of-equations: Two unknowns, two clues.**
   - Linear equation in two variables (ax + by + c = 0, a and b not both 0).
   - A solution is a pair (x, y); check by substituting (2x + 3y = 5 with (1,1) and (1,7)).
   - Every solution is a point on the line, and vice versa.
   - A pair of linear equations; the general form a₁x + b₁y + c₁ = 0, a₂x + b₂y + c₂ = 0.
   - Represent Akhila algebraically and graphically: a table of two solutions, plot, draw.
2. **three-kinds-of-pairs: Meet, never meet, or the same line.**
   - Two lines in a plane intersect, are parallel or coincide (Fig 3.1).
   - Ex 2 (pencils: coincident), Ex 3 (rails: parallel).
   - Ex 3.1.
3. **graphical-method: Solving by drawing.**
   - The meeting point is the solution (Akhila: 4 rides, 2 hoopla), and we verify it.
   - Every point is a solution (pencils). No solution (rails).
   - Consistent, inconsistent and dependent defined.
   - The ratio test: compare a₁/a₂, b₁/b₂, c₁/c₂ (Table 3.4).
   - Ex 4–6 (Champa).
   - Ex 3.2, including the triangle with the x-axis.
4. **substitution-method.** Why algebra (graphs fail at (−1.75, 3.3)).
   - Steps 1–3.
   - Ex 7 (49/29, 19/29), Ex 8 (Grandpa's ages), Ex 9 (18 = 18 is true: infinitely many), Ex 10 (−4 = 0 is false: no solution).
   - Ex 3.3, including taxi charges.
5. **elimination-method.**
   - Multiply so one variable's coefficients match, then add or subtract.
   - Ex 11 (incomes 9:7, savings), Ex 12 (0 = 9: none), Ex 13 (lock code: two numbers).
   - Ex 3.4.
6. **cross-multiplication.**
   - Derived from elimination with the oranges and apples; the general formula x/(b₁c₂ − b₂c₁) = y/(c₁a₂ − c₂a₁) = 1/(a₁b₂ − a₂b₁); the arrow diagram.
   - The cases a₁b₂ − a₂b₁ ≠ 0 or = 0 (link back to the ratio test).
   - Ex 14 (bus fares), Ex 15 (p ≠ 4), Ex 16 (k = 6).
   - Ex 3.5.
7. **reducible-to-linear.**
   - Substitute 1/x = p, 1/y = q.
   - Ex 17, Ex 18 (1/(x − 1)), Ex 19 (the boat: upstream x − y, downstream x + y).
   - Ex 3.6, and Ex 3.7 as challenge practice.
   - The finale: the cash box solved, mission complete.

## Props (new package @chalk/prop-linear-equations)
- **linePair**: a coordinate plane (Mafs) with one or two lines given by a, b, c.
  - Lines can be dragged by two lattice handles each.
  - Coefficient steppers for one line.
  - A probe point that checks whether it satisfies each equation.
  - Tables of two solutions.
  - The meeting point marked.
  - The ratio panel: a₁/a₂, b₁/b₂, c₁/c₂ with =/≠, giving intersecting/parallel/coincident, unique/none/infinitely many, consistent/inconsistent/dependent.
  - The triangle with an axis shaded.
- **solveSteps**: a worked solution of a pair, revealed step by step, by substitution, elimination or cross-multiplication. Exact fractions throughout.
  - The learner chooses which variable to isolate or eliminate.
  - True/false statements show infinitely many/no solution.
  - Cross-multiplication shows the b₁ c₁ a₁ b₁ arrow diagram.
- **linearScene**: story pictures (MelaStall, GiantWheel, TwoBills, RailTracks, CashBoxLock, BusTickets, BoatRiver, MelaNight) in the family's shared look.
