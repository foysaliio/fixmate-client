"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

type Role = "customer" | "technician" | "admin";

export type AdminUser = {
  id: string;
  image?: string | null;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
};

const roles: Role[] = ["customer", "technician", "admin"];

function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase()
    : (parts[0] || "FM").slice(0, 2).toUpperCase();
}

function joinedDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium", timeZone: "Asia/Dhaka",
  }).format(date);
}

function UserIdentity({ user }: { user: AdminUser }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-heading text-sm font-semibold text-secondary-foreground">
        {user.image ? <Image src={user.image} alt="" width={44} height={44} unoptimized className="size-full object-cover" /> : initials(user.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-medium text-foreground">{user.name}</span>
        <span className="block truncate text-sm text-muted-foreground">{user.email}</span>
      </span>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const color = role === "admin" ? "bg-primary text-primary-foreground"
    : role === "technician" ? "bg-secondary text-secondary-foreground"
      : "bg-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${color}`}>{label(role)}</span>;
}

async function apiError(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);
  return data && typeof data === "object" && "message" in data && typeof data.message === "string"
    ? data.message : fallback;
}

function RoleEditor({ user, isSelf, onSaved }: {
  user: AdminUser;
  isSelf: boolean;
  onSaved: (updated: AdminUser) => void;
}) {
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [busy, setBusy] = useState(false);
  useEffect(() => setSelectedRole(user.role), [user.role]);

  if (isSelf) return <span className="text-sm text-muted-foreground">Your account · read only</span>;

  async function saveRole() {
    if (busy || selectedRole === user.role) return;
    setBusy(true);
    try {
      const tokenResponse = await fetch("/api/access-token", { method: "POST" });
      if (!tokenResponse.ok) throw new Error(await apiError(tokenResponse, "Please sign in again."));
      const tokenData: { accessToken?: string } = await tokenResponse.json();
      if (!tokenData.accessToken) throw new Error("Could not verify your session.");

      const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/role`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${tokenData.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!response.ok) throw new Error(await apiError(response, "Could not update this user."));
      const updated: AdminUser = await response.json();
      onSaved(updated);
      toast.success(`${updated.name}'s role is now ${label(updated.role)}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this user.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label={`Role for ${user.name}`}
        value={selectedRole}
        disabled={busy}
        onChange={(event) => setSelectedRole(event.target.value as Role)}
        className="h-10 min-w-32 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        {roles.map((role) => <option key={role} value={role}>{label(role)}</option>)}
      </select>
      <Button type="button" size="sm" disabled={busy || selectedRole === user.role} onClick={saveRole}>
        {busy ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

export function AdminUsersList({ users, currentUserId }: { users: AdminUser[] | null; currentUserId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState(users);
  useEffect(() => setRows(users), [users]);

  function saved(updated: AdminUser) {
    setRows((current) => current?.map((user) => user.id === updated.id ? updated : user) ?? null);
    router.refresh();
  }

  return (
    <main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading label="ADMIN DASHBOARD" level="h1">Users</SectionHeading>
        <p className="mt-5 text-muted-foreground">View accounts and manage access roles.</p>

        {rows === null ? (
          <p role="alert" className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground">
            Could not load users. Please try again later.
          </p>
        ) : rows.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground">No users found.</p>
        ) : (
          <>
            <ul className="mt-8 space-y-4 lg:hidden">
              {rows.map((user) => (
                <li key={user.id} className="rounded-xl border border-border bg-card p-5 text-card-foreground">
                  <UserIdentity user={user} />
                  <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 text-sm">
                    <div><dt className="text-muted-foreground">Role</dt><dd className="mt-1"><RoleBadge role={user.role} /></dd></div>
                    <div><dt className="text-muted-foreground">Joined</dt><dd className="mt-1 font-medium">{joinedDate(user.createdAt)}</dd></div>
                  </dl>
                  <div className="mt-5 border-t border-border pt-5">
                    <RoleEditor user={user} isSelf={user.id === currentUserId} onSaved={saved} />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden overflow-x-auto rounded-xl border border-border bg-card text-card-foreground lg:block">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">User</th>
                    <th scope="col" className="px-4 py-4 font-medium">Role</th>
                    <th scope="col" className="px-4 py-4 font-medium">Joined</th>
                    <th scope="col" className="px-5 py-4 font-medium">Change role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((user) => (
                    <tr key={user.id}>
                      <td className="min-w-64 px-5 py-4"><UserIdentity user={user} /></td>
                      <td className="px-4 py-4"><RoleBadge role={user.role} /></td>
                      <td className="whitespace-nowrap px-4 py-4">{joinedDate(user.createdAt)}</td>
                      <td className="px-5 py-4"><RoleEditor user={user} isSelf={user.id === currentUserId} onSaved={saved} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
