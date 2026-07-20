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

  try {
    execSync(`pnpm --filter ${pkg} run typecheck`, { cwd: process.cwd(), stdio: 'pipe' });
    process.exit(0);
  } catch (err) {
    const output = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
    console.log(
      JSON.stringify({
        systemMessage: `TypeScript errors after editing ${filePath} (${pkg}):\n${output.slice(0, 4000)}`,
      })
    );
    process.exit(0);
  }
});
