import type { PropViewProps } from "@chalk/player";
import type { JSX } from "preact";
import {
  COLUMNS,
  Column,
  MeanAction,
  MeanPart,
  type MeanState,
  Method,
  aOf,
  hOf,
  lastStepOf,
  meanOfState,
  methodWords,
  shownColumns,
  workingOf,
} from "./mean-table";
import { type Words, isRounded, numText, say } from "./numbers";
import { classMark, classText, meanColumns } from "./stats";
import { Button, Stepper, Working } from "./ui";

const HEAD: Record<Column, string> = {
  [Column.X]: "xᵢ",
  [Column.FX]: "fᵢxᵢ",
  [Column.D]: "dᵢ",
  [Column.FD]: "fᵢdᵢ",
  [Column.U]: "uᵢ",
  [Column.FU]: "fᵢuᵢ",
};

const WORDS = {
  total: { en: "Total", hi: "योग" },
  mean: { en: "Mean", hi: "माध्य" },
  assumed: { en: "assumed mean", hi: "कल्पित माध्य" },
  step: { en: "class size", hi: "वर्ग माप" },
  value: { en: "Value", hi: "मान" },
} as const satisfies Record<string, Words>;

const SUM: Partial<Record<Column, "sumFX" | "sumFD" | "sumFU">> = {
  [Column.FX]: "sumFX",
  [Column.FD]: "sumFD",
  [Column.FU]: "sumFU",
};

export function MeanTableView({ view, call, locale }: PropViewProps): JSX.Element {
  const s = view as unknown as MeanState;
  const a = aOf(s);
  const h = hOf(s);
  const c = meanColumns(s.rows, a, h, s.isGrouped);
  const shown = shownColumns(s);
  const last = lastStepOf(s);
  const mean = meanOfState(s);
  const marks = s.rows.map((r) => classMark(r, s.isGrouped));
  return (
    <div class="dt-mean">
      {s.method !== Method.Direct && (
        <p class="dt-given">
          {`a = ${numText(a)} (${say(locale, WORDS.assumed)})`}
          {s.method === Method.Step ? `, h = ${numText(h)}` : ""}
        </p>
      )}
      <table class="dt-table" data-part={MeanPart.Table}>
        <thead>
          <tr>
            <th>{say(locale, s.classHeading)}</th>
            <th>
              <span class="dt-sub">{say(locale, s.freqHeading)}</span> fᵢ
            </th>
            {shown.map((col) => (
              <th key={col}>{HEAD[col]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r, i) => (
            <tr
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
              key={i}
              class={s.method !== Method.Direct && marks[i] === a && s.step >= 2 ? "is-a" : ""}
            >
              <td>{classText(r, locale, s.isGrouped)}</td>
              <td>{r.f}</td>
              {shown.map((col) => (
                <td key={col}>{numText(c[col][i] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>{say(locale, WORDS.total)}</td>
            <td>{`Σfᵢ = ${c.sumF}`}</td>
            {shown.map((col) => {
              const key = SUM[col];
              return (
                <td key={col}>{key !== undefined && s.step === last ? numText(c[key]) : ""}</td>
              );
            })}
          </tr>
        </tfoot>
      </table>
      {s.step === last && (
        <>
          <Working lines={workingOf(s)} part={MeanPart.Working} />
          <p class="dt-verdict" data-part={MeanPart.Result}>
            {`${say(locale, WORDS.mean)} ${isRounded(mean) ? "≈" : "="} ${numText(mean)}`}
          </p>
        </>
      )}
      {(s.canSetMethod || s.canSetA) && (
        <div class="dt-controls">
          {s.canSetMethod && (
            <div class="dt-choice" data-part={MeanPart.Methods}>
              {(Object.keys(COLUMNS) as Method[]).map((m) => (
                <Button
                  key={m}
                  isWide
                  isOn={m === s.method}
                  label={say(locale, methodWords(m))}
                  onPress={() => call(MeanAction.SetMethod, { method: m })}
                >
                  {say(locale, methodWords(m))}
                </Button>
              ))}
            </div>
          )}
          {s.canSetA && s.method !== Method.Direct && (
            <div class="dt-nudger" data-part={MeanPart.StepA}>
              <Button
                label="smaller"
                isEnabled={a !== marks[0]}
                onPress={() => call(MeanAction.NudgeA, { by: -1 })}
              >
                −
              </Button>
              <span class="dt-nudger-value">{`a = ${numText(a)}`}</span>
              <Button
                label="bigger"
                isEnabled={a !== marks[marks.length - 1]}
                onPress={() => call(MeanAction.NudgeA, { by: 1 })}
              >
                +
              </Button>
            </div>
          )}
        </div>
      )}
      {s.canStep && (
        <Stepper
          locale={locale}
          step={s.step}
          last={last}
          nextPart={MeanPart.Next}
          backPart={MeanPart.Back}
          onNext={() => call(MeanAction.Next, {})}
          onBack={() => call(MeanAction.Back, {})}
        />
      )}
    </div>
  );
}
