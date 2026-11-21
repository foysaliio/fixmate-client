import { Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";

export type TechnicianService = {
	_id: string;
	title: string;
	category: string;
	basePrice: number;
	image?: string;
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

export function MyServicesList({
	services,
}: {
	services: TechnicianService[] | null;
}) {
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

				{services === null ? (
					<div
						role="alert"
						className="mt-9 rounded-xl border border-border bg-card p-6 text-sm text-destructive"
					>
						Could not load your services. Please try again.
					</div>
				) : services.length === 0 ? (
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
							{services.map((service) => (
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
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{services.map((service) => (
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
