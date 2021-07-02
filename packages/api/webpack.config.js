import { createRequire } from 'module'
import webpack from 'webpack'

const require = createRequire(import.meta.url)

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
    }
  }
}
