import { ApiPath } from "@chalk/api";
import type { JugnuAnswer, JugnuAsk } from "@chalk/player";

/**
 * One turn of the committed Jugnu (platform/docs/plans/teacher-view.md, "One flow"), asked where
 * his conversations are kept: the app, signed in, asks the server (chalk1's, or the one on this
 * computer: only an address), which keeps them with the child's events; the preview asks the dev
 * service, which keeps them in memory with the preview's events. Same flow, same Jugnu.
 */
const askAt =
  (path: string) =>
  async (turn: JugnuAsk): Promise<JugnuAnswer> => {
    const r = await fetch(path, {
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
  };

/** The app's: the server. */
export const askJugnu = askAt(ApiPath.JugnuTurn);
/** The preview's: the dev service. */
export const askJugnuInPreview = askAt("/dev-jugnu/turn");
