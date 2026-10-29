import { contentAddress, previewQuery } from "@chalk/content/address";
import type { JSX } from "preact";
import { useMemo } from "preact/hooks";
import { type Thread, type Threads, useThreads } from "./threads";

/**
 * Development only (`?dev&activity`): everything written on threads, newest first, across every
 * board: who started what, every message and status move, every review handed over. Live, so you
 * can watch a reviewer or a fixer work. `&review=<id>` keeps to one review's threads. A line opens
 * its board in the preview (a planning file's thread: open it in the editor).
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

function linesOf({ threads, reviews }: Threads, only: string | null): Line[] {
  const review = only === null ? undefined : reviews.find((r) => r.id === only);
  const ids = review === undefined ? null : new Set(review.threads.map((t) => t.id));
  const shown = ids === null ? threads : threads.filter((t) => ids.has(t.id));
  const lines: Line[] = [];
  for (const t of shown) {
    const where = whereOf(t);
    const href = hrefOf(t);
    lines.push({
      at: t.createdAt,
      by: t.by,
      role: t.role,
      what: t.role === "person" ? "comment" : t.role,
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
  for (const r of reviews)
    if (review === undefined || r.id === review.id)
      for (const [i, at] of [r.at, ...(r.added ?? [])].entries())
        lines.push({
          at,
          by: r.by,
          role: r.role,
          what: i === 0 ? "handed over" : "added to",
          where: `review ${r.id}`,
          // How many it holds is known for now, not for each time: said on the latest.
          words:
            i === (r.added ?? []).length
              ? `${r.threads.length} thread${r.threads.length === 1 ? "" : "s"}`
              : "",
          href: `?dev&activity&review=${encodeURIComponent(r.id)}`,
          tone: "review",
        });
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
  const only = new URLSearchParams(window.location.search).get("review");
  const { all } = useThreads();
  const lines = useMemo(() => linesOf(all, only), [all, only]);
  return (
    <main class="activity">
      <header class="activity-bar">
        <strong>{only === null ? "Activity" : `Review ${only}`}</strong>
        {only !== null && <a href="?dev&activity">All activity</a>}
        <span>{`${all.threads.length} threads · ${all.reviews.length} reviews`}</span>
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
