import type { ApiError, ApiErrorCode } from "@chalk/api";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/** A request the server refuses, with the code the app shows a message for. Thrown from a route. */
export class ApiFailure extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    readonly code: ApiErrorCode,
    message: string,
  ) {
    super(message);
  }

  get body(): ApiError {
    return { error: this.code, message: this.message };
  }
}
