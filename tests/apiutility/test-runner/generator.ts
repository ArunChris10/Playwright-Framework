import fs from 'fs';
import path from 'path';
import { loadJSON } from '../utils/jsonUtils';

const parentConfigPath = path.resolve(__dirname, '../parent-config.json');
const outputDir = path.resolve(__dirname, '../generated-tests');

const parentConfig = loadJSON<any>(parentConfigPath);

// Clean and recreate output directory
if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true });
fs.mkdirSync(outputDir);

const importsBlock = `
import { test, request } from '@playwright/test';
import { runApiTestCase } from '../test-runner/dynamicRunnerHelper';
`;

parentConfig.testFiles.forEach((testFile: string, index: number) => {
  const fileName = path.basename(testFile, '.json').replace(/\s+/g, '_');
  const outputPath = path.join(outputDir, `${fileName}.spec.ts`);

  const content = `${importsBlock}
test.describe('${fileName}', () => {
  runApiTestCase('${testFile}');
});
`;

  fs.writeFileSync(outputPath, content);
});

console.log('Spec files generated in:', outputDir);
