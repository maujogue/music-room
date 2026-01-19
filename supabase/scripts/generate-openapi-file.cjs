const fs = require('fs');
const path = require('path');

// Starting @ supabase/scripts/ folder ('cd' from Makefile)
const root = process.cwd();

const inputPath = path.resolve(root, '../docs/openapi.yml');
const outputPath = path.resolve(root, '../functions/openapi/openapi-file.ts');

if (!fs.existsSync(inputPath)) {
  console.error(`❌ Cannot find openapi.yml at: ${inputPath}`);
  process.exit(1);
}

const yamlContent = fs.readFileSync(inputPath, 'utf8');

// JSON.stringify
const tsContent =
  `// AUTO-GENERATED FILE.\n` +
  `// Do not edit directly. Use 'make api' instead.\n` +
  `// Source: docs/openapi.yml\n\n` +
  `export const OPENAPI_YAML = ${JSON.stringify(yamlContent)} as string;\n`;

fs.writeFileSync(outputPath, tsContent);

console.log(`✅ Generated ${outputPath}`);
console.log(`🧾 run supabase and open http://localhost:54321/functions/v1/openapi/swag`)
