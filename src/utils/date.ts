// Date utilities for ISO formatting

/**
 * Get the current date in ISO format (to milliseconds)
 */
export const nowISO = () => new Date().toISOString();

/**
 * Get the current date in ISO format, to seconds (no ms)
 */

export const nowISOSeconds = () => new Date().toISOString().replace(/\..*Z$/, 'Z');

/**
 * Get a safe ISO timestamp for filenames (seconds precision, no colons or dots)
 */
export const isoFilenameTimestamp = () => nowISOSeconds().replace(/[:.]/g, '-');
