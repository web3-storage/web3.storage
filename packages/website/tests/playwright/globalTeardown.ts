import { spawn } from 'child_process';
import * as path from 'path';

export default async function main() {
  console.log('globalTeardown calling web3.storage `npm stop`');
  const w3storageProcess = spawn('npm', ['stop'], {
    cwd: path.join(__dirname, '../../../../'),
  });
  for (const fd of ['stdout', 'stderr']) {
    const prefix = process.env.PLAYWRIGHT_PREFIX_FD ? `[${fd}]: ` : '';
    w3storageProcess[fd].on('data', log => {
      console.log(log.toString().split('\n').map(prepender(prefix)).join('\n'));
    });
  }
  await new Promise((resolve, reject) => {
    w3storageProcess.on('exit', code => {
      process.exit(code ?? undefined);
      resolve(undefined);
    });
  });
}

if (process.env.RUN) {
  main();
}

function prepender(prefix) {
  return suffix => `${prefix}${suffix}`;
}
