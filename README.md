# CSS Variable → SCSS Map Generator (strict source, MRDS target)

**Author:** W.Penris, 1/9/25

---

This script automates the generation of icon fonts, SCSS, and CSV mappings from a folder of SVG icons.

## Main Steps
- Reads all JSON theme files from the input directory
- Merges and normalizes theme variables
- Writes to `themesource/MRDS/web/rds-scss/rds-theme-variables.scss`
- First run: logs human-friendly counts per theme (no details)
- Later runs: logs added/removed/changed variables (diff)
- Persists `$enableFallback` (default false)
- Embeds usage instructions and timestamps in the SCSS output
- Backs up previous snapshot before overwriting
- Generates a detailed log file for each run

## Regression Test Scenarios (in JSON input files)
1. Change 3 variables and run script → should be visible in log and SCSS file as changed.
2. Remove 3 variables from various files and run script → should be visible in log and SCSS file as removed.
3. Add 3 variables and run script → should be visible in log and SCSS file as added.
4. Add 1 theme (e.g. "high-definition") with variables and run script → added theme should be visible in log and SCSS file.

---

## Usage

Run the generator script using npm:

```sh
npm run gen-scss
```

Or directly with ts-node:

```sh
npx ts-node src/features/gen-scss-from-json.ts
```

## Output
- SCSS file: `themesource/MRDS/web/rds-scss/rds-theme-variables.scss`
- Log file: `logs/` (timestamped)
- Snapshot file: (for diffing)

## Notes
- All file operations are error-safe and use utility functions.
- Configurable paths and options are centralized in `src/config.ts`.
- Detailed logs and console feedback are provided for each run.
