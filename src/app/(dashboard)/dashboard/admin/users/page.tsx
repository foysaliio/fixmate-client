import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminUsersList, type AdminUser } from "@/components/dashboard/admin-users-list";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

async function getAdminUsers(): Promise<AdminUser[] | null> {
  const apiBaseUrl = process.env.API_BASE_URL;
  const cookie = (await headers()).get("cookie");
  if (!apiBaseUrl || !cookie) return null;

  try {
    const tokenResponse = await fetch(new URL("/api/access-token", apiBaseUrl), {
      method: "POST",
      headers: { cookie },
      cache: "no-store",
    });
    if (!tokenResponse.ok) return null;
    const tokenData: { accessToken?: string } = await tokenResponse.json();
    if (!tokenData.accessToken) return null;

    const response = await fetch(new URL("/api/admin/users", apiBaseUrl), {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return Array.isArray(data) ? data as AdminUser[] : null;
  } catch {
    return null;
  }
}

export default async function AdminUsersPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "admin") redirect(dashboardPathForRole(session.user.role));

  return <AdminUsersList users={await getAdminUsers()} currentUserId={session.user.id} />;
}
