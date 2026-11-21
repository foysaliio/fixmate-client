import { headers } from "next/headers";
import type { TechnicianService } from "@/components/dashboard/my-services-list";

export async function getMyServices(): Promise<TechnicianService[] | null> {
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

		const response = await fetch(new URL("/api/services/my", apiBaseUrl), {
			headers: { authorization: `Bearer ${tokenData.accessToken}` },
			cache: "no-store",
		});
		if (!response.ok) return null;
		const data: unknown = await response.json();
		return Array.isArray(data) ? (data as TechnicianService[]) : null;
	} catch {
		return null;
	}
}
