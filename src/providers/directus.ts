import {
  createDirectus,
  rest,
  authentication,
  readMe,
  type AuthenticationStorage,
  type AuthenticationData,
} from "@directus/sdk";
import { dataProvider as buildDataProvider } from "@tspvivek/refine-directus";
import type { AuthProvider, DataProvider } from "@refinedev/core";

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL as string;

if (!DIRECTUS_URL) {
  throw new Error("VITE_DIRECTUS_URL is not set. Check your .env file.");
}

const STORAGE_KEY = "directus-auth";

const localAuthStorage: AuthenticationStorage = {
  get: async () => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthenticationData;
    } catch {
      return null;
    }
  },
  set: async (value) => {
    if (typeof window === "undefined") return;
    if (value === null) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    }
  },
};

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AuthenticationData;
    return data?.access_token ?? null;
  } catch {
    return null;
  }
}

export const directusClient = createDirectus(DIRECTUS_URL)
  .with(
    authentication("json", {
      credentials: "include",
      autoRefresh: true,
      storage: localAuthStorage,
    })
  )
  .with(rest({ credentials: "include" }));

// The SDK's AuthenticationStorage.get() is async, so the client's in-memory
// token is empty during the first requests after page load — leading to 403s
// even when a valid token sits in localStorage. Prime the in-memory state
// synchronously at module load, before any request() call fires.
//
// Additionally, the stored access_token may already be expired after idle
// reloads. Fire a refresh immediately and expose the promise so authProvider.check()
// can await it — that gates <Authenticated> rendering until a fresh token is in
// place, preventing the 401 race on pages that fire useList on mount
// (e.g. /insights/performance, /insights/analyse).
let bootstrapRefreshPromise: Promise<unknown> | null = null;
const bootstrapToken = readStoredToken();
if (bootstrapToken) {
  directusClient.setToken(bootstrapToken);
  bootstrapRefreshPromise = directusClient.refresh().catch(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    return null;
  });
}

// @tspvivek/refine-directus ships types against @refinedev/core v4 — our app runs on v5.
// Runtime contract is identical; cast narrows to the v5 DataProvider shape we use.
export const dataProvider = buildDataProvider(directusClient) as unknown as DataProvider;

export function getAssetUrl(uuid: string | null | undefined): string | null {
  if (!uuid) return null;
  return `${DIRECTUS_URL}/assets/${uuid}`;
}

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      await directusClient.login({ email, password });
      return { success: true, redirectTo: "/" };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login fehlgeschlagen";
      return {
        success: false,
        error: { name: "LoginError", message },
      };
    }
  },
  logout: async () => {
    // Must call server logout FIRST while refresh-token cookie is still valid —
    // otherwise the server keeps reissuing access_tokens on every readMe() call
    // (credentials:"include" + autoRefresh:true + HttpOnly refresh cookie).
    try {
      await directusClient.logout();
    } catch {
      // Token may already be invalid — continue with local cleanup anyway.
    }
    directusClient.setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      // Hard reload kills any in-flight SDK refresh timers and forces a clean
      // module init where bootstrapToken finds no token in storage.
      window.location.href = "/login";
    }
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    try {
      // Block until the bootstrap refresh (fired at module load) settles.
      // This is what closes the token-race: <Authenticated> only renders — and
      // child routes only fire their queries — after the SDK has a fresh token.
      if (bootstrapRefreshPromise) {
        await bootstrapRefreshPromise;
        bootstrapRefreshPromise = null;
      }
      const token = await directusClient.getToken();
      if (!token) return { authenticated: false, redirectTo: "/login" };
      // Verify token is still valid server-side; protects against stale localStorage
      await directusClient.request(readMe({ fields: ["id"] }));
      return { authenticated: true };
    } catch {
      return { authenticated: false, redirectTo: "/login" };
    }
  },
  getIdentity: async () => {
    try {
      const user = await directusClient.request(
        readMe({ fields: ["id", "first_name", "last_name", "email", "avatar"] })
      );
      const name =
        `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
        user.email ||
        "User";
      return {
        id: user.id,
        name,
        email: user.email,
        avatar: user.avatar,
      };
    } catch {
      return null;
    }
  },
  onError: async (error) => {
    const status = error?.statusCode;
    // 401 = expired access_token. Try one refresh before giving up —
    // this catches the race between module load and first useList on pages
    // that fire queries immediately (e.g. /insights/performance).
    if (status === 401) {
      try {
        await directusClient.refresh();
        return {};
      } catch {
        return { logout: true, redirectTo: "/login" };
      }
    }
    if (status === 403) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },
};
