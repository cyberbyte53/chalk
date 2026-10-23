import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { z } from "zod";
import { Concept } from "../../concepts.gen";
import { numericBoard, seedOf } from "../../quiz";

/**
 * R = ρl/A with a change of shape: a wire of resistance R₁ is reshaped (same material), its length
 * multiplied by `length` and its area by `area` (or its diameter by `diameter`). NCERT Example 12.6,
 * Exercise 6(b).
 */
export const resistanceScaling = family({
  level: Level.Medium,
  tests: [Concept.ResistanceFactors],
  params: z
    .object({
      ohms: z.number().positive(),
      length: z.number().positive(),
      area: z.number().positive().optional(),
      diameter: z.number().positive().optional(),
    })
    .strict(),
  build: ({ ohms, length, area, diameter }, b) => {
    const areaFactor = diameter === undefined ? (area ?? 1) : diameter ** 2;
    const right = (ohms * length) / areaFactor;
    const say = (k: number) =>
      k === 0.5 ? ["half", "आधी"] : k === 1 ? ["the same", "वही"] : [`${k} times`, `${k} गुना`];
    const [lEn, lHi] = say(length);
    const shapeEn =
      diameter === undefined
        ? `${say(area ?? 1)[0]} the area of cross-section`
        : `${say(diameter)[0]} the diameter`;
    const shapeHi =
      diameter === undefined
        ? `अनुप्रस्थ काट का क्षेत्रफल ${say(area ?? 1)[1]}`
        : `व्यास ${say(diameter)[1]}`;
    return numericBoard(
      b,
      {
        prompt: t(
          `A wire has a resistance of ${ohms} Ω. Another wire of the same material has ${lEn} the length and ${shapeEn}. What is its resistance?`,
          `एक तार का प्रतिरोध ${ohms} Ω है। उसी पदार्थ के दूसरे तार की लंबाई ${lHi} है और ${shapeHi}। उसका प्रतिरोध कितना है?`,
        ),
        unit: "Ω",
        right,
        wrong: [
          {
            value: ohms * length * areaFactor,
            feedback: t(
              "A bigger area means less resistance: divide by the area factor.",
              "बड़ा क्षेत्रफल यानी कम प्रतिरोध: क्षेत्रफल के गुणक से भाग दो।",
            ),
          },
          {
            value: (ohms * length) / (diameter ?? areaFactor),
            feedback: t(
              "Area goes with the diameter squared: twice the diameter is four times the area.",
              "क्षेत्रफल व्यास के वर्ग के साथ चलता है: दोगुना व्यास, चार गुना क्षेत्रफल।",
            ),
          },
          {
            value: ohms / length / areaFactor,
            feedback: t(
              "A longer wire has more resistance: multiply by the length factor.",
              "लंबे तार का प्रतिरोध ज़्यादा होता है: लंबाई के गुणक से गुणा करो।",
            ),
          },
        ],
      },
      seedOf(`${ohms}${length}${area}${diameter}`),
    );
  },
});
