/** @jsxImportSource preact */
import { Actor, AppWhat, type Board, type EventEntry, type Locale } from "@chalk/content";
import { type RecordEvent, makeId } from "@chalk/events";
import {
  AnswerStatus,
  BOARD,
  BoardAction,
  BoardSignal,
  CheckedBy,
  PropRole,
  QuestionAction,
  QuestionSignal,
  segment,
} from "@chalk/prop";
import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { ChatState, chatOf } from "./chat";
import { JugnuChat, type JugnuChatProps, moodOf } from "./jugnu-chat";
import { JugnuFigure } from "./jugnu-figure";
import { Layout, type LayoutContext } from "./layout";
import { type PlayMode, PlayModeContext, modePolicy } from "./play-mode";
import type { PropRegistry } from "./prop-module";
import { boardPathOf } from "./recorder";
import { recordBoard } from "./recorder";
import { causesOf } from "./replay";
import type { BoardRuntime } from "./runtime";
import { useBoardSound } from "./sound/board-sound";
import { isAudible, playSound } from "./sound/engine";
import { SoundMenu, hasSounds, hearAgainOf } from "./sound/sound-menu";
import { type ClipStore, type SpokenProp, useVoice } from "./sound/voice";
import { t } from "./ui-text";
import { useBoardRuntime } from "./use-board-runtime";
import { useMadeWhenChanged, useWhenChanged } from "./when-changed";

/** The props playing the question role: a board may ask any number of questions. */
function questionsOf(runtime: BoardRuntime): string[] {
  return runtime.propNames().filter((name) => runtime.getDef(name).role === PropRole.Question);
}

export type BoardPlayerProps = {
  board: Board;
  registry: PropRegistry;
  locale: Locale;
  /** The app's event channel: the board records what happens on it (recorder.ts). */
  record: RecordEvent;
  onPass: () => void;
  /** Goes back a board; left out on the first board. */
  onBack?: (() => void) | undefined;
  /**
   * The learner has passed this board before (they came back to it). It opens fresh, so they can
   * play it again, with Continue already showing.
   */
  wasPassed?: boolean;
  /**
   * How the board is played (play-mode.ts): a banner under the board says right or wrong, with
   * Try again or Continue as the mode allows. Left out (an author's review), each
   * question shows its own note under it instead.
   */
  mode?: PlayMode | undefined;
  /** Drawn as a picture of the board as it stands (a tool's): nothing passing shows on it. */
  isPicture?: boolean;
  /**
   * Nothing heard (a tool's board, one of several on a review screen): each line keeps its length
   * on the board's clock, and nothing plays. A student's board (the default) is heard: each line
   * ends when its sound does.
   */
  isSilent?: boolean;
  /** Its menu is the lesson's (in the lesson's header, lesson-player.tsx), not its own. */
  isInLesson?: boolean;
  /** The board's runtime, once it runs: for a tool beside the board (a prop page's panel). */
  onRuntime?: ((runtime: BoardRuntime) => void) | undefined;
  /** What Jugnu is pointing at: one piece, or one part of it, glows. */
  pointed?: { prop: string; part?: string | undefined } | undefined;
  /** The chat with Jugnu, drawn in the bottom bar (jugnu-chat.tsx): the board stays live above it. */
  chat?: Omit<JugnuChatProps, "locale"> | undefined;
  /**
   * Jugnu, live (platform/docs/plans/jugnu-live.md): one turn of his, asked of the server. Given, a
   * board played in a mode with him has his chat working: Get help, a tap on him, replies, Done.
   */
  askJugnu?: ((turn: JugnuAsk) => Promise<JugnuAnswer>) | undefined;
};

/** What a live board sends for Jugnu's turn: the board, its state, what the student did and said. */
export type JugnuAsk = {
  session: string;
  board: string;
  state: unknown;
  did: { prop: string; action: string; args: Readonly<Record<string, unknown>> }[];
  said: string;
};
/** His reply. */
export type JugnuAnswer = {
  says: string;
  glow: string | null;
  choices: string[];
  isHandBack: boolean;
  model: string;
};

/** A glow's address ("road/walker/walker") as the board's pointing: its piece, and the part in it. */
const pointedOf = (glow: string): { prop: string; part?: string } => {
  const [prop = "", ...rest] = glow.split("/");
  return rest.length === 0 ? { prop } : { prop, part: rest.join("/") };
};

/**
 * Plays one board: its props, wired by its IS and WHEN rules. Each question answers where it sits;
 * the player only adds the chrome every board shares: the sound menu, and Continue once the board passes.
 */
/**
 * A board, played: on a student's phone, in the preview and in the editor's panel alike. It finds
 * its own sound (board-sound.ts) and starts once that is known.
 */
export function BoardPlayer(props: BoardPlayerProps): JSX.Element {
  const sound = useBoardSound(props.board);
  // A board that sounds starts once the page may sound: a browser allows it from the first touch,
  // which a student gives in reaching a board (opening a lesson, Continue). One opened without it
  // (a link, a refresh) is shown held, its clock not started; the first touch on it starts it (and
  // does nothing else), so its opening is heard from the start.
  const [isHeld, setHeld] = useState(() => props.isSilent !== true && !isAudible());
  // A first key starts it too (a keyboard's first touch).
  useEffect(() => {
    if (!isHeld) return;
    const start = () => setHeld(false);
    window.addEventListener("keydown", start, { once: true });
    return () => window.removeEventListener("keydown", start);
  }, [isHeld]);
  if (!sound.isReady) return <div class="board" aria-busy="true" />;
  return (
    <BoardPlay
      {...props}
      audio={sound.source}
      isHeld={isHeld}
      onFirstTouch={() => setHeld(false)}
    />
  );
}

function BoardPlay({
  board,
  registry,
  locale,
  record,
  audio,
  onPass,
  onBack,
  wasPassed = false,
  mode,
  onRuntime,
  pointed,
  chat,
  askJugnu,
  isPicture = false,
  isInLesson = false,
  isSilent = false,
  isHeld,
  onFirstTouch,
}: BoardPlayerProps & {
  audio: ClipStore | undefined;
  /** Shown, its clock not started, until the first touch on it (BoardPlayer). */
  isHeld: boolean;
  onFirstTouch: () => void;
}): JSX.Element {
  const policy = mode === undefined ? undefined : modePolicy[mode];
  // Set once the recorder exists (the voice is made first, and reports through it).
  const recorderRef = useRef<ReturnType<typeof recordBoard> | undefined>(undefined);
  const reportAudioFailure = useCallback(
    (prop: SpokenProp, reason: string) =>
      recorderRef.current?.app(AppWhat.AudioFailed, { reason }, segment(prop.name)),
    [],
  );
  const voice = useVoice(locale, audio, reportAudioFailure);
  // The board reads each line's length when it says it: from the voice as it is then.
  const voiceRef = useRef(voice);
  voiceRef.current = voice;
  const runtime = useBoardRuntime(board, registry, voice.speak, {
    locale,
    lineSeconds: (line) => voiceRef.current.seconds(line),
    isSilent,
    isHeld,
    playSound,
    hush: () => voiceRef.current.hush(),
  });
  useWhenChanged([runtime], () => onRuntime?.(runtime));
  // Everything that happens on the board is recorded; it opens before its first signal.
  // What this opening records, kept here too: the live chat is drawn from it (chatOf).
  const liveEvents = useRef<EventEntry[]>([]);
  const recorder = useMadeWhenChanged([runtime, record], () => {
    liveEvents.current = [];
    const made = recordBoard(
      runtime,
      (entry) => {
        liveEvents.current.push(entry);
        return record(entry);
      },
      makeId(),
    );
    made.open({
      locale,
      wasPassed,
      hasAudio: audio !== undefined,
      ...(mode !== undefined ? { mode } : {}),
    });
    recorderRef.current = made;
    return made;
  });
  useEffect(() => () => recorder.close(), [recorder]);
  // A drag is one entry: the board tells its recorder when a pointer is down on it.
  useEffect(() => {
    const up = () => recorder.gesture(false);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [recorder]);

  const questions = useMemo(() => questionsOf(runtime), [runtime]);
  const body = useRef<HTMLElement>(null);
  const bar = useRef<HTMLElement>(null);
  // Brings a piece into sight above the bar once it is drawn: no further than it must.
  const inSight = useCallback((piece: string) => {
    requestAnimationFrame(() => {
      const el = body.current?.querySelector<HTMLElement>(`[data-piece="${CSS.escape(piece)}"]`);
      if (el === null || el === undefined) return;
      el.style.scrollMarginBottom = `${(bar.current?.offsetHeight ?? 0) + 12}px`;
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }, []);
  useEffect(() => {
    if (wasPassed) void runtime.call(BOARD, BoardAction.Pass, {}, Actor.App);
  }, [runtime, wasPassed]);
  // What Jugnu points at is kept in sight above the bar (and his chat in it).
  // What Jugnu points at: given (a run's moment), or his live reply's.
  const [livePointed, setLivePointed] = useState<{ prop: string; part?: string } | undefined>();
  const shownPointed = pointed ?? livePointed;
  const pointedProp = shownPointed?.prop;
  const pointedKey =
    shownPointed === undefined ? undefined : `${shownPointed.prop}/${shownPointed.part ?? ""}`;
  const boardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pointedProp !== undefined) inSight(pointedProp);
  }, [pointedProp, inSight]);

  // What the chrome answers: a question checked (the banner), Continue pressed (the next board).
  useEffect(
    () =>
      runtime.onSignal((signal) => {
        if (signal.prop === BOARD && signal.signal === BoardSignal.Continued) {
          onPass();
          return;
        }
        if (questions.includes(signal.prop) && signal.signal === QuestionSignal.Checked)
          setLastChecked(signal.prop);
        // What the child's own act brings, and the answer they just checked, are kept in sight
        // above the bar: a box shown below the fold, or an answer under the banner.
        if (signal.actor !== Actor.Learner) return;
        if (signal.prop === BOARD && signal.signal === BoardSignal.Shown)
          inSight(String(signal.payload.name));
        else if (questions.includes(signal.prop) && signal.signal === QuestionSignal.Checked)
          inSight(signal.prop);
      }),
    [runtime, questions, onPass, inSight],
  );

  const isPassed = runtime.getView(BOARD).isPassed === true;
  // The question the bar's Check is for: the first on the board checked with it, not yet right.
  const toCheck = questions.find(
    (name) =>
      runtime.getDef(name).checkedBy === CheckedBy.Bar &&
      runtime.getView(name).status !== AnswerStatus.Correct,
  );

  // The question checked last, for the banner: its result shows until the learner answers again.
  const [lastChecked, setLastChecked] = useState<string | undefined>(undefined);
  const result =
    lastChecked === undefined
      ? AnswerStatus.Open
      : (runtime.getView(lastChecked).status as AnswerStatus | undefined);
  // A mode without retries (a skill check): a wrong answer is final, the board is done.
  const isSettled = policy?.canRetry === false && result === AnswerStatus.Wrong;
  useEffect(() => {
    if (isSettled && !isPassed) void runtime.call(BOARD, BoardAction.Pass, {}, Actor.App);
  }, [runtime, isSettled, isPassed]);

  // ---- Jugnu, live: his chat drawn from this opening's events, his turns asked of the server ----
  const isLive = askJugnu !== undefined && policy?.hasJugnu === true && !isPicture;
  const [, setLiveTick] = useState(0);
  const [liveProblem, setLiveProblem] = useState<string | undefined>();
  const [isOpenAgain, setOpenAgain] = useState(false);
  const session = useMemo(() => (recorder === undefined ? "" : makeId()), [recorder]);
  const lastReplyAt = useRef(0);
  const sinceReply = () => liveEvents.current.slice(lastReplyAt.current);
  const askHim = async (said: string) => {
    setLiveTick((n) => n + 1);
    setLiveProblem(undefined);
    const did = causesOf(runtime, sinceReply(), boardPathOf(board))
      .filter((c) => c.actor === Actor.Learner)
      .map((c) => ({ prop: c.prop, action: c.action, args: c.args }));
    try {
      const r = await (askJugnu as (turn: JugnuAsk) => Promise<JugnuAnswer>)({
        session,
        board: boardPathOf(board),
        state: runtime.state(),
        did,
        said,
      });
      recorder.jugnu({
        asked: said,
        reply: r.says,
        steps: r.glow === null ? [] : [{ kind: "glow", part: r.glow }],
        model: r.model,
        ...(r.choices.length >= 2 ? { choices: r.choices.slice(0, 4) } : {}),
        ...(r.isHandBack ? { isHandBack: true } : {}),
      });
      if (r.isHandBack) recorder.chat({ what: "closed", by: "handBack" });
      lastReplyAt.current = liveEvents.current.length;
      setLivePointed(r.glow === null ? undefined : pointedOf(r.glow));
      setOpenAgain(false);
    } catch {
      setLiveProblem(t(locale, "jugnuUnreachable"));
    }
    setLiveTick((n) => n + 1);
  };
  const liveChat = isLive ? chatOf(liveEvents.current) : undefined;
  const actsSinceReply = sinceReply().filter(
    (e) => e.kind === "cause" && e.actor === Actor.Learner,
  ).length;
  const chatShown: Omit<JugnuChatProps, "locale"> | undefined =
    chat ??
    (liveChat === undefined
      ? undefined
      : {
          chat: liveChat,
          isOneLine:
            actsSinceReply > 0 && liveChat.messages.at(-1)?.from === "jugnu" && !isOpenAgain,
          onOpen: () => setOpenAgain(true),
          onGetHelp: () => {
            recorder.chat({ what: "opened", reason: "getHelp" });
            void askHim("Why is it wrong?");
          },
          onAsk: () => {
            recorder.chat({ what: "opened", reason: "ask" });
            lastReplyAt.current = liveEvents.current.length;
            setLiveTick((n) => n + 1);
          },
          onSay: (text, via) => {
            recorder.chat({ what: "said", text, via });
            void askHim(text);
          },
          onDone: () => {
            recorder.chat({ what: "said", text: "", via: "done" });
            void askHim("");
          },
          ...(liveProblem === undefined ? {} : { problem: liveProblem }),
        });
  const context: LayoutContext = {
    locale,
    registry,
    runtime,
    audioFailed: voice.failed,
    // Through the board: said in its turn, never over the line being said.
    onRetryAudio: (name) => void runtime.call(BOARD, "say", { line: name }, Actor.Learner),
    isPicture,
    pointed: shownPointed,
  };

  const banner =
    policy === undefined || result === undefined || result === AnswerStatus.Open
      ? undefined
      : result;
  // Jugnu is there in this mode, with a chat to show (live, or a run's): is it open?
  const hasJugnu = policy?.hasJugnu === true && chatShown !== undefined;
  const isChatClosed = chatShown === undefined || chatShown.chat.state === ChatState.Closed;
  // When he points, a dot glides from his figure to the part, and its outline shows as it lands.
  const isGliding = useGlide(boardRef, hasJugnu ? pointedKey : undefined);

  return (
    <PlayModeContext.Provider value={mode}>
      <div
        ref={boardRef}
        class={`board${banner !== undefined ? ` has-banner is-${banner}` : ""}${isHeld ? " is-held" : ""}${isGliding ? " is-gliding" : ""}`}
      >
        {/* The first touch starts the board, and only that: what it lands on isn't pressed. */}
        {isHeld && (
          <div
            class="board-hold"
            aria-hidden="true"
            onClick={onFirstTouch}
            onKeyDown={onFirstTouch}
          />
        )}
        <main
          class={`board-body${isSettled ? " is-settled" : ""}`}
          ref={body}
          onPointerDownCapture={() => recorder.gesture(true)}
        >
          {!isPicture && !isSilent && !isInLesson && (
            <SoundMenu
              locale={locale}
              hasSounds={hasSounds(board, registry)}
              onHearAgain={hearAgainOf(runtime)}
            />
          )}
          <Layout piece={board.root} context={context} />
        </main>
        <footer
          ref={bar}
          class={`board-footer${banner !== undefined ? ` has-banner is-${banner}` : ""}${hasJugnu ? " has-jugnu" : ""}${hasJugnu && !isChatClosed ? " has-chat" : ""}`}
        >
          {/* Where Jugnu is there: his figure at the row's start, always (a tap asks him; on a
              wrong answer it is Get help), the board's button at its end, and the chat's sheet
              under them while it is open (no banner then: he is talking about it). */}
          {hasJugnu && chatShown !== undefined && (
            <JugnuButton
              locale={locale}
              chat={chatShown}
              isGetHelp={isChatClosed && banner === AnswerStatus.Wrong}
            />
          )}
          {hasJugnu && chatShown !== undefined && (
            <JugnuChat
              locale={locale}
              {...chatShown}
              onReplyFocus={() => shownPointed !== undefined && inSight(shownPointed.prop)}
            />
          )}
          {!(hasJugnu && !isChatClosed) && policy !== undefined && banner !== undefined && (
            <div class="board-banner">
              <strong>
                {banner === AnswerStatus.Correct
                  ? t(locale, "rightBanner")
                  : t(locale, policy.wrongWord)}
              </strong>
            </div>
          )}
          {onBack !== undefined && (
            <button type="button" class="back" aria-label={t(locale, "back")} onClick={onBack}>
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M11 3 L5 9 L11 15" />
              </svg>
            </button>
          )}
          {policy?.canRetry === true &&
          banner === AnswerStatus.Wrong &&
          lastChecked !== undefined ? (
            <button
              type="button"
              class="primary is-retry"
              onClick={() =>
                void runtime.call(lastChecked, QuestionAction.Retry, {}, Actor.Learner)
              }
            >
              {t(locale, "tryAgain")}
            </button>
          ) : isPassed ? (
            <button
              type="button"
              class="primary"
              onClick={() => void runtime.call(BOARD, BoardAction.Continue, {}, Actor.Learner)}
            >
              {t(locale, "continue")}
            </button>
          ) : (
            toCheck !== undefined && (
              // The question's own Check, drawn in the bar: tagged as its part, so tools press it
              // by name ("ask/check") as a finger does.
              <span class="bar-part" data-piece={toCheck}>
                <button
                  type="button"
                  class="primary"
                  data-part={QuestionAction.Check}
                  data-does={QuestionAction.Check}
                  data-path={`${toCheck}/${QuestionAction.Check}`}
                  onClick={() =>
                    void runtime.call(toCheck, QuestionAction.Check, {}, Actor.Learner)
                  }
                >
                  {t(locale, "check")}
                </button>
              </span>
            )
          )}
        </footer>
      </div>
    </PlayModeContext.Provider>
  );
}

/** A quiet board's voice: nothing said. */

/**
 * Jugnu's figure in the bar: always in one place where he is there. A tap asks him; on a wrong
 * answer it says Get help (which asks "Why is it wrong?" for them). Read-only (a run's), it is drawn
 * as it was, not greyed: aria-disabled, nothing on tap.
 */
function JugnuButton({
  locale,
  chat,
  isGetHelp,
}: {
  locale: Locale;
  chat: Omit<JugnuChatProps, "locale">;
  isGetHelp: boolean;
}): JSX.Element {
  const onTap = isGetHelp ? chat.onGetHelp : chat.onAsk;
  return (
    <button
      type="button"
      class={`jugnu-avatar${isGetHelp ? " is-get-help" : ""}`}
      aria-label={t(locale, isGetHelp ? "getHelp" : "askJugnu")}
      aria-disabled={onTap === undefined}
      onClick={() => onTap?.()}
    >
      <JugnuFigure mood={moodOf(chat.chat)} size={48} />
      {isGetHelp && <span>{t(locale, "getHelp")}</span>}
    </button>
  );
}

/**
 * The pointer's glide: once what he points at is drawn and still (after it is scrolled into sight),
 * a dot travels from his figure to it, moving only a transform, and the outline shows as it lands.
 * Reduced motion: the outline alone. True while it glides.
 */
function useGlide(board: { current: HTMLDivElement | null }, key: string | undefined): boolean {
  const [isGliding, setGliding] = useState(false);
  useEffect(() => {
    if (key === undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let isGone = false;
    let frames = 0;
    let last: DOMRect | undefined;
    let dot: HTMLElement | undefined;
    setGliding(true);
    const step = () => {
      if (isGone) return;
      const root = board.current;
      const to = root?.querySelector(".jugnu-point, .piece-prop.is-pointed");
      const from = root?.querySelector(".jugnu-avatar");
      frames += 1;
      if (root == null || to == null || from == null) {
        if (frames < 90) requestAnimationFrame(step);
        else setGliding(false);
        return;
      }
      // Still for a frame (drawn, and done scrolling into sight): then it glides.
      const at = to.getBoundingClientRect();
      if (last === undefined || Math.abs(last.top - at.top) + Math.abs(last.left - at.left) > 0.5) {
        last = at;
        if (frames < 120) requestAnimationFrame(step);
        else setGliding(false);
        return;
      }
      const box = root.getBoundingClientRect();
      const f = from.getBoundingClientRect();
      const x0 = f.left + f.width / 2 - box.left;
      const y0 = f.top + f.height / 2 - box.top;
      const x1 = at.left + at.width / 2 - box.left;
      const y1 = at.top + Math.min(at.height / 2, 24) - box.top;
      dot = document.createElement("span");
      dot.className = "jugnu-glide";
      root.appendChild(dot);
      const move = dot.animate(
        [
          { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0.4 },
          { transform: `translate(${x1}px, ${y1}px) scale(1.2)`, opacity: 1, offset: 0.85 },
          { transform: `translate(${x1}px, ${y1}px) scale(0.2)`, opacity: 0 },
        ],
        { duration: 700, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
      );
      move.onfinish = () => {
        dot?.remove();
        setGliding(false);
      };
    };
    requestAnimationFrame(step);
    return () => {
      isGone = true;
      dot?.remove();
      setGliding(false);
    };
  }, [board, key]);
  return isGliding;
}
