const DECIMAL = /^(-)?(\d+)(?:\.(\d+))?$/;

/**
 * An exact decimal: an integer count of units at a fixed number of places (7.384 is 7384 units
 * at 3 places). It keeps the places it was written with, so "2.50" stays "2.50".
 */
export class Dec {
  private constructor(
    /** The value times 10^places, exactly. */
    readonly units: bigint,
    /** Digits after the point, as written. */
    readonly places: number,
  ) {}

  static parse(text: string): Dec {
    const match = DECIMAL.exec(text.trim());
    if (match === null) throw new Error(`"${text}" is not a decimal like 7.384`);
    const [, minus, whole = "0", fraction = ""] = match;
    const units = BigInt(whole + fraction) * (minus === undefined ? 1n : -1n);
    return new Dec(units, fraction.length);
  }

  static of(units: bigint, places: number): Dec {
    if (!Number.isInteger(places) || places < 0) throw new Error("places must be 0 or more");
    return new Dec(units, places);
  }

  /** As written, with exactly `places` digits after the point. */
  toString(): string {
    const negative = this.units < 0n;
    const digits = (negative ? -this.units : this.units).toString().padStart(this.places + 1, "0");
    const whole = digits.slice(0, digits.length - this.places);
    const fraction = digits.slice(digits.length - this.places);
    return `${negative ? "-" : ""}${whole}${this.places > 0 ? `.${fraction}` : ""}`;
  }

  /** For drawing and for props that take plain numbers. Not for comparing. */
  toNumber(): number {
    return Number(this.toString());
  }

  toJSON(): string {
    return this.toString();
  }

  /** Same value at `places` (more places pads with zeros; fewer rounds half away from zero). */
  at(places: number): Dec {
    if (places >= this.places)
      return new Dec(this.units * 10n ** BigInt(places - this.places), places);
    const drop = 10n ** BigInt(this.places - places);
    const magnitude = this.units < 0n ? -this.units : this.units;
    const rounded = (magnitude + drop / 2n) / drop;
    return new Dec(this.units < 0n ? -rounded : rounded, places);
  }

  /** Rounded to `places` (half away from zero). */
  round(places: number): Dec {
    return this.at(Math.min(places, this.places)).at(places);
  }

  /** The whole number at or below it. */
  floor(): Dec {
    const scale = 10n ** BigInt(this.places);
    let whole = this.units / scale;
    if (this.units < 0n && this.units % scale !== 0n) whole -= 1n;
    return new Dec(whole, 0);
  }

  plus(other: Dec): Dec {
    const places = Math.max(this.places, other.places);
    return new Dec(this.at(places).units + other.at(places).units, places);
  }

  minus(other: Dec): Dec {
    return this.plus(new Dec(-other.units, other.places));
  }

  compare(other: Dec): -1 | 0 | 1 {
    const places = Math.max(this.places, other.places);
    const a = this.at(places).units;
    const b = other.at(places).units;
    return a < b ? -1 : a > b ? 1 : 0;
  }

  /** Equal in value: 2.5 equals 2.50. */
  eq(other: Dec): boolean {
    return this.compare(other) === 0;
  }

  /** The digits after the point, in order: 2.665 → ["6", "6", "5"]. */
  digits(): string[] {
    return this.places === 0 ? [] : (this.toString().split(".")[1] ?? "").split("");
  }

  /** The last two digits after the point swapped: 7.384 → 7.348. Needs at least 2 places. */
  swapLastTwo(): Dec {
    if (this.places < 2) throw new Error(`${this} has fewer than 2 decimal places to swap`);
    const text = this.toString();
    const n = text.length;
    return Dec.parse(text.slice(0, n - 2) + text[n - 1] + text[n - 2]);
  }
}

/** An exact decimal from how it is written: dec("7.384"). */
export function dec(text: string): Dec {
  return Dec.parse(text);
}
