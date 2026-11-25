import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const requestedPath = (await searchParams).returnTo;
  const returnTo = typeof requestedPath === "string" && /^\/services\/[0-9a-f]{24}$/i.test(requestedPath)
    ? requestedPath
    : undefined;
  const session = await getAuthSession();
  if (session) redirect(returnTo ?? dashboardPathForRole(session.user.role));

  return <SignInForm returnTo={returnTo} />;
}
