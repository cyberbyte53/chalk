import { readFileSync, writeFileSync } from "node:fs";
import { generateCss, generateTs } from "./generate";

const here = (file: string): URL => new URL(file, import.meta.url);
const tokens: unknown = JSON.parse(readFileSync(here("./tokens.json"), "utf8"));
writeFileSync(here("./tokens.gen.css"), generateCss(tokens));
writeFileSync(here("./color.gen.ts"), generateTs(tokens));
console.log("look: wrote tokens.gen.css and color.gen.ts");
