// Centralized config shape (paths, toggles). Actual values live elsewhere.

export interface Config {
  // Input/output roots
  inputDirSvgs: string;             // where SVGs are read from
  inputDirJson: string;            // where JSONs are read from
  outputDir: string;              // where fonts/scss/assets go
  logDir?: string;                // optional logs folder

  // Theme JSON → SCSS
  themeSourceJson?: string;       // path to JSON with theme variables
  scssOutFile?: string;           // generated SCSS target

  // Bindings & codepoints
  bindingsFile?: string;          // persisted bindings json path
  startCodepoint?: number;        // e.g., 0xea01

  // Behaviour toggles
  dryRun?: boolean;
  failOnColor?: boolean;          // if true, colored SVGs cause failure
  windowsGuard?: boolean;         // optional Windows caveat

}