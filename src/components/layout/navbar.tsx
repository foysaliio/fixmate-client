"use client";

import { Menu, Wrench, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How It Works" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const linkBase =
  "rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function Navbar() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
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

  const closeMenu = () => setMenuOpen(false);
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
      isActive(pathname, href) && "ring-2 ring-ring ring-offset-2 ring-offset-background",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <nav aria-label="Main navigation" className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex min-h-18 items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="FixMate home"
            className="inline-flex w-fit items-center gap-2 rounded-sm font-heading text-[1.35rem] font-bold leading-none tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={closeMenu}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
              <Wrench aria-hidden="true" className="size-5 text-primary" strokeWidth={2.3} />
            </span>
            <span><span className="text-primary">Fix</span><span className="text-foreground">Mate</span></span>
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
            <MotionLink
              href="/sign-in"
              aria-current={isActive(pathname, "/sign-in") ? "page" : undefined}
              className={authClassName("/sign-in")}
              whileTap={press}
            >
              Sign In
            </MotionLink>
            <MotionLink
              href="/sign-up"
              aria-current={isActive(pathname, "/sign-up") ? "page" : undefined}
              className={authClassName("/sign-up")}
              whileTap={press}
            >
              Sign Up
            </MotionLink>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-menu-trigger
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-controls="mobile-navigation"
              aria-expanded={menuOpen}
              className="size-11 min-h-11 rounded-full p-0 shadow-none motion-reduce:transition-none"
              render={<motion.button whileTap={reducedMotion ? undefined : { scale: 0.94 }} />}
              onClick={() => setMenuOpen((open) => !open)}
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
                    {menuOpen ? <X className="size-[22px]" /> : <Menu className="size-[22px]" />}
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
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-4">
              <MotionLink
                href="/sign-in"
                aria-current={isActive(pathname, "/sign-in") ? "page" : undefined}
                className={authClassName("/sign-in", true)}
                whileTap={press}
                onClick={closeMenu}
              >
                Sign In
              </MotionLink>
              <MotionLink
                href="/sign-up"
                aria-current={isActive(pathname, "/sign-up") ? "page" : undefined}
                className={authClassName("/sign-up", true)}
                whileTap={press}
                onClick={closeMenu}
              >
                Sign Up
              </MotionLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
