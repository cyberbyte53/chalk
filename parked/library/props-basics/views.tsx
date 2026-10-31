// Parked with multiChoice and orderSteps (platform/docs/move-to-event-model.md).
/** A multi-choice option's look: picked, and once checked, right or wrong. */
function multiClass(s: MultiChoiceState, option: string): string {
  if (!s.selected.includes(option)) return "choice";
  if (s.status === AnswerStatus.Correct) return "choice is-selected is-right";
  if (s.status === AnswerStatus.Wrong) return "choice is-selected is-wrong";
  return "choice is-selected";
}

/** Pick every right option, then Check: tapping only picks, so one tap gives nothing away. */
export function MultiChoiceView({ view, locale }: PropViewProps<typeof multiChoice>): JSX.Element {
  const s = view;
  const isHeld = useIsHeld(s.status);
  const isLocked = s.status === AnswerStatus.Correct || isHeld;
  const [fit, columns] = useFitColumns<HTMLFieldSetElement>(
    s.options.length,
    labelsKey(s.options, locale),
  );
  return (
    <div class="piece-question">
      <p class="question-prompt" {...shows("prompt", s.prompt[locale])}>
        <RichText text={s.prompt[locale]} />
      </p>
      <fieldset ref={fit} class="choices" style={{ "--columns": String(columns) }}>
        {s.options.map((option) => (
          <button
            type="button"
            key={option.id}
            aria-pressed={s.selected.includes(option.id)}
            aria-label={plainText(option.label[locale])}
            class={multiClass(s, option.id)}
            disabled={isLocked}
            {...does(multiChoice.actions.toggle, { option: option.id }, option.id)}
            {...shows(`option:${option.id}`, {
              label: option.label[locale],
              isPicked: s.selected.includes(option.id),
            })}
          >
            <RichText text={option.label[locale]} />
          </button>
        ))}
      </fieldset>
      {!isLocked && (
        <button
          type="button"
          class="question-check"
          disabled={!s.canCheck || isHeld}
          {...does(multiChoice.actions.check)}
        >
          {t(locale, s.status === AnswerStatus.Wrong ? "tryAgain" : "check")}
        </button>
      )}
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}

/**
 * Put a proof's steps in order: the lines placed so far, numbered, then the steps still to place.
 * Tap a step to add it as the next line; tap a line to take it back.
 */
export function OrderStepsView({ view, locale }: PropViewProps<typeof orderSteps>): JSX.Element {
  const s = view;
  const isHeld = useIsHeld(s.status);
  const isLocked = s.status === AnswerStatus.Correct || isHeld;
  const byId = new Map(s.steps.map((st) => [st.id, st]));
  const rest = s.steps.filter((st) => !s.placed.includes(st.id));
  return (
    <div class="piece-question">
      <p class="question-prompt" {...shows("prompt", s.prompt[locale])}>
        <RichText text={s.prompt[locale]} />
      </p>
      <ol class={isLocked ? "order-lines is-right" : "order-lines"}>
        {s.placed.map((id) => {
          const step = byId.get(id);
          if (step === undefined) return null;
          return (
            <li key={id}>
              <button
                type="button"
                class="order-line"
                disabled={isLocked}
                aria-label={`Take back: ${plainText(step.label[locale])}`}
                {...does(orderSteps.actions.remove, { step: id }, id)}
                {...shows(`step:${id}`, {
                  label: step.label[locale],
                  line: s.placed.indexOf(id) + 1,
                })}
              >
                <RichText text={step.label[locale]} />
              </button>
            </li>
          );
        })}
        {!isLocked &&
          Array.from({ length: s.steps.length - s.placed.length }, (_, k) => (
            <li key={`slot${k}`} class="order-slot" />
          ))}
      </ol>
      {rest.length > 0 && (
        <div class="order-pool">
          {rest.map((step) => (
            <button
              type="button"
              key={step.id}
              class="choice order-step"
              aria-label={plainText(step.label[locale])}
              {...does(orderSteps.actions.place, { step: step.id }, step.id)}
              {...shows(`step:${step.id}`, { label: step.label[locale], line: null })}
            >
              <RichText text={step.label[locale]} />
            </button>
          ))}
        </div>
      )}
      {!isLocked && (
        <button
          type="button"
          class="question-check"
          disabled={!s.canCheck || isHeld}
          {...does(orderSteps.actions.check)}
        >
          {t(locale, s.status === AnswerStatus.Wrong ? "tryAgain" : "check")}
        </button>
      )}
      <AnswerFeedback status={s.status} feedback={s.feedback} locale={locale} />
    </div>
  );
}
