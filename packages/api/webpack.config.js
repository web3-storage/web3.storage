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

export default {
  target: 'webworker',
  mode: 'development',
  devtool: 'source-map',
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
      VERSION: JSON.stringify(gitRevisionPlugin.version())
    }),
    process.env.SENTRY_UPLOAD === 'true' &&
      new SentryWebpackPlugin({
        release: gitRevisionPlugin.version(),
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
