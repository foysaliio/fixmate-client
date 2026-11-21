import { headers } from "next/headers";
import { cache } from "react";

type AuthSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    image?: string | null;
  };
  session: { id: string };
};

export const getAuthSession = cache(async (): Promise<AuthSession | null> => {
  const cookie = (await headers()).get("cookie");
  if (!cookie) return null;

  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) throw new Error("API_BASE_URL must be set.");

  const response = await fetch(new URL("/api/auth/get-session", apiBaseUrl), {
    headers: { cookie },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Unable to verify your session.");

  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || !("user" in data) || !data.user) return null;
  return data as AuthSession;
});
