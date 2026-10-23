---
status: built
source: content/sources/text/sc10-ch11-human-eye.txt
approved: 2026-10-19
---

# Class 10 Science, Ch11: The Human Eye and the Colourful World (plan)

Source: NCERT jesc111 (2020-21, full edition: keep everything, including "Do You Know?" boxes and eye donation). Structure: theory-first, like Light L1. Each lesson is Hook (story) → Learn (NCERT order, define before use, props) → See it in life (story, explained) → Practice (examples, NCERT questions and exercises, your turn, mission log). Hindi with every string.

## Mission: Riya's eye test, then the sunrise trip
It carries on from Light: the movie night ended with "the eye works like the shoebox".
- **Part A, the eye.** On Monday Riya can't read the blackboard from the last row (NCERT in-text Q4). Grandpa reads the newspaper at arm's length. Before the family's trip to the hills, Riya goes for an eye test.
  - **Goal:** understand what's wrong with each eye and pick the right lenses: Riya's concave lens, Grandpa's bifocals.
- **Part B, the colourful world.** The family drives to a hill station to watch the sunrise. Kabir keeps a notebook of "why" questions:
  - why there's a rainbow at the waterfall;
  - why the air shimmers over the roadside chai stove;
  - why stars twinkle but the bright "star" (a planet) doesn't;
  - why the Sun appears before it has really risen, and why it's red then;
  - why the sky is blue at all, and why fog lamps and danger lights are red;
  - why the sunbeams show through the misty forest.
  - **Goal:** answer every question in the notebook. Ends on the sunrise.

Roadmap stops: (1) the eye, (2) focusing near and far, (3) faulty eyes and glasses, (4) light through a prism, (5) colours and the rainbow, (6) the air bends light, (7) the air scatters light.

## Lessons
1. **The human eye.** Like a camera: a lens and a screen (retina).
   - **Parts:** cornea (most of the bending), iris and pupil (pupil size in bright vs dim light), crystalline lens, retina's light-sensitive cells, optic nerve, brain.
   - **Image:** real and inverted on the retina.
   - **Do You Know?:** two eyes give a wider field of view and depth.
   - **Hook:** Riya's realisation from the movie night.
   - **In life:** walking from sunlight into a dark room; why you can't name colours with your eyes shut.
2. **Power of accommodation.**
   - **The lens changes shape:** jelly-like lens, ciliary muscles. Relaxed: thin lens, longer f, far objects. Contracted: thick lens, shorter f, near objects.
   - **Near point and far point:** accommodation; the least distance of distinct vision (near point 25 cm); the far point at infinity.
   - **Cataract.**
   - **In life:** reading a phone held too close; looking up from a book to the window.
   - **Exercises:** 1–4, 8, 9.
3. **Defects of vision and correction.**
   - **Myopia:** far point nearer than infinity, image in front of the retina; caused by too much lens curvature or a long eyeball; corrected with a concave lens.
   - **Hypermetropia:** near point farther than 25 cm, image behind the retina; caused by too long a focal length or a short eyeball; corrected with a convex lens.
   - **Presbyopia:** with age the ciliary muscles weaken and the lens stiffens. Bifocals: concave top, convex bottom. Contact lenses and surgery.
   - **Eye donation:** the "Think it over" box.
   - **In life:** Riya's prescription. The far point is 1.2 m (in-text Q2), so P = −1/1.2 ≈ −0.83 D. Grandpa's near point is 1 m, so P = +3 D (Exercise 7).
   - **Practice:** Exercises 5, 6 and 7. Exercise 6 is a far point of 80 cm, giving −1.25 D. Exercise 5 is −5.5 D and +1.5 D, giving focal lengths −18.2 cm and +66.7 cm.
4. **Refraction through a prism.**
   - **Shape and angle:** a triangular prism, its faces, the angle of the prism A.
   - **Activity 11.1:** the incident, refracted and emergent rays and angles i, r, e.
   - **Bending:** towards the normal going in, away from it coming out; the angle of deviation D. Compared with a glass slab, the faces here aren't parallel, so the ray turns.
   - **In life:** the glass prism Kabir finds in Grandpa's drawer, or a chandelier crystal.
5. **Dispersion and the rainbow.**
   - **Splitting white light:** Activity 11.2; the spectrum; VIBGYOR; dispersion. Red bends least, violet most.
   - **Newton's second prism:** an inverted prism recombines the colours into white, so white light is made of seven colours.
   - **The rainbow:** drops act like prisms (refraction, dispersion, internal reflection, refraction); always opposite the Sun; also seen at a waterfall or fountain.
   - **In life:** the rainbow at the waterfall, with the Sun behind them.
6. **Atmospheric refraction.**
   - **Hot air:** air over a fire is less dense, so its refractive index is lower, so things wobble.
   - **Twinkling stars:** gradual bending makes a star appear higher than it is; changing conditions make its apparent position and brightness flicker. Stars are point sources, while planets are extended sources whose flicker averages out.
   - **Sunrise and sunset:** the Sun is seen about 2 minutes early at sunrise and 2 minutes late at sunset; its disc looks flattened.
   - **In life:** the chai stove, the night sky at the hill station, the sunrise timing.
   - **Exercises:** 10, 11.
7. **Scattering of light.**
   - **Tyndall effect:** colloidal particles make a beam visible (smoky room, misty forest). Particle size sets the colour: fine particles scatter blue, large ones scatter white.
   - **Blue sky:** air molecules scatter blue more than red; red's wavelength is about 1.8 times blue's. With no atmosphere the sky is dark (an astronaut, a high flight). Danger lights are red because red is scattered least.
   - **Red Sun:** at noon the path through air is short, so the Sun is white; at the horizon the path is long, the blue is scattered away, and the Sun is red. Activity 11.3, the hypo tank: bluish sides, an orange-then-crimson transmitted beam.
   - **In life:** the sunrise; all of Kabir's notebook answered. The finale.
   - **Exercises:** 12, 13.

## Props (new package @chalk/prop-eye)
- **eyeModel**: a side view of the eye.
  - **Parts:** cornea, iris and pupil, lens, ciliary muscles, retina, optic nerve, with optional names.
  - **Object:** near or far (draggable along a compressed distance scale).
  - **Focusing:** the eye focuses within its range; the lens thickens or thins and the muscles contract or relax.
  - **Rays:** they meet on, in front of, or behind the retina, with a blur patch.
  - **Defects and correction:** presets for normal, myopia, hypermetropia and presbyopia; a corrective lens stepper in dioptres in front of the eye.
  - **Brightness:** a bright/dim toggle for the pupil.
  - **Inset:** "what you see" (a chart, sharp or blurred).
  - **Derived:** isSharp, image position, near and far points with the lens, power in use.
- **prism**: a triangular prism.
  - **Ray mode:** i adjustable; shows the normals, r, e, A and D.
  - **Dispersion mode:** a white beam goes in and a VIBGYOR fan lands on a screen (spread exaggerated so it can be seen).
  - **Recombine mode:** a second, inverted prism gives white light again.
- **atmosphere**: atmospheric refraction scenes.
  - **HotAir:** shimmer over a stove.
  - **Twinkle:** star vs planet, layered air bending the ray, actual vs apparent position, flicker.
  - **Sunrise:** actual vs apparent Sun at the horizon.
  - **Raindrop:** stepped refraction, dispersion and internal reflection inside one drop, with the rainbow opposite the Sun.
- **scattering**: scattering scenes.
  - **Tyndall:** a beam through a smoky room or a misty forest.
  - **SkyBlue:** the atmosphere can be switched on and off (blue vs dark sky).
  - **SunPath:** a Sun-height slider; the path length through air and the Sun's colour change with it.
  - **HypoTank:** Activity 11.3, played over time.
- **eyeScene**: story illustrations in the shared family look, such as the blackboard from the last row, the eye test, Grandpa's newspaper, the hill drive with Kabir's notebook, the waterfall rainbow, the starry night, the sunrise point, and the eye-donation pledge.
