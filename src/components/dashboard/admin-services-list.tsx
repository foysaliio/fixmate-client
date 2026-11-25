"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export type ApprovalFilter = "pending" | "approved" | "rejected" | "all";
export type AdminService = {
	_id: string;
	title: string;
	technicianName?: string;
	technicianEmail?: string;
	category: string;
	basePrice: number;
	approvalStatus: string;
};

const filters: { value: ApprovalFilter; label: string }[] = [
	{ value: "pending", label: "Pending" },
	{ value: "approved", label: "Approved" },
	{ value: "rejected", label: "Rejected" },
	{ value: "all", label: "All" },
];

function price(amount: number) {
	return Number.isFinite(amount)
		? new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount)
		: "—";
}

function statusBadge(status: string) {
	const label = status ? status[0].toUpperCase() + status.slice(1) : "Unknown";
	const color =
		status === "approved"
			? "bg-accent text-accent-foreground"
			: status === "rejected"
				? "bg-destructive/10 text-destructive"
				: "bg-secondary text-secondary-foreground";
	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${color}`}
		>
			{label}
		</span>
	);
}

async function apiError(response: Response, fallback: string) {
	const data: unknown = await response.json().catch(() => null);
	return data &&
		typeof data === "object" &&
		"message" in data &&
		typeof data.message === "string"
		? data.message
		: fallback;
}

function ReviewActions({
	service,
	onReviewed,
}: {
	service: AdminService;
	onReviewed: (service: AdminService) => void;
}) {
	const [busy, setBusy] = useState(false);
	async function review(approvalStatus: "approved" | "rejected") {
		setBusy(true);
		try {
			const tokenResponse = await fetch("/api/access-token", {
				method: "POST",
			});
			if (!tokenResponse.ok)
				throw new Error(await apiError(tokenResponse, "Please sign in again."));
			const tokenData: { accessToken?: string } = await tokenResponse.json();
			if (!tokenData.accessToken)
				throw new Error("Could not verify your session.");

			const response = await fetch(
				`/api/admin/services/${service._id}/approval`,
				{
					method: "PATCH",
					headers: {
						authorization: `Bearer ${tokenData.accessToken}`,
						"content-type": "application/json",
					},
					body: JSON.stringify({ approvalStatus }),
				},
			);
			if (!response.ok)
				throw new Error(
					await apiError(response, "Could not review the service."),
				);
			onReviewed(await response.json());
			toast.success(
				approvalStatus === "approved"
					? "Service approved."
					: "Service rejected.",
			);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not review the service.",
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex flex-wrap gap-2">
			<Button
				type="button"
				size="sm"
				disabled={busy || service.approvalStatus === "approved"}
				onClick={() => review("approved")}
			>
				Approve
			</Button>
			<Button
				type="button"
				size="sm"
				variant="destructive"
				disabled={busy || service.approvalStatus === "rejected"}
				onClick={() => review("rejected")}
			>
				Reject
			</Button>
		</div>
	);
}

export function AdminServicesList({
	services,
	status,
}: {
	services: AdminService[] | null;
	status: ApprovalFilter;
}) {
	const router = useRouter();
	const [rows, setRows] = useState(services);
	useEffect(() => setRows(services), [services]);

	function reviewed(updated: AdminService) {
		setRows(
			(current) =>
				current?.flatMap((service) => {
					if (service._id !== updated._id) return [service];
					return status === "all" || status === updated.approvalStatus
						? [updated]
						: [];
				}) ?? null,
		);
		router.refresh();
	}

	return (
		<main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
			<div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
				<div className="[&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
					<SectionHeading label="ADMIN REVIEW" level="h1">
						Service Approval
					</SectionHeading>
					<p className="mt-5 text-base text-muted-foreground">
						Review technician services before they appear publicly.
					</p>
				</div>

				<nav aria-label="Approval status" className="mt-9 flex flex-wrap gap-2">
					{filters.map((filter) => (
						<Button
							key={filter.value}
							render={
								<Link
									href={
										filter.value === "pending"
											? "/dashboard/admin/services"
											: `/dashboard/admin/services?status=${filter.value}`
									}
								/>
							}
							nativeButton={false}
							variant={status === filter.value ? "secondary" : "outline"}
							aria-current={status === filter.value ? "page" : undefined}
						>
							{filter.label}
						</Button>
					))}
				</nav>

				{rows === null ? (
					<div
						role="alert"
						className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-destructive"
					>
						Could not load services. Please try again.
					</div>
				) : rows.length === 0 ? (
					<div className="mt-6 rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
						No {status === "all" ? "services" : `${status} services`} to review.
					</div>
				) : (
					<>
						<div className="mt-6 space-y-4 lg:hidden">
							{rows.map((service) => (
								<article
									key={service._id}
									className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
								>
									<h2 className="font-heading text-base font-semibold">
										{service.title}
									</h2>
									<p className="mt-1 text-sm text-muted-foreground">
										{service.technicianName ||
											service.technicianEmail ||
											"Unknown technician"}
									</p>
									<dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
										<div>
											<dt className="text-muted-foreground">Category</dt>
											<dd className="mt-1 font-medium">{service.category}</dd>
										</div>
										<div>
											<dt className="text-muted-foreground">Base price</dt>
											<dd className="mt-1 font-medium">
												{price(service.basePrice)}
											</dd>
										</div>
										<div className="col-span-2">
											<dt className="text-muted-foreground">Status</dt>
											<dd className="mt-1">
												{statusBadge(service.approvalStatus)}
											</dd>
										</div>
									</dl>
									<div className="mt-4 border-t border-border pt-4">
										<ReviewActions service={service} onReviewed={reviewed} />
									</div>
								</article>
							))}
						</div>
						<div className="mt-6 hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
							<table className="w-full text-left text-sm text-card-foreground">
								<thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									<tr>
										<th scope="col" className="px-5 py-4">
											Service
										</th>
										<th scope="col" className="px-5 py-4">
											Technician
										</th>
										<th scope="col" className="px-5 py-4">
											Category
										</th>
										<th scope="col" className="px-5 py-4">
											Base price
										</th>
										<th scope="col" className="px-5 py-4">
											Status
										</th>
										<th scope="col" className="px-5 py-4">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{rows.map((service) => (
										<tr key={service._id}>
											<td className="px-5 py-4 font-medium">{service.title}</td>
											<td className="px-5 py-4 text-muted-foreground">
												{service.technicianName ||
													service.technicianEmail ||
													"Unknown technician"}
											</td>
											<td className="px-5 py-4 text-muted-foreground">
												{service.category}
											</td>
											<td className="px-5 py-4 font-medium">
												{price(service.basePrice)}
											</td>
											<td className="px-5 py-4">
												{statusBadge(service.approvalStatus)}
											</td>
											<td className="px-5 py-4">
												<ReviewActions
													service={service}
													onReviewed={reviewed}
												/>
											</td>
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
