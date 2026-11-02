import type { Browser } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { launch, markTarget } from "./app-driver";

/** A question as the player draws it: every part carries its address (data-path). */
const QUESTION = `
<div data-piece="ask" data-path="ask">
  <p data-part="prompt" data-path="ask/prompt">Drag it there, then press Check.</p>
  <button data-part="check" data-path="ask/check">Check</button>
</div>`;

let browser: Browser | undefined;
beforeAll(async () => {
  browser = await launch().catch(() => undefined);
});
afterAll(async () => {
  await browser?.close();
});

/** Where a tap on `target` lands: the marked element's address, or the tool's error. */
async function tapLands(html: string, target: string): Promise<string> {
  if (browser === undefined) throw new Error("no browser");
  const page = await browser.newPage();
  await page.setContent(html);
  const out = await page.evaluate(markTarget, { target });
  const marked = await page.evaluate(
    () => document.querySelector<HTMLElement>("[data-chalk-target]")?.dataset.path ?? "",
  );
  await page.close();
  return typeof out === "string" ? out : marked;
}

const hasBrowser = process.env.CI !== "true";

describe("a tap by name", () => {
  it.skipIf(!hasBrowser)("presses exactly the thing with that name", async () => {
    if (browser === undefined) return;
    expect(await tapLands(QUESTION, "ask/check")).toBe("ask/check");
  });

  it.skipIf(!hasBrowser)("says which names there are when it's wrong", async () => {
    if (browser === undefined) return;
    expect(await tapLands(QUESTION, "ask/Check")).toBe(
      'no part "ask/Check" (parts: ask/check, ask/prompt)',
    );
  });

  it.skipIf(!hasBrowser)("refuses a name two things share, never pressing the first", async () => {
    if (browser === undefined) return;
    const twice = QUESTION.replace("</div>", '<button data-path="ask/check">Again</button></div>');
    expect(await tapLands(twice, "ask/check")).toMatch(/^2 things are named "ask\/check"/);
  });
});
