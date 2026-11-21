"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { authClient } from "@/lib/auth-client";

type ProfileUser = {
	id: string;
	name: string;
	email: string;
	role?: string;
	phone?: string | null;
	area?: string | null;
	bio?: string | null;
	image?: string | null;
};

type SavedProfile = {
	name: string;
	phone: string;
	area: string;
	bio: string;
	image: string | null;
};

const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageBytes = 5 * 1024 * 1024;

function roleLabel(role: string | undefined) {
	if (role === "technician") return "Technician";
	if (role === "admin") return "Admin";
	return "Customer";
}

async function apiError(response: Response, fallback: string) {
	const body: unknown = await response.json().catch(() => null);
	return body &&
		typeof body === "object" &&
		"message" in body &&
		typeof body.message === "string"
		? body.message
		: fallback;
}

export function ProfileForm({ user }: { user: ProfileUser }) {
	const router = useRouter();
	const { refetch } = authClient.useSession();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [name, setName] = useState(user.name ?? "");
	const [phone, setPhone] = useState(user.phone ?? "");
	const [area, setArea] = useState(user.area ?? "");
	const [bio, setBio] = useState(user.bio ?? "");
	const [image, setImage] = useState(user.image ?? null);
	const [file, setFile] = useState<File | null>(null);
	const [formError, setFormError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const initials = (name.trim() || user.email)
		.split(/\s+/)
		.map((part) => part[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setFormError("");

		if (!name.trim()) {
			setFormError("Enter your name.");
			return;
		}
		if (
			file &&
			(!acceptedImageTypes.has(file.type) || file.size > maxImageBytes)
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

			let imageUrl = image;
			if (file) {
				const form = new FormData();
				form.append("image", file);
				const uploadResponse = await fetch("/api/uploads/image", {
					method: "POST",
					headers: { authorization },
					body: form,
				});
				if (!uploadResponse.ok)
					throw new Error(
						await apiError(uploadResponse, "Could not upload your image."),
					);
				const uploaded: { url?: string } = await uploadResponse.json();
				if (!uploaded.url) throw new Error("Could not upload your image.");
				imageUrl = uploaded.url;
			}

			const profileResponse = await fetch("/api/users/profile", {
				method: "PATCH",
				headers: { authorization, "content-type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					phone: phone.trim(),
					area: area.trim(),
					bio: bio.trim(),
					...(file ? { image: imageUrl } : {}),
				}),
			});
			if (!profileResponse.ok)
				throw new Error(
					await apiError(profileResponse, "Could not save your profile."),
				);

			const saved: SavedProfile = await profileResponse.json();
			setName(saved.name);
			setPhone(saved.phone);
			setArea(saved.area);
			setBio(saved.bio);
			setImage(saved.image);
			setFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			await refetch();
			router.refresh();
			toast.success("Profile updated successfully.");
		} catch (error) {
			setFormError(
				error instanceof Error ? error.message : "Could not save your profile.",
			);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="bg-background py-12 text-foreground sm:py-16 lg:py-20">
			<div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
				<div className="max-w-3xl [&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
					<SectionHeading label="YOUR ACCOUNT" level="h1">
						Update Profile
					</SectionHeading>
					<p className="mt-5 text-base text-muted-foreground">
						Keep your contact details and profile photo up to date.
					</p>

					<form
						onSubmit={handleSubmit}
						className="mt-9 space-y-6 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-8"
					>
						<div className="flex items-center gap-4">
							<span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-heading text-xl font-bold text-secondary-foreground">
								{image ? (
									<Image
										src={image}
										alt="Profile"
										width={80}
										height={80}
										unoptimized
										className="size-full object-cover"
									/>
								) : (
									initials
								)}
							</span>
							<div className="min-w-0 flex-1">
								<label
									htmlFor="profile-image"
									className="mb-2 block text-sm font-medium"
								>
									Profile photo
								</label>
								<Input
									ref={fileInputRef}
									id="profile-image"
									name="image"
									type="file"
									accept="image/jpeg,image/png,image/webp"
									disabled={isSubmitting}
									onChange={(event) => setFile(event.target.files?.[0] ?? null)}
									className="h-auto min-h-11 py-2 text-sm"
								/>
								<p className="mt-1.5 text-xs text-muted-foreground">
									JPEG, PNG or WebP, up to 5 MB.
								</p>
							</div>
						</div>

						<div className="grid gap-5 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<label
									htmlFor="profile-name"
									className="mb-2 block text-sm font-medium"
								>
									Full Name
								</label>
								<Input
									id="profile-name"
									name="name"
									autoComplete="name"
									value={name}
									onChange={(event) => setName(event.target.value)}
									disabled={isSubmitting}
									required
								/>
							</div>
							<div>
								<label
									htmlFor="profile-email"
									className="mb-2 block text-sm font-medium"
								>
									Email
								</label>
								<Input
									id="profile-email"
									type="email"
									value={user.email}
									readOnly
									aria-readonly="true"
								/>
							</div>
							<div>
								<label
									htmlFor="profile-role"
									className="mb-2 block text-sm font-medium"
								>
									Role
								</label>
								<Input
									id="profile-role"
									value={roleLabel(user.role)}
									readOnly
									aria-readonly="true"
								/>
							</div>
							<div>
								<label
									htmlFor="profile-phone"
									className="mb-2 block text-sm font-medium"
								>
									Phone
								</label>
								<Input
									id="profile-phone"
									name="phone"
									type="tel"
									autoComplete="tel"
									value={phone}
									onChange={(event) => setPhone(event.target.value)}
									disabled={isSubmitting}
								/>
							</div>
							<div>
								<label
									htmlFor="profile-area"
									className="mb-2 block text-sm font-medium"
								>
									Area
								</label>
								<Input
									id="profile-area"
									name="area"
									value={area}
									onChange={(event) => setArea(event.target.value)}
									disabled={isSubmitting}
								/>
							</div>
							<div className="sm:col-span-2">
								<label
									htmlFor="profile-bio"
									className="mb-2 block text-sm font-medium"
								>
									Bio
								</label>
								<textarea
									id="profile-bio"
									name="bio"
									rows={4}
									value={bio}
									onChange={(event) => setBio(event.target.value)}
									disabled={isSubmitting}
									className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
								/>
							</div>
						</div>

						{formError && (
							<p role="alert" className="text-sm text-destructive">
								{formError}
							</p>
						)}
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving profile..." : "Save Changes"}
						</Button>
					</form>
				</div>
			</div>
		</main>
	);
}
