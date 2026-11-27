import { headers } from "next/headers";

export type RequestStatus = "all" | "requested" | "accepted" | "in-progress" | "completed";

export type TechnicianRequest = {
  _id: string;
  customerName?: string;
  phone?: string;
  address?: string;
  preferredDate?: string;
  problemDescription?: string;
  serviceTitle?: string;
  serviceImage?: string | { url?: string };
  status?: string;
  paymentStatus?: string;
  basePrice?: number;
};

export async function getTechnicianRequests(status: RequestStatus): Promise<TechnicianRequest[] | null> {
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

    const url = new URL("/api/bookings/technician", apiBaseUrl);
    url.searchParams.set("status", status);
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as TechnicianRequest[]) : null;
  } catch {
    return null;
  }
}
