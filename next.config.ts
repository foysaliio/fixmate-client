import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	async rewrites() {
		const apiBaseUrl = process.env.API_BASE_URL;
		if (!apiBaseUrl) throw new Error("API_BASE_URL must be set.");

		return [
			{
				source: "/api/auth/:path*",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/auth/:path*`,
			},
			{
				source: "/api/access-token",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/access-token`,
			},
			{
				source: "/api/bookings",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/bookings`,
			},
			{
				source: "/api/bookings/my",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/bookings/my`,
			},
			{
				source: "/api/bookings/technician",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/bookings/technician`,
			},
			{
				source: "/api/bookings/:id/cancel",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/bookings/:id/cancel`,
			},
			{
				source: "/api/bookings/:id/status",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/bookings/:id/status`,
			},
			{
				source: "/api/services",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/services`,
			},
			{
				source: "/api/services/:path*",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/services/:path*`,
			},
			{
				source: "/api/admin/services/:path*",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/admin/services/:path*`,
			},
			{
				source: "/api/uploads/image",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/uploads/image`,
			},
			{
				source: "/api/users/profile",
				destination: `${apiBaseUrl.replace(/\/$/, "")}/api/users/profile`,
			},
		];
	},
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
};

export default nextConfig;
