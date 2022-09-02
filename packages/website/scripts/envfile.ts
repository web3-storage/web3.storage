import * as fs from 'fs';
import * as path from 'path';

/**
 * print a good .env file to stdout that can be used for web3.storage
 * The `ENVFILE_WITHOUT` env variable may contain a comma-separated list of variable names to exclude from the output.
 */
export async function main() {
  const without = (process.env.ENVFILE_WITHOUT ?? '').split(',')
  const envTemplatePath = path.join(__dirname, '../../../.env.tpl');
  const envTemplateString = fs.readFileSync(envTemplatePath, 'utf-8');
  let envStringWithModifications = envTemplateString
  for (const exclusion of without) {
    envStringWithModifications = envStringWithModifications.replace(new RegExp(`^${exclusion}=.*$`, 'mg'), '')
  }
  console.log(envStringWithModifications);
}

main();
