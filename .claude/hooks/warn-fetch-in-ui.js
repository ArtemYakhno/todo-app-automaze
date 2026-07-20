const fs = require('fs');
const path = require('path');

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
  const inUiDir = /apps\/frontend\/src\/(components|pages|features)\//.test(normalized);
  if (!inUiDir) {
    process.exit(0);
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch {
    process.exit(0);
  }

  if (/\bfetch\(/.test(content) || /\baxios\./.test(content) || /\baxios\(/.test(content)) {
    console.log(
      JSON.stringify({
        systemMessage: `Warning: ${path.basename(
          filePath
        )} contains a direct fetch()/axios call inside components/pages/features. Per CLAUDE.md, request logic belongs in apps/frontend/src/api/ or queries/.`,
      })
    );
  }
  process.exit(0);
});
