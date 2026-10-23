import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Ray = { Parallel: "parallel", Focal: "focal", Centre: "centre", Pole: "pole" } as const;
type Ray = (typeof Ray)[keyof typeof Ray];
type Kind = "concave" | "convex";

/** How each standard ray is described, for each kind of mirror. */
const incoming: Record<Kind, Record<Ray, { en: string; hi: string }>> = {
  concave: {
    parallel: { en: "parallel to the principal axis", hi: "मुख्य अक्ष के समानांतर" },
    focal: { en: "passing through the principal focus F", hi: "मुख्य फोकस F से होकर" },
    centre: { en: "passing through the centre of curvature C", hi: "वक्रता केंद्र C से होकर" },
    pole: { en: "slanting to the axis, to the pole P", hi: "अक्ष से तिरछी, ध्रुव P पर" },
  },
  convex: {
    parallel: { en: "parallel to the principal axis", hi: "मुख्य अक्ष के समानांतर" },
    focal: { en: "heading towards F behind the mirror", hi: "दर्पण के पीछे F की ओर जाती" },
    centre: { en: "heading towards C behind the mirror", hi: "दर्पण के पीछे C की ओर जाती" },
    pole: { en: "slanting to the axis, to the pole P", hi: "अक्ष से तिरछी, ध्रुव P पर" },
  },
};

/** What each ray does after reflection. */
const outgoing: Record<Kind, Record<Ray, { en: string; hi: string }>> = {
  concave: {
    parallel: { en: "passes through F", hi: "F से होकर जाती है" },
    focal: { en: "comes out parallel to the axis", hi: "अक्ष के समानांतर निकलती है" },
    centre: { en: "comes straight back along its path", hi: "उसी रास्ते सीधी लौटती है" },
    pole: {
      en: "reflects at the same angle on the other side of the axis",
      hi: "अक्ष के दूसरी ओर उतने ही कोण पर परावर्तित होती है",
    },
  },
  convex: {
    parallel: { en: "seems to come from F behind the mirror", hi: "दर्पण के पीछे F से आती हुई लगती है" },
    focal: { en: "comes out parallel to the axis", hi: "अक्ष के समानांतर निकलती है" },
    centre: { en: "comes straight back along its path", hi: "उसी रास्ते सीधी लौटती है" },
    pole: {
      en: "reflects at the same angle on the other side of the axis",
      hi: "अक्ष के दूसरी ओर उतने ही कोण पर परावर्तित होती है",
    },
  },
};

/** Why the right answer holds: each rule is the law of reflection at the point it hits. */
const reason: Record<Ray, { en: string; hi: string }> = {
  parallel: {
    en: "F is defined as the point where rays parallel to the axis meet, or seem to come from.",
    hi: "F की परिभाषा ही यह है: वह बिंदु जहाँ अक्ष के समानांतर किरणें मिलती हैं, या जहाँ से आती हुई लगती हैं।",
  },
  focal: {
    en: "This is the parallel ray run backwards: light can retrace its path.",
    hi: "यह समानांतर किरण उल्टी है: प्रकाश अपना रास्ता उल्टा चल सकता है।",
  },
  centre: {
    en: "A line from C to the mirror is the normal there, so i = 0 and r = 0.",
    hi: "C से दर्पण तक की रेखा वहाँ अभिलंब है, इसलिए i = 0 और r = 0।",
  },
  pole: {
    en: "The principal axis is the normal at P, so the angles with the axis are i and r, which are equal.",
    hi: "मुख्य अक्ष P पर अभिलंब है, इसलिए अक्ष से बने कोण ही i और r हैं, जो बराबर हैं।",
  },
};

/** Which way one of the four standard rays goes after a concave or convex mirror. */
export const rayAfterMirror = family({
  level: Level.Easy,
  tests: [Concept.MirrorRayRules],
  params: z.object({ kind: z.enum(["concave", "convex"]), ray: z.nativeEnum(Ray) }).strict(),
  build: ({ kind, ray }, b) => {
    const mirror = kind === "concave" ? t("concave", "अवतल") : t("convex", "उत्तल");
    const others = (Object.values(Ray) as Ray[])
      .filter((r) => r !== ray && r !== Ray.Pole)
      .slice(0, 2);
    const wrong = ray === Ray.Pole ? [Ray.Centre, Ray.Focal] : others;
    const options: Option[] = [
      { id: "right", label: t(outgoing[kind][ray].en, outgoing[kind][ray].hi) },
      ...wrong.map((r) => ({
        id: r,
        label: t(outgoing[kind][r].en, outgoing[kind][r].hi),
        feedback: t(
          `That's what a ray ${incoming[kind][r].en} does. ${reason[ray].en}`,
          `यह ${incoming[kind][r].hi} आती किरण करती है। ${reason[ray].hi}`,
        ),
      })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(
        `A ray ${incoming[kind][ray].en} falls on a ${mirror.en} mirror. After reflection it…`,
        `${incoming[kind][ray].hi} एक किरण ${mirror.hi} दर्पण पर पड़ती है। परावर्तन के बाद वह…`,
      ),
      options: settle(options, (kind === "concave" ? 3 : 7) + ray.length * 11),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
