const requestStatuses = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
] as const;

export function technicianOverviewStats(
  services: { approvalStatus?: string }[],
  requests: { status?: string }[],
) {
  const byStatus = requestStatuses.map(({ key, label }) => ({
    key,
    label,
    count: requests.filter((request) => request.status === key).length,
  }));

  return {
    totalServices: services.length,
    approvedServices: services.filter((service) => service.approvalStatus === "approved").length,
    pendingRequests: byStatus[0].count,
    byStatus,
  };
}
