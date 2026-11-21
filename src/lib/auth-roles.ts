export type DashboardRole = "customer" | "technician" | "admin";

export function dashboardPathForRole(role: unknown) {
  if (role === "technician") return "/dashboard/technician";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/customer";
}
