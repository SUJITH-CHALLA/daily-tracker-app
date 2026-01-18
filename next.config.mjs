/** @type {import('next').NextConfig} */

const nextConfig = {
	output: 'export',
	basePath: '/daily-tracker-app',
	images: {
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**",
			},
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
};

export default nextConfig;
