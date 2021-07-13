// @ts-ignore
import { terser } from 'rollup-plugin-terser'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/lib.js',
  output: [
    {
      file: 'dist/bundle.esm.min.js',
      format: 'esm',
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [
    commonjs(),
    resolve({
      browser: true
    })
  ]
}
