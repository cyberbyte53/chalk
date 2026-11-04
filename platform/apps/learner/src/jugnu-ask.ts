import type { JugnuAnswer, JugnuAsk } from "@chalk/player";

/**
 * One turn of the committed Jugnu (platform/docs/plans/jugnu-live.md), asked of the server: the one
 * way the app asks him, wherever a board is played (the preview's boards, Play, the app). In
 * development the studio's service answers (/dev-jugnu/turn); on chalk1, the server.
 */
export async function askJugnu(turn: JugnuAsk): Promise<JugnuAnswer> {
  const r = await fetch("/dev-jugnu/turn", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(turn),
  });
  const answer = (await r.json()) as JugnuAnswer | { error: string };
  if (!r.ok || "error" in answer) throw new Error("error" in answer ? answer.error : r.statusText);
  return answer;
}
