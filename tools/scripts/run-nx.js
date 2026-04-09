const { spawnSync } = require('node:child_process');

process.env.NX_DAEMON ??= 'false';
process.env.NX_ISOLATE_PLUGINS ??= 'false';

const nxBin = require.resolve('nx/bin/nx.js');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [nxBin, ...args], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
