import { redirect } from "next/navigation";
import { TechnicianOverview } from "@/components/dashboard/technician-overview";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getMyServices } from "@/lib/my-services";
import { getAuthSession } from "@/lib/server-auth";
import { getTechnicianRequests } from "@/lib/technician-requests";

export default async function TechnicianDashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (dashboardPathForRole(session.user.role) !== "/dashboard/technician") {
    redirect(dashboardPathForRole(session.user.role));
  }

  const [services, requests] = await Promise.all([
    getMyServices(),
    getTechnicianRequests("all"),
  ]);
  return <TechnicianOverview services={services} requests={requests} />;
}
