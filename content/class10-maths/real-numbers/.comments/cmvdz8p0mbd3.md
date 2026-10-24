---
id: cmvdz8p0mbd3
status: done
on: class10-maths/real-numbers/euclid-algorithm/overview/why
piece: because
source: content/class10-maths/real-numbers/euclid-algorithm/overview.ts:307
lessonTitle: HCF by Euclid's algorithm
board: why
createdAt: 2026-10-18T15:25:15.046Z
lessonId: concept/af0ea8e1d811903c
boardIndex: 2
snapshot: "**Why?** If pieces of length $d$ fit exactly into 18 and into 12, they also fit into
  what's left when 12 is taken from 18: $$18 - 12 = 6$$ It works back too. If they fit into 12 and
  6, they fit into the two together: $$12 + 6 = 18$$ So no length is gained or lost."
locale: en
thread:
  - by: claude
    at: 2026-10-18T15:31:21Z
    text: "Proposal below: counted pieces instead of a letter d."
  - by: claude
    at: 2026-10-18T15:38:50Z
    text: "Done: applied as proposed (English and Hindi). Rebuild content to see it."
proposal:
  summary: Explain it with pieces the student can count on the ribbons, not with d. One length (3 cm)
    worked through, then the general point in one sentence, then the way back.
  changes:
    - before: "**Why?** If pieces of length $d$ fit exactly into 18 and into 12, they also fit into what's
        left when 12 is taken from 18: $$18 - 12 = 6$$ It works back too. If they fit into 12 and 6,
        they fit into the two together: $$12 + 6 = 18$$ So no length is gained or lost."
      after: "**Why the same list?** Take 3 cm pieces. The 18 cm ribbon is 6 pieces. The 12 laid on it
        covers 4 of them, so the leftover is the other 2: whole pieces again. $$\\underbrace{18}_{6
        \\text{ pieces}} = \\underbrace{12}_{4 \\text{ pieces}} + \\underbrace{6}_{2 \\text{
        pieces}}$$ The same happens for any length that cuts both 18 and 12: it cuts the leftover
        too. And back: a length that cuts 12 and 6 cuts 18, because 18 is just 12 and 6 end to end."
---
this explanation is not good bro , this is not looking good
