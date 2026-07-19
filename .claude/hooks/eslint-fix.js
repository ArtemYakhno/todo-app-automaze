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

  try {
    execSync(`npx expo lint --fix "${filePath}"`, { cwd: process.cwd(), stdio: 'pipe' });
  } catch (err) {
    const output = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
    console.log(
      JSON.stringify({
        systemMessage: `ESLint знайшов проблеми у ${filePath} (частину виправлено автоматично):\n${output.slice(0, 4000)}`,
      })
    );
  }
  process.exit(0);
});
