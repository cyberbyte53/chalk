import {
  ApiErrorCode,
  type JoinedGroup,
  type MeReply,
  NAME_MAX,
  Role,
  normalizeCode,
} from "@chalk/api";
import { Locale } from "@chalk/content";
import { JugnuFigure, JugnuMood } from "@chalk/player";
import type { JSX } from "preact";
import { useCallback, useState } from "preact/hooks";
import { ApiProblem, api } from "./api-client";
import { type AppTextKey, say } from "./app-text";
import { GoogleButton } from "./google-button";
import { settings } from "./settings";

/** The words for a failed request: offline, or what the server said. */
function problemText(
  locale: Locale,
  error: unknown,
  known: Partial<Record<ApiErrorCode, AppTextKey>>,
) {
  if (error instanceof ApiProblem) {
    if (error.isOffline) return say(locale, "offline");
    const key = error.code === undefined ? undefined : known[error.code];
    if (key !== undefined) return say(locale, key);
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

export function LocaleToggle({
  locale,
  onLocale,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      class="pill"
      onClick={() => onLocale(locale === Locale.En ? Locale.Hi : Locale.En)}
    >
      {locale === Locale.En ? "हिंदी" : "English"}
    </button>
  );
}

export function BackButton({ label, onBack }: { label: string; onBack: () => void }): JSX.Element {
  return (
    <button type="button" class="icon" aria-label={label} onClick={onBack}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M11 3 L5 9 L11 15" />
      </svg>
    </button>
  );
}

/** First screen for someone signed out: who we are, and Google's button. */
export function WelcomeScreen({
  locale,
  onLocale,
  onSignedIn,
}: {
  locale: Locale;
  onLocale: (locale: Locale) => void;
  onSignedIn: (me: MeReply) => void;
}): JSX.Element {
  const [problem, setProblem] = useState<string | undefined>();
  const [devName, setDevName] = useState("");
  const signIn = async (credential: string) => {
    setProblem(undefined);
    try {
      onSignedIn(await api.signInGoogle(credential));
    } catch (error) {
      setProblem(problemText(locale, error, { [ApiErrorCode.BadGoogleToken]: "signInFailed" }));
    }
  };
  const onUnavailable = useCallback(() => setProblem(say(locale, "googleUnreachable")), [locale]);
  return (
    <div class="lesson page">
      <div class="page-top is-end">
        <LocaleToggle locale={locale} onLocale={onLocale} />
      </div>
      <div class="page-body is-centred">
        <JugnuFigure mood={JugnuMood.Celebrate} size={200} />
        <div class="brand">Chalk</div>
        <div class="tagline">{say(locale, "tagline")}</div>
        <p class="lead">{say(locale, "jugnuHelps")}</p>
      </div>
      <div class="page-foot is-stacked is-raised">
        {settings.googleClientId !== "" && (
          <GoogleButton
            clientId={settings.googleClientId}
            locale={locale}
            onCredential={(credential) => void signIn(credential)}
            onUnavailable={onUnavailable}
          />
        )}
        {settings.isDevSignIn && (
          <form
            class="dev-sign-in"
            onSubmit={(e) => {
              e.preventDefault();
              const name = devName.trim();
              if (name !== "")
                void signIn(`dev:${name.toLowerCase().replace(/\W+/g, "-")}:${name}`);
            }}
          >
            <input
              class="input"
              placeholder="Name (dev sign-in, no Google)"
              value={devName}
              onInput={(e) => setDevName(e.currentTarget.value)}
            />
            <button type="submit" class="second">
              {say(locale, "devSignIn")}
            </button>
          </form>
        )}
        {problem !== undefined && <p class="bad">{problem}</p>}
      </div>
    </div>
  );
}

/** Once, after the first sign-in: name, school code, student or teacher. */
export function SetupScreen({
  me,
  locale,
  onDone,
  onSignOut,
}: {
  me: MeReply;
  locale: Locale;
  onDone: (me: MeReply) => void;
  onSignOut: () => void;
}): JSX.Element {
  const [name, setName] = useState(me.account.name);
  const [schoolCode, setSchoolCode] = useState("");
  const [role, setRole] = useState<Role>(Role.Learner);
  const [problem, setProblem] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const firstName = me.account.name.split(" ")[0] ?? me.account.name;
  const isReady = name.trim() !== "" && normalizeCode(schoolCode).length > 0 && !isSending;

  const submit = async () => {
    setIsSending(true);
    setProblem(undefined);
    try {
      onDone(await api.setup({ name: name.trim(), schoolCode, role }));
    } catch (error) {
      setProblem(problemText(locale, error, { [ApiErrorCode.UnknownSchool]: "unknownSchool" }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      class="lesson page"
      onSubmit={(e) => {
        e.preventDefault();
        if (isReady) void submit();
      }}
    >
      <div class="page-top">
        <BackButton label={say(locale, "signOut")} onBack={onSignOut} />
      </div>
      <div class="page-body">
        <div class="who">
          <Avatar name={me.account.name} picture={me.account.picture} />
          <div>
            <div class="who-email">{me.account.email}</div>
            <div class="small">{say(locale, "signedInWithGoogle")}</div>
          </div>
        </div>
        <h1 class="page-title">{say(locale, "welcome", { name: firstName })}</h1>
        <label class="field">
          <span class="field-label">{say(locale, "yourName")}</span>
          <input
            class="input"
            value={name}
            maxLength={NAME_MAX}
            autoComplete="name"
            onInput={(e) => setName(e.currentTarget.value)}
          />
          <span class="hint">{say(locale, "yourNameHint")}</span>
        </label>
        <label class="field">
          <span class="field-label">{say(locale, "schoolCode")}</span>
          <input
            class={problem === undefined ? "input is-code" : "input is-code is-bad"}
            value={schoolCode}
            autoCapitalize="characters"
            autoComplete="off"
            spellcheck={false}
            onInput={(e) => setSchoolCode(e.currentTarget.value.toUpperCase())}
          />
          {problem === undefined ? (
            <span class="hint">{say(locale, "schoolCodeHint")}</span>
          ) : (
            <span class="bad">{problem}</span>
          )}
        </label>
        <div class="field">
          <span class="field-label">{say(locale, "iAm")}</span>
          <div class="segmented">
            {[Role.Learner, Role.Teacher].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={role === option}
                class={role === option ? "is-on" : ""}
                onClick={() => setRole(option)}
              >
                {say(locale, option === Role.Learner ? "student" : "teacher")}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div class="page-foot">
        <button type="submit" class={isReady ? "primary" : "primary is-off"} disabled={!isReady}>
          {say(locale, "continue")}
        </button>
      </div>
    </form>
  );
}

export function Avatar({ name, picture }: { name: string; picture: string | null }): JSX.Element {
  return picture === null ? (
    <span class="avatar" aria-hidden="true">
      {name.trim().charAt(0).toUpperCase()}
    </span>
  ) : (
    <img class="avatar" src={picture} alt="" referrerpolicy="no-referrer" />
  );
}

/** A learner adds a teacher: the code the teacher gave the class. */
export function JoinScreen({
  locale,
  initialCode,
  onJoined,
  onBack,
}: {
  locale: Locale;
  initialCode: string;
  onJoined: (group: JoinedGroup) => void;
  onBack: () => void;
}): JSX.Element {
  const [code, setCode] = useState(initialCode);
  const [problem, setProblem] = useState<string | undefined>();
  const [isSending, setIsSending] = useState(false);
  const isReady = normalizeCode(code).length > 0 && !isSending;
  const submit = async () => {
    setIsSending(true);
    setProblem(undefined);
    try {
      onJoined(await api.join(code));
    } catch (error) {
      setProblem(problemText(locale, error, { [ApiErrorCode.UnknownJoinCode]: "unknownJoinCode" }));
    } finally {
      setIsSending(false);
    }
  };
  return (
    <form
      class="lesson page"
      onSubmit={(e) => {
        e.preventDefault();
        if (isReady) void submit();
      }}
    >
      <div class="page-top">
        <BackButton label={say(locale, "later")} onBack={onBack} />
      </div>
      <div class="page-body">
        <h1 class="page-title">{say(locale, "addTeacherTitle")}</h1>
        <p class="lead">{say(locale, "addTeacherLead")}</p>
        <label class="field">
          <span class="field-label">{say(locale, "teachersCode")}</span>
          <input
            class={problem === undefined ? "input is-code" : "input is-code is-bad"}
            value={code}
            autoCapitalize="characters"
            autoComplete="off"
            spellcheck={false}
            onInput={(e) => setCode(e.currentTarget.value.toUpperCase())}
          />
          {problem !== undefined && <span class="bad">{problem}</span>}
        </label>
      </div>
      <div class="page-foot">
        <button type="button" class="second" onClick={onBack}>
          {say(locale, "later")}
        </button>
        <button type="submit" class={isReady ? "primary" : "primary is-off"} disabled={!isReady}>
          {say(locale, "join")}
        </button>
      </div>
    </form>
  );
}
