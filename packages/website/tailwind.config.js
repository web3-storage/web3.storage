module.exports = {
  purge: [
    './pages/*.js',
    './components/**/*.js',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "w3storage-yellow": '#fde956',
        "w3storage-yellow-dark": '#e5ca02',
        "w3storage-yellow-light": '#fffae6',
        "w3storage-red": '#fc6553',
        "w3storage-red-dark": '#c94332',
        "w3storage-red-accent": '#d7362e',
        "w3storage-red-light": '#fff5f4',
        "w3storage-pink": '#FFE6E5',
        "w3storage-red-background": '#ffe6e5',
        "w3storage-neutral-red": '#fff2ec',
        "w3storage-green": '#37b667',
        "w3storage-green-dark": '#10853c',
        "w3storage-green-light": '#f0fcf4',
        "w3storage-purple": '#171691',
        "w3storage-black": '#1f1817',
        "w3storage-blue-dark": '#0b0a45',
        "w3storage-blue-desaturated": '#2d2d65',
        "w3storage-blue-desaturated-bright": '#3f3f75',
        "w3storage-blue-bright": '#00a7ff',
        "w3storage-white": '#ffffff',
        "w3storage-background": '#fff2ec'
      },
      gridTemplateRows: {
        '3-auto': 'repeat(3, auto)',
        '6-auto': 'repeat(6, auto)'
      },
      zIndex: {
        'n1': '-1',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.w3storage-purple'),
            h1: {
              color: false,
              fontSize: false,
              fontWeight: false,
            },
            h2: {
              color: false,
              fontSize: false,
              fontWeight: false,
            },
            h3: {
              color: false,
              fontSize: false,
              fontWeight: 500,
            },
            a: {
              color: theme('colors.w3storage-purple'),
            }
          }
        }
      })
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
