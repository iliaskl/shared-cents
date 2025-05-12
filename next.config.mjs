/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/backend/:path*',
                destination: 'http://localhost:5000/api/:path*', // Proxy to Express server
            },
        ];
    },
};

export default nextConfig;