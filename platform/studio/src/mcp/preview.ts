import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import type { Browser, Page } from "playwright-core";

/**
 * The learner app's own dev server and a headless browser, for looking at boards. Uses the one
 * dev server (CHALK_PREVIEW_URL to point elsewhere), starting it in this process if nothing
 * answers on its port. Nothing here draws a board: the
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

/** The one dev server's address (platform/apps/learner/vite.config.ts; CHALK_DEV_PORT to move it). */
export const DEV_URL = `http://localhost:${process.env.CHALK_DEV_PORT ?? 5173}`;

/**
 * The one dev server: the one already running (the editor's, `pnpm dev`, another agent's), else
 * started here, in this process, with the content rebuild inside it. Never a second one: the port
 * is fixed, so if another starts it first, that one is used.
 */
async function startServer(root: string): Promise<string> {
  const given = process.env.CHALK_PREVIEW_URL;
  if (given !== undefined && given !== "") return given;
  if (await isChalk(DEV_URL)) return DEV_URL;
  const app = join(root, "platform", "apps", "learner");
  const require = createRequire(join(app, "package.json"));
  const viteDir = dirname(require.resolve("vite/package.json"));
  const vite = (await import(pathToFileURL(join(viteDir, "dist", "node", "index.js")).href)) as {
    createServer: (config: Record<string, unknown>) => Promise<{
      listen: () => Promise<{ resolvedUrls?: { local: string[] } }>;
    }>;
  };
  try {
    const server = await vite.createServer({
      root: app,
      configFile: join(app, "vite.config.ts"),
      logLevel: "silent",
      clearScreen: false,
      server: { open: false },
    });
    await server.listen();
    return DEV_URL;
  } catch (error) {
    // Someone else started it a moment ago: use theirs.
    for (let i = 0; i < 20; i++) {
      if (await isChalk(DEV_URL)) return DEV_URL;
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(
      `Couldn't start the dev server on ${DEV_URL} (${error instanceof Error ? error.message.split("\n")[0] : String(error)}). Is something else using that port? Set CHALK_DEV_PORT to move it.`,
    );
  }
}

/**
 * Closes the browser (and with it its temporary profile folder). Called when the editor
 * disconnects or stops the server, so nothing is left behind.
 */
export async function closeBrowser(): Promise<void> {
  const open = browser;
  browser = undefined;
  warm = undefined;
  if (open !== undefined) await (await open.catch(() => undefined))?.close().catch(() => {});
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
  /** Each piece's parts by name (data-part), the targets a step can name: "piece › part". */
  parts: Record<string, string[]>;
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

/**
 * One thing a finger does on the drawn board. Nothing here knows how a board behaves: a step only
 * presses, taps or drags the real page, found by the tags the player puts on it (data-piece,
 * data-part); the app's own player and props do the rest.
 */
export type Step =
  | { tap: string; text?: string }
  | { drag: string; by: [number, number] }
  | { wait: number };

/** What a step did: the events the app raised, whether the board was passed, page errors. */
export type StepResult = {
  step: string;
  events: string[];
  passed: boolean;
  errors: string[];
  png?: Buffer;
};

export async function previewUrl(
  root: string,
  board: string,
  o: ShotOptions = {},
): Promise<string> {
  const url = new URL(await previewBase(root));
  url.search = `?dev&board=${board}${o.questions ? "&show=questions" : ""}${o.play ? "&play" : ""}${o.locale === "hi" ? "&locale=hi" : ""}`;
  return url.toString();
}

const READY_TIMEOUT = 30000;

const firstLine = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).split("\n")[0] ?? "";

/**
 * One page kept open between calls: moving it to another board inside the app (history.pushState,
 * which the preview listens for) skips a page load, the slow part. Errors the page logs go to
 * whichever call is drawing.
 */
let warm: { page: Page; base: string; errors: string[]; lastBoard?: string } | undefined;
let queue: Promise<unknown> = Promise.resolve();

async function openPage(base: string): Promise<NonNullable<typeof warm>> {
  if (warm !== undefined && warm.base === base && !warm.page.isClosed()) return warm;
  browser ??= launch();
  const page = await (await browser).newPage({
    viewport: { width: PHONE_WIDTH + 48, height: 900 },
    deviceScaleFactor: 2,
  });
  // tsx keeps function names with a helper the page doesn't have; give it one.
  await page.addInitScript("globalThis.__name = (f) => f;");
  const opened: NonNullable<typeof warm> = { page, base, errors: [] };
  page.on("console", (m) => {
    // The app asks the API who is signed in; previews don't need a server, so that one is noise.
    if (m.type() === "error" && !m.location().url.includes("/api/")) opened.errors.push(m.text());
  });
  page.on("pageerror", (e) => opened.errors.push(e.message));
  page.on("crash", () => {
    warm = undefined;
  });
  warm = opened;
  return opened;
}

/**
 * Each board at `board` (one board, or a whole lesson) drawn at phone width; with `steps`, a
 * single board acted on first, a picture after each step if asked. One call at a time.
 */
export function shoot(
  root: string,
  board: string,
  o: ShotOptions = {},
  act?: { steps: Step[]; shots: "each" | "last" | "none"; isContinued: boolean },
): Promise<{ shots: Shot[]; steps: StepResult[] }> {
  const next = queue.then(() => shootNow(root, board, o, act));
  queue = next.catch(() => {});
  return next;
}

/** Waits until the page has drawn: fonts, images, finite animations, then two frames. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const frame = () => new Promise((done) => requestAnimationFrame(() => done(null)));
    const atMost = (ms: number) => new Promise((done) => setTimeout(done, ms));
    await document.fonts.ready;
    await frame();
    const images = [...document.images].filter((i) => !i.complete);
    await Promise.race([
      Promise.all(
        images.map(
          (i) =>
            new Promise((done) => {
              i.addEventListener("load", done);
              i.addEventListener("error", done);
            }),
        ),
      ),
      atMost(3000),
    ]);
    const running = document
      .getAnimations()
      .filter(
        (a) =>
          a.playState === "running" &&
          a.effect?.getTiming().iterations !== Number.POSITIVE_INFINITY,
      );
    await Promise.race([Promise.all(running.map((a) => a.finished.catch(() => {}))), atMost(2000)]);
    await frame();
    await frame();
  });
}

/** What the app recorded so far (the preview keeps it on window; see preview-shell.tsx). */
type Recorded = {
  events: { machine?: { type?: string; id?: string | number }; input?: unknown }[];
  passed: string[];
};
const recorded = (page: Page): Promise<Recorded> =>
  page.evaluate(() => {
    const w = window as unknown as { __chalkEvents?: unknown[]; __chalkPassed?: string[] };
    return { events: [...(w.__chalkEvents ?? [])], passed: [...(w.__chalkPassed ?? [])] } as never;
  });

const stepWords = (step: Step): string =>
  "tap" in step
    ? `tap ${step.tap}${step.text ? ` "${step.text}"` : ""}`
    : "drag" in step
      ? `drag ${step.drag} by ${step.by.join(", ")}`
      : `wait ${step.wait}ms`;

/**
 * Finds what a step names on the board and marks it (data-chalk-target), or says what is there.
 * `text` picks, inside the piece or part, the clickable thing whose words include it (maths read
 * as its TeX too, so "x^2 - 4" or "x² − 4" both work).
 */
function markTarget(arg: { target: string; text?: string }): string | null {
  const [piece, part] = arg.target.split("›").map((t) => t.trim());
  for (const old of document.querySelectorAll("[data-chalk-target]"))
    old.removeAttribute("data-chalk-target");
  const pieceEl = document.querySelector<HTMLElement>(`[data-piece="${CSS.escape(piece ?? "")}"]`);
  if (pieceEl === null) {
    const names = [...document.querySelectorAll<HTMLElement>("[data-piece]")].map(
      (e) => e.dataset.piece,
    );
    return `no piece "${piece}" on screen (shown now: ${names.join(", ")}). In play, a piece can stay hidden until the ones before it are answered.`;
  }
  let el: HTMLElement | null = pieceEl;
  if (part !== undefined && part !== "") {
    el = pieceEl.querySelector<HTMLElement>(`[data-part="${CSS.escape(part)}"]`);
    if (el === null) {
      const parts = [...pieceEl.querySelectorAll<HTMLElement>("[data-part]")].map(
        (e) => e.dataset.part,
      );
      return `no part "${part}" in ${piece} (parts: ${[...new Set(parts)].join(", ") || "none"})`;
    }
  }
  if (arg.text !== undefined) {
    const norm = (t: string) => t.replace(/[−–]/g, "-").replace(/\s+/g, "").toLowerCase();
    const wordsOf = (node: HTMLElement) => {
      const copy = node.cloneNode(true) as HTMLElement;
      for (const m of copy.querySelectorAll(".katex")) {
        const tex = m.querySelector('annotation[encoding="application/x-tex"]')?.textContent ?? "";
        m.replaceWith(`${m.querySelector(".katex-html")?.textContent ?? ""} ${tex}`);
      }
      return copy.textContent ?? "";
    };
    const want = norm(arg.text);
    const choices = [
      ...(el as HTMLElement).querySelectorAll<HTMLElement>(
        "button, [role=button], [data-part], label, a",
      ),
    ];
    const found = choices.find((c) => norm(wordsOf(c)).includes(want));
    if (found === undefined)
      return `nothing saying "${arg.text}" in ${arg.target} (it has: ${choices
        .map((c) => wordsOf(c).replace(/\s+/g, " ").trim())
        .filter(Boolean)
        .slice(0, 12)
        .join(" | ")})`;
    el = found;
  }
  (el as HTMLElement).setAttribute("data-chalk-target", "");
  return null;
}

async function shootNow(
  root: string,
  board: string,
  o: ShotOptions,
  act?: { steps: Step[]; shots: "each" | "last" | "none"; isContinued: boolean },
): Promise<{ shots: Shot[]; steps: StepResult[] }> {
  // Acting starts from a fresh board (a new run) unless it continues the last call's board.
  const isContinued = act?.isContinued === true && warm?.lastBoard === board;
  const run = act !== undefined && !isContinued ? `&run=${Date.now()}` : "";
  const url = `${await previewUrl(root, board, o)}&shot${run}`;
  const target = new URL(url);
  const base = target.origin;
  const at = await openPage(base);
  const { page } = at;
  at.errors.length = 0;
  const isOnApp = page.url().startsWith(base);
  try {
    if (isContinued) {
      // The board as the last call left it.
    } else if (isOnApp)
      await page.evaluate((q) => {
        history.pushState(null, "", q);
        dispatchEvent(new PopStateEvent("popstate"));
      }, `${target.pathname}${target.search}`);
    else await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
  } catch (error) {
    warm = undefined;
    await page.close().catch(() => {});
    throw new Error(
      `The preview server didn't answer at ${url} (${firstLine(error)}). Start it with \`pnpm dev\` in platform/apps/learner (or set CHALK_PREVIEW_URL), then retry.`,
    );
  }
  try {
    if (!isContinued)
      await page.waitForFunction(
        (q) =>
          document.body.dataset.previewReady === q ||
          (document.body.dataset.previewShown === q &&
            document.querySelector(".preview-empty") !== null),
        target.search,
        { timeout: READY_TIMEOUT },
      );
  } catch {
    const shown = ((await page.textContent("body").catch(() => "")) ?? "").trim().slice(0, 200);
    warm = undefined;
    await page.close().catch(() => {});
    throw new Error(
      [
        `The board didn't finish drawing within ${READY_TIMEOUT / 1000}s at ${url}.`,
        `The page shows: ${shown === "" ? "(nothing)" : JSON.stringify(shown)}`,
        at.errors.length > 0 ? `Page errors:\n${at.errors.join("\n")}` : "No page errors.",
        "If it's still loading, content may be rebuilding: retry. Otherwise open the URL to see it.",
      ].join("\n"),
    );
  }
  const empty = await page.$(".preview-empty");
  if (empty !== null)
    throw new Error(
      `${(await empty.textContent()) ?? "Nothing to show"} (at ${url}). Check the board name with the boards tool.`,
    );
  await settle(page);
  at.lastBoard = board;
  const steps: StepResult[] = [];
  if (act !== undefined && act.steps.length > 0) {
    if ((await page.$$(".preview-card")).length !== 1)
      throw new Error("Steps act on one board: name a board, not a lesson.");
    let seen = await recorded(page);
    for (const [i, step] of act.steps.entries()) {
      at.errors.length = 0;
      const words = stepWords(step);
      if ("wait" in step) await page.waitForTimeout(Math.min(step.wait, 10000));
      else {
        const missing = await page.evaluate(markTarget, {
          target: "tap" in step ? step.tap : step.drag,
          text: "tap" in step ? step.text : undefined,
        });
        if (missing !== null) {
          steps.push({ step: words, events: [], passed: false, errors: [`✗ ${missing}`] });
          break;
        }
        const target = page.locator("[data-chalk-target]").first();
        if ("tap" in step) await target.click({ timeout: 5000 });
        else {
          const box = await target.boundingBox();
          if (box === null) throw new Error(`${step.drag} isn't on screen`);
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          await page.mouse.move(x, y);
          await page.mouse.down();
          await page.mouse.move(x + step.by[0], y + step.by[1], { steps: 12 });
          await page.mouse.up();
        }
      }
      await settle(page);
      const now = await recorded(page);
      const isLast = i === act.steps.length - 1;
      steps.push({
        step: words,
        events: now.events.slice(seen.events.length).map((e) => {
          const what = `${e.machine?.type ?? "?"}${e.machine?.id !== undefined ? `/${e.machine.id}` : ""}`;
          return `${what} ${JSON.stringify(e.input ?? null).slice(0, 160)}`;
        }),
        passed: now.passed.length > seen.passed.length,
        errors: [...at.errors],
        ...(act.shots === "each" || (act.shots === "last" && isLast)
          ? { png: await page.locator(".preview-card").first().screenshot({ type: "png" }) }
          : {}),
      });
      seen = now;
    }
  }
  const cards = await page.$$(".preview-card");
  const shots: Shot[] = [];
  for (const card of cards) {
    const name = (await card.getAttribute("data-board")) ?? board;
    const overflow = await card.evaluate(layoutProblems);
    const parts = await card.evaluate((c) => {
      const out: Record<string, string[]> = {};
      for (const piece of c.querySelectorAll<HTMLElement>("[data-piece]")) {
        const names = [...piece.querySelectorAll<HTMLElement>("[data-part]")].map(
          (p) => p.dataset.part ?? "",
        );
        if (names.length > 0) out[piece.dataset.piece ?? "?"] = [...new Set(names)];
      }
      return out;
    });
    shots.push({
      board: name.replace(/\.json$/, ""),
      // After steps, the picture is the steps' to give (or not): don't take another.
      png:
        act !== undefined && act.steps.length > 0
          ? Buffer.alloc(0)
          : await card.screenshot({ type: "png" }),
      parts,
      overflow,
      errors: [...at.errors],
    });
  }
  return { shots, steps };
}
