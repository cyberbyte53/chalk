import type { IncomingMessage, ServerResponse } from "node:http";
import { type Step, approve, readChapter, readChapters, takeBack } from "../../studio/src/pipeline";

/**
 * In development, the planning files' state and their approval (platform/studio/src/pipeline.ts),
 * for the editor extension: GET /dev-pipeline (every chapter with planning files),
 * GET /dev-pipeline?book=&chapter= (one), POST /dev-pipeline/approve and /dev-pipeline/reopen
 * ({ book, chapter, step }). Approving is the person's: the extension is how they do it; agents
 * never call this.
 */
export function pipelineMiddleware(root: string) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", "http://x");
    const send = (status: number, body: unknown) => {
      res.statusCode = status;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(body));
    };
    const fail = (e: unknown) => send(400, { error: e instanceof Error ? e.message : String(e) });
    if (req.method === "GET") {
      try {
        const book = url.searchParams.get("book");
        const chapter = url.searchParams.get("chapter");
        return send(
          200,
          book !== null && chapter !== null ? readChapter(root, book, chapter) : readChapters(root),
        );
      } catch (e) {
        return fail(e);
      }
    }
    if (req.method !== "POST") return send(404, { error: "not found" });
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const data = JSON.parse(body || "{}") as { book?: string; chapter?: string; step?: Step };
        const book = data.book ?? "";
        const chapter = data.chapter ?? "";
        const step = (data.step ?? "") as Step;
        if (url.pathname === "/approve") approve(root, book, chapter, step);
        else if (url.pathname === "/reopen") takeBack(root, book, chapter, step);
        else return send(404, { error: "not found" });
        return send(200, readChapter(root, book, chapter));
      } catch (e) {
        return fail(e);
      }
    });
  };
}
