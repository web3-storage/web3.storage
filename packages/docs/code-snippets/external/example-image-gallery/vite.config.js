const { resolve } = require('path')

module.exports = {
  root: './src',
  base: '',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src', 'index.html'),
        gallery: resolve(__dirname, 'src', 'gallery.html'),
        settings: resolve(__dirname, 'src', 'settings.html'),
      }
    }
  }
}
