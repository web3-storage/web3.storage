const path = require('path')
const git = require('git-rev-sync')
const { GitRevisionPlugin } = require('git-revision-webpack-plugin')

const gitRevisionPlugin = new GitRevisionPlugin()
const dirName = path.resolve(__dirname)

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  webpack: function(config, options) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'Icons': path.resolve(__dirname, 'assets/icons'),
      'Illustrations': path.resolve(__dirname, 'assets/illustrations'),
      'Lib': path.resolve(__dirname, 'lib'),
      'ZeroComponents': path.resolve(__dirname, 'modules/zero/components'),
      'ZeroHooks': path.resolve(__dirname, 'modules/zero/hooks'),
    }

    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source'
    })

    config.module.rules.push({
      test: /\.svg$/,
      use: [ '@svgr/webpack', 'url-loader' ],
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
