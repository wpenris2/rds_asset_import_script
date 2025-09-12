import {
    describe,
    it,
    expect,
    vi,
    beforeEach
} from 'vitest';
import {
    normalizeCssVarName,
    normalizeCssValue,
    mergeThemeObjects,
    mergeVars,
    parseThemesJson,
    diffThemes,
    formatThemeDiffs,
    totalsFromDiff,
    formatFirstRunCounts,
    buildScssThemeMap,
    loadAndMergeJsons,
    buildScss,
    extractOrCreateGeneratedDate,
    extractOrCreatePreservedFallback,
} from './themes';
import { promises as fs } from 'fs';
import { nowISO } from '../utils/date';
import { tmpdir } from 'os';
import { join } from 'path';

import * as testData from './themes.test.data';

describe('normalizeCssVarName', () => {
    it(`adds '--' to action-bar-row-gap (from rds-components-tokens.json)`, () => {
        expect(normalizeCssVarName('action-bar-row-gap')).toBe('--action-bar-row-gap');
    });

    it(`keeps '--rds-app-navigation-color-icon' as is (no '--' addition)`, () => {
        expect(normalizeCssVarName('--rds-app-navigation-color-icon')).toBe('--rds-app-navigation-color-icon');
    });

    it(`throws an error for empty string ''`, () => {
        expect(() => normalizeCssVarName('')).toThrow('CSS variable name must not be empty or null');
    });

    it(`throws an error for null`, () => {
        // @ts-expect-error: testing null input
        expect(() => normalizeCssVarName(null)).toThrow('CSS variable name must not be empty or null');
    });
});




describe('normalizeCssValue', () => {
    it(`normalizes a real hsl value from JSON; 'hsl(219, 2%, 46%)' gets unquote; `, () => {
        expect(normalizeCssValue('hsl(219, 2%, 46%)')).toBe('unquote("hsl(219, 2%, 46%)")');
    });

    it(`normalizes a real px value from JSON; '48px' stays the same; `, () => {
        expect(normalizeCssValue('48px')).toBe('48px');
    });

    it(`normalizes a real font-weight value from JSON; '800' stays the same; `, () => {
        expect(normalizeCssValue('800')).toBe('800');
    });

    it(`removes !important from a custom value: 'red !important' => 'red'`, () => {
        expect(normalizeCssValue('red !important')).toBe('red');
    });

    // add another removes !important with an hsl value
    it(`removes !important from an hsl value: 'hsl(219, 2%, 46%) !important' => 'unquote("hsl(219, 2%, 46%)")'`, () => {
        expect(normalizeCssValue('hsl(219, 2%, 46%) !important')).toBe('unquote("hsl(219, 2%, 46%)")');
    });

    it(`trims whitespace from a custom value: '  red  ' => 'red'`, () => {
        expect(normalizeCssValue('  red  ')).toBe('red');
    });

    it(`handles comma-separated values: 'red, blue' => 'unquote("red, blue")'`, () => {
        expect(normalizeCssValue('red, blue')).toBe('unquote("red, blue")');
    });

    it(`removes !important from a comma-separated value: 'red, blue !important' => 'unquote("red, blue")'`, () => {
        expect(normalizeCssValue('red, blue !important')).toBe('unquote("red, blue")');
    });

    it(`handles unquoted comma-separated values: a value with unquote does not get it twice`, () => {
        expect(normalizeCssValue('unquote("red, blue")')).toBe('unquote("red, blue")');
    });

    it(`handles non-string values: '123' => '123'`, () => {
        expect(normalizeCssValue(123)).toBe('123');
    });

    it(`throws an error for empty string ''`, () => {
        expect(() => normalizeCssValue('')).toThrow();
    });

    it(`throws an error for null`, () => {
        expect(() => normalizeCssValue(null)).toThrow();
    });
});


describe('mergeVars', () => {
    it('merges non-overlapping variables from sampleComponentsTokens', () => {
        const target = { ...testData.sampleComponentsTokens.default };
        mergeVars(target, { 'badge-font-size': '11px' });
        expect(target).toEqual({
            ...testData.sampleComponentsTokens.default,
            '--badge-font-size': '11px',
        });
    });

    it(`throws on duplicate key with different value from sampleConflict; added --action-bar-row-gap with value '24px', which already existed`, () => {
        const target = { '--action-bar-row-gap': '24px' };
        expect(() => mergeVars(target, testData.sampleConflict2.default)).toThrow();
    });

    it(`does not throw or overwrite on duplicate key with same value from sampleConflict: added --action-bar-row-gap with value 24px, which already existed`, () => {
        const target = { '--action-bar-row-gap': '24px' };
        mergeVars(target, { 'action-bar-row-gap': '24px' });
        expect(target).toEqual({ '--action-bar-row-gap': '24px' });
    });

    it(`does not throw or duplicate when both target and source have non-normalized key with same value`, () => {
        const target = { 'action-bar-row-gap': '24px' };
        mergeVars(target, { 'action-bar-row-gap': '24px' });
        expect(target).toEqual({
            '--action-bar-row-gap': '24px'
        });
    });

    it(`throws if target has non-normalized key and source has non-normalized duplicate key with different value`, () => {
        const target = { 'action-bar-row-gap': '24px' };
        expect(() => mergeVars(target, { 'action-bar-row-gap': '32px' })).toThrow();
    });
});

describe('mergeThemeObjects', () => {
    it('merges theme objects with more than two theme names (default, dark, light)', () => {
        const themeA = {
            default: { 'a': '1', 'b': '2' },
            dark: { 'a': '2', 'b': '3' },
            light: { 'a': '3', 'b': '4' }
        };
        const themeB = {
            default: { 'c': '3' },
            dark: { 'c': '4' },
            light: { 'c': '5' }
        };
        const result = mergeThemeObjects([themeA, themeB]);
        expect(result).toEqual({
            default: {
                '--a': '1',
                '--b': '2',
                '--c': '3',
            },
            dark: {
                '--a': '2',
                '--b': '3',
                '--c': '4',
            },
            light: {
                '--a': '3',
                '--b': '4',
                '--c': '5',
            }
        });
    });

    it('throws when merging with a completely empty theme object list', () => {
        expect(() => mergeThemeObjects([{}])).toThrow();
    });

    it('returns the theme object if only one theme is passed into the function', () => {
        expect(mergeThemeObjects([testData.sampleThemeA])).toEqual({
            default: {
                '--button-border-radius': '4px',
                '--button-border-style': 'solid',
                '--badge-font-size': '11px',
            },
            dark: {
                '--button-border-radius': '8px',
                '--button-border-style': 'dashed',
                '--badge-font-size': '12px',
            }
        });
    });

    it('throws when merging a valid theme object with an empty theme object', () => {
        expect(() => mergeThemeObjects([{ default: { a: '1' } }, {}])).toThrow();
    });

    it('merges two theme objects with both default and dark themes (realistic use case)', () => {
        const result = mergeThemeObjects([testData.sampleThemeA, testData.sampleThemeB]);
        expect(result).toEqual({ //disregards the key order.
            default: {
                '--button-border-radius': '4px',
                '--button-border-style': 'solid',
                '--badge-font-size': '11px',
                '--button-border-width': '1px',
            },
            dark: {
                '--button-border-radius': '8px',
                '--button-border-style': 'dashed',
                '--badge-font-size': '12px',
                '--button-border-width': '2px',
            }
        });
    });

    //tests that the result is sorted in alphabetic order of keys
    it('merges two theme objects and results in alphabetically sorted keys', () => {
        const result = mergeThemeObjects([testData.sampleThemeA, testData.sampleThemeB]);
        // Use the expected output from the previous test as the scaffold
        const expectedDefaultKeys = [
            '--badge-font-size',
            '--button-border-radius',
            '--button-border-style',
            '--button-border-width',
        ];
        const expectedDarkKeys = [
            '--badge-font-size',
            '--button-border-radius',
            '--button-border-style',
            '--button-border-width',
        ];
        expect(Object.keys(result.default)).toEqual(expectedDefaultKeys); // Check that keys are in expected order
        expect(Object.keys(result.dark)).toEqual(expectedDarkKeys); // Check that keys are in expected order
    });

    it('merges two theme objects with overlapping variables and identical values (should not throw)', () => {
        // badge-font-size is identical in both, should not throw
        expect(() => mergeThemeObjects([testData.sampleThemeA, testData.sampleThemeB])).not.toThrow();
    });

    it('throws on conflicting variable values in the same theme (realistic use case)', () => {
        expect(() => mergeThemeObjects([
            testData.sampleThemeA,
            testData.sampleThemeConflict
        ])).toThrow();
    });

});


describe('parseThemesJson', () => {
    it('parses a valid single-theme JSON string and normalizes keys/values', () => {
        const json = testData.sampleThemesJson;
        const result = parseThemesJson(json);
        expect(result).toEqual(testData.expectedSampleThemesParsed);
    });

    it('parses a multi-theme JSON string and normalizes all keys/values', () => {
        const json = JSON.stringify(testData.sampleMultiTheme);
        const result = parseThemesJson(json);
        expect(result).toEqual({
            default: {
                '--button-border-radius': '4px',
                '--button-border-style': 'solid',
            },
            dark: {
                '--button-border-radius': '8px',
                '--button-border-style': 'dashed',
            }
        });
    });

    it('throws if the top-level JSON is not an object', () => {
        expect(() => parseThemesJson('[]')).toThrow();
        expect(() => parseThemesJson('null')).toThrow();
        expect(() => parseThemesJson('"string"')).toThrow();
    });

    it('throws if a theme value is not an object', () => {
        const json = JSON.stringify({ default: null });
        expect(() => parseThemesJson(json)).toThrow();
        const json2 = JSON.stringify({ default: 123 });
        expect(() => parseThemesJson(json2)).toThrow();
    });

    it('throws if a variable key or value is empty or null', () => {
        const json = JSON.stringify({ default: { '': 'red' } });
        expect(() => parseThemesJson(json)).toThrow();
        const json2 = JSON.stringify({ default: { color: '' } });
        expect(() => parseThemesJson(json2)).toThrow();
        const json3 = JSON.stringify({ default: { color: null } });
        expect(() => parseThemesJson(json3)).toThrow();
    });

    it('handles numeric values by stringifying them', () => {
        const json = JSON.stringify({ default: { size: 123 } });
        const result = parseThemesJson(json);
        expect(result).toEqual({ default: { '--size': '123' } });
    });
});


describe('diffThemes', () => {
    it('detects added, removed, and changed variables between two themes', () => {
        const prev = testData.diffPrev;
        const next = testData.diffNext;
        const result = diffThemes(prev, next);
        expect(result).toEqual(testData.diffExpected);
    });

    it('handles empty prev and next themes', () => {
        expect(diffThemes({}, {})).toEqual([]);
    });

    it('handles a theme present only in prev (all removed)', () => {
        const prev = testData.diffOnlyPrev;
        const next = {};
        const result = diffThemes(prev, next);
        expect(result).toEqual(testData.diffOnlyPrevExpected);
    });

    it('handles a theme present only in next (all added)', () => {
        const prev = {};
        const next = testData.diffOnlyNext;
        const result = diffThemes(prev, next);
        expect(result).toEqual(testData.diffOnlyNextExpected);
    });

    it('handles empty theme objects (no variables)', () => {
        const prev = { default: {} };
        const next = { default: {} };
        expect(diffThemes(prev, next)).toEqual([
            {
                theme: 'default',
                added: {},
                removed: {},
                changed: [],
            }
        ]);
    });
});

describe('formatThemeDiffs', () => {
    it('formats a typical diff output with added, removed, and changed', () => {
        const str = formatThemeDiffs(testData.diffExpected);
        expect(str).toContain('[dark] +1  -1  ~0');
        expect(str).toContain('Added   : --c');
        expect(str).toContain('Removed : --b');
        expect(str).toContain('[default] +1  -1  ~1');
        expect(str).toContain('Changed :');
        expect(str).toContain('--b : 2 -> 22');
        expect(str).toContain('[light] +1  -0  ~0');
        expect(str).toContain('Summary: +3  -2  ~1');
    });

    it('formats no changes as no token changes detected', () => {
        const str = formatThemeDiffs([]);
        expect(str).toContain('No token changes detected.');
    });

    it('formats only added variables', () => {
        const str = formatThemeDiffs(testData.diffOnlyNextExpected);
        expect(str).toContain('[default] +2  -0  ~0');
        expect(str).toContain('Added   : --a, \n--b');
        expect(str).toContain('Summary: +2  -0  ~0');
    });

    it('formats only removed variables', () => {
        const str = formatThemeDiffs(testData.diffOnlyPrevExpected);
        expect(str).toContain('[default] +0  -2  ~0');
        expect(str).toContain('Removed : --a, \n--b');
        expect(str).toContain('Summary: +0  -2  ~0');
    });
});

describe('formatFirstRunCounts', () => {
    it('formats a summary for a typical multi-theme object', () => {
        const themes = {
            default: { '--a': '1', '--b': '2' },
            dark: { '--a': '2', '--c': '3' }
        };
        const str = formatFirstRunCounts(themes);
        expect(str).toContain('Initial creation — theme variables detected:');
        expect(str).toContain('default');
        expect(str).toContain('dark');
        expect(str).toContain('2 variables');
        expect(str).toContain('Total: 4 variables initialised');
    });

    it('formats a summary for a single theme', () => {
        const themes = { default: { '--a': '1' } };
        const str = formatFirstRunCounts(themes);
        expect(str).toContain('default');
        expect(str).toContain('1 variables');
        expect(str).toContain('Total: 1 variables initialised');
    });

    it('throws if given an empty object', () => {
        expect(() => formatFirstRunCounts({})).toThrow();
    });

    it('throws if given null', () => {
        expect(() => formatFirstRunCounts(null as any)).toThrow();
    });

    it('throws if given an array', () => {
        expect(() => formatFirstRunCounts([] as any)).toThrow();
    });
});


describe('totalsFromDiff', () => {
    it('returns correct totals for a typical diff', () => {
        expect(totalsFromDiff(testData.totalsFromDiffTypical)).toEqual({ added: 1, removed: 1, changed: 1 });
    });

    it('returns zeros for an empty array', () => {
        expect(totalsFromDiff([])).toEqual({ added: 0, removed: 0, changed: 0 });
    });

    it('throws if input is null', () => {
        expect(() => totalsFromDiff(null as any)).toThrow();
    });

    it('throws if input is undefined', () => {
        expect(() => totalsFromDiff(undefined as any)).toThrow();
    });

    it('throws if input is an object', () => {
        expect(() => totalsFromDiff({} as any)).toThrow();
    });
});



describe('buildScssThemeMap', () => {
    it('generates correct SCSS map for a typical multi-theme object (normalized keys)', () => {
        const scss = buildScssThemeMap(testData.sampleScssMapTheme);
        // Should contain theme names and normalized variables, formatted as SCSS map
        expect(scss).toContain('$themes: (');
        expect(scss).toContain('default: (');
        expect(scss).toContain('dark: (');
        expect(scss).toContain('--button-border-radius: 4px');
        expect(scss).toContain('--button-border-style: solid');
        expect(scss).toContain('--button-border-radius: 8px');
        expect(scss).toContain('--button-border-style: dashed');
        expect(scss.trim().endsWith('!default;')).toBe(true);
    });

    it('sorts themes and variables alphabetically', () => {
        const input = {
            ztheme: { b: '2', a: '1' },
            atheme: { d: '4', c: '3' }
        };
        const scss = buildScssThemeMap(input as any);
        // Themes sorted: atheme, ztheme
        const athemeIdx = scss.indexOf('atheme:');
        const zthemeIdx = scss.indexOf('ztheme:');
        expect(athemeIdx).toBeLessThan(zthemeIdx);
        // Variables sorted: a, b and c, d
        const athemeBlock = scss.slice(athemeIdx, zthemeIdx);
        expect(athemeBlock.indexOf('c: 3')).toBeLessThan(athemeBlock.indexOf('d: 4'));
        const zthemeBlock = scss.slice(zthemeIdx);
        expect(zthemeBlock.indexOf('a: 1')).toBeLessThan(zthemeBlock.indexOf('b: 2'));
    });

    it('throws if given an empty object', () => {
        expect(() => buildScssThemeMap({} as any)).toThrow();
    });

    it('throws if given null', () => {
        expect(() => buildScssThemeMap(null as any)).toThrow();
    });

    it('throws if given an array', () => {
        expect(() => buildScssThemeMap([] as any)).toThrow();
    });
});


describe('loadAndMergeJsons', () => {
    it('merges multiple valid theme JSON files from a directory (using testData)', async () => {
        const dir = await fs.mkdtemp(join(tmpdir(), 'themes-test-'));
        try {
            const fileA = join(dir, 'a.json');
            const fileB = join(dir, 'b.json');
            await fs.writeFile(fileA, JSON.stringify(testData.sampleThemeA));
            await fs.writeFile(fileB, JSON.stringify(testData.sampleThemeB));
            const result = await loadAndMergeJsons(dir);
            expect(result).toEqual({
                default: {
                    '--button-border-radius': '4px',
                    '--button-border-style': 'solid',
                    '--badge-font-size': '11px',
                    '--button-border-width': '1px',
                },
                dark: {
                    '--button-border-radius': '8px',
                    '--button-border-style': 'dashed',
                    '--badge-font-size': '12px',
                    '--button-border-width': '2px',
                }
            });
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });

    it('throws if no JSON files are found', async () => {
        const dir = await fs.mkdtemp(join(tmpdir(), 'themes-test-empty-'));
        try {
            await expect(loadAndMergeJsons(dir)).rejects.toThrow();
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });

    it('throws if a file contains invalid JSON', async () => {
        const dir = await fs.mkdtemp(join(tmpdir(), 'themes-test-invalid-'));
        try {
            const file = join(dir, 'bad.json');
            await fs.writeFile(file, '{ not valid json }');
            await expect(loadAndMergeJsons(dir)).rejects.toThrow();
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });

    it('throws if a file contains an invalid theme object', async () => {
        const dir = await fs.mkdtemp(join(tmpdir(), 'themes-test-invalid-theme-'));
        try {
            const file = join(dir, 'bad.json');
            await fs.writeFile(file, JSON.stringify([]));
            await expect(loadAndMergeJsons(dir)).rejects.toThrow();
        } finally {
            await fs.rm(dir, { recursive: true, force: true });
        }
    });
});

describe('buildScss', () => {
    it('generates a SCSS file with all required sections and placeholder values', () => {
        const scss = buildScss(
            { default: { '--color': 'red' } },
            {
                enableFallback: true,
                generatedDate: '2025-09-12',
                lastUpdatedDate: '2025-09-11',
                changeLogText: 'Added color',
                diffText: 'No changes',
                scssMap: '$themes: (default: (--color: red)) !default;'
            }
        );
        expect(scss).toContain('AUTO-GENERATED BY SCRIPT');
        expect(scss).toContain('Generated: 2025-09-12');
        expect(scss).toContain('Last Updated: 2025-09-11');
        expect(scss).toContain('Change Log:');
        expect(scss).toContain('Added color');
        expect(scss).toContain('Diff:');
        expect(scss).toContain('No changes');
        expect(scss).toContain('$themes: (default: (--color: red)) !default;');
        expect(scss).toContain('$enableFallback: true !default;');
    });
});



describe('extractOrCreateGeneratedDate', () => {
    it('returns nowISO if content is null', () => {
        const now = nowISO();
        const result = extractOrCreateGeneratedDate(null);
        // Allow a small time difference
        expect(Math.abs(new Date(result).getTime() - new Date(now).getTime())).toBeLessThan(2000);
    });
    it('returns nowISO if no Generated line is present', () => {
        const now = nowISO();
        const result = extractOrCreateGeneratedDate('Some unrelated content');
        expect(Math.abs(new Date(result).getTime() - new Date(now).getTime())).toBeLessThan(2000);
    });
    it('extracts the generated date if present', () => {
        const result = extractOrCreateGeneratedDate('/*\nGenerated: 2024-01-01T12:00:00Z\n*/');
        expect(result).toBe('2024-01-01T12:00:00Z');
    });
});

describe('extractPreservedFallback', () => {
    it('returns true if content is null and defaultFallback is true', () => {
        expect(extractOrCreatePreservedFallback(null, true)).toBe(true);
    });
    it('returns false if content is null and defaultFallback is false', () => {
        expect(extractOrCreatePreservedFallback(null, false)).toBe(false);
    });
    it('returns true if no $enableFallback line is present and defaultFallback is true', () => {
        expect(extractOrCreatePreservedFallback('foo bar', true)).toBe(true);
    });
    it('returns false if no $enableFallback line is present and defaultFallback is false', () => {
        expect(extractOrCreatePreservedFallback('foo bar', false)).toBe(false);
    });
    it('extracts true if $enableFallback: true !default; is present', () => {
        expect(extractOrCreatePreservedFallback(' as as as $enableFallback: true !default;  ass sa', false)).toBe(true);
    });
    it('extracts false if $enableFallback: false !default; is present', () => {
        expect(extractOrCreatePreservedFallback('.   asdas $enableFallback: false !default;  asd ', true)).toBe(false);
    });
});