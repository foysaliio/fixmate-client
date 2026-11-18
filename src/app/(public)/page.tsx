export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-6xl items-center px-5 py-16 sm:px-8 sm:py-24">
      <div className="max-w-2xl rounded-3xl border border-border bg-card p-7 text-card-foreground shadow-sm sm:p-12">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          Welcome to FixMate
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Repairs, made simpler.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          A calmer place to keep track of the fixes that matter.
        </p>
      </div>
    </main>
  );
}
