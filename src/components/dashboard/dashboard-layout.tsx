"use client";

import { House, LayoutDashboard, Menu, Wrench, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { dashboardPathForRole } from "@/lib/auth-roles";

type DashboardUser = {
  name: string;
  email: string;
  role?: string;
  image?: string | null;
};

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`.toUpperCase();
  return (parts[0] || "FM").slice(0, 2).toUpperCase();
}

function roleLabel(role: string | undefined) {
  if (role === "technician") return "Technician";
  if (role === "admin") return "Admin";
  return "Customer";
}

export function DashboardLayout({ children, user }: { children: ReactNode; user: DashboardUser }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const overviewHref = dashboardPathForRole(user.role);
  const displayName = user.name?.trim() || user.email || "FixMate User";

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const sidebarContent = (mobile: boolean) => (
    <>
      <div className="flex h-[4.5rem] items-center justify-between border-b border-border px-5">
        <Link href="/" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
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

      <nav aria-label="Dashboard navigation" className="flex flex-col gap-1 p-4">
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card text-card-foreground lg:flex">
        {sidebarContent(false)}
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
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
            <span className="hidden font-heading text-lg font-semibold lg:block">Dashboard</span>

            <div className="ml-auto flex min-w-0 items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <div className="flex min-w-0 items-center gap-3 border-l border-border pl-3 sm:pl-4">
                <span className="min-w-0 text-right">
                  <span className="block max-w-24 truncate text-sm font-semibold sm:max-w-40">{displayName}</span>
                  <span className="block text-xs text-muted-foreground">{roleLabel(user.role)}</span>
                </span>
                <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-heading text-sm font-bold text-secondary-foreground">
                  {user.image ? (
                    <Image src={user.image} alt="" width={40} height={40} unoptimized className="size-full object-cover" />
                  ) : (
                    initialsFor(displayName)
                  )}
                </span>
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
            className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-card text-card-foreground shadow-xl"
          >
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </div>
  );
}
