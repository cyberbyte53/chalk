import { DEV_SCHOOL_CODE, type MeReply, Role, devJoinCode } from "@chalk/api";
import { api } from "./api-client";
import { courses } from "./lessons";
import { settings } from "./settings";

const OFF_KEY = "chalk.devSignIn.off";
const DEV_EMAIL = /@dev\.local$/;

/** Who to be: `?as=Name` (default "Tester"), a learner unless `?role=teacher`. */
function wanted(): { name: string; role: Role; isAsked: boolean } {
  const query = new URLSearchParams(window.location.search);
  const as = query.get("as")?.trim();
  return {
    name: as !== undefined && as !== "" ? as : "Tester",
    role: query.get("role") === Role.Teacher ? Role.Teacher : Role.Learner,
    isAsked: as !== undefined && as !== "",
  };
}

function isOff(): boolean {
  try {
    return localStorage.getItem(OFF_KEY) === "on";
  } catch {
    return false;
  }
}

function setOff(isOn: boolean): void {
  try {
    if (isOn) localStorage.setItem(OFF_KEY, "on");
    else localStorage.removeItem(OFF_KEY);
  } catch {
    // a convenience only
  }
}

/** Signing out turns auto sign-in off on this device (so the welcome screen can be tried). */
export function stopDevSignIn(): void {
  if (settings.isDevSignIn) setOff(true);
}

/**
 * Development with DEV_SIGN_IN on: the app opens signed in, set up, and (a learner) in the dev
 * school's class for every course, with no Google, setup or join code. `?as=Asha&role=teacher` switches person; a signed-out device stays signed out
 * until `?as=` is given. Anything else (production, a real Google account) is left as it is.
 */
export async function devSession(me: MeReply | undefined): Promise<MeReply | undefined> {
  if (!settings.isDevSignIn) return me;
  const want = wanted();
  if (want.isAsked) setOff(false);
  if (isOff()) return me;
  let next = me;
  const isSomeoneElse = me !== undefined && want.isAsked && me.account.name !== want.name;
  if (me === undefined || isSomeoneElse) {
    const id = want.name.toLowerCase().replace(/\W+/g, "-");
    next = await api.signInGoogle(`dev:${id}:${want.name}`);
  }
  if (next !== undefined && next.account.role === null && DEV_EMAIL.test(next.account.email))
    next = await api.setup({ name: want.name, schoolCode: DEV_SCHOOL_CODE, role: want.role });
  if (
    next === undefined ||
    next.account.role !== Role.Learner ||
    !DEV_EMAIL.test(next.account.email)
  )
    return next;
  // Into the dev class for each course not joined yet (the server made them at start).
  const joined = new Set(next.joined.map((group) => group.courseId));
  const missing = courses.filter((course) => !joined.has(course.id));
  if (missing.length === 0) return next;
  for (const course of missing) await api.join(devJoinCode(course.id)).catch(() => undefined);
  return api.me();
}
