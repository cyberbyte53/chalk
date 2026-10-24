/**
 * Loaded before anything else (`tsx --import`), so every import the build makes, the builder's own
 * included, is recorded: see deps.ts.
 */
import { recordImports } from "./deps";

recordImports();
