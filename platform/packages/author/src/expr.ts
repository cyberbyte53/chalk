import { Dec } from "@chalk/exact";

/** Anything that can stand on one side of a comparison in a rule. */
export type Operand = Expr | Dec | number | string | boolean | null;

/** A value as the expression language writes it. A Dec is written exactly as it reads ("7.384"). */
export function literal(value: Operand): string {
  if (value instanceof Expr) return value.source;
  if (value instanceof Dec) return value.toString();
  if (typeof value === "string") return JSON.stringify(value);
  return String(value);
}

/**
 * An expression in the board's expression language (`line.level < 3 and line.lens == null`), built
 * from typed pieces so a typo is a compile error, then written out as the text the phone runs.
 */
export class Expr {
  constructor(readonly source: string) {}

  private binary(sign: string, other: Operand): Expr {
    return new Expr(`(${this.source} ${sign} ${literal(other)})`);
  }

  eq(other: Operand): Expr {
    return this.binary("==", other);
  }
  neq(other: Operand): Expr {
    return this.binary("!=", other);
  }
  lt(other: Operand): Expr {
    return this.binary("<", other);
  }
  le(other: Operand): Expr {
    return this.binary("<=", other);
  }
  gt(other: Operand): Expr {
    return this.binary(">", other);
  }
  ge(other: Operand): Expr {
    return this.binary(">=", other);
  }
  plus(other: Operand): Expr {
    return this.binary("+", other);
  }
  minus(other: Operand): Expr {
    return this.binary("-", other);
  }
  times(other: Operand): Expr {
    return this.binary("*", other);
  }
  and(other: Expr): Expr {
    return this.binary("and", other);
  }
  or(other: Expr): Expr {
    return this.binary("or", other);
  }
  not(): Expr {
    return new Expr(`(not ${this.source})`);
  }

  /**
   * Equal to an exact decimal at its own places: `fixed(line.marker, 3) == "7.384"`. The way to
   * compare a number a learner sets (a dragged marker is never exactly 7.384) with an exact one.
   */
  isAt(value: Dec): Expr {
    return new Expr(
      `(fixed(${this.source}, ${value.places}) == ${JSON.stringify(value.toString())})`,
    );
  }

  toString(): string {
    return this.source;
  }
}

/** A raw expression, for what the typed helpers don't cover yet. */
export function expr(source: string): Expr {
  return new Expr(source);
}
