import { spawn } from 'child_process';
import fetch from 'node-fetch';
import * as path from 'path';

export default async function main(config) {
  console.log('Starting w3 storage process for tests...');
  const w3storageProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../../../'),
  });

  // Wait for the dev server to get up and running before attempting to start the tests,
  // otherwise the first test will fail just trying to connect.
  const { baseURL } = config.projects[0].use;
  const apiURL = process.env.NEXT_PUBLIC_API;

  await waitForServer(baseURL, 'web');
  await waitForServer(apiURL, 'API');

  for (const fd of ['stdout', 'stderr']) {
    const prefix = process.env.PLAYWRIGHT_PREFIX_FD ? `[${fd}]: ` : '';
    w3storageProcess[fd].on('data', log => {
      console.log(log.toString().split('\n').map(prepender(prefix)).join('\n'));
    });
  }
  w3storageProcess.on('exit', code => {
    process.exit(code ?? undefined);
    console.log('Stopped w3 storage process.');
  });
}

if (process.env.RUN) {
  console.log('What is this for?')
  // main();
}

function prepender(prefix) {
  return suffix => `${prefix}${suffix}`;
}

async function waitForServer (url, name) {
  let connected = false;
  const maxAttempts = 5;
  let attempt = 0;
  while (attempt < maxAttempts && !connected) {
    attempt++;
    try {
      console.log('Seeing if the dev server is ready...')
      const response = await fetch(url);
      connected = response.ok
    } catch (error) {
      console.log(`Failed to connect to ${name} server (attempt ${attempt} of ${maxAttempts}`)
    }
  }
}
