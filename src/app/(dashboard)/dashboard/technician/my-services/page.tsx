import { redirect } from "next/navigation";
import { MyServicesList } from "@/components/dashboard/my-services-list";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getMyServices } from "@/lib/my-services";
import { getAuthSession } from "@/lib/server-auth";

export default async function MyServicesPage() {
	const session = await getAuthSession();
	if (!session) redirect("/sign-in");
	if (dashboardPathForRole(session.user.role) !== "/dashboard/technician") {
		redirect(dashboardPathForRole(session.user.role));
	}

	return <MyServicesList services={await getMyServices()} />;
}
