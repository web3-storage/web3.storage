#!/usr/bin/env node

import sade from 'sade'
import { get, put } from './index.js'

const cli = sade('w3')

cli
  .option('--api', 'URL for API to use')
  .option('--token', 'API token to use')
  .example('put path/to/files')
  .example('get bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy -o room-guardian.jpg')

cli.command('get <cid>')
  .describe('Get and verify files from web3.storage')
  .option('-o, --output', 'Write to the output file name')
  .example('get bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy -o room-guardian.jpg')
  .action(get)

cli.command('put <path...>')
  .describe('Upload files to web3.storage')
  .action(put)

cli.parse(process.argv)
