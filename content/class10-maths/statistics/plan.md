---
status: built
source: content/sources/text/ma10-ch14-statistics.txt
approved: 2026-10-20
---

# Class 10 Maths, Ch14: Statistics (plan)

Source: NCERT jemh114 (2020-21, the full edition). Everything is kept: the direct, assumed-mean and step-deviation methods, Activities 1–3, the empirical relation, ogives (14.5) and all of Exercises 14.1–14.4.

Structure: theory-first, like the other maths chapters. Every lesson runs:
1. Hook (story)
2. Learn (NCERT order, define before use, props)
3. See it in life (story, explained)
4. Practice (examples, your turn, mission log)

Hindi with every string. Sentence first, then the maths on its own line.

## Mission: Fun Fair Week (shared with Ch15)
Annual Day and the school fun fair fall in the same week. Riya volunteers to make the class poster, **"10B in Numbers"**: three empty boxes for "the average", "the most common" and "the middle", plus a graph. Each box needs a different idea, and the data arrives grouped (marks in 15s, wickets in ranges, family sizes in pairs), so the Class IX methods for raw data no longer work directly.

Kabir runs a games stall at the same fair; Ch15 picks that up: Riya checks whether his games are fair.

The family's world supplies NCERT's data:
- Riya's class maths test, marks grouped in 15s (Example 1, Table 14.3).
- Female teachers by state (Example 2), wickets by bowler (Example 3; Kabir's cricket scorebook).
- Riya's lane survey of family sizes (Example 5).
- The assembly line by height (Example 7, heights of 51 girls).
- Grandpa's shop-profits ledger (Example 9, more-than data).

Roadmap: the average → the most common → the middle → the graph → the poster.

Checked numbers:
- Ex1 mean 62 (all three methods); the same 30 marks ungrouped give 59.3, the gap explained by the class-mark assumption.
- Ex2 mean 39.71; Ex3 (unequal classes, a = 200, h = 20) mean 152.89.
- Ex5 mode 3.286 ≈ 3.29; Ex6 mode 52 (mean 62).
- Ungrouped median recap (Table 14.11): 28.5.
- Table 14.12 median 66.43 (n/2 = 26.5, median class 60–70); Ex7 median 149.03; Ex8 x = 9, y = 15; Ex9 median 17.5.
- The ogives in the prop are joined with straight lines, so the n/2 reading and the crossing both give exactly the formula median.

## Lessons
1. **The mean of grouped data** (14.1–14.2, direct method)
   - Hook: the poster's first box, "our class average". Riya has the marks of 30 classmates, but only in groups (10–25: 2 students, 25–40: 3, …).
   - Learn:
     - recap: mean of raw data, x̄ = Σfᵢxᵢ / Σfᵢ (Class IX; Tables 14.1–14.2);
     - grouping loses the exact values; assume each class is centred at its **class mark** xᵢ = (upper + lower)/2;
     - the **direct method**: a table of xᵢ and fᵢxᵢ, then x̄ = Σfᵢxᵢ / Σfᵢ (Example 1: 62);
     - why 62 and not 59.3: the class-mark assumption.
   - See it in life: the first box gets "average 62".
   - Practice: Ex 14.1 Q1–3 (direct method).
   - Props: meanTable (direct), dataScene Poster, MarksSheet.
2. **Assumed mean and step deviation** (14.2 continued)
   - Hook: Kabir's wickets table has big numbers (20–60, …, 350–450). Multiplying fᵢxᵢ gets heavy.
   - Learn:
     - deviations dᵢ = xᵢ − a from an **assumed mean** a (a class mark near the middle); x̄ = a + Σfᵢdᵢ / Σfᵢ;
     - **step deviation** uᵢ = (xᵢ − a)/h: x̄ = a + h · Σfᵢuᵢ / Σfᵢ;
     - all three give the same mean (Activity 1: try different a);
     - Example 2 (39.71 three ways); Example 3 (unequal classes: step deviation still works with h = 20; 152.89);
     - when to use which.
   - See it in life: the cricket scorebook average; the poster gets a sports corner.
   - Practice: Ex 14.1 Q4–9 (choose a method).
   - Props: meanTable (method buttons, an a nudger, columns appear one per step), dataScene Cricket.
3. **The mode of grouped data** (14.3)
   - Hook: the second box, "the most common family size". Riya's lane survey gives classes 1–3, 3–5, ….
   - Learn:
     - recap: mode of raw data (Example 4, wickets in 10 matches);
     - **modal class** = the class with the highest frequency;
     - Mode = l + (f₁ − f₀)/(2f₁ − f₀ − f₂) × h, each letter labelled on the histogram;
     - Example 5 (3.286); Example 6 (mode 52 vs mean 62: what each tells);
     - Activities 2–3.
   - See it in life: "most families here have about 3 people".
   - Practice: Ex 14.2.
   - Props: modeChart (tap the modal class, then l, h, f₀, f₁, f₂ labelled, mode line, optional mean line), dataScene FamilySurvey.
4. **The median of grouped data** (14.4)
   - Hook: the third box, "the middle". At assembly the class lines up by height; Riya points at the middle child. With grouped data, who is in the middle?
   - Learn:
     - recap: median of raw data, odd and even n (Tables 14.10–14.11: 28.5); the cumulative frequency column;
     - **cumulative frequency** for grouped data: less-than and more-than cf tables;
     - the **median class**: the first whose cf exceeds n/2;
     - Median = l + (n/2 − cf)/f × h (Table 14.12: 66.4);
     - Example 7 (cf given: rebuild the frequencies; 149.03); Example 8 (find x and y from the median 525);
     - the empirical relation 3 Median = Mode + 2 Mean; which measure suits which data.
   - See it in life: the middle of the height line; the poster's third box.
   - Practice: Ex 14.3.
   - Props: medianTable (cf column grows, the learner taps the median class, formula working), dataScene HeightQueue.
5. **Ogives** (14.5) and finale
   - Hook: the poster needs a picture. Grandpa's ledger only says "shops earning at least ₹5 lakh: 30, at least ₹10 lakh: 28, …".
   - Learn:
     - the **less-than ogive**: plot (upper limit, cf) and join (Figs 14.1–14.2);
     - the **more-than ogive**: plot (lower limit, more-than cf) (Fig 14.3);
     - reading the median: across from n/2 and down, or down from where the two ogives cross (Fig 14.4, Example 9: 17.5);
     - a check against the formula.
   - See it in life: the poster's graph, both ogives crossing at the median.
   - Practice: Ex 14.4.
   - Finale: the poster goes up on Annual Day (dataScene Finale), with a teaser for Kabir's stall (Ch15).
   - Props: ogive (plot point by point, Plot all, Read the median), dataScene Finale.

## Props (package @chalk/prop-data, shared with Ch15)
- **meanTable**: the grouped table with columns revealed one per step: direct (xᵢ, fᵢxᵢ), assumed mean (xᵢ, dᵢ, fᵢdᵢ), step deviation (xᵢ, dᵢ, uᵢ, fᵢuᵢ); totals row; TeX working; verdict. Method buttons and an a nudger (a must be a class mark; the a row is highlighted). Handles unequal classes (h set by the author) and ungrouped data (isGrouped false).
- **modeChart**: histogram (equal contiguous classes). The learner taps the modal class (wrong taps turn red); steps: modal bar → f₀, f₁, f₂ labels, l and an h brace → dashed mode line. Optional mean line.
- **medianTable**: f and cf columns (less-than or more-than; from frequencies or from cf). The learner taps the median class (Next is blocked until right); n/2 note; the l, cf, f, h line; working; verdict.
- **ogive**: less-than, more-than or both; plotted point by point; reads the median (the n/2 line, or the crossing).
- **dataScene**: Poster, MarksSheet, Cricket, FamilySurvey, HeightQueue, Finale (Ch15 uses the rest).
