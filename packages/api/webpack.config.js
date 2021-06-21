export default {
  target: 'webworker',
  mode: 'development',
  devtool: 'cheap-module-source-map', // avoid "eval": Workers environment doesn't allow it
  plugins: [],
  stats: 'minimal',
}
