/** @type {import('next').NextConfig} */
const nextConfig = {
  // Public env vars embedded at build time (anon key is safe - protected by RLS)
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://hsownlzxiqhnstvaftqm.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_oe3mKyjPKWvk1IaywLQtgQ_ZX6FOQZm',
    NEXT_PUBLIC_SITE_URL: 'https://hse-news-reporter.vercel.app',
    NEXT_PUBLIC_SITE_NAME: 'UK Health & Safety News',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Optimize production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
