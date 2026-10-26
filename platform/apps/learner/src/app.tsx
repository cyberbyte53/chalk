import {
  type MeReply,
  type Progress,
  Role,
  boardFactsFrom,
  isConceptDone,
  meReplySchema,
  mergeProgress,
  normalizeCode,
  progressFrom,
  progressSchema,
} from "@chalk/api";
import { Actor, type ChalkEvent, Locale } from "@chalk/content";
import { createEventBus } from "@chalk/events";
import { preloadProps, propLibrary } from "@chalk/library";
import { LessonPlayer, PlayMode } from "@chalk/player";
import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { z } from "zod";
import { JoinScreen, SetupScreen, WelcomeScreen } from "./account-screens";
import { api } from "./api-client";
import { ChapterGate } from "./chapter-gate";
import type { Course, CourseChapter } from "./course";
import { ChapterScreen, CourseScreen, currentConcept } from "./course-screens";
import { DevShell } from "./dev-shell";
import { devSession, stopDevSignIn } from "./dev-sign-in";
import { HomeScreen } from "./home-screen";
import { jugnuLink } from "./jugnu";
import { courses, plans } from "./lessons";
import { ChapterDoneScreen, ResultScreen, ScreenSamples } from "./practice-screens";
import { PreviewShell } from "./preview-shell";
import { ReviewShell } from "./review-shell";
import { settings } from "./settings";
import { StudioShell } from "./studio-shell";
import { TeacherApp } from "./teacher-screens";
import { type Uploader, deviceStore, startUploader } from "./uploader";

/** One event channel for the whole run of the app; the uploader is one subscriber. */
const bus = createEventBus({ commit: settings.commit });
const jugnu = jugnuLink();

const LOCALE_KEY = "chalk.locale";
const JOIN_KEY = "chalk.join";
const ME_KEY = "chalk.me";
const PROGRESS_KEY = "chalk.progress";

/** Browser storage for small conveniences; it may be missing or throw (private mode). */
const remember = {
  get: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string | null) => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // nothing to do: it's a convenience
    }
  },
};

/** Something kept as JSON, if it's still there and still reads. */
function readJson<S extends z.ZodTypeAny>(key: string, schema: S): z.infer<S> | undefined {
  const text = remember.get(key);
  if (text === null) return undefined;
  try {
    const parsed = schema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}

/** A join link (`/join/K7PQ3M`) opened the app: keep the code through sign-in and setup. */
function joinCodeFromLink(): string | null {
  const match = /^\/join\/([^/]+)\/?$/.exec(window.location.pathname);
  if (match?.[1] === undefined) return remember.get(JOIN_KEY);
  const code = normalizeCode(decodeURIComponent(match[1]));
  remember.set(JOIN_KEY, code);
  window.history.replaceState(null, "", "/");
  return code;
}

/** The node of the course a screen shows, and why. */
function nodeOnScreen(
  screen: Screen,
): { node: { node: string; version: string }; reason?: string } | undefined {
  if (screen.kind === "home" || screen.kind === "join") return undefined;
  const course = courses.find((c) => c.id === screen.course);
  if (course === undefined) return undefined;
  if (screen.kind === "course") return { node: { node: course.id, version: course.version } };
  const chapter = course.chapters[screen.chapter];
  if (chapter === undefined) return undefined;
  if (screen.kind !== "lesson") return { node: { node: chapter.id, version: chapter.version } };
  const concept = chapter.concepts.find((c) => c.id === screen.concept);
  return concept === undefined
    ? undefined
    : { node: { node: concept.id, version: concept.version }, reason: screen.part };
}

type Session = { kind: "loading" } | { kind: "signedOut" } | { kind: "signedIn"; me: MeReply };

type Place = { course: string; chapter: number };
type Screen =
  | { kind: "home" }
  | { kind: "join"; code: string }
  | ({ kind: "course" } & Pick<Place, "course">)
  | ({ kind: "chapter" } & Place)
  | ({ kind: "lesson"; concept: string; part: "pages" | "practice" } & Place)
  | ({ kind: "result"; concept: string } & Place)
  | ({ kind: "chapterDone" } & Place);

export function App(): JSX.Element {
  const isDevShell = import.meta.env.DEV && new URLSearchParams(window.location.search).has("dev");
  const [locale, setLocale] = useState<Locale>(
    remember.get(LOCALE_KEY) === Locale.Hi ? Locale.Hi : Locale.En,
  );
  const [session, setSession] = useState<Session>({ kind: "loading" });
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [serverProgress, setServerProgress] = useState<Progress>({});
  // Everything this phone produced since it opened, so progress shows before it's uploaded.
  const [localEvents, setLocalEvents] = useState<readonly ChalkEvent[]>([]);
  const [pendingJoin, setPendingJoin] = useState<string | null>(joinCodeFromLink);
  const uploader = useRef<Uploader | undefined>();

  const progress = useMemo(
    () => mergeProgress(serverProgress, progressFrom(boardFactsFrom(localEvents), plans)),
    [serverProgress, localEvents],
  );

  // The node of the course on screen (a book, a chapter, a concept being played) is opened and
  // closed in the record, like a board.
  const shownKey = JSON.stringify(nodeOnScreen(screen) ?? null);
  useEffect(() => {
    const shown = JSON.parse(shownKey) as ReturnType<typeof nodeOnScreen> | null;
    if (shown === null || shown === undefined) return;
    const place = { actor: Actor.App, opening: null, board: null, ...shown.node } as const;
    bus.record({
      ...place,
      kind: "open",
      payload: shown.reason === undefined ? {} : { reason: shown.reason },
    });
    return () => void bus.record({ ...place, kind: "close", payload: {} });
  }, [shownKey]);

  const changeLocale = (next: Locale) => {
    setLocale(next);
    remember.set(LOCALE_KEY, next);
  };

  useEffect(() => bus.subscribe((event) => setLocalEvents((prev) => [...prev, event])), []);

  // Who's signed in on this device. Offline, the last answer stands, so learning goes on.
  useEffect(() => {
    api
      .me()
      .then(devSession)
      .then(
        (me) => setSession(me === undefined ? { kind: "signedOut" } : { kind: "signedIn", me }),
        () => {
          const last = readJson(ME_KEY, meReplySchema);
          setSession(last === undefined ? { kind: "signedOut" } : { kind: "signedIn", me: last });
        },
      );
  }, []);

  // Kept for the next time the app opens offline.
  useEffect(() => {
    if (session.kind === "signedIn") remember.set(ME_KEY, JSON.stringify(session.me));
  }, [session]);
  useEffect(() => {
    if (Object.keys(serverProgress).length > 0)
      remember.set(PROGRESS_KEY, JSON.stringify(serverProgress));
  }, [serverProgress]);

  const me = session.kind === "signedIn" ? session.me : undefined;
  const role = me?.account.role ?? null;
  const accountId = me?.account.id;

  // Signed in: start uploading events, fetch progress, and act on a join link.
  useEffect(() => {
    if (accountId === undefined || role === null) return;
    let isLive = true;
    void deviceStore().then(async (store) => {
      if (!isLive) return;
      // Events from earlier visits not uploaded yet still count towards progress here.
      const waiting = await store.take(Number.MAX_SAFE_INTEGER);
      if (waiting.length > 0) setLocalEvents((prev) => [...waiting, ...prev]);
      uploader.current = startUploader({ bus, store, send: api.sendEvents });
    });
    if (role === Role.Learner)
      api.progress().then(
        (p) => isLive && setServerProgress(p),
        // Offline: the last progress the server gave, plus what this phone saw.
        () => isLive && setServerProgress(readJson(PROGRESS_KEY, progressSchema) ?? {}),
      );
    return () => {
      isLive = false;
      uploader.current?.stop();
      uploader.current = undefined;
    };
  }, [accountId, role]);

  useEffect(() => {
    if (role === Role.Learner && pendingJoin !== null) {
      setScreen({ kind: "join", code: pendingJoin });
      setPendingJoin(null);
      remember.set(JOIN_KEY, null);
    }
  }, [role, pendingJoin]);

  const signOut = async () => {
    await uploader.current?.flush();
    await api.signOut().catch(() => {});
    stopDevSignIn();
    remember.set(ME_KEY, null);
    remember.set(PROGRESS_KEY, null);
    setServerProgress({});
    setScreen({ kind: "home" });
    setSession({ kind: "signedOut" });
  };

  const refreshMe = async () => {
    const next = await api.me().catch(() => undefined);
    if (next !== undefined) setSession({ kind: "signedIn", me: next });
  };

  if (isDevShell && new URLSearchParams(window.location.search).has("board"))
    return <PreviewShell bus={bus} />;
  if (isDevShell && new URLSearchParams(window.location.search).has("review"))
    return <ReviewShell bus={bus} />;
  if (isDevShell && new URLSearchParams(window.location.search).has("studio"))
    return <StudioShell />;
  if (isDevShell) return <DevShell bus={bus} />;
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("screens"))
    return <ScreenSamples locale={locale} />;
  if (session.kind === "loading") return <div class="lesson page" />;
  if (session.kind === "signedOut")
    return (
      <WelcomeScreen
        locale={locale}
        onLocale={changeLocale}
        onSignedIn={(next) => setSession({ kind: "signedIn", me: next })}
      />
    );
  const signedIn = session.me;
  if (signedIn.account.role === null)
    return (
      <SetupScreen
        me={signedIn}
        locale={locale}
        onDone={(next) => setSession({ kind: "signedIn", me: next })}
        onSignOut={() => void signOut()}
      />
    );
  if (signedIn.account.role === Role.Teacher)
    return (
      <TeacherApp
        me={signedIn}
        courses={courses}
        locale={locale}
        onLocale={changeLocale}
        onMe={refreshMe}
        onSignOut={() => void signOut()}
      />
    );

  const courseById = (id: string): Course | undefined => courses.find((c) => c.id === id);
  const home = () => setScreen({ kind: "home" });

  /** After a concept, its chapter again, or the chapter's end once every concept is done. */
  const afterConcept = (place: Place) => {
    const chapter = courseById(place.course)?.chapters[place.chapter];
    const isChapterDone = chapter !== undefined && currentConcept(chapter, progress) === -1;
    setScreen({ kind: isChapterDone ? "chapterDone" : "chapter", ...place });
  };

  switch (screen.kind) {
    case "home":
      return (
        <HomeScreen
          me={signedIn}
          courses={courses}
          progress={progress}
          locale={locale}
          onLocale={changeLocale}
          onCourse={(course) =>
            course.chapters.length === 1
              ? setScreen({ kind: "chapter", course: course.id, chapter: 0 })
              : setScreen({ kind: "course", course: course.id })
          }
          onConcept={(course, chapter, concept) =>
            setScreen({ kind: "lesson", course: course.id, chapter, concept, part: "pages" })
          }
          onAddTeacher={() => setScreen({ kind: "join", code: "" })}
          onSignOut={() => void signOut()}
        />
      );
    case "join":
      return (
        <JoinScreen
          locale={locale}
          initialCode={screen.code}
          onJoined={() => void refreshMe().then(home)}
          onBack={home}
        />
      );
    case "course": {
      const course = courseById(screen.course);
      if (course === undefined) return <Missing onHome={home} />;
      return (
        <CourseScreen
          course={course}
          locale={locale}
          onChapter={(chapter) => setScreen({ kind: "chapter", course: course.id, chapter })}
          onBack={home}
        />
      );
    }
    case "chapter": {
      const course = courseById(screen.course);
      const chapter = course?.chapters[screen.chapter];
      if (course === undefined || chapter === undefined) return <Missing onHome={home} />;
      const back = () =>
        course.chapters.length === 1 ? home() : setScreen({ kind: "course", course: course.id });
      return (
        <ChapterGate chapter={chapter} locale={locale} prepare={prepareChapter} onBack={back}>
          {(content) => (
            <ChapterScreen
              chapter={chapter}
              number={screen.chapter + 1}
              locale={locale}
              progress={progress}
              onConcept={(concept) => {
                const mine = progress[concept];
                const hasPractice = content.get(concept)?.practice != null;
                // Pages already played: straight on to practice.
                const part =
                  mine?.isLearnt && hasPractice && !isConceptDone(mine, true)
                    ? "practice"
                    : "pages";
                setScreen({ ...screen, kind: "lesson", concept, part });
              }}
              onBack={back}
            />
          )}
        </ChapterGate>
      );
    }
    case "lesson": {
      const chapter = courseById(screen.course)?.chapters[screen.chapter];
      if (chapter === undefined) return <Missing onHome={home} />;
      const place = { course: screen.course, chapter: screen.chapter };
      return (
        <ChapterGate
          chapter={chapter}
          locale={locale}
          prepare={prepareChapter}
          onBack={() => setScreen({ kind: "chapter", ...place })}
        >
          {(content) => {
            const lessons = content.get(screen.concept);
            const lesson = screen.part === "pages" ? lessons?.pages : lessons?.practice;
            if (lessons === undefined || lesson == null) return <Missing onHome={home} />;
            return (
              <LessonPlayer
                key={`${lesson.id}-${locale}`}
                lesson={lesson}
                mode={screen.part === "pages" ? PlayMode.Lesson : PlayMode.Guided}
                registry={propLibrary}
                locale={locale}
                bus={bus}
                jugnu={jugnu}
                onExit={() => setScreen({ kind: "chapter", ...place })}
                onComplete={() => {
                  void uploader.current?.flush();
                  if (screen.part === "pages" && lessons.practice !== null)
                    setScreen({ ...screen, part: "practice" });
                  else if (screen.part === "practice")
                    setScreen({ kind: "result", ...place, concept: screen.concept });
                  else afterConcept(place);
                }}
              />
            );
          }}
        </ChapterGate>
      );
    }
    case "result": {
      const concept = courseById(screen.course)?.chapters[screen.chapter]?.concepts.find(
        (c) => c.id === screen.concept,
      );
      const score = progress[screen.concept]?.practice;
      if (concept === undefined || score == null) return <Missing onHome={home} />;
      const place = { course: screen.course, chapter: screen.chapter };
      return (
        <ResultScreen
          concept={concept}
          score={score}
          locale={locale}
          onAgain={() =>
            setScreen({ kind: "lesson", ...place, concept: concept.id, part: "practice" })
          }
          onNext={() => afterConcept(place)}
        />
      );
    }
    case "chapterDone": {
      const course = courseById(screen.course);
      const chapter = course?.chapters[screen.chapter];
      if (course === undefined || chapter === undefined) return <Missing onHome={home} />;
      return (
        <ChapterDoneScreen
          chapter={chapter}
          number={screen.chapter + 1}
          courseTitle={course.title[locale]}
          progress={progress}
          locale={locale}
          onDone={home}
        />
      );
    }
  }
}

/** Alongside a chapter's lessons: the drawing code of every prop it uses. */
const prepareChapter = (chapter: CourseChapter): Promise<void> => preloadProps(chapter.props);

/** Content the app doesn't have (an old link, a course since removed): back home. */
function Missing({ onHome }: { onHome: () => void }): JSX.Element {
  useEffect(onHome, []);
  return <div class="lesson page" />;
}
