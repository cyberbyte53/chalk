import {
  GotThere,
  type GroupLearner,
  type GroupReply,
  type LearnerReply,
  type MeReply,
  type TeacherGroup,
} from "@chalk/api";
import type { Locale, Localized } from "@chalk/content";
import { Band, PointKind, type Progress, isConceptDone } from "@chalk/learning";
import { RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { BackButton, LocaleToggle } from "./account-screens";
import { api } from "./api-client";
import { say } from "./app-text";
import { ConceptMark, conceptMark } from "./concept-mark";
import type { Course, CourseConcept } from "./course";
import { ArtView } from "./course-screens";
import { type TryOn, needsYouPoint, sectionOf, triesOf } from "./section";
import { TrySnapshot } from "./try-snapshot";

/**
 * What a teacher sees, on their phone: their groups, a new group, one group (its section home: who
 * needs them and for what, the mistakes several share, everyone else) and one learner (the claim,
 * then the proof: their tries as their own boards; what Jugnu noticed). It reads only: the first
 * version has no actions on what it finds. Progress comes from the learners' own events; the rest
 * is the server's learner update (judged points).
 */

const conceptsOf = (course: Course): CourseConcept[] =>
  course.chapters.flatMap((chapter) => chapter.concepts);

const doneCount = (concepts: readonly CourseConcept[], progress: Progress): number =>
  concepts.filter((c) => isConceptDone(progress[c.id], c.hasPractice)).length;

const DAY_MS = 24 * 60 * 60 * 1000;

/** "today", "yesterday", "3 days ago", in the learner's language. */
function whenText(at: number, locale: Locale, now = Date.now()): string {
  const days =
    Math.floor(new Date(now).setHours(0, 0, 0, 0) / DAY_MS) -
    Math.floor(new Date(at).setHours(0, 0, 0, 0) / DAY_MS);
  return new Intl.RelativeTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
    numeric: "auto",
  }).format(-days, "day");
}

const dateText = (at: number, locale: Locale): string =>
  new Date(at).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  });

function Square({ mark, label }: { mark: ConceptMark; label?: string }): JSX.Element {
  return <span class={`square is-${mark}`} title={label} />;
}

// ---- the screens ----

function GroupsScreen({
  me,
  courses,
  locale,
  onLocale,
  onGroup,
  onNew,
  onSignOut,
}: {
  me: MeReply;
  courses: readonly Course[];
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onGroup: (group: TeacherGroup) => void;
  onNew: () => void;
  onSignOut: () => void;
}): JSX.Element {
  return (
    <div class="lesson page is-wide">
      <div class="page-top is-between">
        <div>
          <div class="kicker">
            {me.account.name}
            {me.account.school === null ? "" : ` · ${me.account.school.name}`}
          </div>
          <div class="hello">{say(locale, "yourGroups")}</div>
        </div>
        <LocaleToggle locale={locale} onLocale={onLocale} />
      </div>
      <div class="page-body">
        {me.teaching.length === 0 && <p class="lead">{say(locale, "noGroupsYet")}</p>}
        {me.teaching.map((group, i) => {
          const course = courses.find((c) => c.id === group.courseId);
          return (
            <button key={group.id} type="button" class="card" onClick={() => onGroup(group)}>
              {i === 0 && course?.art != null && <ArtView art={course.art} />}
              <span class="name">
                {course === undefined ? group.courseId : <RichText text={course.title[locale]} />}
              </span>
              <span class="small">
                {say(locale, "groupMeta", { n: group.learnerCount, code: group.joinCode })}
              </span>
              <span class="small">
                {say(locale, "madeOn", { date: dateText(group.createdAt, locale) })}
              </span>
            </button>
          );
        })}
        <button type="button" class="link is-quiet" onClick={onSignOut}>
          {say(locale, "signOut")}
        </button>
      </div>
      <div class="page-foot">
        <button type="button" class="primary" onClick={onNew}>
          {say(locale, "newGroup")}
        </button>
      </div>
    </div>
  );
}

function NewGroupScreen({
  courses,
  locale,
  onMade,
  onBack,
}: {
  courses: readonly Course[];
  locale: Locale;
  onMade: (group: TeacherGroup) => void;
  onBack: () => void;
}): JSX.Element {
  const [picked, setPicked] = useState<string | undefined>(
    courses.length === 1 ? courses[0]?.id : undefined,
  );
  const [problem, setProblem] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const make = async () => {
    if (picked === undefined) return;
    setIsSending(true);
    setProblem(undefined);
    try {
      onMade(await api.newGroup(picked));
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSending(false);
    }
  };
  const isReady = picked !== undefined && !isSending;
  return (
    <div class="lesson page">
      <div class="page-top">
        <BackButton label="Back" onBack={onBack} />
      </div>
      <div class="page-body">
        <h1 class="page-title">{say(locale, "newGroupTitle")}</h1>
        <p class="lead">{say(locale, "newGroupLead")}</p>
        {courses.map((course) => (
          <button
            key={course.id}
            type="button"
            class={picked === course.id ? "card is-picked" : "card"}
            aria-pressed={picked === course.id}
            onClick={() => setPicked(course.id)}
          >
            <span class="name">
              <RichText text={course.title[locale]} />
            </span>
            <span class="small">
              {course.chapters.length === 1
                ? say(locale, "oneChapter")
                : say(locale, "chapters", { n: course.chapters.length })}
            </span>
          </button>
        ))}
        {problem !== undefined && <p class="bad">{problem}</p>}
      </div>
      <div class="page-foot">
        <button
          type="button"
          class={isReady ? "primary" : "primary is-off"}
          disabled={!isReady}
          onClick={() => void make()}
        >
          {say(locale, "createGroup")}
        </button>
      </div>
    </div>
  );
}

/** A button that asks for a second tap before it acts (no browser dialogs). */
function TwoTap({
  label,
  confirm,
  class: extra,
  onConfirm,
}: {
  label: string;
  confirm: string;
  class: string;
  onConfirm: () => void;
}): JSX.Element {
  const [isArmed, setIsArmed] = useState(false);
  useEffect(() => {
    if (!isArmed) return;
    const timer = setTimeout(() => setIsArmed(false), 4000);
    return () => clearTimeout(timer);
  }, [isArmed]);
  return (
    <button
      type="button"
      class={isArmed ? `${extra} is-armed` : extra}
      onClick={() => {
        if (isArmed) {
          setIsArmed(false);
          onConfirm();
        } else setIsArmed(true);
      }}
    >
      {isArmed ? confirm : label}
    </button>
  );
}

/** A question's name as words: its family ("bus-to-stop/one": "Bus to stop"). */
const questionText = (name: string) => {
  const words = (name.split("/")[0] ?? name).replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Their first name: how a teacher says it. */
const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? name;

/** "AR" for Aditi Rao. */
const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

const BAND_WORD = {
  [Band.Strong]: "bandStrong",
  [Band.Unsure]: "bandUnsure",
  [Band.Weak]: "bandWeak",
} as const;

const GOT_THERE_WORD = {
  [GotThere.Yes]: "gotThereYes",
  [GotThere.Partly]: "gotTherePartly",
  [GotThere.NotYet]: "gotThereNotYet",
} as const;

const KIND_WORD = {
  [PointKind.NeedsYou]: "needsYou",
  [PointKind.GettingThere]: "gettingThere",
  [PointKind.OnTrack]: "onTrack",
} as const;

/** A card's snapshot width, and a try's on a child's page. */
const CARD_SNAPSHOT = 112;
const TRY_SNAPSHOT = 136;

/** How sure: "3 of 4 tries wrong · yesterday". */
function sureText(wrong: number, of: number, at: number, locale: Locale): string {
  return say(locale, "wrongOf", { wrong, of, when: whenText(at, locale) });
}

/** A child's chip: their name, to open their page. */
function Chip({
  learner,
  tone,
  onLearner,
}: {
  learner: GroupLearner;
  tone: string;
  onLearner: (learner: GroupLearner) => void;
}): JSX.Element {
  return (
    <button type="button" class={`chip is-${tone}`} onClick={() => onLearner(learner)}>
      {firstName(learner.name)}
    </button>
  );
}

/**
 * The section home (platform/docs/plans/teacher-view.md): who needs the teacher today and for
 * what, each with the proof (their own board at their last wrong try) and one next step; the
 * mistakes several share; everyone else, by name. Today's concept squares are under "More".
 */
function GroupScreen({
  reply,
  course,
  locale,
  onLearner,
  onNewCode,
  onBack,
}: {
  reply: GroupReply;
  course: Course | undefined;
  locale: Locale;
  onLearner: (learner: GroupLearner) => void;
  onNewCode: () => void;
  onBack: () => void;
}): JSX.Element {
  const { group, learners } = reply;
  const concepts = course === undefined ? [] : conceptsOf(course);
  const [shared, setShared] = useState(false);
  const link = `${window.location.origin}/join/${group.joinCode}`;
  const courseTitle = course?.title[locale] ?? "";
  const section = sectionOf(learners, Date.now());

  const share = async () => {
    const text = say(locale, "shareText", { course: courseTitle, link });
    try {
      if (navigator.share !== undefined) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setShared(true);
      }
    } catch {
      // they closed the share sheet: nothing to do
    }
  };
  const sorted = [...learners].sort(
    (a, b) =>
      doneCount(concepts, a.progress) - doneCount(concepts, b.progress) ||
      (a.lastActiveAt ?? 0) - (b.lastActiveAt ?? 0),
  );

  return (
    <div class="lesson page is-wide">
      <div class="page-top">
        <BackButton label={say(locale, "goBack")} onBack={onBack} />
        <div class="grow" />
        <span class="code-pill">{group.joinCode}</span>
      </div>
      <div class="page-body is-tight">
        <div>
          <div class="kicker">
            <RichText text={courseTitle} /> · {say(locale, "studentsCount", { n: learners.length })}
          </div>
          <h1 class="page-title">{say(locale, "whoNeedsYou")}</h1>
          <p class="small">{say(locale, "needsYouRule")}</p>
        </div>
        {learners.length === 0 && <p class="lead">{say(locale, "noStudentsYet")}</p>}
        {learners.length > 0 && section.needsYou.length === 0 && (
          <p class="small">{say(locale, "noOneNeedsYou")}</p>
        )}
        <div class="needs-list">
          {section.needsYou.map(({ learner, point, wrong, of, shown }) => (
            <button
              key={learner.id}
              type="button"
              class="needs-card"
              onClick={() => onLearner(learner)}
            >
              {shown !== undefined && (
                <TrySnapshot
                  groupId={group.id}
                  learnerId={learner.id}
                  question={shown.question}
                  tried={shown.try}
                  width={CARD_SNAPSHOT}
                  locale={locale}
                />
              )}
              <span class="needs-words">
                <span class="learner-name">{learner.name}</span>
                <span class="needs-claim">{point.text}</span>
                <span class="small">
                  {sureText(
                    wrong,
                    of,
                    shown?.try.at ?? learner.latestUpdate?.finishedAt ?? 0,
                    locale,
                  )}
                </span>
                {point.next !== null && <span class="needs-next">→ {point.next}</span>}
              </span>
            </button>
          ))}
          {section.alsoNeedsYou.length > 0 && (
            <div class="chip-group">
              <span class="small">{say(locale, "alsoNeedsYou")}</span>
              <div class="chips">
                {section.alsoNeedsYou.map((l) => (
                  <Chip key={l.id} learner={l} tone="needs" onLearner={onLearner} />
                ))}
              </div>
            </div>
          )}
          {section.gotIt.map(({ learner, was }) => (
            <button
              key={learner.id}
              type="button"
              class="needs-card is-cleared"
              onClick={() => onLearner(learner)}
            >
              <span class="needs-words">
                <span class="learner-name">{learner.name}</span>
                <span class="needs-claim">{say(locale, "gotItOnTheirOwn")}</span>
                <span class="small">{say(locale, "was", { was })}</span>
              </span>
            </button>
          ))}
        </div>

        {section.mistakes.length > 0 && (
          <section class="teacher-section">
            <h2 class="section-head is-shared">{say(locale, "sharedMistakes")}</h2>
            {section.mistakes.map((m) => (
              <div key={m.key} class="mistake-card">
                {m.label !== null && (
                  <span class="needs-claim">
                    {say(locale, "looksLike", {
                      mistake: m.label.charAt(0).toLowerCase() + m.label.slice(1),
                    })}
                  </span>
                )}
                <span class="small">
                  {say(locale, "sameAnswer", {
                    answer: `“${m.answer[locale]}”`,
                    question: questionText(m.question.name),
                  })}
                </span>
                <span class="faces">
                  {m.learners.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      class="face"
                      title={l.name}
                      onClick={() => onLearner(l)}
                    >
                      {initials(l.name)}
                    </button>
                  ))}
                  <span class="small">
                    {say(locale, "childrenCount", { n: m.learners.length })}
                  </span>
                </span>
              </div>
            ))}
          </section>
        )}

        {section.gettingThere.length + section.onTrack.length + section.notYet.length > 0 && (
          <section class="teacher-section">
            <h2 class="section-head is-else">{say(locale, "everyoneElse")}</h2>
            {(
              [
                ["gettingThere", "getting", section.gettingThere],
                ["onTrack", "on-track", section.onTrack],
                ["noPracticeYet", "not-yet", section.notYet],
              ] as const
            ).map(([word, tone, list]) =>
              list.length === 0 ? null : (
                <div key={word} class="chip-group">
                  <span class="small">{say(locale, word)}</span>
                  <div class="chips">
                    {list.map((l) => (
                      <Chip key={l.id} learner={l} tone={tone} onLearner={onLearner} />
                    ))}
                  </div>
                </div>
              ),
            )}
          </section>
        )}

        <details class="more">
          <summary>{say(locale, "more")}</summary>
          <div class="group-actions">
            <button type="button" class="second is-small" onClick={() => void share()}>
              {shared ? say(locale, "linkCopied") : say(locale, "shareLink")}
            </button>
            <TwoTap
              class="second is-small"
              label={say(locale, "newCode")}
              confirm={say(locale, "newCodeConfirm")}
              onConfirm={onNewCode}
            />
          </div>
          <div class="legend">
            <span class="small">{say(locale, "eachSquare")}</span>
            <span class="small">{say(locale, "mostBehind")} ↓</span>
          </div>
          <div class="learners">
            {sorted.map((learner) => (
              <button
                key={learner.id}
                type="button"
                class="learner-row"
                onClick={() => onLearner(learner)}
              >
                <span class="learner-who">
                  <span class="learner-name">{learner.name}</span>
                  <span class="small">
                    {learner.lastActiveAt === null
                      ? say(locale, "neverActive")
                      : whenText(learner.lastActiveAt, locale)}
                  </span>
                </span>
                <span class="squares">
                  {concepts.map((concept) => (
                    <Square
                      key={concept.id}
                      mark={conceptMark(
                        concept,
                        learner.progress[concept.id],
                        learner.mastery.find((m) => m.concept === concept.id),
                      )}
                      label={concept.title[locale]}
                    />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

/** One try, as proof: their board then, what they answered, right or wrong, when, with Jugnu. */
function TryRow({
  groupId,
  learner,
  on,
  locale,
}: {
  groupId: string;
  learner: GroupLearner;
  on: TryOn;
  locale: Locale;
}): JSX.Element {
  const t = on.try;
  const name = firstName(learner.name);
  const [asked, setAsked] = useState<Localized | undefined>();
  return (
    <div class="try-row">
      <TrySnapshot
        groupId={groupId}
        learnerId={learner.id}
        question={on.question}
        tried={t}
        width={TRY_SNAPSHOT}
        locale={locale}
        onAsked={setAsked}
      />
      <span class="try-words">
        <span class="small try-asked">
          {asked === undefined ? questionText(on.question.name) : <RichText text={asked[locale]} />}
        </span>
        {t.chosen === null ? (
          <span>{say(locale, "noAnswerWords", { name })}</span>
        ) : (
          <span>
            <b>{say(locale, "theyAnswered", { name })}</b> “<RichText text={t.chosen[locale]} />”
          </span>
        )}
        <span class="try-meta">
          <span class={t.isRight ? "verdict is-right" : "verdict is-wrong"}>
            {say(locale, t.isRight ? "triedRight" : "triedWrong")}
          </span>
          <span class="small">
            {whenText(t.at, locale)}
            {t.helped ? ` · ${say(locale, "withJugnu")}` : ""}
          </span>
        </span>
      </span>
    </div>
  );
}

/**
 * A child's page: the claim, then the proof (platform/docs/plans/teacher-view.md): the point that
 * needs the teacher (else the first not on track), how sure, their tries at the questions it cites
 * as their own boards, what Jugnu noticed; their other points; "More" keeps their concepts.
 */
function LearnerScreen({
  groupId,
  learner,
  view,
  course,
  locale,
  onRemove,
  onBack,
}: {
  groupId: string;
  learner: GroupLearner;
  /** Jugnu's reflections on their latest set (once loaded). */
  view: LearnerReply | undefined;
  course: Course | undefined;
  locale: Locale;
  onRemove: () => void;
  onBack: () => void;
}): JSX.Element {
  const concepts = course === undefined ? [] : conceptsOf(course);
  const update = learner.latestUpdate;
  const claim = needsYouPoint(learner) ?? update?.points.find((p) => p.kind !== PointKind.OnTrack);
  const tries = claim === undefined ? [] : triesOf(claim);
  const wrong = tries.filter((t) => !t.try.isRight).length;
  const claimConcepts = [...new Set(claim?.questions.flatMap((q) => q.concepts) ?? [])];
  const others = update?.points.filter((p) => p !== claim) ?? [];
  const active =
    learner.lastActiveAt === null
      ? say(locale, "neverActive")
      : say(locale, "activeWhen", { when: whenText(learner.lastActiveAt, locale) });
  return (
    <div class="lesson page is-wide">
      <div class="page-top">
        <BackButton label={say(locale, "goBack")} onBack={onBack} />
      </div>
      <div class="page-body is-tight">
        <h1 class="page-title">{learner.name}</h1>
        {update === null ? (
          <p class="small">{say(locale, "noUpdateYet")}</p>
        ) : claim === undefined ? (
          <p class="claim">{say(locale, "onTrackClaim")}</p>
        ) : (
          <>
            <p class="claim">{claim.text}</p>
            {tries.length > 0 && (
              <p class="small">
                {claimConcepts.length === 0
                  ? say(locale, "fromTriesNoConcept", { wrong, of: tries.length })
                  : say(locale, "fromTries", {
                      wrong,
                      of: tries.length,
                      concepts: claimConcepts.join(", "),
                    })}
              </p>
            )}
            {claim.next !== null && <p class="needs-next">→ {claim.next}</p>}
            <div class="tries">
              {tries.map((on) => (
                <TryRow
                  key={`${on.try.opening}:${on.try.at}`}
                  groupId={groupId}
                  learner={learner}
                  on={on}
                  locale={locale}
                />
              ))}
            </div>
          </>
        )}
        {view !== undefined && view.reflections.length > 0 && (
          // His words are long: one line each, opened to read.
          <section class="noticed">
            <h2 class="section-head">{say(locale, "jugnuNoticed")}</h2>
            {view.reflections.map((r) => (
              <details key={r.id} class="noticed-text">
                <summary>
                  {questionText(r.name)} · {say(locale, GOT_THERE_WORD[r.gotThere])}
                </summary>
                {r.points.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </details>
            ))}
          </section>
        )}
        {others.length > 0 && (
          <section class="teacher-section">
            <h2 class="section-head">{say(locale, "alsoNoticed")}</h2>
            {others.map((p, i) => (
              <div key={i} class="point-row">
                <span class="small">{say(locale, KIND_WORD[p.kind])}</span>
                <span class="point-text">{p.text}</span>
              </div>
            ))}
          </section>
        )}
        <details class="more">
          <summary>{say(locale, "more")}</summary>
          <span class="small">
            {say(locale, "joinedOn", { date: dateText(learner.joinedAt, locale) })} · {active} ·{" "}
            {say(locale, "conceptsDone", {
              done: doneCount(concepts, learner.progress),
              all: concepts.length,
            })}
          </span>
          <div class="learners">
            {concepts.map((concept) => {
              const mine = learner.progress[concept.id];
              const known = learner.mastery.find((m) => m.concept === concept.id);
              const mark = conceptMark(concept, mine, known);
              const status =
                mine?.practice != null
                  ? `${mine.practice.right}/${mine.practice.of}`
                  : mark === ConceptMark.Done
                    ? say(locale, "learnt")
                    : mark === ConceptMark.Started
                      ? say(locale, "pagesOnly")
                      : say(locale, "notReached");
              return (
                <div key={concept.id} class="concept-row">
                  <Square mark={mark} />
                  <span class="learner-who">
                    <span class="learner-name">
                      <RichText text={concept.title[locale]} />
                    </span>
                    <span class="small">{status}</span>
                    {known !== undefined && (
                      <span class="small">
                        {say(locale, known.tries === 1 ? "masteryLineOne" : "masteryLine", {
                          p: Math.round(known.estimate * 100),
                          band: say(locale, BAND_WORD[known.band]),
                          n: known.tries,
                        })}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <TwoTap
            class="link is-danger"
            label={say(locale, "remove")}
            confirm={say(locale, "removeConfirm")}
            onConfirm={onRemove}
          />
        </details>
      </div>
    </div>
  );
}

type TeacherScreen =
  | { kind: "groups" }
  | { kind: "new" }
  | { kind: "group"; id: string }
  | { kind: "learner"; id: string; learnerId: string };

/** The teacher's side of the app: its own screens and the group it has open. */
export function TeacherApp({
  me,
  courses,
  locale,
  onLocale,
  onMe,
  onSignOut,
}: {
  me: MeReply;
  courses: readonly Course[];
  locale: Locale;
  onLocale: (locale: Locale) => void;
  /** Fetch who's signed in again (a group made or changed shows on the list). */
  onMe: () => Promise<void>;
  onSignOut: () => void;
}): JSX.Element {
  const [screen, setScreen] = useState<TeacherScreen>({ kind: "groups" });
  const [open, setOpen] = useState<GroupReply | undefined>();
  const [problem, setProblem] = useState<string | undefined>();
  const groupId = screen.kind === "group" || screen.kind === "learner" ? screen.id : undefined;

  const load = useCallback(async (id: string) => {
    setProblem(undefined);
    try {
      setOpen(await api.group(id));
    } catch (error) {
      setProblem(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    if (groupId !== undefined && open?.group.id !== groupId) void load(groupId);
  }, [groupId, open?.group.id, load]);

  // One learner open: their latest update with its evidence, fetched for them.
  const [learnerView, setLearnerView] = useState<LearnerReply | undefined>();
  const learnerId = screen.kind === "learner" ? screen.learnerId : undefined;
  useEffect(() => {
    if (groupId === undefined || learnerId === undefined) return;
    let isCurrent = true;
    api
      .learner(groupId, learnerId)
      .then((view) => {
        if (isCurrent) setLearnerView(view);
      })
      .catch((error: unknown) => console.warn("Learner view:", error));
    return () => {
      isCurrent = false;
    };
  }, [groupId, learnerId]);

  const backToGroups = () => {
    setOpen(undefined);
    setScreen({ kind: "groups" });
    void onMe();
  };

  if (screen.kind === "groups")
    return (
      <GroupsScreen
        me={me}
        courses={courses}
        locale={locale}
        onLocale={onLocale}
        onGroup={(group) => setScreen({ kind: "group", id: group.id })}
        onNew={() => setScreen({ kind: "new" })}
        onSignOut={onSignOut}
      />
    );
  if (screen.kind === "new")
    return (
      <NewGroupScreen
        courses={courses}
        locale={locale}
        onMade={(group) => {
          void onMe();
          setScreen({ kind: "group", id: group.id });
        }}
        onBack={() => setScreen({ kind: "groups" })}
      />
    );
  if (open === undefined || open.group.id !== screen.id)
    return (
      <div class="lesson page">
        <div class="page-top">
          <BackButton label="Back" onBack={backToGroups} />
        </div>
        {problem !== undefined && <p class="bad page-body">{problem}</p>}
      </div>
    );
  const course = courses.find((c) => c.id === open.group.courseId);
  if (screen.kind === "group")
    return (
      <GroupScreen
        reply={open}
        course={course}
        locale={locale}
        onLearner={(learner) => setScreen({ ...screen, kind: "learner", learnerId: learner.id })}
        onNewCode={() =>
          void api.newJoinCode(open.group.id).then((group) => setOpen({ ...open, group }))
        }
        onBack={backToGroups}
      />
    );
  const learner = open.learners.find((l) => l.id === screen.learnerId);
  if (learner === undefined)
    return <Redirect onGo={() => setScreen({ kind: "group", id: screen.id })} />;
  return (
    <LearnerScreen
      key={learner.id}
      groupId={open.group.id}
      learner={learner}
      view={learnerView?.learner.id === learner.id ? learnerView : undefined}
      course={course}
      locale={locale}
      onRemove={() =>
        void api.removeLearner(open.group.id, learner.id).then(() => {
          setScreen({ kind: "group", id: open.group.id });
          return load(open.group.id);
        })
      }
      onBack={() => setScreen({ kind: "group", id: screen.id })}
    />
  );
}

/** A learner who's no longer in the group (just removed): back to the group. */
function Redirect({ onGo }: { onGo: () => void }): JSX.Element {
  useEffect(onGo, []);
  return <div class="lesson page" />;
}
