const path = require('path');
const fs = require('fs');
const git = require('git-rev-sync');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

const gitRevisionPlugin = new GitRevisionPlugin();
const dirName = path.resolve(__dirname);
const nextra = require('nextra');

const docsPages = require('./pages/docs/nav.json');

const withNextra = nextra('./modules/docs-theme/index.js');

const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    loader: 'custom',
  },
  headers: () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
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
      })
    );

    return config;
  },
  exportPathMap: async function () {
    const paths = {
      '/ipfs-404.html': { page: '/404' },
      '/docs/': { page: '/docs/intro', statusCode: 301 },
    };
    // we have to specify the doc paths here to avoid 404 on reload
    docsPages.map(item => {
      item.menu.map(t => {
        paths[`/docs/${t.src}`] = {
          page: `/docs/${t.src}`,
        };
      });
    });
    return paths;
  },
};

module.exports = withNextra({ ...nextConfig });
