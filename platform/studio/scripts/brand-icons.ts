import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findUp } from "../src/find-up";

/**
 * The icons a platform crops itself, made from the logo (platform/apps/learner/brand/README.md):
 * full-bleed in the frame's brown with the design inside, since iOS rounds the corners of
 * `apple-touch-icon.png` (the design fills it) and Android crops `icon-maskable-512.png` to its own
 * shape (the design stays in the safe 80%). Run from platform/studio: `pnpm brand-icons`.
 */
const root = dirname(findUp("pnpm-workspace.yaml", dirname(fileURLToPath(import.meta.url))));
const app = join(root, "platform/apps/learner");
const BROWN = "#A8703F";
const ICONS = [
  { file: "apple-touch-icon.png", size: 180, share: 1 },
  { file: "icon-maskable-512.png", size: 512, share: 0.8 },
] as const;

const svg = readFileSync(join(app, "brand/chalk-icon.svg")).toString("base64");
const { chromium } = await import("playwright-core");
const browser = await chromium.launch({ channel: "chrome" });
for (const { file, size, share } of ICONS) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const side = Math.round(size * share);
  const at = Math.round((size - side) / 2);
  await page.setContent(
    `<body style="margin:0;background:${BROWN}"><img src="data:image/svg+xml;base64,${svg}" style="position:absolute;left:${at}px;top:${at}px;width:${side}px;height:${side}px"></body>`,
  );
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(app, "public", file) });
  await page.close();
  console.log(`✓ ${file}`);
}
await browser.close();
