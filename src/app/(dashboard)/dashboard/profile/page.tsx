import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getAuthSession } from "@/lib/server-auth";

export default async function ProfilePage() {
	const session = await getAuthSession();
	if (!session) redirect("/sign-in");

	return <ProfileForm user={session.user} />;
}
