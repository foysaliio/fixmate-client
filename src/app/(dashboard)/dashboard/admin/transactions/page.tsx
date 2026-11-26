import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SectionHeading } from "@/components/ui/section-heading";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

type Payment = {
  _id: string;
  customerName?: string;
  customerEmail?: string;
  technicianName?: string;
  technicianEmail?: string;
  serviceTitle?: string;
  amount?: number;
  transactionId?: string;
  paidAt?: string;
};

type PaymentsResponse = {
  payments: Payment[];
  totalRevenue: number;
};

async function getPayments(): Promise<PaymentsResponse | null> {
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

    const response = await fetch(new URL("/api/admin/payments", apiBaseUrl), {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("payments" in data) ||
      !("totalRevenue" in data) || !Array.isArray(data.payments) ||
      typeof data.totalRevenue !== "number") return null;
    return data as PaymentsResponse;
  } catch {
    return null;
  }
}

function usd(amount: number | undefined) {
  return typeof amount === "number" && Number.isFinite(amount)
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
    : "—";
}

function paymentDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium", timeZone: "Asia/Dhaka",
  }).format(date);
}

function person(name?: string, email?: string) {
  return name?.trim() || email?.trim() || "—";
}

export default async function AdminTransactionsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (dashboardPathForRole(session.user.role) !== "/dashboard/admin") {
    redirect(dashboardPathForRole(session.user.role));
  }

  const result = await getPayments();
  return (
    <main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="[&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
          <SectionHeading label="ADMIN DASHBOARD" level="h1">Transactions</SectionHeading>
          <p className="mt-5 text-base text-muted-foreground">View all completed payments and revenue.</p>
        </div>

        {result === null ? (
          <div role="alert" className="mt-8 rounded-xl border border-border bg-card p-6 text-sm text-destructive">
            Could not load transactions. Please try again.
          </div>
        ) : (
          <>
            <section aria-label="Total Revenue" className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground sm:p-8">
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{usd(result.totalRevenue)}</p>
            </section>

            {result.payments.length === 0 ? (
              <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center text-card-foreground">
                <p className="font-heading text-xl font-semibold">No payments yet</p>
                <p className="mt-2 text-sm text-muted-foreground">Paid transactions will appear here.</p>
              </div>
            ) : (
              <>
                <ul className="mt-6 space-y-4 lg:hidden">
                  {result.payments.map((payment) => (
                    <li key={payment._id} className="rounded-xl border border-border bg-card p-5 text-card-foreground">
                      <p className="font-heading text-lg font-semibold">{payment.serviceTitle || "Repair service"}</p>
                      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
                        <div><dt className="text-muted-foreground">Customer</dt><dd className="mt-1 font-medium">{person(payment.customerName, payment.customerEmail)}</dd></div>
                        <div><dt className="text-muted-foreground">Technician</dt><dd className="mt-1 font-medium">{person(payment.technicianName, payment.technicianEmail)}</dd></div>
                        <div><dt className="text-muted-foreground">Amount</dt><dd className="mt-1 font-medium">{usd(payment.amount)}</dd></div>
                        <div><dt className="text-muted-foreground">Payment Date</dt><dd className="mt-1 font-medium">{paymentDate(payment.paidAt)}</dd></div>
                        <div className="col-span-2"><dt className="text-muted-foreground">Transaction ID</dt><dd className="mt-1 break-all font-medium">{payment.transactionId || "—"}</dd></div>
                      </dl>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 hidden overflow-x-auto rounded-xl border border-border bg-card lg:block">
                  <table className="w-full min-w-[850px] text-left text-sm text-card-foreground">
                    <thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <tr>
                        {(["Customer", "Technician", "Service", "Amount (USD)", "Transaction ID", "Payment Date"] as const).map((heading) => (
                          <th key={heading} scope="col" className="px-4 py-4">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.payments.map((payment) => (
                        <tr key={payment._id}>
                          <td className="px-4 py-4">{person(payment.customerName, payment.customerEmail)}</td>
                          <td className="px-4 py-4">{person(payment.technicianName, payment.technicianEmail)}</td>
                          <td className="px-4 py-4 font-medium">{payment.serviceTitle || "Repair service"}</td>
                          <td className="px-4 py-4 font-medium whitespace-nowrap">{usd(payment.amount)}</td>
                          <td className="px-4 py-4 break-all">{payment.transactionId || "—"}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-muted-foreground">{paymentDate(payment.paidAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
