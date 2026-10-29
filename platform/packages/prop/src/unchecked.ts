/**
 * The one place a type is deliberately unchecked. TypeScript can't say "a prop (or layer) of some
 * state, which one isn't known here": a host's list of layers, a group's children, a test that
 * breaks a lesson's data on purpose. Those name this type, so every such place is findable, and the
 * linter's ban on `any` holds everywhere else (biome.json turns it off for this file only).
 */
export type Unchecked = any;
