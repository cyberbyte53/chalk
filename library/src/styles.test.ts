import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Props match the app by drawing only with the look's tokens; a colour of their own comes from
// the content (--tone). These checks keep a raw colour from creeping into a prop's styles.
const PROPS = new URL("../../props/", import.meta.url);
const names = readdirSync(PROPS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const RAW_COLOR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

describe("prop styles", () => {
  it.each(names)("%s draws only with the look's tokens", (name) => {
    const css = readFileSync(new URL(`${name}/src/styles.css`, PROPS), "utf8");
    const raw = css.split("\n").filter((line) => RAW_COLOR.test(line));
    expect(raw).toEqual([]);
  });

  it("the library gathers every prop's styles", () => {
    const gathered = readFileSync(new URL("./styles.css", import.meta.url), "utf8");
    for (const name of names) expect(gathered).toContain(`@chalk/prop-${name}/styles.css`);
  });
});
