import * as fs from 'fs';
import * as path from 'path';

/**
 * print a good .env file to stdout that can be used for web3.storage
 */
export async function main() {
  const envTemplatePath = path.join(__dirname, '../../../.env.tpl');
  const envTemplateString = fs.readFileSync(envTemplatePath, 'utf-8');
  console.log(envTemplateString);
}

main();
