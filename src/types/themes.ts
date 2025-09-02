// Theme JSON → SCSS generation domain types.

export interface ThemeVariables {
  [variable: string]: string; // e.g., "--color-primary": "#123456"
}

export interface Themes {
  [theme: string]: ThemeVariables; // e.g., "light": { ... }, "dark": { ... }
}

/** Diff result when comparing previous and next theme variable sets. */
export interface ThemeDiff {
  theme: string;
  added: Record<string, string>;
  removed: Record<string, string>;
  changed: Array<{ key: string; oldValue: string; newValue: string }>;
}