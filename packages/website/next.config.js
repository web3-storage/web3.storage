const path = require('path');
const fs = require('fs');
const git = require('git-rev-sync');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();
const dirName = path.resolve(__dirname);

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.js',
  unstable_staticImage: true
});

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    loader: 'custom',
  },
  webpack: function (config, options) {
    config.resolve.alias = {
      ...config.resolve.alias,
      Icons: path.resolve(__dirname, 'assets/icons'),
      Illustrations: path.resolve(__dirname, 'assets/illustrations'),
      Lib: path.resolve(__dirname, 'lib'),
      ScrollMagic: path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
      ZeroComponents: path.resolve(__dirname, 'modules/zero/components'),
      ZeroHooks: path.resolve(__dirname, 'modules/zero/hooks'),
    };

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack', 'url-loader'],
    });

    config.plugins.push(
      new options.webpack.DefinePlugin({
        COMMITHASH: JSON.stringify(git.long(dirName)),
        VERSION: JSON.stringify(gitRevisionPlugin.version()),
        LASTCOMMITDATETIME: JSON.stringify(gitRevisionPlugin.lastcommitdatetime()),
      })
    );

    return config;
  },
  exportPathMap: async function () {
    return {
      '/ipfs-404.html': { page: '/404' },
      '/docs/': { page: '/docs/intro', statusCode: 301 },
    };
  },
  env: {
    rawJsFromFile: fs.readFileSync('./rawJsFromFile.js').toString(),
  },
};

module.exports = withNextra({ ...nextConfig });
