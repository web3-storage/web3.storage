import { spawn } from 'child_process';
import * as path from 'path';

export default async function main() {
  const w3storageProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../../../'),
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
