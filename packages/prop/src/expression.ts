/**
 * The lesson's expression language: read-only maths and logic over props' state, e.g.
 * `line.marker * line.marker > 2.02` or `coin.heads / coin.count`. It is parsed, never run as code,
 * and it can't change anything.
 *
 * Values: numbers, strings ("…"), true / false / null. Names: `prop.field`.
 * Operators: + - * / ^, < <= > >= == !=, and / or / not. Functions: see FUNCTIONS.
 */

export type ExpressionValue = unknown;

/** Looks up a prop's view by name. Throws if there is no such prop. */
export type Scope = (name: string) => Readonly<Record<string, unknown>>;

const FUNCTIONS: Readonly<Record<string, (...args: number[]) => number | string>> = {
  abs: Math.abs,
  sqrt: Math.sqrt,
  min: Math.min,
  max: Math.max,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  /** A number as text with exactly `digits` decimals: fixed(1.5, 2) → "1.50". */
  fixed: (value, digits) => value.toFixed(digits),
};

const KEYWORDS = new Set(["and", "or", "not", "true", "false", "null", "pi"]);

type BinarySign =
  | "+"
  | "-"
  | "*"
  | "/"
  | "^"
  | "<"
  | "<="
  | ">"
  | ">="
  | "=="
  | "!="
  | "and"
  | "or";

type Node =
  | { op: "literal"; value: number | string | boolean | null }
  | { op: "ref"; path: readonly string[] }
  | { op: "not"; arg: Node }
  | { op: "neg"; arg: Node }
  | { op: "bin"; sign: BinarySign; left: Node; right: Node }
  | { op: "call"; name: string; args: readonly Node[] };

type Token =
  | { kind: "num"; value: number }
  | { kind: "str"; value: string }
  | { kind: "name"; value: string }
  | { kind: "sym"; value: string };

const SYMBOLS = ["<=", ">=", "==", "!=", "+", "-", "*", "/", "^", "<", ">", "(", ")", ",", "."];

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    const ch = source.charAt(i);
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    const number = /^[0-9]*\.?[0-9]+(e[-+]?[0-9]+)?/i.exec(rest);
    if (number !== null && /[0-9.]/.test(ch) && !(ch === "." && !/^\.[0-9]/.test(rest))) {
      tokens.push({ kind: "num", value: Number(number[0]) });
      i += number[0].length;
      continue;
    }
    if (ch === '"') {
      const end = source.indexOf('"', i + 1);
      if (end === -1) throw new Error(`Text starting at position ${i} has no closing "`);
      tokens.push({ kind: "str", value: source.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (name !== null) {
      tokens.push({ kind: "name", value: name[0] });
      i += name[0].length;
      continue;
    }
    const symbol = SYMBOLS.find((s) => rest.startsWith(s));
    if (symbol === undefined) throw new Error(`"${ch}" is not allowed in an expression`);
    tokens.push({ kind: "sym", value: symbol });
    i += symbol.length;
  }
  return tokens;
}

class Parser {
  private index = 0;
  constructor(private readonly tokens: readonly Token[]) {}

  parse(): Node {
    const node = this.or();
    const left = this.peek();
    if (left !== undefined) throw new Error(`Unexpected "${String(left.value)}"`);
    return node;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private isSym(value: string): boolean {
    const token = this.peek();
    return token?.kind === "sym" && token.value === value;
  }

  private isWord(value: string): boolean {
    const token = this.peek();
    return token?.kind === "name" && token.value === value;
  }

  private expect(value: string): void {
    if (!this.isSym(value)) throw new Error(`Expected "${value}"`);
    this.index++;
  }

  private or(): Node {
    let left = this.and();
    while (this.isWord("or")) {
      this.index++;
      left = { op: "bin", sign: "or", left, right: this.and() };
    }
    return left;
  }

  private and(): Node {
    let left = this.not();
    while (this.isWord("and")) {
      this.index++;
      left = { op: "bin", sign: "and", left, right: this.not() };
    }
    return left;
  }

  private not(): Node {
    if (this.isWord("not")) {
      this.index++;
      return { op: "not", arg: this.not() };
    }
    return this.comparison();
  }

  private comparison(): Node {
    const left = this.sum();
    for (const sign of ["<=", ">=", "==", "!=", "<", ">"] as const) {
      if (this.isSym(sign)) {
        this.index++;
        return { op: "bin", sign, left, right: this.sum() };
      }
    }
    return left;
  }

  private sum(): Node {
    let left = this.product();
    while (this.isSym("+") || this.isSym("-")) {
      const sign = this.isSym("+") ? "+" : "-";
      this.index++;
      left = { op: "bin", sign, left, right: this.product() };
    }
    return left;
  }

  private product(): Node {
    let left = this.unary();
    while (this.isSym("*") || this.isSym("/")) {
      const sign = this.isSym("*") ? "*" : "/";
      this.index++;
      left = { op: "bin", sign, left, right: this.unary() };
    }
    return left;
  }

  private unary(): Node {
    if (this.isSym("-")) {
      this.index++;
      return { op: "neg", arg: this.unary() };
    }
    const base = this.primary();
    if (this.isSym("^")) {
      this.index++;
      return { op: "bin", sign: "^", left: base, right: this.unary() };
    }
    return base;
  }

  private primary(): Node {
    const token = this.peek();
    if (token === undefined) throw new Error("The expression ends too early");
    this.index++;
    if (token.kind === "num" || token.kind === "str") return { op: "literal", value: token.value };
    if (token.kind === "sym") {
      if (token.value !== "(") throw new Error(`Unexpected "${token.value}"`);
      const inner = this.or();
      this.expect(")");
      return inner;
    }
    const word = token.value;
    if (word === "true" || word === "false") return { op: "literal", value: word === "true" };
    if (word === "null") return { op: "literal", value: null };
    if (word === "pi") return { op: "literal", value: Math.PI };
    if (KEYWORDS.has(word)) throw new Error(`Unexpected "${word}"`);
    if (this.isSym("(")) {
      if (FUNCTIONS[word] === undefined) {
        throw new Error(
          `Unknown function "${word}" (allowed: ${Object.keys(FUNCTIONS).join(", ")})`,
        );
      }
      this.index++;
      const args: Node[] = [this.or()];
      while (this.isSym(",")) {
        this.index++;
        args.push(this.or());
      }
      this.expect(")");
      return { op: "call", name: word, args };
    }
    const path = [word];
    while (this.isSym(".")) {
      this.index++;
      const next = this.peek();
      if (next?.kind !== "name")
        throw new Error(`Expected a field name after "${path.join(".")}."`);
      this.index++;
      path.push(next.value);
    }
    return { op: "ref", path };
  }
}

function asNumber(value: unknown, where: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`${where} needs a number (got ${JSON.stringify(value)})`);
  }
  return value;
}

function evaluate(node: Node, scope: Scope): unknown {
  switch (node.op) {
    case "literal":
      return node.value;
    case "ref": {
      const [root, ...fields] = node.path;
      if (root === undefined) throw new Error("Empty name");
      let value: unknown = scope(root);
      for (const field of fields) {
        if (value === null || typeof value !== "object" || !(field in value)) {
          throw new Error(`"${node.path.join(".")}" doesn't exist`);
        }
        value = (value as Record<string, unknown>)[field];
      }
      return value;
    }
    case "not":
      return !evaluate(node.arg, scope);
    case "neg":
      return -asNumber(evaluate(node.arg, scope), "-");
    case "call": {
      const fn = FUNCTIONS[node.name];
      if (fn === undefined) throw new Error(`Unknown function ${node.name}`);
      return fn(...node.args.map((arg) => asNumber(evaluate(arg, scope), `${node.name}()`)));
    }
    case "bin": {
      if (node.sign === "and")
        return Boolean(evaluate(node.left, scope)) && Boolean(evaluate(node.right, scope));
      if (node.sign === "or")
        return Boolean(evaluate(node.left, scope)) || Boolean(evaluate(node.right, scope));
      const a = evaluate(node.left, scope);
      const b = evaluate(node.right, scope);
      if (node.sign === "==") return a === b;
      if (node.sign === "!=") return a !== b;
      if (node.sign === "+" && (typeof a === "string" || typeof b === "string")) return `${a}${b}`;
      const x = asNumber(a, node.sign);
      const y = asNumber(b, node.sign);
      switch (node.sign) {
        case "+":
          return x + y;
        case "-":
          return x - y;
        case "*":
          return x * y;
        case "/":
          return x / y;
        case "^":
          return x ** y;
        case "<":
          return x < y;
        case "<=":
          return x <= y;
        case ">":
          return x > y;
        case ">=":
          return x >= y;
      }
    }
  }
}

function collectRefs(node: Node, out: string[][]): void {
  switch (node.op) {
    case "ref":
      out.push([...node.path]);
      return;
    case "not":
    case "neg":
      collectRefs(node.arg, out);
      return;
    case "bin":
      collectRefs(node.left, out);
      collectRefs(node.right, out);
      return;
    case "call":
      for (const arg of node.args) collectRefs(arg, out);
      return;
    case "literal":
      return;
  }
}

export type Expression = {
  source: string;
  /** Every `prop.field` it reads, for the validator and for knowing when to recompute. */
  refs: readonly (readonly string[])[];
  evaluate: (scope: Scope) => unknown;
};

/** Parses an expression once; throws a readable error if it is not allowed. */
export function compileExpression(source: string): Expression {
  const ast = new Parser(tokenize(source)).parse();
  const refs: string[][] = [];
  collectRefs(ast, refs);
  return { source, refs, evaluate: (scope) => evaluate(ast, scope) };
}

/** Text with `{expressions}` in it: "Heads: {coin.heads} of {coin.count}". */
export type Template = {
  source: string;
  refs: readonly (readonly string[])[];
  render: (scope: Scope) => string;
};

export function compileTemplate(source: string): Template {
  const parts: (string | Expression)[] = [];
  let i = 0;
  while (i < source.length) {
    const open = source.indexOf("{", i);
    if (open === -1) {
      parts.push(source.slice(i));
      break;
    }
    const close = source.indexOf("}", open);
    if (close === -1) throw new Error(`"{" at position ${open} has no closing "}"`);
    if (open > i) parts.push(source.slice(i, open));
    parts.push(compileExpression(source.slice(open + 1, close)));
    i = close + 1;
  }
  const refs = parts.flatMap((part) => (typeof part === "string" ? [] : part.refs));
  return {
    source,
    refs,
    render: (scope) =>
      parts
        .map((part) => {
          if (typeof part === "string") return part;
          const value = part.evaluate(scope);
          return typeof value === "number" ? String(Number(value.toFixed(6))) : String(value);
        })
        .join(""),
  };
}
