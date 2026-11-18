const { spawn } = require('node:child_process');
const path = require('node:path');

console.log('🚀 Starting Coy Discovery App (Backend + Frontend)...\n');

// 1. First build frontend bundle
console.log('📦 Building frontend bundle...');
const buildProc = spawn('node', ['frontend/build.js'], { stdio: 'inherit', shell: true });

buildProc.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Frontend build failed with code', code);
    process.exit(code);
  }

  console.log('\n🌟 Launching Backend and Frontend Servers...');

  // 2. Start Backend Server (port 5000)
  const backend = spawn('node', ['backend/src/server.js'], { stdio: 'inherit', shell: true });

  // 3. Start Frontend Dev Server (port 3000)
  const frontend = spawn('node', ['frontend/dev-server.js'], { stdio: 'inherit', shell: true });

  // Clean shutdown
  const handleExit = () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit();
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
});
