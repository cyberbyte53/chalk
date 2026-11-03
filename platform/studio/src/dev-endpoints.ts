import type { IncomingMessage, ServerResponse } from "node:http";
import {
  type Change,
  Role,
  type Thread,
  type Who,
  YOU,
  applyChange,
  readComments,
  sittingOf,
  waitsOn,
} from "./comments";
import { type Step, approve, readChapter, readChapters, takeBack } from "./pipeline";

/**
 * What the editor and the preview read and write, served by the studio service (mcp/main.ts) and
 * reached through the dev server (which passes /dev-* on). The studio service is their one writer:
 * the chalk MCP's tools write in the same process, so two writers can never collide.
 */

const send = (res: ServerResponse, status: number, value: unknown) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(value));
};

const bodyOf = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
  });

/** An agent says its role (x-chalk-role) and may give its name (x-chalk-name); anyone else is you. */
function whoOf(req: IncomingMessage): Who {
  const role = String(req.headers["x-chalk-role"] ?? "");
  if (role !== Role.Fixer && role !== Role.Reviewer) return YOU;
  const name = String(req.headers["x-chalk-name"] ?? "").trim();
  return { name: name !== "" && name !== YOU.name ? name : role, role };
}

/** Each thread with whose turn it is, as the thread keeps it. */
const withTurn = <T extends Thread>(ts: readonly T[]) =>
  ts.map((t) => ({ ...t, waitsOn: waitsOn(t) ?? null }));

/**
 * /dev-review (comments.ts): GET the threads and reviews (?problems: what a file holds that doesn't
 * fit; ?sitting: the caller's threads not yet handed over); POST one change.
 */
export async function reviewEndpoint(
  root: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== "POST") {
    const read = readComments(root);
    const url = req.url ?? "";
    if (url.includes("problems")) return send(res, 200, read.problems);
    if (url.includes("sitting")) return send(res, 200, withTurn(sittingOf(read, whoOf(req))));
    return send(res, 200, { threads: withTurn(read.threads), reviews: read.reviews });
  }
  let change: Change;
  try {
    change = JSON.parse(await bodyOf(req)) as Change;
  } catch {
    return send(res, 400, { ok: false, error: "not JSON" });
  }
  const applied = applyChange(root, change, whoOf(req));
  const read = readComments(root);
  send(res, applied.ok ? 200 : 409, {
    ...applied,
    threads: withTurn(read.threads),
    reviews: read.reviews,
  });
}

/**
 * /dev-pipeline (pipeline.ts), for the editor: GET every chapter with planning files, or one
 * (?book=&chapter=); POST /approve and /reopen ({ book, chapter, step }). Approving is the
 * person's: the editor is how they do it; agents never call this.
 */
export async function pipelineEndpoint(
  root: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://x");
  const fail = (e: unknown) =>
    send(res, 400, { error: e instanceof Error ? e.message : String(e) });
  try {
    if (req.method === "GET") {
      const book = url.searchParams.get("book");
      const chapter = url.searchParams.get("chapter");
      return send(
        res,
        200,
        book !== null && chapter !== null ? readChapter(root, book, chapter) : readChapters(root),
      );
    }
    if (req.method !== "POST") return send(res, 404, { error: "not found" });
    const data = JSON.parse((await bodyOf(req)) || "{}") as {
      book?: string;
      chapter?: string;
      step?: Step;
    };
    const book = data.book ?? "";
    const chapter = data.chapter ?? "";
    const step = (data.step ?? "") as Step;
    if (url.pathname.endsWith("/approve")) approve(root, book, chapter, step);
    else if (url.pathname.endsWith("/reopen")) takeBack(root, book, chapter, step);
    else return send(res, 404, { error: "not found" });
    return send(res, 200, readChapter(root, book, chapter));
  } catch (e) {
    return fail(e);
  }
}

/**
 * /dev-jugnu (jugnu/dialogue.ts): GET the stuck children and every experiment kept;
 * `?show=<experiment>` one of them; `?talk=<case>&student=<child>&note=…` runs a new one (Jugnu and
 * a simulated child, back and forth), keeps it and answers it. The preview's ?dev&jugnu shows them.
 */
export async function jugnuEndpoint(req: IncomingMessage, res: ServerResponse): Promise<void> {
  res.setHeader("content-type", "application/json");
  try {
    const q = new URL(req.url ?? "/", "http://x").searchParams;
    const dialogue = await import("./jugnu/dialogue");
    const show = q.get("show");
    const talk = q.get("talk");
    if (show !== null) res.end(JSON.stringify(dialogue.readRun(show)));
    else if (talk !== null)
      res.end(
        JSON.stringify(
          await dialogue.runDialogue(talk, q.get("student") ?? "", q.get("note") ?? ""),
        ),
      );
    else {
      const { readCases } = await import("./jugnu/cases");
      res.end(JSON.stringify({ cases: readCases(), runs: dialogue.listRuns() }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
  }
}
