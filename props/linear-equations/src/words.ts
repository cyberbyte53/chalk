/** Words a prop shows itself, in both languages. */
export type Words = { readonly en: string; readonly hi: string };

export const say = (locale: string, w: Words): string => (locale === "hi" ? w.hi : w.en);

/** Fill {name} slots in both languages. */
export function fill(w: Words, slots: Record<string, string>): Words {
  const put = (text: string) => text.replace(/\{(\w+)\}/g, (_, k: string) => slots[k] ?? `{${k}}`);
  return { en: put(w.en), hi: put(w.hi) };
}

export const WORDS = {
  intersecting: { en: "Intersecting lines", hi: "प्रतिच्छेदी रेखाएँ" },
  parallel: { en: "Parallel lines", hi: "समांतर रेखाएँ" },
  coincident: { en: "Coincident lines", hi: "संपाती रेखाएँ" },
  unique: { en: "exactly one solution", hi: "ठीक एक हल" },
  none: { en: "no solution", hi: "कोई हल नहीं" },
  infinitelyMany: { en: "infinitely many solutions", hi: "अपरिमित रूप से अनेक हल" },
  consistent: { en: "consistent", hi: "संगत" },
  inconsistent: { en: "inconsistent", hi: "असंगत" },
  dependent: { en: "dependent (consistent)", hi: "आश्रित (संगत)" },
  meet: { en: "They meet at", hi: "ये यहाँ मिलती हैं:" },
  everyPoint: { en: "Every point on the line is on both.", hi: "रेखा का हर बिंदु दोनों पर है।" },
  neverMeet: { en: "They never meet.", hi: "ये कभी नहीं मिलतीं।" },
  onLine: { en: "on line {n}", hi: "रेखा {n} पर" },
  notOnLine: { en: "not on line {n}", hi: "रेखा {n} पर नहीं" },
  probe: { en: "Point", hi: "बिंदु" },
  table: { en: "Two solutions of ({n})", hi: "({n}) के दो हल" },
  ratios: { en: "Compare the ratios", hi: "अनुपातों की तुलना करो" },
  more: { en: "more", hi: "बढ़ाओ" },
  less: { en: "less", hi: "घटाओ" },
  next: { en: "next", hi: "आगे" },
  again: { en: "start again", hi: "फिर से" },
  done: { en: "Done", hi: "हो गया" },
  triangle: { en: "Triangle", hi: "त्रिभुज" },
  dragHint: { en: "Drag the dots to move a line.", hi: "रेखा खिसकाने के लिए बिंदुओं को खींचो।" },
  isolatePrompt: {
    en: "Which variable will you write in terms of the other?",
    hi: "किस चर को दूसरे के पदों में लिखोगे?",
  },
  eliminatePrompt: { en: "Which variable will you remove?", hi: "कौन-सा चर हटाओगे?" },
  isolateChoice: { en: "{v} from ({n})", hi: "({n}) से {v}" },
  eliminateChoice: { en: "remove {v}", hi: "{v} हटाओ" },
} as const satisfies Record<string, Words>;

/** 0, 1, …, n − 1. */
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
