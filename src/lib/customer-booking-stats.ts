import type { CustomerBooking } from "./customer-bookings.ts";

export const bookingStatuses = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
  { key: "cancelled", label: "Cancelled" },
] as const;

const activeStatuses = new Set<string>(["requested", "accepted", "in-progress"]);
const knownStatuses = new Set<string>(bookingStatuses.map((status) => status.key));

export function customerBookingStats(bookings: Pick<CustomerBooking, "status">[]) {
  const counts = Object.fromEntries(bookingStatuses.map(({ key }) => [key, 0])) as Record<string, number>;
  let active = 0;
  let other = 0;

  for (const booking of bookings) {
    const status = booking.status;
    if (status && knownStatuses.has(status)) counts[status] += 1;
    else other += 1;
    if (status && activeStatuses.has(status)) active += 1;
  }

  return {
    total: bookings.length,
    active,
    completed: counts.completed,
    byStatus: [
      ...bookingStatuses.map(({ key, label }) => ({ key, label, count: counts[key] })),
      ...(other ? [{ key: "other", label: "Other", count: other }] : []),
    ],
  };
}
