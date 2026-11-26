"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

async function responseMessage(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);
  return data && typeof data === "object" && "message" in data && typeof data.message === "string"
    ? data.message
    : fallback;
}

export function PayNowButton({ bookingId }: { bookingId: string }) {
  const [busy, setBusy] = useState(false);

  async function checkout() {
    if (busy) return;
    setBusy(true);
    try {
      const tokenResponse = await fetch("/api/access-token", { method: "POST" });
      if (!tokenResponse.ok) throw new Error(await responseMessage(tokenResponse, "Please sign in again."));
      const tokenData: { accessToken?: string } = await tokenResponse.json();
      if (!tokenData.accessToken) throw new Error("Could not verify your session.");

      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          authorization: `Bearer ${tokenData.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });
      if (!response.ok) throw new Error(await responseMessage(response, "Could not start checkout."));
      const data: { url?: string } = await response.json();
      const url = data.url ? new URL(data.url) : null;
      if (url?.protocol !== "https:" || url.hostname !== "checkout.stripe.com") {
        throw new Error("Checkout returned an invalid URL.");
      }
      window.location.assign(url.href);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout.");
      setBusy(false);
    }
  }

  return <Button type="button" size="sm" disabled={busy} onClick={checkout}>{busy ? "Redirecting..." : "Pay Now"}</Button>;
}
