const { spawn } = require('child_process');
const path = require('path');

console.log('=======================================================');
console.log('  Starting EasyRide Master Full-Stack Development System');
console.log('=======================================================');

const apiProcess = spawn('npm', ['--prefix', 'services/api', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const webProcess = spawn('npm', ['--prefix', 'apps/web', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  apiProcess.kill();
  webProcess.kill();
  process.exit();
});
