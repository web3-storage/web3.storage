const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  // cache: false,
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    // TODO: Remove me when all the ts errors are figured out.
    ignoreDuringBuilds: true,
  },
  webpack: function(config) {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source'
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
  exportPathMap: async function () {
    return {
      '/ipfs-404.html': { page: '/404' },
    }
  },
}

module.exports = nextConfig
