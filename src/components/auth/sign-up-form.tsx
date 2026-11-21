"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { authClient } from "@/lib/auth-client";
import { dashboardPathForRole } from "@/lib/auth-roles";

type Role = "customer" | "technician";

const inputClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

function passwordError(password: string) {
  if (password.length < 6) return "Use at least 6 characters.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
  return "";
}

export function SignUpForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("customer");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentPasswordError = passwordTouched ? passwordError(password) : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordTouched(true);
    setFormError("");

    if (passwordError(password)) return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();

    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      const input = { name, email, password, role };
      const { data: signedUp, error } = await authClient.signUp.email(input);
      if (error) {
        setFormError(error.message || "Unable to create your account. Please try again.");
        return;
      }

      toast.success("Your FixMate account is ready.");
      router.replace(dashboardPathForRole((signedUp?.user as { role?: unknown } | undefined)?.role));
    } catch {
      setFormError("Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-background py-16 text-foreground sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-xl">
          <SectionHeading label="JOIN FIXMATE" level="h1">
            Create your account
          </SectionHeading>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sign up to request repairs or offer your services as a technician.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-8"
          >
            <div>
              <label htmlFor="sign-up-name" className="mb-2 block text-sm font-medium">
                Full Name
              </label>
              <input
                id="sign-up-name"
                name="name"
                autoComplete="name"
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="sign-up-email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="sign-up-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="sign-up-password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <PasswordInput
                id="sign-up-password"
                name="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setPasswordTouched(true)}
                aria-invalid={Boolean(currentPasswordError)}
                aria-describedby={currentPasswordError ? "sign-up-password-error" : undefined}
                disabled={isSubmitting}
                className={inputClassName}
              />
              {currentPasswordError && (
                <p id="sign-up-password-error" className="mt-2 text-sm text-destructive">
                  {currentPasswordError}
                </p>
              )}
            </div>

            <fieldset disabled={isSubmitting}>
              <legend className="mb-2 text-sm font-medium">I want to join as</legend>
              <div className="grid grid-cols-2 gap-3">
                {(["customer", "technician"] as const).map((option) => (
                  <label
                    key={option}
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${role === option ? "border-primary bg-accent text-accent-foreground" : "border-border bg-background text-foreground hover:bg-muted"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option}
                      checked={role === option}
                      onChange={() => setRole(option)}
                      className="accent-primary"
                    />
                    {option === "customer" ? "Customer" : "Technician"}
                  </label>
                ))}
              </div>
            </fieldset>

            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
