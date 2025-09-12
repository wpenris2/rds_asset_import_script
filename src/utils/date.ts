// Date utilities for ISO formatting

/**
 * Get the current date in ISO format (to milliseconds)
 */
export const nowISO = () => new Date().toISOString();

/**
 * Get the current date in ISO format, to seconds (no ms)
 * regex replaces milliseconds with empty string
 */
export const nowISOSeconds = () => nowISO().replace(/\..*Z$/, 'Z');

/**
 * Get a safe ISO timestamp for filenames (seconds precision, no colons or dots)
 * regex replaces colons and dots for safe filename stuff
 */
export const isoFilenameTimestamp = () => nowISOSeconds().replace(/[:.]/g, '-').replace(/Z$/, '');
