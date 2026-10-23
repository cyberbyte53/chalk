import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * `pnpm --filter @chalk/studio chat-log [n]`: prints the last n chats (default 1) the dev shell
 * logged to tmp/jugnu-chat.jsonl, each turn in full: the board as he saw it, the student's input,
 * his hidden reasoning, his tool calls and their answers, and the cues that reached the screen.
 * The same shape as `trace`, for chats a person had rather than a case.
 */
const root = resolve(dirname(new URL(import.meta.url).pathname), "../../../..");
const file = join(root, "tmp", "jugnu-chat.jsonl");
if (!existsSync(file)) {
  console.log(`Nothing logged yet (${file}). Chat with Jugnu in the dev shell first.`);
  process.exit(0);
}
type Entry = { at: string; kind: string } & Record<string, unknown>;
const entries: Entry[] = readFileSync(file, "utf8")
  .split("\n")
  .filter((l) => l.trim() !== "")
  .map((l) => JSON.parse(l) as Entry);
const chats: Entry[][] = [];
for (const e of entries) {
  if (e.kind === "board" || chats.length === 0) chats.push([]);
  chats[chats.length - 1]?.push(e);
}
const n = Number(process.argv[2] ?? "1");
const time = (at: string): string => at.slice(11, 19);
for (const chat of chats.slice(-n)) {
  for (const e of chat) {
    if (e.kind === "board") {
      const place = e.place as { locale?: string } | undefined;
      console.log(
        `\n═══ board ${e.board ?? "(unpublished)"} · ${place?.locale ?? ""} · ${e.at} ═══`,
      );
    } else if (e.kind === "call") {
      const heard = e.heard as { role: string; name?: string; content: string }[];
      for (const m of heard)
        console.log(
          m.role === "tool"
            ? `   ← ${m.name}: ${m.content}`
            : `\n── ${time(e.at)} heard ──\n${m.content.replace(/"props":\{.*\}\}/s, '"props":{…}}')}`,
        );
      const r = e.reply as {
        reasoning?: string;
        content: string;
        toolCalls: { name: string; rawArgs: string }[];
      };
      console.log(`\n   model ${((e.ms as number) / 1000).toFixed(1)} s`);
      if (r.reasoning?.trim())
        console.log(`  THINKS: ${r.reasoning.trim().replace(/\n+/g, "\n          ")}`);
      if (r.content.trim()) console.log(`  WRITES: ${r.content.trim()}`);
      for (const c of r.toolCalls) console.log(`  CALLS ${c.name} ${c.rawArgs}`);
    } else if (e.kind === "turn") {
      console.log(`\n▶ screen (${e.calls} calls):`);
      for (const c of e.cues as Record<string, unknown>[]) console.log(`   ${JSON.stringify(c)}`);
    } else if (e.kind === "flag") console.log(`\n⚑ flagged: ${e.note}`);
  }
}
