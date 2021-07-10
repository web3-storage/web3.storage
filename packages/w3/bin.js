#!/usr/bin/env node
import meow from 'meow'
import w3 from './index.js'

const cli = meow(
  `Usage
    --get bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu --output pics --api http://127.0.0.1:8787
    --put /path/to/files
  `,
  {
    importMeta: import.meta,
    flags: {
      api: {
        type: 'string',
        default: 'https://api.web3.storage'
      },
      token: {
        type: 'string',
      },
      get: {
        type: 'string',
      },
      put: {
        type: 'string',
      },
      output: {
        type: 'string',
        alias: 'o',
      }
    },
  }
)

if (!cli.flags.get && !cli.flags.put) {
  cli.showHelp()
}
if (cli.flags.get && cli.flags.put) {
  cli.showHelp()
}

w3(cli)
