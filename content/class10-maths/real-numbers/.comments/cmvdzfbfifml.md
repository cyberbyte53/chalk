---
id: cmvdzfbfifml
status: done
on: class10-maths/real-numbers/euclid-algorithm/overview/division
piece: w5
source: content/class10-maths/real-numbers/euclid-algorithm/overview.ts:386
lessonTitle: HCF by Euclid's algorithm
board: division
createdAt: 2026-10-18T15:30:24.030Z
lessonId: concept/af0ea8e1d811903c
boardIndex: 3
snapshot: "**In general.** Say $d$ divides $a$ and $b$. Since it divides $b$, it divides $bq$. A
  number that divides two numbers divides their difference too: $$d \\text{ divides } a - bq = r$$
  It works back too. If $d$ divides $b$ and $r$, it divides their sum: $$bq + r = a$$ So $a, b$ and
  $b, r$ have the same common divisors, and the same HCF:"
locale: en
thread:
  - by: claude
    at: 2026-10-18T15:31:21Z
    text: "Proposal below: the general step told with the ribbon picture."
  - by: claude
    at: 2026-10-18T15:33:12Z
    text: "Rewritten as you said: h a common factor of a and b, so h is a factor of a − qb. Numbers line
      first, then the same steps with letters."
  - by: claude
    at: 2026-10-18T15:34:47Z
    text: Rewritten so the numbers and the letters take the same steps in the same words.
  - by: claude
    at: 2026-10-18T15:36:02Z
    text: Numbers line now says remainder, same as the general proof.
  - by: claude
    at: 2026-10-18T15:36:30Z
    text: "Added the first line of the page: the leftover is named the remainder."
  - by: claude
    at: 2026-10-18T15:38:50Z
    text: "Done: applied as proposed (English and Hindi). Rebuild content to see it."
proposal:
  summary: "First line names the swap (leftover → remainder). Then numbers and letters follow the same
    four steps, in the same words: what we want to show, write both as multiples, write the
    remainder as a − qb, substitute and take the factor out."
  changes:
    - before: $$\underbrace{51}_{\text{ribbon}} = \underbrace{21}_{\text{laid}} \times 2 +
        \underbrace{9}_{\text{leftover}}$$ The leftover, 9, is shorter than 21. That's Euclid's
        division lemma.
      after: "$$\\underbrace{51}_{\\text{ribbon}} = \\underbrace{21}_{\\text{laid}} \\times 2 +
        \\underbrace{9}_{\\text{leftover}}$$ This is $51 \\div 21$: the leftover, 9, is the
        **remainder**, and it's shorter than 21. That's Euclid's division lemma. From here on we
        call it the remainder."
    - before: "**Same common divisors.** First with numbers. 3 divides 21, so it also divides 21 twice
        over: $$21 \\times 2 = 42$$ 3 divides 51 too, so it divides the difference: $$51 - 42 = 9$$"
      after: "**Same common factors.** We want to show: a common factor of 51 and 21 is also a factor of
        the remainder 9. Take 3, a common factor of 51 and 21. Write both as multiples of 3: $$51 =
        3 \\times 17, \\qquad 21 = 3 \\times 7$$ The remainder is what's left of 51 after two 21s:
        $$9 = 51 - 2 \\times 21$$ Replace 51 and 21 by their multiples of 3, and take the 3 out:
        $$\\begin{aligned} 9 &= 3 \\times 17 - 2 \\times (3 \\times 7) \\\\ &= 3 \\times (17 - 14)
        \\\\ &= 3 \\times 3 \\end{aligned}$$ So 3 is a factor of 9."
    - before: "**In general.** Say $d$ divides $a$ and $b$. Since it divides $b$, it divides $bq$. A
        number that divides two numbers divides their difference too: $$d \\text{ divides } a - bq =
        r$$ It works back too. If $d$ divides $b$ and $r$, it divides their sum: $$bq + r = a$$ So
        $a, b$ and $b, r$ have the same common divisors, and the same HCF:"
      after: "**In general.** We want to show: a common factor of $a$ and $b$ is also a factor of the
        remainder $r$. Take $h$, a common factor of $a$ and $b$. Write both as multiples of $h$: $$a
        = hx, \\qquad b = hy$$ The remainder is what's left of $a$ after $q$ copies of $b$: $$r = a
        - qb$$ Replace $a$ and $b$ by their multiples of $h$, and take the $h$ out:
        $$\\begin{aligned} r &= hx - q \\times hy \\\\ &= h(x - qy) \\end{aligned}$$ So $h$ is a
        factor of $r$. It works the other way too: a common factor of $b$ and $r$ is a factor of $a
        = qb + r$, in the same way. So $a, b$ and $b, r$ have the same common factors, and the same
        HCF:"
---
this proof will not go easy for 10th graders , can we have something intutive
