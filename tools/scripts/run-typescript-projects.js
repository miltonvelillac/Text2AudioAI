const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const mode = process.argv[2];

if (!['build', 'typecheck'].includes(mode)) {
  console.error('Usage: node tools/scripts/run-typescript-projects.js <build|typecheck>');
  process.exit(1);
}

const workspaceRoot = process.cwd();
const projects = [
  {
    name: 'shared-types',
    config: path.join(
      workspaceRoot,
      'packages/shared-types',
      mode === 'build' ? 'tsconfig.json' : 'tsconfig.typecheck.json',
    ),
  },
  {
    name: 'shared-utils',
    config: path.join(
      workspaceRoot,
      'packages/shared-utils',
      mode === 'build' ? 'tsconfig.json' : 'tsconfig.typecheck.json',
    ),
  },
];

const formatHost = {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => workspaceRoot,
  getNewLine: () => ts.sys.newLine,
};

function loadParsedConfig(configPath) {
  let configError = false;

  const parsed = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        configError = true;
        console.error(
          ts.formatDiagnosticsWithColorAndContext([diagnostic], formatHost),
        );
      },
    },
  );

  return configError ? null : parsed;
}

function compileProject(project) {
  console.log(`[${project.name}] ${mode}`);

  const parsed = loadParsedConfig(project.config);

  if (!parsed) {
    return false;
  }

  if (mode === 'build' && parsed.options.outDir) {
    fs.rmSync(parsed.options.outDir, { recursive: true, force: true });
  }

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options,
    projectReferences: parsed.projectReferences,
  });

  const emitResult = program.emit();
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  if (diagnostics.length > 0) {
    console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
    return false;
  }

  console.log(`[${project.name}] ok`);
  return true;
}

const failedProjects = projects.filter((project) => !compileProject(project));

process.exit(failedProjects.length === 0 ? 0 : 1);
