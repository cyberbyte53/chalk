import { ease } from "@chalk/prop";

/** Frames per second a task glides at (each frame is one change through the one door). */
export const GLIDE_FPS = 60;

/**
 * Eases a 0–1 progress from `from` up to 1 over `over` seconds, one frame at a time, inside a
 * task. `step` sets the next value through the one door and says whether to go on: it returns
 * false when something else has changed the prop meanwhile (the learner wins), and the glide stops.
 * Resolves true when it reached its last frame; the caller then sets 1 itself, with the
 * consequences (a landed point, a signal).
 */
export async function glide(
  wait: (seconds: number) => Promise<void>,
  over: number,
  from: number,
  step: (value: number) => boolean,
): Promise<boolean> {
  const frames = Math.max(1, Math.round(over * GLIDE_FPS));
  for (let i = 1; i < frames; i++) {
    await wait(over / frames);
    if (!step(from + (1 - from) * ease(i / frames))) return false;
  }
  await wait(over / frames);
  return true;
}
