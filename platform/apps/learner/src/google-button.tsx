import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

/**
 * Google's own "Continue with Google" button (Google Identity Services). Google draws it; when the
 * person picks their account, Google hands us a credential (a signed ID token) for the server to
 * check. Nothing of Google's is stored on the phone.
 */

const GIS_URL = "https://accounts.google.com/gsi/client";

type GoogleId = {
  initialize: (options: {
    client_id: string;
    callback: (reply: { credential: string }) => void;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

let loading: Promise<GoogleId> | undefined;
function loadGoogle(): Promise<GoogleId> {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_URL;
    script.async = true;
    script.onload = () => {
      const id = window.google?.accounts.id;
      if (id === undefined) reject(new Error("Google's sign-in didn't load"));
      else resolve(id);
    };
    script.onerror = () => {
      loading = undefined;
      reject(new Error("can't reach Google"));
    };
    document.head.append(script);
  });
  return loading;
}

export function GoogleButton({
  clientId,
  locale,
  onCredential,
  onUnavailable,
}: {
  clientId: string;
  locale: string;
  onCredential: (credential: string) => void;
  onUnavailable: () => void;
}): JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  // Google reads the callback once, at initialize: keep the latest one in a ref.
  const callback = useRef(onCredential);
  callback.current = onCredential;

  useEffect(() => {
    const el = host.current;
    if (el !== null) setWidth(Math.min(400, Math.round(el.clientWidth)));
  }, []);

  useEffect(() => {
    if (width === 0) return;
    let isLive = true;
    loadGoogle()
      .then((google) => {
        const el = host.current;
        if (!isLive || el === null) return;
        google.initialize({
          client_id: clientId,
          callback: (reply) => callback.current(reply.credential),
          ux_mode: "popup",
        });
        el.replaceChildren();
        google.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width,
          locale,
        });
      })
      .catch(() => isLive && onUnavailable());
    return () => {
      isLive = false;
    };
  }, [clientId, locale, width, onUnavailable]);

  return <div class="google-button" ref={host} />;
}
