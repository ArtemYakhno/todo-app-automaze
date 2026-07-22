const { execSync } = require('child_process');

let input = '';
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let filePath;
  try {
    const data = JSON.parse(input);
    filePath = data.tool_input?.file_path || data.tool_response?.filePath;
  } catch {
    process.exit(0);
  }

  if (!filePath || !/\.(ts|tsx)$/.test(filePath)) {
    process.exit(0);
  }

  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/apps\/(backend|frontend)\//);
  if (!match) {
    process.exit(0);
  }
  const pkg = `@todo-app/${match[1]}`;
  const linter = 'eslint';

  try {
    execSync(`pnpm --filter ${pkg} exec ${linter} --fix "${filePath}"`, {
      cwd: process.cwd(),
      stdio: 'pipe',
    });
  } catch (err) {
    const output = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
    console.log(
      JSON.stringify({
        systemMessage: `${linter} found issues in ${filePath} (some may have been auto-fixed):\n${output.slice(0, 4000)}`,
      })
    );
  }
  process.exit(0);
});
