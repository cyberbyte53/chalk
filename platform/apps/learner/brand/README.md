# Chalk's logo: the learning curve

A Dunning–Kruger curve in chalk on a framed blackboard: the quick peak, the dip, the long climb.
It is Chalk's mark, on the app's icons only; inside the app, Jugnu is the character.

- `chalk-icon.svg`: the icon (120 and up); `chalk-icon-small.svg` (64 and below) and
  `chalk-favicon.svg` (the tab), simpler so they still read; `chalk-logo-slate.svg`: the wide board;
  `chalk-icon-animated.svg`: the curve being drawn (not used yet).
- In `public/`: `favicon.svg`, `icon-192.png`, `icon-512.png` as drawn; `apple-touch-icon.png` (180)
  and `icon-maskable-512.png` are full-bleed in the frame's brown, since iOS and Android crop icons
  to their own shape (the maskable keeps the design inside the safe 80%). Made from
  `chalk-icon.svg` by `pnpm brand-icons` in platform/studio (needs Chrome).
