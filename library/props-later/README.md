# Parked until the prop redesign is final

While Real Numbers is iterated on, the library holds only the props its boards use (basics: text,
choice, multiChoice, orderSteps; primes: sweetShare, stickMeasure, factorTree, primeTowers, lapRace,
billSplit, tenMaker; decimal: decimalExpansion). Everything else is here, unchanged and outside the
workspace: nothing builds, checks or imports it.

- `props/`: the other prop packages, and the parked props of basics, primes and decimal (with their
  styles and tests as `*-rest.css` and `*.parked`).
- `patterns/`: the board patterns only parked props used.
- `learner/`: the dev labs built on parked props.
- `jugnu-evals/`: Jugnu's eval boards, cases and students (all on parked props) and the tests that ran
  them. Jugnu's tests come back on Real Numbers boards with the Jugnu rethink.

When the design is final, these move back in one go, each through the new prop contract
(the project doc `plans/prop-redesign.md`).
