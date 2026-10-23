import { describe, expect, it } from "vitest";
import { SpanKind, mathText, parseRich, plainText, richProblems } from "./rich-text";

describe("rich text", () => {
  it("maths inside bold stays maths, and the words around it stay bold", () => {
    expect(parseRich("**If a prime $p$ divides $a^2$, then it divides $a$.**").spans).toEqual([
      { kind: SpanKind.Bold, text: "If a prime " },
      { kind: SpanKind.Math, text: "p" },
      { kind: SpanKind.Bold, text: " divides " },
      { kind: SpanKind.Math, text: "a^2", trailing: "," },
      { kind: SpanKind.Bold, text: " then it divides " },
      { kind: SpanKind.Math, text: "a", trailing: "." },
    ]);
    expect(parseRich("*see $x$*").spans).toEqual([
      { kind: SpanKind.Emphasis, text: "see " },
      { kind: SpanKind.Math, text: "x" },
    ]);
  });
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

describe("plain text (for screen readers)", () => {
  it("writes maths out the way it reads", () => {
    expect(mathText(String.raw`\sqrt{8}`)).toBe("√8");
    expect(mathText(String.raw`\frac{64}{455}`)).toBe("64/455");
    expect(mathText(String.raw`\frac{x - 3}{2}`)).toBe("(x - 3)/2");
    expect(mathText(String.raw`2^3 \times 3^{2} \times 5`)).toBe("2³ × 3² × 5");
    expect(mathText(String.raw`4q + 1`)).toBe("4q + 1");
    expect(mathText(String.raw`0.\overline{45}`)).toBe("0.45 repeating");
    expect(mathText(String.raw`\text{HCF}(6, 20)`)).toBe("HCF(6, 20)");
    expect(mathText(String.raw`a^{10}`)).toBe("a¹⁰");
    expect(mathText(String.raw`x^{k+1}`)).toBe("x^(k+1)");
    expect(mathText(String.raw`\sqrt{2}\,\sqrt{3}`)).toBe("√2 √3");
  });
  it("drops the markers and keeps the words", () => {
    expect(plainText(String.raw`**Odd**: $4q + 1$ and $4q + 3$.`)).toBe("Odd: 4q + 1 and 4q + 3.");
    expect(plainText("Rational, denominator only 2s and 5s")).toBe(
      "Rational, denominator only 2s and 5s",
    );
  });
});
