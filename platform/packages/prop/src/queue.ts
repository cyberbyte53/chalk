/**
 * The board's queue of what is due later, kept in order: by time, and entries due at the same time
 * in the order they were queued. Only "later" goes here; instant events never wait in it.
 */
export type Entry<T> = {
  readonly at: number;
  /** Queued in this order (same-time entries come out first in, first out). */
  readonly seq: number;
  /** The prop that queued it (its address): it alone can drop it. */
  readonly owner: string;
  readonly what: T;
};

export class TimeQueue<T> {
  private entries: Entry<T>[] = [];
  private next = 0;

  add(at: number, owner: string, what: T): Entry<T> {
    const entry = { at, seq: this.next++, owner, what };
    // After every entry due at or before `at`: the list stays sorted and same-time stays in order.
    let lo = 0;
    let hi = this.entries.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((this.entries[mid] as Entry<T>).at <= at) lo = mid + 1;
      else hi = mid;
    }
    this.entries.splice(lo, 0, entry);
    return entry;
  }

  /** The first entry, if it is due by `now`. */
  takeDue(now: number): Entry<T> | undefined {
    const first = this.entries[0];
    if (first === undefined || first.at > now) return undefined;
    this.entries.shift();
    return first;
  }

  /** When the first entry is due, or undefined when nothing is queued. */
  get nextAt(): number | undefined {
    return this.entries[0]?.at;
  }

  /** Drops one entry, by the entry `add` gave (none if it is gone already). */
  remove(entry: Entry<T>): void {
    const i = this.entries.indexOf(entry);
    if (i !== -1) this.entries.splice(i, 1);
  }

  /** Drops the entries that pass `test`. */
  drop(test: (entry: Entry<T>) => boolean): void {
    this.entries = this.entries.filter((e) => !test(e));
  }

  /** Changes what entries hold, in place (their time and order stay); undefined drops one. */
  rewrite(change: (entry: Entry<T>) => T | undefined): void {
    const kept: Entry<T>[] = [];
    for (const e of this.entries) {
      const what = change(e);
      if (what !== undefined) kept.push(what === e.what ? e : { ...e, what });
    }
    this.entries = kept;
  }

  /** Everything queued, in the order it will come out. */
  get all(): readonly Entry<T>[] {
    return this.entries;
  }
}
