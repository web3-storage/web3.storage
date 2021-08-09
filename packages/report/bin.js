import sade from 'sade'
import fs from 'fs'
import { run } from './index.js'

const cli = sade('w3report')

cli.version(getPkg().version)

cli.command('run')
  .describe('Run the default report.')
  .option('-t, --top', 'Show the top n items')
  .option('-o, --output', 'Path to write CSV of all collected data')
  .alias()
  .action(run)

cli.parse(process.argv)

function getPkg () {
  return JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)))
}
