import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Ask = { Germ: "germ", Zygote: "zygote" } as const;

/** 9.2.3: a body cell has n pairs; a germ cell has one of each pair; the zygote has pairs again. */
export const germCellChromosomes = family({
  level: Level.Easy,
  tests: [Concept.HowTraitsAreExpressed],
  params: z
    .object({
      body: z.number().int().min(4).max(78).multipleOf(2),
      ask: z.nativeEnum(Ask),
      who: z.enum(["animal", "plant", "human"]),
    })
    .strict(),
  build: ({ body, ask, who }, b) => {
    const half = body / 2;
    const name = {
      animal: { en: "an animal", hi: "किसी जंतु" },
      plant: { en: "a plant", hi: "किसी पौधे" },
      human: { en: "a human being", hi: "मनुष्य" },
    }[who];
    const options: Option[] =
      ask === Ask.Germ
        ? [
            { id: "right", label: t(`${half}`, `${half}`) },
            {
              id: "same",
              label: t(`${body}`, `${body}`),
              feedback: t(
                `If germ cells kept all ${body}, the zygote would have ${2 * body} and the number would double every generation. A germ cell has one of each pair: ${half}.`,
                `अगर जनन कोशिकाएँ सारे ${body} रखतीं, तो युग्मनज में ${2 * body} होते और संख्या हर पीढ़ी दुगुनी होती। जनन कोशिका में हर जोड़ी से एक होता है: ${half}।`,
              ),
            },
            {
              id: "pair",
              label: t("2", "2"),
              feedback: t(
                `A germ cell takes one chromosome from every pair, not just one pair. ${body} chromosomes is ${half} pairs: ${half}.`,
                `जनन कोशिका हर जोड़ी से एक गुणसूत्र लेती है, केवल एक जोड़ी नहीं। ${body} गुणसूत्र यानी ${half} जोड़ियाँ: ${half}।`,
              ),
            },
          ]
        : [
            { id: "right", label: t(`${body}`, `${body}`) },
            {
              id: "half",
              label: t(`${half}`, `${half}`),
              feedback: t(
                `${half} is in each germ cell. The zygote is made of two germ cells, so it has pairs again: ${body}.`,
                `${half} हर जनन कोशिका में हैं। युग्मनज दो जनन कोशिकाओं से बनता है, इसलिए उसमें फिर जोड़ियाँ हैं: ${body}।`,
              ),
            },
            {
              id: "double",
              label: t(`${2 * body}`, `${2 * body}`),
              feedback: t(
                `Each germ cell brings only ${half}, not ${body}. Together: ${body}, so the species' number stays the same.`,
                `हर जनन कोशिका केवल ${half} लाती है, ${body} नहीं। मिलकर: ${body}, इसलिए स्पीशीज़ की संख्या वही रहती है।`,
              ),
            },
          ];
    const q =
      ask === Ask.Germ
        ? t(
            `A body cell of ${name.en} has ${body} chromosomes. How many chromosomes are in each of its germ cells?`,
            `${name.hi} की शरीर कोशिका में ${body} गुणसूत्र हैं। उसकी हर जनन कोशिका में कितने गुणसूत्र हैं?`,
          )
        : t(
            `Each germ cell of ${name.en} has ${half} chromosomes. How many does the zygote formed at fertilisation have?`,
            `${name.hi} की हर जनन कोशिका में ${half} गुणसूत्र हैं। निषेचन से बने युग्मनज में कितने हैं?`,
          );
    const ask1 = choiceQuestion(b, {
      prompt: q,
      options: settle(options, body * 3 + ask.length),
      answer: "right",
    });
    return column([ask1, space()]);
  },
});
