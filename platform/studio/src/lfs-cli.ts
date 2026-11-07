import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * `pnpm check`'s lfs step: big files (voice clips, PDFs, zips, authoring images; .gitattributes
 * names them) live in Git LFS, never in git itself. It fails when this machine's git doesn't send
 * them to LFS, when one is in git as itself, or when any other file over 1 MB isn't in LFS: name its
 * kind in .gitattributes.
 */
const root = join(dirname(new URL(import.meta.url).pathname), "../../..");
const git = (...args: string[]) =>
  execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });

/** Above this a file belongs in LFS, whatever its kind. */
const BIG = 1 << 20;
/** An LFS pointer is a few lines of text. */
const POINTER = 1024;

const problems: string[] = [];

let filter = "";
try {
  filter = git("config", "--get", "filter.lfs.clean").trim();
} catch {
  // Not set: reported below.
}
if (filter === "")
  problems.push(
    "git here doesn't send big files to LFS: run `brew install git-lfs && git lfs install`",
  );

/** Whether .gitattributes sends each path to LFS. */
const inLfs = (paths: string[]): Set<string> => {
  if (paths.length === 0) return new Set();
  const out = execFileSync("git", ["check-attr", "--stdin", "-z", "filter"], {
    cwd: root,
    input: paths.join("\0"),
    encoding: "utf8",
    maxBuffer: 1 << 26,
  }).split("\0");
  const lfs = new Set<string>();
  for (let i = 0; i + 2 < out.length; i += 3) if (out[i + 2] === "lfs") lfs.add(out[i] ?? "");
  return lfs;
};

// In git (staged included): what LFS should hold must be a pointer; nothing else may be big.
const indexed = git("ls-files", "-z", "--format=%(objectname) %(objectsize) %(path)")
  .split("\0")
  .filter(Boolean)
  .map((l) => {
    const [object = "", size = "0", ...path] = l.split(" ");
    return { object, size: Number(size), path: path.join(" ") };
  });
const lfs = inLfs(indexed.map((f) => f.path));
for (const f of indexed) {
  if (lfs.has(f.path)) {
    const pointer =
      f.size < POINTER && git("cat-file", "blob", f.object).startsWith("version https://git-lfs");
    if (!pointer)
      problems.push(`${f.path} is in git as itself, not in LFS: git add --renormalize ${f.path}`);
  } else if (f.size > BIG)
    problems.push(
      `${f.path} is ${(f.size / BIG).toFixed(1)} MB in git: name its kind in .gitattributes`,
    );
}

// Not yet added: a big file whose kind LFS doesn't take would go into git.
const fresh = git("ls-files", "-z", "--others", "--exclude-standard").split("\0").filter(Boolean);
const freshLfs = inLfs(fresh);
for (const path of fresh) {
  const size = statSync(join(root, path), { throwIfNoEntry: false })?.size ?? 0;
  if (size > BIG && !freshLfs.has(path))
    problems.push(
      `${path} is ${(size / BIG).toFixed(1)} MB and not an LFS kind: name its kind in .gitattributes`,
    );
}

for (const p of problems) console.error(`  ✗ ${p}`);
if (problems.length > 0) {
  console.error(`✗ ${problems.length} big file${problems.length === 1 ? "" : "s"} not in Git LFS`);
  process.exit(1);
}
console.log(`✓ big files in Git LFS (${lfs.size} there)`);
