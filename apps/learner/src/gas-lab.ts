import type { Lesson } from "@chalk/content";

/**
 * The gas lab (development only): an experiment with many moving things on one board, to see
 * how the board model and the player hold up (frames a second, SVG against canvas) on a phone.
 */
export const gasLab: Lesson = {
  id: "dev/gas-lab",
  version: "0.0.0",
  title: { en: "Gas lab (experiment)", hi: "गैस प्रयोगशाला (प्रयोग)" },
  concepts: [],
  boards: [
    {
      id: 1,
      name: "gasLab",
      root: {
        id: 1,
        name: "page",
        kind: "column",
        children: [
          {
            id: 2,
            name: "title",
            kind: "prop",
            prop: "text",
            with: { text: { en: "A gas in a box", hi: "डिब्बे में गैस" }, style: "title" },
          },
          {
            id: 3,
            name: "body",
            kind: "prop",
            prop: "text",
            with: {
              text: {
                en: "Press Start. Make it hotter and the particles speed up. Follow the orange one.",
                hi: "Start दबाओ। गर्म करो तो कण तेज़ चलते हैं। नारंगी कण को देखो।",
              },
              style: "body",
            },
          },
          { id: 4, name: "gas", kind: "prop", prop: "gas", with: {} },
        ],
      },
      is: [],
      when: [],
      studentOnly: [],
      nextPieceId: 5,
    },
  ],
};
