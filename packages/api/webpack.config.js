import { createRequire } from 'module'
import webpack from 'webpack'
import path from 'path'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const require = createRequire(__dirname)

export default {
  target: 'webworker',
  mode: 'development',
  devtool: 'cheap-module-source-map', // avoid "eval": Workers environment doesn't allow it
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  ],
  stats: 'minimal',
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify')
    },
    alias: {
      'node-fetch': path.resolve(__dirname, 'src', 'utils', 'fetch.js')
    }
  }
}
