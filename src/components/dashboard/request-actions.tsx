"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RequestStatus = "requested" | "accepted" | "in-progress" | "completed" | "rejected" | "cancelled";
type NextStatus = "accepted" | "rejected" | "in-progress" | "completed";
type BookingSummary = {
  _id: string;
  serviceTitle?: string;
  status?: string;
  paymentStatus?: string;
  basePrice?: number;
};

function label(value: string | undefined) {
  if (!value) return "Unknown";
  return value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function canChange(current: string | undefined, next: NextStatus) {
  return (current === "requested" && (next === "accepted" || next === "rejected")) ||
    (current === "accepted" && next === "in-progress") ||
    (current === "in-progress" && next === "completed");
}

async function responseMessage(response: Response, fallback: string) {
  const data: unknown = await response.json().catch(() => null);
  return data && typeof data === "object" && "message" in data && typeof data.message === "string"
    ? data.message
    : fallback;
}

export function RequestActions({ booking }: { booking: BookingSummary }) {
  const router = useRouter();
  const amountId = useId();
  const [currentStatus, setCurrentStatus] = useState(booking.status);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setCurrentStatus(booking.status), [booking.status]);

  async function changeStatus(nextStatus: NextStatus, amount?: number) {
    if (busy || !canChange(currentStatus, nextStatus)) return;
    setBusy(true);
    try {
      const tokenResponse = await fetch("/api/access-token", { method: "POST" });
      if (!tokenResponse.ok) throw new Error(await responseMessage(tokenResponse, "Please sign in again."));
      const tokenData: { accessToken?: string } = await tokenResponse.json();
      if (!tokenData.accessToken) throw new Error("Could not verify your session.");

      const response = await fetch(`/api/bookings/${encodeURIComponent(booking._id)}/status`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${tokenData.accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(nextStatus === "completed"
          ? { status: nextStatus, finalAmount: amount }
          : { status: nextStatus }),
      });
      if (!response.ok) throw new Error(await responseMessage(response, "Could not update the request."));
      const updated: { status?: RequestStatus } = await response.json();

      setCurrentStatus(updated.status ?? nextStatus);
      setRejectOpen(false);
      setCompleteOpen(false);
      toast.success(nextStatus === "accepted" ? "Request accepted."
        : nextStatus === "rejected" ? "Request rejected."
          : nextStatus === "in-progress" ? "Work started."
            : "Repair marked completed.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the request.");
    } finally {
      setBusy(false);
    }
  }

  async function completeBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(finalAmount);
    if (!finalAmount.trim() || !Number.isFinite(amount) || amount <= 0) {
      setAmountError("Enter a final amount greater than 0.");
      return;
    }
    setAmountError("");
    await changeStatus("completed", amount);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        {label(currentStatus)}
      </span>

      {currentStatus === "requested" && (
        <>
          <Button type="button" size="sm" disabled={busy} onClick={() => changeStatus("accepted")}>Accept</Button>
          <AlertDialog.Root open={rejectOpen} onOpenChange={setRejectOpen}>
            <Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => setRejectOpen(true)}>Reject</Button>
            <AlertDialog.Portal>
              <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
              <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl">
                <AlertDialog.Title className="font-heading text-xl font-semibold">Reject this request?</AlertDialog.Title>
                <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                  The customer&apos;s request for {booking.serviceTitle || "this service"} will be rejected.
                </AlertDialog.Description>
                <div className="mt-6 flex justify-end gap-3">
                  <AlertDialog.Close render={<Button type="button" variant="outline" disabled={busy} />}>Keep Request</AlertDialog.Close>
                  <Button type="button" variant="destructive" disabled={busy} onClick={() => changeStatus("rejected")}>
                    {busy ? "Rejecting..." : "Reject Request"}
                  </Button>
                </div>
              </AlertDialog.Popup>
            </AlertDialog.Portal>
          </AlertDialog.Root>
        </>
      )}

      {currentStatus === "accepted" && (
        <Button type="button" size="sm" disabled={busy} onClick={() => changeStatus("in-progress")}>
          {busy ? "Starting..." : "Start Work"}
        </Button>
      )}

      {currentStatus === "in-progress" && (
        <AlertDialog.Root open={completeOpen} onOpenChange={setCompleteOpen}>
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => {
              setFinalAmount(typeof booking.basePrice === "number" && Number.isFinite(booking.basePrice)
                ? String(booking.basePrice) : "");
              setAmountError("");
              setCompleteOpen(true);
            }}
          >
            Mark Completed
          </Button>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
            <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl">
              <AlertDialog.Title className="font-heading text-xl font-semibold">Complete this repair?</AlertDialog.Title>
              <AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
                Confirm the final amount for {booking.serviceTitle || "this service"}.
              </AlertDialog.Description>
              <form onSubmit={completeBooking} className="mt-5">
                <label htmlFor={amountId} className="mb-2 block text-sm font-medium">Final Amount (BDT)</label>
                <Input
                  id={amountId}
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={finalAmount}
                  onChange={(event) => {
                    setFinalAmount(event.target.value);
                    setAmountError("");
                  }}
                  aria-invalid={Boolean(amountError)}
                  aria-describedby={amountError ? `${amountId}-error` : undefined}
                  disabled={busy}
                />
                {amountError && <p id={`${amountId}-error`} role="alert" className="mt-2 text-sm text-destructive">{amountError}</p>}
                <div className="mt-6 flex justify-end gap-3">
                  <AlertDialog.Close render={<Button type="button" variant="outline" disabled={busy} />}>Keep Working</AlertDialog.Close>
                  <Button type="submit" disabled={busy}>{busy ? "Completing..." : "Complete Repair"}</Button>
                </div>
              </form>
            </AlertDialog.Popup>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      )}

      {currentStatus === "completed" && (
        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Payment: {label(booking.paymentStatus)}
        </span>
      )}
    </div>
  );
}
