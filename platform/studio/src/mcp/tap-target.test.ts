import type { Browser } from "playwright-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { launch, markTarget } from "./app-driver";

/** A question as the player draws it: a prompt that says "press Check", then the Check button. */
const QUESTION = `
<div data-piece="ask" data-path="ask">
  <p data-part="prompt" data-path="ask/prompt">Drag it there, then press Check.</p>
  <button data-part="check" data-path="ask/check">Check</button>
  <button data-part="again" data-path="ask/again">Check again</button>
</div>`;

let browser: Browser | undefined;
beforeAll(async () => {
  browser = await launch().catch(() => undefined);
});
afterAll(async () => {
  await browser?.close();
});

/** Where a tap on `target` with `text` lands: the marked element's path, or the tool's error. */
async function tapLands(html: string, target: string, text: string): Promise<string> {
  if (browser === undefined) throw new Error("no browser");
  const page = await browser.newPage();
  await page.setContent(html);
  const out = await page.evaluate(markTarget, { target, text });
  const marked = await page.evaluate(
    () => document.querySelector<HTMLElement>("[data-chalk-target]")?.dataset.path ?? "",
  );
  await page.close();
  return typeof out === "string" ? out : marked;
}

describe("a tap by its words", () => {
  it.skipIf(process.env.CI === "true")(
    "presses the button, not the words that mention it; exact words before words that contain them",
    async () => {
      if (browser === undefined) return;
      expect(await tapLands(QUESTION, "ask", "Check")).toBe("ask/check");
      expect(await tapLands(QUESTION, "ask", "again")).toBe("ask/again");
    },
  );

  it.skipIf(process.env.CI === "true")("names every match when two are as good", async () => {
    if (browser === undefined) return;
    const two = QUESTION.replace("Check again", "Check");
    expect(await tapLands(two, "ask", "Check")).toMatch(
      /matches 2 things in ask: ask\/check .*ask\/again/,
    );
  });
});
