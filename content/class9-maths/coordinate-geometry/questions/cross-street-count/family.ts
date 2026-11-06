import { family, noParams, scene, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { choice } from "@chalk/patterns";
import { Concept } from "../../concepts.gen";

/** NCERT Ex 3.1 Q2 (Street Plan), in the book's words, both parts together. */
export const crossStreetCount = family({
  level: Level.Medium,
  tests: [Concept.TwoNumbersForAPlace],
  params: noParams,
  build: () => {
    const ask = choice({
      prompt: t(
        "[[(Street Plan):|Street plan.]] A city has two main roads which cross each other at the centre of the city. These two roads are along the North-South direction and East-West direction. All the other streets of the city run parallel to these roads and are 200 [[m|metres]] apart. There are 5 streets in each direction. Using [[1 cm = 200 m|1 centimetre for 200 metres]], draw a model of the city on your notebook. Represent the [[roads/streets|roads and streets]] by single lines. There are many cross-streets in your model. A particular cross-street is made by two streets, one running in the North-South direction and another in the East-West direction. Each cross-street is referred to in the following manner: If the 2nd street running in the North-South direction and 5th in the East-West direction meet at some crossing, then we will call this cross-street (2, 5). Using this convention, find: [[(i)|first,]] how many cross-streets can be referred to as (4, 3); [[(ii)|second,]] how many cross-streets can be referred to as (3, 4).",
        "[[(गली योजना):|गली योजना।]] एक शहर में दो मुख्य सड़कें हैं, जो शहर के केंद्र पर एक-दूसरे को काटती हैं। ये दोनों सड़कें उत्तर-दक्षिण दिशा और पूर्व-पश्चिम दिशा में हैं। शहर की अन्य सभी गलियाँ इन सड़कों के समांतर हैं और 200 [[m|मीटर]] की दूरी पर हैं। हर दिशा में 5 गलियाँ हैं। [[1 cm = 200 m लेकर|1 सेंटीमीटर को 200 मीटर मानकर]] अपनी कॉपी में शहर का एक मॉडल बनाइए। [[सड़कों/गलियों|सड़कों और गलियों]] को एक-एक रेखा से दर्शाइए। आपके मॉडल में कई चौराहे हैं। एक चौराहा दो गलियों से बनता है, एक उत्तर-दक्षिण दिशा में चलने वाली और दूसरी पूर्व-पश्चिम दिशा में। हर चौराहे को इस तरह कहा जाता है: अगर उत्तर-दक्षिण दिशा की दूसरी गली और पूर्व-पश्चिम दिशा की पाँचवीं गली किसी चौराहे पर मिलती हैं, तो इस चौराहे को (2, 5) कहेंगे। इस परिपाटी से ज्ञात कीजिए: [[(i)|पहला,]] कितने चौराहों को (4, 3) कहा जा सकता है; [[(ii)|दूसरा,]] कितने चौराहों को (3, 4) कहा जा सकता है।",
      ),
      options: [
        {
          id: "oneEach",
          label: t("(i) one; (ii) one, a different crossing", "(i) एक; (ii) एक, अलग चौराहा"),
        },
        {
          id: "sameOne",
          label: t("(i) one; (ii) the same one as (i)", "(i) एक; (ii) वही जो (i) में है"),
          feedback: t(
            "(4, 3) is the 4th North-South street with the 3rd East-West one; (3, 4) is the 3rd North-South street with the 4th East-West one. Those are different crossings.",
            "(4, 3) चौथी उत्तर-दक्षिण गली और तीसरी पूर्व-पश्चिम गली है; (3, 4) तीसरी उत्तर-दक्षिण गली और चौथी पूर्व-पश्चिम गली। ये अलग चौराहे हैं।",
          ),
        },
        {
          id: "twoEach",
          label: t("(i) two; (ii) two", "(i) दो; (ii) दो"),
          feedback: t(
            "Two streets cross only once. The 4th North-South street and the 3rd East-West street meet at one crossing.",
            "दो गलियाँ केवल एक बार मिलती हैं। चौथी उत्तर-दक्षिण गली और तीसरी पूर्व-पश्चिम गली एक ही चौराहे पर मिलती हैं।",
          ),
        },
      ],
      answer: "oneEach",
    });
    return scene({ pieces: { ask: ask } });
  },
});
