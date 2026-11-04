import { ApiPath } from "@chalk/api";
import type { JugnuAnswer, JugnuAsk } from "@chalk/player";

/**
 * One turn of the committed Jugnu (platform/docs/plans/jugnu-live.md), asked of the server: the one
 * way the app asks him, wherever a board is played (the preview's boards, Play, the app). In
 * development the studio's service answers (/dev-jugnu/turn); on chalk1, the server.
 */
export async function askJugnu(turn: JugnuAsk): Promise<JugnuAnswer> {
  const r = await fetch(import.meta.env.DEV ? "/dev-jugnu/turn" : ApiPath.JugnuTurn, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(turn),
  });
  const answer = (await r.json().catch(() => ({ error: r.statusText }))) as
    | JugnuAnswer
    | { error: string; message?: string };
  if (!r.ok || "error" in answer)
    throw new Error("error" in answer ? (answer.message ?? answer.error) : r.statusText);
  return answer;
}
