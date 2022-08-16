import * as fs from 'fs';
import * as path from 'path';

export async function main() {
  const envTemplatePath = path.join(__dirname, '../../../.env.tpl');
  const envTemplateString = fs.readFileSync(envTemplatePath, 'utf-8');
  console.log(envTemplateString);
}

main();
