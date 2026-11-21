import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

export default async function SignInPage() {
  const session = await getAuthSession();
  if (session) redirect(dashboardPathForRole(session.user.role));

  return <SignInForm />;
}
