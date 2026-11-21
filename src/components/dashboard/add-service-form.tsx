"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";

const categories = [
	"Smartphone",
	"Laptop & PC",
	"AC",
	"Refrigerator",
	"TV",
	"Washing Machine",
	"Electrical",
];
const serviceModes = ["Home Visit", "Workshop"];
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;
const selectClassName =
	"h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
const textareaClassName =
	"w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

async function apiError(response: Response, fallback: string) {
	const body: unknown = await response.json().catch(() => null);
	return body &&
		typeof body === "object" &&
		"message" in body &&
		typeof body.message === "string"
		? body.message
		: fallback;
}

export function AddServiceForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formError, setFormError] = useState("");

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");
		const form = event.currentTarget;
		const data = new FormData(form);
		const title = String(data.get("title") || "").trim();
		const description = String(data.get("description") || "").trim();
		const category = String(data.get("category") || "");
		const estimatedDuration = String(
			data.get("estimatedDuration") || "",
		).trim();
		const serviceMode = String(data.get("serviceMode") || "");
		const serviceArea = String(data.get("serviceArea") || "").trim();
		const basePrice = Number(data.get("basePrice"));
		const image = data.get("image");

		if (
			!title ||
			!description ||
			!category ||
			!estimatedDuration ||
			!serviceMode ||
			!serviceArea
		) {
			setFormError("Complete all service details.");
			return;
		}
		if (!Number.isFinite(basePrice) || basePrice <= 0) {
			setFormError("Enter a base price greater than 0.");
			return;
		}
		if (
			!(image instanceof File) ||
			!image.size ||
			!acceptedImageTypes.has(image.type) ||
			image.size > maxImageBytes
		) {
			setFormError("Choose a JPEG, PNG or WebP image up to 5 MB.");
			return;
		}

		setIsSubmitting(true);
		try {
			const tokenResponse = await fetch("/api/access-token", {
				method: "POST",
			});
			if (!tokenResponse.ok)
				throw new Error(await apiError(tokenResponse, "Please sign in again."));
			const tokenData: { accessToken?: string } = await tokenResponse.json();
			if (!tokenData.accessToken)
				throw new Error("Could not verify your session.");
			const authorization = `Bearer ${tokenData.accessToken}`;

			const uploadForm = new FormData();
			uploadForm.append("image", image);
			const uploadResponse = await fetch("/api/uploads/image", {
				method: "POST",
				headers: { authorization },
				body: uploadForm,
			});
			if (!uploadResponse.ok)
				throw new Error(
					await apiError(uploadResponse, "Could not upload the image."),
				);
			const uploaded: { url?: string } = await uploadResponse.json();
			if (!uploaded.url) throw new Error("Could not upload the image.");

			const serviceResponse = await fetch("/api/services", {
				method: "POST",
				headers: { authorization, "content-type": "application/json" },
				body: JSON.stringify({
					title,
					description,
					category,
					basePrice,
					estimatedDuration,
					serviceMode,
					serviceArea,
					image: uploaded.url,
				}),
			});
			if (!serviceResponse.ok)
				throw new Error(
					await apiError(serviceResponse, "Could not submit the service."),
				);

			form.reset();
			toast.success("Service submitted for review");
		} catch (error) {
			setFormError(
				error instanceof Error
					? error.message
					: "Could not submit the service.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
			<div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
				<div className="max-w-3xl [&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
					<SectionHeading label="TECHNICIAN SERVICES" level="h1">
						Add a Service
					</SectionHeading>
					<p className="mt-5 text-base text-muted-foreground">
						Share your repair service for review before it appears publicly.
					</p>

					<form
						onSubmit={handleSubmit}
						className="mt-9 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-8"
					>
						<fieldset disabled={isSubmitting} className="space-y-5">
							<div>
								<label
									htmlFor="service-title"
									className="mb-2 block text-sm font-medium"
								>
									Title
								</label>
								<Input
									id="service-title"
									name="title"
									required
									maxLength={160}
									placeholder="e.g. AC cooling repair"
								/>
							</div>
							<div>
								<label
									htmlFor="service-description"
									className="mb-2 block text-sm font-medium"
								>
									Description
								</label>
								<textarea
									id="service-description"
									name="description"
									required
									rows={5}
									className={textareaClassName}
									placeholder="Describe what your service covers"
								/>
							</div>
							<div className="grid gap-5 sm:grid-cols-2">
								<div>
									<label
										htmlFor="service-category"
										className="mb-2 block text-sm font-medium"
									>
										Category
									</label>
									<select
										id="service-category"
										name="category"
										required
										defaultValue=""
										className={selectClassName}
									>
										<option value="" disabled>
											Select a category
										</option>
										{categories.map((category) => (
											<option key={category} value={category}>
												{category}
											</option>
										))}
									</select>
								</div>
								<div>
									<label
										htmlFor="service-price"
										className="mb-2 block text-sm font-medium"
									>
										Base Price (USD)
									</label>
									<Input
										id="service-price"
										name="basePrice"
										type="number"
										min="0.01"
										step="0.01"
										inputMode="decimal"
										required
										placeholder="0.00"
									/>
								</div>
								<div>
									<label
										htmlFor="service-duration"
										className="mb-2 block text-sm font-medium"
									>
										Estimated Duration
									</label>
									<Input
										id="service-duration"
										name="estimatedDuration"
										required
										placeholder="e.g. 2 hours"
									/>
								</div>
								<div>
									<label
										htmlFor="service-mode"
										className="mb-2 block text-sm font-medium"
									>
										Service Mode
									</label>
									<select
										id="service-mode"
										name="serviceMode"
										required
										defaultValue=""
										className={selectClassName}
									>
										<option value="" disabled>
											Select a mode
										</option>
										{serviceModes.map((mode) => (
											<option key={mode} value={mode}>
												{mode}
											</option>
										))}
									</select>
								</div>
								<div className="sm:col-span-2">
									<label
										htmlFor="service-area"
										className="mb-2 block text-sm font-medium"
									>
										Service Area
									</label>
									<Input
										id="service-area"
										name="serviceArea"
										required
										placeholder="e.g. Dhaka"
									/>
								</div>
							</div>
							<div>
								<label
									htmlFor="service-image"
									className="mb-2 block text-sm font-medium"
								>
									Service Image
								</label>
								<Input
									id="service-image"
									name="image"
									type="file"
									accept="image/jpeg,image/png,image/webp"
									required
									className="h-auto min-h-11 py-2 text-sm"
								/>
								<p className="mt-1.5 text-xs text-muted-foreground">
									JPEG, PNG or WebP, up to 5 MB.
								</p>
							</div>
							{formError && (
								<p role="alert" className="text-sm text-destructive">
									{formError}
								</p>
							)}
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Submitting service..." : "Submit Service"}
							</Button>
						</fieldset>
					</form>
				</div>
			</div>
		</main>
	);
}
