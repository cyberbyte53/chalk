/** Devanagari, the script Hindi is written in: one test for every tool that asks "is this Hindi?". */
export const DEVANAGARI = /[\u0900-\u097F]/u;

/** Whether a text holds any Hindi. */
export const hasHindi = (text: string): boolean => DEVANAGARI.test(text);
