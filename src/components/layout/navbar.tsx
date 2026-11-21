"use client";

import {
	LayoutDashboard,
	LogOut,
	Menu,
	UserRound,
	Wrench,
	X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const mainLinks = [
	{ href: "/", label: "Home" },
	{ href: "/services", label: "Services" },
	{ href: "/about", label: "How It Works" },
];

function isActive(pathname: string, href: string) {
	return href === "/"
		? pathname === "/"
		: pathname === href || pathname.startsWith(`${href}/`);
}

const linkBase =
	"rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

export function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const reducedMotion = useReducedMotion();
	const { data: session, isPending, refetch } = authClient.useSession();
	const user = session?.user as
		| (NonNullable<typeof session>["user"] & {
				role?: string;
				image?: string | null;
		  })
		| undefined;
	const [menuOpen, setMenuOpen] = useState(false);
	const [accountOpen, setAccountOpen] = useState(false);
	const [signingOut, setSigningOut] = useState(false);
	const desktopAccountRef = useRef<HTMLDivElement>(null);
	const mobileAccountRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!menuOpen && !accountOpen) return;

		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setMenuOpen(false);
				setAccountOpen(false);
				if (accountOpen) {
					const account = window.matchMedia("(min-width: 64rem)").matches
						? desktopAccountRef
						: mobileAccountRef;
					account.current
						?.querySelector<HTMLButtonElement>("[data-account-trigger]")
						?.focus();
				} else {
					document
						.querySelector<HTMLButtonElement>("[data-menu-trigger]")
						?.focus();
				}
			}
		};

		const closeAccountOnOutsideClick = (event: PointerEvent) => {
			if (
				accountOpen &&
				!desktopAccountRef.current?.contains(event.target as Node) &&
				!mobileAccountRef.current?.contains(event.target as Node)
			)
				setAccountOpen(false);
		};

		document.addEventListener("keydown", closeOnEscape);
		document.addEventListener("pointerdown", closeAccountOnOutsideClick);
		return () => {
			document.removeEventListener("keydown", closeOnEscape);
			document.removeEventListener("pointerdown", closeAccountOnOutsideClick);
		};
	}, [menuOpen, accountOpen]);

	const closeMenu = () => {
		setMenuOpen(false);
		setAccountOpen(false);
	};
	const signOut = async () => {
		if (signingOut) return;
		setSigningOut(true);
		try {
			const result = await authClient.signOut();
			if (result.error) throw new Error(result.error.message);
			setAccountOpen(false);
			setMenuOpen(false);
			await refetch();
			toast.success("Signed out successfully.");
			router.replace("/");
			router.refresh();
		} catch {
			toast.error("Could not sign out. Please try again.");
		} finally {
			setSigningOut(false);
		}
	};
	const press = reducedMotion ? undefined : { scale: 0.97 };
	const iconDuration = reducedMotion ? 0 : 0.18;

	const linkClassName = (href: string) =>
		cn(
			linkBase,
			isActive(pathname, href)
				? "bg-accent text-accent-foreground"
				: "text-muted-foreground hover:bg-muted hover:text-foreground",
		);

	const authClassName = (href: string, mobile = false) =>
		cn(
			buttonVariants({ variant: href === "/sign-in" ? "outline" : "default" }),
			mobile ? "w-full" : "w-28",
			"h-11 rounded-full text-sm motion-reduce:transition-none focus-visible:ring-2",
			isActive(pathname, href) &&
				"ring-2 ring-ring ring-offset-2 ring-offset-background",
		);

	const accountMenu = (mobile: boolean) => {
		if (!user) return null;
		const displayName = user.name?.trim() || user.email || "FixMate User";
		const dashboardHref = dashboardPathForRole(user.role);
		return (
			<div
				ref={mobile ? mobileAccountRef : desktopAccountRef}
				className="relative"
			>
				<Button
					type="button"
					variant="outline"
					size="icon"
					data-account-trigger
					aria-label={`Account menu for ${displayName}`}
					aria-expanded={accountOpen}
					aria-controls={
						mobile ? "mobile-account-menu" : "desktop-account-menu"
					}
					className="size-11 min-h-11 overflow-hidden rounded-full p-0 shadow-none"
					onClick={() => {
						setMenuOpen(false);
						setAccountOpen((open) => !open);
					}}
				>
					{user.image ? (
						<Image
							src={user.image}
							alt=""
							width={44}
							height={44}
							unoptimized
							className="size-full object-cover"
						/>
					) : (
						<span
							aria-hidden="true"
							className="grid size-full place-items-center bg-primary/10 text-sm font-semibold text-primary"
						>
							{initialsFor(displayName)}
						</span>
					)}
				</Button>
				{accountOpen && (
					<div
						id={mobile ? "mobile-account-menu" : "desktop-account-menu"}
						className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-2 text-card-foreground shadow-lg"
					>
						<div className="border-b border-border px-3 py-2.5">
							<p className="truncate text-sm font-semibold">{displayName}</p>
							<p className="text-xs text-muted-foreground">
								{roleLabel(user.role)}
							</p>
						</div>
						<Link
							href={dashboardHref}
							onClick={closeMenu}
							className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<LayoutDashboard aria-hidden="true" className="size-4" />
							Dashboard
						</Link>
						<Link
							href="/dashboard/profile"
							onClick={closeMenu}
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
		);
	};

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
			<nav
				aria-label="Main navigation"
				className="mx-auto max-w-6xl px-5 sm:px-8"
			>
				<div className="flex min-h-18 items-center justify-between gap-3">
					<Link
						href="/"
						aria-label="FixMate home"
						className="inline-flex w-fit items-center gap-2 rounded-sm font-heading text-[1.35rem] font-bold leading-none tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						onClick={closeMenu}
					>
						<span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
							<Wrench
								aria-hidden="true"
								className="size-5 text-primary"
								strokeWidth={2.3}
							/>
						</span>
						<span>
							<span className="text-primary">Fix</span>
							<span className="text-foreground">Mate</span>
						</span>
					</Link>

					<div className="hidden items-center gap-1 lg:flex">
						{mainLinks.map(({ href, label }) => (
							<Link
								key={href}
								href={href}
								aria-current={isActive(pathname, href) ? "page" : undefined}
								className={linkClassName(href)}
							>
								{label}
							</Link>
						))}
					</div>

					<div className="hidden items-center gap-2 lg:flex">
						{isPending ? (
							<span aria-hidden="true" className="h-11 w-[14.5rem]" />
						) : user ? (
							accountMenu(false)
						) : (
							<>
								<MotionLink
									href="/sign-in"
									aria-current={
										isActive(pathname, "/sign-in") ? "page" : undefined
									}
									className={authClassName("/sign-in")}
									whileTap={press}
								>
									Sign In
								</MotionLink>
								<MotionLink
									href="/sign-up"
									aria-current={
										isActive(pathname, "/sign-up") ? "page" : undefined
									}
									className={authClassName("/sign-up")}
									whileTap={press}
								>
									Sign Up
								</MotionLink>
							</>
						)}
						<ThemeToggle />
					</div>

					<div className="flex items-center gap-1.5 lg:hidden">
						<ThemeToggle />
						{!isPending && user && accountMenu(true)}
						<Button
							type="button"
							variant="outline"
							size="icon"
							data-menu-trigger
							aria-label={menuOpen ? "Close menu" : "Open menu"}
							aria-controls="mobile-navigation"
							aria-expanded={menuOpen}
							className="size-11 min-h-11 rounded-full p-0 shadow-none motion-reduce:transition-none"
							render={
								<motion.button
									whileTap={reducedMotion ? undefined : { scale: 0.94 }}
								/>
							}
							onClick={() => {
								setAccountOpen(false);
								setMenuOpen((open) => !open);
							}}
						>
							<span aria-hidden="true" className="relative size-[22px]">
								<AnimatePresence mode="wait" initial={false}>
									<motion.span
										key={menuOpen ? "close" : "menu"}
										initial={{ opacity: 0, rotate: reducedMotion ? 0 : -45 }}
										animate={{ opacity: 1, rotate: 0 }}
										exit={{ opacity: 0, rotate: reducedMotion ? 0 : 45 }}
										transition={{ duration: iconDuration }}
										className="absolute inset-0 grid place-items-center"
									>
										{menuOpen ? (
											<X className="size-[22px]" />
										) : (
											<Menu className="size-[22px]" />
										)}
									</motion.span>
								</AnimatePresence>
							</span>
						</Button>
					</div>
				</div>

				<div
					id="mobile-navigation"
					hidden={!menuOpen}
					className="border-t border-border py-4 lg:hidden"
				>
					<div className="flex flex-col gap-1">
						{mainLinks.map(({ href, label }) => (
							<Link
								key={href}
								href={href}
								aria-current={isActive(pathname, href) ? "page" : undefined}
								className={cn(linkClassName(href), "px-4 py-3")}
								onClick={closeMenu}
							>
								{label}
							</Link>
						))}
						{!isPending && !user && (
							<div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-4">
								<MotionLink
									href="/sign-in"
									aria-current={
										isActive(pathname, "/sign-in") ? "page" : undefined
									}
									className={authClassName("/sign-in", true)}
									whileTap={press}
									onClick={closeMenu}
								>
									Sign In
								</MotionLink>
								<MotionLink
									href="/sign-up"
									aria-current={
										isActive(pathname, "/sign-up") ? "page" : undefined
									}
									className={authClassName("/sign-up", true)}
									whileTap={press}
									onClick={closeMenu}
								>
									Sign Up
								</MotionLink>
							</div>
						)}
					</div>
				</div>
			</nav>
		</header>
	);
}
