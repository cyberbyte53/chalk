import { family, noParams, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choiceQuestion } from "@chalk/patterns";
import { Concept } from "../../concepts.gen";

/** NCERT Ex 3.1 Q1, in the book's words: describing a lamp's place takes two distances from two edges. */
export const tableLamp = family({
  level: Level.Easy,
  tests: [Concept.TwoNumbersForAPlace],
  params: noParams,
  build: (_, b) => {
    const ask = choiceQuestion(b, {
      prompt: t(
        "How will you describe the position of a table lamp on your study table to another person?",
        "आप अपनी पढ़ाई की मेज़ पर रखे टेबल लैंप की स्थिति किसी अन्य व्यक्ति को कैसे बताएँगे?",
      ),
      options: [
        {
          id: "two",
          label: t(
            "Its distance from the left edge of the table and its distance from the front edge",
            "मेज़ के बाएँ किनारे से उसकी दूरी और आगे के किनारे से उसकी दूरी",
          ),
        },
        {
          id: "facing",
          label: t(
            "Its distance from the left edge of the table and its distance from the right edge",
            "मेज़ के बाएँ किनारे से उसकी दूरी और दाएँ किनारे से उसकी दूरी",
          ),
        },
        {
          id: "one",
          label: t("Its distance from the left edge of the table", "मेज़ के बाएँ किनारे से उसकी दूरी"),
        },
        {
          id: "side",
          label: t(
            "Which side of the table it is on, and that it is near the back",
            "वह मेज़ की किस तरफ़ है, और यह कि वह पीछे की ओर है",
          ),
        },
      ],
      answer: "two",
    });
    return [ask];
  },
});
