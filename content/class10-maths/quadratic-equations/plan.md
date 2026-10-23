---
status: built
source: content/sources/text/ma10-ch04-quadratic-equations.txt
approved: 2026-10-19
---

# Class 10 Maths, Ch4: Quadratic Equations (plan)

Source: NCERT jemh104 (2020-21, the full edition, including completing the square). Structure: theory-first, like Light L1. Every lesson runs Hook (story) → Learn (NCERT order, define before use, props) → See it in life (story, explained) → Practice (examples, your turn, mission log). Hindi with every string. Sentence first, then the maths on its own line.

## Mission: the school mela stall
Riya's class (10B) gets a stall at the school's annual mela, and Riya is put in charge of planning it. Kabir appoints himself "chief of rockets": he wants to launch a water-bottle rocket at the opening. Each decision turns into a quadratic equation:
- the stall's plot: 300 m², the length one metre more than twice the breadth (NCERT's prayer hall, Fig 4.1)
- pricing the toys: the cost per toy is 55 minus the number made, and the day's cost must be ₹750 (Example 1(ii))
- Grandpa's slate: he shows the old Indian way of solving any quadratic (Sridharacharya, completing the square)
- the trip to the wholesale market and back (motor boat / train problems: equations that turn into quadratics)
- Kabir's rocket: its height is h = 20t − 5t². When is it 15 m up? Can it ever reach 25 m? (the discriminant answers "is it possible?")
- Finale: mela day. The stall is the right size, the toys are priced right, and the rocket goes up and comes down when Riya predicted.

Roadmap stops: (1) writing the equation, (2) factorising, (3) completing the square, (4) the formula, (5) equations in disguise and word problems, (6) is it even possible?

## Lessons
1. **What is a quadratic equation?** (4.1–4.2)
   - Hook: the mela notice, and a plot of 300 m² with "length = twice the breadth + 1".
   - Learn:
     - recap a quadratic polynomial ax² + bx + c (Ch2);
     - setting it equal to 0 makes a quadratic equation; standard form; why a ≠ 0;
     - checking whether an equation is quadratic after simplifying (Example 2, including the traps: (ii) x² cancels; (iv) x³ cancels);
     - writing situations as equations (Example 1: marbles, toys).
   - See it in life: write the plot as 2x² + x − 300 = 0. Try breadths with the area builder: guessing is slow, so we need a method.
   - Practice: Exercise 4.1 Q1–2.
2. **Roots, and solving by factorising** (4.3)
   - Hook: Riya has the equation; now she needs x.
   - Learn:
     - a root (α satisfies aα² + bα + c = 0); check that 1 is a root of 2x² − 3x + 1 = 0;
     - roots of the equation = zeroes of the polynomial; at most two roots;
     - if a product is 0, a factor is 0;
     - splitting the middle term: two numbers that multiply to ac and add to b (Examples 3, 4);
     - a repeated root (Example 5, √ coefficients).
   - See it in life: Example 6 on the stall plot. 2x² + x − 300 = (x − 12)(2x + 25), so the breadth is 12 m (reject −12.5) and the length 25 m.
   - Practice: Exercise 4.2.
3. **Completing the square** (4.4, first part)
   - Hook: an equation that won't split. Grandpa: "In my school we were taught Sridharacharya's way."
   - Learn:
     - x² = 9 and (x + 2)² = 9: when x sits inside a square, take square roots (±);
     - the tiles of Fig 4.2: x² + 4x → split 4x into two strips of 2x, move one round, the missing 2 × 2 corner → (x + 2)² − 4;
     - x² + 4x − 5 = 0 → (x + 2)² − 9 = 0;
     - when a ≠ 1: multiply through to make a perfect square (3x² − 5x + 2 → 9x² − 15x + 6), or divide by a (Remark, Example 7);
     - Example 8 (an irrational root, 3 ± √19 over 5);
     - Example 9 (a square equal to a negative number: no real roots).
   - See it in life: Grandpa's slate, and a bit of history (Brahmagupta, Sridharacharya, Al-Khwarizmi).
   - Practice: Exercise 4.3 Q1.
4. **The quadratic formula** (4.4, general)
   - Hook: Riya wants one rule that always works.
   - Learn:
     - complete the square on ax² + bx + c = 0, one step per line;
     - the result, x = (−b ± √(b² − 4ac)) / 2a, when b² − 4ac ≥ 0;
     - what happens when b² − 4ac < 0;
     - Examples 10 (a plot of 528 m²), 11 (consecutive odd numbers) and 13 (three cases).
   - See it in life: pricing the toys, x² − 55x + 750 = 0, so 25 or 30 toys a day. Which makes sense for the stall?
   - Practice: Exercise 4.3 Q2.
5. **Equations in disguise, and word problems** (4.4, Examples 12, 14, 15)
   - Hook: the trip to the wholesale market.
   - Learn:
     - equations with x in a denominator: multiply through, and state x ≠ 0 (Example 14);
     - turning words into an equation: name the unknown, write each quantity, set up the equation, solve, then reject the answers that make no sense;
     - Example 12 (park), Example 15 (motor boat).
   - See it in life: Riya's cycle trip to the market, speed and time (the style of Exercise 4.3 Q8).
   - Practice: Exercise 4.3 Q3–11 (ages, marks, field, trains, taps, squares).
6. **Nature of roots: is it even possible?** (4.5)
   - Hook: Kabir's rocket, h = 20t − 5t². Can it reach 25 m?
   - Learn:
     - from the formula: b² − 4ac decides; the discriminant;
     - three cases (two different real roots / two equal real roots / no real roots), shown on the parabola meeting the x-axis twice, once or never;
     - Example 16;
     - Example 17 (the pole in the circular park: real roots mean "possible");
     - Example 18;
     - finding k so the roots are equal (Exercise 4.4 Q2).
   - See it in life:
     - 15 m: t² − 4t + 3 = 0 gives t = 1 s and 3 s, going up and coming down;
     - 25 m: D < 0, so never;
     - 20 m: D = 0, so it just touches, at t = 2 s (the top).
   - Practice: Exercise 4.4.
   - Finale: mela day, with all six stops recapped.

## Props (new package @chalk/prop-quadratics)
- **areaBuilder**: a rectangle with breadth x and length mx + n (m can be negative for a fixed perimeter). The learner nudges x; it reads out the area and the equation x(mx + n) = target, and marks when the area hits the target.
- **middleSplit**: splitting the middle term. It shows ax² + bx + c and the target "multiply to ac, add to b". The learner picks from the factor pairs of ac, and each pick is checked. A right pick shows the regrouping, the factors and the roots; it also says when no whole-number pair exists.
- **squareTiles**: completing the square, stepped:
  1. the x² square and a strip of b·x;
  2. the strip cut in half;
  3. the halves on two sides;
  4. the missing (b/2)² corner dashed in.
  With the equation's constant it carries on to (x + b/2)² = (b/2)² − c and says whether real roots exist. The learner can change b.
- **rootsGraph**: y = ax² + bx + c on a plane, with steppers for a, b and c (each can be locked). It reads out D = b² − 4ac with its sign and the nature of the roots, and marks the roots as exact values, e.g. (3 ± √19)/5. An optional horizontal line y = k shows where the curve reaches a height (for the rocket).
- **quadraticScene**: story pictures in the family's look:
  - MelaNotice
  - StallPlot (chalking out the plot)
  - ToyStall (the price tag)
  - GrandpaSlate (completing the square on a slate)
  - MarketRide (Riya cycling with boxes)
  - RocketLaunch (Kabir's water rocket with its arc)
  - MelaDay (the finale)
