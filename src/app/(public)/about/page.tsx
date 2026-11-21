import { HowFixMateWorks } from "@/components/home/how-fixmate-works";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AboutPage() {
  return (
    <main>
      <section className="bg-background pt-16 text-foreground sm:pt-20 lg:pt-24">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <div className="max-w-4xl">
            <SectionHeading label="ABOUT FIXMATE" level="h1">
              A simpler way to book a repair
            </SectionHeading>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              FixMate helps you book a repair, follow its progress, and pay after the job is done.
            </p>
          </div>
        </div>
      </section>

      <HowFixMateWorks />
    </main>
  );
}
