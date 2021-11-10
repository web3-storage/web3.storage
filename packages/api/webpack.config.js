/**
 * This config compiles the src dir into a service-worker in ./dist/worker.js
 *
 * That bundle is uploaded to CloudFlare via the wrangler CLI.
 * The total bundle must be less than 1MB, and everything in the ./dist folder
 * gets uploaded, so care is taken here to remove source-maps and license files
 * that would not be web accessible any way from the CF Worker platform.
 *
 * A source-map is generated and sent to Sentry during deployment when the env
 * `SENTRY_UPLOAD=true` is present, to aid debugging.
 */
import dotenv from 'dotenv'
import { createRequire } from 'module'
import SentryWebpackPlugin from '@sentry/webpack-plugin'
import git from 'git-rev-sync'
import { GitRevisionPlugin } from 'git-revision-webpack-plugin'
import RemovePlugin from 'remove-files-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
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
  devtool: process.env.SENTRY_UPLOAD === 'true' ? 'hidden-source-map' : false,
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
      SENTRY_RELEASE: JSON.stringify(SENTRY_RELEASE),
      COMMITHASH: JSON.stringify(git.long(__dirname)),
      BRANCH: JSON.stringify(git.branch(__dirname))
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
      }),
    process.env.SENTRY_UPLOAD === 'true' &&
      new RemovePlugin({
        after: {
          include: [
            './dist/worker.js.map' // this has been sent to sentry. we dont need to send it to cloudflare.
          ]
        }
      })
  ].filter(Boolean),
  stats: 'minimal',
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify')
    },
    alias: {
      // node-fetch and cross-fetch causes TypeError: Illegal invocation in Cloudflare Workers
      'node-fetch': path.resolve(__dirname, 'src', 'utils', 'fetch.js'),
      'cross-fetch': path.resolve(__dirname, 'src', 'utils', 'fetch.js')
    }
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // disable generation of worker.LICENSE.txt as we don't and can't use it from CF.
        terserOptions: {
          format: {
            comments: false
          }
        }
      })
    ],
    usedExports: true
  },
  output: {
    filename: 'worker.js'
  }
}
