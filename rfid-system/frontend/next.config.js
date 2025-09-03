/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-backend-domain.com'],
    unoptimized: false,
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8002'}/api/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001'}/ws/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  // Vercel optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Enable static optimization
  trailingSlash: false,
  // Optimize bundle
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize for production
      config.optimization.splitChunks.chunks = 'all'
      config.optimization.minimize = true
    }
    return config
  },
}

module.exports = nextConfig