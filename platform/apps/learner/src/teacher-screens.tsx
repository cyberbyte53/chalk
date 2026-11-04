import {
  GotThere,
  type GroupLearner,
  type GroupReply,
  type LearnerReply,
  type MeReply,
  type QuestionSeen,
  type TeacherGroup,
} from "@chalk/api";
import type { Locale } from "@chalk/content";
import { Band, type Progress, isConceptDone } from "@chalk/learning";
import { RichText } from "@chalk/player";
import type { JSX } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import { BackButton, LocaleToggle } from "./account-screens";
import { api } from "./api-client";
import { say } from "./app-text";
import { ConceptMark, conceptMark } from "./concept-mark";
import type { Course, CourseConcept } from "./course";
import { ArtView } from "./course-screens";

/**
 * What a teacher sees, on their phone: their groups, a new group, one group (every learner's
 * concepts as squares, most behind first, and what their last practice showed) and one learner
 * (what they aren't good at yet, with its evidence; their concepts; Jugnu's reflections). Progress
 * comes from the learners' own events; the rest is the server's learner update (judged points).
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
  const finished = learners.filter(
    (l) => concepts.length > 0 && doneCount(concepts, l.progress) === concepts.length,
  ).length;
  const notStarted = learners.filter((l) => Object.keys(l.progress).length === 0).length;
  // The concept most of the class is weak on (the learner model's band); none while no one is.
  let weakest: { concept: CourseConcept; weak: number } | undefined;
  for (const concept of concepts) {
    const weak = learners.filter((l) =>
      l.mastery.some((m) => m.concept === concept.id && m.band === Band.Weak),
    ).length;
    if (weak > 0 && (weakest === undefined || weak > weakest.weak)) weakest = { concept, weak };
  }

  return (
    <div class="lesson page is-wide">
      <div class="page-top">
        <BackButton label="Back" onBack={onBack} />
        <div class="grow" />
        <span class="code-pill">{group.joinCode}</span>
      </div>
      <div class="page-body is-tight">
        <div>
          <div class="kicker">
            {say(locale, "studentsCount", { n: learners.length })} ·{" "}
            {say(locale, "madeOn", { date: dateText(group.createdAt, locale) })}
          </div>
          <h1 class="page-title">
            <RichText text={courseTitle} />
          </h1>
        </div>
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
        {learners.length === 0 ? (
          <p class="lead">{say(locale, "noStudentsYet")}</p>
        ) : (
          <>
            <div class="stats">
              <div class="stat">
                <b>{finished}</b>
                <span class="small">{say(locale, "finished")}</span>
              </div>
              <div class="stat">
                <b>{notStarted}</b>
                <span class="small">{say(locale, "notStartedYet")}</span>
              </div>
              <div class="stat">
                <b class="is-weak">
                  {weakest?.concept.glyph ?? (weakest === undefined ? "–" : "!")}
                </b>
                <span class="small">
                  {say(locale, "weakest")}
                  {weakest === undefined ? "" : ": "}
                  {weakest !== undefined && <RichText text={weakest.concept.title[locale]} />}
                </span>
              </div>
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
                    {learner.latestUpdate?.firstPoint != null && (
                      <span class="learner-point">{learner.latestUpdate.firstPoint}</span>
                    )}
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
          </>
        )}
      </div>
    </div>
  );
}

/** A question's name as words: its family ("bus-to-stop/one": "Bus to stop"). */
const questionText = (name: string) => {
  const words = (name.split("/")[0] ?? name).replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

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

/** One cited question: its name, and their tries at it in that set. */
function Evidence({ question, locale }: { question: QuestionSeen; locale: Locale }): JSX.Element {
  return (
    <span class="evidence small">
      <b>{questionText(question.name)}</b>
      {question.tries.map((t, i) => (
        <span key={i} class={t.isRight ? "is-right" : "is-wrong"}>
          {" · "}
          {say(locale, t.isRight ? "triedRight" : "triedWrong")}
          {t.chosen === null ? "" : ` (${say(locale, "theyChose", { chosen: t.chosen })})`}
          {t.helped ? `, ${say(locale, "withJugnu")}` : ""}
        </span>
      ))}
    </span>
  );
}

function LearnerScreen({
  learner,
  view,
  course,
  locale,
  onRemove,
  onBack,
}: {
  learner: GroupLearner;
  /** Their latest update with its evidence (once loaded). */
  view: LearnerReply | undefined;
  course: Course | undefined;
  locale: Locale;
  onRemove: () => void;
  onBack: () => void;
}): JSX.Element {
  const concepts = course === undefined ? [] : conceptsOf(course);
  const update = view?.update;
  const active =
    learner.lastActiveAt === null
      ? say(locale, "neverActive")
      : say(locale, "activeWhen", { when: whenText(learner.lastActiveAt, locale) });
  return (
    <div class="lesson page is-wide">
      <div class="page-top">
        <BackButton label="Back" onBack={onBack} />
      </div>
      <div class="page-body is-tight">
        <div>
          <h1 class="page-title">{learner.name}</h1>
          <span class="small">
            {say(locale, "joinedOn", { date: dateText(learner.joinedAt, locale) })} · {active} ·{" "}
            {say(locale, "conceptsDone", {
              done: doneCount(concepts, learner.progress),
              all: concepts.length,
            })}
          </span>
        </div>
        <section class="teacher-section">
          <div class="kicker">
            {say(locale, "notYetGood")}
            {update != null &&
              ` · ${say(locale, "afterSet", { when: whenText(update.finishedAt, locale) })}`}
          </div>
          {update === undefined ? null : update === null ? (
            <p class="small">{say(locale, "noUpdateYet")}</p>
          ) : update.points.length === 0 ? (
            <p class="small">{say(locale, "allGood")}</p>
          ) : (
            <div class="learners">
              {update.points.map((point, i) => (
                <div key={i} class="point-row">
                  <span class="point-text">{point.text}</span>
                  {point.questions.map((q) => (
                    <Evidence key={q.board} question={q} locale={locale} />
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
        <section class="teacher-section">
          <div class="kicker">{say(locale, "concepts")}</div>
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
                        {say(locale, "masteryLine", {
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
        </section>
        {update != null && update.reflections.length > 0 && (
          <section class="teacher-section">
            <div class="kicker">{say(locale, "fromJugnu")}</div>
            <div class="learners">
              {update.reflections.map((r) => (
                <div key={r.id} class="point-row">
                  <span class="evidence small">
                    <b>{questionText(r.name)}</b> · {say(locale, GOT_THERE_WORD[r.gotThere])}
                  </span>
                  {r.points.map((p, i) => (
                    <span key={i} class="point-text">
                      {p}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
        <TwoTap
          class="link is-danger"
          label={say(locale, "remove")}
          confirm={say(locale, "removeConfirm")}
          onConfirm={onRemove}
        />
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
