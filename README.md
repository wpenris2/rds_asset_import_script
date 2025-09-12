
# CSS Variable → SCSS Map Generator (MRDS Target)

**Author:** W.Penris, 1/9/25

---

This script automates the generation of SCSS theme variable maps (and logs/snapshots) from a folder of JSON theme files. It is robust, maintainable, and supports CLI config overrides for flexible automation.

## Features

- Reads and merges all JSON theme files from a configurable input directory
- Normalizes and validates theme variables (defensive, error-checked)
- Generates a SCSS file with all theme variables as a map, with timestamps and usage instructions
- Supports `$enableFallback` preservation and metadata extraction
- Logs detailed diffs (added/removed/changed variables) on each run
- Backs up previous snapshot before overwriting
- All file operations use robust utility functions (`fsx`)
- All config options (paths, fallback, etc.) are centralized and overridable
- Supports CLI config overrides for automation and CI/CD
- Comprehensive test suite (see `src/lib/themes.test.ts`)

## Usage

### Standard Run

Run the generator script using npm:

```sh
npm run gen-scss
```

Or directly with ts-node:

```sh
npx ts-node src/features/gen-scss-from-json.ts
```

### Override Config at Runtime (CLI)

You can override any config value at runtime using the `--override` flag (repeatable):

```sh
npx ts-node src/features/gen-scss-from-json.ts --override paths.inputDirJson=some/other/dir --override paths.OUTFILE_SCSS=custom.scss --override enableFallbackDefault=true
```

Supports nested keys (dot notation) and parses JSON values if possible.

## Output

- **SCSS file:** `themesource/MRDS/web/rds-scss/rds-theme-variables.scss` (or as configured)
- **Log file:** `logs/` (timestamped, details every run)
- **Snapshot file:** (for diffing, backup before overwrite)

## Architecture

- **Entry point:** `src/features/gen-scss-from-json.ts`
- **Config:** `src/config.ts` (all paths and options)
- **Theme logic:** `src/lib/themes.ts` (robust, defensive, pure helpers)
- **Tests:** `src/lib/themes.test.ts` (comprehensive, data-driven)
- **Test data:** `src/lib/themes.test.data.ts` (realistic, shared)
- **File helpers:** `src/utils/fsx.ts`
- **Logger:** `src/utils/logger.ts`

## Development & Testing

- All utilities are robust, normalized, and well-tested
- Run tests with:

```sh
npm test
```

- All test data is centralized in `src/lib/themes.test.data.ts`
- Only ES imports are used in tests

## Example Regression Test Scenarios

1. Change 3 variables and run script → should be visible in log and SCSS file as changed.
2. Remove 3 variables from various files and run script → should be visible in log and SCSS file as removed.
3. Add 3 variables and run script → should be visible in log and SCSS file as added.
4. Add 1 theme (e.g. "high-definition") with variables and run script → added theme should be visible in log and SCSS file.

---

## Notes

- All file operations are error-safe and use utility functions
- Configurable paths and options are centralized in `src/config.ts`
- Detailed logs and console feedback are provided for each run
- CLI config overrides make this script suitable for automation and CI/CD
