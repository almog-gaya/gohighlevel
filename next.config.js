/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable Vercel's default authentication
  experimental: {
    isExperimentalCompile: true,
  },
  // Allow public access
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'x-vercel-protection',
            value: 'none',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 