"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export type TechnicianService = {
	_id: string;
	title: string;
	category: string;
	basePrice: number;
	image?: string;
	description?: string;
	estimatedDuration?: string;
	serviceMode?: string;
	serviceArea?: string;
	approvalStatus?: string;
	isAvailable?: boolean;
};

function price(amount: number) {
	return Number.isFinite(amount)
		? new Intl.NumberFormat("en-US", {
				style: "currency",
				currency: "USD",
			}).format(amount)
		: "—";
}

function approvalBadge(status: string | undefined) {
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

function availabilityBadge(available: boolean | undefined) {
	return (
		<span
			className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${available ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
		>
			{available ? "Available" : "Unavailable"}
		</span>
	);
}

function ServicePhoto({ service }: { service: TechnicianService }) {
	return (
		<span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-primary">
			{service.image ? (
				<Image
					src={service.image}
					alt=""
					width={56}
					height={56}
					unoptimized
					className="size-full object-cover"
				/>
			) : (
				<Wrench aria-hidden="true" className="size-6" />
			)}
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

function ServiceActions({
	service,
	onUpdate,
	onDelete,
}: {
	service: TechnicianService;
	onUpdate: (service: TechnicianService) => void;
	onDelete: (id: string) => void;
}) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	async function authorization() {
		const response = await fetch("/api/access-token", { method: "POST" });
		if (!response.ok)
			throw new Error(await apiError(response, "Please sign in again."));
		const data: { accessToken?: string } = await response.json();
		if (!data.accessToken) throw new Error("Could not verify your session.");
		return `Bearer ${data.accessToken}`;
	}

	async function changeAvailability() {
		setBusy(true);
		try {
			const response = await fetch(
				`/api/services/${service._id}/availability`,
				{
					method: "PATCH",
					headers: {
						authorization: await authorization(),
						"content-type": "application/json",
					},
					body: JSON.stringify({ isAvailable: !service.isAvailable }),
				},
			);
			if (!response.ok)
				throw new Error(
					await apiError(response, "Could not update availability."),
				);
			onUpdate(await response.json());
			toast.success("Availability updated.");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update availability.",
			);
		} finally {
			setBusy(false);
		}
	}

	async function deleteService() {
		setBusy(true);
		try {
			const response = await fetch(`/api/services/${service._id}`, {
				method: "DELETE",
				headers: { authorization: await authorization() },
			});
			if (!response.ok)
				throw new Error(
					await apiError(response, "Could not delete the service."),
				);
			setDeleteOpen(false);
			onDelete(service._id);
			toast.success("Service deleted.");
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not delete the service.",
			);
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			<Button
				render={
					<Link
						href={`/dashboard/technician/my-services/${service._id}/edit`}
					/>
				}
				nativeButton={false}
				variant="outline"
				size="sm"
			>
				Edit
			</Button>
			<button
				type="button"
				role="switch"
				aria-checked={Boolean(service.isAvailable)}
				aria-label={`Availability for ${service.title}`}
				disabled={busy}
				onClick={changeAvailability}
				className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
			>
				<span
					className={`relative h-5 w-9 rounded-full transition-colors ${service.isAvailable ? "bg-primary" : "bg-muted-foreground/40"}`}
				>
					<span
						className={`absolute top-0.5 size-4 rounded-full bg-background shadow-sm transition-transform ${service.isAvailable ? "translate-x-[18px]" : "translate-x-0.5"}`}
					/>
				</span>
				{service.isAvailable ? "Available" : "Unavailable"}
			</button>
			<AlertDialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
				<Button
					type="button"
					variant="destructive"
					size="sm"
					disabled={busy}
					onClick={() => setDeleteOpen(true)}
				>
					Delete
				</Button>
				<AlertDialog.Portal>
					<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/50" />
					<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[min(400px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl">
						<AlertDialog.Title className="font-heading text-xl font-semibold">
							Delete this service?
						</AlertDialog.Title>
						<AlertDialog.Description className="mt-2 text-sm text-muted-foreground">
							This will permanently delete {service.title}.
						</AlertDialog.Description>
						<div className="mt-6 flex justify-end gap-3">
							<AlertDialog.Close
								render={<Button variant="outline" disabled={busy} />}
							>
								Cancel
							</AlertDialog.Close>
							<Button
								type="button"
								variant="destructive"
								disabled={busy}
								onClick={deleteService}
							>
								{busy ? "Deleting..." : "Delete Service"}
							</Button>
						</div>
					</AlertDialog.Popup>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		</div>
	);
}

export function MyServicesList({
	services,
}: {
	services: TechnicianService[] | null;
}) {
	const [rows, setRows] = useState(services);
	useEffect(() => setRows(services), [services]);
	function updateService(updated: TechnicianService) {
		setRows(
			(current) =>
				current?.map((service) =>
					service._id === updated._id ? updated : service,
				) ?? null,
		);
	}
	function deleteService(id: string) {
		setRows(
			(current) => current?.filter((service) => service._id !== id) ?? null,
		);
	}
	return (
		<main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
			<div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
				<div className="[&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
					<SectionHeading label="TECHNICIAN SERVICES" level="h1">
						My Services
					</SectionHeading>
					<p className="mt-5 text-base text-muted-foreground">
						Review the status and availability of every service you have
						submitted.
					</p>
				</div>

				{rows === null ? (
					<div
						role="alert"
						className="mt-9 rounded-xl border border-border bg-card p-6 text-sm text-destructive"
					>
						Could not load your services. Please try again.
					</div>
				) : rows.length === 0 ? (
					<div className="mt-9 rounded-xl border border-border bg-card p-6 sm:p-8">
						<p className="font-heading text-lg font-semibold">
							No services yet
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Add your first repair service to send it for review.
						</p>
						<Button
							render={<Link href="/dashboard/technician/add-service" />}
							nativeButton={false}
							className="mt-5"
						>
							Add a Service
						</Button>
					</div>
				) : (
					<>
						<div className="mt-9 space-y-4 lg:hidden">
							{rows.map((service) => (
								<article
									key={service._id}
									className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
								>
									<div className="flex min-w-0 items-center gap-4">
										<ServicePhoto service={service} />
										<div className="min-w-0">
											<h2 className="truncate font-heading text-base font-semibold">
												{service.title}
											</h2>
											<p className="mt-1 text-sm text-muted-foreground">
												{service.category}
											</p>
										</div>
									</div>
									<dl className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
										<div>
											<dt className="text-muted-foreground">Base price</dt>
											<dd className="mt-1 font-medium">
												{price(service.basePrice)}
											</dd>
										</div>
										<div>
											<dt className="text-muted-foreground">Approval</dt>
											<dd className="mt-1">
												{approvalBadge(service.approvalStatus)}
											</dd>
										</div>
										<div className="col-span-2">
											<dt className="text-muted-foreground">Availability</dt>
											<dd className="mt-1">
												{availabilityBadge(service.isAvailable)}
											</dd>
										</div>
									</dl>
									<div className="mt-4 border-t border-border pt-4">
										<ServiceActions
											service={service}
											onUpdate={updateService}
											onDelete={deleteService}
										/>
									</div>
								</article>
							))}
						</div>

						<div className="mt-9 hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
							<table className="w-full text-left text-sm text-card-foreground">
								<thead className="border-b border-border bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									<tr>
										<th scope="col" className="px-5 py-4">
											Service
										</th>
										<th scope="col" className="px-5 py-4">
											Category
										</th>
										<th scope="col" className="px-5 py-4">
											Base price
										</th>
										<th scope="col" className="px-5 py-4">
											Approval
										</th>
										<th scope="col" className="px-5 py-4">
											Availability
										</th>
										<th scope="col" className="px-5 py-4">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{rows.map((service) => (
										<tr key={service._id}>
											<td className="px-5 py-4">
												<div className="flex min-w-0 items-center gap-3">
													<ServicePhoto service={service} />
													<span className="min-w-0 font-medium">
														{service.title}
													</span>
												</div>
											</td>
											<td className="px-5 py-4 text-muted-foreground">
												{service.category}
											</td>
											<td className="px-5 py-4 font-medium">
												{price(service.basePrice)}
											</td>
											<td className="px-5 py-4">
												{approvalBadge(service.approvalStatus)}
											</td>
											<td className="px-5 py-4">
												{availabilityBadge(service.isAvailable)}
											</td>
											<td className="px-5 py-4">
												<ServiceActions
													service={service}
													onUpdate={updateService}
													onDelete={deleteService}
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
