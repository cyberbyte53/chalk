# @chalk/prop-collision

**An experiment**: a physics prop on the board model. Two blocks on a frictionless track collide head-on; the prop shows momentum (always kept) and kinetic energy (kept only when the collision is elastic). Keep it out of lessons until we decide.

- State: `massA`, `massB`, `velocityA`, `velocityB` (before the collision, m/s, right is positive), `bounce` (coefficient of restitution: 1 elastic, 0 sticky), `time`, `isRunning`.
- Nothing is simulated step by step: where the blocks are at any `time` follows from the setup by the textbook formulas (`contactTime`, `afterCollision`, `momentAt`), so any moment can be shown, replayed or checked exactly.
- Derived: `collidesAt`, `hasCollided`, `speedA`, `speedB`, `momentumBefore`, `momentumNow`, `energyBefore`, `energyNow`.
- Actions: `play` (a task that advances `time` on the board's clock until a block leaves the track), `pause`, `reset`, `setMass`, `setVelocity`, `setBounce` (changing the setup puts the blocks back at the start).
- Signal: `collided`, with the velocities after.
- Drawn on a `@chalk/draw` stage (metres to px by its d3 scale); bar lengths use `scaleLinear` from `@chalk/draw`. Styles live in `src/styles.css`, drawn with the look's tokens.
