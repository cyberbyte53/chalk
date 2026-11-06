import { contentAddress, previewQuery } from "@chalk/content/address";
import type { JSX } from "preact";
import { useMemo } from "preact/hooks";
import { type Thread, type Threads, useThreads } from "./threads";

/**
 * Development only (`?dev&activity`): everything written on threads, newest first, across every
 * board: who started what, and every message and status move. Live, so you can watch a reviewer or
 * a fixer work. A line opens its board in the preview (a planning file's thread: open it in the
 * editor).
 */

type Line = {
  at: string;
  by: string;
  role: string;
  what: string;
  where: string;
  words: string;
  href: string | null;
  tone: string;
};

const whereOf = (t: Thread): string =>
  t.board === undefined
    ? `${(t.source ?? "").replace(/^content\//, "").replace(/:\d.*$/, "")}${t.snapshot ? ` · ${t.snapshot}` : ""}`
    : `${t.board.split("/").slice(-2).join("/")}${t.target ? ` · ${t.target}` : ""}${t.prop ? ` · prop ${t.prop}` : ""}`;

const hrefOf = (t: Thread): string | null => {
  if (t.board !== undefined) return `?dev&${previewQuery(contentAddress(t.board))}`;
  // A thread on a planning file: opened in the editor (its line is the thread's source).
  return null;
};

function linesOf({ threads }: Threads): Line[] {
  const lines: Line[] = [];
  for (const t of threads) {
    const where = whereOf(t);
    const href = hrefOf(t);
    lines.push({
      at: t.createdAt,
      by: t.by,
      role: t.role,
      what: t.role === "person" ? "comment" : t.options !== undefined ? `${t.role} asks` : t.role,
      where,
      words: t.text,
      href,
      tone: t.role,
    });
    for (const m of t.messages)
      lines.push({
        at: m.at,
        by: m.by,
        role: m.role,
        what: m.status ?? "wrote",
        where,
        words: m.text,
        href,
        tone: m.status ?? "message",
      });
  }
  return lines.sort((a, b) => b.at.localeCompare(a.at));
}

const timeOf = (at: string): string => {
  const d = new Date(at);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
};

export function ActivityFeed(): JSX.Element {
  const { all } = useThreads();
  const lines = useMemo(() => linesOf(all), [all]);
  return (
    <main class="activity">
      <header class="activity-bar">
        <strong>Activity</strong>
        <a href="?dev&threads">Open threads</a>
        <span>{`${all.threads.length} threads`}</span>
      </header>
      {lines.length === 0 ? (
        <p class="activity-empty">Nothing written yet.</p>
      ) : (
        <ol class="activity-list">
          {lines.map((l) => (
            <li key={`${l.at}·${l.by}·${l.what}`} class={`activity-line is-${l.tone}`}>
              <time dateTime={l.at}>{timeOf(l.at)}</time>
              <span class={`activity-who is-${l.role}`}>{l.by}</span>
              <span class="activity-what">{l.what}</span>
              {l.href === null ? (
                <span class="activity-where">{l.where}</span>
              ) : (
                <a class="activity-where" href={l.href}>
                  {l.where}
                </a>
              )}
              {l.words !== "" && <span class="activity-words">{l.words}</span>}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
