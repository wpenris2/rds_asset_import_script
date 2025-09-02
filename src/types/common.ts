// Shared primitives and utility typings used across the project.


// Hashing algorithms
export type HashAlgorithm = 'sha256' | 'md5';

export type Result<T> = (
  { ok: true; value: T; } | { ok: false; error: Error; }
);

// Logger interface for structured logging
export interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug?: (...args: unknown[]) => void;
}

/**
 * Thin interface to allow fs mocking in tests (memfs or custom).
 * Real implementation can wrap fs/promises.
 */
export interface FsLike {
  readFile(path: string, encoding: BufferEncoding): Promise<string>;
  writeFile(path: string, data: string | Uint8Array, encoding?: BufferEncoding): Promise<void>;
  mkdir(path: string, opts?: { recursive?: boolean }): Promise<void>;
  rm(path: string, opts: { recursive?: boolean; force?: boolean }): Promise<void>;
  stat(path: string): Promise<{ isDirectory(): boolean; isFile(): boolean }>;
  readdir(path: string): Promise<string[]>;
}