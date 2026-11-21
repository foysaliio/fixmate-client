import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

export default async function SignUpPage() {
  const session = await getAuthSession();
  if (session) redirect(dashboardPathForRole(session.user.role));

  return <SignUpForm />;
}
