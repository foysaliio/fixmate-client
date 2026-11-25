import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
	type AdminService,
	AdminServicesList,
	type ApprovalFilter,
} from "@/components/dashboard/admin-services-list";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

async function getAdminServices(
	status: ApprovalFilter,
): Promise<AdminService[] | null> {
	const apiBaseUrl = process.env.API_BASE_URL;
	const cookie = (await headers()).get("cookie");
	if (!apiBaseUrl || !cookie) return null;

	try {
		const tokenResponse = await fetch(
			new URL("/api/access-token", apiBaseUrl),
			{
				method: "POST",
				headers: { cookie },
				cache: "no-store",
			},
		);
		if (!tokenResponse.ok) return null;
		const tokenData: { accessToken?: string } = await tokenResponse.json();
		if (!tokenData.accessToken) return null;

		const url = new URL("/api/admin/services", apiBaseUrl);
		url.searchParams.set("status", status);
		const response = await fetch(url, {
			headers: { authorization: `Bearer ${tokenData.accessToken}` },
			cache: "no-store",
		});
		if (!response.ok) return null;
		const data: unknown = await response.json();
		return Array.isArray(data) ? (data as AdminService[]) : null;
	} catch {
		return null;
	}
}

export default async function AdminServicesPage({
	searchParams,
}: {
	searchParams: Promise<{ status?: string | string[] }>;
}) {
	const session = await getAuthSession();
	if (!session) redirect("/sign-in");
	if (dashboardPathForRole(session.user.role) !== "/dashboard/admin") {
		redirect(dashboardPathForRole(session.user.role));
	}

	const requestedStatus = (await searchParams).status;
	const status: ApprovalFilter =
		requestedStatus === "approved" ||
		requestedStatus === "rejected" ||
		requestedStatus === "all"
			? requestedStatus
			: "pending";
	return (
		<AdminServicesList
			key={status}
			status={status}
			services={await getAdminServices(status)}
		/>
	);
}
