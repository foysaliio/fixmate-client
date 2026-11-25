"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function statusLabel(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function responseMessage(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);
  return data && typeof data === "object" && "message" in data && typeof data.message === "string"
    ? data.message
    : fallback;
}

export function BookingStatus({ id, status, serviceTitle }: { id: string; status?: string; serviceTitle?: string }) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => setCurrentStatus(status), [status]);

  async function cancelBooking() {
    if (busy || currentStatus !== "requested") return;
    setBusy(true);
    try {
      const tokenResponse = await fetch("/api/access-token", { method: "POST" });
      if (!tokenResponse.ok) throw new Error(await responseMessage(tokenResponse, "Please sign in again."));
      const tokenData: { accessToken?: string } = await tokenResponse.json();
      if (!tokenData.accessToken) throw new Error("Could not verify your session.");

      const response = await fetch(`/api/bookings/${encodeURIComponent(id)}/cancel`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${tokenData.accessToken}` },
      });
      if (!response.ok) throw new Error(await responseMessage(response, "Could not cancel this booking."));

      setCurrentStatus("cancelled");
      setDialogOpen(false);
      toast.success("Booking cancelled.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not cancel this booking.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        {statusLabel(currentStatus || "unknown")}
      </span>
      {currentStatus === "requested" && (
        <AlertDialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button type="button" variant="destructive" size="sm" disabled={busy} onClick={() => setDialogOpen(true)}>
            Cancel
          </Button>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
            <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl">
              <AlertDialog.Title className="font-heading text-xl font-semibold">Cancel this booking?</AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                Your request for {serviceTitle || "this service"} will be cancelled.
              </AlertDialog.Description>
              <div className="mt-6 flex justify-end gap-3">
                <AlertDialog.Close render={<Button variant="outline" disabled={busy} />}>Keep Booking</AlertDialog.Close>
                <Button type="button" variant="destructive" disabled={busy} onClick={cancelBooking}>
                  {busy ? "Cancelling..." : "Cancel Booking"}
                </Button>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      )}
    </div>
  );
}
