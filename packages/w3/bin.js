#!/usr/bin/env node

import 'hard-rejection/register.js' // throw on unhandled promise rejection in node 14.
import sade from 'sade'
import { get, list, put, putCar, status, token, getPkg } from './index.js'

const cli = sade('w3')

cli
  .version(getPkg().version)
  .example('put path/to/files')
  .example('get bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy -o room-guardian.jpg')

cli.command('token')
  .option('--api', 'URL for the Web3 Storage API. Default: https://api.web3.storage')
  .option('--delete', 'Delete your saved token')
  .describe('Save an API token to use for all requests')
  .action(token)

cli.command('put <path>')
  .describe('Upload a file or directory to web3.storage')
  .option('--no-wrap', 'Dont wrap input files with a directory')
  .option('-n, --name', 'Name to identify the upload')
  .option('-H, --hidden', 'Include paths that start with "."')
  .option('--no-retry', 'Dont try the upload again if it fails')
  .action(put)

cli.command('put-car <path>')
  .describe('Upload a CAR file to web3.storage')
  .option('-n, --name', 'Name to identify the upload')
  .option('--no-retry', 'Dont try the upload again if it fails')
  .action(putCar)

cli.command('list')
  .describe('List all the uploads in your account')
  .option('--json', 'Format as newline delimted JSON')
  .option('--cid', 'Only print the root CID per upload')
  .alias(['ls'])
  .action(list)

cli.command('get <cid>')
  .describe('Fetch and verify files from web3.storage')
  .option('-o, --output', 'The path to write the files to')
  .example('get bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy -o room-guardian.jpg')
  .action(get)

cli.command('status <cid>')
  .describe('Get the Filecoin deals and IPFS pins that contain a given CID, as JSON')
  .example('status bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy')
  .action(status)

cli.parse(process.argv)
