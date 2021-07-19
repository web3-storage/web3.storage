#!/usr/bin/env node

import sade from 'sade'
import { get, put, status, token } from './index.js'

const cli = sade('w3')

cli
  .example('put path/to/files')
  .example('get bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy -o room-guardian.jpg')

cli.command('token')
  .option('--api', 'URL for the Web3 Storage API. Default: https://api.web3.storage')
  .option('--delete', 'Delete your saved token')
  .describe('Save an API token to use for all requests.')
  .action(token)

cli.command('put <path>')
  .describe('Upload a file or directory to web3.storage')
  .action(put)

cli.command('get <cid>')
  .describe('Fetch and verify files from web3.storage')
  .option('-o, --output', 'Write to the output file name')
  .example('get bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy -o room-guardian.jpg')
  .action(get)

cli.command('status <cid>')
  .describe('Get the Filecoin deals and IPFS pins that contain a given CID, as JSON.')
  .example('status bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy')
  .action(status)

cli.parse(process.argv)
