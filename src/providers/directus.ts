import { createDirectus, rest, authentication, readMe } from "@directus/sdk";
import { dataProvider as buildDataProvider } from "@tspvivek/refine-directus";
import type { AuthProvider, DataProvider } from "@refinedev/core";

const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL as string;

if (!DIRECTUS_URL) {
  throw new Error("VITE_DIRECTUS_URL is not set. Check your .env file.");
}

export const directusClient = createDirectus(DIRECTUS_URL)
  .with(authentication("json", { credentials: "include", autoRefresh: true }))
  .with(rest());

// @tspvivek/refine-directus ships types against @refinedev/core v4 — our app runs on v5.
// Runtime contract is identical; cast narrows to the v5 DataProvider shape we use.
export const dataProvider = buildDataProvider(directusClient) as unknown as DataProvider;

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
    try {
      await directusClient.logout();
    } catch {
      // ignore — token bereits abgelaufen
    }
    return { success: true, redirectTo: "/login" };
  },
  check: async () => {
    try {
      const token = await directusClient.getToken();
      if (!token) return { authenticated: false, redirectTo: "/login" };
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
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return { logout: true, redirectTo: "/login" };
    }
    return {};
  },
};
