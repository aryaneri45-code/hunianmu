const path = require('node:path');

module.exports = {
  apps: [{
    name: 'hunianmu',
    cwd: path.resolve(__dirname, '..'),
    script: 'backend/dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    kill_timeout: 10000,
    env: { NODE_ENV: 'production', HOST: '127.0.0.1', PORT: 8821 },
    time: true,
  }],
};
