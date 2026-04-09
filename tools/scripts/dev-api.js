const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const workspaceRoot = process.cwd();
const buildScript = path.join(
  workspaceRoot,
  'tools',
  'scripts',
  'run-typescript-projects.js',
);
const serverEntry = path.join(workspaceRoot, 'apps', 'api', 'dist', 'server.js');

const watchTargets = [
  'apps/api/src',
  'apps/api/tsconfig.json',
  'apps/api/tsconfig.typecheck.json',
  'packages/shared-types/src',
  'packages/shared-types/tsconfig.json',
  'packages/shared-utils/src',
  'packages/shared-utils/tsconfig.json',
  'packages/shared-utils/tsconfig.typecheck.json',
  'package.json',
  'tsconfig.base.json',
];

const watchers = [];
let buildProcess = null;
let serverProcess = null;
let debounceTimer = null;
let pendingBuild = false;
let shuttingDown = false;

function log(message) {
  console.log(`[api:dev] ${message}`);
}

function createWatchers() {
  for (const target of watchTargets) {
    const absoluteTarget = path.join(workspaceRoot, target);
    const stats = fs.statSync(absoluteTarget);
    const watcher = fs.watch(
      absoluteTarget,
      stats.isDirectory() ? { recursive: true } : undefined,
      (_eventType, filename) => {
        if (shuttingDown) {
          return;
        }

        const changedPath = filename
          ? path.join(target, filename.toString())
          : target;

        scheduleBuild(changedPath);
      },
    );

    watchers.push(watcher);
  }
}

function killProcess(childProcess) {
  return new Promise((resolve) => {
    if (!childProcess || childProcess.exitCode !== null) {
      resolve();
      return;
    }

    childProcess.once('exit', () => {
      resolve();
    });

    childProcess.kill('SIGTERM');

    setTimeout(() => {
      if (childProcess.exitCode === null) {
        childProcess.kill('SIGKILL');
      }
    }, 2000);
  });
}

function startServer() {
  if (shuttingDown) {
    return;
  }

  log('starting API server');

  serverProcess = spawn(process.execPath, [serverEntry], {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });

  serverProcess.once('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    log(
      `API server exited (${signal ?? code ?? 'unknown'}). Waiting for the next successful build.`,
    );
    serverProcess = null;
  });
}

async function restartServer() {
  if (shuttingDown) {
    return;
  }

  if (!fs.existsSync(serverEntry)) {
    log('build completed but apps/api/dist/server.js is missing');
    return;
  }

  if (!serverProcess) {
    startServer();
    return;
  }

  log('restarting API server');
  const currentServer = serverProcess;
  serverProcess = null;
  await killProcess(currentServer);

  if (!shuttingDown) {
    startServer();
  }
}

function runBuild() {
  if (shuttingDown) {
    return;
  }

  if (buildProcess) {
    pendingBuild = true;
    return;
  }

  log('building changed TypeScript projects');

  buildProcess = spawn(process.execPath, [buildScript, 'build'], {
    cwd: workspaceRoot,
    stdio: 'inherit',
  });

  buildProcess.once('exit', async (code, signal) => {
    buildProcess = null;

    if (shuttingDown) {
      return;
    }

    if (code === 0) {
      await restartServer();
    } else {
      log(
        `build failed (${signal ?? code ?? 'unknown'}). Keeping the current server process.`,
      );
    }

    if (pendingBuild) {
      pendingBuild = false;
      runBuild();
    }
  });
}

function scheduleBuild(changedPath) {
  log(`change detected in ${changedPath}`);

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    runBuild();
  }, 150);
}

async function shutdown(exitCode) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  for (const watcher of watchers) {
    watcher.close();
  }

  await killProcess(buildProcess);
  await killProcess(serverProcess);
  process.exit(exitCode);
}

process.on('SIGINT', () => {
  shutdown(0);
});

process.on('SIGTERM', () => {
  shutdown(0);
});

createWatchers();
runBuild();
