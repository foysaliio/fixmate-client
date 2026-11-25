"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type User = { name: string; email: string; role?: string };

const duplicateMessage = "You already have an active request for this service.";
const textareaClassName =
  "w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

function todayInDhaka() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function responseMessage(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);
  return data && typeof data === "object" && "message" in data && typeof data.message === "string"
    ? data.message
    : fallback;
}

export function RequestRepair({ serviceId, user }: { serviceId: string; user: User | null }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isRequested) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const phone = String(data.get("phone") || "").trim();
    const address = String(data.get("address") || "").trim();
    const preferredDate = String(data.get("preferredDate") || "");
    const problemDescription = String(data.get("problemDescription") || "").trim();
    setFormError("");

    let validationError = "";
    if (!/^\+?[\d\s()-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g, ""))) {
      validationError = "Enter a valid phone number with 7 to 15 digits.";
    } else if (!address) {
      validationError = "Enter your address.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || preferredDate < todayInDhaka()) {
      validationError = "Choose today or a future date.";
    } else if (problemDescription.length < 20) {
      validationError = "Describe the problem in at least 20 characters.";
    }
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const tokenResponse = await fetch("/api/access-token", { method: "POST" });
      if (!tokenResponse.ok) throw new Error(await responseMessage(tokenResponse, "Please sign in again."));
      const tokenData: { accessToken?: string } = await tokenResponse.json();
      if (!tokenData.accessToken) throw new Error("Could not verify your session.");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          authorization: `Bearer ${tokenData.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ serviceId, phone, address, preferredDate, problemDescription }),
      });
      if (response.status === 409) throw new Error(duplicateMessage);
      if (!response.ok) throw new Error(await responseMessage(response, "Could not request this repair."));

      setIsRequested(true);
      form.reset();
      toast.success("Repair request submitted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not request this repair.";
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-6 border-t border-border pt-6" aria-labelledby="request-repair-title">
      <h2 id="request-repair-title" className="font-heading text-xl font-semibold">Request Repair</h2>
      {!user ? (
        <Button
          render={<Link href={`/sign-in?returnTo=${encodeURIComponent(`/services/${serviceId}`)}`} />}
          nativeButton={false}
          className="mt-5 w-full"
        >
          Request Repair
        </Button>
      ) : user.role !== "customer" ? (
        <p role="status" className="mt-4 text-sm text-muted-foreground">Only customers can request a repair</p>
      ) : isRequested ? (
        <div role="status" className="mt-4 space-y-3 text-sm">
          <p className="text-primary">Your repair request has been submitted.</p>
          <Link href="/dashboard/customer/bookings" className="inline-block font-medium text-primary underline-offset-4 hover:underline">
            My Bookings
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div>
              <label htmlFor="repair-name" className="mb-2 block text-sm font-medium">Name</label>
              <Input id="repair-name" value={user.name} readOnly />
            </div>
            <div>
              <label htmlFor="repair-email" className="mb-2 block text-sm font-medium">Email</label>
              <Input id="repair-email" type="email" value={user.email} readOnly />
            </div>
            <div>
              <label htmlFor="repair-phone" className="mb-2 block text-sm font-medium">Phone</label>
              <Input id="repair-phone" name="phone" type="tel" autoComplete="tel" required placeholder="Your phone number" />
            </div>
            <div>
              <label htmlFor="repair-address" className="mb-2 block text-sm font-medium">Address</label>
              <Input id="repair-address" name="address" autoComplete="street-address" required placeholder="Where should we visit?" />
            </div>
            <div>
              <label htmlFor="repair-date" className="mb-2 block text-sm font-medium">Preferred Date</label>
              <Input id="repair-date" name="preferredDate" type="date" min={todayInDhaka()} required />
            </div>
            <div>
              <label htmlFor="repair-problem" className="mb-2 block text-sm font-medium">Problem Description</label>
              <textarea
                id="repair-problem"
                name="problemDescription"
                required
                minLength={20}
                rows={5}
                placeholder="Describe the problem in at least 20 characters"
                className={textareaClassName}
              />
            </div>
            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Request Repair"}
            </Button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
