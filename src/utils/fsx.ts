// utility responsible for file system ops; reading, writing, and ensuring directories

import fs from 'fs/promises';
import path from 'path';

// Ensure a directory exists
async function ensureDir(dir: string): Promise<boolean> {
  try {
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch (err) {
    throw new Error(`Failed to create directory "${dir}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Ensure a directory exists synchronously, returns the directory path
function ensureDirSync(dir: string): boolean {
  try {
    require('fs').mkdirSync(dir, { recursive: true });
    return true;
  } catch (err) {
    throw new Error(`Failed to create directory "${dir}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Write text to a file, returns the file path
function writeFile(filePath: string, text: string): Promise<string> {
  try {
    fsx.ensureDirSync(path.dirname(filePath));
    return fs.writeFile(filePath, text, 'utf8').then(() => filePath);
  } catch (err) {
    throw new Error(`Failed to write file "${filePath}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Read text from a file, returns the file content
/**
 * Reads text from a file. If allowEmpty is true, returns null if file is not found.
 */
async function readFile(filePath: string, allowEmpty = false): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (err: any) {
    // If allowEmpty is true and the file is not found, return null or 
    if (allowEmpty && (err.code === 'ENOENT' || err.message?.includes('no such file or directory'))) {
      return null;
    }
    throw new Error(`Failed to read file "${filePath}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Join directory and filename into a full path
function joinPath(dir: string, filename: string): string {
  return path.join(dir, filename);
}


// List all files in a directory with input extension (async)
async function listFilesWithExtension(dir: string, ext: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith(ext));
  } catch (err) {
    throw new Error(`Failed to list files in directory "${dir}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

// Check if a file exists (sync)
function existsSync(filePath: string): boolean {
  try {
    return require('fs').existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Rename a file (async)
async function rename(oldPath: string, newPath: string): Promise<void> {
  try {
    await fs.rename(oldPath, newPath);
  } catch (err) {
    throw new Error(`Failed to rename file from "${oldPath}" to "${newPath}": ${err instanceof Error ? err.message : String(err)}`);
  }
}

export const fsx = {
  ensureDir,
  ensureDirSync,
  writeFile,
  readFile,
  joinPath,
  listFilesWithExtension,
  existsSync,
  rename,
};

