import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { LOCALES, type Locale, phraseKey } from "@chalk/content";
import { z } from "zod";
import { castSchema, voiceFor } from "./cast";
import { speakLines } from "./clips";
import { providers } from "./index";
import { unspeakable } from "./said";

/**
 * The live voice (platform/docs/sound.md, source 2), as the studio serves it in development: any
 * words, in a speaker's voice, made when a board first needs them and kept (named by voice and
 * words, as every clip is). The player asks for words and gets a clip to play; a server's voice
 * later answers the same way. It is given words only: never symbols, which nothing turns into words.
 */

const askSchema = z
  .object({
    speaker: z.string().min(1).max(40),
    locale: z.enum(LOCALES as unknown as [Locale, ...Locale[]]),
    words: z.string().min(1).max(600),
  })
  .strict();

/** Where live clips are kept: under the app's voice folder, so the dev server serves them. */
const LIVE = "live";

/** One line at a time: a voice's worker speaks one line after another. */
let turn: Promise<unknown> = Promise.resolve();
/** The longest a request's body may be. */
const MAX_BODY = 4096;
/** The longest one line may take to make; a worker that takes longer is started afresh. */
const MAKE_MS = 15_000;

const send = (res: ServerResponse, status: number, value: unknown) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(value));
};

/** A request's body, if it is no longer than MAX_BODY. */
const bodyOf = (req: IncomingMessage): Promise<string | undefined> =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY) {
        resolve(undefined);
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
  });

/** What a body asks for, or why it can't be read. */
function askOf(body: string | undefined): z.infer<typeof askSchema> | string {
  if (body === undefined) return "too long";
  try {
    const asked = askSchema.safeParse(JSON.parse(body));
    return asked.success ? asked.data : (asked.error.issues[0]?.message ?? "not an ask");
  } catch {
    return "not JSON";
  }
}

/** POST /dev-voice `{ speaker, locale, words }` → `{ url, seconds }` of a clip that says them. */
export async function voiceEndpoint(
  root: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== "POST") return send(res, 405, { error: "POST { speaker, locale, words }" });
  const asked = askOf(await bodyOf(req));
  if (typeof asked === "string") return send(res, 400, { error: asked });
  const { speaker, locale, words } = asked;
  // A browser that gave up (its line was cut) has its line dropped before it is made.
  let isGone = false;
  res.on("close", () => {
    isGone = !res.writableEnded;
  });
  const odd = unspeakable(words);
  if (odd.length > 0)
    return send(res, 400, { error: `not words: "${odd.join(" ")}" (nothing says symbols)` });
  const made = turn.then(async () => {
    if (isGone) return undefined;
    const { cast } = castSchema.parse(
      JSON.parse(readFileSync(join(root, "authoring", "voices.json"), "utf8")),
    );
    const key = phraseKey(speaker, locale, words);
    const voice = voiceFor(cast, providers, speaker, locale);
    const making = speakLines(
      [{ key, text: words, voice }],
      join(root, "platform", "apps", "learner", "public", "voice"),
      LIVE,
    );
    // Given up on, it may still fail later: that is no one's to hear.
    making.catch(() => undefined);
    let timer: NodeJS.Timeout | undefined;
    const late = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("the voice took too long")), MAKE_MS);
    });
    try {
      return (await Promise.race([making, late])).manifest.phrases[key];
    } catch (error) {
      // A voice that hangs is started afresh for the next line.
      await voice.provider.close?.();
      throw error;
    } finally {
      clearTimeout(timer);
    }
  });
  // The next waits for this one, whether or not it was made.
  turn = made.catch(() => undefined);
  try {
    const clip = await made;
    if (isGone) return;
    if (clip === undefined) return send(res, 500, { error: "no clip was made" });
    send(res, 200, { url: `/voice/${clip.file}`, seconds: clip.seconds });
  } catch (error) {
    send(res, 503, { error: String(error instanceof Error ? error.message : error) });
  }
}
