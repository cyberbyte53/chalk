---
id: cmvdztscxxo2
status: done
on: class10-maths/real-numbers/euclid-algorithm/overview/division
piece: w4
source: content/class10-maths/real-numbers/euclid-algorithm/overview.ts:380
lessonTitle: HCF by Euclid's algorithm
board: division
createdAt: 2026-10-18T15:41:39.153Z
lessonId: concept/af0ea8e1d811903c
boardIndex: 3
snapshot: "**Same common factors.** We want to show: a common factor of 51 and 21 is also a factor
  of the remainder 9. Take 3, a common factor of 51 and 21. Write both as multiples of 3: $$51 = 3
  \\times 17, \\qquad 21 = 3 \\times 7$$ The remainder is what's left of 51 after two 21s: $$9 = 51
  - 2 \\times 21$$ Replace 51 and 21 by their multiples of 3, and take the 3 out: $$\\begin{aligned}
  9 &= 3 \\times 17 - 2 \\times (3 \\times 7) \\\\ &= 3 \\times (17 - 14) \\\\ &= 3 \\times 3
  \\end{aligned}$$ So 3 is a factor of 9."
locale: en
thread:
  - by: claude
    at: 2026-10-18T15:42:04Z
    text: "Proposal below: q and r named at the start."
  - by: claude
    at: 2026-10-18T15:44:15Z
    text: "Done: applied as proposed (English and Hindi). Rebuild content to see it."
proposal:
  summary: Open the numbers example with the division itself, naming q and r, so a = 51, b = 21, q =
    2, r = 9 line up with the letters in the general proof below.
  changes:
    - before: "**Same common factors.** We want to show: a common factor of 51 and 21 is also a factor of
        the remainder 9. Take 3, a common factor of 51 and 21. Write both as multiples of 3: $$51 =
        3 \\times 17, \\qquad 21 = 3 \\times 7$$ The remainder is what's left of 51 after two 21s:
        $$9 = 51 - 2 \\times 21$$ Replace 51 and 21 by their multiples of 3, and take the 3 out:
        $$\\begin{aligned} 9 &= 3 \\times 17 - 2 \\times (3 \\times 7) \\\\ &= 3 \\times (17 - 14)
        \\\\ &= 3 \\times 3 \\end{aligned}$$ So 3 is a factor of 9."
      after: "**Same common factors.** When 51 is divided by 21, the quotient is $q = 2$ and the remainder
        is $r = 9$: $$51 = 21 \\times 2 + 9$$ We want to show: a common factor of 51 and 21 is also
        a factor of the remainder 9. Take 3, a common factor of 51 and 21. Write both as multiples
        of 3: $$51 = 3 \\times 17, \\qquad 21 = 3 \\times 7$$ The remainder is what's left of 51
        after two 21s: $$9 = 51 - 2 \\times 21$$ Replace 51 and 21 by their multiples of 3, and take
        the 3 out: $$\\begin{aligned} 9 &= 3 \\times 17 - 2 \\times (3 \\times 7) \\\\ &= 3 \\times
        (17 - 14) \\\\ &= 3 \\times 3 \\end{aligned}$$ So 3 is a factor of 9."
---
we shuld write when 51 divided by 21 r=9 and q=2
