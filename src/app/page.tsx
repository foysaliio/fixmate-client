import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8"
        >
          <span className="font-heading text-xl font-bold tracking-tight">FixMate</span>
          <ThemeToggle />
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-5 py-16 sm:px-8 sm:py-24">
        <div className="max-w-2xl rounded-3xl border border-border bg-card p-7 text-card-foreground shadow-sm sm:p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Welcome to FixMate
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Repairs, made simpler.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A calmer place to keep track of the fixes that matter. Choose the
            light or dark view that works best for you.
          </p>
        </div>
      </main>
    </div>
  );
}
