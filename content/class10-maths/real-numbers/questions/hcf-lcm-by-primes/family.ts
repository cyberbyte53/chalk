import { family, t } from "@chalk/author";
import { Level } from "@chalk/content";
import { type Option, choice, primesTex } from "@chalk/patterns";
import { gcd, lcm } from "@chalk/prop-primes";
import { z } from "zod";
import { Concept } from "../../concepts.gen";

const r = String.raw;
const Ask = { Hcf: "hcf", Lcm: "lcm" } as const;

/** HCF or LCM of two or three numbers by prime factorisation (NCERT Ex 1.2 Q2, Q3). */
export const hcfLcmByPrimes = family({
  level: Level.Easy,
  tests: [Concept.HcfAndLcm],
  params: z
    .object({
      /** The numbers, comma separated: "12,15,21". */
      numbers: z.string().regex(/^\d+(,\d+){1,2}$/),
      ask: z.nativeEnum(Ask),
    })
    .strict(),
  build: ({ numbers, ask }, b) => {
    const ns = numbers.split(",").map(Number);
    const h = ns.reduce((g, n) => gcd(g, n));
    const l = ns.reduce((m, n) => lcm(m, n));
    const product = ns.reduce((p, n) => p * n, 1);
    const head = ns.slice(0, -1).join(", ");
    const list = `${head} and ${ns.at(-1)}`;
    const listHi = `${head} और ${ns.at(-1)}`;
    // The factorisations as display maths, one per line; a prime is said in words, not as "17 = 17".
    const isPrime = (n: number) => primesTex(n) === `${n}`;
    const composite = ns.filter((n) => !isPrime(n));
    const primes = ns.filter(isPrime);
    const lines =
      composite.length === 0
        ? ""
        : `$$\\begin{aligned} ${composite.map((n) => `${n} &= ${primesTex(n)}`).join(" \\\\ ")} \\end{aligned}$$`;
    const primeWords =
      primes.length === 0
        ? { en: "", hi: "" }
        : primes.length === ns.length
          ? ns.length === 2
            ? { en: " Both are prime.", hi: " दोनों अभाज्य हैं।" }
            : { en: " All three are prime.", hi: " तीनों अभाज्य हैं।" }
          : primes.length === 1
            ? { en: ` ${primes[0]} is prime.`, hi: ` ${primes[0]} अभाज्य है।` }
            : {
                en: ` ${primes.slice(0, -1).join(", ")} and ${primes.at(-1)} are prime.`,
                hi: ` ${primes.slice(0, -1).join(", ")} और ${primes.at(-1)} अभाज्य हैं।`,
              };
    const factored = { en: `${lines}${primeWords.en}`, hi: `${lines}${primeWords.hi}` };
    const isHcf = ask === Ask.Hcf;
    const right = isHcf ? h : l;
    const options: Option[] = [];
    const used = new Set([right]);
    const offer = (id: string, value: number, en: string, hi: string) => {
      if (used.has(value)) return;
      used.add(value);
      options.push({ id, label: t(`${value}`, `${value}`), feedback: t(en, hi) });
    };
    if (isHcf) {
      offer(
        "lcm",
        l,
        r`That is the LCM: it takes the largest power of every prime. The HCF takes the smallest power of the primes **common** to all.`,
        r`यह LCM है: इसमें हर अभाज्य की सबसे बड़ी घात आती है। HCF में **सभी में साझा** अभाज्यों की सबसे छोटी घात आती है।`,
      );
      offer(
        "one",
        1,
        `Look again for a prime that every number has: ${factored.en}`,
        `फिर देखो, कोई ऐसा अभाज्य जो हर संख्या में हो: ${factored.hi}`,
      );
      offer(
        "double",
        h * 2,
        r`${h * 2} doesn't divide every number. Take the **smallest** power of each common prime.`,
        r`${h * 2} हर संख्या को विभाजित नहीं करता। हर साझा अभाज्य की **सबसे छोटी** घात लो।`,
      );
    } else {
      offer(
        "hcf",
        h,
        r`That is the HCF. The LCM must be a multiple of every number: take the largest power of **every** prime.`,
        r`यह HCF है। LCM को हर संख्या का गुणज होना चाहिए: **हर** अभाज्य की सबसे बड़ी घात लो।`,
      );
      offer(
        "product",
        product,
        r`The product is a common multiple, but not the lowest: a prime they share gets counted twice.`,
        r`गुणनफल एक साझा गुणज है, पर सबसे छोटा नहीं: साझा अभाज्य दो बार गिन लिया गया।`,
      );
      if (l % 2 === 0) {
        offer(
          "half",
          l / 2,
          r`${l / 2} is not a multiple of every number. Take the **largest** power of each prime.`,
          r`${l / 2} हर संख्या का गुणज नहीं है। हर अभाज्य की **सबसे बड़ी** घात लो।`,
        );
      } else {
        // No prime in common (the LCM is the product): offer twice the LCM, a multiple but not the lowest.
        offer(
          "twice",
          l * 2,
          r`${l * 2} is a common multiple, but not the lowest: it has a 2 that none of them needs.`,
          r`${l * 2} एक साझा गुणज है, पर सबसे छोटा नहीं: इसमें एक 2 है जो किसी को नहीं चाहिए।`,
        );
      }
    }
    const question = choice(b, {
      prompt: isHcf
        ? t(
            r`Find the HCF of ${list} by prime factorisation. ${factored.en}`,
            r`अभाज्य गुणनखंडन से ${listHi} का HCF ज्ञात करो। ${factored.hi}`,
          )
        : t(
            r`Find the LCM of ${list} by prime factorisation. ${factored.en}`,
            r`अभाज्य गुणनखंडन से ${listHi} का LCM ज्ञात करो। ${factored.hi}`,
          ),
      right: t(`${right}`, `${right}`),
      wrong: Object.fromEntries(options.map(({ id, ...o }) => [id, o])),
    });
    return [question];
  },
});
