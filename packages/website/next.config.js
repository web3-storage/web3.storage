const path = require('path');

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,

  webpack: function(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'Icons': path.resolve(__dirname, 'assets/icons'),
      'Illustrations': path.resolve(__dirname, 'assets/illustrations'),
      'Lib': path.resolve(__dirname, 'lib'),
      'ZeroComponents': path.resolve(__dirname, 'modules/zero/components'),
    }

    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source'
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: [ '@svgr/webpack', 'url-loader' ],
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
