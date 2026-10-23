---
status: built
source: content/sources/text/ma10-ch15-probability.txt
approved: 2026-10-20
---

# Class 10 Maths, Ch15: Probability (plan)

Source: NCERT jemh115 (2020-21, the full edition). Everything is kept: 15.1–15.2, Examples 1–13 including the starred Examples 10* and 11* (geometric probability, "not from the examination point of view"), Exercise 15.1 and the optional Exercise 15.2.

Structure: theory-first, like the other maths chapters. Every lesson runs:
1. Hook (story)
2. Learn (NCERT order, define before use, props)
3. See it in life (story, explained)
4. Practice (examples, your turn, mission log)

Hindi with every string. Sentence first, then the maths on its own line.

## Mission: Fun Fair Week, part 2 (follows Ch14)
Riya's "10B in Numbers" poster is up. Now Kabir's games stall needs checking before the fair opens: a coin toss, a die, a spinner, a jar of marbles, a two-dice "sum" game and Grandpa's card trick. Each game promises a prize. Riya's job: for each game, what is the chance of winning, and is the game fair?

The family's world supplies NCERT's examples:
- Grandpa's coin toss on the verandah (Buffon, Kerrich, Pearson; Example 1).
- Kabir's bag of balls and jar of marbles (Examples 2 and 8).
- The die game (Example 3), the two-dice sum game (Example 13).
- Grandpa's pack of cards (Example 4; Ex 15.1 Q14–15).
- Class representative by lottery (Example 7), the shirt carton (Example 12).
- Musical chairs at the fair (Example 10*), a map of the fair ground (Example 11*).

Roadmap: try it many times → count the outcomes → the complement → cards and bags → two coins, two dice → beyond counting.

Checked numbers:
- P(head) = 1/2; P(white marble from 3 blue, 2 white, 4 red) = 2/9, blue 1/3, red 4/9.
- Die: P(> 4) = 1/3, P(≤ 4) = 2/3 (complements).
- Cards: P(ace) = 1/13, P(not ace) = 12/13; face card 3/13.
- Two coins: P(at least one head) = 3/4.
- Two dice: P(sum 8) = 5/36; P(sum 13) = 0; P(sum ≤ 12) = 1; doublets 1/6.
- Example 5: 1 − 0.62 = 0.38. Example 6: 364/365 and 1/365. Example 12: Jimmy 0.88, Sujatha 0.96.
- Example 10*: 0.5/2 = 1/4. Example 11*: lake 13.5 / 40.5 km² = 1/3.

## Lessons
1. **Experimental and theoretical probability** (15.1)
   - Hook: Kabir's first game, "call the toss, win a toffee". Grandpa tosses; Kabir calls heads ten times and wins four. "Is the coin cheating?"
   - Learn:
     - recap: experimental (empirical) probability = times it happened ÷ trials (Class IX);
     - its weakness: it changes with the trials; Buffon (4040 tosses), Kerrich (10000), Pearson (24000): the fraction settles near 1/2;
     - **equally likely outcomes**; the **theoretical** (classical) probability P(E) = favourable outcomes ÷ all possible outcomes (Laplace, 1795);
     - Example 1 (a coin), Example 2 (Kritika's bag: red, blue, yellow);
     - **elementary events**; their probabilities add to 1.
   - See it in life: running the coin 1, 10, 100, 1000 times; the line wobbles, then hugs 1/2. Four heads in ten is not cheating.
   - Practice: Ex 15.1 Q1–2.
   - Props: chanceRun (coin), dataScene CoinToss.
2. **The complement, impossible and sure events** (15.1 continued)
   - Hook: the die game: "roll more than 4 and win". Kabir: "half the faces are big, so it's fair". Riya counts.
   - Learn:
     - Example 3: P(> 4) = 2/6 = 1/3, P(≤ 4) = 4/6 = 2/3;
     - the **complement** "not E": P(E) + P(not E) = 1, so P(not E) = 1 − P(E);
     - the **impossible event** (P = 0: a die showing 8) and the **sure event** (P = 1: less than 7);
     - 0 ≤ P(E) ≤ 1, the probability line;
     - Example 5 (tennis: 0.38); Example 6 (birthdays: 364/365).
   - See it in life: the die game wins only a third of the time; Kabir changes the prize.
   - Practice: Ex 15.1 Q3–9.
   - Props: chanceScale (events placed on 0–1, complement bar), outcomeSpace (die, complement), chanceRun (die).
3. **Cards, bags and choosing** (15.1 continued)
   - Hook: Grandpa's card trick, "draw an ace and win"; Kabir's marble jar, "draw a white one".
   - Learn:
     - the pack of 52: 4 suits of 13, red and black, face cards (J, Q, K);
     - Example 4 (ace 1/13, not an ace 12/13);
     - Example 7 (choosing a girl or boy as class representative: 25/40, 15/40);
     - Example 8 (marbles: 2/9, 1/3, 4/9; they add to 1);
     - Example 12 (Jimmy and Sujatha: 0.88, 0.96).
   - See it in life: the white-marble game pays out about 2 times in 9; Riya runs the jar 100 and 1000 times to check.
   - Practice: Ex 15.1 Q10–17.
   - Props: outcomeSpace (cards: tap the event), chanceRun (bag), dataScene CardTable, GameStall.
4. **Two coins and two dice** (15.1 continued)
   - Hook: the big game, "throw two dice; a sum of 8 wins the prize". Kabir: "8 is in the middle, it must come up a lot".
   - Learn:
     - listing outcomes as ordered pairs: two coins HH, HT, TH, TT (Example 9: at least one head 3/4);
     - two dice: the 6 × 6 grid of 36 outcomes (Example 13: sums 8, 13, ≤ 12);
     - why (2, 6) and (6, 2) are different outcomes (the blue die and the grey die);
     - the common slip of counting sums as outcomes (11 sums are not equally likely).
   - See it in life: the sum-8 game wins 5 times in 36; Riya taps the five cells, then runs the dice 1000 times. Kabir prices the prize accordingly.
   - Practice: Ex 15.1 Q18–25 (incl. Q22, Q23 Hanif's coins, Q25 the two arguments).
   - Props: outcomeSpace (two coins, two dice; learner picks the event), chanceRun (two dice), dataScene DiceGame.
5. **Beyond counting** (Examples 10*, 11*; Exercise 15.2, optional) and finale
   - Hook: musical chairs at the fair: the music stops any time in 2 minutes. What is the chance it stops in the first half-minute? There are infinitely many outcomes.
   - Learn:
     - probability as a ratio of lengths (Example 10*: 1/4) and areas (Example 11*: the lake, 1/3);
     - why counting outcomes no longer works; marked "not for the examination";
     - Exercise 15.2: Shyam and Ekta's shopping days (Q1), the die numbered 1, 2, 2, 3, 3, 6 and the sum table (Q2), the bag of 5 red balls (Q3), the drawn box (Q4), the coin-and-die experiment (Q5).
   - See it in life: random points dropped on the line and on the fair-ground map settle at 1/4 and 1/3.
   - Finale: Fun Fair day. Every game has its chance written on the stall board (dataScene Finale, GameStall); the poster and the stall stand side by side.
   - Props: regionChance (line and rectangle), chanceRun (die with custom faces), dataScene Finale.

## Props (package @chalk/prop-data, shared with Ch14)
- **chanceRun**: coin, two coins, die (custom faces), two dice, spinner (labelled sectors), bag of marbles (weighted). Run ×1/×10/×100/×1000; counts; experimental vs theoretical (fraction and decimal); a running-fraction graph on a log axis with the theoretical line dashed. Seeded (mulberry32) so a run replays. Signals ran, many (≥1000 trials, commit).
- **outcomeSpace**: every outcome at once: two dice 6 × 6 (first die down, second across), 52 cards by suit, two coins, one die, one coin. The event lights up, or the learner taps it (matched signal, commit); count and P(E) in lowest terms; complement lights the rest with P(not E) = 1 − P(E).
- **chanceScale**: 0 (impossible) — ½ — 1 (sure); events placed one at a time; a bar splitting 1 into P(E) and P(not E).
- **regionChance**: a line or a rectangle with a favourable part; seeded random points; the fraction inside vs length or area ratio, with the working.
- **dataScene**: CoinToss, GameStall, DiceGame, CardTable, Finale (Ch14 uses the rest).

Existing props/chance (coinProp) and props/plot were checked: coinProp is a single-toss coin without the dice/bag/spinner/grid needs, and plot doesn't cover histograms with labelled modal parts or ogives, so the new package carries its own (it reuses chance's mulberry32 code).
