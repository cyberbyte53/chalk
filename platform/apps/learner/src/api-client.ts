import {
  type ApiErrorCode,
  ApiPath,
  type EventsReply,
  type GroupReply,
  type JoinedGroup,
  type LearnerReply,
  type MeReply,
  type Role,
  type TeacherGroup,
  apiErrorSchema,
  eventsReplySchema,
  groupCodePath,
  groupLearnerPath,
  groupPath,
  groupReplySchema,
  joinedGroupSchema,
  learnerReplySchema,
  meReplySchema,
  teacherGroupSchema,
} from "@chalk/api";
import type { ChalkEvent } from "@chalk/content";
import { type Progress, progressSchema } from "@chalk/learning";
import type { z } from "zod";

/** A request that didn't work: the server's code when it answered, or offline (status 0). */
export class ApiProblem extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode | undefined,
    message: string,
  ) {
    super(message);
  }
  get isOffline(): boolean {
    return this.status === 0;
  }
}

/** Sends a request; the reply's JSON (null for none), or an ApiProblem. */
async function send(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiProblem(0, undefined, error instanceof Error ? error.message : "offline");
  }
  const json: unknown = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const problem = apiErrorSchema.safeParse(json);
    throw new ApiProblem(
      response.status,
      problem.success ? problem.data.error : undefined,
      problem.success ? problem.data.message : `${method} ${path} answered ${response.status}`,
    );
  }
  return json;
}

async function call<S extends z.ZodTypeAny>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  reply: S,
  body?: unknown,
): Promise<z.infer<S>> {
  return reply.parse(await send(method, path, body));
}

/** The server, as the app calls it; every reply is parsed with the shared schemas. */
export const api = {
  /** Who's signed in on this device; undefined if no one. */
  async me(): Promise<MeReply | undefined> {
    try {
      return await call("GET", ApiPath.Me, meReplySchema);
    } catch (error) {
      if (error instanceof ApiProblem && error.status === 401) return undefined;
      throw error;
    }
  },
  signInGoogle: (credential: string): Promise<MeReply> =>
    call("POST", ApiPath.SignInGoogle, meReplySchema, { credential }),
  signOut: async (): Promise<void> => {
    await send("POST", ApiPath.SignOut);
  },
  setup: (setup: { name: string; schoolCode: string; role: Role }): Promise<MeReply> =>
    call("POST", ApiPath.Setup, meReplySchema, setup),
  join: (code: string): Promise<JoinedGroup> =>
    call("POST", ApiPath.Join, joinedGroupSchema, { code }),
  progress: (): Promise<Progress> => call("GET", ApiPath.Progress, progressSchema),
  newGroup: (courseId: string): Promise<TeacherGroup> =>
    call("POST", ApiPath.Groups, teacherGroupSchema, { courseId }),
  group: (id: string): Promise<GroupReply> => call("GET", groupPath(id), groupReplySchema),
  newJoinCode: (id: string): Promise<TeacherGroup> =>
    call("POST", groupCodePath(id), teacherGroupSchema),
  learner: (groupId: string, learnerId: string): Promise<LearnerReply> =>
    call("GET", groupLearnerPath(groupId, learnerId), learnerReplySchema),
  removeLearner: async (groupId: string, learnerId: string): Promise<void> => {
    await send("DELETE", groupLearnerPath(groupId, learnerId));
  },
  sendEvents: (events: readonly ChalkEvent[]): Promise<EventsReply> =>
    call("POST", ApiPath.Events, eventsReplySchema, { events }),
};
