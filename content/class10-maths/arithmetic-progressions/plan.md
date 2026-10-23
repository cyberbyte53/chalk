---
status: built
source: content/sources/text/ma10-ch05-arithmetic-progressions.txt
approved: 2026-10-20
---

# Class 10 Maths, Ch5: Arithmetic Progressions (plan)

Source: NCERT jemh105 (2020-21, the full edition, including Exercise 5.4 (optional) and the note on the arithmetic mean).

Structure: theory-first, like Light L1 and Maths Ch3–4. Every lesson runs:
1. Hook (story)
2. Learn (NCERT order, define before use, props)
3. See it in life (story, explained)
4. Practice (examples, your turn, mission log)

Hindi with every string. Sentence first, then the maths on its own line.

## Mission: Kabir's cycle fund
After the mela (Ch3–4), 10B's stall made a profit and each helper gets a share. Kabir puts his ₹100 into an old tin money box and announces he will buy his own cycle, a ₹4,000 one he saw at the shop, by his next birthday. His plan is to put in a little more every week than the week before: ₹100 the first week, ₹105 the second, ₹110 the third, and so on, ₹5 more each time. NCERT's own money box is Shakila's, rising by ₹50 a birthday.

Riya, the planner, asks the questions the chapter answers:
- Is that pattern even a "progression"? Which of the family's other patterns are?
- How much will he put in during week 20? In which week does a single week's saving reach ₹200?
- How much is in the box after n weeks? When does it reach ₹4,000?

The family's world supplies NCERT's other examples:
- Grandpa's ladder: its rungs shrink by 2 cm (Fig 5.1).
- Mom's flower bed: 23 roses in the first row, 21 in the next (Example 10).
- The school tree-planting drive (Ex 5.3 Q17).
- The potato race on Sports Day (Ex 5.3 Q20).
- Grandpa's village log stack (Ex 5.3 Q19).
- Gauss's sum, on Grandpa's slate.

The roadmap has four stops:
1. Spot the pattern.
2. Any term, instantly.
3. Using the nth term.
4. The total.

A challenge stop and the finale end the chapter: Kabir rides the cycle home on his birthday.

The sum lesson closes back on Ch4: "When does the box reach ₹4,000?" gives a quadratic in n (as Example 13 does).

Checked numbers:
- a₂₀ = 195;
- the first week with ₹200 is week 21;
- ₹333 is never a week's saving (n = 47.6);
- S₂₀ = 2,950;
- Sₙ = 4,000 gives n² + 39n − 1600 = 0, so n = 25 or −64. The box holds exactly ₹4,000 after week 25.

## Lessons
1. **Patterns and arithmetic progressions** (5.1–5.2)
   - Hook: Kabir's money box and the weekly plan; the mela profit in a tin. Riya: "Your savings make a list of numbers with a pattern. Let's see what kind."
   - Learn:
     - a list of numbers; each number is a **term**;
     - patterns in daily life (5.1: salary, ladder rungs, the money box, savings ×5/4, squares, the rabbits), some adding a fixed number, some not;
     - **arithmetic progression** (AP): each term after the first is got by adding a fixed number; the **common difference** d (positive, negative or zero);
     - a₁, a₂, …, aₙ and a₂ − a₁ = a₃ − a₂ = … = d;
     - the general form a, a + d, a + 2d, …;
     - **finite** and **infinite** APs; the last term;
     - to know an AP you need both a and d;
     - testing a list: subtract each term from the next (the next minus this one, even when the next is smaller); one unequal difference means it's not an AP (Examples 1, 2; the rabbits 1, 1, 2, 3, 5).
   - See it in life: which of the family's patterns are APs? Kabir's savings (yes, d = 5), Grandpa's ladder (yes, d = −2), the ×5/4 savings scheme (no), and the rabbit pairs (no).
   - Practice: Exercise 5.1.
2. **The nth term** (5.3, first part)
   - Hook: "How much will I put in in week 20?" Kabir starts adding 5 twenty times. Riya: "There's a shortcut."
   - Learn:
     - Reena's salary year by year (8000, 8000 + 500, 8000 + 2 × 500, …): the number of 500s is one less than the year;
     - aₙ = a + (n − 1)d, the **nth term** or general term; l for the last term;
     - Example 3 (the 10th term of 2, 7, 12, …);
     - working backwards to find n: Example 4 (which term of 21, 18, 15, … is −81? is any term 0?);
     - Example 6 (is 301 a term? n must be a positive whole number);
     - two terms fix the AP: Example 5 (a pair of linear equations, Ch3).
   - See it in life: week 20, a₂₀ = 100 + 19 × 5 = ₹195. Which week first reaches ₹200? n = 21. Does any week put in exactly ₹333? No: n would not be whole.
   - Practice: Exercise 5.2 Q1–6, Q9–10.
3. **Using the nth term** (5.3, second part)
   - Hook: Mom's flower bed (23, 21, 19, …, 5 roses). How many rows?
   - Learn:
     - counting with the nth term: Example 7 (two-digit numbers divisible by 3);
     - from the end: Example 8 (the 11th term from the last; reverse the AP: a = l, d → −d);
     - money: Example 9 (simple interest grows in an AP);
     - Example 10 (the flower bed).
   - See it in life: the flower bed has 10 rows. Grandpa's ladder: the bottom rung is 45 cm, the rungs shrink by 2 cm, and there are 8 rungs, so the top rung is 31 cm.
   - Practice: Exercise 5.2 Q7–8, Q11–20 (Subba Rao, Ramkali, and two APs with equal nth terms).
4. **The sum of the first n terms** (5.4, first part)
   - Hook: "How much will be in the box after 20 weeks?" Writing out 20 numbers and adding them is slow.
   - Learn:
     - Gauss at 10: 1 + 2 + … + 100, written forwards and backwards; each pair makes 101; 100 pairs; halve: 5050;
     - the same trick on a, a + d, …: 2S = n[2a + (n − 1)d], so
       Sₙ = n/2 [2a + (n − 1)d];
     - the other form, S = n/2 (a + l), for when the last term is known;
     - Shakila's money box (21 birthdays, ₹12,600);
     - Example 11 (a sum can be negative);
     - Example 14 (1 + 2 + … + n = n(n + 1)/2).
   - See it in life: Kabir's box after 20 weeks, S₂₀ = 10[200 + 19 × 5] = ₹2,950. Not yet ₹4,000.
   - Practice: Exercise 5.3 Q1–3.
5. **Using the sum** (5.4, second part)
   - Hook: "So which week does the box reach ₹4,000?"
   - Learn:
     - four quantities S, a, d, n: know three, find the fourth (Example 12);
     - finding n gives a quadratic: Example 13 (two answers, 4 or 13, because later terms are negative and cancel);
     - a list given by its nth term: Example 15;
     - aₙ = Sₙ − Sₙ₋₁ (Remark; Ex 5.3 Q11);
     - Example 16 (TV production: two terms, then a term, then a sum).
   - See it in life: n/2 [200 + (n − 1)5] = 4000 gives n² + 39n − 1600 = 0, so (n − 25)(n + 64) = 0. Reject −64: after week 25 the box holds exactly ₹4,000. Riya: "Your birthday is week 30. You'll make it."
   - Then the school word problems: the tree drive (Q17), the penalty (Q15), the prizes (Q16), the log stack (Q19, two answers: why one is rejected), the potato race (Q20), and the spiral (Q18).
   - Practice: Exercise 5.3 Q4–20.
6. **Challenge and finale** (Exercise 5.4, optional; the note on the arithmetic mean)
   - Hook: Kabir's birthday is close. Grandpa sets him puzzles while they wait.
   - Learn:
     - the first negative term (Ex 5.4 Q1, an inequality on n);
     - the arithmetic mean: if a, b, c are in AP, b = (a + c)/2;
     - Ex 5.4 Q2 (sum and product of two terms);
     - the ladder's wood (Q3);
     - the house numbers (Q4, S₍ₓ₋₁₎ = S₄₉ − Sₓ, x = 35);
     - the terrace's concrete (Q5).
   - Finale: birthday. The box is opened (₹4,000 at week 25), and Kabir rides the cycle home. The four stops are recapped.

## Props (new package @chalk/prop-ap)
- **apSequence**: a list of numbers drawn as bars, one per term, labelled a₁, a₂, ….
  - Two modes:
    - built from a and d (steppers for a and d, n terms shown);
    - a given list (any numbers, e.g. 2, 4, 8, 16), to test.
  - The learner reveals the differences one at a time (arrows "+3" between neighbours). An unequal difference turns red and the list is marked not an AP.
  - Derived: isAP, d, the next terms, and the general form a, a + d, a + 2d, ….
- **nthTerm**: a hop line from the first term to the nth.
  - n − 1 hops of d each; when there are many, the middle collapses to a brace "(n − 1) × d".
  - The learner moves n and reads aₙ = a + (n − 1)d with the numbers filled in.
  - Target mode ("which term is −81?") steps through the algebra: target = a + (n − 1)d, then n − 1 = …, then n = …. It says whether n is a positive whole number, i.e. whether the target is a term.
- **gaussSum**: the sum as a staircase of bars (term k is a column of height aₖ).
  - Stepped:
    1. the staircase;
    2. a copy turned upside down;
    3. the copy slid on top, making a rectangle n wide and a + l tall;
    4. S is half the rectangle: S = n(a + l)/2.
  - A pairs mode writes the sum forwards and backwards (1 + 100, 2 + 99, …) for Gauss.
  - The learner can change n.
- **apScene**: story pictures in the family's look:
  - MoneyBox (Kabir and the tin, the weekly chart on the wall)
  - CycleShop (the ₹4,000 cycle)
  - GrandpaLadder (rungs shrinking)
  - FlowerBed (rows of roses)
  - GaussSlate (1 + 2 + … + 100 on Grandpa's slate)
  - TreeDrive (the school tree planting)
  - PotatoRace (Sports Day)
  - LogStack (logs in the village)
  - CycleDay (the finale)
