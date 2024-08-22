import { spawn } from 'bun';
import { join } from 'path';

const cpus = navigator.hardwareConcurrency; // Number of CPU cores
const buns = new Array(cpus);

for (let i = 0; i < cpus; i++) {
  buns[i] = spawn({
    cmd: ['bun', 'run', join(__dirname, 'index.ts')],
    stdout: 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  });
}

function kill() {
  for (const bun of buns) {
    bun.kill();
  }
}

process.on('SIGINT', kill);
process.on('exit', kill);
