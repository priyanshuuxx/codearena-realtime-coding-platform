import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const services = [
  { name: 'backend', args: ['run', 'dev:backend'] },
  { name: 'frontend', args: ['run', 'dev:frontend'] },
];

const children = services.map(({ name, args }) => {
  const child = spawn(npmCommand, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env,
    // Keep each service in its own process group so Ctrl+C also stops
    // Vite/Nodemon children instead of leaving ports occupied.
    detached: process.platform !== 'win32',
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code, signal) => {
    if (code !== 0 && signal !== 'SIGTERM') {
      console.error(`[${name}] stopped with code ${code ?? signal}`);
    }
  });

  return child;
});

function stopAll() {
  for (const child of children) {
    if (child.killed || !child.pid) continue;

    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        child.kill('SIGTERM');
      }
    }
  }
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});

console.log('CodeArena development services started. Open http://127.0.0.1:5173/login');
