import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** What the question asks for. */
const Ask = { Behind: "behind", Apart: "apart", AfterStep: "afterStep" } as const;

/**
 * Where the image in a plane mirror is: how far behind the mirror, how far from the object, or how
 * far apart object and image are after the object steps towards the mirror.
 */
export const mirrorImageDistance = family({
  level: Level.Easy,
  tests: [Concept.ReflectionAndImages],
  params: z
    .object({
      /** The object's distance from the mirror, in metres. */
      distance: z.number().min(0.5).max(10),
      ask: z.nativeEnum(Ask),
      /** How far the object steps towards the mirror, in metres (only for `afterStep`). */
      step: z.number().min(0.1).max(5).optional(),
    })
    .strict(),
  build: ({ distance, ask, step }, b) => {
    const m = (v: number) => t(`${v} m`, `${v} मीटर`);
    const after = distance - (step ?? 0);
    const right = ask === Ask.Behind ? distance : ask === Ask.Apart ? 2 * distance : 2 * after;
    const prompt =
      ask === Ask.Behind
        ? t(
            `Riya stands ${distance} m in front of a plane mirror. How far behind the mirror is her image?`,
            `रिया समतल दर्पण के सामने ${distance} मीटर पर खड़ी है। उसका प्रतिबिंब दर्पण के पीछे कितनी दूर है?`,
          )
        : ask === Ask.Apart
          ? t(
              `Riya stands ${distance} m in front of a plane mirror. How far is she from her image?`,
              `रिया समतल दर्पण के सामने ${distance} मीटर पर खड़ी है। वह अपने प्रतिबिंब से कितनी दूर है?`,
            )
          : t(
              `Riya stands ${distance} m in front of a plane mirror, then walks ${step} m towards it. How far is she now from her image?`,
              `रिया समतल दर्पण के सामने ${distance} मीटर पर खड़ी है, फिर ${step} मीटर उसकी ओर चलती है। अब वह अपने प्रतिबिंब से कितनी दूर है?`,
            );
    const options: Option[] = [{ id: "right", label: m(right) }];
    if (ask === Ask.Behind) {
      options.push(
        {
          id: "double",
          label: m(2 * distance),
          feedback: t(
            `${2 * distance} m is her distance from the image. The image sits as far behind the mirror as she is in front: ${distance} m.`,
            `${2 * distance} मीटर उसकी प्रतिबिंब से दूरी है। प्रतिबिंब दर्पण के पीछे उतनी ही दूर है जितनी वह सामने है: ${distance} मीटर।`,
          ),
        },
        {
          id: "half",
          label: m(distance / 2),
          feedback: t(
            "The image is as far behind the mirror as the object is in front, not half as far.",
            "प्रतिबिंब दर्पण के पीछे उतनी ही दूर है जितनी वस्तु सामने है, आधी दूर नहीं।",
          ),
        },
      );
    } else if (ask === Ask.Apart) {
      options.push(
        {
          id: "single",
          label: m(distance),
          feedback: t(
            `${distance} m is her distance from the mirror. The image is another ${distance} m behind it, so she is ${2 * distance} m from the image.`,
            `${distance} मीटर उसकी दर्पण से दूरी है। प्रतिबिंब उसके पीछे और ${distance} मीटर है, इसलिए वह प्रतिबिंब से ${2 * distance} मीटर दूर है।`,
          ),
        },
        {
          id: "half",
          label: m(distance / 2),
          feedback: t(
            "The image is as far behind the mirror as she is in front, so the gap is twice her distance, not half.",
            "प्रतिबिंब दर्पण के पीछे उतनी ही दूर है जितनी वह सामने है, इसलिए दूरी उसकी दूरी की दोगुनी है, आधी नहीं।",
          ),
        },
      );
    } else {
      options.push(
        {
          id: "once",
          label: m(2 * distance - (step ?? 0)),
          feedback: t(
            `When she walks ${step} m closer, her image also comes ${step} m closer, so the gap shrinks by ${2 * (step ?? 0)} m, not ${step} m.`,
            `जब वह ${step} मीटर पास आती है, उसका प्रतिबिंब भी ${step} मीटर पास आता है, इसलिए दूरी ${2 * (step ?? 0)} मीटर घटती है, ${step} मीटर नहीं।`,
          ),
        },
        {
          id: "single",
          label: m(after),
          feedback: t(
            `${after} m is her new distance from the mirror. The image is the same distance behind it, so she is ${2 * after} m from the image.`,
            `${after} मीटर अब उसकी दर्पण से दूरी है। प्रतिबिंब उतनी ही दूरी पर पीछे है, इसलिए वह प्रतिबिंब से ${2 * after} मीटर दूर है।`,
          ),
        },
      );
    }
    const ask1 = choiceQuestion(b, {
      prompt,
      options: settle(options, Math.round(distance * 10) + 3),
      answer: "right",
    });
    return column([ask1, space()]);
  },
});
