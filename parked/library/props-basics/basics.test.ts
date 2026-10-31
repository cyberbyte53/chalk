// Parked with multiChoice and orderSteps.
describe("multiChoice", () => {
  const def = asAnyProp(multiChoice);
  const sizes = stateOf(
    initialState(def, {
      prompt: { en: "Which tiles fit?", hi: "कौन-सी?" },
      options: ["2", "3", "4", "6"].map((id) => ({
        id,
        label: { en: id, hi: id },
        ...(id === "4" ? { feedback: { en: "4 leaves a gap.", hi: "जगह बचती है।" } } : {}),
      })),
      answers: ["2", "3", "6"],
      missing: { en: "Some are missing.", hi: "कुछ छूटे।" },
    }),
  );
  const check = (selected: string[]) => {
    const result = prepareAction(def, { ...sizes, selected }, "check");
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    return result.effect.set;
  };
  it("is right only with every right option and no wrong one", () => {
    expect(check(["6", "2", "3"])).toMatchObject({ status: AnswerStatus.Correct });
    expect(check(["2", "3", "4", "6"])).toMatchObject({
      status: AnswerStatus.Wrong,
      feedback: { en: "4 leaves a gap." },
    });
    expect(check(["2", "6"])).toMatchObject({
      status: AnswerStatus.Wrong,
      feedback: { en: "Some are missing." },
    });
  });
  it("a tap picks or unpicks, and doesn't check", () => {
    const result = prepareAction(def, { ...sizes, selected: ["2"] }, "toggle", { option: "2" });
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    expect(result.effect.set).toMatchObject({ selected: [] });
    expect(result.effect.emit).toEqual([]);
  });
});

describe("orderSteps", () => {
  const def = asAnyProp(orderSteps);
  const proof = stateOf(
    initialState(def, {
      prompt: { en: "Order the proof", hi: "क्रम" },
      steps: ["c", "a", "b"].map((id) => ({
        id,
        label: { en: id, hi: id },
        ...(id === "c" ? { hint: { en: "c needs b first.", hi: "पहले b।" } } : {}),
      })),
      answers: [
        ["a", "b", "c"],
        ["b", "a", "c"],
      ],
    }),
  );
  const check = (placed: string[]) => {
    const result = prepareAction(def, { ...proof, placed }, "check");
    if (!result.isOk || result.effect.kind !== EffectKind.Set) throw new Error("expected a set");
    return result.effect.set;
  };
  it("accepts any right order, and a misplaced step gives its hint", () => {
    expect(check(["a", "b", "c"])).toMatchObject({ status: AnswerStatus.Correct });
    expect(check(["b", "a", "c"])).toMatchObject({ status: AnswerStatus.Correct });
    expect(check(["a", "c", "b"])).toMatchObject({
      status: AnswerStatus.Wrong,
      feedback: { en: "c needs b first." },
    });
  });
  it("finds the first line that leaves every right order", () => {
    expect(firstWrong(["a", "c", "b"], [["a", "b", "c"]])).toBe(1);
    expect(firstWrong(["a", "b", "c"], [["a", "b", "c"]])).toBe(-1);
  });
});
