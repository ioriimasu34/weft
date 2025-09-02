/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8002/api/:path*', // Backend API
      },
      {
        source: '/ws/:path*',
        destination: 'ws://localhost:8001/ws/:path*', // WebSocket
      },
    ]
  },
}

module.exports = nextConfig