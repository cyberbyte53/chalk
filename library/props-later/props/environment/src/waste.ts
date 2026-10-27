import type { Words } from "./draw";

/**
 * Household waste for Activities 15.5 and 15.7: what each thing is, whether bacteria and fungi can
 * break it down (biodegradable), and, if so, roughly how many days buried in moist soil it takes to
 * be gone. Days are illustrative; what matters is the order (peels fastest, cloth slowest) and that
 * the non-biodegradable things never change.
 */
export const WasteItem = {
  Peels: "peels",
  TeaLeaves: "teaLeaves",
  SpoiltFood: "spoiltFood",
  Leaves: "leaves",
  Paper: "paper",
  Cloth: "cloth",
  MilkPacket: "milkPacket",
  MedicineStrip: "medicineStrip",
  GlassBottle: "glassBottle",
  Slipper: "slipper",
  Wrapper: "wrapper",
  Battery: "battery",
} as const;
export type WasteItem = (typeof WasteItem)[keyof typeof WasteItem];
export const WASTE_ITEMS = Object.values(WasteItem) as readonly WasteItem[];

/** Days in moist soil until it is gone; null = never (non-biodegradable). */
export const ROT_DAYS: Readonly<Record<WasteItem, number | null>> = {
  peels: 15,
  teaLeaves: 15,
  spoiltFood: 15,
  leaves: 30,
  paper: 45,
  cloth: 60,
  milkPacket: null,
  medicineStrip: null,
  glassBottle: null,
  slipper: null,
  wrapper: null,
  battery: null,
};

export const isBiodegradable = (item: WasteItem): boolean => ROT_DAYS[item] !== null;

/** How much of it is left after `days` buried: 1 = untouched, 0 = gone. */
export function leftAfter(item: WasteItem, days: number): number {
  const d = ROT_DAYS[item];
  if (d === null) return 1;
  return Math.max(0, 1 - days / d);
}

/** Short names, to fit under a drawing. */
export const WASTE_WORDS: Readonly<Record<WasteItem, Words>> = {
  peels: { en: "peels", hi: "छिलके" },
  teaLeaves: { en: "tea leaves", hi: "चायपत्ती" },
  spoiltFood: { en: "spoilt food", hi: "खराब खाना" },
  leaves: { en: "dry leaves", hi: "सूखी पत्तियाँ" },
  paper: { en: "paper", hi: "कागज़" },
  cloth: { en: "cotton cloth", hi: "सूती कपड़ा" },
  milkPacket: { en: "milk packet", hi: "दूध की थैली" },
  medicineStrip: { en: "medicine strip", hi: "दवा की पत्ती" },
  glassBottle: { en: "glass bottle", hi: "काँच की बोतल" },
  slipper: { en: "old slipper", hi: "पुरानी चप्पल" },
  wrapper: { en: "chips wrapper", hi: "चिप्स रैपर" },
  battery: { en: "battery", hi: "बैटरी" },
};

const LONG_NAMES: Readonly<Record<WasteItem, string>> = {
  peels: "vegetable peels",
  teaLeaves: "used tea leaves",
  spoiltFood: "spoilt food",
  leaves: "dry leaves",
  paper: "waste paper",
  cloth: "torn cotton cloth",
  milkPacket: "a plastic milk packet",
  medicineStrip: "a medicine strip",
  glassBottle: "a glass bottle",
  slipper: "a broken rubber slipper",
  wrapper: "a chips wrapper",
  battery: "an old battery",
};

/** Plain English names, for descriptions. */
export const nameOfWaste = (item: WasteItem): string => LONG_NAMES[item];
