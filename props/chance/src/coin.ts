import { actionsFor, defineProp, set } from "@chalk/prop";
import { z } from "zod";
import { nextRandom } from "./random";

export const Face = { Heads: "heads", Tails: "tails" } as const;
export type Face = (typeof Face)[keyof typeof Face];

export const CoinSignal = { Landed: "landed" } as const;

const coinState = z
  .object({
    heads: z.number().int().min(0),
    tails: z.number().int().min(0),
    /** The face it last landed on, or null before the first toss. */
    last: z.nativeEnum(Face).nullable(),
    /** Where the random sequence is. Same seed, same tosses. */
    seed: z.number().int().min(0),
  })
  .strict();
export type CoinState = z.infer<typeof coinState>;

const act = actionsFor<CoinState>();

/** A fair coin. It knows chance and counting, nothing about any lesson. */
export const coin = defineProp({
  type: "coin",
  describe: "A fair coin that counts its heads and tails.",
  state: coinState,
  defaults: { heads: 0, tails: 0, last: null, seed: 1 },
  derived: {
    count: { describe: "Tosses so far", compute: (s) => s.heads + s.tails },
    headsFraction: {
      describe: "Heads as a fraction of tosses (0 before any toss)",
      compute: (s) => (s.heads + s.tails === 0 ? 0 : s.heads / (s.heads + s.tails)),
    },
  },
  actions: {
    toss: act({
      describe: "Toss it once",
      byLearner: true,
      args: z.object({}).strict(),
      run: (s) => {
        const { value, seed } = nextRandom(s.seed);
        const face = value < 0.5 ? Face.Heads : Face.Tails;
        return set(
          {
            seed,
            last: face,
            heads: s.heads + (face === Face.Heads ? 1 : 0),
            tails: s.tails + (face === Face.Tails ? 1 : 0),
          },
          { signal: CoinSignal.Landed, payload: { face } },
        );
      },
    }),
    reset: act({
      describe: "Forget all tosses (keeps the random sequence going)",
      args: z.object({}).strict(),
      run: () => set({ heads: 0, tails: 0, last: null }),
    }),
  },
  signals: { [CoinSignal.Landed]: { describe: "It landed; `face` says which way up" } },
  parts: (s) => (s.last === null ? ["coin"] : ["coin", "face"]),
});
