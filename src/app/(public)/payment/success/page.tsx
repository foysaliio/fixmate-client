import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

type Receipt = { amount: number; currency: string; transactionId: string };

async function verifyPayment(sessionId: string): Promise<{ receipt?: Receipt; error?: string }> {
  const apiBaseUrl = process.env.API_BASE_URL;
  const cookie = (await headers()).get("cookie");
  if (!apiBaseUrl || !cookie) return { error: "Could not verify your session. Please sign in again." };

  try {
    const tokenResponse = await fetch(new URL("/api/access-token", apiBaseUrl), {
      method: "POST",
      headers: { cookie },
      cache: "no-store",
    });
    if (!tokenResponse.ok) return { error: "Could not verify your session. Please sign in again." };
    const tokenData: { accessToken?: string } = await tokenResponse.json();
    if (!tokenData.accessToken) return { error: "Could not verify your session. Please sign in again." };

    const url = new URL("/api/payments/verify", apiBaseUrl);
    url.searchParams.set("session_id", sessionId);
    const response = await fetch(url, {
      headers: { authorization: `Bearer ${tokenData.accessToken}` },
      cache: "no-store",
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message : "Could not verify this payment. Please try again.";
      return { error: message };
    }
    if (!data || typeof data !== "object" || !("amount" in data) || typeof data.amount !== "number" ||
      !("currency" in data) || typeof data.currency !== "string" ||
      !("transactionId" in data) || typeof data.transactionId !== "string") {
      return { error: "Could not read the payment receipt. Please try again." };
    }
    return { receipt: data as Receipt };
  } catch {
    return { error: "Could not verify this payment. Please try again." };
  }
}

export default async function PaymentSuccessPage({ searchParams }: {
  searchParams: Promise<{ session_id?: string | string[] }>;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "customer") redirect(dashboardPathForRole(session.user.role));

  const sessionId = (await searchParams).session_id;
  const result = typeof sessionId === "string" && /^cs_[A-Za-z0-9_]+$/.test(sessionId) && sessionId.length <= 255
    ? await verifyPayment(sessionId)
    : { error: "A valid checkout session is required to verify your payment." };

  return (
    <main className="bg-background px-5 py-12 text-foreground sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 text-card-foreground sm:p-10">
        <SectionHeading label="CUSTOMER PAYMENT" level="h1">
          {result.receipt ? "Payment successful" : "Payment verification"}
        </SectionHeading>
        {result.receipt ? (
          <div className="mt-8 space-y-5">
            <p className="text-muted-foreground">Your payment has been verified and your booking is paid.</p>
            <dl className="space-y-4 rounded-xl bg-secondary p-5 text-sm text-secondary-foreground">
              <div><dt className="text-muted-foreground">Amount paid</dt><dd className="mt-1 text-lg font-semibold">{new Intl.NumberFormat("en-US", { style: "currency", currency: result.receipt.currency.toUpperCase() }).format(result.receipt.amount)}</dd></div>
              <div><dt className="text-muted-foreground">Transaction ID</dt><dd className="mt-1 break-all font-medium">{result.receipt.transactionId}</dd></div>
            </dl>
          </div>
        ) : (
          <p role="alert" className="mt-8 text-sm text-destructive">{result.error}</p>
        )}
        <Button render={<Link href="/dashboard/customer/bookings" />} nativeButton={false} className="mt-8">My Bookings</Button>
      </div>
    </main>
  );
}
