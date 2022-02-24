const path = require('path')
const git = require('git-rev-sync')
const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

const gitRevisionPlugin = new GitRevisionPlugin()
const dirName = path.resolve(__dirname)

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    // TODO: Remove me when all the ts errors are figured out.
    ignoreDuringBuilds: true,
  },
  webpack: function(config, options) {
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source'
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    config.plugins.push(
      new options.webpack.DefinePlugin({
        COMMITHASH: JSON.stringify(git.long(dirName)),
        VERSION: JSON.stringify(gitRevisionPlugin.version())
      })
    )

    return config
  },
  exportPathMap: async function () {
    return {
      '/ipfs-404.html': { page: '/404' },
    }
  },
}

module.exports = nextConfig
