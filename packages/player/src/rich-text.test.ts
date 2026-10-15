import { describe, expect, it } from "vitest";
import { SpanKind, parseRich, richProblems } from "./rich-text";

describe("rich text", () => {
  it("splits words, bold, emphasis, inline and display maths", () => {
    expect(parseRich("So **p(2)** is *exactly* $4 + 6 - 1$:$$p(2) = 9$$").spans).toEqual([
      { kind: SpanKind.Text, text: "So " },
      { kind: SpanKind.Bold, text: "p(2)" },
      { kind: SpanKind.Text, text: " is " },
      { kind: SpanKind.Emphasis, text: "exactly" },
      { kind: SpanKind.Text, text: " " },
      { kind: SpanKind.Math, text: "4 + 6 - 1", trailing: ":" },
      { kind: SpanKind.DisplayMath, text: "p(2) = 9" },
    ]);
  });

  it("leaves Hindi around maths alone", () => {
    expect(parseRich("तो $p(2) = 9$ है।").spans.map((s) => s.kind)).toEqual([
      SpanKind.Text,
      SpanKind.Math,
      SpanKind.Text,
    ]);
  });

  it("keeps punctuation after a formula on its line", () => {
    expect(parseRich("so $p(2) = 9$। Then $x$, and $y$.").spans).toEqual([
      { kind: SpanKind.Text, text: "so " },
      { kind: SpanKind.Math, text: "p(2) = 9", trailing: "।" },
      { kind: SpanKind.Text, text: " Then " },
      { kind: SpanKind.Math, text: "x", trailing: "," },
      { kind: SpanKind.Text, text: " and " },
      { kind: SpanKind.Math, text: "y", trailing: "." },
    ]);
  });

  it("keeps an escaped dollar and a lone star as text", () => {
    expect(parseRich("₹5 or \\$5, and 2 * 3").spans).toEqual([
      { kind: SpanKind.Text, text: "₹5 or $5, and 2 * 3" },
    ]);
  });

  it("reports an unclosed dollar and keeps the rest as text", () => {
    const parsed = parseRich("half of $\\frac{1}{2");
    expect(parsed.problems).toEqual(['"$" at 8 is never closed']);
    expect(parsed.spans).toEqual([{ kind: SpanKind.Text, text: "half of $\\frac{1}{2" }]);
  });

  it("checks the maths itself, chemistry included", () => {
    expect(
      richProblems(
        "$\\sqrt{2}$, $x^{2/3}$, $\\frac{1}{3}$, $\\angle ABC$, $\\ce{2H2 + O2 -> 2H2O}$",
      ),
    ).toEqual([]);
    expect(richProblems("$\\frac{1}{$")[0]).toMatch(/^\$\\frac\{1\}\{\$: /);
    expect(richProblems("$\\notacommand$")[0]).toMatch(/Undefined control sequence/);
  });
});
