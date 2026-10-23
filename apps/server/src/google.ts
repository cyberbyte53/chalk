import { OAuth2Client } from "google-auth-library";

/** Who a Google sign-in says the person is. */
export type GoogleProfile = { sub: string; email: string; name: string; picture: string | null };

/** Checks the credential Google's button gave the app; undefined if it isn't good. */
export type GoogleVerifier = (credential: string) => Promise<GoogleProfile | undefined>;

/**
 * The real check: Google's signature, made for our client id, not expired, email verified.
 * google-auth-library fetches and caches Google's public keys.
 */
export function googleVerifier(clientId: string): GoogleVerifier {
  const client = new OAuth2Client(clientId);
  return async (credential) => {
    try {
      const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
      const p = ticket.getPayload();
      if (p === undefined || p.email === undefined || p.email_verified !== true) return undefined;
      return {
        sub: p.sub,
        email: p.email,
        name: p.name ?? p.email.split("@")[0] ?? p.email,
        picture: p.picture ?? null,
      };
    } catch (error) {
      // A bad or expired token is the person's problem, not the server's; say why in the log.
      console.warn(`Google sign-in refused: ${error instanceof Error ? error.message : error}`);
      return undefined;
    }
  };
}

/**
 * For trying the app on a laptop without Google: a credential "dev:<id>:<name>" signs in as that
 * person. Only ever on a localhost origin (main.ts refuses anything else).
 */
export function withDevSignIn(real: GoogleVerifier): GoogleVerifier {
  return async (credential) => {
    const [kind, id, ...name] = credential.split(":");
    if (kind !== "dev" || id === undefined || id === "" || name.length === 0)
      return real(credential);
    return { sub: `dev-${id}`, email: `${id}@dev.local`, name: name.join(":"), picture: null };
  };
}
