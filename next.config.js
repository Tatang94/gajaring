/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.pexels.com', 'pexels.com'],
  },
  async rewrites() {
    return [
      {
        source: '/_api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig