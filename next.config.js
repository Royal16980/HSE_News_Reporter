/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Cloudflare R2 — SafetyNews Pro asset CDN
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        // R2 public bucket custom domain (configure once provisioned)
        protocol: 'https',
        hostname: 'assets.safetynews.pro',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'd3'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          {
            // Allow embedding from Higsfield for video content
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com",
              "frame-src https://www.youtube.com https://open.spotify.com",
            ].join('; '),
          },
        ],
      },
      // Cron routes — no cache
      {
        source: '/api/cron/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      // Webhook routes — no cache
      {
        source: '/api/webhook/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Legacy HSE News Reporter URLs → SafetyNews Pro
      {
        source: '/articles/:slug',
        destination: '/articles/:slug',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
