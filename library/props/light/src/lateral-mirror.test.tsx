import { readFileSync } from "node:fs";
import {
  EffectKind,
  applyPatch,
  asAnyProp,
  observationOf,
  prepareAction,
  viewOf,
} from "@chalk/prop";
import { renderToString } from "preact-render-to-string";
import { describe, expect, it } from "vitest";
import {
  Hand,
  LateralMirrorAction,
  LateralMirrorDerived,
  LateralMirrorPart,
  LateralMirrorSignal,
  type LateralMirrorState,
  LateralWord,
  Reads,
  Writing,
  lateralMirror,
  printed,
  seenInMirror,
} from "./lateral-mirror";
import { LateralMirrorView } from "./lateral-mirror-view";

const def = asAnyProp(lateralMirror);
const start: LateralMirrorState = { ...lateralMirror.defaults };

function run(state: LateralMirrorState, name: string, args: Record<string, unknown>) {
  const result = prepareAction(def, state, name, args);
  if (!result.isOk) throw new Error(result.errors.join("; "));
  if (result.effect.kind !== EffectKind.Set) throw new Error(`${name} should be instant`);
  const next = applyPatch(def, state, result.effect.set);
  if (!next.isOk) throw new Error(next.errors.join("; "));
  return { state: next.state as LateralMirrorState, emit: result.effect.emit };
}

const derived = (s: LateralMirrorState) => viewOf(def, s) as Record<string, unknown>;
const drawn = (s: LateralMirrorState, locale: "en" | "hi" = "en") =>
  renderToString(
    <LateralMirrorView
      view={viewOf(def, s)}
      locale={locale}
      width={320}
      call={() => undefined}
      signal={() => undefined}
    />,
  );

describe("lateral mirror: what the mirror shows", () => {
  it("reads the word backwards when it is printed normally, and correctly when printed back to front", () => {
    expect(derived(start)[LateralMirrorDerived.ReflectionReads]).toBe(Reads.Backwards);
    expect(seenInMirror(start)).toBe("AYIR");
    const trick = { ...start, word: LateralWord.Ambulance, writing: Writing.Mirrored };
    expect(printed(trick)).toBe("ECNALUBMA");
    expect(seenInMirror(trick)).toBe("AMBULANCE");
    expect(derived(trick)[LateralMirrorDerived.ReflectionReads]).toBe(Reads.Correctly);
  });

  it("raises the other hand, from the image's own point of view", () => {
    expect(derived({ ...start, raised: Hand.Right })[LateralMirrorDerived.ReflectionRaises]).toBe(
      Hand.Left,
    );
    expect(derived({ ...start, raised: Hand.Left })[LateralMirrorDerived.ReflectionRaises]).toBe(
      Hand.Right,
    );
    expect(derived(start)[LateralMirrorDerived.ReflectionRaises]).toBe(Hand.None);
  });
});

describe("lateral mirror: actions", () => {
  it("changes the word, the hand and the printing, each time signalling the new state", () => {
    const a = run(start, LateralMirrorAction.SetWord, { word: LateralWord.Ambulance });
    expect(a.state.word).toBe(LateralWord.Ambulance);
    expect(a.emit[0]?.signal).toBe(LateralMirrorSignal.Changed);
    const b = run(a.state, LateralMirrorAction.Raise, { hand: Hand.Right });
    expect(b.state.raised).toBe(Hand.Right);
    const c = run(b.state, LateralMirrorAction.SetWriting, { writing: Writing.Mirrored });
    expect(c.state.writing).toBe(Writing.Mirrored);
    expect(c.emit[0]?.payload).toEqual({
      word: LateralWord.Ambulance,
      raised: Hand.Right,
      writing: Writing.Mirrored,
    });
  });

  it("are all the learner's, and refuse what they don't know", () => {
    for (const name of Object.values(LateralMirrorAction))
      expect(def.actions[name]?.byLearner).toBe(true);
    expect(prepareAction(def, start, LateralMirrorAction.SetWord, { word: "HELLO" }).isOk).toBe(
      false,
    );
    expect(prepareAction(def, start, LateralMirrorAction.Raise, { hand: "both" }).isOk).toBe(false);
  });
});

describe("lateral mirror: what it says and draws", () => {
  it("says what the mirror shows", () => {
    const obs = observationOf(def, { ...start, raised: Hand.Right });
    expect(obs.summary).toContain("backwards");
    expect(obs.summary).toContain("raises its left hand");
  });

  it("names and locates every part", () => {
    for (const part of Object.values(LateralMirrorPart))
      expect(def.locate?.(start, part, 320)).toBeDefined();
  });

  it("draws the reflection flipped, with the word in both, and buttons in the learner's language", () => {
    const html = drawn(start);
    expect(html).toContain("scale(-1 1)");
    expect(html.match(/>RIYA</g)?.length).toBe(3); // on Riya, on her image, and on its button
    expect(html).toContain("Raise right hand");
    expect(drawn(start, "hi")).toContain("दायाँ हाथ उठाओ");
    expect(drawn({ ...start, writing: Writing.Mirrored }).match(/scale\(-1 1\)/g)?.length).toBe(3); // the image, and the back-to-front print on both
  });

  it("colours only with the look's tokens", () => {
    const css = readFileSync(new URL("./lateral-mirror.css", import.meta.url), "utf8");
    expect(
      css.split("\n").filter((line) => /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/.test(line)),
    ).toEqual([]);
  });
});
