import { spawn } from 'child_process';
import * as path from 'path';

export default async function main() {
  const w3storageProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../../../'),
  });
  w3storageProcess.on('exit', code => {
    process.exit(code ?? undefined);
  });
}

if (process.env.RUN) {
  main();
}
