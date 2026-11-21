"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { authClient } from "@/lib/auth-client";

const inputClassName =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

function emailError(email: string) {
  if (!email.trim()) return "Enter your email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter a valid email address.";
  return "";
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentEmailError = emailTouched ? emailError(email) : "";
  const currentPasswordError = passwordTouched && !password ? "Enter your password." : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setFormError("");

    if (emailError(email) || !password) return;

    setIsSubmitting(true);
    try {
      const { error } = await authClient.signIn.email({ email: email.trim(), password });
      if (error) {
        setFormError(error.message || "Incorrect email or password.");
        return;
      }

      toast.success("Welcome back to FixMate.");
      router.replace("/");
    } catch {
      setFormError("Unable to sign in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-background py-16 text-foreground sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-xl">
          <SectionHeading label="WELCOME BACK" level="h1">
            Sign in to FixMate
          </SectionHeading>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sign in to keep track of your repairs and account.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 space-y-5 rounded-xl border border-border bg-card p-5 text-card-foreground sm:p-8"
          >
            <div>
              <label htmlFor="sign-in-email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="sign-in-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmailTouched(true)}
                aria-invalid={Boolean(currentEmailError)}
                aria-describedby={currentEmailError ? "sign-in-email-error" : undefined}
                disabled={isSubmitting}
                className={inputClassName}
              />
              {currentEmailError && (
                <p id="sign-in-email-error" className="mt-2 text-sm text-destructive">
                  {currentEmailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="sign-in-password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <PasswordInput
                id="sign-in-password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setPasswordTouched(true)}
                aria-invalid={Boolean(currentPasswordError)}
                aria-describedby={currentPasswordError ? "sign-in-password-error" : undefined}
                disabled={isSubmitting}
                className={inputClassName}
              />
              {currentPasswordError && (
                <p id="sign-in-password-error" className="mt-2 text-sm text-destructive">
                  {currentPasswordError}
                </p>
              )}
            </div>

            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New to FixMate?{" "}
              <Link href="/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
