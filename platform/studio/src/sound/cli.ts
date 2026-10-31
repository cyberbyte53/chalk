import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type LibraryList, type LibrarySound, libraryIndex, libraryListSchema } from "./library";

/**
 * `pnpm sound add <name> freesound:<id> [--for "what it is for"]`: puts a recording behind a sound
 * of the library (a new one, or the same name again to change it everywhere), fetched, made as loud
 * as the rest with its shrill top trimmed. `pnpm sound remove <name>`. The list and index.ts follow.
 */

const root = join(import.meta.dirname, "../../../..");
const dir = join(root, "library/sounds");
const listFile = join(dir, "sounds.json");

/** Every sound alike: mono, the same loudness, nothing shrill. */
const LEVEL = [
  "-af",
  "highpass=f=80,lowpass=f=9000,loudnorm=I=-18:TP=-2:LRA=7",
  "-ac",
  "1",
  "-ar",
  "44100",
  "-b:a",
  "96k",
];

const read = (): LibraryList => libraryListSchema.parse(JSON.parse(readFileSync(listFile, "utf8")));
function write(list: LibraryList): void {
  writeFileSync(listFile, `${JSON.stringify(list, null, 2)}\n`);
  writeFileSync(join(dir, "index.ts"), libraryIndex(list));
}

function apiKey(): string {
  const env = existsSync(join(root, ".env")) ? readFileSync(join(root, ".env"), "utf8") : "";
  const key = process.env.FREESOUND_API_KEY ?? /^FREESOUND_API_KEY=["']?([^"'\n]+)/m.exec(env)?.[1];
  if (key === undefined) throw new Error("no FREESOUND_API_KEY (in .env, or the environment)");
  return key;
}

async function add(name: string, from: string, purpose: string | undefined): Promise<void> {
  const named = libraryListSchema.shape.sounds.element.shape.name.safeParse(name);
  if (!named.success)
    throw new Error(named.error.issues[0]?.message ?? `"${name}" can't name a sound`);
  const id = /^freesound:(\d+)$/.exec(from)?.[1];
  if (id === undefined) throw new Error(`a source is freesound:<id>, not "${from}"`);
  const list = read();
  const before = list.sounds.find((s) => s.name === name);
  const what = purpose ?? before?.for;
  if (what === undefined) throw new Error(`a new sound says what it is for: --for "…"`);
  const fields = "name,username,license,previews";
  const res = await fetch(
    `https://freesound.org/apiv2/sounds/${id}/?fields=${fields}&token=${apiKey()}`,
  );
  if (!res.ok) throw new Error(`freesound ${id}: ${res.status}`);
  const info = (await res.json()) as {
    name: string;
    username: string;
    license: string;
    previews: Record<string, string>;
  };
  if (!/publicdomain\/zero/.test(info.license))
    throw new Error(`freesound ${id} isn't CC0 (${info.license})`);
  const work = mkdtempSync(join(tmpdir(), "chalk-sound-"));
  try {
    const raw = join(work, "raw.mp3");
    const preview = info.previews["preview-hq-mp3"];
    if (preview === undefined) throw new Error(`freesound ${id} has no preview`);
    const got = await fetch(preview);
    if (!got.ok) throw new Error(`freesound ${id}: its recording didn't download (${got.status})`);
    writeFileSync(raw, Buffer.from(await got.arrayBuffer()));
    // Made in the work folder: the library changes only once the new sound is whole.
    const made = join(work, "made.mp3");
    try {
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, ...LEVEL, made]);
    } catch (e) {
      const isMissing = (e as NodeJS.ErrnoException).code === "ENOENT";
      throw new Error(
        isMissing ? "ffmpeg isn't installed (brew install ffmpeg)" : `ffmpeg: ${String(e)}`,
      );
    }
    const file = `sounds/${name}.mp3`;
    renameSync(made, join(dir, file));
    const sound: LibrarySound = {
      name,
      file,
      for: what,
      source: `https://freesound.org/s/${id}/`,
      title: info.name,
      author: info.username,
      license: "CC0 1.0",
    };
    write({ ...list, sounds: [...list.sounds.filter((s) => s.name !== name), sound] });
    console.log(
      `${before === undefined ? "added" : "changed"} ${name}: "${info.name}" by ${info.username}`,
    );
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

function remove(name: string): void {
  const list = read();
  const sound = list.sounds.find((s) => s.name === name);
  if (sound === undefined) throw new Error(`no sound named ${name}`);
  rmSync(join(dir, sound.file), { force: true });
  write({ ...list, sounds: list.sounds.filter((s) => s.name !== name) });
  console.log(`removed ${name}`);
}

// `--for "…"` anywhere; the rest, in order: the command, the name, the source.
const args = process.argv.slice(2);
const at = args.indexOf("--for");
const purpose = at === -1 ? undefined : args[at + 1];
const [command, name, from] = at === -1 ? args : [...args.slice(0, at), ...args.slice(at + 2)];
try {
  if (command === "add" && name !== undefined && from !== undefined) await add(name, from, purpose);
  else if (command === "remove" && name !== undefined) remove(name);
  else if (command === "index") write(read());
  else throw new Error("pnpm sound add <name> freesound:<id> [--for …] | remove <name> | index");
} catch (e) {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
}
