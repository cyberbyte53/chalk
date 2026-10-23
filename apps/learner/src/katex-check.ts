import { mathHtml } from "@chalk/player";
/**
 * Development only (`?dev&...&katexcheck`): finds which style rule breaks KaTeX's stacking in this
 * browser. A formula is laid out right when its "=" sits level with the number before it; the
 * check turns each stylesheet off, then each rule of a guilty sheet, and reports what fixes it.
 */

/** How far (in px) the first "=" sits from the first numeral of the first display formula. */
function drift(root: ParentNode = document): number | null {
  const formula = root.querySelector(".katex-display");
  const rel = formula?.querySelector(".mrel");
  if (formula == null || rel == null) return null;
  const walk = document.createTreeWalker(formula, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n !== null; n = walk.nextNode()) {
    if (!/\d/.test(n.textContent ?? "")) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const a = range.getBoundingClientRect();
    const b = rel.getBoundingClientRect();
    return Math.abs(a.top + a.height / 2 - (b.top + b.height / 2));
  }
  return null;
}

const isRight = (): boolean => {
  const d = drift();
  return d !== null && d < 6;
};

function report(lines: string[]): void {
  const box = document.createElement("pre");
  box.style.cssText =
    "position:fixed;left:8px;right:8px;bottom:8px;max-height:45vh;overflow:auto;z-index:99999;" +
    "background:#111;color:#0f0;font:12px/1.4 monospace;padding:10px;border-radius:8px;white-space:pre-wrap";
  box.textContent = lines.join("\n");
  document.body.append(box);
}

export function runKatexCheck(): void {
  const lines: string[] = [`UA: ${navigator.userAgent}`];
  const tiny = document.createElement("span");
  tiny.style.cssText = "font-size:1px;line-height:normal;position:absolute;visibility:hidden";
  tiny.textContent = "x";
  document.body.append(tiny);
  lines.push(
    `1px text renders ${tiny.getBoundingClientRect().height.toFixed(1)}px tall (≈1 is fine; ≥9 means a minimum font size is set)`,
  );
  tiny.remove();
  const d = drift();
  lines.push(
    `drift of "=" from the first number: ${d === null ? "no formula found" : `${d.toFixed(1)}px`} → ${isRight() ? "LAID OUT RIGHT" : "BROKEN"}`,
  );
  const force = new URLSearchParams(window.location.search).get("katexcheck") === "all";
  if (d === null || (isRight() && !force)) {
    report(lines);
    return;
  }

  // The same formula alone on the page, outside the app's boxes: if it breaks too, it's Safari + KaTeX.
  const alone = document.createElement("div");
  alone.style.cssText = "position:absolute;left:0;top:0;width:600px;background:#fff";
  alone.innerHTML = mathHtml(
    "\\underbrace{20}_{\\text{sweets}} = \\underbrace{6}_{\\text{friends}}",
    true,
  );
  document.body.append(alone);
  const lone = drift(alone);
  alone.remove();
  lines.push(
    `same formula alone on the page: ${lone === null ? "?" : `${lone.toFixed(1)}px`} → ${lone !== null && lone < 6 ? "RIGHT" : "BROKEN"}`,
  );

  const sheets = [...document.styleSheets];
  // Every rule of every sheet, one at a time (the guilty rule may share a sheet with KaTeX's own).
  for (const sheet of sheets) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (let r = rules.length - 1; r >= 0; r--) {
      const text = rules[r]?.cssText ?? "";
      if (text.startsWith("@font-face")) continue;
      sheet.deleteRule(r);
      if (isRight()) lines.push(`FIXED by removing rule: ${text.slice(0, 300)}`);
      sheet.insertRule(text, r);
    }
  }
  for (const [i, sheet] of sheets.entries()) {
    const owner = sheet.ownerNode as HTMLElement | null;
    const name = sheet.href ?? owner?.getAttribute("data-vite-dev-id") ?? `sheet ${i}`;
    sheet.disabled = true;
    const fixes = isRight();
    sheet.disabled = false;
    if (!fixes) continue;
    lines.push(`FIXED by turning off: ${name}`);
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (let r = rules.length - 1; r >= 0; r--) {
      const text = rules[r]?.cssText ?? "";
      sheet.deleteRule(r);
      if (isRight()) lines.push(`  rule: ${text.slice(0, 300)}`);
      sheet.insertRule(text, r);
    }
  }
  if (!lines.some((l) => l.startsWith("FIXED")))
    lines.push("No single stylesheet fixes it: KaTeX's own CSS in this browser.");
  report(lines);
}
