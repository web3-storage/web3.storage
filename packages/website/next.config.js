const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    // TODO: Remove me when all the ts errors are figured out.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
