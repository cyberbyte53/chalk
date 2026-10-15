import type { Lesson } from "@chalk/content";

/** The collision lab (development only): a physics prop on one board, to judge the idea. */
export const collisionLab: Lesson = {
  id: "dev/collision-lab",
  version: "0.0.0",
  title: { en: "Collision lab (experiment)", hi: "टक्कर प्रयोगशाला (प्रयोग)" },
  concepts: [],
  boards: [
    {
      id: 1,
      name: "collisionLab",
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
            with: {
              text: { en: "When two blocks collide", hi: "जब दो ब्लॉक टकराते हैं" },
              style: "title",
            },
          },
          {
            id: 3,
            name: "body",
            kind: "prop",
            prop: "text",
            with: {
              text: {
                en: "Let them go and watch the bars. Momentum before and after is always the same. Kinetic energy is the same only when the collision is **elastic**.",
                hi: "इन्हें छोड़ो और पट्टियाँ देखो। संवेग पहले और बाद में हमेशा बराबर रहता है। गतिज ऊर्जा तभी बराबर रहती है जब टक्कर **प्रत्यास्थ** हो।",
              },
              style: "body",
            },
          },
          { id: 4, name: "track", kind: "prop", prop: "collision", with: {} },
        ],
      },
      is: [],
      when: [],
      studentOnly: [],
      nextPieceId: 5,
    },
  ],
};
