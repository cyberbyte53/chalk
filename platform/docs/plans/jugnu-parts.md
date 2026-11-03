# What Jugnu sees and points at: parts

Status: built (2026-11-03), after review: the halves and O carry their data on the existing taps; numbers are tagged once, where written; axes carry the lesson's names; an off-list glow is marked as a failure on the page, not retried. Built with it: findNode looks in every layer of a child; rings are measured once drawn; a part's id is its address.

## The need, from the bottom

Jugnu talks about what she sees ("the x-axis", "−2 on it", "your dot") and glows the one thing he
talks about. So he needs, for each thing she can see: **a name to point with** and **what it is**.
Nothing more.

## What exists

The rule is already written (`@chalk/prop` tags.ts): *every part the student can tell apart is
tagged on the element that draws it*: an input by what it does (`does(...)`), anything else by what
it shows (`shows(name, value)`, its value typed). Jugnu, agents and tests read the board from these
tags only. The address of a part is its pointer (`sheet/plane/OX′`), and the player rings it
(`findNode`, fixed today to look in every layer of a child, and measured once drawn).

## What is wrong (plot-swapped, 3 Nov)

1. **The plane breaks the rule.** It tags only its tap targets (`namePart:OX`: what tapping does).
   The axes, their halves, X X′ Y Y′, O and the numbers are drawn but not tagged: to Jugnu they don't
   exist, and the tap targets say nothing of what they are. So he glowed OX (the positive half) for −2.
2. **His glow is free text, unchecked.** He wrote `OX` or `sheet/plane/namePart:OX`; nothing told
   him whether it named anything.

## The change (no new concept)

1. **The plane tags what it draws, as data.** Each half of an axis is a shown part named as the
   lesson names it, its value saying what it is: `OX′` → `{ axis: "x", side: "negative" }`; the
   whole axes `x-axis`, `y-axis`; `O` → `{ x: 0, y: 0 }`; each number on a line
   `x:-2` → `-2` (only those drawn). Data, not prose: Jugnu reads values as he reads the dot's
   `{ x: 4, y: −2 }`. The tap targets stay as they are.
2. **The glow is an address from the list he is given**, written exactly as listed (not decoded).
   One not on the list is refused in that turn, with the list, and he answers again.

Then the same check every prop already has (the build reads its tags) covers the plane; no other
prop changes until a case shows it needs to.

## Not now (until evidence)

- Places that aren't drawn things (the spot (−2, 0)): the number −2 on the x-axis is what he points at.
- A picture of her board for Jugnu.
- Words for parts (`is: "the x-axis left of O"`): typed values first.

## How we know it worked

The same experiment (plot-swapped, up-first), one run, only this changed: his glow names a part on
the list, and it is the part his words are about (OX′ or `x:-2`, not OX).
