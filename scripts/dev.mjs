import { spawn } from 'node:child_process';
import net from 'node:net';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const services = [
  { name: 'backend', args: ['run', 'dev:backend'] },
  { name: 'frontend', args: ['run', 'dev:frontend'] },
];

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.once('error', () => resolve(false));
    probe.once('listening', () => probe.close(() => resolve(true)));
    // Match the backend's default wildcard bind (which may resolve to :: on macOS).
    // Probing only 127.0.0.1 can miss an IPv6 wildcard listener that still
    // occupies the same dual-stack port.
    probe.listen(port);
  });
}

const requiredPorts = [5173, 5050];
const portAvailability = await Promise.all(requiredPorts.map((port) => isPortAvailable(port)));
const occupiedPorts = requiredPorts.filter((_port, index) => !portAvailability[index]);

if (occupiedPorts.length > 0) {
  console.error(`CodeArena is already running or a port is occupied: ${occupiedPorts.join(', ')}.`);
  console.error('Open http://127.0.0.1:5173/login, or stop the existing process before running npm run dev again.');
  process.exit(1);
}

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
