const path = require('path');

module.exports = {
  "stories": [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../modules/zero/components/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    // "@storybook/addon-knobs"
  ],
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'Icons': path.resolve(__dirname, '../assets/icons'),
      'Illustrations': path.resolve(__dirname, '../assets/illustrations'),
      'Lib': path.resolve(__dirname, '../lib'),
      'ZeroComponents': path.resolve(__dirname, '../modules/zero/components'),
    }

    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });

    return config;
  },
}