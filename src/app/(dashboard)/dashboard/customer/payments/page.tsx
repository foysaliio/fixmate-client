import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

type Payment = {
  _id: string;
  serviceTitle?: string;
  technicianName?: string;
  amount?: number;
  transactionId?: string;
  paidAt?: string;
};

async function getMyPayments(): Promise<Payment[] | null> {
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

    const response = await fetch(new URL("/api/payments/my", apiBaseUrl), {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    return Array.isArray(data) ? (data as Payment[]) : null;
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

export default async function PaymentHistoryPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "customer") redirect(dashboardPathForRole(session.user.role));

  const payments = await getMyPayments();
  return (
    <main className="bg-background py-12 text-foreground sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading label="CUSTOMER DASHBOARD" level="h1">Payment History</SectionHeading>
        <p className="mt-5 text-muted-foreground">Review your completed payments and transaction details.</p>

        {payments === null ? (
          <p role="alert" className="mt-8 rounded-xl border border-border bg-card p-6 text-card-foreground">
            Could not load your payments. Please try again later.
          </p>
        ) : payments.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-card-foreground">
            <p className="font-heading text-xl font-semibold">No payments yet</p>
            <p className="mt-2 text-sm text-muted-foreground">Paid bookings will appear here.</p>
            <Button render={<Link href="/dashboard/customer/bookings" />} nativeButton={false} className="mt-6">
              My Bookings
            </Button>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4 lg:hidden">
              {payments.map((payment) => (
                <li key={payment._id} className="rounded-xl border border-border bg-card p-5 text-card-foreground">
                  <p className="font-heading text-lg font-semibold">{payment.serviceTitle || "Repair service"}</p>
                  <dl className="mt-4 grid gap-4 border-t border-border pt-4 text-sm">
                    <div><dt className="text-muted-foreground">Technician</dt><dd className="mt-1 font-medium">{payment.technicianName || "—"}</dd></div>
                    <div><dt className="text-muted-foreground">Amount paid</dt><dd className="mt-1 font-medium">{usd(payment.amount)}</dd></div>
                    <div><dt className="text-muted-foreground">Transaction ID</dt><dd className="mt-1 break-all font-medium">{payment.transactionId || "—"}</dd></div>
                    <div><dt className="text-muted-foreground">Payment date</dt><dd className="mt-1 font-medium">{paymentDate(payment.paidAt)}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden overflow-x-auto rounded-xl border border-border bg-card text-card-foreground lg:block">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead className="bg-muted/60 text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-medium">Service</th>
                    <th scope="col" className="px-4 py-4 font-medium">Technician</th>
                    <th scope="col" className="px-4 py-4 font-medium">Amount paid (USD)</th>
                    <th scope="col" className="px-4 py-4 font-medium">Transaction ID</th>
                    <th scope="col" className="px-5 py-4 font-medium">Payment date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-5 py-4 font-medium">{payment.serviceTitle || "Repair service"}</td>
                      <td className="px-4 py-4">{payment.technicianName || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4">{usd(payment.amount)}</td>
                      <td className="max-w-64 break-all px-4 py-4">{payment.transactionId || "—"}</td>
                      <td className="whitespace-nowrap px-5 py-4">{paymentDate(payment.paidAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
