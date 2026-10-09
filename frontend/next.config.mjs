/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/admin/queues',
        destination: `${backendUrl}/admin/queues`,
      },
      {
        source: '/admin/queues/:path*',
        destination: `${backendUrl}/admin/queues/:path*`,
      },
    ];
  },
};

export default nextConfig;

