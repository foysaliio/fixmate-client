import { redirect } from "next/navigation";
import { CustomerOverview } from "@/components/dashboard/customer-overview";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getMyBookings } from "@/lib/customer-bookings";
import { getAuthSession } from "@/lib/server-auth";

export default async function CustomerDashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "customer") redirect(dashboardPathForRole(session.user.role));

  return <CustomerOverview bookings={await getMyBookings()} />;
}
