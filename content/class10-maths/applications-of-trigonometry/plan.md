---
status: built
source: content/sources/text/ma10-ch09-applications-trigonometry.txt
approved: 2026-10-20
---

# Class 10 Maths: Ch 9 Some Applications of Trigonometry

Source: NCERT Class 10 Mathematics, old full edition, Ch 9 (heights and distances). Everything is kept: the Great Trigonometric Survey box, Examples 1–7 and Exercise 9.1 Q1–16.

## Mission: The Kite Hill, festival day (continues Ch 8)

It is Makar Sankranti. The family climbs the old fort on the hill with kites, Kabir's clinometer and Riya's ratio card from Ch 8. Each lesson answers one question the day throws up:
- How tall is the fort's watch-tower?
- How high is Kabir's kite on 60 m of string?
- How tall is the flag on the temple roof across the valley?
- How wide is the river below the old bridge?
- How far did the hot-air balloon drift?

The finale: Kabir's kite is highest of the day, and they can prove it.

Every lesson runs **hook → learn → see it in life → practice**, then a mission-log line. Every solution follows the same steps, one line at a time:
1. draw the figure;
2. mark the right angle and the known angle;
3. choose the ratio that links what is known to what is wanted;
4. solve;
5. add the eye height if there is one.

## Lessons (in NCERT order)

1. **angle-of-elevation** (9.1, 9.2 definitions, Examples 1–3)
   - Hook: at the foot of the watch-tower (scene `towerSighting`).
   - Learn:
     - the line of sight;
     - the angle of elevation, measured from the horizontal (Fig 9.1–9.2);
     - what you need to find a height: the distance, the angle and the eye height;
     - choosing tan or cot.
     - The survey box (Everest, theodolites in Dehradun).
   - See it in life: Kabir sights the tower top with the clinometer at 30 m and reads 45°. Adding the 1.5 m eye height gives 31.5 m (`clinometer` defaults; `heightFinder` fortTower).
   - Practice: Examples 1 (tower 15√3), 2 (electrician's ladder, sin 60°), 3 (chimney 30 m); Exercise 9.1 Q1, Q3, Q4, Q5 (the kite on a string); mission kiteString (scene `kiteFlying`).
   - Props: `clinometer` (tilt to sight the top, read the angle), `heightFinder` presets ex1Tower, ex2Ladder, ex3Chimney, q5Kite, fortTower, kiteString.

2. **angle-of-depression** (9.2 definition)
   - Learn:
     - the angle of depression, measured from the horizontal at the eye (Fig 9.3);
     - alternate angles, so the depression at the top equals the elevation at the bottom (Fig 9.9 idea).
   - See it in life: from the fort wall Riya looks *down* at the temple steps across the river (Fig 8.2 come true) and finds the distance (scene `templeAcrossRiver`, `heightFinder` templeRiver).
   - Props: `heightFinder` (depression presets, the horizontal line drawn at the eye).

3. **two-observations** (Examples 4–5, Exercise 9.1 Q6–Q11, Q14, Q16)
   - Learn:
     - two right triangles that share a side;
     - write one equation per triangle, then eliminate the unknown;
     - Example 4 (flagstaff on a building) and Example 5 (shadow 40 m longer).
   - See it in life: the temple flag across the valley (Example 4's method); the balloon (Q14, scene `balloonDrift`).
   - Props: `heightFinder` ex4Flagstaff, ex5Shadow, q14Balloon.

4. **heights-and-depths-from-above** (Examples 6–7, Exercise 9.1 Q12, Q13, Q15), the finale
   - Learn:
     - depression angles from a high point to two targets (Example 6, the two buildings);
     - the bridge over the river (Example 7);
     - rationalising (4(√3 + 1)) one step per line.
   - See it in life: the river width from the bridge; the two ships from the lighthouse (Q13); the car on the highway (Q15) as the bus leaves.
   - Finale: the kite-height table and the mission log.
   - Props: `heightFinder` ex6Buildings, ex7Bridge, q13Ships; scene `sankrantiSunset`.

## Props (`@chalk/prop-trigonometry`, shared with Ch 8)

| Prop | Use | Key state | Signals |
|---|---|---|---|
| `heightFinder` | stepped heights-and-distances problems with the figure drawn to scale | problem (ex1Tower, ex2Ladder, ex3Chimney, ex4Flagstaff, ex5Shadow, ex6Buildings, ex7Bridge, q5Kite, q13Ships, q14Balloon, fortTower, kiteString, templeRiver), step, showQuestion, showAnswer, canStep | stepped, solved |
| `clinometer` | measure an angle of elevation by tilting a sighting straw; compute the height | target (tower, kite, flag, tree), targetHeight, distance, eyeHeight, tilt, tiltStep, walkStep, canTilt, canWalk, showWorking | changed, sighted |
| `trigScene` | mission pictures | scene | none |

All shown words are in English and Hindi.
