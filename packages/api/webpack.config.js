import dotenv from 'dotenv'
import { createRequire } from 'module'
import SentryWebpackPlugin from '@sentry/webpack-plugin'
import { GitRevisionPlugin } from 'git-revision-webpack-plugin'
import webpack from 'webpack'
import path from 'path'

dotenv.config({
  path: path.resolve(process.cwd(), '.env.local')
})

const gitRevisionPlugin = new GitRevisionPlugin()
const __dirname = path.dirname(new URL(import.meta.url).pathname)
const require = createRequire(__dirname)

// relaase name cannot contain slashes, and are global per org, so we prefix here.
// see: https://docs.sentry.io/platforms/javascript/guides/cordova/configuration/releases/
const SENTRY_RELEASE = `web3-api@${process.env.npm_package_version}`

export default {
  target: 'webworker',
  mode: 'development',
  // `hidden` removes sourceMappingURL from the end of the bundle which magically makes sentry source mapping work...
  // see: https://github.com/robertcepa/toucan-js/issues/54#issuecomment-930416972
  devtool: 'hidden-source-map',
  plugins: [
    // no chunking plz. it's "server-side"
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(gitRevisionPlugin.version()),
      SENTRY_RELEASE: JSON.stringify(SENTRY_RELEASE)
    }),
    process.env.SENTRY_UPLOAD === 'true' &&
      new SentryWebpackPlugin({
        setCommits: {
          auto: true
        },
        release: SENTRY_RELEASE, // This must match the `release` option passed to toucan-js
        include: './dist',
        urlPrefix: '/',
        org: 'protocol-labs-it',
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_TOKEN
      })
  ].filter(Boolean),
  stats: 'minimal',
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify')
    },
    alias: {
      // node-fetch causes TypeError: Illegal invocation in Cloudflare Workers
      'node-fetch': path.resolve(__dirname, 'src', 'utils', 'fetch.js')
    }
  },
  optimization: {
    minimize: true,
    usedExports: true
  },
  output: {
    filename: 'worker.js'
  }
}
