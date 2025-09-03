// utility responsible for file system ops; reading, writing, and ensuring directories

import fs from 'fs/promises';
import path from 'path';

// Ensure a directory exists
async function ensureDir(dir: string): Promise<boolean> {
  await fs.mkdir(dir, { recursive: true });
  return true;
}

// Ensure a directory exists synchronously, returns the directory path
function ensureDirSync(dir: string): boolean {
  require('fs').mkdirSync(dir, { recursive: true });
  return true;
}

// Write text to a file, returns the file path
function writeFile(filePath: string, text: string): Promise<string> {
  fsx.ensureDirSync(path.dirname(filePath));
  return fs.writeFile(filePath, text, 'utf8').then(() => filePath);
}

// Read text from a file, returns the file content
async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

// Join directory and filename into a full path
function joinPath(dir: string, filename: string): string {
  return path.join(dir, filename);
}


// File system utility functions to be exposed.
export const fsx = {
  ensureDir,
  ensureDirSync,
  writeFile,
  readFile,
  joinPath,
};

