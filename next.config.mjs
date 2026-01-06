/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    serverExternalPackages: ["ws"],
    env: {
        HA_URL: process.env.HA_URL,
        HA_TOKEN: process.env.HA_TOKEN,
        DASHBOARD_URL: process.env.DASHBOARD_URL,
        DASHBOARD_POSTURL: process.env.DASHBOARD_POSTURL,
    },
};

export default nextConfig;
