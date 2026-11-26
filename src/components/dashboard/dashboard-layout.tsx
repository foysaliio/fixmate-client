"use client";

import {
	ChevronDown,
	House,
	LayoutDashboard,
	ClipboardList,
	ListChecks,
	LogOut,
	Menu,
	ReceiptText,
	SquarePlus,
	UserRound,
	UsersRound,
	Wrench,
	X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { dashboardPathForRole } from "@/lib/auth-roles";

type DashboardUser = {
	name: string;
	email: string;
	role?: string;
	image?: string | null;
};

function initialsFor(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length > 1)
		return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
	return (parts[0] || "FM").slice(0, 2).toUpperCase();
}

function roleLabel(role: string | undefined) {
	if (role === "technician") return "Technician";
	if (role === "admin") return "Admin";
	return "Customer";
}

export function DashboardLayout({
	children,
	user,
}: {
	children: ReactNode;
	user: DashboardUser;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const [menuOpen, setMenuOpen] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);
	const [signingOut, setSigningOut] = useState(false);
	const profileRef = useRef<HTMLDivElement>(null);
	const overviewHref = dashboardPathForRole(user.role);
	const displayName = user.name?.trim() || user.email || "FixMate User";

	useEffect(() => {
		if (!menuOpen && !profileOpen) return;

		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				if (profileOpen)
					profileRef.current
						?.querySelector<HTMLButtonElement>("[data-profile-trigger]")
						?.focus();
				setMenuOpen(false);
				setProfileOpen(false);
			}
		}
		function closeProfileOnOutsideClick(event: PointerEvent) {
			if (profileOpen && !profileRef.current?.contains(event.target as Node))
				setProfileOpen(false);
		}
		document.addEventListener("keydown", closeOnEscape);
		document.addEventListener("pointerdown", closeProfileOnOutsideClick);
		return () => {
			document.removeEventListener("keydown", closeOnEscape);
			document.removeEventListener("pointerdown", closeProfileOnOutsideClick);
		};
	}, [menuOpen, profileOpen]);

	async function signOut() {
		if (signingOut) return;
		setSigningOut(true);
		try {
			const result = await authClient.signOut();
			if (result.error) throw new Error(result.error.message);
			setProfileOpen(false);
			toast.success("Signed out successfully.");
			router.replace("/");
			router.refresh();
		} catch {
			toast.error("Could not sign out. Please try again.");
			setSigningOut(false);
		}
	}

	const sidebarContent = (mobile: boolean) => (
		<>
			<div className="flex h-[4.5rem] items-center justify-between px-5">
				<Link
					href="/"
					onClick={() => setMenuOpen(false)}
					className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight"
				>
					<span className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary text-primary">
						<Wrench aria-hidden="true" className="size-5" strokeWidth={1.8} />
					</span>
					FixMate
				</Link>
				{mobile && (
					<Button
						type="button"
						variant="ghost"
						size="icon-lg"
						aria-label="Close dashboard menu"
						onClick={() => setMenuOpen(false)}
					>
						<X aria-hidden="true" className="size-5" />
					</Button>
				)}
			</div>

			<nav
				aria-label="Dashboard navigation"
				className="flex flex-col gap-1 p-4"
			>
				<p className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
					Your workspace
				</p>
				<Link
					href={overviewHref}
					onClick={() => setMenuOpen(false)}
					aria-current={pathname === overviewHref ? "page" : undefined}
					className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === overviewHref ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
				>
					<LayoutDashboard aria-hidden="true" className="size-5" />
					Overview
				</Link>
				{user.role === "customer" && (
					<>
						<Link
							href="/dashboard/customer/bookings"
							onClick={() => setMenuOpen(false)}
							aria-current={pathname === "/dashboard/customer/bookings" ? "page" : undefined}
							className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/customer/bookings" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
						>
							<ClipboardList aria-hidden="true" className="size-5" />
							My Bookings
						</Link>
						<Link
							href="/dashboard/customer/payments"
							onClick={() => setMenuOpen(false)}
							aria-current={pathname === "/dashboard/customer/payments" ? "page" : undefined}
							className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/customer/payments" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
						>
							<ReceiptText aria-hidden="true" className="size-5" />
							Payment History
						</Link>
					</>
				)}
				{user.role === "technician" && (
					<>
						<Link
							href="/dashboard/technician/add-service"
							onClick={() => setMenuOpen(false)}
							aria-current={
								pathname === "/dashboard/technician/add-service"
									? "page"
									: undefined
							}
							className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/technician/add-service" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
						>
							<SquarePlus aria-hidden="true" className="size-5" />
							Add a Service
						</Link>
						<Link
							href="/dashboard/technician/my-services"
							onClick={() => setMenuOpen(false)}
							aria-current={
								pathname === "/dashboard/technician/my-services"
									? "page"
									: undefined
							}
							className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/technician/my-services" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
						>
							<ListChecks aria-hidden="true" className="size-5" />
							My Services
						</Link>
						<Link
							href="/dashboard/technician/requests"
							onClick={() => setMenuOpen(false)}
							aria-current={pathname === "/dashboard/technician/requests" ? "page" : undefined}
							className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/technician/requests" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
						>
							<ClipboardList aria-hidden="true" className="size-5" />
							Manage Requests
						</Link>
					</>
				)}
				{user.role === "admin" && (
					<>
						<Link
							href="/dashboard/admin/users"
							onClick={() => setMenuOpen(false)}
							aria-current={pathname === "/dashboard/admin/users" ? "page" : undefined}
							className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/admin/users" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
						>
							<UsersRound aria-hidden="true" className="size-5" />
							Users
						</Link>
						<Link
							href="/dashboard/admin/services"
							onClick={() => setMenuOpen(false)}
							aria-current={pathname === "/dashboard/admin/services" ? "page" : undefined}
							className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/admin/services" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
						>
							<ListChecks aria-hidden="true" className="size-5" />
							Service Approval
						</Link>
					</>
				)}
				<Link
					href="/dashboard/profile"
					onClick={() => setMenuOpen(false)}
					aria-current={pathname === "/dashboard/profile" ? "page" : undefined}
					className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${pathname === "/dashboard/profile" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
				>
					<UserRound aria-hidden="true" className="size-5" />
					Update Profile
				</Link>
				<Link
					href="/"
					onClick={() => setMenuOpen(false)}
					className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<House aria-hidden="true" className="size-5" />
					Home
				</Link>
			</nav>
		</>
	);

	return (
		<div className="flex min-h-screen bg-background text-foreground">
			<aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-muted/50 text-foreground lg:flex">
				{sidebarContent(false)}
			</aside>

			<div className="min-w-0 flex-1">
				<header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm">
					<div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center gap-3 px-5 sm:px-8">
						<Button
							type="button"
							variant="outline"
							size="icon-lg"
							aria-label="Open dashboard menu"
							aria-expanded={menuOpen}
							aria-controls={menuOpen ? "mobile-dashboard-menu" : undefined}
							onClick={() => setMenuOpen(true)}
							className="lg:hidden"
						>
							<Menu aria-hidden="true" className="size-5" />
						</Button>
						<span className="hidden font-heading text-lg font-semibold lg:block">
							Dashboard
						</span>

						<div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
							<ThemeToggle />
							<div ref={profileRef} className="relative">
								<Button
									type="button"
									variant="bare"
									data-profile-trigger
									aria-label={`Account menu for ${displayName}`}
									aria-expanded={profileOpen}
									aria-controls="dashboard-profile-menu"
									onClick={() => {
										setMenuOpen(false);
										setProfileOpen((open) => !open);
									}}
									className="h-11 gap-1.5 rounded-full px-1.5 hover:bg-muted"
								>
									<span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-heading text-sm font-bold text-secondary-foreground">
										{user.image ? (
											<Image
												src={user.image}
												alt=""
												width={36}
												height={36}
												unoptimized
												className="size-full object-cover"
											/>
										) : (
											initialsFor(displayName)
										)}
									</span>
									<ChevronDown
										aria-hidden="true"
										className="size-4 text-muted-foreground"
									/>
								</Button>
								{profileOpen && (
									<div
										id="dashboard-profile-menu"
										className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-border bg-card p-2 text-card-foreground shadow-lg"
									>
										<div className="border-b border-border px-3 py-2.5">
											<p className="truncate text-sm font-semibold">
												{displayName}
											</p>
											<p className="text-xs text-muted-foreground">
												{roleLabel(user.role)}
											</p>
										</div>
										<Link
											href="/dashboard/profile"
											onClick={() => setProfileOpen(false)}
											className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<UserRound aria-hidden="true" className="size-4" />
											Update Profile
										</Link>
										<button
											type="button"
											disabled={signingOut}
											onClick={signOut}
											className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
										>
											<LogOut aria-hidden="true" className="size-4" />
											{signingOut ? "Signing out…" : "Sign Out"}
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</header>

				{children}
			</div>

			{menuOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<button
						type="button"
						aria-label="Close dashboard menu"
						onClick={() => setMenuOpen(false)}
						className="absolute inset-0 bg-foreground/40"
					/>
					<aside
						id="mobile-dashboard-menu"
						className="relative flex h-full w-72 max-w-[85vw] flex-col bg-muted/50 text-foreground shadow-xl"
					>
						{sidebarContent(true)}
					</aside>
				</div>
			)}
		</div>
	);
}
