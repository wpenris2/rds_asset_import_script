// Realistic theme objects for merging tests (default and dark)
export const sampleThemeA = {
    default: {
        'button-border-radius': '4px',
        'button-border-style': 'solid',
        'badge-font-size': '11px',
    },
    dark: {
        'button-border-radius': '8px',
        'button-border-style': 'dashed',
        'badge-font-size': '12px',
    }
};

export const sampleThemeB = {
    default: {
        'button-border-width': '1px',
        'badge-font-size': '11px', // identical value, should not conflict
    },
    dark: {
        'button-border-width': '2px',
        'badge-font-size': '12px', // identical value, should not conflict
    }
};

export const sampleThemeConflict = {
    default: {
        'button-border-radius': '99px', // conflict with sampleThemeA
    },
    dark: {
        'button-border-radius': '8px',
    }
};
// Unnormalized key/value in target, for edge case tests
export const sampleUnnormalizedTarget = {
    'action-bar-row-gap': '24px',
    'badge-color-background': 'hsl(13, 100%, 44%)',
    '--already-normalized': 'foo',
};

export const sampleUnnormalizedTargetConflict = {
    'action-bar-row-gap': '24px',
    'badge-color-background': 'hsl(13, 100%, 44%)',
    '--already-normalized': 'foo',
};

export const sampleUnnormalizedSource = {
    'action-bar-row-gap': '24px',
    'badge-color-background': 'hsl(13, 100%, 44%)',
    '--already-normalized': 'foo',
};

export const sampleUnnormalizedSourceConflict = {
    'action-bar-row-gap': '32px', // conflict with target
    'badge-color-background': 'hsl(13, 100%, 44%)',
    '--already-normalized': 'foo',
};
// Sample theme JSON data for unit tests
// For parseThemesJson tests
export const sampleThemesJson = JSON.stringify({
    default: {
        'color-primary': 'red',
        '--color-secondary': 'blue',
        'font-size': '12px',
        'comma-list': 'a, b, c',
    }
});

export const expectedSampleThemesParsed = {
    default: {
        '--color-primary': 'red',
        '--color-secondary': 'blue',
        '--font-size': '12px',
        '--comma-list': 'unquote("a, b, c")',
    }
};
// Based on rds-components-tokens.json and rds-public-tokens.json

export const sampleComponentsTokens = {
    "default": {
        "action-bar-column-gap": "24px",
        "action-bar-row-gap": "24px",
        "annotation-border-radius": "8px",
        "annotation-color-background": "hsl(0, 0%, 100%)",
        "badge-color-background": "hsl(13, 100%, 44%)"
    }
};

export const samplePublicTokens = {
    "default": {
        "--rds-app-navigation-color-icon": "hsl(219, 2%, 46%)",
        "--rds-app-navigation-color-icon-selected": "hsl(219, 100%, 50%)",
        "--rds-body-font-size": "16px",
        "--rds-border-radius-default": "4px"
    }
};

export const sampleMultiTheme = {
    "default": {
        "button-border-radius": "4px",
        "button-border-style": "solid"
    },
    "dark": {
        "button-border-radius": "8px",
        "button-border-style": "dashed"
    }
};

export const sampleConflict = {
    "default": {
        "action-bar-row-gap": "24px"
    }
};
export const sampleConflict2 = {
    "default": {
        "action-bar-row-gap": "32px" // Different value, should trigger error
    }
};
// Test data for diffThemes
export const diffPrev = {
    default: {
        '--a': '1',
        '--b': '2',
        '--c': '3',
    },
    dark: {
        '--a': '2',
        '--b': '3',
    }
};
export const diffNext = {
    default: {
        '--a': '1',
        '--b': '22', // changed
        '--d': '4',  // added
    },
    dark: {
        '--a': '2',
        '--c': '5',  // added
    },
    light: {
        '--a': '10', // new theme
    }
};
export const diffExpected: {
    theme: string;
    added: Record<string, string>;
    removed: Record<string, string>;
    changed: Array<{ key: string; oldValue: string; newValue: string }>;
}[] = [
        {
            theme: 'dark',
            added: { '--c': '5' },
            removed: { '--b': '3' },
            changed: [],
        },
        {
            theme: 'default',
            added: { '--d': '4' },
            removed: { '--c': '3' },
            changed: [
                { key: '--b', oldValue: '2', newValue: '22' }
            ],
        },
        {
            theme: 'light',
            added: { '--a': '10' },
            removed: {},
            changed: [],
        }
    ];
export const diffOnlyPrev = { default: { '--a': '1', '--b': '2' } };
export const diffOnlyPrevExpected = [
    {
        theme: 'default',
        added: {},
        removed: { '--a': '1', '--b': '2' },
        changed: [],
    }
];
export const diffOnlyNext = { default: { '--a': '1', '--b': '2' } };
export const diffOnlyNextExpected = [
    {
        theme: 'default',
        added: { '--a': '1', '--b': '2' },
        removed: {},
        changed: [],
    }
];


// Test data for totalsFromDiff
export const totalsFromDiffTypical: {
    theme: string;
    added: Record<string, string>;
    removed: Record<string, string>;
    changed: Array<{ key: string; oldValue: string; newValue: string }>;
}[] = [
    { theme: 'default', added: { '--a': '1' }, removed: { '--b': '2' }, changed: [{ key: '--c', oldValue: '3', newValue: '4' }] },
    { theme: 'dark', added: {}, removed: {}, changed: [] }
];


// Normalized theme object for SCSS map tests
export const sampleScssMapTheme = {
    default: {
        '--button-border-radius': '4px',
        '--button-border-style': 'solid',
    },
    dark: {
        '--button-border-radius': '8px',
        '--button-border-style': 'dashed',
    }
};

// Test data for getOrCalculateScssMetadata
export const mockScssMetaPath = '/tmp/mock-scss-file.scss';
export const mockNow = '2025-09-12T12:00:00.000Z';
export const mockOldDate = '2024-01-01T00:00:00.000Z';
export const scssWithMeta = `/*\nAUTO-GENERATED BY SCRIPT\nGenerated: ${mockOldDate}\nLast Updated: 2024-01-02T00:00:00.000Z\n*/\n$enableFallback: true !default;`;
export const scssWithOnlyGenerated = `/*\nGenerated: ${mockOldDate}\n*/`;
export const scssWithFallbackFalse = `/*\nGenerated: ${mockOldDate}\n*/\n$enableFallback: false !default;`;

