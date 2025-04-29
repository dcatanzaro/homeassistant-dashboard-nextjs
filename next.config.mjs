/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    env: {
        HA_URL: process.env.HA_URL,
        HA_TOKEN: process.env.HA_TOKEN,
    },
};

export default nextConfig;
