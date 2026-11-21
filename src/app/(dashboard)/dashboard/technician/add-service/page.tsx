import { redirect } from "next/navigation";
import { AddServiceForm } from "@/components/dashboard/add-service-form";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

export default async function AddServicePage() {
	const session = await getAuthSession();
	if (!session) redirect("/sign-in");
	if (dashboardPathForRole(session.user.role) !== "/dashboard/technician") {
		redirect(dashboardPathForRole(session.user.role));
	}

	return <AddServiceForm />;
}
