import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getAuthSession } from "@/lib/server-auth";

export default async function DashboardRouteLayout({ children }: { children: ReactNode }) {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");

  return <DashboardLayout user={session.user}>{children}</DashboardLayout>;
}
