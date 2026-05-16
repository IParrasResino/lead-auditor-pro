export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// NOTE: `state` must be btoa(redirectUri) — the backend sdk.ts decodes it
// directly as the redirectUri for the OAuth token exchange. Do NOT encode JSON.
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  // Store the intended destination so we can redirect after login
  if (returnPath && returnPath !== "/") {
    try {
      sessionStorage.setItem("lap_return_path", returnPath);
    } catch {
      // sessionStorage may not be available in all contexts
    }
  }

  return url.toString();
};
