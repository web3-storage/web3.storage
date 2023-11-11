#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sade from 'sade'
import { build } from 'esbuild'
import git from 'git-rev-sync'
import { createRequire } from 'module'
import Sentry from '@sentry/cli'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
const require = createRequire(__dirname)

const prog = sade('api')

prog
  .command('build')
  .describe('Build the worker.')
  .option('--env', 'Environment', process.env.ENV)
  .action(async (opts) => {
    // Release name cannot contain slashes, and are global per org, so we use
    // custom prefix here not pkg.name.
    // See https://docs.sentry.io/platforms/javascript/guides/cordova/configuration/releases/
    const sentryRelease = `web3-api@${pkg.version}-${opts.env}+${git.short(__dirname)}`
    console.log(`Building ${sentryRelease}`)

    await build({
      entryPoints: [path.join(__dirname, '..', 'src', 'index.js')],
      bundle: true,
      format: 'esm',
      outfile: path.join(__dirname, '..', 'dist', 'worker.js'),
      legalComments: 'external',
      inject: [path.join(__dirname, 'node-globals.js')],
      plugins: [
        {
          name: 'alias',
          setup (build) {
            build.onResolve({ filter: /^stream$/ }, () => {
              return { path: require.resolve('stream-browserify') }
            })
            build.onResolve({ filter: /^node-fetch$/ }, () => {
              return { path: path.resolve(__dirname, 'fetch.js') }
            })
            build.onResolve({ filter: /^cross-fetch$/ }, () => {
              return { path: path.resolve(__dirname, 'fetch.js') }
            })
          }
        },
        // required to build with 'stripe', which has imports (we dont use) on http, https, crypto
        NodeModulesPolyfillPlugin()
      ],
      define: {
        SENTRY_RELEASE: JSON.stringify(sentryRelease),
        VERSION: JSON.stringify(pkg.version),
        COMMITHASH: JSON.stringify(git.long(__dirname)),
        BRANCH: JSON.stringify(git.branch(__dirname)),
        global: 'globalThis'
      },
      minify: opts.env !== 'dev',
      sourcemap: 'external'
    })

    // Sentry release and sourcemap upload
    if (process.env.SENTRY_UPLOAD === 'true') {
      console.log(`Uploading to Sentry ${sentryRelease}`)
      const cli = new Sentry(undefined, {
        authToken: process.env.SENTRY_TOKEN,
        org: 'protocol-labs-it',
        project: 'web3-api',
        dist: git.short(__dirname)
      })

      await cli.releases.new(sentryRelease)
      await cli.releases.setCommits(sentryRelease, {
        auto: true,
        ignoreEmpty: true,
        ignoreMissing: true
      })
      await cli.releases.uploadSourceMaps(sentryRelease, {
        // validate: true,
        include: [path.join(__dirname, '..', 'dist')],
        ext: ['map', 'js']
      })
      await cli.releases.finalize(sentryRelease)
      await cli.releases.newDeploy(sentryRelease, { env: opts.env })
    }
  })

prog.parse(process.argv)
