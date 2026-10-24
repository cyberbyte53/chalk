/**
 * `pnpm boundaries`: the layers import one way only.
 *
 *   content/  →  library/  →  platform/packages/
 *
 * The core (`platform/packages`) never imports a prop, a pattern or a book; the library never
 * imports a book; a book imports the library and the core. The apps and the studio
 * (`platform/apps`, `platform/studio`) assemble everything, so they may import any layer. Checked
 * on every workspace package's `package.json` dependencies and on every `import … from "@chalk/…"`
 * in its sources. Fails with the offending lines.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const Layer = {
  Core: "core",
  Library: "library",
  Content: "content",
  Assembly: "assembly",
} as const;
export type Layer = (typeof Layer)[keyof typeof Layer];

/** What each layer may import. */
const ALLOWED: Record<Layer, readonly Layer[]> = {
  [Layer.Core]: [Layer.Core],
  [Layer.Library]: [Layer.Library, Layer.Core],
  [Layer.Content]: [Layer.Content, Layer.Library, Layer.Core],
  [Layer.Assembly]: [Layer.Assembly, Layer.Content, Layer.Library, Layer.Core],
};

type Pkg = { name: string; dir: string; layer: Layer };

/** Which layer a workspace folder belongs to, from where it sits. */
export function layerOf(dirFromRoot: string): Layer | undefined {
  const [top, second] = dirFromRoot.split("/");
  if (top === "library") return Layer.Library;
  if (top === "content") return Layer.Content;
  if (top !== "platform") return undefined;
  return second === "packages" ? Layer.Core : Layer.Assembly;
}

function workspaceDirs(root: string): string[] {
  const yaml = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8");
  const dirs: string[] = [];
  for (const line of yaml.split("\n")) {
    const m = /^\s*-\s*(\S+)/.exec(line);
    if (!m?.[1]) continue;
    const pattern = m[1];
    if (pattern.endsWith("/*")) {
      const parent = pattern.slice(0, -2);
      for (const name of readdirSync(join(root, parent))) {
        if (statSync(join(root, parent, name)).isDirectory()) dirs.push(`${parent}/${name}`);
      }
    } else dirs.push(pattern);
  }
  return dirs;
}

function packagesOf(root: string): Pkg[] {
  const pkgs: Pkg[] = [];
  for (const dir of workspaceDirs(root)) {
    const file = join(root, dir, "package.json");
    let name: string;
    try {
      name = JSON.parse(readFileSync(file, "utf8")).name;
    } catch {
      continue;
    }
    const layer = layerOf(dir);
    if (layer === undefined) throw new Error(`${dir} is outside platform/, library/ and content/`);
    pkgs.push({ name, dir, layer });
  }
  return pkgs;
}

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      if (name === "node_modules" || name === "dist" || name === "build" || name.startsWith("."))
        continue;
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(ts|tsx)$/.test(name)) out.push(full);
    }
  };
  walk(dir);
  return out;
}

/** Every crossing of the one-way rule, as "file: imports X (layer) from layer". */
export function boundaryBreaks(root: string): string[] {
  const pkgs = packagesOf(root);
  const layerByName = new Map(pkgs.map((p) => [p.name, p.layer]));
  const breaks: string[] = [];
  const check = (from: Pkg, dep: string, where: string) => {
    const to = layerByName.get(dep);
    if (to === undefined || ALLOWED[from.layer].includes(to)) return;
    breaks.push(`${where}: ${from.layer} imports ${dep} (${to})`);
  };
  for (const pkg of pkgs) {
    const manifest = JSON.parse(readFileSync(join(root, pkg.dir, "package.json"), "utf8"));
    for (const field of ["dependencies", "devDependencies", "peerDependencies"]) {
      for (const dep of Object.keys(manifest[field] ?? {}))
        check(pkg, dep, `${pkg.dir}/package.json`);
    }
    for (const file of sourceFiles(join(root, pkg.dir))) {
      const text = readFileSync(file, "utf8");
      for (const m of text.matchAll(/from\s+"(@chalk\/[^"/]+)/g)) {
        if (m[1] !== undefined) check(pkg, m[1], relative(root, file));
      }
    }
  }
  return [...breaks, ...rendererBreaks(root)];
}

/**
 * One renderer: the tools agents use to look at boards (platform/studio/src/mcp) never draw one
 * themselves. They open the app's preview, which draws with the player. So they import no
 * player, prop, drawing or UI code.
 */
const DRAWING = /from\s+"(@chalk\/(?:player|draw|look|library|prop-[^"/]+)|preact[^"]*)"/g;
export function rendererBreaks(root: string): string[] {
  const dir = join(root, "platform", "studio", "src", "mcp");
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const file of sourceFiles(dir))
    for (const m of readFileSync(file, "utf8").matchAll(DRAWING))
      out.push(
        `${relative(root, file)}: imports ${m[1]}; look at boards through the preview instead`,
      );
  return out;
}
