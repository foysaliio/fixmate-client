import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { type DashboardRole, dashboardPathForRole } from "@/lib/auth-roles";
import { getAuthSession } from "@/lib/server-auth";

const dashboardContent = {
	customer: {
		label: "CUSTOMER DASHBOARD",
		title: "Your repair dashboard",
		description: "Manage your repair requests and follow their progress.",
	},
	technician: {
		label: "TECHNICIAN DASHBOARD",
		title: "Your technician dashboard",
		description: "Manage your services and keep up with incoming requests.",
	},
	admin: {
		label: "ADMIN DASHBOARD",
		title: "FixMate admin dashboard",
		description: "Review services and oversee the FixMate platform.",
	},
} satisfies Record<
	DashboardRole,
	{ label: string; title: string; description: string }
>;

export async function DashboardLanding({
	dashboardRole,
}: {
	dashboardRole: DashboardRole;
}) {
	const session = await getAuthSession();
	if (!session) redirect("/sign-in");

	const ownDashboard = dashboardPathForRole(session.user.role);
	if (ownDashboard !== `/dashboard/${dashboardRole}`) redirect(ownDashboard);

	const content = dashboardContent[dashboardRole];

	return (
		<main className="bg-background py-16 text-foreground sm:py-20 lg:py-24">
			<div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
				<div className="max-w-3xl [&_h1]:text-[30px] [&_h1]:leading-tight lg:[&_h1]:text-[36px]">
					<SectionHeading label={content.label} level="h1">
						{content.title}
					</SectionHeading>
					<p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
						{content.description}
					</p>
					<Button
						render={<Link href="/dashboard/profile" />}
						nativeButton={false}
						className="mt-8"
					>
						Update Profile
					</Button>
				</div>
			</div>
		</main>
	);
}
