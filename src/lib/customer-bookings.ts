import { headers } from "next/headers";

export type CustomerBooking = {
  _id: string;
  serviceTitle?: string;
  serviceImage?: string | { url?: string };
  technicianName?: string;
  preferredDate?: string;
  basePrice?: number;
  finalAmount?: number;
  status?: string;
  paymentStatus?: string;
};

export async function getMyBookings(): Promise<CustomerBooking[] | null> {
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

    const response = await fetch(new URL("/api/bookings/my", apiBaseUrl), {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as CustomerBooking[]) : null;
  } catch {
    return null;
  }
}
