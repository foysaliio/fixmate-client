import { notFound, redirect } from "next/navigation";
import { AddServiceForm } from "@/components/dashboard/add-service-form";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getMyServices } from "@/lib/my-services";
import { getAuthSession } from "@/lib/server-auth";

export default async function EditServicePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getAuthSession();
	if (!session) redirect("/sign-in");
	if (dashboardPathForRole(session.user.role) !== "/dashboard/technician") {
		redirect(dashboardPathForRole(session.user.role));
	}

	const { id } = await params;
	const services = await getMyServices();
	const service = services?.find((item) => item._id === id);
	if (!service) notFound();

	return <AddServiceForm initialService={service} />;
}
