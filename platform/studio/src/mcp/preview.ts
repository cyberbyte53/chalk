import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser, Page } from "playwright-core";

/**
 * The learner app's own dev server and a headless browser, for looking at boards. Uses a dev
 * server already running (CHALK_PREVIEW_URL, else localhost:5173 if it serves Chalk); otherwise
 * starts one in this process from the learner app's vite config. Nothing here draws a board: the
 * page at `?dev&board=` does, with the app's player.
 */

export const PHONE_WIDTH = 390;

let base: Promise<string> | undefined;
let browser: Promise<Browser> | undefined;

async function isChalk(url: string): Promise<boolean> {
  try {
    const res = await fetch(new URL("/content/index.json", url), {
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function startServer(root: string): Promise<string> {
  const given = process.env.CHALK_PREVIEW_URL;
  if (given !== undefined && given !== "") return given;
  if (await isChalk("http://localhost:5173")) return "http://localhost:5173";
  const app = join(root, "platform", "apps", "learner");
  const require = createRequire(join(app, "package.json"));
  const viteDir = dirname(require.resolve("vite/package.json"));
  const vite = (await import(pathToFileURL(join(viteDir, "dist", "node", "index.js")).href)) as {
    createServer: (config: Record<string, unknown>) => Promise<{
      listen: () => Promise<{ resolvedUrls?: { local: string[] } }>;
    }>;
  };
  const server = await vite.createServer({
    root: app,
    configFile: join(app, "vite.config.ts"),
    logLevel: "silent",
    clearScreen: false,
    server: { port: 5199, strictPort: false, open: false },
  });
  const listening = await server.listen();
  const url = listening.resolvedUrls?.local[0];
  if (url === undefined) throw new Error("the preview server started without a URL");
  return url;
}

export const previewBase = (root: string): Promise<string> => {
  base ??= startServer(root);
  return base;
};

async function launch(): Promise<Browser> {
  const { chromium } = await import("playwright-core");
  const path = process.env.CHALK_CHROMIUM;
  if (path !== undefined && existsSync(path)) return chromium.launch({ executablePath: path });
  // An installed Chrome (most Macs), else Playwright's own Chromium if it has been downloaded.
  try {
    return await chromium.launch({ channel: "chrome" });
  } catch {
    try {
      return await chromium.launch();
    } catch (error) {
      throw new Error(
        `No browser to render with: install Google Chrome, or run \`npx playwright install chromium\`, or set CHALK_CHROMIUM. (${error instanceof Error ? error.message.split("\n")[0] : String(error)})`,
      );
    }
  }
}

export type Shot = {
  board: string;
  png: Buffer;
  /** Pieces drawn wider than the phone or cut off by their box. */
  overflow: string[];
  /** Errors the page logged while drawing. */
  errors: string[];
};

/**
 * Layout problems on one drawn board, found by measuring (runs in the page). Each names the piece
 * and its source line. Maths is measured by its glyph boxes (KaTeX's own box can be narrower).
 */
function layoutProblems(card: Element): string[] {
  const found: string[] = [];
  const box = card.getBoundingClientRect();
  const labelOf = (node: Element) => {
    const piece = node.closest<HTMLElement>("[data-piece]");
    return `${piece?.dataset.piece ?? "?"} (${piece?.dataset.source ?? "?"})`;
  };
  const rightOf = (nodes: Iterable<Element>) => {
    let right = Number.NEGATIVE_INFINITY;
    for (const n of nodes) {
      const r = n.getBoundingClientRect();
      if (r.width > 0) right = Math.max(right, r.right);
    }
    return right;
  };
  for (const maths of card.querySelectorAll(".katex")) {
    const piece = maths.closest("[data-piece]");
    if (piece === null) continue;
    const over = rightOf(maths.querySelectorAll(".base")) - piece.getBoundingClientRect().right;
    if (over > 2) found.push(`${labelOf(maths)}: maths runs ${Math.round(over)}px past the edge`);
  }
  const buttons = [...card.querySelectorAll("button")];
  for (const button of buttons) {
    const over = rightOf(button.querySelectorAll("*")) - button.getBoundingClientRect().right;
    if (over > 2)
      found.push(`${labelOf(button)}: text spills ${Math.round(over)}px out of its button`);
  }
  for (const [i, a] of buttons.entries())
    for (const b of buttons.slice(i + 1)) {
      const r = a.getBoundingClientRect();
      const q = b.getBoundingClientRect();
      const w = Math.min(r.right, q.right) - Math.max(r.left, q.left);
      const h = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (w > 2 && h > 2) found.push(`${labelOf(a)}: two buttons overlap`);
    }
  for (const node of card.querySelectorAll("[data-piece]")) {
    const r = node.getBoundingClientRect();
    if (r.width > 0 && (r.right > box.right + 1 || r.left < box.left - 1))
      found.push(`${labelOf(node)}: drawn outside the phone`);
  }
  return [...new Set(found)].slice(0, 20);
}

export type ShotOptions = { locale?: "en" | "hi"; play?: boolean; questions?: boolean };

export async function previewUrl(
  root: string,
  board: string,
  o: ShotOptions = {},
): Promise<string> {
  const url = new URL(await previewBase(root));
  url.search = `?dev&board=${board}${o.questions ? "&show=questions" : ""}${o.play ? "&play" : ""}${o.locale === "hi" ? "&locale=hi" : ""}`;
  return url.toString();
}

/** Each board at `board` (one board, or a whole lesson) drawn at phone width. */
export async function shoot(root: string, board: string, o: ShotOptions = {}): Promise<Shot[]> {
  browser ??= launch();
  const b = await browser;
  const page: Page = await b.newPage({
    viewport: { width: PHONE_WIDTH + 48, height: 900 },
    deviceScaleFactor: 2,
  });
  // tsx keeps function names with a helper the page doesn't have; give it one.
  await page.addInitScript("globalThis.__name = (f) => f;");
  const errors: string[] = [];
  page.on("console", (m) => {
    // The app asks the API who is signed in; previews don't need a server, so that one is noise.
    if (m.type() === "error" && !m.location().url.includes("/api/")) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    const url = `${await previewUrl(root, board, o)}&shot`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("body[data-preview-ready], .preview-empty", { timeout: 30000 });
    const empty = await page.$(".preview-empty");
    if (empty !== null) throw new Error((await empty.textContent()) ?? "nothing to show");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const cards = await page.$$(".preview-card");
    const out: Shot[] = [];
    for (const card of cards) {
      const name = (await card.getAttribute("data-board")) ?? board;
      const overflow = await card.evaluate(layoutProblems);
      out.push({
        board: name.replace(/\.json$/, ""),
        png: await card.screenshot({ type: "png" }),
        overflow,
        errors: [...errors],
      });
    }
    return out;
  } finally {
    await page.close();
  }
}
