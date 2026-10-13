import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { TtsProvider } from "./provider";

const run = promisify(execFile);

/**
 * Voice names from `say -v ?`. Older macOS prints "Lekha               hi_IN    # …"; newer
 * prints "Lekha (Hindi (India)) hi_IN    # …". Both give "Lekha", which is what `say -v` takes.
 */
export function parseSayVoices(output: string): string[] {
  const names = output
    .split("\n")
    .map((line) => {
      const at = line.search(/\s+[a-z]{2,3}_[A-Z0-9]{2,3}\s/);
      if (at <= 0) return "";
      const full = line.slice(0, at).trim();
      // "Samantha (English (US))" → "Samantha"; "Eddy (English (US))" stays a distinct voice as "Eddy".
      const bracket = full.indexOf(" (");
      return bracket > 0 ? full.slice(0, bracket) : full;
    })
    .filter((name) => name.length > 0);
  return [...new Set(names)];
}

/**
 * macOS's built-in `say`: no keys, works offline, includes a Hindi voice (Lekha).
 * Good for hearing lessons now; a cloud voice can replace it once one is chosen.
 */
export const macosProvider: TtsProvider = {
  id: "macos",
  extension: "m4a",
  missingVoices: async (voices) => {
    if (process.platform !== "darwin") throw new Error('The "macos" voice only runs on a Mac');
    const { stdout } = await run("say", ["-v", "?"]);
    const installed = new Set(parseSayVoices(stdout));
    return voices.filter((v) => !installed.has(v));
  },
  synthesize: async (text, voice, outFile) => {
    await run("say", ["-v", voice, "-o", outFile, "--file-format=m4af", "--data-format=aac", text]);
  },
};
