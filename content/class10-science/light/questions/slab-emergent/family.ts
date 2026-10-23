import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/content-source/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

/** Crown glass, NCERT Table 10.3. */
const GLASS = 1.52;

/** The angle of refraction inside the slab, whole degrees. */
function insideAngle(i: number): number {
  return Math.round((Math.asin(Math.sin((i * Math.PI) / 180) / GLASS) * 180) / Math.PI);
}

/** NCERT Activity 10.10: the emergent ray of a rectangular glass slab is parallel to the incident ray. */
export const slabEmergent = family({
  level: Level.Medium,
  tests: [Concept.Refraction],
  params: z.object({ incidence: z.number().int().min(0).max(80) }).strict(),
  build: ({ incidence }, b) => {
    const r = insideAngle(incidence);
    const options: Option[] =
      incidence === 0
        ? [
            {
              id: "right",
              label: t(
                "Straight through, without bending or shifting",
                "बिना मुड़े या खिसके सीधी आर-पार",
              ),
            },
            {
              id: "shift",
              label: t("Parallel to itself, shifted sideways", "अपने समानांतर, बग़ल में खिसकी हुई"),
              feedback: t(
                "Along the normal there is no bending at either face, so there is nothing to shift it.",
                "अभिलंब के साथ किसी भी सतह पर मोड़ नहीं होता, इसलिए उसे खिसकाने वाला कुछ नहीं।",
              ),
            },
            {
              id: "bent",
              label: t("Bent towards the normal", "अभिलंब की ओर मुड़ी हुई"),
              feedback: t(
                "A ray along the normal has i = 0, so r = 0: it doesn't bend.",
                "अभिलंब के साथ आई किरण का i = 0 है, इसलिए r = 0: वह नहीं मुड़ती।",
              ),
            },
          ]
        : [
            {
              id: "right",
              label: t(
                `At ${incidence}°, parallel to the incident ray but shifted sideways`,
                `${incidence}° पर, आपतित किरण के समानांतर पर बग़ल में खिसकी हुई`,
              ),
            },
            {
              id: "inside",
              label: t(`At ${r}°, the angle inside the glass`, `${r}° पर, जो काँच के अंदर का कोण है`),
              feedback: t(
                `${r}° is the angle of refraction inside the glass. Coming out, the ray bends away from the normal by just as much as it bent going in.`,
                `${r}° काँच के अंदर का अपवर्तन कोण है। निकलते समय किरण अभिलंब से उतनी ही दूर मुड़ती है जितनी अंदर जाते समय उसकी ओर मुड़ी थी।`,
              ),
            },
            {
              id: "line",
              label: t(
                `At ${incidence}°, on the same straight line as the incident ray`,
                `${incidence}° पर, आपतित किरण की ही सीधी रेखा पर`,
              ),
              feedback: t(
                "Inside the glass the ray travels at a different slant, so when it comes out it is shifted sideways from the original line.",
                "काँच के अंदर किरण अलग तिरछेपन से चलती है, इसलिए बाहर निकलने पर वह मूल रेखा से बग़ल में खिसकी होती है।",
              ),
            },
          ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `A ray of light strikes a rectangular glass slab at an angle of incidence of ${incidence}°. How does the emergent ray leave the other face?`,
        `प्रकाश की एक किरण काँच के आयताकार गुटके पर ${incidence}° के आपतन कोण पर पड़ती है। निर्गत किरण दूसरी सतह से कैसे निकलती है?`,
      ),
      options: settle(options, incidence * 5 + 2),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
