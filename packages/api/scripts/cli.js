#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sade from 'sade'
import { build } from 'esbuild'
import git from 'git-rev-sync'
import { createRequire } from 'module'
import Sentry from '@sentry/cli'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
const require = createRequire(__dirname)

const prog = sade('api')

prog
  .command('build')
  .describe('Build the worker.')
  .option('--env', 'Environment', 'dev')
  .action(async (opts) => {
    const version = `${pkg.name}@${pkg.version}-${opts.env}+${git.short(
      __dirname
    )}`

    await build({
      entryPoints: [path.join(__dirname, '..', 'src', 'index.js')],
      bundle: true,
      format: 'esm',
      outfile: path.join(__dirname, '..', 'dist', 'index.mjs'),
      legalComments: 'external',
      inject: [path.join(__dirname, 'node-globals.js')],
      plugins: [{
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
      }],
      define: {
        VERSION: JSON.stringify(version),
        COMMITHASH: JSON.stringify(git.long(__dirname)),
        BRANCH: JSON.stringify(git.branch(__dirname)),
        ENV: opts.env || 'dev',
        global: 'globalThis'
      },
      minify: opts.env !== 'dev',
      sourcemap: true
    })

    // Sentry release and sourcemap upload
    if (process.env.SENTRY_UPLOAD === 'true') {
      const cli = new Sentry(undefined, {
        authToken: process.env.SENTRY_TOKEN,
        org: 'protocol-labs-it',
        project: 'web3-api',
        dist: git.short(__dirname)
      })

      await cli.releases.new(version)
      await cli.releases.setCommits(version, {
        auto: true,
        ignoreEmpty: true,
        ignoreMissing: true
      })
      await cli.releases.uploadSourceMaps(version, {
        include: [path.join(__dirname, '..', 'dist')],
        urlPrefix: '/'
      })
      await cli.releases.finalize(version)
      await cli.releases.newDeploy(version, { env: opts.env })
    }
  })

prog.parse(process.argv)
