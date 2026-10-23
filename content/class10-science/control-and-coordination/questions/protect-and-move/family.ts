import { column, family, space, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choiceQuestion, settle } from "@chalk/patterns";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const Case = {
  Skull: "skull",
  Backbone: "backbone",
  Shorten: "shorten",
  VoluntaryMuscle: "voluntaryMuscle",
} as const;
type Case = (typeof Case)[keyof typeof Case];

type L = { en: string; hi: string };
const cases: Record<Case, { q: L; right: L; wrong: [L, L]; why: L }> = {
  skull: {
    q: { en: "What protects the brain?", hi: "मस्तिष्क की रक्षा कौन करता है?" },
    right: {
      en: "The skull, and a fluid-filled balloon inside it",
      hi: "खोपड़ी, और उसके भीतर द्रव भरा गुब्बारा",
    },
    wrong: [
      {
        en: "The vertebral column, which runs up into the head",
        hi: "कशेरुक दंड, जो सिर तक ऊपर जाता है",
      },
      { en: "The thick muscles of the face and the neck", hi: "चेहरे और गर्दन की मोटी पेशियाँ" },
    ],
    why: {
      en: "The skull is a bony box, and the fluid absorbs shocks. The vertebral column protects the spinal cord.",
      hi: "खोपड़ी हड्डियों का डिब्बा है, और द्रव झटके सोखता है। कशेरुक दंड मेरुरज्जु की रक्षा करता है।",
    },
  },
  backbone: {
    q: { en: "The spinal cord is protected by the…", hi: "मेरुरज्जु की रक्षा करता है…" },
    right: { en: "vertebral column", hi: "कशेरुक दंड" },
    wrong: [
      { en: "bones of the skull", hi: "खोपड़ी की हड्डियों" },
      { en: "rib cage", hi: "पसलियों के पिंजरे" },
    ],
    why: {
      en: "The hard, bumpy backbone down the middle of the back protects the spinal cord.",
      hi: "पीठ के बीच की सख़्त, उभरी हुई रीढ़ मेरुरज्जु की रक्षा करती है।",
    },
  },
  shorten: {
    q: {
      en: "How does a muscle cell move when a nerve impulse reaches it?",
      hi: "तंत्रिका आवेग पहुँचने पर पेशी कोशिका कैसे गति करती है?",
    },
    right: {
      en: "Special proteins rearrange, making the cell shorter",
      hi: "विशेष प्रोटीन पुनर्व्यवस्थित होकर कोशिका छोटी करते हैं",
    },
    wrong: [
      {
        en: "It loses water and shrinks, like a plant cell",
        hi: "यह पादप कोशिका की तरह पानी खोकर सिकुड़ती है",
      },
      {
        en: "It grows longer in one direction, pushing the bone",
        hi: "यह एक दिशा में लंबी होकर हड्डी को धकेलती है",
      },
    ],
    why: {
      en: "Animal muscle cells shorten when their special proteins rearrange; plant cells change shape with water instead.",
      hi: "जंतुओं की पेशी कोशिकाएँ ख़ास प्रोटीनों की व्यवस्था बदलने पर छोटी होती हैं; पादप कोशिकाएँ इसकी जगह पानी से आकार बदलती हैं।",
    },
  },
  voluntaryMuscle: {
    q: {
      en: "Which muscles move when we decide to move them?",
      hi: "कौन सी पेशियाँ तब हिलती हैं जब हम उन्हें हिलाने का निर्णय लेते हैं?",
    },
    right: { en: "Voluntary muscles, like those of the legs", hi: "ऐच्छिक पेशियाँ, जैसे पैरों की" },
    wrong: [
      { en: "Involuntary muscles, like those of the gut", hi: "अनैच्छिक पेशियाँ, जैसे आहार नाल की" },
      { en: "The heart muscle", hi: "हृदय की पेशी" },
    ],
    why: {
      en: "The fore-brain's motor areas control voluntary muscles such as the leg muscles.",
      hi: "अग्रमस्तिष्क के प्रेरक क्षेत्र पैर की पेशियों जैसी ऐच्छिक पेशियों को नियंत्रित करते हैं।",
    },
  },
};

/** NCERT 7.1.3–7.1.4: protecting the nervous system; how muscles move. */
export const protectAndMove = family({
  level: Level.Easy,
  tests: [Concept.BrainAndAction],
  params: z.object({ case: z.nativeEnum(Case) }).strict(),
  build: ({ case: c }, b) => {
    const k = cases[c];
    const options: Option[] = [
      { id: "right", label: t(k.right.en, k.right.hi) },
      ...k.wrong.map((w, i) => ({ id: `w${i}`, label: t(w.en, w.hi), feedback: k.why })),
    ];
    const ask = choiceQuestion(b, {
      prompt: t(k.q.en, k.q.hi),
      options: settle(options, c.length * 7 + 3),
      answer: "right",
    });
    return column([ask, space()]);
  },
});
