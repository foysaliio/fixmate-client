"use client";

import { Menu, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
];

const accountLinks = [
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Sign Up" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const linkBase =
  "rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.querySelector<HTMLButtonElement>("[data-menu-trigger]")?.focus();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const linkClassName = (href: string) =>
    cn(
      linkBase,
      isActive(pathname, href)
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav aria-label="Main navigation" className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex min-h-17 items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="FixMate home"
            className="inline-flex items-center gap-2 rounded-md font-heading text-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={closeMenu}
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench aria-hidden="true" className="size-5" />
            </span>
            FixMate
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
            <Link
              href="/sign-in"
              aria-current={isActive(pathname, "/sign-in") ? "page" : undefined}
              className={linkClassName("/sign-in")}
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              aria-current={isActive(pathname, "/sign-up") ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "default" }),
                "focus-visible:ring-2",
                isActive(pathname, "/sign-up") && "ring-2 ring-ring ring-offset-2 ring-offset-background",
              )}
            >
              Sign Up
            </Link>
            <ThemeToggle />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            data-menu-trigger
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-controls="mobile-navigation"
            aria-expanded={menuOpen}
            className="size-11 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>

        <div
          id="mobile-navigation"
          hidden={!menuOpen}
          className="border-t border-border py-4 lg:hidden"
        >
          <div className="flex flex-col gap-1">
            {[...mainLinks, ...accountLinks].map(({ href, label }) => (
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
            <div className="mt-3 border-t border-border px-1 pt-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
