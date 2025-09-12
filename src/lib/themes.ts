// Responsibilities: parse Themes JSON, diff, and build SCSS. Pure functions → easy to test.

import type { Themes, ThemeVariables, ThemeDiff } from '../types/';
import { fsx } from '../utils/fsx';
import { nowISO } from '../utils/date';


/** Ensure CSS var names start with `--name`, even if it doesn't. */
export function normalizeCssVarName(name: string): string {
    if (name == null || name === '') {
        throw new Error('CSS variable name must not be empty or null');
    }
    return name.startsWith('--') ? name : `--${name}`;
}


/** Clean a CSS value: strip !important, trailing commas; wrap comma values in unquote("..."). */
export function normalizeCssValue(raw: unknown): string {
    if (raw == null || raw === '') throw new Error('CSS variable value must not be empty or null');

    let cleanedValue = typeof raw === 'string' ? raw : String(raw);
    cleanedValue = cleanedValue.replace(/\s*!important\s*/gi, ''); //take out important
    cleanedValue = cleanedValue.trim().replace(/,+\s*$/g, '');  //take out trailing commas
    if (cleanedValue.includes(',') && !/^unquote\(/.test(cleanedValue)) { //no double unquote 
        cleanedValue = `unquote("${cleanedValue.replace(/"/g, '\\"')}")`;
    }
    return cleanedValue;
}


// takes in a target and source theme variables, merges source into target;
// if double keys with different values, then throw error.
//I'd rather have this be a private function, but I guess it's not really an issue
export function mergeVars(target: ThemeVariables, vars: ThemeVariables) {
    for (const [key, val] of Object.entries(vars)) {
        const normKey = normalizeCssVarName(key);
        const normVal = normalizeCssValue(val);
        const hasUnnormKey = key in target;
        const hasNormKey = normKey in target;

        if (hasNormKey) {
            if (target[normKey] !== normVal) {
                throw new Error(`Duplicate CSS variable name with different values detected: ${normKey} (${target[normKey]} vs ${normVal})`);
            }
            continue; // we do not need to set the value - it is already there.
        }

        if (hasUnnormKey && target[key] !== normVal) {
            throw new Error(`Duplicate CSS variable name with different values detected: ${normKey} (${target[key]} vs ${normVal})`);
        }

        if (hasUnnormKey) {
            // Value is the same, replace with normalized key
            delete target[key];
            target[normKey] = normVal;
            continue;
        }

        target[normKey] = normVal;
    }
}

// merges multiple theme objects jsons with css vars into one, normalizing names and values
export function mergeThemeObjects(objects: Themes[]): Themes {
    //check for empty input
    if (!objects.length || objects.length === 0) throw new Error('No theme objects provided for merging.');
    //check for any empty or invalid theme object in the array
    for (const obj of objects) {
        if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
            throw new Error('Theme object in mergeThemeObjects is empty or invalid.');
        }
    }

    const out: Themes = {};               // 1. Prepare empty output object
    for (const obj of objects) {          // 2. Process each theme object in the input array
        for (const [theme, vars] of Object.entries(obj)) {  // 3. For each theme in the object (e.g., "default", "dark")
            out[theme] ??= {};                // 4. Initialize (empty) theme object in output if undefined/null
            mergeVars(out[theme], vars);      // 5-6. Normalize and store each variable
        }
    }

    // Sort the keys for each theme
    for (const theme of Object.keys(out)) {
        const sortedEntries = Object.entries(out[theme]).sort(([key], [value]) => key.localeCompare(value));
        out[theme] = Object.fromEntries(sortedEntries);
    }
    return out;
}


/** Parse JSON string into Themes object with minimal validation, with polishing css var name + value. */
export function parseThemesJson(text: string): Themes {
    const data = JSON.parse(text) as unknown;             // Parse JSON string to data object with any type
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {      // Validate top-level object
        throw new Error('Themes JSON must be an object.');  // Error if not object, null, or array
    }
    const out: Themes = {};                               // Prepare output object

    // For each theme in parsed data
    for (const [theme, vars] of Object.entries(data as Record<string, unknown>)) {
        if (typeof vars !== 'object' || vars === null || Array.isArray(vars)) { // Validate 1 theme object
            throw new Error(`Theme "${theme}" must be an object.`);
        }
        const ThemeVariables: ThemeVariables = {};
        for (const [key, value] of Object.entries(vars as Record<string, unknown>)) {
            if (typeof key !== 'string' || key === '') { // Validate variable name = non-empty string
                throw new Error(`Theme variable key in theme "${theme}" must be a non-empty string.`);
            }
            if (!(typeof value === 'string' || typeof value === 'number')) { // Validate variable value = string or number
                throw new Error(`Theme variable value for key "${key}" in theme "${theme}" must be a string or number.`);
            }
            ThemeVariables[normalizeCssVarName(key)] = normalizeCssValue(value);
        }
        out[theme] = ThemeVariables; // Store theme variables in output
    }
    return out; // Return parsed and normalized themes
}


/**
 * Compare two Themes objects and return a list of differences for each theme.
 * Reports which variables were added, removed, or changed between prev and next.
 */
export function diffThemes(prev: Themes = {}, next: Themes = {}): ThemeDiff[] {
    // Get all theme names from both prev and next
    const themeNames = Array.from(new Set([...Object.keys(prev), ...Object.keys(next)])).sort();

    const diffOut: ThemeDiff[] = [];                // Prepare output array
    for (const cssVar of themeNames) {              // For each theme name
        const cssVarsPrev = prev[cssVar] ?? {};     // Get previous theme name variables (or empty)
        const cssVarsNext = next[cssVar] ?? {};     // Get next theme name variables (or empty)
        const added: Record<string, string> = {};   // Track added variables
        const removed: Record<string, string> = {}; // Track removed variables
        const changed: Array<{ key: string; oldValue: string; newValue: string }> = []; // Track changed variables

        // Get all variable names in theme
        const keys = Array.from(new Set([...Object.keys(cssVarsPrev), ...Object.keys(cssVarsNext)])).sort();
        for (const k of keys) { // For each variable name
            if (!(k in cssVarsPrev)) {
                added[k] = cssVarsNext[k]!; // If not in prev, it's added
                continue;
            }
            if (!(k in cssVarsNext)) {
                removed[k] = cssVarsPrev[k]!; // If not in next, it's removed
                continue;
            }
            if (cssVarsPrev[k] !== cssVarsNext[k]) {
                // If values differ, record the change as old -> new
                changed.push({
                    key: k,
                    oldValue: cssVarsPrev[k],
                    newValue: cssVarsNext[k]
                });
            }
        }
        diffOut.push({ theme: cssVar, added, removed, changed }); // Store diff for this theme
    }
    return diffOut; // Return all theme diffs
}


/**
 * Pretty-print a list of theme diffs for human-readable output.
 * For each theme, shows how many variables were added, removed, or changed.
 * Lists added, removed, and changed variables, with changed shown as old -> new.
 * Returns a formatted string summary, including a total summary at the end.
 */
export function formatThemeDiffs(themeDiffCol: ThemeDiff[]): string {
    const lines: string[] = [];             // Collect output lines, string collection.
    let A = 0, R = 0, C = 0;                // Track total added, removed, changed
    for (const diff of themeDiffCol) {            // For each theme diff
        const added = Object.keys(diff.added);     // List of added variable names
        const removed = Object.keys(diff.removed);   // List of removed variable names
        const changed = diff.changed;                // List of changed variable objects
        A += added.length; R += removed.length; C += changed.length; // Update totals
        // Print theme summary line
        lines.push(`[${diff.theme}] +${added.length}  -${removed.length}  ~${changed.length}`);
        // Print added variables
        if (added.length) lines.push(`  Added   : ${added.join(', \n')}`);
        // Print removed variables
        if (removed.length) lines.push(`  Removed : ${removed.join(', \n')}`);
        // Print changed variables with old -> new
        if (changed.length) {
            lines.push(`  Changed :`);
            for (const ch of changed) {
                // Show variable name and value change
                lines.push(`    ${ch.key} : ${ch.oldValue} -> ${ch.newValue}`);
            }
        }
        lines.push(''); // Blank line between themes
    }

    // Print summary or no changes message
    if (A === 0 && R === 0 && C === 0) {
        lines.push('No token changes detected.');
    } else {
        lines.push(`Summary: +${A}  -${R}  ~${C}`);
    }
    return lines.join('\n'); // Join all lines into a single string
}



/**
 * Format a summary of theme variable counts for initial creation.
 * Outputs a human-readable string listing each theme and its variable count,
 * plus a total count at the end. Intended for display/logging.
 */
export function formatFirstRunCounts(themes: Themes): string {
    if (!themes || typeof themes !== 'object' || Array.isArray(themes) || Object.keys(themes).length === 0) {
        throw new Error('No themes provided for initial count summary.');
    }
    const lines: string[] = ['Initial creation — theme variables detected:']; // Collect output lines
    let total = 0;                                                            // Track total variable count
    const pad = Math.max(0, ...Object.keys(themes).map(n => n.length));       // Calculate padding for theme names to get nice table
    for (const [t, vars] of Object.entries(themes)) {                         // Iterate over each theme
        const n = Object.keys(vars).length;                                     // Count variables in theme
        total += n;                                                             // Update total count
        lines.push(`  ${t.padEnd(pad)} : ${n} variables`);                      // Add theme variable count to output
    }
    lines.push(`Total: ${total} variables initialised`);                      // Add total variable count to output
    return lines.join('\n');                                                  // Join all lines into a single string
}



/**
 * Calculate total counts of added, removed, and changed variables from an array of ThemeDiffs.
 * Returns an object with the overall numbers for each type of change across all themes.
 */
export function totalsFromDiff(themeDiffCol: ThemeDiff[])
    : { added: number; removed: number; changed: number } {
    if (!Array.isArray(themeDiffCol)) {
        throw new Error('Input to totalsFromDiff must be an array of ThemeDiffs.');
    }
    let added = 0, removed = 0, changed = 0;                // Initialize counters
    for (const ThemeDiff of themeDiffCol) {                 // Iterate over each theme diff
        added += Object.keys(ThemeDiff.added).length;       // Count added variables
        removed += Object.keys(ThemeDiff.removed).length;   // Count removed variables
        changed += ThemeDiff.changed.length;                // Count changed variables
    }
    return { added, removed, changed };                     // Return the totals
}

/**
 * Build the SCSS $themes map string from a Themes object.
 * Returns a string containing the SCSS map definition, sorted by theme and variable name.
 * Example output:
 * $themes: (
 *   theme1: (
 *     --color-primary: #123456,
 *     --color-secondary: #abcdef
 *   ),
 *   theme2: (
 *     ...
 *   )
 * ) !default;
 */
export function buildScssThemeMap(themes: Themes): string {
    if (!themes || typeof themes !== 'object' || Array.isArray(themes) || Object.keys(themes).length === 0) {
        throw new Error('No themes provided for SCSS map generation.');
    }
    const themeEntries = Object.entries(themes)         // Get theme entries
        .sort(([a], [b]) => a.localeCompare(b))           // Sort themes by name
        .map(([themeName, variables]) => {                // Map each theme to its SCSS representation
            const variableLines = Object.entries(variables) // Get variable entries
                .sort(([a], [b]) => a.localeCompare(b))       // Sort variables by name
                .map(([varName, value]) => `${varName}: ${value}`)  // Format each variable as SCSS key-value
                .join(',\n    ');                                   // Join all variables for a theme, indented for readability
            return `${themeName}: (\n    ${variableLines}\n  )`;  // Return the SCSS representation for the theme
        });
    return `$themes: (\n  ${themeEntries.join(',\n  ')}\n) !default;`;   // Return the complete SCSS map
}

/**
 * Generate a complete SCSS file for all themes.
 *
 * @param themes - The input themes object.
 * @param opts - Options object (all required):
 *   - enableFallback: boolean — Whether to enable fallback in SCSS output
 *   - generatedDate: string — The generation timestamp
 *   - lastUpdatedDate: string — The last updated timestamp
 *   - changeLogText: string — Human-readable change log
 *   - diffText: string — Detailed diff output
 *   - scssMap: string — The SCSS map string to embed
 * @returns The full SCSS source as a string, ready to write to disk.
 */
export function buildScss(
    themes: Themes,
    opts: {
        enableFallback: boolean;
        generatedDate: string;
        lastUpdatedDate: string;
        changeLogText: string;
        diffText: string;
        scssMap: string;
    }
): string {
    const {
        enableFallback = false,
        generatedDate = '',
        lastUpdatedDate = '',
        changeLogText = '',
        diffText = '',
        scssMap = ''
    } = opts;

    const formattedChangeLog = changeLogText
        ? changeLogText.split('\n').map(l => `  ${l}`).join('\n')
        : '';
    const formattedDiff = diffText
        ? diffText.split('\n').map(l => `  ${l}`).join('\n')
        : '';
    const fallbackStr = String(enableFallback);

    const scssBody = `/*
    AUTO-GENERATED BY SCRIPT — DO NOT EDIT.
    Generated: ${generatedDate}
    Last Updated: ${lastUpdatedDate}

    Change Log:
${formattedChangeLog}

    Diff:
${formattedDiff}
*/

$enableFallback: ${fallbackStr} !default;

// SCSS Map with all RDS Css Variables
${scssMap}

// Compile-time: return a token's value from a theme
@function theme-var($theme, $token) {
    @return map-get(map-get($themes, $theme), $token);
}

// Compile-time: apply a theme token to a property
@mixin theme-prop($property, $theme, $token) {
    #{$property}: theme-var($theme, $token);
}

/* Runtime: function returning var(--token, fallback)
     - If $enableFallback is false, returns var(--token) with no fallback
     - If true, auto-picks fallback from $themes[$theme][$token] (default "default")
     - If token not found and $fallback provided, uses that
*/
@function applyvar($token, $theme: default, $fallback: null) {
    @if $enableFallback == false {
        @return var(#{$token});
    }
    @if map-has-key($themes, $theme) and map-has-key(map-get($themes, $theme), $token) {
        @return var(#{$token}, #{map-get(map-get($themes, $theme), $token)});
    } @else if $fallback != null {
        @return var(#{$token}, #{$fallback});
    } @else {
        @return var(#{$token});
    }
}

// Emit CSS variables for all themes under [data-theme="..."]
@each $theme, $vars in $themes {
    :root[data-theme="#{$theme}"] {
        @each $name, $value in $vars {
            #{$name}: #{$value};
        }
    }
}
`.trim();

    return `${scssBody}\n`;
}

/**
 * Load all .json files from a directory, parse them as Themes, and merge into one Themes object.
 */
export async function loadAndMergeJsons(dir: string): Promise<Themes> {
    const files = await fsx.listFilesWithExtension(dir, '.json');
    if (!files.length) throw new Error(`❌ No JSON files found in: ${dir}`);
    const objects: Themes[] = [];
    for (const file of files) {
        const txt = await fsx.readFile(fsx.joinPath(dir, file));
        if (txt) {
            objects.push(parseThemesJson(txt));
        }
    }
    return mergeThemeObjects(objects);
}


/** Extract the generated date from SCSS file content, or return now if not found. */
export function extractOrCreateGeneratedDate(scssContent: string | null): string {
    const now = nowISO();
    if (!scssContent) return now; // If no content, return current time
    const match = scssContent.match(/Generated:\s*(.*)/); // Extract generated date
    return match ? match[1].trim() : now; // Return extracted date or current time
}

/** Extract the $enableFallback value from SCSS file content, or use the default. */
export function extractOrCreatePreservedFallback(scssContent: string | null, defaultFallback: boolean): boolean {
    if (!scssContent) return defaultFallback;
    const match = scssContent.match(/\$enableFallback:\s*(true|false)\s*!default;/);
    return match ? match[1] === 'true' : defaultFallback;
}
