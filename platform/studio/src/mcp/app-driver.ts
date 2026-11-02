import { spawn } from "node:child_process";
import { existsSync, mkdirSync, openSync } from "node:fs";
import { join } from "node:path";
import { previewQuery, shownAddress } from "@chalk/content/address";
import { type BoardSnapshot, seenBetween } from "@chalk/prop";
import type { Browser, Locator, Page } from "playwright-core";
import { buildInputsKey } from "../content/inputs";
import type { PropPage } from "../prop-text";
import { type Ran, RanReader, addRan } from "../reach/ran";
import { codeKey, contentKey, isDrawCacheOn, keep, keyOf, readKept } from "./draw-cache";
import { type BoardModel, boardModelSchema } from "./model-schema";

/**
 * Drives the real learner app in a headless browser: it opens the app's own dev-server page
 * (`?dev&at=`), where the app's player draws the board, then measures, reads and acts on what
 * the page shows. Nothing here draws a board. Uses the one dev server (CHALK_PREVIEW_URL to point
 * elsewhere), starting it in this process if nothing answers on its port.
 */

export const PHONE_WIDTH = 390;
/** A phone\'s screen height in px: what a board is checked against unless a screen is given. */
export const PHONE_HEIGHT = 844;

/** A start of the dev server under way, so two callers never start two. */
let starting: Promise<string> | undefined;
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
 * started here as a process of its own (so this service restarting doesn't stop it), its output
 * in node_modules/.cache/chalk-dev.log. Never a second one: the port is fixed, so if another
 * starts it first, that one is used.
 */
async function startServer(root: string): Promise<string> {
  const given = process.env.CHALK_PREVIEW_URL;
  if (given !== undefined && given !== "") return given;
  if (await isChalk(DEV_URL)) return DEV_URL;
  const app = join(root, "platform", "apps", "learner");
  const cache = join(root, "node_modules", ".cache");
  mkdirSync(cache, { recursive: true });
  const out = openSync(join(cache, "chalk-dev.log"), "a");
  const child = spawn(join(app, "node_modules", ".bin", "vite"), [], {
    cwd: app,
    detached: true,
    stdio: ["ignore", out, out],
    env: process.env,
  });
  child.unref();
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isChalk(DEV_URL)) return DEV_URL;
  }
  throw new Error(
    `Couldn't start the dev server on ${DEV_URL} (see node_modules/.cache/chalk-dev.log). Is something else using that port? Set CHALK_DEV_PORT to move it.`,
  );
}

/**
 * Closes the browser (and with it its temporary profile folder). Called when the editor
 * disconnects or stops the server, so nothing is left behind.
 */
export async function closeBrowser(): Promise<void> {
  const open = browser;
  browser = undefined;
  lanes.clear();
  queues.clear();
  idle.length = 0;
  pages = 0;
  for (const done of waiting.splice(0)) done();
  composer = undefined;
  if (open !== undefined) await (await open.catch(() => undefined))?.close().catch(() => {});
}

/** The dev server, up: asked each time, so one that stopped is started again (one start at a time). */
export const previewBase = async (root: string): Promise<string> => {
  const given = process.env.CHALK_PREVIEW_URL;
  if (given !== undefined && given !== "") return given;
  if (await isChalk(DEV_URL)) return DEV_URL;
  starting ??= startServer(root).finally(() => {
    starting = undefined;
  });
  return starting;
};
export async function launch(): Promise<Browser> {
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

/**
 * Where a piece or a part is on a picture, in CSS pixels from the picture's top left (the picture
 * itself is at twice that). Measured on the same drawing the picture was taken of.
 */
export type Box = {
  kind: "piece" | "part";
  /** The piece's name, or the part's address ("game/plates"). */
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/** A picture of one drawn board, with where each piece and part is on it. */
export type Picture = { png: Buffer; width: number; boxes: Box[] };

export type Shot = {
  board: string;
  png: Buffer;
  /** The picture's width in CSS pixels, and where each piece and part is on it. */
  width: number;
  boxes: Box[];
  /** Each piece's parts by address: what a step can name ("machine/plane/handle"). */
  parts: Record<string, string[]>;
  /** Pieces drawn wider than the phone or cut off by their box. */
  overflow: string[];
  /** Errors the page logged while drawing. */
  errors: string[];
  /** The board's snapshot (see @chalk/player snapshot.ts), when the page could make it. */
  model?: BoardModel;
  /** What was still going on when it was read, if the board hadn't settled by the cap. */
  running?: string[];
};

/**
 * Where a drawing's time goes, phase by phase, when something is measuring it (`timing.isOn`): the
 * seconds spent in each, summed over every drawing since it was switched on. Off, it costs nothing.
 */
export const timing = { isOn: false, spent: new Map<string, number>() };
export async function timed<T>(phase: string, fn: () => Promise<T>): Promise<T> {
  if (!timing.isOn) return fn();
  const t = performance.now();
  try {
    return await fn();
  } finally {
    timing.spent.set(phase, (timing.spent.get(phase) ?? 0) + (performance.now() - t) / 1000);
  }
}

/** How long a board may take to settle after it opens or after a step, in its own seconds. */
export const SETTLE_CAP = 30;

/**
 * Waits until every board on the page has settled (no lesson script and no prop's timeline
 * running), at most SETTLE_CAP of board time. Returns what was still going on at the cap, if any.
 */
/** What is still going on, on every board on the page, right now. */
const busyNow = (page: Page) =>
  page.evaluate(() => (window as { __chalkBusy?: () => string[] }).__chalkBusy?.() ?? []);

async function untilIdle(page: Page, speed: number): Promise<string[]> {
  const busy = () => busyNow(page);
  try {
    await page.waitForFunction(
      () => ((window as { __chalkBusy?: () => string[] }).__chalkBusy?.() ?? []).length === 0,
      undefined,
      // A jumping clock is done in a frame or two; the wait is only a guard.
      { timeout: Number.isFinite(speed) ? (SETTLE_CAP / speed) * 1000 : 10_000, polling: "raf" },
    );
    return [];
  } catch {
    return await busy();
  }
}

/** Each call's board is a new run of it (`&run=`): the preview draws it afresh. */
let runs = 0;

type JumpTo = { kind: "end" } | { kind: "line"; line: string } | { kind: "here" };

/** Where a held board's clock goes next (the preview's __chalkJumpTo; player's runtime.ts). */
const jumpTo = (page: Page, to: JumpTo) =>
  page.evaluate(
    (x) => (window as { __chalkJumpTo?: (to: unknown) => void }).__chalkJumpTo?.(x),
    to,
  );

/**
 * Runs a held board's clock to where a step is done: while its line is said, or (no line) the
 * board's end. Says what went wrong, if anything: the line never came, or the board didn't settle.
 */
async function reach(page: Page, line: string | undefined): Promise<string | undefined> {
  if (line === undefined) {
    await jumpTo(page, { kind: "end" });
    const running = await untilIdle(page, Number.POSITIVE_INFINITY);
    return running.length > 0 ? stillRunning(running) : undefined;
  }
  await jumpTo(page, { kind: "line", line });
  const got = await page
    .waitForFunction(
      (name) => {
        const w = window as { __chalkLines?: () => string[]; __chalkBusy?: () => string[] };
        if ((w.__chalkLines?.() ?? []).includes(name)) return "said";
        return (w.__chalkBusy?.() ?? []).length === 0 ? "ended" : false;
      },
      line,
      { timeout: 10_000, polling: "raf" },
    )
    .then((h) => h.jsonValue())
    .catch(() => "busy");
  if (got === "said") return undefined;
  const said = ((await recorded(page)).heard ?? []).flatMap((h) => ("line" in h ? [h.line] : []));
  return got === "ended"
    ? `✗ ${line} isn't said from here: the board came to its end (said so far: ${said.join(", ") || "nothing"})`
    : `✗ ${line} didn't come within 10s: the board is still busy (${(await busyNow(page)).join(", ")})`;
}

/** The line for a board still busy at the cap. */
export const stillRunning = (running: readonly string[]) =>
  `still running after ${SETTLE_CAP}s of board time: ${running.join(", ")}`;

/** The board model of each board on the page, by its build path (the preview keeps it on window). */
async function readModels(page: Page): Promise<Map<string, BoardModel>> {
  const all = (await page
    .evaluate(() => {
      const w = window as unknown as { __chalkModel?: () => unknown };
      return w.__chalkModel?.() ?? [];
    })
    .catch(() => [])) as { path: string; model: unknown }[];
  // Checked against the output schema here, so a model the page made wrong is caught at once.
  return new Map(all.map((m) => [m.path, boardModelSchema.parse(m.model)]));
}

/** What a step changed on screen: each part that moved, by address ("game/plates"). */
function seenChanges(was: BoardModel | undefined, now: BoardModel | undefined) {
  if (was === undefined || now === undefined) return {};
  return Object.fromEntries(
    seenBetween(was as BoardSnapshot, now as BoardSnapshot).map((c) => [
      c.path,
      { was: c.was, now: c.now },
    ]),
  );
}

/**
 * Layout problems on one drawn board, found by measuring (runs in the page). Each names the piece
 * and its source line. Everything is measured as the student sees it: a box cut down by each
 * parent that clips it (overflow hidden or clip, as the browser paints), so what a library draws
 * and then hides (KaTeX's long √ bar) is never counted, whatever draws it. Maths is measured by its
 * glyph boxes (KaTeX's own box can be narrower). Scrolling boxes don't cut: maths that needs
 * scrolling is still reported.
 */
function layoutProblems(card: Element): string[] {
  const found: string[] = [];
  const labelOf = (node: Element) => {
    const piece = node.closest<HTMLElement>("[data-piece]");
    return `${piece?.dataset.piece ?? "?"} (${piece?.dataset.source ?? "?"})`;
  };
  // Each axis on its own: a box that scrolls sideways but clips its height still shows (by
  // scrolling) what runs past its sides.
  const cut = (o: string) => o === "hidden" || o === "clip";
  const clips = (node: Element) => {
    const style = getComputedStyle(node);
    return { x: cut(style.overflowX), y: cut(style.overflowY) };
  };
  /** What shows of a node, cut by the parents that clip it, up to `within` (not cut by it). */
  const visible = (node: Element, within: Element) => {
    const style = getComputedStyle(node);
    if (style.visibility === "hidden" || Number(style.opacity) === 0) return undefined;
    const r = node.getBoundingClientRect();
    let { left, right, top, bottom } = r;
    for (let p = node.parentElement; p !== null && p !== within; p = p.parentElement) {
      const { x, y } = clips(p);
      if (!x && !y) continue;
      const c = p.getBoundingClientRect();
      if (x) {
        left = Math.max(left, c.left);
        right = Math.min(right, c.right);
      }
      if (y) {
        top = Math.max(top, c.top);
        bottom = Math.min(bottom, c.bottom);
      }
    }
    return right - left > 0 && bottom - top > 0 ? { left, right, top, bottom } : undefined;
  };
  const rightOf = (nodes: Iterable<Element>, within: Element) => {
    let right = Number.NEGATIVE_INFINITY;
    for (const n of nodes) right = Math.max(right, visible(n, within)?.right ?? right);
    return right;
  };
  for (const maths of card.querySelectorAll(".katex")) {
    const piece = maths.closest("[data-piece]");
    if (piece === null) continue;
    const over =
      rightOf(maths.querySelectorAll(".base"), piece) - piece.getBoundingClientRect().right;
    if (over > 2) found.push(`${labelOf(maths)}: maths runs ${Math.round(over)}px past the edge`);
  }
  const buttons = [...card.querySelectorAll("button")];
  for (const button of buttons) {
    const over =
      rightOf(button.querySelectorAll("*"), button) - button.getBoundingClientRect().right;
    if (over > 2)
      found.push(`${labelOf(button)}: text spills ${Math.round(over)}px out of its button`);
  }
  // Text a parent cuts off, anywhere: the student can't read it. Measured by the text itself, not
  // boxes, so a drawing a library hides on purpose (KaTeX's √ bar is a shape) is never counted,
  // while words, numbers and maths glyphs are. A parent that shows nothing (1px or less: text for
  // screen readers, KaTeX's MathML copy) hides on purpose.
  const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
  for (let text = walker.nextNode(); text !== null; text = walker.nextNode()) {
    const owner = text.parentElement;
    if (owner === null || (text.textContent ?? "").trim() === "") continue;
    if (getComputedStyle(owner).visibility === "hidden") continue;
    const range = document.createRange();
    range.selectNodeContents(text);
    const glyphs = [...range.getClientRects()].filter((r) => r.width > 0);
    let hidden = 0;
    let isOnPurpose = false;
    for (let p: Element | null = owner; p !== null && p !== card; p = p.parentElement) {
      const { x, y } = clips(p);
      if (!x && !y) continue;
      const c = p.getBoundingClientRect();
      if (c.width <= 1 || c.height <= 1) {
        isOnPurpose = true;
        break;
      }
      for (const g of glyphs) {
        if (x) hidden = Math.max(hidden, c.left - g.left, g.right - c.right);
        if (y) hidden = Math.max(hidden, c.top - g.top, g.bottom - c.bottom);
      }
    }
    if (!isOnPurpose && hidden > 2)
      found.push(`${labelOf(owner)}: text cut off by ${Math.round(hidden)}px, hidden from view`);
  }
  const shown = buttons.flatMap((b) => {
    const r = visible(b, card);
    return r === undefined ? [] : [{ b, r }];
  });
  for (const [i, { b: a, r }] of shown.entries())
    for (const { r: q } of shown.slice(i + 1)) {
      const w = Math.min(r.right, q.right) - Math.max(r.left, q.left);
      const h = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (w > 2 && h > 2) found.push(`${labelOf(a)}: two buttons overlap`);
    }
  const box = card.getBoundingClientRect();
  for (const node of card.querySelectorAll("[data-piece]")) {
    const r = visible(node, card);
    if (r !== undefined && (r.right > box.right + 1 || r.left < box.left - 1))
      found.push(`${labelOf(node)}: drawn outside the phone`);
  }
  return [...new Set(found)].slice(0, 20);
}

/** Where each drawn piece and part is on a card (runs in the page). Hidden ones have no box. */
function boxesIn(card: Element): { width: number; boxes: Box[] } {
  const c = card.getBoundingClientRect();
  const boxes: Box[] = [];
  const add = (el: HTMLElement, kind: Box["kind"], name: string | undefined) => {
    const r = el.getBoundingClientRect();
    if (name === undefined || name === "" || r.width < 1 || r.height < 1) return;
    boxes.push({ kind, name, x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height });
  };
  for (const el of card.querySelectorAll<HTMLElement>("[data-piece]"))
    add(el, "piece", el.dataset.piece);
  const seen = new Set<string>();
  for (const el of card.querySelectorAll<HTMLElement>("[data-part]")) {
    const name = el.dataset.path ?? el.dataset.part;
    // A part drawn in pieces (one per option) keeps each; the same address twice is one part.
    if (name !== undefined && seen.has(`${name}@${el.getBoundingClientRect().top}`)) continue;
    if (name !== undefined) seen.add(`${name}@${el.getBoundingClientRect().top}`);
    add(el, "part", name);
  }
  return { width: c.width, boxes };
}

/** A picture of a card: the screenshot and, measured on the same drawing, its boxes. */
/**
 * A board's picture: at double resolution (for a piece cut out of it), or at the page's own
 * resolution for a thumbnail.
 */
async function pictureOf(card: Locator, resolution: "full" | "thumb" = "full"): Promise<Picture> {
  const { width, boxes } = await card.evaluate(boxesIn);
  const png = await card.screenshot({
    type: "png",
    scale: resolution === "full" ? "device" : "css",
  });
  return { png, width, boxes };
}

/** What one call drew: each board, what each step did, and the board before the first step. */
export type Drawn = {
  shots: Shot[];
  steps: StepResult[];
  before?: Picture;
  /** What was still going on when the board opened, if it hadn't settled by the cap. */
  runningAtOpen?: string[];
  /** The lines heard as the board opened, before any step. */
  heardAtOpen?: Heard[];
  /** Every prop's page, read from the app's prop definitions, when asked for (`withProps`). */
  props?: PropPage[];
};

export type ShotOptions = {
  /**
   * Record which lines of the board's code ran (for `changes`: "ran in the review"). Only a
   * reviewer's own look records: it is what a review saw, and costs most of a drawing's time.
   */
  recordsRan?: boolean;
  /**
   * Work out which lines ran and keep them with the drawing, without adding them to a review's
   * record (changes' drawings: a reviewer's later look at the same drawing adds them then).
   */
  keepsRan?: boolean;
  locale?: "en" | "hi";
  play?: boolean;
  /** The column's width in px (a phone is 360 to 430; a tablet or laptop column up to 640). */
  width?: number;
  /** The screen's height in px: what a prop may take 60% of (a phone ~840, a projector 720). */
  height?: number;
  /** The pictures taken: at double resolution (default), as thumbnails, or none (a check). */
  pictures?: "full" | "thumb" | "none";
  /** How fast the board's clock runs (1: real time). */
  speed?: number;
  /** A prop on its own page: the fields it starts from, over its defaults. */
  state?: Readonly<Record<string, unknown>>;
  /** Also read every prop's page from the app (its prop definitions: the props' one writer). */
  withProps?: boolean;
};

/**
 * One thing a finger does on the drawn board. Nothing here knows how a board behaves: a step only
 * presses, taps or drags the real page, found by the tags the player puts on it (data-piece,
 * data-part); the app's own player and props do the rest.
 */
/** A point in a prop's own units, inside a frame (a plane's (x, y), a number line's x). */
export type Point = { x: number; y?: number };

export type Step = (
  | { tap: string; at?: Point }
  | { drag: string; to: Point }
  /** One of a piece's actions, as a lesson would call it (on a prop's own page, which has none). */
  | { call: string; on: string; args?: Readonly<Record<string, unknown>> }
) & {
  /** Done while this line is being said (its name), not after the board has come to its end. */
  during?: string;
};

/** What a step did: the events the app raised, whether the board was passed, page errors. */
/** What was heard on the board, in order: the player's own log (words, or a sound at a signal). */
export type { Heard } from "@chalk/content";
import type { Heard } from "@chalk/content";

export type StepResult = {
  step: string;
  events: string[];
  /** The lines the step set off, as heard (who said what, for how long, cut or not). */
  heard?: Heard[];
  passed: boolean;
  errors: string[];
  /** The board after the step, when asked for. */
  picture?: Picture;
  /** What the step changed on screen ("game/plates": was "…0 each", now "…1 each"). */
  changed?: Record<string, { was: unknown; now: unknown }>;
  /** The board over time after the step, when frames were asked for. */
  motion?: Motion;
};

/** How the board moved after a step: the frames that differed, and when it went still (if it did). */
export type Motion = {
  /** Each frame kept (one that differs from the one before it), with its time after the step, s. */
  frames: { picture: Picture; t: number }[];
  /** When the picture last changed, once it had gone still and the board had settled. */
  stillAfter?: number;
  /** The picture was still changing when watching stopped, and why it stopped. */
  stillChangingAt?: number;
  /** Why watching stopped before the board went still: the frames asked for were all kept, or the cap. */
  stoppedBy?: "most" | "cap";
};

/** How a step's motion is sampled: about every `every` ms (real time), keeping at most `most` frames. */
export type FramesSpec = { every: number; most: number };

/** The longest a step's motion is watched, in real seconds. */
const MOTION_CAP = 30;

/** Two pictures differ when more than this share of their pixels differ visibly. */
const CHANGED_SHARE = 0.001;
/** A pixel differs visibly when a channel moved by more than this (of 255). */
const CHANNEL_STEP = 16;

/**
 * How many pixels of two same-size pictures differ visibly, decoded in the composer page (bytes
 * alone can differ for the same picture: a resampled capture, a GPU's rounding). A different size
 * counts as every pixel.
 */
async function pixelsChanged(a: Buffer, b: Buffer): Promise<{ changed: number; total: number }> {
  return onComposer((page) =>
    page.evaluate(
      async ({ a, b, step }) => {
        const load = (src: string) =>
          new Promise<HTMLImageElement>((done, fail) => {
            const img = new Image();
            img.onload = () => done(img);
            img.onerror = () => fail(new Error("a frame didn't load"));
            img.src = src;
          });
        const [x, y] = await Promise.all([load(a), load(b)]);
        const total = x.width * x.height;
        if (x.width !== y.width || x.height !== y.height) return { changed: total, total };
        const pixels = (img: HTMLImageElement) => {
          const c = document.createElement("canvas");
          c.width = img.width;
          c.height = img.height;
          const g = c.getContext("2d") as CanvasRenderingContext2D;
          g.drawImage(img, 0, 0);
          return g.getImageData(0, 0, img.width, img.height).data;
        };
        const [p, q] = [pixels(x), pixels(y)];
        let changed = 0;
        for (let i = 0; i < p.length; i += 4)
          if (
            Math.abs((p[i] ?? 0) - (q[i] ?? 0)) > step ||
            Math.abs((p[i + 1] ?? 0) - (q[i + 1] ?? 0)) > step ||
            Math.abs((p[i + 2] ?? 0) - (q[i + 2] ?? 0)) > step ||
            Math.abs((p[i + 3] ?? 0) - (q[i + 3] ?? 0)) > step
          )
            changed++;
        return { changed, total };
      },
      {
        a: `data:image/png;base64,${a.toString("base64")}`,
        b: `data:image/png;base64,${b.toString("base64")}`,
        step: CHANNEL_STEP,
      },
    ),
  );
}

/**
 * Watches the board after a step: a picture about every `every` ms of one fixed region (the board
 * as it was when watching began, so nothing moves the frame but the board itself), kept when its
 * pixels differ visibly from the last one kept. Stops once the board has settled and two pictures
 * in a row were the same, or when `most` frames are kept, or at the cap; says which.
 */
async function watchMotion(
  page: Page,
  card: Locator,
  spec: FramesSpec,
  isSettled: () => Promise<boolean>,
): Promise<Motion> {
  const frames: Motion["frames"] = [];
  const t0 = Date.now();
  const box = await card.boundingBox();
  if (box === null) throw new Error("the board isn't on screen to watch");
  const clip = {
    x: Math.round(box.x),
    y: Math.round(box.y),
    width: Math.round(box.width),
    height: Math.round(box.height),
  };
  const { boxes } = await card.evaluate(boxesIn);
  let last: Buffer | undefined;
  let same = 0;
  let lastChange = 0;
  for (;;) {
    const png = await page.screenshot({ type: "png", clip });
    const t = Number(((Date.now() - t0) / 1000).toFixed(2));
    const isNew =
      last === undefined ||
      (!png.equals(last) &&
        (await pixelsChanged(png, last).then((d) => d.changed > d.total * CHANGED_SHARE)));
    if (isNew) {
      frames.push({ picture: { png, width: clip.width, boxes }, t });
      last = png;
      same = 0;
      lastChange = t;
    } else same += 1;
    if (same >= 2 && (await isSettled())) return { frames, stillAfter: lastChange };
    if (frames.length >= spec.most) return { frames, stillChangingAt: t, stoppedBy: "most" };
    if (t >= MOTION_CAP) return { frames, stillChangingAt: t, stoppedBy: "cap" };
    await page.waitForTimeout(spec.every);
  }
}

/** The preview page for an address (`content/…` or `library/props/…`). */
export async function previewUrl(
  root: string,
  address: string,
  o: ShotOptions = {},
): Promise<string> {
  const url = new URL(await previewBase(root));
  const state =
    o.state === undefined || Object.keys(o.state).length === 0
      ? ""
      : `&state=${encodeURIComponent(JSON.stringify(o.state))}`;
  // A tool's board keeps time by each line's length (`timed`): it never waits for real sound.
  url.search = `?dev&timed&${previewQuery(address)}${state}${o.play ? "&earned" : ""}${o.locale === "hi" ? "&locale=hi" : ""}${o.width !== undefined && o.width !== PHONE_WIDTH ? `&width=${o.width}` : ""}${o.speed === undefined || o.speed === 1 ? "" : `&speed=${Number.isFinite(o.speed) ? o.speed : "jump"}`}`;
  return url.toString();
}

const READY_TIMEOUT = 30000;

const firstLine = (error: unknown): string =>
  (error instanceof Error ? error.message : String(error)).split("\n")[0] ?? "";

/**
 * The pages: one pool for the whole service, POOL pages at most, each loaded with the app. A call
 * borrows a page for as long as it draws and gives it back: nothing a call leaves on a page is
 * another's to rely on (every call opens its board afresh), so no page belongs to anyone, and the
 * pages open never grow past the pool. Moving a page to another board inside the app
 * (history.pushState, which the preview listens for) skips a page load, the slow part. A lane is
 * who is drawing (an agent's connection, a version's helper): its calls run one at a time. Errors
 * the page logs go to whichever call is drawing.
 */
type Lane = {
  page: Page;
  base: string;
  errors: string[];
  /** Content was rebuilt since this page last loaded: load it afresh, don't move it. */
  isStale: boolean;
  /** The code and content it was loaded under (content/inputs.ts): another, and it loads afresh. */
  loadedUnder?: string;
  /**
   * What ran on it was last taken at the end of its own drawing: nothing since is another call's,
   * so the next drawing needn't take it again before it starts.
   */
  isTaken?: boolean;
  /** What ran on it, read from its scripts (coverage is the page's, whoever drew on it). */
  reader?: RanReader;
};
/** The pages lent out, by the lane drawing on each. */
const lanes = new Map<string, Lane>();
const queues = new Map<string, Promise<unknown>>();
/**
 * How many pages one look draws its versions on at once: one per version (two languages, three
 * screens). Measured on a lesson pass: 15.4s on 3 pages, 12.7s on 6; about 0.4 GB a page.
 */
export const LOOK_PAGES = 6;
/**
 * How many pages there are at most, lent or not: one look's versions at once. About 0.4 GB a page
 * (the machine this runs on has 16 GB, and is full).
 */
const POOL = LOOK_PAGES;
/** The pages not lent out, loaded with the app: a page already on it only moves to the board. */
const idle: Lane[] = [];
/** How many pages there are (idle, lent, or being opened). */
let pages = 0;
/** Calls waiting for a page to be given back. */
const waiting: (() => void)[] = [];
let toppingUp: Promise<void> | undefined;
/** The lane of a caller that doesn't name one (scripts, tests). */
export const DEFAULT_LANE = "default";

/**
 * A page for this lane to draw on: the one it already has in this call, else an idle one (a fresh
 * one first), else a new one while the pool has room, else the next one given back.
 */
async function openPage(lane: string, base: string): Promise<Lane> {
  const kept = lanes.get(lane);
  if (kept !== undefined && kept.base === base && !kept.page.isClosed()) return kept;
  for (;;) {
    for (const gone of idle.filter((l) => l.page.isClosed())) {
      idle.splice(idle.indexOf(gone), 1);
      pages--;
    }
    const fresh = idle.findIndex((l) => l.base === base && !l.isStale);
    const any = fresh !== -1 ? fresh : idle.findIndex((l) => l.base === base);
    if (any !== -1) {
      const lent = idle.splice(any, 1)[0] as Lane;
      lanes.set(lane, lent);
      return lent;
    }
    if (pages < POOL) {
      pages++;
      try {
        const opened = await newPage(base);
        lanes.set(lane, opened);
        return opened;
      } catch (error) {
        pages--;
        throw error;
      }
    }
    // A page of another base (the dev server moved) is closed for one of this one.
    const other = idle.findIndex((l) => l.base !== base);
    if (other !== -1) {
      const old = idle.splice(other, 1)[0] as Lane;
      pages--;
      await old.page.close().catch(() => {});
      continue;
    }
    await new Promise<void>((done) => waiting.push(done));
  }
}

/** The pool as it stands: how many pages, idle and lent (to whom), and calls waiting (/health). */
export const poolState = () => ({
  pages,
  max: POOL,
  idle: idle.length,
  lent: [...lanes.keys()],
  waiting: waiting.length,
});

/** A lane's page given back to the pool, for the next call (the one waiting longest first). */
function givePageBack(lane: string): void {
  const lent = lanes.get(lane);
  lanes.delete(lane);
  if (lent !== undefined) {
    if (lent.page.isClosed()) pages--;
    else idle.push(lent);
  }
  waiting.shift()?.();
}

/** A page of the app's, not yet any lane's. */
async function newPage(base: string): Promise<Lane> {
  browser ??= launch();
  const page = await (await browser).newPage({
    viewport: { width: PHONE_WIDTH + 48, height: 900 },
    deviceScaleFactor: 2,
  });
  // tsx keeps function names with a helper the page doesn't have; give it one.
  await page.addInitScript("globalThis.__name = (f) => f;");
  // What runs on it, for what a review saw (recordRan).
  await page.coverage.startJSCoverage({ resetOnNavigation: false }).catch(() => {});
  const opened: Lane = { page, base, errors: [], isStale: false };
  page.on("console", (m) => {
    // The app asks the API who is signed in; previews don't need a server, so that one is noise.
    if (m.type() === "error" && !m.location().url.includes("/api/")) opened.errors.push(m.text());
  });
  page.on("pageerror", (e) => opened.errors.push(e.message));
  page.on("crash", () => void page.close().catch(() => {}));
  return opened;
}

/**
 * Fills the pool with pages loaded with the app (a tool's page, no board yet), and loads again the
 * idle ones a rebuild left stale. One top-up at a time, loading only while nothing is drawn.
 */
function topUp(base: string): Promise<void> {
  toppingUp ??= (async () => {
    // The preview (an `at=` address; a short one is its light tree view), which moves to a board
    // in place: the app's home doesn't.
    const load = async (l: Lane) => {
      await l.page
        .goto(`${base}/?dev&timed&at=content`, { waitUntil: "load", timeout: 30000 })
        .catch(() => {});
      l.isStale = false;
      l.errors.length = 0;
      // What loading it ran is set aside by the next drawing on it.
      l.isTaken = false;
    };
    try {
      for (;;) {
        // Loaded only while nothing is drawn: a page for later is never in a drawing's way.
        while (drawing.size > 0) await Promise.all([...drawing]);
        const stale = idle.find((l) => l.isStale && l.base === base && !l.page.isClosed());
        if (stale !== undefined) {
          idle.splice(idle.indexOf(stale), 1);
          await load(stale);
          idle.push(stale);
          waiting.shift()?.();
          continue;
        }
        if (pages >= POOL) break;
        pages++;
        const page = await newPage(base).catch(() => undefined);
        if (page === undefined) {
          pages--;
          break;
        }
        await load(page);
        idle.push(page);
        waiting.shift()?.();
      }
    } finally {
      toppingUp = undefined;
    }
  })();
  return toppingUp;
}

/** Fills the pool, so the first drawing doesn't wait for the app (the service, at start). */
export async function warmPages(root: string): Promise<void> {
  await topUp(await previewBase(root));
}

/**
 * A blank page of its own, for putting pictures together (picture.ts): never one of the app's
 * pages, so composing can't touch what was drawn or measured. Calls take turns.
 */
let composer: Promise<Page> | undefined;
let composing: Promise<unknown> = Promise.resolve();
export function onComposer<T>(fn: (page: Page) => Promise<T>): Promise<T> {
  const next = composing.then(async () => {
    browser ??= launch();
    const open = async () => {
      const page = await (await (browser as Promise<Browser>)).newPage({
        viewport: { width: 800, height: 600 },
      });
      // tsx keeps function names with a helper the page doesn't have; give it one.
      await page.evaluate("globalThis.__name = (f) => f;");
      return page;
    };
    composer ??= open();
    let page = await composer;
    if (page.isClosed()) {
      composer = open();
      page = await composer;
    }
    return fn(page);
  });
  composing = next.catch(() => {});
  return next;
}

/**
 * Closes the page a lane has in this call (it broke: the preview didn't answer), and its helpers'
 * (`<lane>:v:1`, …); a lane with none (its call ended, its page given back) leaves nothing to do.
 */
export async function closeLane(lane: string): Promise<void> {
  for (const one of [...lanes.keys()].filter((l) => l === lane || l.startsWith(`${lane}:v:`))) {
    const lent = lanes.get(one);
    lanes.delete(one);
    queues.delete(one);
    if (lent !== undefined) {
      pages--;
      await lent.page.close().catch(() => {});
    }
    waiting.shift()?.();
  }
}

/**
 * Drawing and rebuilding content never overlap: a rebuild rewrites build/, and the dev server
 * reloads every page showing it, so a page being drawn would be pulled away mid-call ("Execution
 * context was destroyed"). Draws run together; a rebuild waits for the draws already running,
 * and draws asked for after it wait for it. Afterwards every page loads afresh on its next call.
 */
let gate: Promise<unknown> = Promise.resolve();
const drawing = new Set<Promise<unknown>>();
const busy = new Set<string>();

function asDraw<T>(fn: () => Promise<T>): Promise<T> {
  return gate.then(() => {
    const p = fn();
    const settled = p.catch(() => {});
    drawing.add(settled);
    void settled.finally(() => drawing.delete(settled));
    return p;
  });
}

/** Runs `fn` (a content rebuild) with nothing drawing, then marks every page to load afresh. */
export function withNothingDrawing<T>(fn: () => Promise<T>): Promise<T> {
  const run = gate.then(async () => {
    await Promise.all([...drawing]);
    try {
      return await fn();
    } finally {
      for (const lane of [...lanes.values(), ...idle]) lane.isStale = true;
      const base = idle[0]?.base ?? [...lanes.values()][0]?.base;
      if (base !== undefined) void topUp(base);
    }
  });
  gate = run.catch(() => {});
  return run;
}

/** How many times a drawing is tried when the page keeps being pulled away under it. */
const PULLED_AWAY_TRIES = 4;

/** A page pulled away mid-call (a reload, a navigation): worth another try on a fresh load. */
const isPulledAway = (error: unknown): boolean =>
  /Execution context was destroyed|not attached to the DOM|Target (page, context or browser )?(has been )?closed|frame was detached|navigation/i.test(
    firstLine(error),
  );

/** What steps ask of a board: the steps, which pictures, and frames over time. */
export type Act = {
  steps: Step[];
  shots: "each" | "last" | "none";
  frames?: FramesSpec;
};

/** The browser's version: text is drawn by it, and it updates itself. */
async function browserVersion(): Promise<string> {
  browser ??= launch();
  return (await browser).version();
}

/** A drawing the same every time: the board settled, and the page logged no errors. */
function isSettledClean(d: Drawn): boolean {
  return (
    d.runningAtOpen === undefined &&
    d.shots.every((s) => s.errors.length === 0 && s.running === undefined)
  );
}

/**
 * Each board at `board` (one board, or a whole lesson) drawn, from its start: every call opens it
 * afresh, so the same call always draws the same. With `steps`, a single board acted on first, a
 * picture after each step if asked. A lane's calls run one at a time; different lanes (agent
 * connections) draw at once, each on its own page. A call that the page is pulled away from
 * (content reloaded under it) is tried again from a fresh load, a few times at most.
 */

export function shoot(
  root: string,
  board: string,
  o: ShotOptions = {},
  act?: Act,
  lane: string = DEFAULT_LANE,
): Promise<Drawn> {
  const once = async (): Promise<{ drawn: Drawn; ran?: Ran }> => {
    const drawn = await shootNow(root, board, o, act, lane);
    // Not recorded, what ran stays on the page, set aside before the next drawing that records.
    if (o.recordsRan === true || o.keepsRan === true) {
      const ran = await timed("coverage: recorded after", () =>
        recordRan(root, board, lane, o.recordsRan === true),
      );
      return ran === undefined ? { drawn } : { drawn, ran };
    }
    const at = lanes.get(lane);
    if (at !== undefined) at.isTaken = false;
    return { drawn };
  };
  // Drawn once per set of inputs (draw-cache.ts): the same inputs give the same drawing.
  const isKeepable =
    isDrawCacheOn() && (o.speed ?? 1) === Number.POSITIVE_INFINITY && act?.frames === undefined;
  const wants = o.recordsRan === true || o.keepsRan === true;
  const ask = keyOf({ o: { ...o, recordsRan: undefined, keepsRan: undefined }, act });
  const inputs = async () =>
    keyOf({
      code: codeKey(root),
      content: contentKey(root, board),
      browser: await browserVersion(),
    });
  const next = (queues.get(lane) ?? Promise.resolve()).then(() =>
    asDraw(async () => {
      busy.add(lane);
      try {
        // A page pulled away (the dev server reloading it after a rebuild or an edit, which can
        // land more than once) is tried again from a fresh load, a few times at most.
        // Worked out after the gate: never halfway through a rebuild.
        const before = isKeepable ? await inputs() : "";
        if (isKeepable) {
          const kept = readKept<Drawn>(root, board, ask, before);
          // A look that records what ran needs the lines kept with it; without them, drawn again.
          if (kept !== undefined && (!wants || kept.ran !== undefined)) {
            if (o.recordsRan === true && kept.ran !== undefined) addRanTo(root, board, kept.ran);
            return kept.drawn;
          }
        }
        for (let attempt = 1; ; attempt++) {
          try {
            const made = await once();
            // Kept only if it is what these inputs always give: nothing changed under it, nothing
            // still running, no errors the page logged.
            if (isKeepable && isSettledClean(made.drawn) && (await inputs()) === before)
              keep(root, board, ask, before, made);
            return made.drawn;
          } catch (error) {
            if (!isPulledAway(error) || attempt >= PULLED_AWAY_TRIES) throw error;
            const at = lanes.get(lane);
            if (at !== undefined) {
              at.isStale = true;
              await at.page.waitForLoadState("load", { timeout: 5000 }).catch(() => {});
            }
          }
        }
      } finally {
        busy.delete(lane);
        // The page goes back to the pool: the next call, anyone's, draws on it.
        givePageBack(lane);
      }
    }),
  );
  queues.set(
    lane,
    next.catch(() => {}),
  );
  return next;
}

/** A page's reader: what loaded is the page's, whoever drew on it. */
function readerOf(at: Lane, root: string): RanReader {
  at.reader ??= new RanReader(root);
  return at.reader;
}

/** What ran on a lane's page since this was last asked (coverage taken and started again). */
async function takeRan(lane: string) {
  const page = lanes.get(lane)?.page;
  if (page === undefined || page.isClosed()) return [];
  try {
    const coverage = await page.coverage.stopJSCoverage();
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
    return coverage;
  } catch {
    return [];
  }
}

/**
 * Keeps what ran while one built board was looked at or played (reach/ran.ts): a hint for the
 * next review, so never a reason for a call to fail.
 */
async function recordRan(
  root: string,
  board: string,
  lane: string,
  isAdded: boolean,
): Promise<Ran | undefined> {
  const coverage = await timed("coverage: take", () => takeRan(lane));
  const at = lanes.get(lane);
  if (at === undefined) return undefined;
  at.isTaken = true;
  try {
    const lines = await timed("coverage: to lines", async () =>
      readerOf(at, root).linesOf(coverage),
    );
    if (isAdded) addRanTo(root, board, lines);
    return lines;
  } catch {
    return undefined; // only a hint
  }
}

/** Lines that ran, added to what the review saw of a built board (reach/ran.ts). */
function addRanTo(root: string, board: string, lines: Ran): void {
  const path = board.replace(/^content\//, "");
  if (!existsSync(join(root, "build", "review", `${path}.json`))) return;
  try {
    addRan(root, path, lines);
  } catch {
    // only a hint
  }
}

/**
 * Waits until the page has drawn: fonts, images, finite animations, then two frames. Without
 * `isForPicture`, only the frames: what the page says doesn't wait for an animation to end.
 */
async function settle(page: Page, isForPicture = true): Promise<void> {
  if (!isForPicture) {
    await page.evaluate(async () => {
      const frame = () => new Promise((done) => requestAnimationFrame(() => done(null)));
      await frame();
      await frame();
    });
    return;
  }
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
  events: { kind?: string; actor?: string; payload?: unknown }[];
  /** How many events there have been in all (the list keeps the recent ones only). */
  eventCount: number;
  passed: string[];
  heard: Heard[];
};
const recorded = (page: Page): Promise<Recorded> =>
  page.evaluate(() => {
    const w = window as unknown as {
      __chalkEvents?: unknown[];
      __chalkEventCount?: number;
      __chalkPassed?: string[];
      __chalkHeard?: () => unknown[];
    };
    return {
      events: [...(w.__chalkEvents ?? [])],
      eventCount: w.__chalkEventCount ?? 0,
      passed: [...(w.__chalkPassed ?? [])],
      // Copies: a line cut later is marked on the board's own record, not on this one.
      heard: JSON.parse(JSON.stringify(w.__chalkHeard?.() ?? [])),
    } as never;
  });

const stepWords = (step: Step): string =>
  `${
    "tap" in step
      ? `tap ${step.tap}${step.at === undefined ? "" : ` at ${pointWords(step.at)}`}`
      : "drag" in step
        ? `drag ${step.drag} to ${pointWords(step.to)}`
        : `call ${step.call}${step.args !== undefined && Object.keys(step.args).length > 0 ? ` ${JSON.stringify(step.args)}` : ""}`
  }${step.during === undefined ? "" : ` while ${step.during} is said`}`;
const pointWords = (p: Point) => (p.y === undefined ? `${p.x}` : `(${p.x}, ${p.y})`);

/**
 * Finds what a step names on the board and marks it (data-chalk-target), or says what is there.
 * `text` picks, inside the piece or part, the clickable thing whose words include it (maths read
 * as its TeX too, so "x^2 - 4" or "x² − 4" both work). `at`: a point in the prop's own units,
 * placed through the frame the target is drawn in (the frame's picture carries its map); the
 * answer is then where that point is on the page, in CSS pixels.
 */
export function markTarget(arg: {
  target: string;
  at?: { x: number; y?: number };
}): string | { x: number; y: number } | null {
  for (const old of document.querySelectorAll("[data-chalk-target]"))
    old.removeAttribute("data-chalk-target");
  // The player writes each node's address on it (data-path): one exact match.
  const piece = arg.target.split("/")[0] ?? "";
  const pieceEl = document.querySelector<HTMLElement>(`[data-piece="${CSS.escape(piece)}"]`);
  if (pieceEl === null) {
    const names = [...document.querySelectorAll<HTMLElement>("[data-piece]")].map(
      (e) => e.dataset.piece,
    );
    return `no piece "${piece}" on screen (shown now: ${names.join(", ")}). In play, a piece can stay hidden until the ones before it are answered.`;
  }
  // One name, one thing: two with the same name is an error, never the first of them.
  const named = [
    ...document.querySelectorAll<HTMLElement>(`[data-path="${CSS.escape(arg.target)}"]`),
  ];
  if (named.length > 1)
    return `${named.length} things are named "${arg.target}": a name must be unique on the board (give each a key)`;
  const el: HTMLElement | null = named[0] ?? null;
  if (el === null) {
    const paths = [...pieceEl.querySelectorAll<HTMLElement>("[data-part]")].map(
      (e) => e.dataset.path ?? "",
    );
    // Sorted: the same parts read the same, whatever order the page draws them in.
    return `no part "${arg.target}" (parts: ${[...new Set(paths)].sort().join(", ") || "none"})`;
  }
  (el as HTMLElement).setAttribute("data-chalk-target", "");
  if (arg.at === undefined) return null;
  // Aiming: the frame this is drawn in, or the one it draws (a plane aimed at directly).
  type Mapped = Element & {
    __chalkFrame?: {
      toPx: (x: number, y: number) => readonly [number, number];
      width: number;
      height: number;
    };
  };
  const frameEl = (el.closest("[data-frame]") ?? el.querySelector("[data-frame]")) as Mapped | null;
  const map = frameEl?.__chalkFrame;
  if (frameEl === null || map === undefined)
    return `${arg.target} has no coordinate system to aim in (no frame drawn there)`;
  const [fx, fy] = map.toPx(arg.at.x, arg.at.y ?? 0);
  const box = frameEl.getBoundingClientRect();
  return {
    x: box.left + (fx / map.width) * box.width,
    y: box.top + (fy / map.height) * box.height,
  };
}

async function shootNow(
  root: string,
  board: string,
  o: ShotOptions,
  act: Act | undefined,
  lane: string,
): Promise<Drawn> {
  // Every call draws the board from its start (a new run: the preview remounts it), so the same
  // call always draws the same. Steps hold the board's clock until each says where it is done.
  const isActed = act !== undefined && act.steps.length > 0;
  const speed = o.speed ?? 1;
  const isJumping = speed === Number.POSITIVE_INFINITY;
  if (isActed && !isJumping && act.steps.some((s) => s.during !== undefined))
    throw new Error("`during` needs the board's clock to jump: drop `speed` and `frames`.");
  const url = `${await previewUrl(root, shownAddress(board), o)}&shot&run=${++runs}${isActed && isJumping ? "&hold" : ""}`;
  const target = new URL(url);
  const base = target.origin;
  const at = await openPage(lane, base);
  const { page } = at;
  // What ran on this page before this call (it loading, other boards) isn't this board's: set
  // aside before a drawing that records, unless the page's last drawing took it already. A drawing
  // that doesn't record touches no coverage: taking it costs most of a drawing (the browser sends
  // every script's text again).
  if ((o.recordsRan === true || o.keepsRan === true) && at.isTaken !== true)
    readerOf(at, root).see(await timed("coverage: taken before", () => takeRan(lane)));
  at.errors.length = 0;
  await timed("move to the board", async () => {
    await page.setViewportSize({
      width: (o.width ?? PHONE_WIDTH) + 48,
      height: o.height ?? PHONE_HEIGHT,
    });
    // A page loaded under other code or content keeps what it loaded then (a chapter's sound
    // lengths, modules): it loads afresh, so what it draws is what these inputs give.
    const loadKey = buildInputsKey(root);
    const isOnApp = page.url().startsWith(base) && !at.isStale && at.loadedUnder === loadKey;
    at.isStale = false;
    at.loadedUnder = loadKey;
    try {
      if (isOnApp)
        await page.evaluate((q) => {
          history.pushState(null, "", q);
          dispatchEvent(new PopStateEvent("popstate"));
        }, `${target.pathname}${target.search}`);
      else await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
    } catch (error) {
      // The page was reloaded under us (the dev server after a code or style edit): the retry
      // around every drawing handles that, so it must see the error as it is.
      if (isPulledAway(error)) throw error;
      await closeLane(lane);
      throw new Error(
        `The preview server didn't answer at ${url} (${firstLine(error)}). Start it with \`pnpm dev\` in platform/apps/learner (or set CHALK_PREVIEW_URL), then retry.`,
      );
    }
    try {
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
      await closeLane(lane);
      throw new Error(
        [
          `The board didn't finish drawing within ${READY_TIMEOUT / 1000}s at ${url}.`,
          `The page shows: ${shown === "" ? "(nothing)" : JSON.stringify(shown)}`,
          at.errors.length > 0 ? `Page errors:\n${at.errors.join("\n")}` : "No page errors.",
          "If it's still loading, content may be rebuilding: retry. Otherwise open the URL to see it.",
        ].join("\n"),
      );
    }
  });
  const empty = await page.$(".preview-empty");
  if (empty !== null)
    throw new Error(`${(await empty.textContent()) ?? "Nothing to show"} (at ${url}).`);
  // Which build the page is drawing: a rebuild redraws its boards from the start (preview-shell.tsx),
  // and what was read across it would mix two boards.
  const buildAt = () => page.evaluate(() => document.body.dataset.previewBuild ?? "");
  const drawnFrom = await timed("read: which build", buildAt);
  // The board as it opens has played to its end (its opening script done, anything it set going
  // finished); with steps, to where the first step is done.
  const first = act?.steps[0];
  const runningAtOpen =
    isActed && isJumping ? [] : await timed("wait: board idle", () => untilIdle(page, speed));
  const steps: StepResult[] = [];
  let before: Picture | undefined;
  let heardAtOpen: Heard[] = [];
  if (isActed) {
    if ((await page.$$(".preview-card")).length !== 1)
      throw new Error("Steps act on one board: name a board, not a lesson.");
    // A step whose line never comes can't be done as asked: it says so, and nothing after it runs.
    const missed = isJumping ? await reach(page, first?.during) : undefined;
    await settle(page, act.shots !== "none");
    if (act.shots !== "none") before = await pictureOf(page.locator(".preview-card").first());
    let seen = await recorded(page);
    heardAtOpen = seen.heard;
    let modelWas = [...(await readModels(page)).values()][0];
    let unreached = first?.during === undefined ? undefined : missed;
    // The board still busy when the first step comes (no line asked for): said with that step.
    const busyAtFirst = first?.during === undefined ? missed : undefined;
    for (const [i, step] of act.steps.entries()) {
      const words = stepWords(step);
      if (unreached !== undefined) {
        steps.push({ step: words, events: [], passed: false, errors: [unreached] });
        break;
      }
      at.errors.length = 0;
      if (i === 0 && busyAtFirst !== undefined) at.errors.push(busyAtFirst);
      // Nothing moves while the step is done: the clock goes on once it says where to.
      if (isJumping) await jumpTo(page, { kind: "here" });
      if ("call" in step) {
        const refused = await page.evaluate(
          ([on, action, args]) =>
            (
              window as {
                __chalkCall?: (piece: string, a: string, x: unknown) => string | undefined;
              }
            ).__chalkCall?.(on, action, args) ?? undefined,
          [step.on, step.call, step.args ?? {}] as const,
        );
        if (refused !== undefined) {
          steps.push({ step: words, events: [], passed: false, errors: [`✗ ${refused}`] });
          break;
        }
      } else {
        const found = await page.evaluate(markTarget, {
          target: "tap" in step ? step.tap : step.drag,
          at: "tap" in step ? step.at : step.to,
        });
        if (typeof found === "string") {
          steps.push({ step: words, events: [], passed: false, errors: [`✗ ${found}`] });
          break;
        }
        // Where the step is aimed, when it names a point: on the page, in CSS pixels.
        const aimed = found ?? undefined;
        const target = page.locator("[data-chalk-target]").first();
        // A control that is turned off can't be tapped: say so, rather than wait for it.
        const isOff = await target.evaluate(
          (el) =>
            el.closest("[disabled]") !== null || el.closest('[aria-disabled="true"]') !== null,
        );
        if (isOff) {
          steps.push({
            step: words,
            events: [],
            passed: false,
            errors: [`✗ ${"tap" in step ? step.tap : step.drag} is turned off now (disabled)`],
          });
          break;
        }
        if ("tap" in step) {
          if (aimed !== undefined) await page.mouse.click(aimed.x, aimed.y);
          else
            await target.click({ timeout: 5000 }).catch(async (error: unknown) => {
              // A target with no area (a line with a wide, clear stroke: an axis's half) reads as
              // not visible: a finger taps its middle all the same, through the page's own hit test.
              if (!/not visible/.test(firstLine(error) + String(error))) throw error;
              await target.scrollIntoViewIfNeeded({ timeout: 5000 });
              const box = await target.boundingBox();
              if (box === null) throw error;
              await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            });
        } else {
          await target.scrollIntoViewIfNeeded({ timeout: 5000 });
          const box = await target.boundingBox();
          if (box === null) throw new Error(`${step.drag} isn't on screen`);
          const x = box.x + box.width / 2;
          const y = box.y + box.height / 2;
          const to = aimed ?? { x, y };
          await page.mouse.move(x, y);
          await page.mouse.down();
          await page.mouse.move(to.x, to.y, { steps: 12 });
          await page.mouse.up();
        }
      }
      const isLast = i === act.steps.length - 1;
      const isPictured = act.shots === "each" || (act.shots === "last" && isLast);
      // What the step did runs to where the next step is done (its line, or the board's end).
      const next = act.steps[i + 1];
      // With frames asked for, the board is watched as it moves; else read once it has settled.
      const motion =
        act.frames === undefined
          ? undefined
          : await watchMotion(
              page,
              page.locator(".preview-card").first(),
              act.frames,
              async () => (await busyNow(page)).length === 0,
            );
      if (isJumping) {
        const why = await reach(page, next?.during);
        if (why !== undefined && next?.during !== undefined) unreached = why;
        else if (why !== undefined) at.errors.push(why);
      } else {
        const running = motion === undefined ? await untilIdle(page, speed) : await busyNow(page);
        if (running.length > 0)
          at.errors.push(
            motion === undefined ? stillRunning(running) : `still running: ${running.join(", ")}`,
          );
      }
      await settle(page, isPictured);
      const now = await recorded(page);
      const modelNow = [...(await readModels(page)).values()][0];
      const changed = seenChanges(modelWas, modelNow);
      modelWas = modelNow;
      steps.push({
        step: words,
        changed,
        ...(motion === undefined ? {} : { motion }),
        // The events since the last read, by how many there have been: the list stops growing
        // once full, so its length can't say.
        events: now.events
          .slice(Math.max(0, now.events.length - (now.eventCount - seen.eventCount)))
          .map((e) => `${e.kind ?? "?"} ${e.actor ?? "?"} ${JSON.stringify(e.payload ?? null)}`),
        heard: now.heard.slice(seen.heard.length),
        passed: now.passed.length > seen.passed.length,
        errors: [...at.errors],
        ...(isPictured ? { picture: await pictureOf(page.locator(".preview-card").first()) } : {}),
      });
      seen = now;
    }
    // Steps stopped short (a name not there, a line that never came): the board where they stopped.
    const last = steps.at(-1);
    if (last !== undefined && last.picture === undefined && act.shots !== "none")
      last.picture = await pictureOf(page.locator(".preview-card").first());
  } else await timed("wait: fonts, images, frames", () => settle(page));
  const cards = await page.locator(".preview-card").all();
  const shots: Shot[] = [];
  const models = await timed("read: board state", () => readModels(page));
  for (const card of cards) {
    const name = (await card.getAttribute("data-board")) ?? board;
    const overflow = await timed("read: layout problems", () => card.evaluate(layoutProblems));
    const parts = await timed("read: parts", () =>
      card.evaluate((c) => {
        const out: Record<string, string[]> = {};
        for (const piece of c.querySelectorAll<HTMLElement>("[data-piece]")) {
          const names = [...piece.querySelectorAll<HTMLElement>("[data-part]")].map(
            (p) => p.dataset.path ?? p.dataset.part ?? "",
          );
          if (names.length > 0) out[piece.dataset.piece ?? "?"] = [...new Set(names)];
        }
        return out;
      }),
    );
    // After steps, the picture is the steps' to give (or not): don't take another.
    const pictures = o.pictures ?? "full";
    const picture =
      isActed || pictures === "none"
        ? undefined
        : await timed("screenshot", () => pictureOf(card, pictures));
    shots.push({
      board: name.replace(/\.json$/, ""),
      png: picture?.png ?? Buffer.alloc(0),
      width: picture?.width ?? 0,
      boxes: picture?.boxes ?? (await card.evaluate(boxesIn)).boxes,
      parts,
      overflow,
      errors: [...at.errors],
      ...(models.has(name.replace(/\.json$/, ""))
        ? { model: models.get(name.replace(/\.json$/, "")) }
        : {}),
      ...(runningAtOpen.length > 0 && !isActed ? { running: runningAtOpen } : {}),
    });
  }
  const props =
    o.withProps === true
      ? await page.evaluate(
          () => (window as { __chalkProps?: () => unknown }).__chalkProps?.() as PropPage[],
        )
      : undefined;
  // Redrawn by a rebuild while it was read: what was read is from two boards. The same as a page
  // pulled away (a reload): drawn again from the start, by the retry around every drawing.
  if ((await timed("read: which build", buildAt)) !== drawnFrom)
    throw new Error("navigation: a rebuild redrew the board while it was read");
  return {
    shots,
    steps,
    ...(before === undefined ? {} : { before }),
    ...(runningAtOpen.length > 0 ? { runningAtOpen } : {}),
    ...(heardAtOpen.length > 0 ? { heardAtOpen } : {}),
    ...(props === undefined ? {} : { props }),
  };
}
