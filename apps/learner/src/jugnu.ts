import { type LlmProvider, ProviderKind, providerFrom } from "@chalk/jugnu";

/** Set by vite.config.ts from JUGNU_PROVIDER and JUGNU_MODEL. */
declare const __JUGNU__: { provider: string; model: string; think: boolean };

/** Jugnu's model for this app, or undefined when JUGNU_PROVIDER is "off" (or unknown). */
export function jugnuProvider(): LlmProvider | undefined {
  const { provider, model, think } = __JUGNU__;
  const kinds: readonly string[] = Object.values(ProviderKind);
  if (!kinds.includes(provider)) return undefined;
  return providerFrom({
    provider: provider as ProviderKind,
    // Same origin: the dev server passes it on to the model server (see vite.config.ts).
    url: `${window.location.origin}/jugnu-model`,
    model,
    think,
  });
}
