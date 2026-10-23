import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { Concept } from "../../concepts.gen";
import { type Fact, askFact, factParams } from "../../kit";

const parts = {
  cornea: t("The cornea", "कॉर्निया"),
  iris: t("The iris muscle", "परितारिका की पेशी"),
  pupil: t("The pupil", "पुतली"),
  lens: t("The eye lens", "नेत्र लेंस"),
  retina: t("The retina", "दृष्टिपटल"),
  nerve: t("The optic nerve", "दृक् तंत्रिका"),
};

const wrongPart = (part: keyof typeof parts, job: { en: string; hi: string }) => ({
  label: parts[part],
  feedback: t(`${parts[part].en} ${job.en}`, `${parts[part].hi} ${job.hi}`),
});

const jobs = {
  cornea: {
    en: "is the clear front bulge; it does most of the bending.",
    hi: "आगे का पारदर्शी उभार है; यह सबसे ज़्यादा मोड़ता है।",
  },
  iris: {
    en: "is the coloured ring that sets the size of the pupil.",
    hi: "वह रंगीन छल्ला है जो पुतली का आकार तय करता है।",
  },
  pupil: { en: "is the hole that lets light in.", hi: "वह छेद है जो प्रकाश को अंदर आने देता है।" },
  lens: { en: "makes the fine adjustment of focus.", hi: "फ़ोकस का बारीक समायोजन करता है।" },
  retina: {
    en: "is the screen at the back, with light-sensitive cells.",
    hi: "पीछे का पर्दा है, प्रकाश-सुग्राही कोशिकाओं वाला।",
  },
  nerve: { en: "carries the signals to the brain.", hi: "संकेतों को मस्तिष्क तक ले जाती है।" },
};

const facts = {
  mostBending: {
    prompt: t(
      "Which part of the eye does most of the bending of light?",
      "आँख का कौन-सा हिस्सा प्रकाश का सबसे ज़्यादा मोड़ करता है?",
    ),
    right: parts.cornea,
    wrong: [wrongPart("lens", jobs.lens), wrongPart("pupil", jobs.pupil)],
  },
  controlsLight: {
    prompt: t(
      "Which part controls how much light enters the eye, by changing the size of the pupil?",
      "कौन-सा हिस्सा पुतली का आकार बदलकर तय करता है कि आँख में कितना प्रकाश जाए?",
    ),
    right: parts.iris,
    wrong: [wrongPart("cornea", jobs.cornea), wrongPart("retina", jobs.retina)],
  },
  hole: {
    prompt: t(
      "Through which opening does light pass into the eye lens?",
      "प्रकाश किस छेद से होकर नेत्र लेंस तक जाता है?",
    ),
    right: parts.pupil,
    wrong: [wrongPart("iris", jobs.iris), wrongPart("nerve", jobs.nerve)],
  },
  fineFocus: {
    prompt: t(
      "Which part makes the fine adjustment that focuses objects at different distances?",
      "कौन-सा हिस्सा वह बारीक समायोजन करता है जिससे अलग-अलग दूरी की वस्तुएँ फ़ोकस होती हैं?",
    ),
    right: parts.lens,
    wrong: [wrongPart("cornea", jobs.cornea), wrongPart("iris", jobs.iris)],
  },
  screen: {
    prompt: t(
      "Which part is the light-sensitive screen where the image forms?",
      "कौन-सा हिस्सा वह प्रकाश-सुग्राही पर्दा है जिस पर प्रतिबिंब बनता है?",
    ),
    right: parts.retina,
    wrong: [
      wrongPart("lens", jobs.lens),
      wrongPart("pupil", jobs.pupil),
      wrongPart("cornea", jobs.cornea),
    ],
  },
  toBrain: {
    prompt: t(
      "Which part carries the electrical signals from the eye to the brain?",
      "कौन-सा हिस्सा आँख से विद्युत संकेत मस्तिष्क तक ले जाता है?",
    ),
    right: parts.nerve,
    wrong: [wrongPart("retina", jobs.retina), wrongPart("iris", jobs.iris)],
  },
} satisfies Record<string, Fact>;

/** Which part of the eye does each job (NCERT 11.1, Exercise 2). */
export const eyePartJob = family({
  level: Level.Easy,
  tests: [Concept.TheHumanEye],
  params: factParams(facts),
  build: ({ item }, b) => askFact(b, facts[item], item),
});
