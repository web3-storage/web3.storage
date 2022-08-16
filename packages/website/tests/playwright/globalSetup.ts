import { spawn } from 'child_process';
import * as path from 'path';

export default async function main() {
  console.log('globalSetup', {
    env: {
      MAGIC_SECRET_KEY_typeOf: typeof process.env.MAGIC_SECRET_KEY,
      MAGIC_SECRET_KEY_length: String(process.env.MAGIC_SECRET_KEY).length,
    },
  });
  const w3storageProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../../../'),
    shell: true,
  });
  w3storageProcess.stdout.on('data', function (msg) {
    console.log('[stdout]:', msg.toString());
  });
  w3storageProcess.stderr.on('data', function (msg) {
    console.log('[stderr]:', msg.toString());
  });
  console.log('in globalSetup.ts');
}

if (process.env.RUN) {
  main();
}
