import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

export default async function PaymentCancelPage() {
  const session = await getAuthSession();
  if (!session) redirect("/sign-in");
  if (session.user.role !== "customer") redirect(dashboardPathForRole(session.user.role));

  return (
    <main className="bg-background px-5 py-12 text-foreground sm:px-8 sm:py-16">
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-6 text-card-foreground sm:p-10">
        <SectionHeading label="CUSTOMER PAYMENT" level="h1">Payment cancelled</SectionHeading>
        <p className="mt-8 text-muted-foreground">Your checkout was cancelled. You can return to your booking and try again.</p>
        <Button render={<Link href="/dashboard/customer/bookings" />} nativeButton={false} className="mt-8">Try Again</Button>
      </div>
    </main>
  );
}
