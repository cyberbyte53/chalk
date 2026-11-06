import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import {
  type Change,
  Role,
  type Thread,
  type Who,
  YOU,
  applyChange,
  readComments,
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
 * /dev-review (comments.ts): GET every thread (?problems: what a file holds that doesn't fit); POST
 * one change.
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
    return send(res, 200, { threads: withTurn(read.threads) });
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
 * /dev-jugnu (jugnu/dialogue.ts): GET the cases and every run kept (`?board=<path>`: one board's);
 * `?show=<run>` one of them.
 * POST `/dev-jugnu/turn` is a live student's turn with the committed Jugnu (jugnu/live.ts).
 * POST `{case, student, note}` starts a run and answers its id at once; the run goes on by itself,
 * kept after every turn, so the page follows it by its id. The preview's ?dev&jugnu shows them.
 */
/**
 * The preview's Jugnu: the one flow (jugnu/conversations.ts), kept in memory. What differs from a
 * child's phone, and why, is listed in platform/docs/plans/teacher-view.md ("The preview's gap").
 */
let preview:
  | {
      talks: import("./jugnu/conversations").Conversations;
      kept: ReturnType<typeof import("./jugnu/conversations").memoryKeeper>;
      updates: import("./jugnu/sets").Sets;
      setsKept: ReturnType<typeof import("./jugnu/sets").memorySetKeeper>;
    }
  | undefined;
async function previewJugnu() {
  if (preview !== undefined) return preview;
  const { conversations, memoryKeeper } = await import("./jugnu/conversations");
  const { sets, memorySetKeeper } = await import("./jugnu/sets");
  const { liveTurn, liveReflect, liveJudge } = await import("./jugnu/live");
  const { committedJugnu, promptOf, Seat } = await import("./jugnu/prompts");
  const { root } = await import("./jugnu/sees");
  const kept = memoryKeeper();
  const quietMs = committedJugnu().reflectAfterMinutes * 60_000;
  const talks = conversations({
    keeper: kept,
    jugnu: { turn: liveTurn, reflect: liveReflect },
    quietMs,
    now: Date.now,
    onError: (message, error) => console.error(message, error),
  });
  const setsKept = memorySetKeeper(kept, join(root, "build"));
  const updates = sets({
    keeper: setsKept,
    jugnu: { conversations: talks, judge: liveJudge },
    promptHash: () => promptOf(Seat.Update, committedJugnu().update).hash,
    now: Date.now,
    onError: (message, error) => console.error(message, error),
  });
  setInterval(
    () => void talks.sweep().then(() => updates.sweep()),
    Math.max(1000, quietMs / 5),
  ).unref();
  preview = { talks, kept, updates, setsKept };
  return preview;
}

export async function jugnuEndpoint(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const dialogue = await import("./jugnu/dialogue");
    // A live student's turn with the committed Jugnu (jugnu/live.ts): the preview's boards.
    // The preview's events (its uploader, as a phone's to the server): kept in memory; a set
    // finished is updated by the same flow.
    if (req.method === "POST" && (req.url ?? "").startsWith("/dev-jugnu/events")) {
      const { events } = JSON.parse(await bodyOf(req)) as {
        events: import("@chalk/content").ChalkEvent[];
      };
      const p = await previewJugnu();
      const list = p.setsKept.events.get("preview") ?? [];
      const known = new Set(list.map((e) => e.id));
      const fresh = events.filter((e) => !known.has(e.id));
      p.setsKept.events.set("preview", [...list, ...fresh]);
      for (const e of fresh)
        if (e.kind === "set" && e.payload.what === "finished")
          void p.updates.update("preview", e.payload.set);
      send(res, 200, { saved: fresh.length, rejected: [] });
      return;
    }
    // What the preview holds (his conversations and reflections, the updates), to look at.
    if (req.method === "GET" && (req.url ?? "").startsWith("/dev-jugnu/held")) {
      const { kept, setsKept } = await previewJugnu();
      send(res, 200, {
        updates: setsKept.updates.map((u) => ({
          set: u.set,
          at: u.at,
          points: u.judged.points,
          prompt: `${u.judged.prompt.name}@${u.judged.prompt.hash}`,
          model: u.judged.model,
        })),
        mastery: setsKept.mastery.get("preview") ?? [],
        conversations: [...kept.held].map(([id, c]) => ({
          id,
          board: c.place.boardPath,
          turns: c.turns,
          lastTurnAt: c.lastTurnAt,
          endedAt: c.endedAt,
          reflections: c.reflections.map((r) => ({
            at: r.at,
            points: r.points,
            gotThere: r.gotThere,
            prompt: `${r.prompt.name}@${r.prompt.hash}`,
            model: r.model,
          })),
        })),
      });
      return;
    }
    if (req.method === "POST" && (req.url ?? "").startsWith("/dev-jugnu/turn")) {
      const turn = JSON.parse(await bodyOf(req)) as import("./jugnu/live").LiveTurn;
      const { talks } = await previewJugnu();
      const { commitNow, root } = await import("./jugnu/sees");
      const built = JSON.parse(readFileSync(join(root, "build", `${turn.board}.json`), "utf8")) as {
        id: string;
        version: string;
      };
      send(
        res,
        200,
        await talks.turn(
          {
            account: "preview",
            opening: turn.session,
            board: built.id,
            version: built.version,
            commit: commitNow(),
            boardPath: turn.board,
          },
          turn,
        ),
      );
      return;
    }
    if (req.method === "POST") {
      const b = JSON.parse((await bodyOf(req)) || "{}") as {
        case?: string;
        student?: string;
        note?: string;
        seats?: import("./jugnu/dialogue").Seats;
      };
      send(res, 200, {
        id: dialogue.startDialogue(b.case ?? "", b.student ?? "", b.note ?? "", b.seats ?? {}),
      });
      return;
    }
    const q = new URL(req.url ?? "/", "http://x").searchParams;
    const show = q.get("show");
    const board = q.get("board") ?? undefined;
    if (show !== null) send(res, 200, dialogue.readRun(show));
    else {
      const { readCases } = await import("./jugnu/cases");
      send(res, 200, {
        cases: readCases(board),
        runs: dialogue.listRuns(board),
        seats: dialogue.seatOptions(),
      });
    }
  } catch (error) {
    send(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
}
