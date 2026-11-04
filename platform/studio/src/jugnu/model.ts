import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import type { LanguageModel, SystemModelMessage, generateText } from "ai";

/** A provider's settings on a request, as the AI SDK takes them. */
type ProviderOptions = NonNullable<Parameters<typeof generateText>[0]["providerOptions"]>;

/**
 * The model layer (platform/docs/plans/jugnu-agent.md): which model runs a side, and everything
 * provider-specific about it, here and nowhere else. The conversation, the loop and the tools are
 * ours and provider-neutral (agent.ts); the AI SDK's provider packages talk to each provider.
 *
 * A side's model is set in the environment, by a prefix (JUGNU for Jugnu, JUGNU_STUDENT for the
 * simulated child): `<P>_PROVIDER` (anthropic, deepseek), `<P>_MODEL` (the provider's model id),
 * `<P>_MODEL_SERVER` (the API's base address, e.g. an Azure resource's `…/openai/v1`) and `<P>_API_KEY`
 * (optional: the provider's own and its usual key otherwise),
 * `<P>_THINK` (on, the default, or off).
 */

export const Provider = { Anthropic: "anthropic", DeepSeek: "deepseek" } as const;
export type Provider = (typeof Provider)[keyof typeof Provider];

/** How hard a model thinks, in our words; each provider maps it to its own setting. */
export const Effort = { Low: "low", Medium: "medium", High: "high" } as const;
export type Effort = (typeof Effort)[keyof typeof Effort];

export type ModelSettings = {
  provider: Provider;
  /** The provider's model id ("claude-haiku-5-5", "DeepSeek-V4-Flash"). */
  id: string;
  /** Where its API is (the provider's own if unset). */
  server?: string | undefined;
  apiKey?: string | undefined;
  isThinking: boolean;
  effort: Effort;
};

export type Model = {
  /** "provider/id", as named in what a run records. */
  name: string;
  model: LanguageModel;
  /** Its settings on every request of a conversation (thinking, effort, caching): fixed for it. */
  options: ProviderOptions;
  /** The instructions as this provider takes them: each block in order, the last cached. */
  instructions: (blocks: readonly string[]) => SystemModelMessage[];
};

const isProvider = (p: string): p is Provider => (Object.values(Provider) as string[]).includes(p);

/** A side's model settings from the environment (by its prefix), with a default model. */
export function settingsFrom(
  prefix: string,
  fallback: { provider: Provider; id: string },
  env: Readonly<Record<string, string | undefined>> = process.env,
): ModelSettings {
  // An empty setting is no setting.
  const get = (name: string) => {
    const v = env[`${prefix}_${name}`];
    return v === undefined || v === "" ? undefined : v;
  };
  const provider = get("PROVIDER") ?? fallback.provider;
  if (!isProvider(provider))
    throw new Error(
      `${prefix}_PROVIDER is "${provider}": it must be one of ${Object.values(Provider).join(", ")} (a provider's own adapter keeps its thinking and caching; model.ts)`,
    );
  const think = get("THINK") ?? "on";
  return {
    provider,
    id: get("MODEL") ?? fallback.id,
    server: get("MODEL_SERVER"),
    apiKey: get("API_KEY"),
    isThinking: think !== "off",
    effort: Effort.Low,
  };
}

/** A seat as a run asks for it, safe to come from a page: which model, and whether it thinks. */
export type SeatChoice = { provider: Provider; id: string; isThinking?: boolean };

/** The models a page may pick from, per provider (offered only where the server has its key). */
const OFFERED: Record<Provider, readonly string[]> = {
  [Provider.Anthropic]: ["claude-haiku-5-5", "claude-sonnet-5-5"],
  [Provider.DeepSeek]: ["deepseek-flash", "deepseek-v4-pro"],
};

/** The sides whose settings may name a provider's server and key. */
const SIDES = ["JUGNU", "JUGNU_STUDENT", "JUGNU_JUDGE"] as const;

/**
 * Where a provider is reached: the server and key of a side whose settings name that provider, else
 * the provider's own (its SDK reads ANTHROPIC_API_KEY, DEEPSEEK_API_KEY). Never from a page.
 */
function connectionFor(
  provider: Provider,
  env: Readonly<Record<string, string | undefined>>,
): { server?: string; apiKey?: string } {
  const get = (name: string) => (env[name] === "" ? undefined : env[name]);
  const side = SIDES.find((p) => get(`${p}_PROVIDER`) === provider && get(`${p}_API_KEY`));
  if (side !== undefined) {
    const server = get(`${side}_MODEL_SERVER`);
    const apiKey = get(`${side}_API_KEY`);
    return {
      ...(server === undefined ? {} : { server }),
      ...(apiKey === undefined ? {} : { apiKey }),
    };
  }
  const apiKey = get(`${provider.toUpperCase()}_API_KEY`);
  return apiKey === undefined ? {} : { apiKey };
}

/** The models the server can run now (a provider with a key), each as a page may choose it. */
export function offeredModels(
  env: Readonly<Record<string, string | undefined>> = process.env,
): { provider: Provider; id: string }[] {
  return Object.values(Provider).flatMap((provider) =>
    connectionFor(provider, env).apiKey === undefined
      ? []
      : OFFERED[provider].map((id) => ({ provider, id })),
  );
}

/** A seat's settings from a page's choice: its connection from the server, never the page. */
export function settingsForChoice(
  choice: SeatChoice,
  env: Readonly<Record<string, string | undefined>> = process.env,
): ModelSettings {
  if (!isProvider(choice.provider)) throw new Error(`No provider "${String(choice.provider)}"`);
  if (!offeredModels(env).some((m) => m.provider === choice.provider && m.id === choice.id))
    throw new Error(
      `The server can't run ${choice.provider}/${choice.id} (no key, or not offered)`,
    );
  const c = connectionFor(choice.provider, env);
  return {
    provider: choice.provider,
    id: choice.id,
    server: c.server,
    apiKey: c.apiKey,
    isThinking: choice.isThinking !== false,
    effort: Effort.Low,
  };
}

/** The model the settings name. */
export function modelOf(s: ModelSettings): Model {
  const name = `${s.provider}/${s.id}`;
  const connection = {
    ...(s.server === undefined ? {} : { baseURL: s.server }),
    ...(s.apiKey === undefined ? {} : { apiKey: s.apiKey }),
  };
  const plain = (blocks: readonly string[]) =>
    blocks.map((content): SystemModelMessage => ({ role: "system", content }));
  switch (s.provider) {
    case Provider.Anthropic:
      return {
        name,
        model: createAnthropic(connection)(s.id),
        // Adaptive thinking, shown as summaries; the growing conversation cached automatically.
        options: {
          anthropic: {
            ...(s.isThinking
              ? { thinking: { type: "adaptive", display: "summarized" }, effort: s.effort }
              : { thinking: { type: "disabled" } }),
            cacheControl: { type: "ephemeral" },
          },
        },
        // The last block (the lesson) is a cache breakpoint: it is the same on every request.
        instructions: (blocks) =>
          plain(blocks).map((b, i) =>
            i === blocks.length - 1
              ? { ...b, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } }
              : b,
          ),
      };
    case Provider.DeepSeek:
      return {
        name,
        model: createDeepSeek(connection)(s.id),
        // DeepSeek caches a repeated prefix by itself; its adapter passes its reasoning back.
        options: {
          // Thinking is DeepSeek's default: on is set by its effort alone (a server hosting it,
          // such as Azure's, may not take the switch itself); off is the switch.
          deepseek: s.isThinking
            ? { reasoningEffort: s.effort === Effort.Low ? "low" : "high" }
            : { thinking: { type: "disabled" } },
        },
        instructions: plain,
      };
  }
}
