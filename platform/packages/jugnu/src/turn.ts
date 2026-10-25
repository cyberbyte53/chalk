import { type About, type Cue, CueKind, type TurnInput } from "@chalk/content";
import type { JugnuBoard, JugnuPlace } from "./board";
import { type Taught, boardNow, partsNow, systemPrompt } from "./context";
import { type LessonLibrary, conceptsOnBoard, mapText } from "./lessons";
import type { ChatMessage, ChatReply, LlmProvider, Usage } from "./provider";
import { type JugnuEvent, JugnuTool, jugnuTools, runTool } from "./tools";

export type TurnOptions = {
  /** The chat so far (every earlier turn, without the system message). */
  chat: readonly ChatMessage[];
  input: TurnInput;
  /** Most model calls in one turn: only a guard against a runaway loop. */
  maxSteps?: number;
  /** Waits until what an action set off has run (a board with no screen jumps there). */
  settle?: () => Promise<boolean>;
  /**
   * Where lessons are: the board's concept's lesson goes in his context, and he can look up the
   * concepts it builds on with the `lesson` tool. Left out, he knows only the board.
   */
  lessons?: LessonLibrary;
};

/** The lessons of the board's concepts and the map of what he can look up, from the host. */
async function taughtFor(
  board: JugnuBoard,
  place: JugnuPlace,
  library: LessonLibrary,
): Promise<{ taught: Taught; ids: string[] }> {
  const current = conceptsOnBoard(board);
  const [texts, lines] = await Promise.all([
    Promise.all(current.map((id) => library.lesson(id, place.locale))),
    library.map(current, place.locale),
  ]);
  return {
    taught: {
      lessons: texts.filter((text): text is string => text !== undefined),
      map: mapText(lines, current),
    },
    ids: lines.map((line) => line.id),
  };
}

/** One turn worked out: what to play on the phone, and the chat to keep. */
export type TurnResult = {
  /** What the student sees, in order. */
  cues: Cue[];
  /** This turn's messages, to add to the chat (the student's opening, his calls and results). */
  chat: ChatMessage[];
  /** Everything he did, in order: his tries and sums, replies sent back, and what his reply did. */
  events: JugnuEvent[];
  /** Everything he said to the student (his question included), joined. */
  reply: string;
  /** Which model answered. */
  model: string;
  modelCalls: number;
  /** Tokens over the turn, as the model server reported them. */
  usage: Usage;
  /** He sent nothing usable, so the chat shows his "ask me again" line. */
  isFallback: boolean;
};

const MAX_STEPS = 16;

/**
 * What the student held on the board, in the names Jugnu points with ("line · splitPoint:2", where
 * it reads "1/3"). Only what is there to see: a prop that isn't shown is dropped, a part it doesn't
 * show leaves just the prop.
 */
export function aboutOf(board: JugnuBoard, about: readonly About[]): string[] {
  const out: string[] = [];
  for (const { prop, part, text } of about) {
    if (!board.propNames().includes(prop) || board.isHidden(prop)) continue;
    const parts = partsNow(board, prop).map((e) => e.id);
    const where = part !== undefined && parts.includes(part) ? `${prop} · ${part}` : prop;
    const line =
      text === undefined ? where : `${where} (where they held it reads ${JSON.stringify(text)})`;
    if (!out.includes(line)) out.push(line);
  }
  return out;
}

/** The opening of a turn: the board now, and what the student did. */
export function openingOf(board: JugnuBoard, place: JugnuPlace, input: TurnInput): string {
  const about = input.kind === "typed" ? aboutOf(board, input.about ?? []) : [];
  const student =
    input.kind === "typed"
      ? `${about.length > 0 ? `The student held these on the board to ask about them: ${about.join("; ")}.\n` : ""}The student typed: ${JSON.stringify(input.text)}`
      : `The student tapped your option: ${JSON.stringify(input.option)}`;
  return `The board now:\n${JSON.stringify(boardNow(board, place))}\n\n${student}`;
}

export const fallback = (locale: JugnuPlace["locale"]): string =>
  locale === "hi"
    ? "माफ़ करना, मैं अभी ठीक से नहीं सोच पाया। फिर से पूछोगे?"
    : "Sorry, I got muddled. Could you ask me again?";

/**
 * One turn of Jugnu on a board (the server's copy): an agent loop. Each step the model gets the
 * persona and the board's definition (the same all the time he is on it, so it caches), then the
 * chat. He thinks with `try` (what actions would do, out of sight) and `calculate`, and answers
 * with one `reply`: his words, what he shows and points at, then options to tap or nothing (he
 * goes quiet). The reply is checked on the board before it goes; if something in it isn't allowed
 * he hears why and replies again. The last step must be a reply.
 */
export async function jugnuTurn(
  board: JugnuBoard,
  provider: LlmProvider,
  place: JugnuPlace,
  options: TurnOptions,
): Promise<TurnResult> {
  const maxSteps = Math.max(1, options.maxSteps ?? MAX_STEPS);
  const library = options.lessons;
  const known = library === undefined ? undefined : await taughtFor(board, place, library);
  const work = {
    ...(options.settle !== undefined ? { settle: options.settle } : {}),
    ...(library !== undefined ? { lessons: { library, locale: place.locale } } : {}),
  };
  const tools = jugnuTools(board, known?.ids ?? []);
  const system: ChatMessage = {
    role: "system",
    content: systemPrompt(board, place, known?.taught),
  };
  const chat: ChatMessage[] = [{ role: "user", content: openingOf(board, place, options.input) }];
  const events: JugnuEvent[] = [];
  const usage: Usage = { input: 0, cached: 0, output: 0 };
  let modelCalls = 0;
  let cues: Cue[] | undefined;
  for (let step = 1; step <= maxSteps && cues === undefined; step++) {
    const isLast = step === maxSteps;
    let answer: ChatReply;
    try {
      answer = await provider.chat({
        messages: [system, ...options.chat, ...chat],
        tools: tools.specs,
        // Always a tool: words written outside reply would never reach the student.
        toolChoice: isLast ? { name: JugnuTool.Reply } : "required",
      });
    } catch (error) {
      // The model server's safety filter blocked the answer (Azure: "content_filter"): not an
      // outage. He says his "ask me again" line, and the turn is kept.
      if (!/content_filter/.test(String(error))) throw error;
      events.push({ kind: "reply", refused: "blocked by the model server's content filter" });
      break;
    }
    modelCalls++;
    if (answer.usage !== undefined) {
      usage.input += answer.usage.input;
      usage.cached += answer.usage.cached;
      usage.output += answer.usage.output;
      if (answer.usage.cacheWritten !== undefined)
        usage.cacheWritten = (usage.cacheWritten ?? 0) + answer.usage.cacheWritten;
    }
    const calls = answer.toolCalls;
    chat.push({
      role: "assistant",
      content: answer.content,
      ...(calls.length > 0 ? { toolCalls: calls } : {}),
      ...(answer.reasoning !== undefined ? { reasoning: answer.reasoning } : {}),
    });
    // Words with no reply at all: a model that answered in plain text. They are his reply.
    if (calls.length === 0) {
      const text = answer.content.trim();
      if (text !== "") {
        cues = [{ kind: CueKind.Say, text }];
        events.push({ kind: "say", text });
      }
      break;
    }
    for (const call of calls) {
      if (cues !== undefined) {
        // Every call needs an answer, even the ones after his reply went out.
        chat.push({
          role: "tool",
          toolCallId: call.id,
          name: call.name,
          content: JSON.stringify({ skipped: "your reply had already gone" }),
        });
        continue;
      }
      const done = await runTool(board, tools, call.name, call.args, work);
      chat.push({ role: "tool", toolCallId: call.id, name: call.name, content: done.result });
      events.push(...done.steps);
      if (done.cues !== undefined) cues = done.cues;
    }
  }
  const isFallback = cues === undefined;
  const sent: Cue[] = cues ?? [{ kind: CueKind.Say, text: fallback(place.locale) }];
  if (isFallback) chat.push({ role: "assistant", content: fallback(place.locale) });
  const words = sent.flatMap((cue) =>
    cue.kind === CueKind.Say ? [cue.text] : cue.kind === CueKind.Ask ? [cue.question] : [],
  );
  return {
    cues: sent,
    chat,
    events,
    reply: words.join(" "),
    model: provider.id,
    modelCalls,
    usage,
    isFallback,
  };
}
